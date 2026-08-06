import json
import os
from datetime import datetime, timezone

from lib.google_search import find_domain_position, is_configured, GoogleSearchError
from lib.supabase import select_rows, SupabaseError

OUTPUT_PATH = os.environ.get(
    "KEYWORD_RANKINGS_OUTPUT_PATH", os.path.join(os.getcwd(), "generated", "keyword_rankings.json")
)


def _site_domain():
    site_url = os.environ.get("SITE_URL", "")
    return site_url.replace("https://", "").replace("http://", "").rstrip("/")


def _collect_keywords_from_published_posts(limit=100):
    """Pulls the keyword lists off your already-published posts, so you don't
    have to retype them — this is what you're already trying to rank for."""
    try:
        posts = select_rows("blog_posts", select="title,slug,keywords", order="published_at.desc", limit=limit)
    except SupabaseError as err:
        print(f"[keyword-rankings] Couldn't fetch published posts ({err}); pass keywords manually instead.")
        return []
    seen = set()
    keywords = []
    for post in posts:
        for kw in post.get("keywords") or []:
            if kw and kw.lower() not in seen:
                seen.add(kw.lower())
                keywords.append(kw)
    return keywords


def run_keyword_rankings(keywords=None, max_results=30):
    """Checks the real current Google position of your site (SITE_URL) for
    each keyword. Requires GOOGLE_CSE_API_KEY/GOOGLE_CSE_CX (see
    lib/google_search.py) — without it, the AI agent has no live search
    access and any "ranking" it gave you would be a guess, not a fact.
    """
    if not is_configured():
        print("[keyword-rankings] GOOGLE_CSE_API_KEY / GOOGLE_CSE_CX are not set in .env.")
        print("[keyword-rankings] See lib/google_search.py for the 5-minute free setup (100 queries/day).")
        return []

    domain = _site_domain()
    if not domain:
        print("[keyword-rankings] SITE_URL isn't set in .env — can't tell which domain to look for in results.")
        return []

    if not keywords:
        keywords = _collect_keywords_from_published_posts()
    if not keywords:
        print("[keyword-rankings] No keywords found on published posts and none were passed in. Nothing to check.")
        return []

    print(f"[keyword-rankings] Checking {len(keywords)} keyword(s) against {domain} (top {max_results} results each)...")
    results = []
    for kw in keywords:
        try:
            position = find_domain_position(kw, domain, max_results=max_results)
        except GoogleSearchError as err:
            print(f"[keyword-rankings]   \"{kw}\": lookup failed ({err})")
            continue
        status = f"#{position}" if position else f"not in top {max_results}"
        print(f"[keyword-rankings]   \"{kw}\": {status}")
        results.append({"keyword": kw, "position": position, "checked_at": datetime.now(timezone.utc).isoformat()})

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"[keyword-rankings] Saved results to {OUTPUT_PATH}")
    return results
