import json

from lib.nvidia import generate_json, FAST_MODEL
from agent.prompt_loader import load_system_prompt, load_template


def blog_planner(keyword_research_output, competitor_analysis_output):
    system = load_system_prompt()
    content_type = keyword_research_output.get("contentType") or "blog"
    template = load_template(content_type)

    user_prompt = f"""
Topic: {keyword_research_output['topic']}
Primary keyword: {keyword_research_output['primaryKeyword']}
Secondary keywords: {json.dumps(keyword_research_output.get('secondaryKeywords', []))}
Search intent: {keyword_research_output.get('searchIntent')}
Recommended differentiator: {competitor_analysis_output.get('recommendedDifferentiator')}
Content gaps to fill: {json.dumps(competitor_analysis_output.get('contentGaps', []))}
People Also Ask: {json.dumps(keyword_research_output.get('peopleAlsoAsk', []))}

Follow this structural template:
---
{template}
---

Produce a full H1 + H2/H3 outline for a 2000-3500 word article. The primary
keyword must appear in the H1 and be positioned to naturally open the first
paragraph. Mark where a table, code block, or FAQ section belongs.

Return ONLY JSON:
{{
  "h1": "",
  "outline": [
    {{ "level": "h2", "text": "", "notes": "what this section should cover" }},
    {{ "level": "h3", "text": "", "notes": "" }}
  ],
  "contentType": "{content_type}",
  "estimatedWordCount": 2500,
  "faqQuestions": []
}}"""

    return generate_json(system, user_prompt, model=FAST_MODEL, temperature=0.7)
