# Regenerates sitemap.xml from the current published posts in Supabase, plus
# a configurable list of static pages (home, blog index, about, contact,
# services, products — you know your own routes, this repo doesn't).
#
# Google retired the sitemap "ping" endpoint in 2023/2024 — pings to it just
# 404 now. What Google actually uses today is an accurate <lastmod> in the
# sitemap itself as a crawl-priority signal, plus the sitemap being linked
# from robots.txt. That's what this generates; there's no "notify" step
# beyond that (see README for why the Indexing API isn't wired in here).
#
# Usage:
#   python scripts/generate_sitemap.py
#
import os
import sys
from xml.sax.saxutils import escape

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.env import load_env  # noqa: E402

load_env()

from lib.supabase import select_rows, SupabaseError  # noqa: E402

SITE_URL = os.environ.get("SITE_URL", "https://orix-pink.vercel.app").rstrip("/")
OUTPUT_PATH = os.environ.get("SITEMAP_OUTPUT_PATH", os.path.join(os.getcwd(), "generated", "sitemap.xml"))

# Comma-separated "path:changefreq:priority" triples for pages that aren't
# individual blog posts. Edit via STATIC_SITEMAP_PATHS env var to match your
# actual routes (service pages, product pages, etc — this script doesn't
# know your site structure beyond what you tell it).
_default_static = "/:daily:1.0,/blog:daily:0.9,/about:monthly:0.5,/contact:monthly:0.5"
STATIC_PATHS = []
for entry in os.environ.get("STATIC_SITEMAP_PATHS", _default_static).split(","):
    entry = entry.strip()
    if not entry:
        continue
    parts = entry.split(":")
    path = parts[0]
    changefreq = parts[1] if len(parts) > 1 else "monthly"
    priority = parts[2] if len(parts) > 2 else "0.5"
    STATIC_PATHS.append((path, changefreq, priority))


def _url_entry(loc, lastmod=None, changefreq="weekly", priority="0.7"):
    parts = ["  <url>", f"    <loc>{escape(loc)}</loc>"]
    if lastmod:
        parts.append(f"    <lastmod>{escape(lastmod)}</lastmod>")
    parts.append(f"    <changefreq>{changefreq}</changefreq>")
    parts.append(f"    <priority>{priority}</priority>")
    parts.append("  </url>")
    return "\n".join(parts)


def generate_sitemap():
    try:
        posts = select_rows(
            "blog_posts",
            select="slug,updated_at,published_at",
            order="published_at.desc",
        )
    except SupabaseError as err:
        print(f"[sitemap] Couldn't fetch blog_posts ({err}) — sitemap will be missing blog URLs until fixed.")
        posts = []

    entries = []
    for path, changefreq, priority in STATIC_PATHS:
        entries.append(_url_entry(f"{SITE_URL}{path}", changefreq=changefreq, priority=priority))

    for post in posts:
        loc = f"{SITE_URL}/blog/{post['slug']}"
        lastmod = post.get("updated_at") or post.get("published_at")
        entries.append(_url_entry(loc, lastmod=lastmod, changefreq="monthly", priority="0.7"))

    # Case studies live in a separate table (lib/migration_002_case_studies.sql).
    # Fails gracefully (0 entries, no crash) if that migration hasn't been run yet.
    try:
        case_studies = select_rows(
            "case_studies",
            select="slug,updated_at,published_at",
            order="published_at.desc",
        )
    except SupabaseError:
        case_studies = []

    for cs in case_studies:
        loc = f"{SITE_URL}/case-studies/{cs['slug']}"
        lastmod = cs.get("updated_at") or cs.get("published_at")
        entries.append(_url_entry(loc, lastmod=lastmod, changefreq="monthly", priority="0.8"))

    # White papers live in a separate table (lib/migration_003_whitepapers.sql).
    try:
        whitepapers = select_rows(
            "whitepapers",
            select="slug,updated_at,published_at",
            order="published_at.desc",
        )
    except SupabaseError:
        whitepapers = []

    for wp in whitepapers:
        loc = f"{SITE_URL}/whitepapers/{wp['slug']}"
        lastmod = wp.get("updated_at") or wp.get("published_at")
        entries.append(_url_entry(loc, lastmod=lastmod, changefreq="monthly", priority="0.7"))

    # Press releases live in a separate table (lib/migration_004_press.sql).
    try:
        press_releases = select_rows(
            "press_releases",
            select="slug,updated_at,published_at",
            order="published_at.desc",
        )
    except SupabaseError:
        press_releases = []

    for pr in press_releases:
        loc = f"{SITE_URL}/press/{pr['slug']}"
        lastmod = pr.get("updated_at") or pr.get("published_at")
        entries.append(_url_entry(loc, lastmod=lastmod, changefreq="monthly", priority="0.6"))

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(entries)
        + "\n</urlset>\n"
    )

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(xml)

    print(f"[sitemap] Wrote {len(entries)} URL(s) ({len(posts)} post(s) + {len(case_studies)} case "
          f"stud(y/ies) + {len(whitepapers)} whitepaper(s) + {len(press_releases)} press release(s) + "
          f"{len(STATIC_PATHS)} static) to {OUTPUT_PATH}")
    return OUTPUT_PATH


if __name__ == "__main__":
    generate_sitemap()
