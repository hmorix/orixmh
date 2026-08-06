import json

from lib.nvidia import generate_json, FAST_MODEL
from agent.prompt_loader import load_system_prompt
from lib.util import iso_now


def schema_generator(draft, seo, plan_output):
    system = load_system_prompt()

    faq_pairs = [{"question": q} for q in (plan_output.get("faqQuestions") or [])]

    user_prompt = f"""
Title: {draft['title']}
Slug: {draft['slug']}
Excerpt: {draft['excerpt']}
Author: HMorix AI
Published date: {iso_now()}
Canonical URL: {seo['canonicalUrl']}
FAQ questions to structure (answers should be pulled from the article content
you were given, keep them concise): {json.dumps(faq_pairs)}

Generate valid Schema.org JSON-LD combining BlogPosting, FAQPage (if FAQ
questions were provided), and BreadcrumbList using an @graph array.

Return ONLY the JSON-LD object (this will be inserted directly into a
<script type="application/ld+json"> tag, so it must be valid JSON-LD, nothing else)."""

    return generate_json(system, user_prompt, model=FAST_MODEL, temperature=0.2)
