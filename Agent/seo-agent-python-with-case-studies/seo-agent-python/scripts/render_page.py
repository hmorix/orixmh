#!/usr/bin/env python3
"""Converts one blog draft/post JSON record into a standalone static HTML page
using templates/page-template.html — the exact same design as BlogPost.tsx.

This does NOT call the AI. It's pure data -> template substitution, so the
output is deterministic: same input JSON always produces the same page.

Usage:
  python3 scripts/render_page.py drafts/pending/1737300000000-my-post.json
  python3 scripts/render_page.py --slug my-post-slug          # fetch from Supabase blog_posts
  python3 scripts/render_page.py --all-pending                # render every file in drafts/pending/

Output goes to generated/pages/<slug>.html — upload that file to your host
however you normally deploy static pages.
"""
import html
import json
import os
import sys

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "..", "templates", "page-template.html")
OUTPUT_DIR = os.environ.get("RENDERED_PAGES_DIR", os.path.join(os.getcwd(), "generated", "pages"))
PAGES_INDEX_FILE = os.path.join(OUTPUT_DIR, "_index.json")


def _update_pages_index(record, slug):
    index = {}
    if os.path.exists(PAGES_INDEX_FILE):
        try:
            with open(PAGES_INDEX_FILE, "r", encoding="utf-8") as f:
                for item in json.load(f):
                    index[item["slug"]] = item
        except (json.JSONDecodeError, KeyError, OSError):
            index = {}
    index[slug] = {
        "slug": slug,
        "title": record.get("title"),
        "category": record.get("category"),
        "canonical_url": record.get("canonical_url"),
        "rendered_at": _now_iso(),
    }
    ordered = sorted(index.values(), key=lambda p: p.get("rendered_at") or "", reverse=True)
    with open(PAGES_INDEX_FILE, "w", encoding="utf-8") as f:
        json.dump(ordered, f, indent=2)


def list_pages():
    if not os.path.exists(PAGES_INDEX_FILE):
        return []
    try:
        with open(PAGES_INDEX_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return []


def _now_iso():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


def _initials(name):
    parts = [p for p in (name or "").split() if p]
    return "".join(p[0] for p in parts[:2]).upper() or "?"


def _render_content_blocks(blocks):
    out = []
    for block in blocks or []:
        text = html.escape(block.get("text", ""))
        btype = block.get("type")
        if btype == "heading":
            out.append(f"<h2>{text}</h2>")
        elif btype == "code":
            out.append(f"<pre><code>{text}</code></pre>")
        else:
            out.append(f"<p>{text}</p>")
    return "\n      ".join(out)


def _format_date(iso_string):
    if not iso_string:
        return ""
    # Keep this dependency-free (no dateutil) — just take the date part.
    return iso_string.split("T")[0]


def render_page(record):
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        template = f.read()

    title = record.get("title", "")
    slug = record.get("slug", "draft")
    seo_title = record.get("seo_title") or title
    meta_description = record.get("meta_description") or record.get("excerpt", "")
    canonical_url = record.get("canonical_url") or f"/blog/{slug}"
    og = record.get("open_graph") or {}
    twitter = record.get("twitter_card") or {}
    schema = record.get("schema_jsonld") or {}

    blog_index_url = os.environ.get("BLOG_INDEX_URL", "/blog")

    replacements = {
        "{{SEO_TITLE}}": html.escape(seo_title),
        "{{META_DESCRIPTION}}": html.escape(meta_description),
        "{{CANONICAL_URL}}": html.escape(canonical_url),
        "{{OG_TYPE}}": html.escape(og.get("type", "article")),
        "{{OG_TITLE}}": html.escape(og.get("title") or seo_title),
        "{{OG_DESCRIPTION}}": html.escape(og.get("description") or meta_description),
        "{{TWITTER_CARD}}": html.escape(twitter.get("card", "summary_large_image")),
        "{{TWITTER_TITLE}}": html.escape(twitter.get("title") or seo_title),
        "{{TWITTER_DESCRIPTION}}": html.escape(twitter.get("description") or meta_description),
        "{{SCHEMA_JSONLD}}": json.dumps(schema, indent=2),
        "{{BLOG_INDEX_URL}}": html.escape(blog_index_url),
        "{{CATEGORY}}": html.escape(record.get("category") or "Article"),
        "{{TITLE}}": html.escape(title),
        "{{TITLE_JSON}}": json.dumps(title),
        "{{AUTHOR_INITIALS}}": html.escape(_initials(record.get("author"))),
        "{{AUTHOR}}": html.escape(record.get("author", "")),
        "{{AUTHOR_ROLE}}": html.escape(record.get("author_role", "")),
        "{{READ_TIME}}": html.escape(record.get("read_time", "")),
        "{{DATE}}": html.escape(_format_date(record.get("published_at"))),
        "{{ARTICLE_CONTENT}}": _render_content_blocks(record.get("content")),
        "{{SLUG}}": html.escape(slug),
    }

    page = template
    for token, value in replacements.items():
        page = page.replace(token, value)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_path = os.path.join(OUTPUT_DIR, f"{slug}.html")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(page)
    _update_pages_index(record, slug)
    return out_path


def _render_file(path):
    with open(path, "r", encoding="utf-8") as f:
        record = json.load(f)
    out_path = render_page(record)
    print(f"[render-page] {path} -> {out_path}")


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)

    if "--slug" in args:
        idx = args.index("--slug")
        if idx + 1 >= len(args):
            print("Usage: python3 scripts/render_page.py --slug <slug>", file=sys.stderr)
            sys.exit(1)
        slug = args[idx + 1]
        from lib.supabase import get_by_id, select_rows, SupabaseError  # local import: only needed for this path
        try:
            rows = select_rows("blog_posts", filters={"slug": f"eq.{slug}"}, limit=1)
        except SupabaseError as err:
            print(f"[render-page] Couldn't fetch \"{slug}\" from Supabase: {err}", file=sys.stderr)
            sys.exit(1)
        if not rows:
            print(f"[render-page] No post found with slug \"{slug}\" in blog_posts.", file=sys.stderr)
            sys.exit(1)
        out_path = render_page(rows[0])
        print(f"[render-page] blog_posts/{slug} -> {out_path}")
        return

    if "--all-pending" in args:
        pending_dir = os.path.join(os.getcwd(), "drafts", "pending")
        if not os.path.isdir(pending_dir):
            print(f"[render-page] No drafts/pending directory found at {pending_dir}")
            return
        files = [f for f in os.listdir(pending_dir) if f.endswith(".json")]
        if not files:
            print("[render-page] No pending draft files found.")
            return
        for fname in files:
            _render_file(os.path.join(pending_dir, fname))
        return

    # Otherwise treat every remaining arg as a path to a draft JSON file
    for path in args:
        if not os.path.exists(path):
            print(f"[render-page] File not found: {path}", file=sys.stderr)
            continue
        _render_file(path)


if __name__ == "__main__":
    main()
