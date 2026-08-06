import json
import os
import time

from lib.supabase import select_rows, select_rows_resilient, SupabaseError

CACHE_DIR = os.environ.get("UPLOADED_CACHE_DIR", os.path.join(os.getcwd(), "generated"))
CACHE_PATH = os.path.join(CACHE_DIR, "uploaded_posts_cache.json")

FULL_SELECT = (
    "id,title,slug,excerpt,content,category,author,author_role,read_time,"
    "seo_title,meta_description,canonical_url,open_graph,twitter_card,breadcrumbs,"
    "keywords,schema_jsonld,social_posts,published_at,updated_at,content_type"
)


def _load_cache():
    if not os.path.exists(CACHE_PATH):
        return {"fetched_at": None, "posts": []}
    try:
        with open(CACHE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return {"fetched_at": None, "posts": []}


def _save_cache(posts):
    os.makedirs(CACHE_DIR, exist_ok=True)
    payload = {"fetched_at": time.time(), "posts": posts}
    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    return payload


def fetch_uploaded_posts(limit=100):
    """Returns (posts, meta) where meta = {from_cache: bool, error: str|None,
    fetched_at: float|None}. Always tries Supabase first (fresh data); only
    falls back to the on-disk cache if that fails, so you can still see your
    uploaded blogs offline or if Supabase is briefly unreachable."""
    try:
        posts, stripped_cols = select_rows_resilient("blog_posts", select=FULL_SELECT, order="published_at.desc", limit=limit)
        if stripped_cols:
            print(f"[uploaded-posts] NOTE: {stripped_cols} don't exist on blog_posts yet — "
                  f"showing without them. Run lib/migration_001_seo_columns.sql to add them.")
        cache = _save_cache(posts)
        return posts, {"from_cache": False, "error": None, "fetched_at": cache["fetched_at"]}
    except SupabaseError as err:
        cache = _load_cache()
        return cache["posts"], {"from_cache": True, "error": str(err), "fetched_at": cache["fetched_at"]}


def get_uploaded_post(slug):
    """Full record for one post — checks the live table first, falls back to
    whatever's cached for that slug if Supabase is unreachable."""
    try:
        rows, _stripped = select_rows_resilient("blog_posts", select=FULL_SELECT, filters={"slug": f"eq.{slug}"}, limit=1)
        return (rows[0] if rows else None), None
    except SupabaseError as err:
        cache = _load_cache()
        for post in cache["posts"]:
            if post.get("slug") == slug:
                return post, str(err)
        return None, str(err)
