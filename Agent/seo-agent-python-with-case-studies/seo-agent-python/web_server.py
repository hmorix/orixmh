#!/usr/bin/env python3
"""Local web UI for the whole pipeline.

Usage:
  python3 web_server.py           # serves on http://localhost:8787
  python3 web_server.py 9000      # custom port

Everything here is a thin HTTP wrapper around the same functions the CLI
(index.py) already uses — no separate logic path, so anything that works on
the command line works here too.
"""
import json
import os
import re
import sys
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib.env import load_env  # noqa: E402
load_env()

from lib import job_queue, nvidia  # noqa: E402
from lib.google_search import is_configured as google_cse_configured  # noqa: E402
from lib.image_links import image_search_links, image_link_suggestions_for_post  # noqa: E402
from workflows.daily_blog import run_daily_blog  # noqa: E402
from workflows.topic_suggestions import run_topic_suggestions, OUTPUT_PATH as SUGGESTIONS_PATH  # noqa: E402
from workflows.keyword_rankings import run_keyword_rankings, OUTPUT_PATH as RANKINGS_PATH  # noqa: E402
from workflows.daily_scheduler import run_daily_batch, load_latest_pool  # noqa: E402
from workflows.publish import publish_post  # noqa: E402
import scripts.render_page as render_page_mod  # noqa: E402
import scripts.json_to_tsx as json_to_tsx_mod  # noqa: E402
import scripts.upload_draft as upload_draft_mod  # noqa: E402
from lib.uploaded_posts import fetch_uploaded_posts, get_uploaded_post  # noqa: E402
from workflows.case_study_pipeline import run_case_study  # noqa: E402
from workflows.case_study_publish import publish_case_study  # noqa: E402
import scripts.case_study_render as case_study_render_mod  # noqa: E402
import scripts.case_study_to_tsx as case_study_to_tsx_mod  # noqa: E402
from workflows.whitepaper_pipeline import run_whitepaper  # noqa: E402
from workflows.whitepaper_publish import publish_whitepaper  # noqa: E402
import scripts.whitepaper_render as whitepaper_render_mod  # noqa: E402
import scripts.whitepaper_pdf as whitepaper_pdf_mod  # noqa: E402
import scripts.whitepaper_to_tsx as whitepaper_to_tsx_mod  # noqa: E402
from workflows.press_pipeline import run_press_release  # noqa: E402
from workflows.press_publish import publish_press_release  # noqa: E402
import scripts.press_render as press_render_mod  # noqa: E402
import scripts.press_pdf as press_pdf_mod  # noqa: E402
import scripts.press_to_tsx as press_to_tsx_mod  # noqa: E402
from lib.supabase import select_rows, delete_row, SupabaseError  # noqa: E402
from workflows.image_pipeline import generate_social_image_pack, OUTPUT_DIR as IMAGEGEN_DIR  # noqa: E402
from lib.util import iso_now  # noqa: E402
from agent.case_study_assist import suggest_questions, polish_text  # noqa: E402
from agent.whitepaper_assist import suggest_questions as wp_suggest_questions  # noqa: E402
from agent.press_assist import suggest_questions as press_suggest_questions  # noqa: E402

KNOWLEDGE_FILES = {"company", "products", "services", "audience", "brand-voice", "faq"}
KNOWLEDGE_DIR = os.path.join(os.getcwd(), "knowledge")

WEB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web")
PENDING_DIR = os.path.join(os.getcwd(), "drafts", "pending")
PENDING_CS_DIR = os.path.join(os.getcwd(), "drafts", "pending-case-studies")
PENDING_WP_DIR = os.path.join(os.getcwd(), "drafts", "pending-whitepapers")
PENDING_PR_DIR = os.path.join(os.getcwd(), "drafts", "pending-press")
PAGES_DIR = render_page_mod.OUTPUT_DIR
CS_PAGES_DIR = case_study_render_mod.OUTPUT_DIR
WP_PAGES_DIR = whitepaper_render_mod.OUTPUT_DIR
WP_PDF_DIR = whitepaper_pdf_mod.OUTPUT_DIR
PR_PAGES_DIR = press_render_mod.OUTPUT_DIR
PR_PDF_DIR = press_pdf_mod.OUTPUT_DIR

# Central registry so edit/save/delete/retry work generically across every
# content type instead of needing 4x near-duplicate route handlers.
CONTENT_REGISTRY = {
    "blog": {
        "pending_dir": PENDING_DIR,
        "table_drafts": "blog_drafts",
        "table_published": "blog_posts",
        "title_field": "title",
        "generate_tsx": json_to_tsx_mod.generate_page,
        "render_html": render_page_mod.render_page,
        "generate_pdf": None,
        "pdf_dir": None,
        "publish_fn": publish_post,
        "view_url": lambda slug: f"/page/{slug}",
    },
    "case-study": {
        "pending_dir": PENDING_CS_DIR,
        "table_drafts": "case_study_drafts",
        "table_published": "case_studies",
        "title_field": "title",
        "generate_tsx": case_study_to_tsx_mod.generate_case_study_page,
        "render_html": case_study_render_mod.render_case_study_html,
        "generate_pdf": None,
        "pdf_dir": None,
        "publish_fn": publish_case_study,
        "view_url": lambda slug: f"/case-study/{slug}",
    },
    "whitepaper": {
        "pending_dir": PENDING_WP_DIR,
        "table_drafts": "whitepaper_drafts",
        "table_published": "whitepapers",
        "title_field": "title",
        "generate_tsx": whitepaper_to_tsx_mod.generate_whitepaper_page,
        "render_html": whitepaper_render_mod.render_whitepaper_html,
        "generate_pdf": whitepaper_pdf_mod.render_whitepaper_pdf,
        "pdf_dir": WP_PDF_DIR,
        "publish_fn": publish_whitepaper,
        "view_url": lambda slug: f"/whitepaper/{slug}",
    },
    "press": {
        "pending_dir": PENDING_PR_DIR,
        "table_drafts": "press_drafts",
        "table_published": "press_releases",
        "title_field": "headline",
        "generate_tsx": press_to_tsx_mod.generate_press_page,
        "render_html": press_render_mod.render_press_html,
        "generate_pdf": press_pdf_mod.render_press_pdf,
        "pdf_dir": PR_PDF_DIR,
        "publish_fn": publish_press_release,
        "view_url": lambda slug: f"/press/{slug}",
    },
}


def _safe_filename(name):
    """Rejects path traversal in a filename that came from a URL — no
    slashes, no '..', nothing that could escape the pending directory."""
    if not name or "/" in name or "\\" in name or ".." in name:
        raise ValueError("invalid filename")
    return name


