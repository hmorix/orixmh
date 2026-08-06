#!/usr/bin/env python3
"""Converts a whitepaper JSON record into a standalone HTML landing page
using templates/whitepaper-template.html. Pure data -> template
substitution, no AI call — deterministic.

Usage:
  python3 scripts/whitepaper_render.py drafts/pending-whitepapers/<file>.json
  python3 scripts/whitepaper_render.py --slug my-whitepaper
  python3 scripts/whitepaper_render.py --all-pending
"""
import html
import json
import os
import sys

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "..", "templates", "whitepaper-template.html")
OUTPUT_DIR = os.environ.get(
    "RENDERED_WHITEPAPER_PAGES_DIR", os.path.join(os.getcwd(), "generated", "whitepaper-html")
)
PAGES_INDEX_FILE = os.path.join(OUTPUT_DIR, "_index.json")
PDF_DIR = os.environ.get(
    "WHITEPAPER_PDF_OUTPUT_DIR", os.path.join(os.getcwd(), "generated", "whitepaper-pdfs")
)


def _now_iso():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


def _s(value):
    """Like str(), but treats None as empty string. Needed because a
    content block's field can be present-but-null (e.g. {"text": None})
    from real LLM output — .get(key, default) doesn't catch that, since
    the default only applies when the key is absent, not when it's null."""
    return "" if value is None else str(value)


def _render_content_blocks(blocks):
    out = []
    for block in blocks or []:
        btype = block.get("type")
        if btype == "heading":
            level = block.get("level", 2)
            tag = "h3" if level == 3 else "h2"
            out.append(f"<{tag}>{html.escape(_s(block.get('text')))}</{tag}>")
        elif btype == "list":
            items = "".join(f"<li>{html.escape(_s(i))}</li>" for i in (block.get("items") or []))
            out.append(f"<ul>{items}</ul>")
        elif btype == "table":
            headers = "".join(f"<th>{html.escape(_s(h))}</th>" for h in (block.get("headers") or []))
            rows = "".join(
                "<tr>" + "".join(f"<td>{html.escape(_s(c))}</td>" for c in row) + "</tr>"
                for row in (block.get("rows") or [])
            )
            out.append(f"<table><thead><tr>{headers}</tr></thead><tbody>{rows}</tbody></table>")
        else:
            out.append(f"<p>{html.escape(_s(block.get('text')))}</p>")
    return "\n      ".join(out)


def _render_toc(content):
    titles = [b.get("text") for b in (content or []) if b.get("type") == "heading" and b.get("level", 2) == 2]
    titles = [t for t in titles if t]
    if not titles:
        return ""
    items = "".join(f"<li>{html.escape(_s(t))}</li>" for t in titles)
    return f'<div class="toc"><div class="label">Contents</div><ol>{items}</ol></div>'


def _render_sources(sources):
    sources = [s for s in (sources or []) if s.get("url")]
    if not sources:
        return ""
    items = "".join(
        f'<li><a href="{html.escape(_s(s.get("url")))}" target="_blank" rel="noopener noreferrer">'
        f'{html.escape(_s(s.get("title") or s.get("url")))}</a></li>'
        for s in sources
    )
    return f'<div class="sources"><h3>Sources</h3><ol>{items}</ol></div>'


def _render_related(related, site_url):
    if not related:
        return ""
    items = "".join(
        f'<li><a href="{html.escape(site_url)}/whitepapers/{html.escape(slug)}">{html.escape(slug)}</a></li>'
        for slug in related
    )
    return f'<div class="related"><h3>Related White Papers</h3><ul>{items}</ul></div>'


def _render_reference_links(links):
    valid = [l for l in (links or []) if l.get("url")]
    if not valid:
        return ""
    items = "".join(
        f'<li><a href="{html.escape(l["url"])}" target="_blank" rel="noopener noreferrer">'
        f'{html.escape(l.get("label") or l["url"])}</a></li>'
        for l in valid
    )
    return f'<div class="reference-links"><h3>Related Links</h3><ul>{items}</ul></div>'


