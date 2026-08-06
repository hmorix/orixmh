import json
import os
import time

from agent.whitepaper_researcher import research_topic
from agent.whitepaper_writer import whitepaper_writer
from agent.whitepaper_seo import whitepaper_seo
from agent.whitepaper_schema import whitepaper_schema
from lib.supabase import insert_row_resilient, SupabaseError
from lib.util import iso_now

PENDING_DIR = os.path.join(os.getcwd(), "drafts", "pending-whitepapers")
DEFAULT_AUTHOR = os.environ.get("BLOG_AUTHOR_NAME", "HMorix")


def _normalize(wp_input):
    wp_input = dict(wp_input or {})
    wp_input.setdefault("topic", "[Topic]")
    wp_input.setdefault("target_audience", "[Target Audience]")
    wp_input.setdefault("is_research", False)
    wp_input.setdefault("key_facts", [])
    wp_input.setdefault("source_urls", [])
    wp_input.setdefault("stats", [])
    wp_input.setdefault("comparison_table", {})
    wp_input.setdefault("related_whitepapers", [])
    wp_input.setdefault("images", [])
    wp_input.setdefault("reference_links", [])
    wp_input.setdefault("cta_text", "Talk to HMorix about your project")
    wp_input.setdefault("cta_url", "/contact")
    wp_input.setdefault("cover_image_url", "")
    return wp_input


def run_whitepaper(wp_input, target_word_count=6000, force_review=False, on_section=None):
    wp_input = _normalize(wp_input)

    print("[whitepaper] 1/6 researching (real sources only)...")
    research = research_topic(
        wp_input["topic"], source_urls=wp_input.get("source_urls"), is_research=wp_input.get("is_research"),
    )
    sources = research["sources"]
    if research.get("note"):
        print(f"[whitepaper] note: {research['note']}")

    def _default_on_section(i, total, section_title, words_so_far):
        print(f"[whitepaper]   section {i}/{total}: {section_title} ({words_so_far} words so far)")

    print("[whitepaper] 2/6 writing sections (this is the long step)...")
    draft = whitepaper_writer(
        wp_input, sources, target_word_count=target_word_count, on_section=on_section or _default_on_section
    )

    print("[whitepaper] 3/6 SEO metadata...")
    seo = whitepaper_seo(draft, wp_input)

    print("[whitepaper] 4/6 schema...")
    schema = whitepaper_schema(draft, seo, wp_input, sources)

    record = {
        "title": draft["title"],
        "slug": seo.get("slug") or draft.get("slug"),
        "topic": wp_input["topic"],
        "excerpt": draft["excerpt"],
        "target_audience": wp_input["target_audience"],
        "is_research": bool(wp_input.get("is_research")),
        "content": draft["content"],
        "key_facts": [f for f in wp_input.get("key_facts", []) if f and not str(f).startswith("[")],
        "sources": sources,
        "stats": wp_input.get("stats"),
        "comparison_table": wp_input.get("comparison_table"),
        "related_whitepapers": wp_input.get("related_whitepapers"),
        "cover_image_url": wp_input.get("cover_image_url"),
        "images": wp_input.get("images"),
        "cta_text": wp_input.get("cta_text"),
        "cta_url": wp_input.get("cta_url"),
        "reference_links": wp_input.get("reference_links"),
        "author": DEFAULT_AUTHOR,
        "author_role": "Research Team",
        "read_time": draft.get("readTime"),
        "word_count": draft.get("wordCount"),
        "seo_title": seo.get("seoTitle"),
        "meta_description": seo.get("metaDescription"),
        "canonical_url": seo.get("canonicalUrl"),
        "open_graph": seo.get("openGraph"),
        "twitter_card": seo.get("twitterCard"),
        "breadcrumbs": seo.get("breadcrumbs"),
        "keywords": [wp_input.get("topic")],
        "schema_jsonld": schema,
        "seo_score": seo.get("seoScore"),
        "published_at": iso_now(),
        "updated_at": iso_now(),
        "pdf_generated": False,
        "status": "pending",
    }

    os.makedirs(PENDING_DIR, exist_ok=True)
    slug_part = (record.get("slug") or "whitepaper")[:60]
    local_file = os.path.join(PENDING_DIR, f"{int(time.time() * 1000)}-{slug_part}.json")
    with open(local_file, "w", encoding="utf-8") as f:
        json.dump(record, f, indent=2)
    print(f"[whitepaper] 5/6 draft saved locally: {local_file} ({record['word_count']} words, "
          f"{len(sources)} source(s))")

    try:
        data, stripped_cols = insert_row_resilient("whitepaper_drafts", record)
        if stripped_cols:
            print(f"[whitepaper] NOTE: saved without {stripped_cols} — run "
                  f"lib/migration_003_whitepapers.sql to stop losing this data.")
        os.remove(local_file)
        print(f"[whitepaper] Draft saved to Supabase: \"{data['title']}\" (id: {data['id']})")
    except SupabaseError as err:
        print(f"[whitepaper] Supabase upload failed ({err}). Draft is safe at:\n  {local_file}")
        result = dict(record)
        result["_localFile"] = local_file
        result["_uploaded"] = False
        return result

    if force_review:
        print("[whitepaper] force_review=True — left as a pending draft for manual approval.")
        return data

    print("[whitepaper] 6/6 publishing (PDF + web page + Supabase + sitemap)...")
    if os.environ.get("AUTO_PUBLISH", "true").lower() not in ("false", "0", "no"):
        from workflows.whitepaper_publish import publish_whitepaper

        try:
            publish_whitepaper(record)
        except SupabaseError as err:
            print(f"[whitepaper] Auto-publish failed ({err}). Draft is saved in Supabase (whitepaper_drafts);")
            print("[whitepaper] publish it manually once fixed.")

    return data
