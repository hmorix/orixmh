import json

from lib.nvidia import generate_json, FAST_MODEL
from agent.prompt_loader import load_system_prompt


def competitor_analysis(keyword_research_output):
    system = load_system_prompt()

    user_prompt = f"""
Topic: {keyword_research_output['topic']}
Primary keyword: {keyword_research_output['primaryKeyword']}
Likely competitors: {json.dumps(keyword_research_output.get('competitors', []))}

Based on general knowledge of how SaaS/AI/marketing content typically covers
this topic (no live scraping available), identify:
- The common angles competitors usually take
- Gaps they usually leave (subtopics rarely covered well)
- A differentiated angle HMorix should take instead

Return ONLY JSON:""" + """
{
  "commonAngles": [],
  "contentGaps": [],
  "recommendedDifferentiator": ""
}"""

    return generate_json(system, user_prompt, model=FAST_MODEL, temperature=0.7)
