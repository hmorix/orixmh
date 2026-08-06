import json

from lib.nvidia import generate_json, FAST_MODEL
from agent.prompt_loader import load_system_prompt, load_knowledge_base


def fact_checker(draft):
    system = load_system_prompt()
    knowledge = load_knowledge_base()

    user_prompt = f"""
{knowledge}

---
Review this draft content for factual accuracy against the knowledge base above.

Draft content blocks:
{json.dumps(draft.get('content', []), indent=2)}

Rules:
- Never invent statistics, dates, or company claims — check every specific
  number, date, and named claim against the knowledge base.
- Any claim not traceable to the knowledge base must be flagged as
  [UNVERIFIED: <claim>] inline in the returned content, not silently deleted.
- If a claim is clearly wrong given the knowledge base, correct it using the
  knowledge base facts.

Return ONLY JSON:""" + """
{
  "cleanedContent": [ /* same shape as input content blocks, with fixes/flags applied */ ],
  "flaggedClaims": ["plain-language list of anything a human should double-check before publish"]
}"""

    return generate_json(system, user_prompt, model=FAST_MODEL, temperature=0.3, max_tokens=8192)