def _regenerate_content_files(cfg, record):
    """Runs generate_tsx / render_html / generate_pdf for one record,
    independently of each other (one failing doesn't block the others) —
    same resilience pattern as the publish workflows. Returns a list of
    {step, ok, error} so the caller can show exactly what worked."""
    results = []

    try:
        cfg["generate_tsx"](record)
        results.append({"step": "tsx", "ok": True})
    except Exception as err:  # noqa: BLE001
        results.append({"step": "tsx", "ok": False, "error": str(err)})

    try:
        cfg["render_html"](record)
        results.append({"step": "html", "ok": True})
    except Exception as err:  # noqa: BLE001
        results.append({"step": "html", "ok": False, "error": str(err)})

    if cfg.get("generate_pdf"):
        try:
            cfg["generate_pdf"](record)
            results.append({"step": "pdf", "ok": True})
        except Exception as err:  # noqa: BLE001
            results.append({"step": "pdf", "ok": False, "error": str(err)})

    return results


# ---------- helpers ----------

def _json_default(o):
    return str(o)


def _read_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _word_count(record):
    return sum(len((b.get("text") or "").split()) for b in (record.get("content") or []))


def _list_pending():
    if not os.path.isdir(PENDING_DIR):
        return []
    out = []
    for fname in sorted(os.listdir(PENDING_DIR), reverse=True):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(PENDING_DIR, fname)
        try:
            record = _read_json(path)
        except (json.JSONDecodeError, OSError):
            continue
        ts_match = re.match(r"^(\d+)-", fname)
        out.append({
            "file": fname,
            "title": record.get("title"),
            "slug": record.get("slug"),
            "category": record.get("category"),
            "content_type": record.get("content_type"),
            "read_time": record.get("read_time"),
            "word_count": _word_count(record),
            "seo_score": record.get("seo_score"),
            "created_at_ms": int(ts_match.group(1)) if ts_match else None,
        })
    return out


def _load_suggestions():
    if not os.path.exists(SUGGESTIONS_PATH):
        return None
    try:
        return _read_json(SUGGESTIONS_PATH)
    except (json.JSONDecodeError, OSError):
        return None


def _load_rankings():
    if not os.path.exists(RANKINGS_PATH):
        return []
    try:
        return _read_json(RANKINGS_PATH)
    except (json.JSONDecodeError, OSError):
        return []


def _list_pending_case_studies():
    if not os.path.isdir(PENDING_CS_DIR):
        return []
    out = []
    for fname in sorted(os.listdir(PENDING_CS_DIR), reverse=True):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(PENDING_CS_DIR, fname)
        try:
            record = _read_json(path)
        except (json.JSONDecodeError, OSError):
            continue
        ts_match = re.match(r"^(\d+)-", fname)
        out.append({
            "file": fname,
            "title": record.get("title"),
            "slug": record.get("slug"),
            "client_name": record.get("client_name"),
            "is_demo": record.get("is_demo"),
            "word_count": record.get("word_count"),
            "seo_score": record.get("seo_score"),
            "created_at_ms": int(ts_match.group(1)) if ts_match else None,
        })
    return out


def _all_case_studies_combined():
    """Merges pending drafts + published rows into one list for the UI,
    newest first, plus the single most-recent timestamp across both."""
    pending = _list_pending_case_studies()
    items = []
    latest_ms = None

    for p in pending:
        items.append({
            "state": "draft",
            "slug": p.get("slug"),
            "title": p.get("title"),
            "client_name": p.get("client_name"),
            "is_demo": p.get("is_demo"),
            "word_count": p.get("word_count"),
            "timestamp_ms": p.get("created_at_ms"),
            "file": p.get("file"),
            "view_url": None,
            "download_url": None,
        })
        if p.get("created_at_ms") and (latest_ms is None or p["created_at_ms"] > latest_ms):
            latest_ms = p["created_at_ms"]

    published = []
    try:
        published = select_rows("case_studies", order="published_at.desc")
    except SupabaseError:
        # Fall back to whatever's been rendered to disk if Supabase is down.
        if os.path.isdir(CS_PAGES_DIR):
            for fname in os.listdir(CS_PAGES_DIR):
                if fname.endswith(".tsx") and fname != "registry.ts":
                    slug = fname[:-4]
                    published.append({"slug": slug, "title": slug, "is_demo": None, "published_at": None, "updated_at": None})

    for row in published:
        ts_str = row.get("updated_at") or row.get("published_at")
        ts_ms = None
        if ts_str:
            try:
                from datetime import datetime
                ts_ms = int(datetime.fromisoformat(ts_str.replace("Z", "+00:00")).timestamp() * 1000)
            except ValueError:
                ts_ms = None
        items.append({
            "state": "published",
            "slug": row.get("slug"),
            "title": row.get("title"),
            "client_name": row.get("client_name"),
            "is_demo": row.get("is_demo"),
            "word_count": row.get("word_count"),
            "timestamp_ms": ts_ms,
            "file": None,
            "view_url": f"/case-study/{row.get('slug')}",
            "download_url": f"/case-study/{row.get('slug')}/download",
        })
        if ts_ms and (latest_ms is None or ts_ms > latest_ms):
            latest_ms = ts_ms

    items.sort(key=lambda i: i.get("timestamp_ms") or 0, reverse=True)
    return {"items": items, "last_updated_ms": latest_ms}


VALID_CONTENT_TYPES = {"blog", "tutorial", "comparison", "landing-page"}


def _list_pending_whitepapers():
    if not os.path.isdir(PENDING_WP_DIR):
        return []
    out = []
    for fname in sorted(os.listdir(PENDING_WP_DIR), reverse=True):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(PENDING_WP_DIR, fname)
        try:
            record = _read_json(path)
        except (json.JSONDecodeError, OSError):
            continue
        ts_match = re.match(r"^(\d+)-", fname)
        out.append({
            "file": fname,
            "title": record.get("title"),
            "slug": record.get("slug"),
            "topic": record.get("topic"),
            "is_research": record.get("is_research"),
            "word_count": record.get("word_count"),
            "pdf_generated": record.get("pdf_generated"),
            "created_at_ms": int(ts_match.group(1)) if ts_match else None,
        })
    return out


