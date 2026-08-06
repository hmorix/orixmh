import json

from lib.nvidia import generate_json, FAST_MODEL
from agent.prompt_loader import load_system_prompt, load_knowledge_base
from lib.util import iso_now


def update_existing_blog(existing_post):
    system = load_system_prompt()
    knowledge = load_knowledge_base()

    user_prompt = f"""
{knowledge}

---
Existing post title: {existing_post['title']}
Published: {existing_post.get('published_at')}
Current date: {iso_now()}
Existing content blocks: {json.dumps(existing_post.get('content', []), indent=2)}

Review this post for staleness:
1. Flag statements referencing dates/versions/"current" claims that may now
   be outdated (flag only — don't assume wrong without evidence).
2. Suggest replacement copy for flagged sections using the current knowledge base.
3. Suggest 1-2 new sections if the topic has meaningfully evolved.
4. Suggest refreshed SEO title/meta description if warranted.

Return ONLY JSON:""" + """
{
  "flaggedSections": [{ "originalText": "", "reason": "" }],
  "suggestedReplacements": [{ "originalText": "", "newText": "" }],
  "newSections": [{ "heading": "", "content": "" }],
  "refreshedMetadata": { "seoTitle": "", "metaDescription": "" }
}"""

    return generate_json(system, user_prompt, model=FAST_MODEL, temperature=0.5, max_tokens=6000)
