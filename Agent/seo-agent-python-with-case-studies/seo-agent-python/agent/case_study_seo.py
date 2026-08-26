import json
import os

from lib.nvidia import generate_json, FAST_MODEL
from agent.prompt_loader import load_system_prompt


def case_study_seo(draft, case_input):
    system = load_system_prompt()
    site_url = os.environ.get("SITE_URL", "https://hmorix.in")

    user_prompt = f"""
Title: {draft['title']}
Slug: {draft['slug']}
Excerpt: {draft['excerpt']}
Client (may be a placeholder): {case_input.get('client_name')}
Industry: {case_input.get('industry')}
Service used: {case_input.get('service_used')}
Site base URL: {site_url}

Generate SEO metadata for this case study page following these rules:
- SEO title under 60 characters. If client_name is a bracketed placeholder,
  do not invent a real name for the title — keep it generic/illustrative.
- Meta description under 160 characters, no fabricated statistics.
- Slug: lowercase, hyphenated, no stop words.
- canonicalUrl must use the /case-studies/ path, not /blog/.

Return ONLY JSON:
{{
  "seoTitle": "",
  "metaDescription": "",
  "slug": "",
  "canonicalUrl": "{site_url}/case-studies/<slug>",
  "openGraph": {{ "title": "", "description": "", "type": "article" }},
  "twitterCard": {{ "card": "summary_large_image", "title": "", "description": "" }},
  "breadcrumbs": [{{ "name": "Case Studies", "url": "/case-studies" }}, {{ "name": "", "url": "" }}],
  "seoScore": 0,
  "seoScoreNotes": []
}}"""

    return generate_json(system, user_prompt, model=FAST_MODEL, temperature=0.4, label="case-study-seo")