def _all_whitepapers_combined():
    pending = _list_pending_whitepapers()
    items = []
    latest_ms = None

    for p in pending:
        items.append({
            "state": "draft",
            "slug": p.get("slug"),
            "title": p.get("title"),
            "topic": p.get("topic"),
            "is_research": p.get("is_research"),
            "word_count": p.get("word_count"),
            "pdf_generated": p.get("pdf_generated"),
            "timestamp_ms": p.get("created_at_ms"),
            "file": p.get("file"),
            "view_url": None,
            "pdf_url": None,
        })
        if p.get("created_at_ms") and (latest_ms is None or p["created_at_ms"] > latest_ms):
            latest_ms = p["created_at_ms"]

    published = []
    try:
        published = select_rows("whitepapers", order="published_at.desc")
    except SupabaseError:
        if os.path.isdir(WP_PAGES_DIR):
            for fname in os.listdir(WP_PAGES_DIR):
                if fname.endswith(".tsx") and fname != "registry.ts":
                    slug = fname[:-4]
                    published.append({"slug": slug, "title": slug, "published_at": None, "updated_at": None})

    for row in published:
        ts_str = row.get("updated_at") or row.get("published_at")
        ts_ms = None
        if ts_str:
            try:
                from datetime import datetime
                ts_ms = int(datetime.fromisoformat(ts_str.replace("Z", "+00:00")).timestamp() * 1000)
            except ValueError:
                ts_ms = None
        slug = row.get("slug")
        pdf_exists = os.path.exists(os.path.join(WP_PDF_DIR, f"{slug}.pdf"))
        items.append({
            "state": "published",
            "slug": slug,
            "title": row.get("title"),
            "topic": row.get("topic"),
            "is_research": row.get("is_research"),
            "word_count": row.get("word_count"),
            "pdf_generated": pdf_exists,
            "timestamp_ms": ts_ms,
            "file": None,
            "view_url": f"/whitepaper/{slug}",
            "pdf_url": f"/whitepaper/{slug}/pdf" if pdf_exists else None,
        })
        if ts_ms and (latest_ms is None or ts_ms > latest_ms):
            latest_ms = ts_ms

    items.sort(key=lambda i: i.get("timestamp_ms") or 0, reverse=True)
    return {"items": items, "last_updated_ms": latest_ms}


def _list_pending_press():
    if not os.path.isdir(PENDING_PR_DIR):
        return []
    out = []
    for fname in sorted(os.listdir(PENDING_PR_DIR), reverse=True):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(PENDING_PR_DIR, fname)
        try:
            record = _read_json(path)
        except (json.JSONDecodeError, OSError):
            continue
        ts_match = re.match(r"^(\d+)-", fname)
        out.append({
            "file": fname,
            "headline": record.get("headline"),
            "slug": record.get("slug"),
            "category": record.get("category"),
            "is_commentary": record.get("is_commentary"),
            "word_count": record.get("word_count"),
            "pdf_generated": record.get("pdf_generated"),
            "created_at_ms": int(ts_match.group(1)) if ts_match else None,
        })
    return out


def _all_press_combined():
    pending = _list_pending_press()
    items = []
    latest_ms = None

    for p in pending:
        items.append({
            "state": "draft",
            "slug": p.get("slug"),
            "title": p.get("headline"),
            "topic": p.get("category"),
            "is_research": p.get("is_commentary"),
            "word_count": p.get("word_count"),
            "pdf_generated": p.get("pdf_generated"),
            "timestamp_ms": p.get("created_at_ms"),
            "file": p.get("file"),
            "view_url": None,
            "pdf_url": None,
        })
        if p.get("created_at_ms") and (latest_ms is None or p["created_at_ms"] > latest_ms):
            latest_ms = p["created_at_ms"]

    published = []
    try:
        published = select_rows("press_releases", order="published_at.desc")
    except SupabaseError:
        if os.path.isdir(PR_PAGES_DIR):
            for fname in os.listdir(PR_PAGES_DIR):
                if fname.endswith(".tsx") and fname != "registry.ts":
                    slug = fname[:-4]
                    published.append({"slug": slug, "headline": slug, "published_at": None, "updated_at": None})

    for row in published:
        ts_str = row.get("updated_at") or row.get("published_at")
        ts_ms = None
        if ts_str:
            try:
                from datetime import datetime
                ts_ms = int(datetime.fromisoformat(ts_str.replace("Z", "+00:00")).timestamp() * 1000)
            except ValueError:
                ts_ms = None
        slug = row.get("slug")
        pdf_exists = os.path.exists(os.path.join(PR_PDF_DIR, f"{slug}.pdf"))
        items.append({
            "state": "published",
            "slug": slug,
            "title": row.get("headline"),
            "topic": row.get("category"),
            "is_research": row.get("is_commentary"),
            "word_count": row.get("word_count"),
            "pdf_generated": pdf_exists,
            "timestamp_ms": ts_ms,
            "file": None,
            "view_url": f"/press/{slug}",
            "pdf_url": f"/press/{slug}/pdf" if pdf_exists else None,
        })
        if ts_ms and (latest_ms is None or ts_ms > latest_ms):
            latest_ms = ts_ms

    items.sort(key=lambda i: i.get("timestamp_ms") or 0, reverse=True)
    return {"items": items, "last_updated_ms": latest_ms}



    if not os.path.isdir(PENDING_CS_DIR):
        return []
    out = []
    for fname in sorted(os.listdir(PENDING_CS_DIR), reverse=True):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(PENDING_CS_DIR, fname)
        try:
            record = _read_json(path)
        except (json.JSONDecodeError, OSError):
            continue
        ts_match = re.match(r"^(\d+)-", fname)
        out.append({
            "file": fname,
            "title": record.get("title"),
            "slug": record.get("slug"),
            "client_name": record.get("client_name"),
            "is_demo": record.get("is_demo"),
            "word_count": record.get("word_count"),
            "seo_score": record.get("seo_score"),
            "created_at_ms": int(ts_match.group(1)) if ts_match else None,
        })
    return out


