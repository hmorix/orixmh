"""Real SERP lookups via Google's official Programmable Search Engine (Custom
Search JSON API) — this is the only way to know an *actual* ranking position;
the AI models used elsewhere in this repo have no live search access and will
just guess if asked directly.

Setup (free tier: 100 queries/day):
  1. https://programmablesearchengine.google.com/ -> Add -> set it to search
     the entire web (turn OFF "Search only included sites").
  2. Copy its Search engine ID -> GOOGLE_CSE_CX in .env
  3. https://console.cloud.google.com/apis/credentials -> Create API key,
     enable the "Custom Search API" for the project -> GOOGLE_CSE_API_KEY in .env

Without those two env vars, rank checks can't run — there's no meaningful
fallback for "what position does my site actually rank at", so callers should
skip/explain rather than fabricate a number.
"""
import json
import os
import urllib.error
import urllib.parse
import urllib.request

from lib.env import load_env

load_env()

API_KEY = os.environ.get("GOOGLE_CSE_API_KEY", "")
CX = os.environ.get("GOOGLE_CSE_CX", "")
ENDPOINT = "https://www.googleapis.com/customsearch/v1"


class GoogleSearchError(Exception):
    pass


def is_configured():
    return bool(API_KEY and CX)


def search(query, num=10, start=1):
    """Returns the raw list of result items (each with 'link', 'title', 'snippet')
    for one page of results. `start` is 1-indexed (Google's convention)."""
    if not is_configured():
        raise GoogleSearchError(
            "GOOGLE_CSE_API_KEY / GOOGLE_CSE_CX not set in .env — see lib/google_search.py "
            "docstring for the 5-minute free setup."
        )
    params = {"key": API_KEY, "cx": CX, "q": query, "num": min(num, 10), "start": start}
    url = f"{ENDPOINT}?{urllib.parse.urlencode(params)}"
    try:
        with urllib.request.urlopen(url, timeout=20) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise GoogleSearchError(f"Google CSE search failed: {exc.code} {body[:300]}") from exc
    return data.get("items", [])


def find_domain_position(query, domain, max_results=30):
    """Searches up to `max_results` (in pages of 10) for `query` and returns the
    1-indexed position of the first result whose URL contains `domain`, or None
    if it doesn't appear in that range."""
    domain = domain.lower().replace("https://", "").replace("http://", "").rstrip("/")
    position = 0
    for start in range(1, max_results + 1, 10):
        items = search(query, num=10, start=start)
        if not items:
            break
        for item in items:
            position += 1
            link = (item.get("link") or "").lower()
            if domain in link:
                return position
    return None
