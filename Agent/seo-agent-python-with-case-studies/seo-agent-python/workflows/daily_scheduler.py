"""Daily batch: generates 15 topic ideas (5 brand/name-ranking, 5 product/
service, 5 trending), saves the full pool for visibility, and queues:
  - top 3 brand ideas + top 2 product ideas -> auto-published, no approval
  - top 2 trending ideas -> generated but left as pending drafts requiring
    a manual "Approve & Publish" click (they're less predictable/on-brand,
    so worth a human glance before they go live)

On scheduling: there's no reliable OS-level "every day at 6 AM" on a phone
unless something is always running. Two ways to actually get that:
  1. Leave web_server.py running — it starts a background thread that sleeps
     until SCHEDULE_HOUR each day and calls run_daily_batch() automatically.
     Only works while the process is alive (Termux gets killed by Android
     eventually unless you use Termux:Boot / wake-lock / battery-optimization
     exemption).
  2. `python index.py --daily-schedule` runs the batch once, immediately —
     wire this to Termux's `termux-job-scheduler`, a plain cron entry, or any
     other OS-level trigger you control, for a guaranteed daily run.
"""
import json
import os
from datetime import datetime, timezone

from agent.daily_topic_planner import generate_daily_topic_pool
from lib import job_queue
from workflows.daily_blog import run_daily_blog

POOL_DIR = os.environ.get("DAILY_TOPICS_DIR", os.path.join(os.getcwd(), "generated"))
LATEST_PATH = os.path.join(POOL_DIR, "daily_topics_latest.json")

BRAND_AUTO_COUNT = int(os.environ.get("DAILY_BRAND_AUTO_COUNT", "3"))
PRODUCT_AUTO_COUNT = int(os.environ.get("DAILY_PRODUCT_AUTO_COUNT", "2"))
TRENDING_APPROVAL_COUNT = int(os.environ.get("DAILY_TRENDING_APPROVAL_COUNT", "2"))


def run_daily_batch():
    print("[daily-scheduler] Generating today's 15-topic pool (5 brand, 5 product, 5 trending)...")
    pool = generate_daily_topic_pool()

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    os.makedirs(POOL_DIR, exist_ok=True)
    dated_path = os.path.join(POOL_DIR, f"daily_topics_{today}.json")

    brand_ideas = [i for i in pool if i.get("category") == "brand"][:BRAND_AUTO_COUNT]
    product_ideas = [i for i in pool if i.get("category") == "product"][:PRODUCT_AUTO_COUNT]
    trending_ideas = [i for i in pool if i.get("category") == "trending"][:TRENDING_APPROVAL_COUNT]

    job_ids = []
    for idea in brand_ideas + product_ideas:
        job_id = job_queue.submit(
            "blog",
            lambda t=idea["title"], ct=idea.get("contentType"): run_daily_blog(seed_topic=t, content_type=ct),
            meta={"title": idea["title"], "content_type": idea.get("contentType"),
                  "category": idea["category"], "auto_publish": True},
        )
        idea["job_id"] = job_id
        job_ids.append(job_id)

    for idea in trending_ideas:
        job_id = job_queue.submit(
            "blog",
            lambda t=idea["title"], ct=idea.get("contentType"): run_daily_blog(
                seed_topic=t, content_type=ct, force_review=True
            ),
            meta={"title": idea["title"], "content_type": idea.get("contentType"),
                  "category": idea["category"], "auto_publish": False, "needs_approval": True},
        )
        idea["job_id"] = job_id
        job_ids.append(job_id)

    payload = {
        "date": today,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "pool": pool,
        "queued": {
            "brand": brand_ideas,
            "product": product_ideas,
            "trending_needs_approval": trending_ideas,
        },
        "job_ids": job_ids,
    }
    with open(dated_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    with open(LATEST_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    print(f"[daily-scheduler] Queued {len(brand_ideas)} brand + {len(product_ideas)} product blog(s) "
          f"(auto-publish) and {len(trending_ideas)} trending blog(s) (needs approval). "
          f"Full 15-idea pool saved to {dated_path}")
    return payload


def load_latest_pool():
    if not os.path.exists(LATEST_PATH):
        return None
    try:
        with open(LATEST_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return None
