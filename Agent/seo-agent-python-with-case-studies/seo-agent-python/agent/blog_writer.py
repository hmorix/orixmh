import json

from lib.nvidia import generate_json, WRITER_MODEL
from agent.prompt_loader import load_system_prompt, load_knowledge_base


def blog_writer(plan_output, keyword_research_output):
    system = load_system_prompt()
    knowledge = load_knowledge_base()

    user_prompt = f"""
{knowledge}

---
Write the full article now, following this outline exactly:

H1: {plan_output['h1']}
Outline: {json.dumps(plan_output.get('outline', []), indent=2)}
FAQ questions to answer: {json.dumps(plan_output.get('faqQuestions', []))}
Target word count: {plan_output.get('estimatedWordCount')} (2000-3500 range)
Primary keyword: {keyword_research_output['primaryKeyword']}
Secondary keywords to weave in naturally: {json.dumps(keyword_research_output.get('secondaryKeywords', []))}

Rules:
- Use ONLY facts present in the knowledge base above for anything specific to
  HMorix. If you need a supporting fact you don't have, either state it as a
  general industry point with no fabricated specifics, or write
  [UNVERIFIED: <claim>] inline so it gets caught by the fact-checker step.
- Include a short intro table of contents block if the outline has 5+ sections.
- Include at least one markdown table if the outline calls for a comparison.
- Include the FAQ section as its own set of blocks near the end.
- End with a "Key takeaways" block and a one-line CTA tied to a real HMorix
  product from the knowledge base.

Return ONLY JSON in this exact shape:""" + """
{
  "title": "",
  "slug": "url-friendly-slug",
  "excerpt": "one to two sentence summary",
  "category": "",
  "readTime": "e.g. 9 min read",
  "content": [
    { "type": "paragraph", "text": "" },
    { "type": "heading", "level": 2, "text": "" },
    { "type": "heading", "level": 3, "text": "" },
    { "type": "table", "headers": [], "rows": [[]] },
    { "type": "code", "language": "", "text": "" },
    { "type": "list", "items": [] }
  ]
}"""

    return generate_json(
        system,
        user_prompt,
        model=WRITER_MODEL,
        temperature=0.75,
        max_tokens=8192,
        label="blog-writer",
    )
