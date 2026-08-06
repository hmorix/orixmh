import os

from lib.nvidia import generate_json, WRITER_MODEL
from agent.prompt_loader import load_system_prompt, load_knowledge_base

BRAND_NAME = os.environ.get("BRAND_NAME", "HMorix")
BRAND_VARIANTS = [v.strip() for v in os.environ.get("BRAND_NAME_VARIANTS", "").split(",") if v.strip()]
FOUNDER_NAME = os.environ.get("FOUNDER_NAME", "")
FOUNDER_ROLES = [r.strip() for r in os.environ.get("FOUNDER_ROLES", "CEO,Founder").split(",") if r.strip()]


def _brand_prompt():
    variant_line = f" and its similar-sounding variants ({', '.join(BRAND_VARIANTS)})" if BRAND_VARIANTS else ""
    role_combos = ", ".join(f'"{r} {BRAND_NAME}"' for r in FOUNDER_ROLES) if FOUNDER_NAME else ""
    founder_line = (
        f'\nAlso target searches for the founder by name: "{FOUNDER_NAME}", and role+brand combos like '
        f'{role_combos}, "who owns {BRAND_NAME}", "who founded {BRAND_NAME}". The goal: when someone '
        f'searches the founder\'s name or one of these combos, official {BRAND_NAME} content should be '
        f"what shows up, not silence or unrelated results."
        if FOUNDER_NAME else ""
    )
    return f"""
Generate 5 blog topic ideas whose entire purpose is ranking {BRAND_NAME}'s own brand{variant_line} on
Google — the target audience is people who already typed "{BRAND_NAME}" (or a close variant) into a
search bar and need to land on real, official content instead of nothing.{founder_line}

Good angles: "What is {BRAND_NAME}? A complete guide", company story/origin, founder Q&A / bio piece,
"{BRAND_NAME} vs [generic category] platforms — how to choose", customer FAQ, brand glossary. These are
About-Us / brand-authority content, not generic industry posts — every title should contain the brand
or founder name itself.
"""


def _product_prompt():
    return """
Generate 5 blog topic ideas about the actual product/service from the company knowledge base above:
what it does, how it helps, specific use cases, why someone would purchase/subscribe, feature deep-dives,
ROI/outcomes, and comparisons to doing things manually or with generic tools. These should read like
genuine buyer-education content, not thin advertising — real specifics, not hype.
"""


def _trending_prompt():
    return """
Generate 5 blog topic ideas on trending/timely topics in this company's broader industry (not about the
brand itself) — the kind of thing someone in this space would search for right now. Since there's no live
trends feed, use your best current knowledge of the space and flag anything time-sensitive as such.
"""


def _schema_note():
    return """
Return ONLY JSON in this exact shape:
{
  "ideas": [
    {
      "title": "",
      "targetKeyword": "",
      "contentType": "blog|tutorial|comparison|landing-page",
      "searchIntent": "informational|commercial|navigational|transactional",
      "rationale": "1-2 sentences"
    }
  ]
}"""


def _generate_category(category_prompt, count, category_label):
    system = load_system_prompt()
    knowledge = load_knowledge_base()
    user_prompt = f"{knowledge}\n---\n{category_prompt}\n{_schema_note()}"
    result = generate_json(system, user_prompt, model=WRITER_MODEL, temperature=0.85, max_tokens=2000)
    ideas = result.get("ideas", [])[:count]
    for idea in ideas:
        idea["category"] = category_label
    return ideas


def generate_daily_topic_pool(brand_count=5, product_count=5, trending_count=5):
    """Returns a flat list of {..., "category": "brand"|"product"|"trending"}
    — 15 ideas by default, grounded in the brand/founder identity and company
    knowledge base rather than generic topics."""
    pool = []
    pool += _generate_category(_brand_prompt(), brand_count, "brand")
    pool += _generate_category(_product_prompt(), product_count, "product")
    pool += _generate_category(_trending_prompt(), trending_count, "trending")
    return pool
