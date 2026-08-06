import json
import os

from lib.env import load_env

load_env()

from lib.nvidia import generate_json, FAST_MODEL
from agent.prompt_loader import load_system_prompt


def seo_optimizer(draft, keyword_research_output):
    system = load_system_prompt()
    site_url = os.environ.get("SITE_URL", "https://orix-pink.vercel.app")

    user_prompt = f"""
Title: {draft['title']}
Slug: {draft['slug']}
Excerpt: {draft['excerpt']}
Primary keyword: {keyword_research_output['primaryKeyword']}
Secondary keywords: {json.dumps(keyword_research_output.get('secondaryKeywords', []))}
Site base URL: {site_url}

Generate SEO metadata following these rules:
- SEO title under 60 characters, primary keyword near the front
- Meta description under 160 characters, includes primary keyword
- Slug: lowercase, hyphenated, no stop words
- Score the draft 0-100 against: keyword placement, meta length, heading
  structure, presence of FAQ/table/internal-external link opportunities

Return ONLY JSON:
{{
  "seoTitle": "",
  "metaDescription": "",
  "slug": "",
  "canonicalUrl": "{site_url}/blog/<slug>",
  "openGraph": {{ "title": "", "description": "", "type": "article" }},
  "twitterCard": {{ "card": "summary_large_image", "title": "", "description": "" }},
  "breadcrumbs": [{{ "name": "Blog", "url": "/blog" }}, {{ "name": "", "url": "" }}],
  "seoScore": 0,
  "seoScoreNotes": []
}}"""

    return generate_json(system, user_prompt, model=FAST_MODEL, temperature=0.4)
