from lib.nvidia import generate_json, FAST_MODEL
from agent.prompt_loader import load_system_prompt, load_knowledge_base


def keyword_research(seed_topic="auto", content_type=None):
    """content_type: optional forced value ("blog"|"tutorial"|"comparison"|
    "landing-page"). If omitted, the model chooses freely (and in practice
    picks "blog" most of the time) — pass this to actually get the other
    templates generated on demand."""
    system = load_system_prompt()
    knowledge = load_knowledge_base()

    if seed_topic == "auto":
        topic_instruction = (
            "Pick one trending, SEO-valuable topic today for HMorix from these content\n"
            "categories: industry news, how-to guides, tutorials, product updates,\n"
            "case studies, creator success stories, SEO tips, AI news, marketing\n"
            "strategies, social media trends, feature announcements, platform\n"
            "comparisons. Choose the category and specific angle yourself."
        )
    else:
        topic_instruction = f'Focus on this topic area: "{seed_topic}".'

    if content_type:
        topic_instruction += (
            f'\nThe content type MUST be "{content_type}" — pick a topic/angle that genuinely '
            f"fits that format, and set \"contentType\" to exactly \"{content_type}\" in your output."
        )

    user_prompt = f"""
{knowledge}

---
{topic_instruction}

Do keyword research for this topic as if you were an SEO strategist.
Since you don't have live Google Trends/Search Console access, give directional
estimates (low/medium/high) rather than fabricated numbers.

Return ONLY JSON in this exact shape:""" + """
{
  "topic": "",
  "primaryKeyword": "",
  "secondaryKeywords": [],
  "longTailKeywords": [],
  "searchIntent": "informational|commercial|navigational|transactional",
  "estimatedDifficulty": "low|medium|high",
  "estimatedVolume": "low|medium|high",
  "targetAudience": "",
  "competitors": [],
  "peopleAlsoAsk": [],
  "contentType": "blog|tutorial|comparison|landing-page"
}"""

    result = generate_json(system, user_prompt, model=FAST_MODEL, temperature=0.8)
    if content_type:
        result["contentType"] = content_type  # enforce it regardless of what the model echoed back
    return result
