from lib.nvidia import generate_json, FAST_MODEL
from agent.prompt_loader import load_system_prompt

PLATFORMS = ["instagram", "linkedin", "facebook", "x", "reddit"]


def generate_social_captions(title, excerpt, url="", category=""):
    """Returns {platform: {title, description, tags: [...]}} for each of
    Instagram/LinkedIn/Facebook/X/Reddit. Grounded only in the title/
    excerpt/category already given — repackages, doesn't invent new claims.
    """
    system = load_system_prompt()

    prompt = f"""
Title: {title}
Summary: {excerpt}
Category: {category}
URL (if any): {url or '(not yet published)'}

Generate social media copy for each platform below, tailored to that
platform's norms. Use ONLY the title/summary/category given — don't invent
new facts, statistics, or claims not present above.

- Instagram: short, engaging caption (1-2 sentences) + relevant hashtags (8-15)
- LinkedIn: professional tone, 2-4 sentences, thought-leadership framing, 3-5 hashtags
- Facebook: conversational, 2-3 sentences, 2-4 hashtags
- X (Twitter): under 280 characters total including hashtags, punchy, 2-4 hashtags
- Reddit: neutral/informative title suitable for a text post (Reddit users
  dislike overt marketing language), no hashtags, 1-2 sentence body

Return ONLY JSON:
{{
  "instagram": {{ "title": "", "description": "", "tags": ["tag1","tag2"] }},
  "linkedin": {{ "title": "", "description": "", "tags": [] }},
  "facebook": {{ "title": "", "description": "", "tags": [] }},
  "x": {{ "title": "", "description": "", "tags": [] }},
  "reddit": {{ "title": "", "description": "", "tags": [] }}
}}"""

    return generate_json(system, prompt, model=FAST_MODEL, temperature=0.7, max_tokens=2048, label="social-captions")
