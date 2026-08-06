from lib.nvidia import generate_json, FAST_MODEL
from agent.prompt_loader import load_system_prompt

STYLE_VARIANTS = [
    "clean minimal flat illustration",
    "modern isometric 3D render",
    "abstract geometric composition",
    "dark moody tech aesthetic with neon accents",
    "bright optimistic gradient background",
    "photorealistic product/office scene",
    "line-art icon style, single accent color",
    "collage/mixed-media style",
    "bold typographic poster layout",
    "soft gradient with floating 3D shapes",
]


def generate_image_prompt_set(title, excerpt, context_note="", count=10):
    """Returns a list of `count` distinct, ready-to-use image-generation
    prompts for social/marketing use. Deliberately generic/illustrative —
    instructed not to depict real, named, identifiable people (since this
    output goes straight to an image generator with no human review of
    who it might render)."""
    system = load_system_prompt()
    count = max(1, min(count, 10))
    variants_txt = "\n".join(f"{i+1}. {v}" for i, v in enumerate(STYLE_VARIANTS[:count]))

    prompt = f"""
Content title: {title}
Content summary: {excerpt}
Context: {context_note}

Generate {count} distinct image-generation prompts for social media
graphics promoting this content. Brand palette: obsidian black (#0D0D0D),
cream (#EAE8E3), lime accent (#C8FF00). Modern, minimal, dark-mode SaaS/tech
aesthetic.

Use these {count} style directions, one per prompt, in this order:
{variants_txt}

RULES:
- Each prompt must be a single, self-contained, vivid visual description
  (subject, composition, colors, mood) — 1-3 sentences, no preamble.
- NEVER depict a real, named, identifiable person (no public figures, no
  specific individuals) — use generic figures/silhouettes/abstract
  representations of people if needed at all.
- No text/words baked into the image (image generators render text badly).
- Ground the *subject matter* in the content title/summary above — don't
  invent unrelated scenes.

Return ONLY JSON:
{{
  "prompts": ["prompt 1", "prompt 2", "... {count} total"]
}}"""

    result = generate_json(system, prompt, model=FAST_MODEL, temperature=0.9, max_tokens=2048, label="social-image-prompts")
    prompts = result.get("prompts", [])[:count]
    while len(prompts) < count:
        prompts.append(f"{title} — {STYLE_VARIANTS[len(prompts) % len(STYLE_VARIANTS)]}, brand colors obsidian/cream/lime")
    return prompts