def _dashboard_stats():
    """Aggregates counts for the /dashboard page. Falls back to local files
    (pending drafts, generated pages on disk) for anything Supabase can't
    answer — e.g. no .env configured yet, or the migration hasn't run."""
    pending_blog = _list_pending()
    pending_cs = _list_pending_case_studies()
    pending_wp = _list_pending_whitepapers()
    pending_pr = _list_pending_press()

    published_blog_count = None
    published_cs_count = None
    cs_demo_count = None
    cs_real_count = None
    published_wp_count = None
    wp_pdf_count = None
    published_pr_count = None
    pr_pdf_count = None
    supabase_reachable = True
    supabase_error = None

    try:
        published_blog_count = len(select_rows("blog_posts", select="id"))
    except SupabaseError as err:
        supabase_reachable = False
        supabase_error = str(err)

    try:
        cs_rows = select_rows("case_studies", select="id,is_demo")
        published_cs_count = len(cs_rows)
        cs_demo_count = sum(1 for r in cs_rows if r.get("is_demo"))
        cs_real_count = published_cs_count - cs_demo_count
    except SupabaseError as err:
        supabase_reachable = supabase_reachable and False
        supabase_error = supabase_error or str(err)
        if os.path.isdir(CS_PAGES_DIR):
            published_cs_count = len([f for f in os.listdir(CS_PAGES_DIR) if f.endswith(".tsx")])

    try:
        wp_rows = select_rows("whitepapers", select="id,pdf_generated")
        published_wp_count = len(wp_rows)
        wp_pdf_count = sum(1 for r in wp_rows if r.get("pdf_generated"))
    except SupabaseError as err:
        supabase_reachable = supabase_reachable and False
        supabase_error = supabase_error or str(err)
        if os.path.isdir(WP_PAGES_DIR):
            published_wp_count = len([f for f in os.listdir(WP_PAGES_DIR) if f.endswith(".tsx")])

    try:
        pr_rows = select_rows("press_releases", select="id,pdf_generated")
        published_pr_count = len(pr_rows)
        pr_pdf_count = sum(1 for r in pr_rows if r.get("pdf_generated"))
    except SupabaseError as err:
        supabase_reachable = supabase_reachable and False
        supabase_error = supabase_error or str(err)
        if os.path.isdir(PR_PAGES_DIR):
            published_pr_count = len([f for f in os.listdir(PR_PAGES_DIR) if f.endswith(".tsx")])

    active_jobs = [j for j in job_queue.list_jobs() if j.get("status") == "running"]
    queued_jobs = [j for j in job_queue.list_jobs() if j.get("status") == "queued"]
    recent_jobs = sorted(job_queue.list_jobs(), key=lambda j: j.get("started_at") or 0, reverse=True)[:5]

    if active_jobs:
        pipeline_status = "running"
    elif queued_jobs:
        pipeline_status = "queued"
    else:
        pipeline_status = "idle"

    last_run_ms = None
    for j in recent_jobs:
        if j.get("started_at"):
            candidate = int(j["started_at"] * 1000)
            if last_run_ms is None or candidate > last_run_ms:
                last_run_ms = candidate

    return {
        "generated_at": iso_now(),
        "supabase_configured": bool(os.environ.get("SUPABASE_URL") and os.environ.get("SUPABASE_SERVICE_KEY")),
        "supabase_reachable": supabase_reachable,
        "supabase_error": supabase_error,
        "blog": {
            "published": published_blog_count,
            "drafts_pending": len(pending_blog),
        },
        "case_studies": {
            "total": (published_cs_count or 0) + len(pending_cs),
            "published": published_cs_count,
            "drafts_pending": len(pending_cs),
            "demo": cs_demo_count,
            "real": cs_real_count,
        },
        "whitepapers": {
            "total": (published_wp_count or 0) + len(pending_wp),
            "published": published_wp_count,
            "drafts_pending": len(pending_wp),
            "with_pdf": wp_pdf_count,
        },
        "press": {
            "total": (published_pr_count or 0) + len(pending_pr),
            "published": published_pr_count,
            "drafts_pending": len(pending_pr),
            "with_pdf": pr_pdf_count,
        },
        "pipeline": {
            "status": pipeline_status,
            "active_jobs": len(active_jobs),
            "queued_jobs": len(queued_jobs),
            "last_run_at_ms": last_run_ms,
            "recent_jobs": [
                {
                    "id": j.get("id"),
                    "kind": j.get("type"),
                    "status": j.get("status"),
                    "started_at_ms": int(j["started_at"] * 1000) if j.get("started_at") else None,
                    "meta": j.get("meta"),
                }
                for j in recent_jobs
            ],
        },
    }


# ---------- HTTP handler ----------

