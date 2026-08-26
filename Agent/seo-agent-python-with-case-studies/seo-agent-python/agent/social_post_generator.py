import os

from lib.env import load_env

load_env()

from lib.nvidia import generate_json, FAST_MODEL
from agent.prompt_loader import load_system_prompt


def social_post_generator(draft, seo):  # `seo` kept for call-site parity with the JS version (unused there too)
    system = load_system_prompt()
    site_url = os.environ.get("SITE_URL", "https://hmorix.in")
    url = f"{site_url}/blog/{draft['slug']}"

    user_prompt = f"""
Title: {draft['title']}
Excerpt: {draft['excerpt']}
URL: {url}

Write one social post per platform, following these rules:
- LinkedIn: professional, 3-5 sentences, can end with a discussion question
- X: under 280 characters total including the URL, max 1-2 hashtags
- Facebook: conversational, slightly longer, inviting comments
- Instagram: caption style assuming an accompanying image, light hashtag use
- Threads: casual, shorter than LinkedIn

Return ONLY JSON:""" + """
{
  "linkedin": "",
  "x": "",
  "facebook": "",
  "instagram": "",
  "threads": ""
}"""

    return generate_json(system, user_prompt, model=FAST_MODEL, temperature=0.85)
