import json
import os
import time
from datetime import datetime, timezone

from agent.keyword_research import keyword_research
from agent.competitor_analysis import competitor_analysis
from agent.blog_planner import blog_planner
from agent.blog_writer import blog_writer
from agent.fact_checker import fact_checker
from agent.seo_optimizer import seo_optimizer
from agent.internal_linking import internal_linking
from agent.image_seo import image_seo
from agent.schema_generator import schema_generator
from agent.social_post_generator import social_post_generator
from lib.supabase import insert_row_resilient, SupabaseError
from lib.util import iso_now
from lib import checkpoint

PENDING_DIR = os.path.join(os.getcwd(), "drafts", "pending")
DEFAULT_AUTHOR = os.environ.get("BLOG_AUTHOR_NAME", "HMorix AI")
DEFAULT_AUTHOR_ROLE = os.environ.get("BLOG_AUTHOR_ROLE", "Editorial Team")


def run_daily_blog(seed_topic="auto", content_type=None, force_review=False):
    # Run id is scoped to today + the seed topic + type: if today's run crashes
    # partway and gets retried, it picks up from the last completed step instead
    # of redoing keyword research / the full draft / fact-checking from scratch.
    # A new day (or a different seed topic/type) starts a fresh run as normal.
    run_key = f"{seed_topic}-{content_type or 'auto'}"
    run_id = f"{datetime.now(timezone.utc).strftime('%Y-%m-%d')}-{run_key}"
    state = checkpoint.load(run_id)
    if state:
        print(f"[daily-blog] Resuming run '{run_id}' — found {len(state)} completed step(s), skipping those.")

    def step(name, label, fn):
        if name in state:
            print(f"[daily-blog] {label} (already done, skipping)")
            return state[name]
        print(f"[daily-blog] {label}")
        result = fn()
        checkpoint.save_step(run_id, name, result)
        state[name] = result
        return result

    keywords = step("keywords", "1/9 keyword research...", lambda: keyword_research(seed_topic, content_type))
    competitors = step("competitors", "2/9 competitor analysis...", lambda: competitor_analysis(keywords))
    plan = step("plan", "3/9 planning outline...", lambda: blog_planner(keywords, competitors))
    draft = step("draft", "4/9 writing draft (2000-3500 words)...", lambda: blog_writer(plan, keywords))

    checked = step("checked", "5/9 fact-checking...", lambda: fact_checker(draft))
    draft["content"] = checked["cleanedContent"]

    seo = step("seo", "6/9 SEO metadata...", lambda: seo_optimizer(draft, keywords))

    print("[daily-blog] 7/9 internal/external links + image prompts...")
    links = step("links", "  - internal/external links...", lambda: internal_linking(draft))
    images = step("images", "  - image prompts...", lambda: image_seo(draft))

    print("[daily-blog] 8/9 schema + social posts...")
    schema = step("schema", "  - schema...", lambda: schema_generator(draft, seo, plan))
    social = step("social", "  - social posts...", lambda: social_post_generator(draft, seo))

    record = {
        "title": draft["title"],
        "slug": seo.get("slug") or draft.get("slug"),
        "excerpt": draft["excerpt"],
        "content": draft["content"],
        "category": draft.get("category"),
        "read_time": draft.get("readTime"),
        "author": DEFAULT_AUTHOR,
        "author_role": DEFAULT_AUTHOR_ROLE,
        "published_at": iso_now(),
        "updated_at": iso_now(),
        "seo_title": seo.get("seoTitle"),
        "meta_description": seo.get("metaDescription"),
        "canonical_url": seo.get("canonicalUrl"),
        "open_graph": seo.get("openGraph"),
        "twitter_card": seo.get("twitterCard"),
        "breadcrumbs": seo.get("breadcrumbs"),
        "keywords": [keywords["primaryKeyword"]] + keywords.get("secondaryKeywords", []),
        "internal_links": links.get("internalLinks"),
        "external_links": links.get("externalLinks"),
        "image_prompts": {
            "cover": images.get("coverImagePrompt"),
            "inline": images.get("inlineImagePrompts"),
            "altTexts": images.get("altTexts"),
        },
        "schema_jsonld": schema,
        "social_posts": social,
        "seo_score": seo.get("seoScore"),
        "flagged_claims": checked.get("flaggedClaims"),
        "content_type": plan.get("contentType"),
        "status": "pending",
    }

    # Save to disk FIRST, before attempting the network call. This guarantees the
    # 2000-3500 word article (and every upstream API call it took to produce it)
    # is never lost to a dropped connection at the final step. If the Supabase
    # upload succeeds, the local file is deleted; if it fails, it stays for
    # manual/retry upload via scripts/upload_draft.py.
    os.makedirs(PENDING_DIR, exist_ok=True)
    slug_part = (record.get("slug") or "draft")[:60]
    local_file = os.path.join(PENDING_DIR, f"{int(time.time() * 1000)}-{slug_part}.json")
    with open(local_file, "w", encoding="utf-8") as f:
        json.dump(record, f, indent=2)
    print(f"[daily-blog] 9/9 draft saved locally: {local_file}")

    try:
        data, stripped_cols = insert_row_resilient("blog_drafts", record)
        if stripped_cols:
            print(f"[daily-blog] NOTE: saved without {stripped_cols} — those columns don't exist on "
                  f"blog_drafts yet. Run lib/migration_001_seo_columns.sql to stop losing this data.")
        os.remove(local_file)  # uploaded successfully, no longer need the local copy
        checkpoint.clear(run_id)  # run fully completed, don't need to resume it again
        print(f"[daily-blog] Done. Draft saved to Supabase: \"{data['title']}\" (id: {data['id']})")
    except SupabaseError as err:
        print(f"[daily-blog] Supabase upload failed ({err}). Draft is safe at:\n  {local_file}")
        print(f'[daily-blog] Upload it later with:\n  python scripts/upload_draft.py "{local_file}"')
        print("[daily-blog] Or upload every pending draft with:\n  python scripts/upload_draft.py --all")
        print("[daily-blog] Re-running today will resume from here (draft/SEO/etc. won't be redone).")
        result = dict(record)
        result["_localFile"] = local_file
        result["_uploaded"] = False
        return result

    # Auto-publish: promote straight to the public blog_posts table, generate
    # the static page, and regenerate sitemap/RSS. Set AUTO_PUBLISH=false in
    # .env if you'd rather review drafts manually before they go live, or pass
    # force_review=True for one-off topics (e.g. trending/random ones from the
    # daily scheduler) that should wait for a human "Approve & Publish" click
    # regardless of the global AUTO_PUBLISH setting.
    if force_review:
        print("[daily-blog] force_review=True — leaving this as a pending draft for manual approval "
              "instead of auto-publishing.")
    elif os.environ.get("AUTO_PUBLISH", "true").lower() not in ("false", "0", "no"):
        from workflows.publish import publish_post  # local import: avoids a
        # circular import at module load time (publish.py doesn't need to be
        # importable unless auto-publish is actually on)

        try:
            publish_post(record)
        except SupabaseError as err:
            print(f"[daily-blog] Auto-publish failed ({err}). Draft is saved in Supabase (blog_drafts);")
            print("[daily-blog] publish it manually once the issue is fixed, e.g. by re-running with AUTO_PUBLISH=true.")

    return data