class Handler(BaseHTTPRequestHandler):
    server_version = "SEOAgentWebUI/1.0"

    def log_message(self, fmt, *args):  # quieter default logging
        pass

    def _send_json(self, payload, status=200):
        body = json.dumps(payload, default=_json_default).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_file(self, path, content_type, download_name=None):
        if not os.path.exists(path):
            self._send_json({"error": "not found"}, 404)
            return
        with open(path, "rb") as f:
            body = f.read()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        if download_name:
            self.send_header("Content-Disposition", f'attachment; filename="{download_name}"')
        self.end_headers()
        self.wfile.write(body)

    def _body_json(self):
        length = int(self.headers.get("Content-Length", 0))
        if not length:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {}

    # ---- routing ----

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        try:
            if path == "/" or path == "/index.html":
                self._send_file(os.path.join(WEB_DIR, "index.html"), "text/html")
            elif path == "/app.js":
                self._send_file(os.path.join(WEB_DIR, "app.js"), "application/javascript")
            elif path == "/style.css":
                self._send_file(os.path.join(WEB_DIR, "style.css"), "text/css")

            elif path == "/api/config":
                self._send_json({
                    "pool_size": job_queue.pool_size(),
                    "google_cse_configured": google_cse_configured(),
                    "site_url": os.environ.get("SITE_URL", ""),
                })

            elif path == "/api/pending":
                self._send_json(_list_pending())

            elif path.startswith("/api/pending/") and path.endswith("/links"):
                fname = urllib.parse.unquote(path[len("/api/pending/"):-len("/links")])
                record = _read_json(os.path.join(PENDING_DIR, fname))
                self._send_json({
                    "internal_links": record.get("internal_links") or [],
                    "external_links": record.get("external_links") or [],
                })

            elif path.startswith("/api/pending/") and path.endswith("/images"):
                fname = urllib.parse.unquote(path[len("/api/pending/"):-len("/images")])
                record = _read_json(os.path.join(PENDING_DIR, fname))
                self._send_json(image_link_suggestions_for_post(record))

            elif path.startswith("/api/pending/"):
                fname = urllib.parse.unquote(path[len("/api/pending/"):])
                self._send_json(_read_json(os.path.join(PENDING_DIR, fname)))

            elif path == "/api/uploaded":
                limit = int((query.get("limit") or ["100"])[0])
                posts, meta = fetch_uploaded_posts(limit=limit)
                self._send_json({"posts": posts, **meta})

            elif path.startswith("/api/uploaded/") and path.endswith("/images"):
                slug = urllib.parse.unquote(path[len("/api/uploaded/"):-len("/images")])
                post, error = get_uploaded_post(slug)
                if post is None:
                    self._send_json({"error": error or "not found"}, 404)
                else:
                    self._send_json(image_link_suggestions_for_post(post))

            elif path.startswith("/api/uploaded/"):
                slug = urllib.parse.unquote(path[len("/api/uploaded/"):])
                post, error = get_uploaded_post(slug)
                if post is None:
                    self._send_json({"error": error or "not found"}, 404)
                else:
                    self._send_json({"post": post, "stale": bool(error), "error": error})

            elif path == "/api/daily-plan":
                self._send_json(load_latest_pool() or {})

            elif path == "/api/pages":
                self._send_json(render_page_mod.list_pages())

            elif path.startswith("/page/") and path.endswith("/download"):
                slug = urllib.parse.unquote(path[len("/page/"):-len("/download")])
                self._send_file(os.path.join(PAGES_DIR, f"{slug}.html"), "text/html", download_name=f"{slug}.html")

            elif path.startswith("/page/"):
                slug = urllib.parse.unquote(path[len("/page/"):])
                self._send_file(os.path.join(PAGES_DIR, f"{slug}.html"), "text/html")

            elif path == "/api/suggestions":
                self._send_json(_load_suggestions() or {"suggestions": []})

            elif path == "/api/rankings":
                self._send_json(_load_rankings())

            elif path == "/api/jobs":
                jobs = job_queue.list_jobs()
                for j in jobs:
                    j["log"] = j["log"][-15:]  # trim for the list view
                self._send_json(jobs)

            elif path.startswith("/api/jobs/"):
                job_id = path[len("/api/jobs/"):]
                job = job_queue.get_job(job_id)
                if job is None:
                    self._send_json({"error": "not found"}, 404)
                else:
                    self._send_json(job)

            elif path == "/case-studies" or path == "/case-studies.html":
                self._send_file(os.path.join(WEB_DIR, "case-studies.html"), "text/html")
            elif path == "/case-studies.js":
                self._send_file(os.path.join(WEB_DIR, "case-studies.js"), "application/javascript")

            elif path == "/api/case-studies/all":
                self._send_json(_all_case_studies_combined())

            elif path == "/whitepapers" or path == "/whitepapers.html":
                self._send_file(os.path.join(WEB_DIR, "whitepapers.html"), "text/html")
            elif path == "/whitepapers.js":
                self._send_file(os.path.join(WEB_DIR, "whitepapers.js"), "application/javascript")

            elif path == "/api/whitepapers/all":
                self._send_json(_all_whitepapers_combined())

            elif path == "/api/whitepapers/pending":
                self._send_json(_list_pending_whitepapers())

            elif path.startswith("/api/whitepapers/pending/"):
                fname = urllib.parse.unquote(path[len("/api/whitepapers/pending/"):])
                self._send_json(_read_json(os.path.join(PENDING_WP_DIR, fname)))

            elif path == "/api/whitepapers/published":
                try:
                    self._send_json(select_rows("whitepapers", order="published_at.desc"))
                except SupabaseError as err:
                    self._send_json({"error": str(err)}, 200)

            elif path.startswith("/whitepaper/") and path.endswith("/pdf"):
                slug = urllib.parse.unquote(path[len("/whitepaper/"):-len("/pdf")])
                pdf_path = os.path.join(WP_PDF_DIR, f"{slug}.pdf")
                if os.path.exists(pdf_path):
                    self._send_file(pdf_path, "application/pdf", download_name=f"{slug}.pdf")
                else:
                    self._send_json({"error": "PDF not found — it may not have generated (reportlab missing?) "
                                               "or the whitepaper hasn't been published yet."}, 404)

            elif path.startswith("/whitepaper/"):
                slug = urllib.parse.unquote(path[len("/whitepaper/"):])
                self._send_file(os.path.join(WP_PAGES_DIR, f"{slug}.html"), "text/html")

            elif path == "/press" or path == "/press.html":
                self._send_file(os.path.join(WEB_DIR, "press.html"), "text/html")
            elif path == "/press.js":
                self._send_file(os.path.join(WEB_DIR, "press.js"), "application/javascript")

            elif path == "/edit" or path == "/edit.html":
                self._send_file(os.path.join(WEB_DIR, "edit.html"), "text/html")
            elif path == "/edit.js":
                self._send_file(os.path.join(WEB_DIR, "edit.js"), "application/javascript")

            elif path == "/images" or path == "/images.html":
                self._send_file(os.path.join(WEB_DIR, "images.html"), "text/html")
            elif path == "/images.js":
                self._send_file(os.path.join(WEB_DIR, "images.js"), "application/javascript")

            elif path == "/api/imagegen/sources":
                sources = []
                try:
                    for item in _all_case_studies_combined()["items"]:
                        if item["state"] == "published":
                            sources.append({"type": "case-study", "slug": item["slug"], "title": item["title"]})
                except Exception:  # noqa: BLE001
                    pass
                try:
                    for item in _all_whitepapers_combined()["items"]:
                        if item["state"] == "published":
                            sources.append({"type": "whitepaper", "slug": item["slug"], "title": item["title"]})
                except Exception:  # noqa: BLE001
                    pass
                try:
                    for item in _all_press_combined()["items"]:
                        if item["state"] == "published":
                            sources.append({"type": "press", "slug": item["slug"], "title": item["title"]})
                except Exception:  # noqa: BLE001
                    pass
                try:
                    for post in fetch_uploaded_posts():
                        sources.append({"type": "blog", "slug": post.get("slug"), "title": post.get("title")})
                except Exception:  # noqa: BLE001
                    pass
                self._send_json(sources)

            elif path == "/api/imagegen/sets":
                sets = []
                if os.path.isdir(IMAGEGEN_DIR):
                    for folder in sorted(os.listdir(IMAGEGEN_DIR), reverse=True):
                        manifest_path = os.path.join(IMAGEGEN_DIR, folder, "manifest.json")
                        if os.path.exists(manifest_path):
                            try:
                                sets.append(_read_json(manifest_path))
                            except (json.JSONDecodeError, OSError):
                                continue
                self._send_json(sets)

            elif path.startswith("/generated-image/"):
                rest = urllib.parse.unquote(path[len("/generated-image/"):])
                parts = rest.split("/", 1)
                if len(parts) != 2 or ".." in rest or rest.startswith("/"):
                    self._send_json({"error": "invalid path"}, 400)
                else:
                    folder, filename = parts
                    self._send_file(os.path.join(IMAGEGEN_DIR, folder, filename), "image/jpeg")


            elif path == "/api/press/all":
                self._send_json(_all_press_combined())

            elif path == "/api/press/pending":
                self._send_json(_list_pending_press())

            elif path.startswith("/api/press/pending/"):
                fname = urllib.parse.unquote(path[len("/api/press/pending/"):])
                self._send_json(_read_json(os.path.join(PENDING_PR_DIR, fname)))

            elif path == "/api/press/published":
                try:
                    self._send_json(select_rows("press_releases", order="published_at.desc"))
                except SupabaseError as err:
                    self._send_json({"error": str(err)}, 200)

            elif path.startswith("/press/") and path.endswith("/pdf"):
                slug = urllib.parse.unquote(path[len("/press/"):-len("/pdf")])
                pdf_path = os.path.join(PR_PDF_DIR, f"{slug}.pdf")
                if os.path.exists(pdf_path):
                    self._send_file(pdf_path, "application/pdf", download_name=f"{slug}.pdf")
                else:
                    self._send_json({"error": "PDF not found — it may not have generated (reportlab missing?) "
                                               "or the press release hasn't been published yet."}, 404)

            elif path.startswith("/press/"):
                slug = urllib.parse.unquote(path[len("/press/"):])
                self._send_file(os.path.join(PR_PAGES_DIR, f"{slug}.html"), "text/html")

            elif path.startswith("/api/knowledge/"):
                name = path[len("/api/knowledge/"):]
                if name not in KNOWLEDGE_FILES:
                    self._send_json({"error": f"unknown knowledge file: {name}"}, 404)
                else:
                    file_path = os.path.join(KNOWLEDGE_DIR, f"{name}.md")
                    content = ""
                    if os.path.exists(file_path):
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read()
                    self._send_json({"name": name, "content": content})

            elif path == "/dashboard" or path == "/dashboard.html":
                self._send_file(os.path.join(WEB_DIR, "dashboard.html"), "text/html")
            elif path == "/dashboard.js":
                self._send_file(os.path.join(WEB_DIR, "dashboard.js"), "application/javascript")

            elif path == "/api/dashboard/stats":
                self._send_json(_dashboard_stats())

            elif path == "/api/case-studies/pending":
                self._send_json(_list_pending_case_studies())

            elif path.startswith("/api/case-studies/pending/"):
                fname = urllib.parse.unquote(path[len("/api/case-studies/pending/"):])
                self._send_json(_read_json(os.path.join(PENDING_CS_DIR, fname)))

            elif path == "/api/case-studies/published":
                try:
                    self._send_json(select_rows("case_studies", order="published_at.desc"))
                except SupabaseError as err:
                    self._send_json({"error": str(err)}, 200)

            elif path.startswith("/case-study/") and path.endswith("/download"):
                slug = urllib.parse.unquote(path[len("/case-study/"):-len("/download")])
                self._send_file(os.path.join(CS_PAGES_DIR, f"{slug}.html"), "text/html", download_name=f"{slug}.html")

            elif path.startswith("/case-study/"):
                slug = urllib.parse.unquote(path[len("/case-study/"):])
                self._send_file(os.path.join(CS_PAGES_DIR, f"{slug}.html"), "text/html")

            elif path.startswith("/api/content/") and "/draft/" in path:
                ctype, _, fname = path[len("/api/content/"):].split("/", 2)
                cfg = CONTENT_REGISTRY.get(ctype)
                if not cfg:
                    self._send_json({"error": f"unknown content type '{ctype}'"}, 404)
                else:
                    fname = _safe_filename(urllib.parse.unquote(fname))
                    self._send_json(_read_json(os.path.join(cfg["pending_dir"], fname)))

            elif path.startswith("/api/content/") and "/published/" in path:
                ctype, _, slug = path[len("/api/content/"):].split("/", 2)
                cfg = CONTENT_REGISTRY.get(ctype)
                if not cfg:
                    self._send_json({"error": f"unknown content type '{ctype}'"}, 404)
                else:
                    slug = urllib.parse.unquote(slug)
                    try:
                        rows = select_rows(cfg["table_published"], filters={"slug": f"eq.{slug}"}, limit=1)
                    except SupabaseError as err:
                        self._send_json({"error": str(err)}, 502)
                    else:
                        if not rows:
                            self._send_json({"error": "not found"}, 404)
                        else:
                            self._send_json(rows[0])

            elif path == "/api/images":
                q = (query.get("q") or [""])[0]
                if not q:
                    self._send_json({"error": "missing ?q="}, 400)
                else:
                    self._send_json(image_search_links(q))

            else:
                self._send_json({"error": "not found"}, 404)
        except FileNotFoundError:
            self._send_json({"error": "not found"}, 404)
        except Exception as exc:  # noqa: BLE001
            self._send_json({"error": str(exc)}, 500)

    def do_POST(self):
        path = self.path
        body = self._body_json()

        try:
            if path.startswith("/api/pending/") and path.endswith("/convert"):
                fname = urllib.parse.unquote(path[len("/api/pending/"):-len("/convert")])
                record = _read_json(os.path.join(PENDING_DIR, fname))
                render_page_mod.render_page(record)
                slug = record.get("slug", "draft")
                self._send_json({"ok": True, "slug": slug, "url": f"/page/{slug}", "download_url": f"/page/{slug}/download"})

            elif path.startswith("/api/uploaded/") and path.endswith("/convert"):
                slug = urllib.parse.unquote(path[len("/api/uploaded/"):-len("/convert")])
                post, error = get_uploaded_post(slug)
                if post is None:
                    self._send_json({"error": error or "not found"}, 404)
                    return
                render_page_mod.render_page(post)
                self._send_json({"ok": True, "slug": slug, "url": f"/page/{slug}", "download_url": f"/page/{slug}/download", "stale": bool(error)})

            elif path == "/api/daily-plan/run":
                job_id = job_queue.submit("daily-batch", run_daily_batch, meta={"title": "Daily 15-topic batch"})
                self._send_json({"job_id": job_id})

            elif path.startswith("/api/pending/") and path.endswith("/approve"):
                fname = urllib.parse.unquote(path[len("/api/pending/"):-len("/approve")])
                full_path = os.path.join(PENDING_DIR, fname)
                record = _read_json(full_path)
                publish_post(record)
                os.remove(full_path)
                self._send_json({"ok": True, "slug": record.get("slug")})

            elif path.startswith("/api/pending/") and path.endswith("/upload"):
                fname = urllib.parse.unquote(path[len("/api/pending/"):-len("/upload")])
                full_path = os.path.join(PENDING_DIR, fname)
                ok = upload_draft_mod.upload_one(full_path)
                self._send_json({"ok": ok})

            elif path == "/api/suggestions/generate":
                count = int(body.get("count", 10))
                count = max(1, min(count, 20))
                job_id = job_queue.submit(
                    "suggestions",
                    lambda: run_topic_suggestions(count=count),
                    meta={"count": count},
                )
                self._send_json({"job_id": job_id})

            elif path == "/api/rankings/check":
                keywords = body.get("keywords") or None
                job_id = job_queue.submit(
                    "rankings",
                    lambda: run_keyword_rankings(keywords=keywords),
                    meta={"keywords": keywords},
                )
                self._send_json({"job_id": job_id})

            elif path.startswith("/api/jobs/") and path.endswith("/retry"):
                job_id = path[len("/api/jobs/"):-len("/retry")]
                new_job_id, error = job_queue.retry_job(job_id)
                if error:
                    self._send_json({"error": error}, 400 if error != "not found" else 404)
                else:
                    self._send_json({"job_id": new_job_id, "retry_of": job_id})

            elif path == "/api/generate":
                ideas = body.get("ideas") or []
                if not ideas:
                    self._send_json({"error": "no ideas provided"}, 400)
                    return
                job_ids = []
                for idea in ideas:
                    title = idea.get("title") or idea.get("targetKeyword") or "auto"
                    content_type = idea.get("contentType")
                    if content_type not in VALID_CONTENT_TYPES:
                        content_type = None
                    job_id = job_queue.submit(
                        "blog",
                        lambda t=title, ct=content_type: run_daily_blog(seed_topic=t, content_type=ct),
                        meta={"title": title, "content_type": content_type},
                    )
                    job_ids.append(job_id)
                self._send_json({"job_ids": job_ids})

            elif path.startswith("/api/knowledge/") and not path.endswith("/generate"):
                name = path[len("/api/knowledge/"):]
                if name not in KNOWLEDGE_FILES:
                    self._send_json({"error": f"unknown knowledge file: {name}"}, 404)
                else:
                    content = body.get("content", "")
                    file_path = os.path.join(KNOWLEDGE_DIR, f"{name}.md")
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(content)
                    self._send_json({"ok": True, "name": name, "bytes": len(content.encode("utf-8"))})

            elif path == "/api/case-studies/assist/questions":
                self._send_json({"questions": suggest_questions(body.get("case_input") or {})})

            elif path == "/api/case-studies/assist/polish":
                self._send_json(polish_text(body.get("field", ""), body.get("text", "")))

            elif path == "/api/whitepapers/assist/questions":
                self._send_json({"questions": wp_suggest_questions(body.get("wp_input") or {})})

            elif path == "/api/whitepapers/assist/polish":
                self._send_json(polish_text(body.get("field", ""), body.get("text", "")))

            elif path == "/api/press/assist/questions":
                self._send_json({"questions": press_suggest_questions(body.get("press_input") or {})})

            elif path == "/api/press/assist/polish":
                self._send_json(polish_text(body.get("field", ""), body.get("text", "")))

            elif path == "/api/case-studies/generate":
                case_input = body.get("case_input") or {}
                target_words = int(body.get("target_word_count", 10000))
                force_review = bool(body.get("review", False))
                job_id = job_queue.submit(
                    "case-study",
                    lambda: run_case_study(case_input, target_word_count=target_words, force_review=force_review),
                    meta={"title": case_input.get("client_name") or "[Client Name]", "words": target_words},
                )
                self._send_json({"job_id": job_id})

            elif path.startswith("/api/case-studies/pending/") and path.endswith("/approve"):
                fname = urllib.parse.unquote(path[len("/api/case-studies/pending/"):-len("/approve")])
                full_path = os.path.join(PENDING_CS_DIR, fname)
                record = _read_json(full_path)
                publish_case_study(record)
                os.remove(full_path)
                self._send_json({"ok": True, "slug": record.get("slug")})

            elif path.startswith("/api/case-studies/pending/") and path.endswith("/render"):
                fname = urllib.parse.unquote(path[len("/api/case-studies/pending/"):-len("/render")])
                record = _read_json(os.path.join(PENDING_CS_DIR, fname))
                case_study_render_mod.render_case_study_html(record)
                slug = record.get("slug", "case-study")
                self._send_json({"ok": True, "slug": slug, "url": f"/case-study/{slug}", "download_url": f"/case-study/{slug}/download"})

            elif path == "/api/whitepapers/generate":
                wp_input = body.get("wp_input") or {}
                target_words = int(body.get("target_word_count", 6000))
                force_review = bool(body.get("review", False))
                job_id = job_queue.submit(
                    "whitepaper",
                    lambda: run_whitepaper(wp_input, target_word_count=target_words, force_review=force_review),
                    meta={"title": wp_input.get("topic") or "[Topic]", "words": target_words},
                )
                self._send_json({"job_id": job_id})

            elif path.startswith("/api/whitepapers/pending/") and path.endswith("/approve"):
                fname = urllib.parse.unquote(path[len("/api/whitepapers/pending/"):-len("/approve")])
                full_path = os.path.join(PENDING_WP_DIR, fname)
                record = _read_json(full_path)
                publish_whitepaper(record)
                os.remove(full_path)
                self._send_json({"ok": True, "slug": record.get("slug")})

            elif path.startswith("/api/whitepapers/pending/") and path.endswith("/render"):
                fname = urllib.parse.unquote(path[len("/api/whitepapers/pending/"):-len("/render")])
                record = _read_json(os.path.join(PENDING_WP_DIR, fname))
                whitepaper_render_mod.render_whitepaper_html(record)
                slug = record.get("slug", "whitepaper")
                self._send_json({"ok": True, "slug": slug, "url": f"/whitepaper/{slug}"})

            elif path.startswith("/api/whitepapers/pending/") and path.endswith("/pdf"):
                fname = urllib.parse.unquote(path[len("/api/whitepapers/pending/"):-len("/pdf")])
                record = _read_json(os.path.join(PENDING_WP_DIR, fname))
                try:
                    pdf_path = whitepaper_pdf_mod.render_whitepaper_pdf(record)
                    self._send_json({"ok": True, "pdf_path": pdf_path})
                except whitepaper_pdf_mod.PDFMissingDependency as err:
                    self._send_json({"error": str(err)}, 400)

            elif path == "/api/press/generate":
                press_input = body.get("press_input") or {}
                target_words = int(body.get("target_word_count", 600))
                force_review = bool(body.get("review", False))
                job_id = job_queue.submit(
                    "press",
                    lambda: run_press_release(press_input, target_word_count=target_words, force_review=force_review),
                    meta={"title": press_input.get("headline") or "[Headline]", "words": target_words},
                )
                self._send_json({"job_id": job_id})

            elif path == "/api/imagegen/generate":
                title = body.get("title") or "[Title]"
                excerpt = body.get("excerpt", "")
                category = body.get("category", "")
                url_ = body.get("url", "")
                source_type = body.get("source_type", "custom")
                source_slug = body.get("source_slug")
                count = int(body.get("count", 10))
                custom_prompt = body.get("custom_prompt")
                job_id = job_queue.submit(
                    "imagegen",
                    lambda: generate_social_image_pack(
                        title, excerpt=excerpt, category=category, url=url_,
                        source_type=source_type, source_slug=source_slug,
                        count=count, custom_prompt=custom_prompt,
                    ),
                    meta={"title": title, "count": count},
                )
                self._send_json({"job_id": job_id})

            elif path.startswith("/api/press/pending/") and path.endswith("/approve"):
                fname = urllib.parse.unquote(path[len("/api/press/pending/"):-len("/approve")])
                full_path = os.path.join(PENDING_PR_DIR, fname)
                record = _read_json(full_path)
                publish_press_release(record)
                os.remove(full_path)
                self._send_json({"ok": True, "slug": record.get("slug")})

            elif path.startswith("/api/press/pending/") and path.endswith("/render"):
                fname = urllib.parse.unquote(path[len("/api/press/pending/"):-len("/render")])
                record = _read_json(os.path.join(PENDING_PR_DIR, fname))
                press_render_mod.render_press_html(record)
                slug = record.get("slug", "press-release")
                self._send_json({"ok": True, "slug": slug, "url": f"/press/{slug}"})

            elif path.startswith("/api/press/pending/") and path.endswith("/pdf"):
                fname = urllib.parse.unquote(path[len("/api/press/pending/"):-len("/pdf")])
                record = _read_json(os.path.join(PENDING_PR_DIR, fname))
                try:
                    pdf_path = press_pdf_mod.render_press_pdf(record)
                    self._send_json({"ok": True, "pdf_path": pdf_path})
                except press_pdf_mod.PDFMissingDependency as err:
                    self._send_json({"error": str(err)}, 400)

            elif path.startswith("/api/content/") and "/draft/" in path and path.endswith("/save"):
                ctype, _, rest, _action = path[len("/api/content/"):].split("/", 3)
                fname = _safe_filename(urllib.parse.unquote(rest))
                cfg = CONTENT_REGISTRY.get(ctype)
                if not cfg:
                    self._send_json({"error": f"unknown content type '{ctype}'"}, 404)
                else:
                    edited = body.get("record")
                    if not isinstance(edited, dict):
                        self._send_json({"error": "expected {\"record\": {...}} in the request body"}, 400)
                    else:
                        full_path = os.path.join(cfg["pending_dir"], fname)
                        with open(full_path, "w", encoding="utf-8") as f:
                            json.dump(edited, f, indent=2, ensure_ascii=False)
                        self._send_json({"ok": True})

            elif path.startswith("/api/content/") and "/draft/" in path and path.endswith("/delete"):
                ctype, _, rest, _action = path[len("/api/content/"):].split("/", 3)
                fname = _safe_filename(urllib.parse.unquote(rest))
                cfg = CONTENT_REGISTRY.get(ctype)
                if not cfg:
                    self._send_json({"error": f"unknown content type '{ctype}'"}, 404)
                else:
                    full_path = os.path.join(cfg["pending_dir"], fname)
                    if os.path.exists(full_path):
                        os.remove(full_path)
                    self._send_json({"ok": True})

            elif path.startswith("/api/content/") and "/published/" in path and path.endswith("/save"):
                ctype, _, rest, _action = path[len("/api/content/"):].split("/", 3)
                slug = urllib.parse.unquote(rest)
                cfg = CONTENT_REGISTRY.get(ctype)
                if not cfg:
                    self._send_json({"error": f"unknown content type '{ctype}'"}, 404)
                else:
                    edited = body.get("record")
                    if not isinstance(edited, dict):
                        self._send_json({"error": "expected {\"record\": {...}} in the request body"}, 400)
                    else:
                        edited["slug"] = slug  # never let an edit change the slug out from under the URL
                        try:
                            from lib.supabase import upsert_row_resilient
                            saved, stripped = upsert_row_resilient(cfg["table_published"], edited, on_conflict="slug")
                        except SupabaseError as err:
                            self._send_json({"error": f"Supabase save failed: {err}"}, 502)
                        else:
                            regen = _regenerate_content_files(cfg, edited)
                            self._send_json({"ok": True, "stripped_columns": stripped, "regenerated": regen})

            elif path.startswith("/api/content/") and "/published/" in path and path.endswith("/delete"):
                ctype, _, rest, _action = path[len("/api/content/"):].split("/", 3)
                slug = urllib.parse.unquote(rest)
                cfg = CONTENT_REGISTRY.get(ctype)
                if not cfg:
                    self._send_json({"error": f"unknown content type '{ctype}'"}, 404)
                else:
                    try:
                        delete_row(cfg["table_published"], {"slug": f"eq.{slug}"})
                    except SupabaseError as err:
                        self._send_json({"error": f"Supabase delete failed: {err}"}, 502)
                    else:
                        for base_dir, ext in [
                            (cfg["pdf_dir"], ".pdf"),
                        ]:
                            if base_dir:
                                p = os.path.join(base_dir, f"{slug}{ext}")
                                if os.path.exists(p):
                                    os.remove(p)
                        self._send_json({"ok": True})

            elif path.startswith("/api/content/") and "/published/" in path and path.endswith("/retry"):
                ctype, _, rest, _action = path[len("/api/content/"):].split("/", 3)
                slug = urllib.parse.unquote(rest)
                cfg = CONTENT_REGISTRY.get(ctype)
                if not cfg:
                    self._send_json({"error": f"unknown content type '{ctype}'"}, 404)
                else:
                    try:
                        rows = select_rows(cfg["table_published"], filters={"slug": f"eq.{slug}"}, limit=1)
                    except SupabaseError as err:
                        self._send_json({"error": f"Couldn't fetch record to retry: {err}"}, 502)
                    else:
                        if not rows:
                            self._send_json({"error": "not found"}, 404)
                        else:
                            regen = _regenerate_content_files(cfg, rows[0])
                            self._send_json({"ok": True, "regenerated": regen})

            else:
                self._send_json({"error": "not found"}, 404)
        except Exception as exc:  # noqa: BLE001
            self._send_json({"error": str(exc)}, 500)


