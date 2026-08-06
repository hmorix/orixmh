#!/usr/bin/env python3
"""Renders a press release JSON record into a real one-page-style PDF:
letterhead, dateline + headline, body, quote block, boilerplate, media
contact, sources (if any), and a CTA.

Requires reportlab (`pip install reportlab --break-system-packages`).

Usage:
  python3 scripts/press_pdf.py path/to/record.json
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.pdf_builder import (  # noqa: E402
    PDFBuilder, PDFMissingDependency, REPORTLAB_AVAILABLE,
    sanitize, wrap_text, download_to_temp,
    PAGE_W, PAGE_H, MARGIN, CONTENT_W, ACCENT, INK, MUTED, LINK_BLUE, FLOW_FILL, MM,
)

OUTPUT_DIR = os.environ.get(
    "PRESS_PDF_OUTPUT_DIR", os.path.join(os.getcwd(), "generated", "press-pdfs")
)


def render_press_pdf(record):
    if not REPORTLAB_AVAILABLE:
        raise PDFMissingDependency(
            "reportlab isn't installed. Run: pip install reportlab --break-system-packages\n"
            "(HTML + TSX + Supabase steps still succeeded — only the PDF is missing.)"
        )

    site_name = os.environ.get("SITE_NAME", "HMorix")
    slug = record.get("slug", "press-release")
    headline = record.get("headline", "Untitled Press Release")
    subheadline = record.get("subheadline")
    category = record.get("category") or "Company News"
    dateline = f"{record.get('dateline_city') or ''} — {record.get('dateline_date') or ''}".strip(" —")
    content = record.get("content") or []
    quote_text = record.get("quote_text")
    boilerplate = record.get("boilerplate")
    sources = record.get("sources") or []
    site_url = os.environ.get("SITE_URL", "").rstrip("/")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_path = os.path.join(OUTPUT_DIR, f"{slug}.pdf")
    pdf = PDFBuilder(out_path, site_name)
    pdf._skip_footer_this_page = True

    # ---- Letterhead ----
    pdf.canvas.setFillColorRGB(*ACCENT)
    pdf.canvas.rect(0, pdf._to_pt_y(6), PAGE_W * MM, 6 * MM, fill=1, stroke=0)
    pdf.y = 22
    pdf.canvas.setFont("Helvetica-Bold", 11)
    pdf.canvas.setFillColorRGB(*INK)
    pdf.canvas.drawString(pdf._to_pt_x(MARGIN), pdf._to_pt_y(pdf.y), site_name)
    pdf.canvas.setFont("Helvetica-Bold", 9)
    pdf.canvas.setFillColorRGB(*MUTED)
    pdf.canvas.drawRightString(pdf._to_pt_x(PAGE_W - MARGIN), pdf._to_pt_y(pdf.y), "PRESS RELEASE")
    pdf.y += 6

    cover_img = download_to_temp(record.get("cover_image_url"), label="press-pdf")
    if cover_img:
        pdf.image(cover_img, max_h_mm=55, label="press-pdf")

    pdf.y += 4
    pdf.canvas.setFont("Helvetica", 8.5)
    pdf.canvas.setFillColorRGB(*MUTED)
    pdf.canvas.drawString(pdf._to_pt_x(MARGIN), pdf._to_pt_y(pdf.y), sanitize(f"{category}  ·  {dateline}"))
    pdf.y += 8

    pdf.canvas.setFont("Helvetica-Bold", 19)
    pdf.canvas.setFillColorRGB(*INK)
    for line in wrap_text(headline, "Helvetica-Bold", 19, CONTENT_W):
        pdf.canvas.drawString(pdf._to_pt_x(MARGIN), pdf._to_pt_y(pdf.y + 7), line)
        pdf.y += 9
    pdf.y += 2

    if subheadline:
        pdf.canvas.setFont("Helvetica-Oblique", 12)
        pdf.canvas.setFillColorRGB(*MUTED)
        for line in wrap_text(subheadline, "Helvetica-Oblique", 12, CONTENT_W):
            pdf.canvas.drawString(pdf._to_pt_x(MARGIN), pdf._to_pt_y(pdf.y + 5), line)
            pdf.y += 6.5
    pdf.y += 6

    # ---- Body ----
    for block in content:
        if block.get("type") == "list":
            pdf.bullet_list(block.get("items", []))
        else:
            pdf.paragraph(block.get("text", ""))

    # ---- Quote ----
    if quote_text:
        wrapped = wrap_text(f'"{quote_text}"', "Helvetica-Bold", 11, CONTENT_W - 8)
        box_h = 6 + len(wrapped) * 5.5 + (5.5 if record.get("quote_attribution") else 0)
        pdf.ensure_space(box_h)
        y0 = pdf.y
        pdf.canvas.setFillColorRGB(*FLOW_FILL)
        pdf.canvas.rect(pdf._to_pt_x(MARGIN), pdf._to_pt_y(y0 + box_h), CONTENT_W * MM, box_h * MM, fill=1, stroke=0)
        pdf.canvas.setStrokeColorRGB(*ACCENT)
        pdf.canvas.setLineWidth(2)
        pdf.canvas.line(pdf._to_pt_x(MARGIN), pdf._to_pt_y(y0), pdf._to_pt_x(MARGIN), pdf._to_pt_y(y0 + box_h))
        pdf.canvas.setFont("Helvetica-Bold", 11)
        pdf.canvas.setFillColorRGB(*INK)
        yy = y0 + 5
        for line in wrapped:
            pdf.canvas.drawString(pdf._to_pt_x(MARGIN + 4), pdf._to_pt_y(yy), line)
            yy += 5.5
        if record.get("quote_attribution"):
            pdf.canvas.setFont("Helvetica", 9)
            pdf.canvas.setFillColorRGB(*MUTED)
            attribution = record["quote_attribution"] + (f", {record['quote_role']}" if record.get("quote_role") else "")
            pdf.canvas.drawString(pdf._to_pt_x(MARGIN + 4), pdf._to_pt_y(yy), sanitize(attribution))
        pdf.y = y0 + box_h + 4
        pdf.canvas.setLineWidth(1)

    # ---- Boilerplate ----
    if boilerplate:
        pdf.subheading("About " + site_name)
        pdf.paragraph(boilerplate)

    # ---- Media contact ----
    contact_lines = [
        record.get("media_contact_name"), record.get("media_contact_email"), record.get("media_contact_phone"),
    ]
    contact_lines = [c for c in contact_lines if c]
    if contact_lines:
        pdf.subheading("Media Contact")
        for c in contact_lines:
            pdf.paragraph(c)

    # ---- Sources ----
    if sources:
        pdf.subheading("Sources")
        for i, s in enumerate(sources, 1):
            pdf.paragraph(f"[{i}] {s.get('title', s.get('url'))}")
            pdf.link_line(s.get("url", ""), s.get("url", ""))

    # ---- CTA ----
    pdf.y += 6
    cta_url = record.get("cta_url") or "/contact"
    if cta_url.startswith("/") and site_url:
        cta_url = site_url + cta_url
    from reportlab.pdfbase.pdfmetrics import stringWidth
    pdf.canvas.setFont("Helvetica-Bold", 11)
    pdf.canvas.setFillColorRGB(*LINK_BLUE)
    pdf.ensure_space(6)
    pdf.canvas.drawString(pdf._to_pt_x(MARGIN), pdf._to_pt_y(pdf.y + 4), sanitize(cta_url))
    w = stringWidth(sanitize(cta_url), "Helvetica-Bold", 11) / MM
    pdf.link_url(MARGIN, pdf.y, w, 5, cta_url)
    pdf.y += 6

    pdf.save()
    return out_path


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    with open(sys.argv[1], "r", encoding="utf-8") as f:
        record = json.load(f)
    try:
        path = render_press_pdf(record)
        print(f"[press-pdf] Wrote {path}")
    except PDFMissingDependency as err:
        print(f"[press-pdf] {err}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
