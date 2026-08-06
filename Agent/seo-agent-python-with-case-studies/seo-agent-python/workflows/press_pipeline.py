import json
import os
import time
from datetime import datetime, timezone

from agent.whitepaper_researcher import research_topic  # reused: generic real-source researcher
from agent.press_writer import press_writer, normalize_input
from agent.press_seo import press_seo
from agent.press_schema import press_schema
from lib.supabase import insert_row_resilient, SupabaseError
from lib.util import iso_now

PENDING_DIR = os.path.join(os.getcwd(), "drafts", "pending-press")
DEFAULT_AUTHOR = os.environ.get("BLOG_AUTHOR_NAME", "HMorix")


def run_press_release(press_input, target_word_count=600, force_review=False):
    press_input = normalize_input(press_input)

    sources = []
    if press_input.get("is_commentary"):
        print("[press] 1/5 researching (real sources only)...")
        research = research_topic(
            press_input.get("headline") or press_input.get("category", ""),
            source_urls=press_input.get("source_urls"),
            is_research=True,
        )
        sources = research["sources"]
        if research.get("note"):
            print(f"[press] note: {research['note']}")
    else:
        print("[press] 1/5 skipping research (is_commentary=false)")

    print("[press] 2/5 writing...")
    draft = press_writer(press_input, sources, target_word_count=target_word_count)

    print("[press] 3/5 SEO metadata...")
    seo = press_seo(draft, press_input)

    print("[press] 4/5 schema...")
    schema = press_schema(draft, seo, press_input, sources)

    dateline_date = datetime.now(timezone.utc).strftime("%B %-d, %Y") if os.name != "nt" else datetime.now(timezone.utc).strftime("%B %d, %Y")

    record = {
        "headline": draft["headline"],
        "slug": seo.get("slug") or draft.get("slug"),
        "subheadline": draft.get("subheadline"),
        "category": press_input.get("category"),
        "dateline_city": press_input.get("dateline_city"),
        "dateline_date": dateline_date,
        "excerpt": draft["excerpt"],
        "is_commentary": bool(press_input.get("is_commentary")),
        "content": draft["content"],
        "key_facts": [f for f in press_input.get("key_facts", []) if f and not str(f).startswith("[")],
        "sources": sources,
        "quote_text": press_input.get("quote_text") if draft.get("hasQuote") else None,
        "quote_attribution": press_input.get("quote_attribution") if draft.get("hasQuote") else None,
        "quote_role": press_input.get("quote_role") if draft.get("hasQuote") else None,
        "boilerplate": draft.get("boilerplate"),
        "media_contact_name": press_input.get("media_contact_name"),
        "media_contact_email": press_input.get("media_contact_email"),
        "media_contact_phone": press_input.get("media_contact_phone"),
        "cover_image_url": press_input.get("cover_image_url"),
        "reference_links": press_input.get("reference_links"),
        "cta_text": press_input.get("cta_text"),
        "cta_url": press_input.get("cta_url"),
        "author": DEFAULT_AUTHOR,
        "read_time": draft.get("readTime"),
        "word_count": draft.get("wordCount"),
        "seo_title": seo.get("seoTitle"),
        "meta_description": seo.get("metaDescription"),
        "canonical_url": seo.get("canonicalUrl"),
        "open_graph": seo.get("openGraph"),
        "twitter_card": seo.get("twitterCard"),
        "breadcrumbs": seo.get("breadcrumbs"),
        "keywords": [press_input.get("category")],
        "schema_jsonld": schema,
        "seo_score": seo.get("seoScore"),
        "published_at": iso_now(),
        "updated_at": iso_now(),
        "pdf_generated": False,
        "status": "pending",
    }

    os.makedirs(PENDING_DIR, exist_ok=True)
    slug_part = (record.get("slug") or "press-release")[:60]
    local_file = os.path.join(PENDING_DIR, f"{int(time.time() * 1000)}-{slug_part}.json")
    with open(local_file, "w", encoding="utf-8") as f:
        json.dump(record, f, indent=2)
    print(f"[press] 5/5 draft saved locally: {local_file} ({record['word_count']} words)")

    try:
        data, stripped_cols = insert_row_resilient("press_drafts", record)
        if stripped_cols:
            print(f"[press] NOTE: saved without {stripped_cols} — run lib/migration_004_press.sql to stop losing this data.")
        os.remove(local_file)
        print(f"[press] Draft saved to Supabase: \"{data['headline']}\" (id: {data['id']})")
    except SupabaseError as err:
        print(f"[press] Supabase upload failed ({err}). Draft is safe at:\n  {local_file}")
        result = dict(record)
        result["_localFile"] = local_file
        result["_uploaded"] = False
        return result

    if force_review:
        print("[press] force_review=True — left as a pending draft for manual approval.")
        return data

    if os.environ.get("AUTO_PUBLISH", "true").lower() not in ("false", "0", "no"):
        from workflows.press_publish import publish_press_release

        try:
            publish_press_release(record)
        except SupabaseError as err:
            print(f"[press] Auto-publish failed ({err}). Draft is saved in Supabase (press_drafts); "
                  f"publish it manually once fixed.")

    return data