def _seconds_until_next_run(hour):
    from datetime import datetime, timedelta
    now = datetime.now()
    target = now.replace(hour=hour, minute=0, second=0, microsecond=0)
    if target <= now:
        target += timedelta(days=1)
    return (target - now).total_seconds()


def _start_scheduler_thread():
    import threading
    import time as time_mod

    if os.environ.get("ENABLE_DAILY_SCHEDULER", "true").lower() in ("false", "0", "no"):
        print("[scheduler] ENABLE_DAILY_SCHEDULER is off — the 6 AM batch won't run automatically "
              "(use `python index.py --daily-schedule` manually or via cron/Termux:Job instead).")
        return
    hour = int(os.environ.get("SCHEDULE_HOUR", "6"))

    def loop():
        while True:
            wait_s = _seconds_until_next_run(hour)
            print(f"[scheduler] Next daily batch in {wait_s / 3600:.1f}h "
                  f"(only fires while this process keeps running).")
            time_mod.sleep(wait_s)
            print("[scheduler] Running today's 15-topic batch...")
            job_queue.submit("daily-batch", run_daily_batch, meta={"title": "Daily 15-topic batch (scheduled)"})
            time_mod.sleep(60)  # avoid double-firing if the clock is right at the boundary

    t = threading.Thread(target=loop, daemon=True)
    t.start()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get("WEB_UI_PORT", "8787"))
    host = os.environ.get("WEB_UI_HOST", "0.0.0.0")
    _start_scheduler_thread()
    server = ThreadingHTTPServer((host, port), Handler)
    pool = job_queue.pool_size()
    print(f"[web] Serving on http://{host}:{port}  ({pool} parallel worker{'s' if pool != 1 else ''} available)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[web] Shutting down.")
        server.shutdown()


if __name__ == "__main__":
    main()
