import json
import os
from datetime import datetime, timezone

from lib.supabase import select_rows, SupabaseError
from agent.keyword_research import keyword_research
from agent.competitor_analysis import competitor_analysis
from agent.topic_suggester import topic_suggester

OUTPUT_PATH = os.environ.get(
    "TOPIC_SUGGESTIONS_OUTPUT_PATH", os.path.join(os.getcwd(), "generated", "topic_suggestions.json")
)
RANKINGS_PATH = os.environ.get(
    "KEYWORD_RANKINGS_OUTPUT_PATH", os.path.join(os.getcwd(), "generated", "keyword_rankings.json")
)


def _load_existing_posts(limit=100):
    try:
        return select_rows("blog_posts", select="title,slug,category,keywords", order="published_at.desc", limit=limit)
    except SupabaseError as err:
        print(f"[topic-suggestions] Couldn't fetch published posts ({err}); suggestions may repeat topics you've already covered.")
        return []


def _load_ranking_data():
    if not os.path.exists(RANKINGS_PATH):
        return None
    try:
        with open(RANKINGS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data or None
    except (json.JSONDecodeError, OSError):
        return None


def run_topic_suggestions(count=10, seed_topic="auto"):
    print("[topic-suggestions] Pulling your published posts for context...")
    existing_posts = _load_existing_posts()

    ranking_data = _load_ranking_data()
    if ranking_data:
        print(f"[topic-suggestions] Found real ranking data for {len(ranking_data)} keyword(s) — using it to prioritize.")
    else:
        print("[topic-suggestions] No keyword_rankings.json found — run `python index.py --check-rankings` first "
              "if you want suggestions weighted by real ranking gaps rather than just competitor/company context.")

    print("[topic-suggestions] Running one competitor-landscape pass for context...")
    seed_keywords = keyword_research(seed_topic)
    competitors = competitor_analysis(seed_keywords)

    print(f"[topic-suggestions] Generating {count} topic suggestions...")
    result = topic_suggester(existing_posts, ranking_data=ranking_data, count=count)
    suggestions = result.get("suggestions", [])

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "based_on_published_count": len(existing_posts),
        "used_ranking_data": bool(ranking_data),
        "competitor_context": competitors,
        "suggestions": suggestions,
    }
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    print(f"\n[topic-suggestions] {len(suggestions)} idea(s) — also saved to {OUTPUT_PATH}\n")
    for i, s in enumerate(suggestions, 1):
        print(f"{i}. {s.get('title')}")
        print(f"   keyword: {s.get('targetKeyword')}  |  type: {s.get('contentType')}  |  "
              f"intent: {s.get('searchIntent')}  |  difficulty: {s.get('estimatedDifficulty')}")
        print(f"   why: {s.get('rationale')}")
        print(f"   -> to write this one: python index.py --now --topic \"{s.get('title')}\" --type {s.get('contentType', 'blog')}")
        print()

    return payload
