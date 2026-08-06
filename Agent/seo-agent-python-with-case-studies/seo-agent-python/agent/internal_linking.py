import json

from lib.nvidia import generate_json, FAST_MODEL
from agent.prompt_loader import load_system_prompt
from lib.supabase import select_rows, SupabaseError


def internal_linking(draft):
    system = load_system_prompt()

    # Pull real existing slugs so the model can never invent a broken internal link.
    # This is a nice-to-have, not critical: if blog_posts isn't reachable (table not
    # created yet, schema cache stale, network hiccup) don't blow up the whole
    # pipeline over a link-suggestion lookup — just fall back to no internal links.
    try:
        existing_posts = select_rows(
            "blog_posts",
            select="title,slug,category",
            order="published_at.desc",
            limit=50,
        )
    except SupabaseError as err:
        print(f"[internal-linking] Couldn't fetch existing posts ({err}); continuing without internal links.")
        existing_posts = []

    user_prompt = f"""
New post title: {draft['title']}
New post category: {draft['category']}
Existing published posts (ONLY use slugs from this list for internal links,
never invent one): {json.dumps(existing_posts or [])}

Suggest 1-3 topically relevant internal links from the existing posts list
(if the list is empty or nothing fits, return an empty array — do not invent
a slug). Also suggest 1-2 external authoritative references using real,
well-known domains relevant to the topic (official docs, standards bodies,
recognized research/news organizations).

Return ONLY JSON:""" + """
{
  "internalLinks": [{ "text": "anchor text", "slug": "existing-post-slug", "title": "existing post title" }],
  "externalLinks": [{ "text": "anchor text", "url": "https://..." }]
}"""

    return generate_json(system, user_prompt, model=FAST_MODEL, temperature=0.4)
