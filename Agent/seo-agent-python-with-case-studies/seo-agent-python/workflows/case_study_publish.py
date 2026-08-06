import os
import sys
import traceback

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.supabase import upsert_row_resilient, SupabaseError  # noqa: E402
from scripts.case_study_to_tsx import generate_case_study_page  # noqa: E402
from scripts.case_study_render import render_case_study_html  # noqa: E402
from scripts.generate_sitemap import generate_sitemap  # noqa: E402
from scripts.generate_rss import generate_rss  # noqa: E402


def publish_case_study(record):
    """Takes a finished case-study record and:
      1. upserts it into the public `case_studies` table (by slug),
      2. generates its static TSX page (for the React app) AND a standalone
         HTML page (for hosting/sharing outside the app),
      3. regenerates sitemap.xml (which includes /case-studies/ routes).

    Raises SupabaseError if the publish step itself fails — the caller
    already has the draft safely saved (locally + in case_study_drafts)
    regardless.
    """
    published_record = dict(record)
    published_record.pop("status", None)
    published_record.pop("_localFile", None)
    published_record.pop("_uploaded", None)

    print(f"[case-study-publish] Upserting \"{published_record.get('title')}\" into case_studies...")
    post = None
    try:
        post, stripped_cols = upsert_row_resilient("case_studies", published_record, on_conflict="slug")
        if stripped_cols:
            print(f"[case-study-publish] NOTE: saved without {stripped_cols} — run "
                  f"lib/migration_002_case_studies.sql to stop losing this data.")
    except SupabaseError as err:
        print(f"[case-study-publish] Supabase upsert failed ({err}) — continuing anyway so the TSX/HTML "
              f"still get generated. Common cause: lib/migration_002_case_studies.sql hasn't been run, or "
              f"'permission denied for schema public' (see lib/fix_permissions.sql). Once fixed, re-run "
              f"publish to get the Supabase row too; the files below don't depend on it.")

    print("[case-study-publish] Generating static TSX page...")
    slug = published_record.get("slug", "case-study")
    try:
        slug, tsx_path = generate_case_study_page(published_record)
        print(f"[case-study-publish] Wrote {tsx_path}")
    except Exception:  # noqa: BLE001
        print("[case-study-publish] TSX generation failed — full traceback below. HTML/Supabase are unaffected.")
        traceback.print_exc()

    print("[case-study-publish] Generating standalone HTML page...")
    try:
        html_path = render_case_study_html(published_record)
        print(f"[case-study-publish] Wrote {html_path}")
    except Exception:  # noqa: BLE001
        print("[case-study-publish] HTML generation failed — full traceback below. If you see this, please "
              "paste this traceback back so it can be fixed for good. TSX/Supabase are unaffected.")
        traceback.print_exc()

    print("[case-study-publish] Regenerating sitemap.xml and rss.xml...")
    generate_sitemap()
    generate_rss()

    print(f"[case-study-publish] Done. Live at slug \"{slug}\".")
    return post
