#!/usr/bin/env python3
"""Renders a white paper JSON record into a real PDF: cover page, table of
contents (clickable internal links), long-form sections, native-drawn
diagrams (bar chart / comparison table / process flow — built only from
data actually present in the record, never invented), a supporting-visuals
page, a numbered sources/citations page (clickable external hyperlinks),
a related-white-papers backlinks page, and a closing CTA page.

Requires reportlab (`pip install reportlab --break-system-packages`). If
it isn't installed, this fails with a clear, actionable message rather than
a raw traceback — the rest of the pipeline (HTML + TSX + Supabase) still
works without it.

Usage:
  python3 scripts/whitepaper_pdf.py path/to/record.json
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.pdf_builder import (  # noqa: E402
    PDFBuilder, PDFMissingDependency, REPORTLAB_AVAILABLE,
    sanitize, wrap_text, download_to_temp, first_list_block,
    PAGE_W, PAGE_H, MARGIN, CONTENT_W, ACCENT, INK, MUTED, LINK_BLUE, MM,
)

if REPORTLAB_AVAILABLE:
    from reportlab.pdfbase.pdfmetrics import stringWidth

OUTPUT_DIR = os.environ.get(
    "WHITEPAPER_PDF_OUTPUT_DIR", os.path.join(os.getcwd(), "generated", "whitepaper-pdfs")
)


def _render_content_blocks(pdf, content, sources, stats, comparison, link_targets):
    for block in content:
        btype = block.get("type")
        if btype == "heading" and block.get("level", 2) == 2:
            text = block.get("text", "")
            if text in link_targets:
                pdf.canvas.bookmarkPage(link_targets[text])
            pdf.heading(text, size=15)

            if "key findings" in text.lower():
                try:
                    pdf.bar_chart(stats)
                except Exception as err:  # noqa: BLE001
                    print(f"[whitepaper-pdf] Skipping bar chart: {err}")
            if "comparison" in text.lower() and comparison.get("headers"):
                try:
                    pdf.table(comparison.get("headers"), comparison.get("rows", []), title="Comparison")
                except Exception as err:  # noqa: BLE001
                    print(f"[whitepaper-pdf] Skipping comparison table: {err}")
            if "methodology" in text.lower() or "approach" in text.lower():
                steps = first_list_block(content, text)
                if steps:
                    try:
                        pdf.flow_diagram(steps)
                    except Exception as err:  # noqa: BLE001
                        print(f"[whitepaper-pdf] Skipping flow diagram: {err}")
            continue
        if btype == "heading":
            pdf.subheading(block.get("text", ""))
        elif btype == "list":
            pdf.bullet_list(block.get("items", []))
        elif btype == "table":
            pdf.table(block.get("headers", []), block.get("rows", []))
        else:
            pdf.paragraph(block.get("text", ""))


def render_whitepaper_pdf(record):
    if not REPORTLAB_AVAILABLE:
        raise PDFMissingDependency(
            "reportlab isn't installed. Run: pip install reportlab --break-system-packages\n"
            "(HTML + TSX + Supabase steps still succeeded — only the PDF is missing.)"
        )

    site_name = os.environ.get("SITE_NAME", "HMorix")
    slug = record.get("slug", "whitepaper")
    title = record.get("title", "Untitled White Paper")
    topic = record.get("topic", "")
    content = record.get("content", [])
    sources = record.get("sources") or []
    stats = record.get("stats") or []
    comparison = record.get("comparison_table") or {}
    images = record.get("images") or []
    related = record.get("related_whitepapers") or []
    reference_links = record.get("reference_links") or []
    site_url = os.environ.get("SITE_URL", "").rstrip("/")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_path = os.path.join(OUTPUT_DIR, f"{slug}.pdf")
    pdf = PDFBuilder(out_path, site_name)
    pdf._skip_footer_this_page = True

    # ---- Cover page ----
    pdf.canvas.setFillColorRGB(*ACCENT)
    pdf.canvas.rect(0, pdf._to_pt_y(8), PAGE_W * MM, 8 * MM, fill=1, stroke=0)
    pdf.y = 60
    cover_img = download_to_temp(record.get("cover_image_url"), label="whitepaper-pdf")
    if cover_img:
        pdf.image(cover_img, max_h_mm=70, label="whitepaper-pdf")
    pdf.canvas.setFont("Helvetica-Bold", 10)
    pdf.canvas.setFillColorRGB(*MUTED)
    pdf.canvas.drawString(pdf._to_pt_x(MARGIN), pdf._to_pt_y(pdf.y + 5), "WHITE PAPER")
    pdf.y += 14
    pdf.canvas.setFont("Helvetica-Bold", 24)
    pdf.canvas.setFillColorRGB(*INK)
    for line in wrap_text(title, "Helvetica-Bold", 24, CONTENT_W):
        pdf.canvas.drawString(pdf._to_pt_x(MARGIN), pdf._to_pt_y(pdf.y + 8), line)
        pdf.y += 11
    pdf.y += 5
    if topic:
        pdf.canvas.setFont("Helvetica", 12)
        pdf.canvas.setFillColorRGB(*MUTED)
        for line in wrap_text(topic, "Helvetica", 12, CONTENT_W):
            pdf.canvas.drawString(pdf._to_pt_x(MARGIN), pdf._to_pt_y(pdf.y + 4), line)
            pdf.y += 6
    pdf.canvas.setFont("Helvetica", 9)
    pdf.canvas.setFillColorRGB(*MUTED)
    pdf.canvas.drawString(pdf._to_pt_x(MARGIN), pdf._to_pt_y(PAGE_H - 20), sanitize(f"{site_name} - {str(record.get('published_at', ''))[:10]}"))
    pdf._new_page()

    # ---- Table of contents (clickable) ----
    pdf.heading("Table of Contents", size=18)
    section_titles = [b.get("text") for b in content if b.get("type") == "heading" and b.get("level", 2) == 2]
    link_targets = {}
    pdf.canvas.setFont("Helvetica", 11)
    for t in section_titles:
        bm_name = f"section-{len(link_targets)}"
        link_targets[t] = bm_name
        pdf.ensure_space(8)
        y0 = pdf.y
        pdf.canvas.setFillColorRGB(*LINK_BLUE)
        pdf.canvas.drawString(pdf._to_pt_x(MARGIN), pdf._to_pt_y(y0 + 5), sanitize(t))
        w = stringWidth(sanitize(t), "Helvetica", 11) / MM
        pdf.link_to_bookmark(MARGIN, y0, w, 6, bm_name)
        pdf.y += 8
    pdf.canvas.setFillColorRGB(*INK)
    pdf._new_page()

    # ---- Sections (with diagrams interspersed) ----
    _render_content_blocks(pdf, content, sources, stats, comparison, link_targets)

    # ---- Supporting visuals ----
    real_images = [img for img in images if img.get("url")]
    if real_images:
        pdf.heading("Supporting Visuals", size=15)
        for img in real_images:
            local = download_to_temp(img.get("url"), label="whitepaper-pdf")
            if not local:
                continue
            if pdf.image(local, label="whitepaper-pdf"):
                if img.get("caption"):
                    pdf.canvas.setFont("Helvetica-Oblique", 9)
                    pdf.canvas.setFillColorRGB(*MUTED)
                    for line in wrap_text(img["caption"], "Helvetica-Oblique", 9, CONTENT_W):
                        pdf.ensure_space(5)
                        pdf.canvas.drawCentredString(pdf._to_pt_x(PAGE_W / 2), pdf._to_pt_y(pdf.y + 4), line)
                        pdf.y += 5

    # ---- Sources / citations ----
    if sources:
        pdf._new_page()
        pdf.heading("Sources", size=15)
        for i, s in enumerate(sources, 1):
            pdf.canvas.setFont("Helvetica", 9.5)
            pdf.canvas.setFillColorRGB(*INK)
            label = f"[{i}] {s.get('title', s.get('url'))}"
            for line in wrap_text(label, "Helvetica", 9.5, CONTENT_W):
                pdf.ensure_space(5.5)
                pdf.canvas.drawString(pdf._to_pt_x(MARGIN), pdf._to_pt_y(pdf.y + 4), line)
                pdf.y += 5.5
            pdf.link_line(s.get("url", ""), s.get("url", ""))

    # ---- Related white papers (backlinks) ----
    if related and site_url:
        pdf._new_page()
        pdf.heading("Related White Papers", size=15)
        for rel_slug in related:
            rel_url = f"{site_url}/whitepapers/{rel_slug}"
            pdf.link_line(rel_url, rel_url)

    valid_ref_links = [l for l in reference_links if l.get("url")]
    if valid_ref_links:
        if not related:
            pdf._new_page()
            pdf.heading("Related Links", size=15)
        else:
            pdf.subheading("Related Links")
        for l in valid_ref_links:
            pdf.link_line(l.get("label") or l["url"], l["url"])

    # ---- CTA page ----
    pdf._new_page()
    pdf.y += 60
    pdf.canvas.setFont("Helvetica-Bold", 18)
    pdf.canvas.setFillColorRGB(*INK)
    for line in wrap_text(record.get("cta_text") or "Ready to work with HMorix?", "Helvetica-Bold", 18, CONTENT_W):
        pdf.canvas.drawCentredString(pdf._to_pt_x(PAGE_W / 2), pdf._to_pt_y(pdf.y + 6), line)
        pdf.y += 9
    pdf.y += 4
    cta_url = record.get("cta_url") or "/contact"
    if cta_url.startswith("/") and site_url:
        cta_url = site_url + cta_url
    pdf.canvas.setFont("Helvetica-Bold", 12)
    pdf.canvas.setFillColorRGB(*LINK_BLUE)
    pdf.canvas.drawCentredString(pdf._to_pt_x(PAGE_W / 2), pdf._to_pt_y(pdf.y + 4), sanitize(cta_url))
    w = stringWidth(sanitize(cta_url), "Helvetica-Bold", 12) / MM
    pdf.link_url(PAGE_W / 2 - w / 2, pdf.y, w, 5, cta_url)

    pdf.save()
    return out_path


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    with open(sys.argv[1], "r", encoding="utf-8") as f:
        record = json.load(f)
    try:
        path = render_whitepaper_pdf(record)
        print(f"[whitepaper-pdf] Wrote {path}")
    except PDFMissingDependency as err:
        print(f"[whitepaper-pdf] {err}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
