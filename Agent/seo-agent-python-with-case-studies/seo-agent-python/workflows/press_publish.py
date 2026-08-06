import os
import sys
import traceback

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.supabase import upsert_row_resilient, SupabaseError  # noqa: E402
from scripts.press_to_tsx import generate_press_page  # noqa: E402
from scripts.press_render import render_press_html  # noqa: E402
from scripts.generate_sitemap import generate_sitemap  # noqa: E402
from scripts.generate_rss import generate_rss  # noqa: E402


def publish_press_release(record):
    published_record = dict(record)
    published_record.pop("status", None)
    published_record.pop("_localFile", None)
    published_record.pop("_uploaded", None)

    print("[press-publish] Generating PDF...")
    pdf_path = None
    try:
        from scripts.press_pdf import render_press_pdf, PDFMissingDependency
        try:
            pdf_path = render_press_pdf(published_record)
            published_record["pdf_generated"] = True
            print(f"[press-publish] Wrote {pdf_path}")
        except PDFMissingDependency as err:
            print(f"[press-publish] {err}")
            published_record["pdf_generated"] = False
    except Exception:  # noqa: BLE001
        print("[press-publish] PDF generation failed unexpectedly — continuing without it.")
        traceback.print_exc()
        published_record["pdf_generated"] = False

    print(f"[press-publish] Upserting \"{published_record.get('headline')}\" into press_releases...")
    post = None
    try:
        post, stripped_cols = upsert_row_resilient("press_releases", published_record, on_conflict="slug")
        if stripped_cols:
            print(f"[press-publish] NOTE: saved without {stripped_cols} — run "
                  f"lib/migration_004_press.sql to stop losing this data.")
    except SupabaseError as err:
        print(f"[press-publish] Supabase upsert failed ({err}) — continuing anyway so TSX/HTML/PDF still "
              f"get generated. Common cause: lib/migration_004_press.sql hasn't been run, or 'permission "
              f"denied for schema public' (see lib/fix_permissions.sql).")

    print("[press-publish] Generating static TSX page...")
    slug = published_record.get("slug", "press-release")
    try:
        slug, tsx_path = generate_press_page(published_record)
        print(f"[press-publish] Wrote {tsx_path}")
    except Exception:  # noqa: BLE001
        print("[press-publish] TSX generation failed — traceback below. HTML/PDF/Supabase unaffected.")
        traceback.print_exc()

    print("[press-publish] Generating standalone HTML page...")
    try:
        html_path = render_press_html(published_record)
        print(f"[press-publish] Wrote {html_path}")
    except Exception:  # noqa: BLE001
        print("[press-publish] HTML generation failed — traceback below. Please paste it back for a fix.")
        traceback.print_exc()

    print("[press-publish] Regenerating sitemap.xml and rss.xml...")
    generate_sitemap()
    generate_rss()

    print(f"[press-publish] Done. Live at slug \"{slug}\".{'  PDF: ' + pdf_path if pdf_path else '  (no PDF)'}")
    return post
