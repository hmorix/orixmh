#!/usr/bin/env python3
"""Converts one case-study draft/published JSON record into a standalone
static HTML page using templates/case-study-template.html. Pure data ->
template substitution, no AI call — deterministic, same input always
produces the same output. Mirrors scripts/render_page.py for blog posts.

Usage:
  python3 scripts/case_study_render.py drafts/pending-case-studies/<file>.json
  python3 scripts/case_study_render.py --slug my-case-study   # fetch from Supabase case_studies
  python3 scripts/case_study_render.py --all-pending
"""
import html
import json
import os
import sys

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "..", "templates", "case-study-template.html")
OUTPUT_DIR = os.environ.get(
    "RENDERED_CASE_STUDY_PAGES_DIR", os.path.join(os.getcwd(), "generated", "case-study-html")
)
PAGES_INDEX_FILE = os.path.join(OUTPUT_DIR, "_index.json")


def _now_iso():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


def _format_date(iso_string):
    if not iso_string:
        return ""
    return iso_string.split("T")[0]


def _s(value):
    """Like str(), but treats None as empty string — see the matching
    helper in scripts/whitepaper_render.py for why this is needed."""
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


def _render_results(results):
    if not results:
        return "<p style=\"color:rgba(245,240,232,0.25);font-family:monospace;font-size:0.8125rem;\">No results added yet.</p>"
    cards = []
    for r in results:
        is_placeholder = bool(r.get("is_placeholder", True))
        cls = "result-card placeholder" if is_placeholder else "result-card"
        tag = '<div class="result-tag">placeholder</div>' if is_placeholder else ""
        cards.append(
            f'<div class="{cls}">'
            f'<div class="result-value">{html.escape(_s(r.get("value")))}</div>'
            f'<div class="result-metric">{html.escape(_s(r.get("metric")))}</div>'
            f'{tag}</div>'
        )
    return "\n        ".join(cards)


def _render_gallery(images):
    if not images:
        images = [{"url": "", "alt": f"[Gallery image {i + 1} placeholder]"} for i in range(4)]
    items = []
    for img in images:
        url = img.get("url")
        alt = html.escape(_s(img.get("alt")) or "Gallery image")
        if url:
            items.append(f'<div class="gallery-item"><img src="{html.escape(_s(url))}" alt="{alt}" /></div>')
        else:
            items.append(f'<div class="gallery-item"><div class="label">{alt}</div></div>')
    return "\n        ".join(items)


def _render_hero(hero_url, title):
    if hero_url:
        return f'<img src="{html.escape(_s(hero_url))}" alt="{html.escape(_s(title))}" />'
    return (
        '<div class="hero-placeholder">'
        '<div class="label">POSTER / HERO IMAGE</div>'
        '<div class="hint">1200 × 630 — add hero_image_url to replace this placeholder</div>'
        '</div>'
    )


def _render_related_links(links):
    valid = [l for l in (links or []) if l.get("url")]
    if not valid:
        return ""
    items = "".join(
        f'<li><a href="{html.escape(_s(l["url"]))}" target="_blank" rel="noopener noreferrer">'
        f'{html.escape(_s(l.get("label") or l["url"]))}</a></li>'
        for l in valid
    )
    return f'<div class="related-links"><h3>Related Links</h3><ul>{items}</ul></div>'


def _render_testimonial(record):
    quote = record.get("testimonial_quote")
    author = record.get("testimonial_author") or ""
    role = record.get("testimonial_role") or ""
    if quote:
        attribution = author + (f" — {role}" if role else "")
        return (
            f'<div class="testimonial"><p>"{html.escape(_s(quote))}"</p>'
            f'<div class="attribution">{html.escape(_s(attribution))}</div></div>'
        )
    return (
        '<div class="testimonial-placeholder">'
        '<p>[Testimonial Placeholder — to be added once the client provides a quote]</p>'
        '</div>'
    )


