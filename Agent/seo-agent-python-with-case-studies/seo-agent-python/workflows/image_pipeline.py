import json
import os
import time
import uuid

from agent.social_image_prompts import generate_image_prompt_set
from agent.social_captions import generate_social_captions
from lib.pollinations import generate_image_to_file, PollinationsError
from lib.supabase import insert_row_resilient

OUTPUT_DIR = os.environ.get("GENERATED_IMAGES_DIR", os.path.join(os.getcwd(), "generated", "social-images"))


def generate_social_image_pack(
    title, excerpt="", category="", url="", source_type="custom", source_slug=None,
    count=10, custom_prompt=None, on_progress=None,
):
    """Generates `count` images + one set of per-platform captions.

    If custom_prompt is given, all `count` images vary that single prompt
    with different style directions rather than deriving prompts from
    title/excerpt. Otherwise, prompts are generated from title/excerpt/
    category (still content-grounded — see agent/social_image_prompts.py).

    Returns the manifest dict: {id, images: [...], captions: {...}}.
    Individual image failures are recorded per-image rather than aborting
    the whole batch — pollinations.ai is a free, best-effort service and
    single requests can occasionally fail.
    """
    set_id = str(uuid.uuid4())[:8]
    folder = os.path.join(OUTPUT_DIR, f"{int(time.time())}-{set_id}")
    os.makedirs(folder, exist_ok=True)

    if custom_prompt:
        from agent.social_image_prompts import STYLE_VARIANTS
        prompts = [f"{custom_prompt}, {STYLE_VARIANTS[i % len(STYLE_VARIANTS)]}" for i in range(count)]
    else:
        print("[images] 1/3 generating prompt variations...")
        prompts = generate_image_prompt_set(title, excerpt, context_note=category, count=count)

    print(f"[images] 2/3 generating {len(prompts)} image(s) via pollinations.ai (this can take a while)...")
    images = []
    for i, p in enumerate(prompts):
        filename = f"img_{i + 1}.jpg"
        out_path = os.path.join(folder, filename)
        try:
            generate_image_to_file(p, out_path, seed=i)
            images.append({"filename": filename, "prompt": p, "ok": True})
            print(f"[images]   {i + 1}/{len(prompts)} OK")
        except PollinationsError as err:
            images.append({"filename": None, "prompt": p, "ok": False, "error": str(err)})
            print(f"[images]   {i + 1}/{len(prompts)} FAILED: {err}")
        if on_progress:
            on_progress(i + 1, len(prompts))

    print("[images] 3/3 generating social captions...")
    try:
        captions = generate_social_captions(title, excerpt, url=url, category=category)
    except Exception as err:  # noqa: BLE001
        print(f"[images] Caption generation failed ({err}); images are still saved.")
        captions = {}

    manifest = {
        "id": set_id,
        "folder": folder,
        "source_type": source_type,
        "source_slug": source_slug,
        "title": title,
        "base_prompt": custom_prompt,
        "images": images,
        "captions": captions,
    }
    with open(os.path.join(folder, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    try:
        insert_row_resilient("generated_image_sets", {
            "source_type": source_type,
            "source_slug": source_slug,
            "title": title,
            "base_prompt": custom_prompt,
            "images": images,
            "captions": captions,
        })
    except Exception as err:  # noqa: BLE001 — deliberately broad: a Supabase
        # hiccup here must never lose images/captions that are already
        # safely written to disk in `folder`.
        print(f"[images] Supabase save failed ({err}) — images are still saved locally at {folder}")

    return manifest