def render_whitepaper_html(record):
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        template = f.read()

    title = _s(record.get("title")) or "Untitled White Paper"
    slug = record.get("slug") or "whitepaper"
    seo_title = record.get("seo_title") or title
    meta_description = record.get("meta_description") or record.get("excerpt") or ""
    canonical_url = record.get("canonical_url") or f"/whitepapers/{slug}"
    og = record.get("open_graph") or {}
    schema = record.get("schema_jsonld") or {}
    site_url = os.environ.get("SITE_URL", "").rstrip("/")
    whitepapers_index_url = os.environ.get("WHITEPAPERS_INDEX_URL", "/whitepapers")

    pdf_exists = record.get("pdf_generated") and os.path.exists(os.path.join(PDF_DIR, f"{slug}.pdf"))
    pdf_button = (
        f'<a href="/whitepaper/{html.escape(slug)}/pdf" class="btn-download">Download PDF</a>' if pdf_exists else ""
    )
    cover_url = record.get("cover_image_url")
    cover_block = f'<div class="cover"><img src="{html.escape(cover_url)}" alt="{html.escape(title)}" /></div>' if cover_url else ""

    replacements = {
        "{{SEO_TITLE}}": html.escape(seo_title),
        "{{META_DESCRIPTION}}": html.escape(meta_description),
        "{{CANONICAL_URL}}": html.escape(canonical_url),
        "{{OG_TITLE}}": html.escape(og.get("title") or seo_title),
        "{{OG_DESCRIPTION}}": html.escape(og.get("description") or meta_description),
        "{{COVER_IMAGE_URL}}": html.escape(cover_url or ""),
        "{{SCHEMA_JSONLD}}": json.dumps(schema, indent=2),
        "{{WHITEPAPERS_INDEX_URL}}": html.escape(whitepapers_index_url),
        "{{TITLE}}": html.escape(title),
        "{{EXCERPT}}": html.escape(record.get("excerpt") or ""),
        "{{READ_TIME}}": html.escape(record.get("read_time") or ""),
        "{{TOPIC}}": html.escape(record.get("topic") or ""),
        "{{PDF_BUTTON}}": pdf_button,
        "{{COVER_BLOCK}}": cover_block,
        "{{TOC_BLOCK}}": _render_toc(record.get("content")),
        "{{ARTICLE_CONTENT}}": _render_content_blocks(record.get("content")),
        "{{SOURCES_BLOCK}}": _render_sources(record.get("sources")),
        "{{RELATED_BLOCK}}": _render_related(record.get("related_whitepapers"), site_url),
        "{{REFERENCE_LINKS_BLOCK}}": _render_reference_links(record.get("reference_links")),
        "{{CTA_TEXT}}": html.escape(record.get("cta_text") or "Talk to HMorix about your project"),
        "{{CTA_URL}}": html.escape(record.get("cta_url") or "/contact"),
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
        "canonical_url": record.get("canonical_url"),
        "rendered_at": _now_iso(),
    }
    ordered = sorted(index.values(), key=lambda p: p.get("rendered_at") or "", reverse=True)
    os.makedirs(os.path.dirname(PAGES_INDEX_FILE), exist_ok=True)
    with open(PAGES_INDEX_FILE, "w", encoding="utf-8") as f:
        json.dump(ordered, f, indent=2)


def _render_file(path):
    with open(path, "r", encoding="utf-8") as f:
        record = json.load(f)
    out_path = render_whitepaper_html(record)
    print(f"[whitepaper-render] {path} -> {out_path}")


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)

    if "--slug" in args:
        idx = args.index("--slug")
        slug = args[idx + 1]
        sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from lib.supabase import select_rows, SupabaseError
        try:
            rows = select_rows("whitepapers", filters={"slug": f"eq.{slug}"}, limit=1)
        except SupabaseError as err:
            print(f"[whitepaper-render] Couldn't fetch \"{slug}\": {err}", file=sys.stderr)
            sys.exit(1)
        if not rows:
            print(f"[whitepaper-render] No whitepaper found with slug \"{slug}\".", file=sys.stderr)
            sys.exit(1)
        out_path = render_whitepaper_html(rows[0])
        print(f"[whitepaper-render] whitepapers/{slug} -> {out_path}")
        return

    if "--all-pending" in args:
        pending_dir = os.path.join(os.getcwd(), "drafts", "pending-whitepapers")
        if not os.path.isdir(pending_dir):
            print(f"[whitepaper-render] No {pending_dir} directory found.")
            return
        for fname in os.listdir(pending_dir):
            if fname.endswith(".json"):
                _render_file(os.path.join(pending_dir, fname))
        return

    for path in args:
        if not os.path.exists(path):
            print(f"[whitepaper-render] File not found: {path}", file=sys.stderr)
            continue
        _render_file(path)


if __name__ == "__main__":
    main()
