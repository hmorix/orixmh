"""Shared PDF-building primitives used by scripts/whitepaper_pdf.py and
scripts/press_pdf.py. Extracted here so both content types reuse the same
verified-working reportlab wrapper instead of duplicating it.

Requires reportlab (`pip install reportlab --break-system-packages`).
"""
import os
import re
import tempfile
import urllib.error
import urllib.request

try:
    from reportlab.lib.units import mm as MM
    from reportlab.pdfbase.pdfmetrics import stringWidth
    from reportlab.pdfgen import canvas
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

ACCENT = (200 / 255, 255 / 255, 0 / 255)   # #C8FF00, reportlab wants 0-1 floats
INK = (20 / 255, 20 / 255, 22 / 255)
MUTED = (120 / 255, 120 / 255, 126 / 255)
LINK_BLUE = (30 / 255, 80 / 255, 200 / 255)
FLOW_FILL = (245 / 255, 255 / 255, 200 / 255)

PAGE_W = 210.0   # A4 mm
PAGE_H = 297.0
MARGIN = 20.0
CONTENT_W = PAGE_W - 2 * MARGIN
FOOTER_ZONE = 18.0  # mm reserved at the bottom of every page for the footer


class PDFMissingDependency(Exception):
    pass


def sanitize(text):
    """reportlab's core fonts (Helvetica etc.) use WinAnsi (~cp1252)
    encoding. Common 'smart' punctuation is fine; replace the handful of
    things that aren't (arrows, checkmarks, emoji) instead of letting one
    odd character break the whole render."""
    if not text:
        return ""
    text = str(text)
    replacements = {
        "\u2192": "->", "\u2190": "<-", "\u2194": "<->",
        "\u2713": "[x]", "\u2714": "[x]", "\u2717": "[ ]",
        "\u2022": "-", "\u25cf": "-", "\u25e6": "-",
        "\u00a0": " ",
    }
    for bad, good in replacements.items():
        text = text.replace(bad, good)
    try:
        text.encode("cp1252")
        return text
    except UnicodeEncodeError:
        return text.encode("cp1252", errors="replace").decode("cp1252")


def parse_numeric(value):
    if value is None:
        return None
    match = re.search(r"[-+]?\d[\d,]*\.?\d*", str(value))
    if not match:
        return None
    try:
        return float(match.group().replace(",", ""))
    except ValueError:
        return None


