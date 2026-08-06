import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.supabase import upsert_row_resilient, SupabaseError  # noqa: E402
from scripts.json_to_tsx import generate_page  # noqa: E402
from scripts.generate_sitemap import generate_sitemap  # noqa: E402
from scripts.generate_rss import generate_rss  # noqa: E402


def publish_post(record):
    """Takes a finished post record (the same shape run_daily_blog produces)
    and:
      1. upserts it into the public `blog_posts` table (by slug, so re-runs
         update rather than duplicate),
      2. generates its static TSX page (SEO tags, breadcrumbs, related links
         baked in),
      3. regenerates sitemap.xml and rss.xml from the current published set.

    Raises SupabaseError if the publish step itself fails — the caller
    (daily_blog.py) already has the draft safely saved locally regardless.
    """
    published_record = dict(record)
    published_record["status"] = "published"
    published_record.pop("_localFile", None)
    published_record.pop("_uploaded", None)

    print(f"[publish] Upserting \"{published_record.get('title')}\" into blog_posts...")
    post, stripped_cols = upsert_row_resilient("blog_posts", published_record, on_conflict="slug")
    if stripped_cols:
        print(f"[publish] NOTE: saved without {stripped_cols} — those columns don't exist on "
              f"blog_posts yet. Run lib/migration_001_seo_columns.sql to stop losing this data.")

    print("[publish] Generating static page...")
    slug, page_path = generate_page(published_record)
    print(f"[publish] Wrote {page_path}")

    print("[publish] Regenerating sitemap.xml and rss.xml...")
    generate_sitemap()
    generate_rss()

    print(f"[publish] Done. Live at slug \"{slug}\".")
    return post
