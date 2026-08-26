import os

from lib.nvidia import generate_json, FAST_MODEL
from agent.prompt_loader import load_system_prompt


def press_seo(draft, press_input):
    system = load_system_prompt()
    site_url = os.environ.get("SITE_URL", "https://hmorix.in")

    user_prompt = f"""
Headline: {draft['headline']}
Slug: {draft['slug']}
Excerpt: {draft['excerpt']}
Category: {press_input.get('category')}
Site base URL: {site_url}

Generate SEO metadata for this press release page.
- SEO title under 60 characters.
- Meta description under 160 characters, no fabricated claims.
- canonicalUrl must use the /press/ path.

Return ONLY JSON:
{{
  "seoTitle": "",
  "metaDescription": "",
  "slug": "",
  "canonicalUrl": "{site_url}/press/<slug>",
  "openGraph": {{ "title": "", "description": "", "type": "article" }},
  "twitterCard": {{ "card": "summary_large_image", "title": "", "description": "" }},
  "breadcrumbs": [{{ "name": "Press", "url": "/press" }}, {{ "name": "", "url": "" }}],
  "seoScore": 0
}}"""

    return generate_json(system, user_prompt, model=FAST_MODEL, temperature=0.4, max_tokens=1024, label="press-seo")