def download_to_temp(url, timeout=15, label="pdf"):
    if not url:
        return None
    if os.path.exists(url):
        return url
    try:
        req = urllib.request.Request(url, headers={"User-Agent": f"Mozilla/5.0 ({label})"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = resp.read()
        ext = os.path.splitext(url.split("?")[0])[1].lower() or ".jpg"
        if ext not in (".jpg", ".jpeg", ".png"):
            ext = ".jpg"
        fd, path = tempfile.mkstemp(suffix=ext)
        with os.fdopen(fd, "wb") as f:
            f.write(data)
        return path
    except (urllib.error.URLError, TimeoutError, OSError, ValueError) as err:
        print(f"[{label}] Couldn't fetch image {url}: {err} — skipping it.")
        return None


def wrap_text(text, font, size, max_width_mm):
    max_width_pt = max_width_mm * MM
    words = sanitize(text).split(" ")
    lines = []
    cur = ""
    for w in words:
        trial = (cur + " " + w).strip()
        if stringWidth(trial, font, size) <= max_width_pt or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines or [""]


def first_list_block(content_blocks, after_heading):
    """Finds the first bullet list appearing after a heading whose text
    contains `after_heading` (case-insensitive substring match). Used to
    turn an already-written, already-vetted bullet list into a native
    flow diagram instead of inventing new diagram content."""
    found_heading = False
    for block in content_blocks:
        if block.get("type") == "heading" and after_heading.lower() in (block.get("text") or "").lower():
            found_heading = True
            continue
        if found_heading and block.get("type") == "list":
            return block.get("items", [])
        if found_heading and block.get("type") == "heading":
            break
    return []


class PDFBuilder:
    """Top-down mm coordinate system (like a word processor) wrapped around
    reportlab's bottom-up point-based canvas, with automatic page breaks
    and a running footer."""

    def __init__(self, path, site_name):
        self.site_name = site_name
        self.canvas = canvas.Canvas(path, pagesize=(PAGE_W * MM, PAGE_H * MM))
        self.canvas.setTitle(site_name)
        self.y = 0.0
        self.page_num = 0
        self._bookmark_counter = 0
        self._skip_footer_this_page = False
        self._new_page(is_first=True)

    def _to_pt_x(self, x_mm):
        return x_mm * MM

    def _to_pt_y(self, y_mm):
        return (PAGE_H - y_mm) * MM

    def _new_page(self, is_first=False):
        if not is_first:
            if not self._skip_footer_this_page:
                self._draw_footer()
            self.canvas.showPage()
        self.page_num += 1
        self.y = MARGIN
        self._skip_footer_this_page = False

    def _draw_footer(self):
        self.canvas.setFont("Helvetica", 8)
        self.canvas.setFillColorRGB(*MUTED)
        self.canvas.drawString(self._to_pt_x(MARGIN), self._to_pt_y(PAGE_H - 12), sanitize(self.site_name))
        self.canvas.drawRightString(
            self._to_pt_x(PAGE_W - MARGIN), self._to_pt_y(PAGE_H - 12), f"Page {self.page_num}"
        )

    def ensure_space(self, needed_mm):
        if self.y + needed_mm > PAGE_H - FOOTER_ZONE:
            self._new_page()

    def link_to_bookmark(self, x_mm, y_mm, w_mm, h_mm, bookmark_name):
        rect = (self._to_pt_x(x_mm), self._to_pt_y(y_mm + h_mm), self._to_pt_x(x_mm + w_mm), self._to_pt_y(y_mm))
        self.canvas.linkRect("", bookmark_name, rect, relative=0, thickness=0)

    def link_url(self, x_mm, y_mm, w_mm, h_mm, url):
        rect = (self._to_pt_x(x_mm), self._to_pt_y(y_mm + h_mm), self._to_pt_x(x_mm + w_mm), self._to_pt_y(y_mm))
        self.canvas.linkURL(url, rect, relative=0)

    # ---- content primitives ----
    def heading(self, text, size=15, top_space=4):
        self.ensure_space(top_space + size * 0.5 + 4)
        self.y += top_space
        self.canvas.setFont("Helvetica-Bold", size)
        self.canvas.setFillColorRGB(*INK)
        line_h = size * 0.5
        for line in wrap_text(text, "Helvetica-Bold", size, CONTENT_W):
            self.ensure_space(line_h)
            self.canvas.drawString(self._to_pt_x(MARGIN), self._to_pt_y(self.y + size * 0.35), line)
            self.y += line_h
        self.y += 3

    def subheading(self, text):
        self.ensure_space(10)
        self.canvas.setFont("Helvetica-Bold", 12)
        self.canvas.setFillColorRGB(*INK)
        for line in wrap_text(text, "Helvetica-Bold", 12, CONTENT_W):
            self.ensure_space(6.5)
            self.canvas.drawString(self._to_pt_x(MARGIN), self._to_pt_y(self.y + 4.5), line)
            self.y += 6.5
        self.y += 2

    def paragraph(self, text):
        self.canvas.setFont("Helvetica", 10.5)
        self.canvas.setFillColorRGB(*INK)
        for line in wrap_text(text, "Helvetica", 10.5, CONTENT_W):
            self.ensure_space(5.6)
            self.canvas.drawString(self._to_pt_x(MARGIN), self._to_pt_y(self.y + 4), line)
            self.y += 5.6
        self.y += 2.5

    def bullet_list(self, items):
        self.canvas.setFont("Helvetica", 10.5)
        self.canvas.setFillColorRGB(*INK)
        for item in items:
            wrapped = wrap_text("- " + (item or ""), "Helvetica", 10.5, CONTENT_W - 4)
            for i, line in enumerate(wrapped):
                self.ensure_space(5.6)
                self.canvas.drawString(self._to_pt_x(MARGIN + (4 if i else 0)), self._to_pt_y(self.y + 4), line)
                self.y += 5.6
        self.y += 2.5

    def table(self, headers, rows, title=None):
        if not headers:
            return
        if title:
            self.subheading(title)
        col_w = CONTENT_W / len(headers)
        self.ensure_space(9)
        y0 = self.y
        self.canvas.setFillColorRGB(*ACCENT)
        self.canvas.rect(self._to_pt_x(MARGIN), self._to_pt_y(y0 + 8), CONTENT_W * MM, 8 * MM, fill=1, stroke=0)
        self.canvas.setFont("Helvetica-Bold", 9.5)
        self.canvas.setFillColorRGB(*INK)
        for i, h in enumerate(headers):
            self.canvas.drawString(self._to_pt_x(MARGIN + i * col_w + 2), self._to_pt_y(y0 + 5.5), sanitize(str(h)))
        self.y += 8
        self.canvas.setFont("Helvetica", 9.5)
        for row in rows:
            wrapped_cells = [wrap_text(str(c), "Helvetica", 9.5, col_w - 4) for c in row]
            row_lines = max((len(w) for w in wrapped_cells), default=1)
            row_h = 5.2 * row_lines + 2
            self.ensure_space(row_h)
            y0 = self.y
            self.canvas.setStrokeColorRGB(*INK)
            self.canvas.rect(self._to_pt_x(MARGIN), self._to_pt_y(y0 + row_h), CONTENT_W * MM, row_h * MM, fill=0, stroke=1)
            for i, cell_lines in enumerate(wrapped_cells):
                cy = y0 + 4.5
                for line in cell_lines:
                    self.canvas.drawString(self._to_pt_x(MARGIN + i * col_w + 2), self._to_pt_y(cy), line)
                    cy += 5.2
            self.y += row_h
        self.y += 4

    def bar_chart(self, stats, title="By The Numbers"):
        plottable = [(s, parse_numeric(s.get("value"))) for s in stats]
        plottable = [(s, v) for s, v in plottable if v is not None]
        if not plottable:
            return
        self.heading(title, size=15)
        max_val = max(v for _, v in plottable) or 1
        bar_area_w = CONTENT_W - 55
        row_h = 14
        for stat, val in plottable:
            self.ensure_space(row_h)
            y0 = self.y
            self.canvas.setFont("Helvetica", 9)
            self.canvas.setFillColorRGB(*INK)
            for i, line in enumerate(wrap_text(stat.get("label", ""), "Helvetica", 9, 48)):
                self.canvas.drawString(self._to_pt_x(MARGIN), self._to_pt_y(y0 + 5 + i * 4.5), line)
            bar_w = max(2, (val / max_val) * bar_area_w)
            self.canvas.setFillColorRGB(*ACCENT)
            self.canvas.rect(self._to_pt_x(MARGIN + 52), self._to_pt_y(y0 + row_h - 3), bar_w * MM, (row_h - 6) * MM, fill=1, stroke=0)
            self.canvas.setFont("Helvetica-Bold", 9.5)
            self.canvas.setFillColorRGB(*INK)
            self.canvas.drawString(self._to_pt_x(MARGIN + 54 + bar_w), self._to_pt_y(y0 + 8), sanitize(str(stat.get("value", ""))))
            self.y += row_h
        self.y += 2
        self.canvas.setFont("Helvetica-Oblique", 8)
        self.canvas.setFillColorRGB(*MUTED)
        for stat in stats:
            if stat.get("source"):
                for line in wrap_text(f"Source: {stat.get('label')} - {stat.get('source')}", "Helvetica-Oblique", 8, CONTENT_W):
                    self.ensure_space(4.5)
                    self.canvas.drawString(self._to_pt_x(MARGIN), self._to_pt_y(self.y + 3), line)
                    self.y += 4.5
        self.y += 3

    def flow_diagram(self, steps, title="Process Overview"):
        if not steps:
            return
        self.heading(title, size=15)
        box_h = 12.0
        gap = 6.0
        for i, step in enumerate(steps):
            wrapped = wrap_text(f"{i + 1}. {step}", "Helvetica", 9.5, CONTENT_W - 6)
            this_box_h = max(box_h, 4 + len(wrapped) * 4.5)
            self.ensure_space(this_box_h + gap)
            y0 = self.y
            self.canvas.setFillColorRGB(*FLOW_FILL)
            self.canvas.setStrokeColorRGB(*INK)
            self.canvas.rect(self._to_pt_x(MARGIN), self._to_pt_y(y0 + this_box_h), CONTENT_W * MM, this_box_h * MM, fill=1, stroke=1)
            self.canvas.setFont("Helvetica", 9.5)
            self.canvas.setFillColorRGB(*INK)
            for j, line in enumerate(wrapped):
                self.canvas.drawString(self._to_pt_x(MARGIN + 3), self._to_pt_y(y0 + 5 + j * 4.5), line)
            self.y += this_box_h
            if i < len(steps) - 1:
                arrow_x = MARGIN + CONTENT_W / 2
                self.canvas.setStrokeColorRGB(*INK)
                self.canvas.line(self._to_pt_x(arrow_x), self._to_pt_y(self.y + 1), self._to_pt_x(arrow_x), self._to_pt_y(self.y + gap - 1))
                self.y += gap
        self.y += 3

    def image(self, path, max_h_mm=70, label="pdf"):
        try:
            from reportlab.lib.utils import ImageReader
            img = ImageReader(path)
            iw, ih = img.getSize()
            ratio = (ih / iw) if iw else 0.5
            h_mm = min(max_h_mm, CONTENT_W * ratio)
            w_mm = (h_mm / ratio) if ratio else CONTENT_W
            w_mm = min(w_mm, CONTENT_W)
            self.ensure_space(h_mm)
            self.canvas.drawImage(
                img, self._to_pt_x(MARGIN), self._to_pt_y(self.y + h_mm), width=w_mm * MM, height=h_mm * MM,
                preserveAspectRatio=True, mask="auto",
            )
            self.y += h_mm + 3
            return True
        except Exception as err:  # noqa: BLE001
            print(f"[{label}] Couldn't embed image {path}: {err}")
            return False

    def link_line(self, text, url):
        self.canvas.setFont("Helvetica", 10)
        self.canvas.setFillColorRGB(*LINK_BLUE)
        for line in wrap_text(text, "Helvetica", 10, CONTENT_W):
            self.ensure_space(5.5)
            y0 = self.y
            self.canvas.drawString(self._to_pt_x(MARGIN), self._to_pt_y(y0 + 4), line)
            w = stringWidth(line, "Helvetica", 10) / MM
            if url:
                self.link_url(MARGIN, y0, w, 5, url)
            self.y += 5.5
        self.y += 1.5
        self.canvas.setFillColorRGB(*INK)

    def save(self):
        self._new_page()  # flushes final footer + showPage
        self.canvas.save()
