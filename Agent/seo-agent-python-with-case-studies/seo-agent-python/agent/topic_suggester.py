import json

from lib.nvidia import generate_json, WRITER_MODEL
from agent.prompt_loader import load_system_prompt, load_knowledge_base


def topic_suggester(existing_posts, ranking_data=None, count=10):
    """existing_posts: [{title, slug, category, keywords}] already published —
    used so suggestions don't repeat ground you've covered.
    ranking_data: optional [{keyword, position}] from workflows/keyword_rankings.py
    — real (not guessed) current SERP positions. When present, the model is told
    to prioritize keywords that are ranking poorly or not at all, since those are
    the ones worth writing more/better content for.
    """
    system = load_system_prompt()
    knowledge = load_knowledge_base()

    existing_summary = json.dumps(
        [{"title": p.get("title"), "category": p.get("category"), "keywords": p.get("keywords")} for p in existing_posts],
        indent=2,
    ) or "[]"

    ranking_note = ""
    if ranking_data:
        weak = [r for r in ranking_data if not r.get("position") or r["position"] > 10]
        strong = [r for r in ranking_data if r.get("position") and r["position"] <= 10]
        ranking_note = f"""
Real current Google ranking data for keywords you're already targeting (from
an actual SERP check, not a guess):
- Ranking poorly or not found in top 30: {json.dumps([r['keyword'] for r in weak])}
- Already ranking in the top 10: {json.dumps([r['keyword'] for r in strong])}

Prioritize new topics/angles that reinforce the weak keywords (more depth,
different search intent, supporting cluster content) over ones that would
just compete with content that's already ranking well.
"""

    user_prompt = f"""
{knowledge}

---
Already-published posts (DO NOT suggest topics that just repeat these):
{existing_summary}
{ranking_note}
Act as an SEO content strategist for this company. Based on the company's
actual products/services/audience above, and general knowledge of how
competitors in this space typically cover these topics, suggest {count} new
blog topic ideas that would realistically help this company rank and attract
its target audience.

For each idea, give a genuinely distinct angle (not just keyword variations of
each other) and be specific about search intent and difficulty. Since there's
no live Google Trends/Search Console access, give directional (low/medium/high)
estimates rather than fabricated numbers.

Return ONLY JSON:""" + """
{
  "suggestions": [
    {
      "title": "working title",
      "targetKeyword": "primary keyword",
      "secondaryKeywords": [],
      "contentType": "blog|tutorial|comparison|landing-page",
      "searchIntent": "informational|commercial|navigational|transactional",
      "estimatedDifficulty": "low|medium|high",
      "rationale": "why this topic, and why now, in 1-2 sentences"
    }
  ]
}"""

    return generate_json(system, user_prompt, model=WRITER_MODEL, temperature=0.8, max_tokens=3000)
