import os
import sys
import traceback

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.supabase import upsert_row_resilient, SupabaseError  # noqa: E402
from scripts.whitepaper_to_tsx import generate_whitepaper_page  # noqa: E402
from scripts.whitepaper_render import render_whitepaper_html  # noqa: E402
from scripts.generate_sitemap import generate_sitemap  # noqa: E402
from scripts.generate_rss import generate_rss  # noqa: E402


def publish_whitepaper(record):
    """Upserts into `whitepapers`, generates the TSX + standalone HTML web
    page, attempts the PDF (non-fatal if reportlab isn't installed — everything
    else still gets published), and regenerates sitemap/rss.
    """
    published_record = dict(record)
    published_record.pop("status", None)
    published_record.pop("_localFile", None)
    published_record.pop("_uploaded", None)

    print("[whitepaper-publish] Generating PDF...")
    pdf_path = None
    try:
        from scripts.whitepaper_pdf import render_whitepaper_pdf, PDFMissingDependency
        try:
            pdf_path = render_whitepaper_pdf(published_record)
            published_record["pdf_generated"] = True
            print(f"[whitepaper-publish] Wrote {pdf_path}")
        except PDFMissingDependency as err:
            print(f"[whitepaper-publish] {err}")
            published_record["pdf_generated"] = False
    except Exception as err:  # noqa: BLE001
        print(f"[whitepaper-publish] PDF generation failed unexpectedly ({err}); continuing without it. "
              f"Web page + Supabase record are unaffected.")
        published_record["pdf_generated"] = False

    print(f"[whitepaper-publish] Upserting \"{published_record.get('title')}\" into whitepapers...")
    post = None
    try:
        post, stripped_cols = upsert_row_resilient("whitepapers", published_record, on_conflict="slug")
        if stripped_cols:
            print(f"[whitepaper-publish] NOTE: saved without {stripped_cols} — run "
                  f"lib/migration_003_whitepapers.sql to stop losing this data.")
    except SupabaseError as err:
        print(f"[whitepaper-publish] Supabase upsert failed ({err}) — continuing anyway so the TSX/HTML/PDF "
              f"still get generated. Common cause: lib/migration_003_whitepapers.sql hasn't been run, or "
              f"'permission denied for schema public' (see lib/fix_permissions.sql). Once fixed, re-run "
              f"publish to get the Supabase row too; the files below don't depend on it.")

    print("[whitepaper-publish] Generating static TSX page...")
    slug = published_record.get("slug", "whitepaper")
    try:
        slug, tsx_path = generate_whitepaper_page(published_record)
        print(f"[whitepaper-publish] Wrote {tsx_path}")
    except Exception:  # noqa: BLE001
        print("[whitepaper-publish] TSX generation failed — full traceback below. HTML/PDF/Supabase are unaffected.")
        traceback.print_exc()

    print("[whitepaper-publish] Generating standalone HTML page...")
    try:
        html_path = render_whitepaper_html(published_record)
        print(f"[whitepaper-publish] Wrote {html_path}")
    except Exception:  # noqa: BLE001
        print("[whitepaper-publish] HTML generation failed — full traceback below. If you see this, please "
              "paste this traceback back so it can be fixed for good. TSX/PDF/Supabase are unaffected.")
        traceback.print_exc()

    print("[whitepaper-publish] Regenerating sitemap.xml and rss.xml...")
    generate_sitemap()
    generate_rss()

    print(f"[whitepaper-publish] Done. Live at slug \"{slug}\".{'  PDF: ' + pdf_path if pdf_path else '  (no PDF)'}")
    return post