def render_case_study_html(record):
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        template = f.read()

    title = record.get("title", "")
    slug = record.get("slug", "case-study")
    seo_title = record.get("seo_title") or title
    meta_description = record.get("meta_description") or record.get("excerpt", "")
    canonical_url = record.get("canonical_url") or f"/case-studies/{slug}"
    og = record.get("open_graph") or {}
    twitter = record.get("twitter_card") or {}
    schema = record.get("schema_jsonld") or {}
    is_demo = bool(record.get("is_demo", True))
    case_studies_index_url = os.environ.get("CASE_STUDIES_INDEX_URL", "/case-studies")

    demo_banner = (
        '<div class="demo-banner">DEMO / SAMPLE PROJECT — placeholder content, not a real published result.</div>'
        if is_demo else ""
    )

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
        "{{HERO_IMAGE_URL}}": html.escape(record.get("hero_image_url") or ""),
        "{{SCHEMA_JSONLD}}": json.dumps(schema, indent=2),
        "{{CASE_STUDIES_INDEX_URL}}": html.escape(case_studies_index_url),
        "{{DEMO_BANNER}}": demo_banner,
        "{{CATEGORY}}": html.escape(record.get("category") or "Case Study"),
        "{{TITLE}}": html.escape(title),
        "{{HERO_IMAGE_BLOCK}}": _render_hero(record.get("hero_image_url"), title),
        "{{CLIENT_NAME}}": html.escape(record.get("client_name") or ""),
        "{{INDUSTRY}}": html.escape(record.get("industry") or ""),
        "{{SERVICE_USED}}": html.escape(record.get("service_used") or ""),
        "{{TIMELINE}}": html.escape(record.get("timeline") or ""),
        "{{READ_TIME}}": html.escape(record.get("read_time") or ""),
        "{{DATE}}": html.escape(_format_date(record.get("published_at"))),
        "{{RESULTS_CARDS}}": _render_results(record.get("results")),
        "{{ARTICLE_CONTENT}}": _render_content_blocks(record.get("content")),
        "{{GALLERY_ITEMS}}": _render_gallery(record.get("gallery_images")),
        "{{TESTIMONIAL_BLOCK}}": _render_testimonial(record),
        "{{RELATED_LINKS_BLOCK}}": _render_related_links(record.get("reference_links")),
        "{{CTA_TEXT}}": html.escape(record.get("cta_text") or "Ready to build something like this?"),
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
        "is_demo": bool(record.get("is_demo", True)),
        "canonical_url": record.get("canonical_url"),
        "rendered_at": _now_iso(),
    }
    ordered = sorted(index.values(), key=lambda p: p.get("rendered_at") or "", reverse=True)
    with open(PAGES_INDEX_FILE, "w", encoding="utf-8") as f:
        json.dump(ordered, f, indent=2)


def _render_file(path):
    with open(path, "r", encoding="utf-8") as f:
        record = json.load(f)
    out_path = render_case_study_html(record)
    print(f"[case-study-render] {path} -> {out_path}")


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
            rows = select_rows("case_studies", filters={"slug": f"eq.{slug}"}, limit=1)
        except SupabaseError as err:
            print(f"[case-study-render] Couldn't fetch \"{slug}\": {err}", file=sys.stderr)
            sys.exit(1)
        if not rows:
            print(f"[case-study-render] No case study found with slug \"{slug}\".", file=sys.stderr)
            sys.exit(1)
        out_path = render_case_study_html(rows[0])
        print(f"[case-study-render] case_studies/{slug} -> {out_path}")
        return

    if "--all-pending" in args:
        pending_dir = os.path.join(os.getcwd(), "drafts", "pending-case-studies")
        if not os.path.isdir(pending_dir):
            print(f"[case-study-render] No {pending_dir} directory found.")
            return
        files = [f for f in os.listdir(pending_dir) if f.endswith(".json")]
        for fname in files:
            _render_file(os.path.join(pending_dir, fname))
        return

    for path in args:
        if not os.path.exists(path):
            print(f"[case-study-render] File not found: {path}", file=sys.stderr)
            continue
        _render_file(path)


if __name__ == "__main__":
    main()
