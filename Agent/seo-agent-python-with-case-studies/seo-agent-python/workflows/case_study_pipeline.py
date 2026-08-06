import json
import os
import time
from datetime import datetime, timezone

from agent.case_study_writer import case_study_writer, normalize_input
from agent.case_study_seo import case_study_seo
from agent.case_study_schema import case_study_schema
from agent.image_seo import image_seo
from lib.supabase import insert_row_resilient, SupabaseError
from lib.util import iso_now

PENDING_DIR = os.path.join(os.getcwd(), "drafts", "pending-case-studies")
DEFAULT_AUTHOR = os.environ.get("BLOG_AUTHOR_NAME", "HMorix")
DEFAULT_AUTHOR_ROLE = "Case Studies Team"


def run_case_study(case_input, target_word_count=10000, force_review=False, on_section=None):
    """Runs the full case-study pipeline for one project:
    write (section by section) -> SEO metadata -> JSON-LD schema ->
    image prompts -> save locally -> save to Supabase (case_study_drafts) ->
    auto-publish (case_studies table + static pages), unless force_review or
    AUTO_PUBLISH=false.
    """
    case_input = normalize_input(case_input)

    def _default_on_section(i, total, title, words_so_far):
        print(f"[case-study] section {i}/{total}: \"{title}\" done ({words_so_far} words so far)")

    section_cb = on_section or _default_on_section

    print("[case-study] 1/5 writing sections (this is the long step)...")
    draft = case_study_writer(case_input, target_word_count=target_word_count, on_section=section_cb)

    print("[case-study] 2/5 SEO metadata...")
    seo = case_study_seo(draft, case_input)

    print("[case-study] 3/5 schema...")
    schema = case_study_schema(draft, seo, case_input)

    print("[case-study] 4/5 image prompts...")
    images = image_seo(draft)

    record = {
        "title": draft["title"],
        "slug": seo.get("slug") or draft.get("slug"),
        "excerpt": draft["excerpt"],
        "content": draft["content"],
        "category": "Case Study",
        "author": DEFAULT_AUTHOR,
        "author_role": DEFAULT_AUTHOR_ROLE,
        "read_time": draft.get("readTime"),

        "is_demo": bool(case_input.get("is_demo", True)),
        "client_name": case_input.get("client_name"),
        "client_logo_url": case_input.get("client_logo_url"),
        "industry": case_input.get("industry"),
        "company_size": case_input.get("company_size"),
        "location": case_input.get("location"),
        "service_used": case_input.get("service_used"),
        "timeline": case_input.get("timeline"),
        "challenge": case_input.get("challenge"),
        "solution": case_input.get("solution"),
        "results": case_input.get("results"),
        "testimonial_quote": case_input.get("testimonial_quote"),
        "testimonial_author": case_input.get("testimonial_author"),
        "testimonial_role": case_input.get("testimonial_role"),
        "hero_image_url": case_input.get("hero_image_url"),
        "gallery_images": case_input.get("gallery_images"),
        "cta_text": case_input.get("cta_text"),
        "cta_url": case_input.get("cta_url"),
        "reference_links": case_input.get("reference_links"),

        "published_at": iso_now(),
        "updated_at": iso_now(),
        "seo_title": seo.get("seoTitle"),
        "meta_description": seo.get("metaDescription"),
        "canonical_url": seo.get("canonicalUrl"),
        "open_graph": seo.get("openGraph"),
        "twitter_card": seo.get("twitterCard"),
        "breadcrumbs": seo.get("breadcrumbs"),
        "keywords": [case_input.get("industry"), case_input.get("service_used")],
        "image_prompts": {
            "cover": images.get("coverImagePrompt"),
            "inline": images.get("inlineImagePrompts"),
            "altTexts": images.get("altTexts"),
        },
        "schema_jsonld": schema,
        "seo_score": seo.get("seoScore"),
        "word_count": draft.get("wordCount"),
        "status": "pending",
    }

    os.makedirs(PENDING_DIR, exist_ok=True)
    slug_part = (record.get("slug") or "case-study")[:60]
    local_file = os.path.join(PENDING_DIR, f"{int(time.time() * 1000)}-{slug_part}.json")
    with open(local_file, "w", encoding="utf-8") as f:
        json.dump(record, f, indent=2)
    print(f"[case-study] 5/5 draft saved locally: {local_file} ({record['word_count']} words)")

    try:
        data, stripped_cols = insert_row_resilient("case_study_drafts", record)
        if stripped_cols:
            print(f"[case-study] NOTE: saved without {stripped_cols} — run "
                  f"lib/migration_002_case_studies.sql to stop losing this data.")
        os.remove(local_file)
        print(f"[case-study] Draft saved to Supabase: \"{data['title']}\" (id: {data['id']})")
    except SupabaseError as err:
        print(f"[case-study] Supabase upload failed ({err}). Draft is safe at:\n  {local_file}")
        result = dict(record)
        result["_localFile"] = local_file
        result["_uploaded"] = False
        return result

    if force_review:
        print("[case-study] force_review=True — left as a pending draft for manual approval.")
        return data

    if os.environ.get("AUTO_PUBLISH", "true").lower() not in ("false", "0", "no"):
        from workflows.case_study_publish import publish_case_study  # local import, mirrors daily_blog.py

        try:
            publish_case_study(record)
        except SupabaseError as err:
            print(f"[case-study] Auto-publish failed ({err}). Draft is saved in Supabase (case_study_drafts);")
            print("[case-study] publish it manually once fixed.")

    return data
