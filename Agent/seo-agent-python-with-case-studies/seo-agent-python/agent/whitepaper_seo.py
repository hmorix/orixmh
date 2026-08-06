import os

from lib.nvidia import generate_json, FAST_MODEL
from agent.prompt_loader import load_system_prompt


def whitepaper_seo(draft, wp_input):
    system = load_system_prompt()
    site_url = os.environ.get("SITE_URL", "https://orix-pink.vercel.app")

    user_prompt = f"""
Title: {draft['title']}
Slug: {draft['slug']}
Excerpt: {draft['excerpt']}
Topic: {wp_input.get('topic')}
Target audience: {wp_input.get('target_audience')}
Site base URL: {site_url}

Generate SEO metadata for this white paper's landing page.
- SEO title under 60 characters, no fabricated statistics.
- Meta description under 160 characters.
- Slug: lowercase, hyphenated, no stop words.
- canonicalUrl must use the /whitepapers/ path.

Return ONLY JSON:
{{
  "seoTitle": "",
  "metaDescription": "",
  "slug": "",
  "canonicalUrl": "{site_url}/whitepapers/<slug>",
  "openGraph": {{ "title": "", "description": "", "type": "article" }},
  "twitterCard": {{ "card": "summary_large_image", "title": "", "description": "" }},
  "breadcrumbs": [{{ "name": "White Papers", "url": "/whitepapers" }}, {{ "name": "", "url": "" }}],
  "seoScore": 0
}}"""

    return generate_json(system, user_prompt, model=FAST_MODEL, temperature=0.4, max_tokens=1024, label="whitepaper-seo")
