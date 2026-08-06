#!/usr/bin/env python3
"""Converts a press release JSON record into a standalone HTML page.
Usage:
  python3 scripts/press_render.py drafts/pending-press/<file>.json
  python3 scripts/press_render.py --slug my-release
  python3 scripts/press_render.py --all-pending
"""
import html
import json
import os
import sys

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "..", "templates", "press-template.html")
OUTPUT_DIR = os.environ.get(
    "RENDERED_PRESS_PAGES_DIR", os.path.join(os.getcwd(), "generated", "press-html")
)
PDF_DIR = os.environ.get(
    "PRESS_PDF_OUTPUT_DIR", os.path.join(os.getcwd(), "generated", "press-pdfs")
)


def _s(value):
    """None-safe str() — a content block's field can be present-but-null
    from real LLM output, which .get(key, default) doesn't catch."""
    return "" if value is None else str(value)


def _render_content_blocks(blocks):
    out = []
    for block in blocks or []:
        if block.get("type") == "list":
            items = "".join(f"<li>{html.escape(_s(i))}</li>" for i in (block.get("items") or []))
            out.append(f"<ul>{items}</ul>")
        else:
            out.append(f"<p>{html.escape(_s(block.get('text')))}</p>")
    return "\n      ".join(out)


def render_press_html(record):
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        template = f.read()

    headline = _s(record.get("headline")) or "Untitled Press Release"
    slug = record.get("slug") or "press-release"
    seo_title = record.get("seo_title") or headline
    meta_description = record.get("meta_description") or record.get("excerpt") or ""
    canonical_url = record.get("canonical_url") or f"/press/{slug}"
    og = record.get("open_graph") or {}
    schema = record.get("schema_jsonld") or {}
    press_index_url = os.environ.get("PRESS_INDEX_URL", "/press")

    subheadline = record.get("subheadline")
    subheadline_block = f'<p class="subheadline">{html.escape(_s(subheadline))}</p>' if subheadline else ""

    cover_url = record.get("cover_image_url")
    cover_block = f'<div class="cover"><img src="{html.escape(_s(cover_url))}" alt="{html.escape(headline)}" /></div>' if cover_url else ""

    quote_text = record.get("quote_text")
    if quote_text:
        attribution = _s(record.get("quote_attribution")) + (f", {record['quote_role']}" if record.get("quote_role") else "")
        quote_block = f'<div class="quote"><p>"{html.escape(_s(quote_text))}"</p><div class="attribution">{html.escape(attribution)}</div></div>'
    else:
        quote_block = ""

    boilerplate = record.get("boilerplate")
    boilerplate_block = f'<div class="boilerplate"><h3>About HMorix</h3><p>{html.escape(_s(boilerplate))}</p></div>' if boilerplate else ""

    contact_lines = []
    if record.get("media_contact_name"):
        contact_lines.append(f'<div>{html.escape(_s(record["media_contact_name"]))}</div>')
    if record.get("media_contact_email"):
        contact_lines.append(f'<div>{html.escape(_s(record["media_contact_email"]))}</div>')
    if record.get("media_contact_phone"):
        contact_lines.append(f'<div>{html.escape(_s(record["media_contact_phone"]))}</div>')
    contact_block = f'<div class="contact"><div class="label">Media Contact</div>{"".join(contact_lines)}</div>' if contact_lines else ""

    sources = [s for s in (record.get("sources") or []) if s.get("url")]
    if sources:
        items = "".join(
            f'<li><a href="{html.escape(_s(s.get("url")))}" target="_blank" rel="noopener noreferrer">'
            f'{html.escape(_s(s.get("title") or s.get("url")))}</a></li>' for s in sources
        )
        sources_block = f'<div class="sources"><h3>Sources</h3><ol>{items}</ol></div>'
    else:
        sources_block = ""

    pdf_exists = record.get("pdf_generated") and os.path.exists(os.path.join(PDF_DIR, f"{slug}.pdf"))
    pdf_link_block = f'<a href="/press/{html.escape(slug)}/pdf" class="btn-download">Download PDF</a>' if pdf_exists else ""

    replacements = {
        "{{SEO_TITLE}}": html.escape(_s(seo_title)),
        "{{META_DESCRIPTION}}": html.escape(_s(meta_description)),
        "{{CANONICAL_URL}}": html.escape(_s(canonical_url)),
        "{{OG_TITLE}}": html.escape(_s(og.get("title")) or seo_title),
        "{{OG_DESCRIPTION}}": html.escape(_s(og.get("description")) or meta_description),
        "{{COVER_IMAGE_URL}}": html.escape(_s(cover_url)),
        "{{SCHEMA_JSONLD}}": json.dumps(schema, indent=2),
        "{{PRESS_INDEX_URL}}": html.escape(press_index_url),
        "{{CATEGORY}}": html.escape(_s(record.get("category")) or "Company News"),
        "{{DATELINE_CITY}}": html.escape(_s(record.get("dateline_city"))),
        "{{DATELINE_DATE}}": html.escape(_s(record.get("dateline_date"))),
        "{{HEADLINE}}": html.escape(headline),
        "{{SUBHEADLINE_BLOCK}}": subheadline_block,
        "{{COVER_BLOCK}}": cover_block,
        "{{ARTICLE_CONTENT}}": _render_content_blocks(record.get("content")),
        "{{QUOTE_BLOCK}}": quote_block,
        "{{BOILERPLATE_BLOCK}}": boilerplate_block,
        "{{CONTACT_BLOCK}}": contact_block,
        "{{SOURCES_BLOCK}}": sources_block,
        "{{PDF_LINK_BLOCK}}": pdf_link_block,
        "{{CTA_TEXT}}": html.escape(_s(record.get("cta_text")) or "Learn more about HMorix"),
        "{{CTA_URL}}": html.escape(_s(record.get("cta_url")) or "/contact"),
    }

    page = template
    for token, value in replacements.items():
        page = page.replace(token, value)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_path = os.path.join(OUTPUT_DIR, f"{slug}.html")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(page)
    return out_path


def _render_file(path):
    with open(path, "r", encoding="utf-8") as f:
        record = json.load(f)
    out_path = render_press_html(record)
    print(f"[press-render] {path} -> {out_path}")


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
            rows = select_rows("press_releases", filters={"slug": f"eq.{slug}"}, limit=1)
        except SupabaseError as err:
            print(f"[press-render] Couldn't fetch \"{slug}\": {err}", file=sys.stderr)
            sys.exit(1)
        if not rows:
            print(f"[press-render] No press release found with slug \"{slug}\".", file=sys.stderr)
            sys.exit(1)
        out_path = render_press_html(rows[0])
        print(f"[press-render] press_releases/{slug} -> {out_path}")
        return

    if "--all-pending" in args:
        pending_dir = os.path.join(os.getcwd(), "drafts", "pending-press")
        if not os.path.isdir(pending_dir):
            print(f"[press-render] No {pending_dir} directory found.")
            return
        for fname in os.listdir(pending_dir):
            if fname.endswith(".json"):
                _render_file(os.path.join(pending_dir, fname))
        return

    for path in args:
        if not os.path.exists(path):
            print(f"[press-render] File not found: {path}", file=sys.stderr)
            continue
        _render_file(path)


if __name__ == "__main__":
    main()
