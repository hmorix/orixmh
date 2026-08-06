from lib.nvidia import generate_json, FAST_MODEL
from agent.prompt_loader import load_system_prompt


def image_seo(draft):
    system = load_system_prompt()

    user_prompt = f"""
Post title: {draft['title']}
Post excerpt: {draft['excerpt']}

Generate image prompts and alt text. Brand palette: obsidian (#0D0D0D),
cream (#EAE8E3), lime accent (#C8FF00). Style: modern, minimal, dark-mode
SaaS/tech aesthetic, no stock-photo cheesiness, no text baked into the image.

Return ONLY JSON:""" + """
{
  "coverImagePrompt": "",
  "inlineImagePrompts": [],
  "altTexts": ["one per image above, descriptive, includes relevant keyword only where natural"]
}"""

    return generate_json(system, user_prompt, model=FAST_MODEL, temperature=0.8)
