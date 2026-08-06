# Regenerates rss.xml (RSS 2.0) from the most recent published posts in
# Supabase.
#
# Usage:
#   python scripts/generate_rss.py
#
import os
import sys
from datetime import datetime, timezone
from email.utils import format_datetime
from xml.sax.saxutils import escape

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.env import load_env  # noqa: E402

load_env()

from lib.supabase import select_rows, SupabaseError  # noqa: E402

SITE_URL = os.environ.get("SITE_URL", "https://orix-pink.vercel.app").rstrip("/")
SITE_NAME = os.environ.get("SITE_NAME", "HMorix Blog")
OUTPUT_PATH = os.environ.get("RSS_OUTPUT_PATH", os.path.join(os.getcwd(), "generated", "rss.xml"))
FEED_ITEM_LIMIT = int(os.environ.get("RSS_ITEM_LIMIT", "50"))


def _rfc822(iso_string):
    if not iso_string:
        return format_datetime(datetime.now(timezone.utc))
    try:
        dt = datetime.fromisoformat(iso_string.replace("Z", "+00:00"))
    except ValueError:
        dt = datetime.now(timezone.utc)
    return format_datetime(dt)


def generate_rss():
    try:
        posts = select_rows(
            "blog_posts",
            select="title,slug,excerpt,category,published_at,updated_at,author",
            order="published_at.desc",
            limit=FEED_ITEM_LIMIT,
        )
    except SupabaseError as err:
        print(f"[rss] Couldn't fetch blog_posts ({err}) — feed will be missing blog items until fixed.")
        posts = []

    items = []
    for post in posts:
        link = f"{SITE_URL}/blog/{post['slug']}"
        items.append(
            "  <item>\n"
            f"    <title>{escape(post.get('title') or '')}</title>\n"
            f"    <link>{escape(link)}</link>\n"
            f"    <guid isPermaLink=\"true\">{escape(link)}</guid>\n"
            f"    <description>{escape(post.get('excerpt') or '')}</description>\n"
            f"    <pubDate>{_rfc822(post.get('published_at'))}</pubDate>\n"
            f"    <category>{escape(post.get('category') or '')}</category>\n"
            f"    <author>{escape(post.get('author') or '')}</author>\n"
            "  </item>"
        )

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0">\n'
        "<channel>\n"
        f"  <title>{escape(SITE_NAME)}</title>\n"
        f"  <link>{escape(SITE_URL)}/blog</link>\n"
        f"  <description>{escape(SITE_NAME)} — latest posts</description>\n"
        + "\n".join(items)
        + "\n</channel>\n</rss>\n"
    )

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(xml)

    print(f"[rss] Wrote {len(items)} item(s) to {OUTPUT_PATH}")
    return OUTPUT_PATH


if __name__ == "__main__":
    generate_rss()
