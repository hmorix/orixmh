from datetime import datetime, timezone

from lib.supabase import select_rows, SupabaseError


def _months_ago(months):
    """Approximates JS's `date.setMonth(date.getMonth() - months)`. Clamps the
    day to 28 to sidestep month-length edge cases (e.g. Aug 31 minus 6 months);
    fine for a "roughly 6 months old" staleness threshold."""
    now = datetime.now(timezone.utc)
    year = now.year
    month = now.month - months
    while month <= 0:
        month += 12
        year -= 1
    day = min(now.day, 28)
    dt = now.replace(year=year, month=month, day=day)
    return dt.strftime("%Y-%m-%dT%H:%M:%S.") + f"{dt.microsecond // 1000:03d}Z"


def run_weekly_audit():
    """Scans published posts and flags ones that likely need a refresh (old,
    low SEO signals, etc). Doesn't rewrite anything itself — queues
    candidates for the content-refresh workflow / manual review."""
    six_months_ago = _months_ago(6)

    try:
        stale_candidates = select_rows(
            "blog_posts",
            select="id,title,slug,published_at,updated_at",
            filters={"updated_at": f"lt.{six_months_ago}"},
            order="updated_at.asc",
        )
    except SupabaseError as err:
        print(f"[weekly-audit] Failed to query posts: {err}")
        raise

    print(f"[weekly-audit] Found {len(stale_candidates)} post(s) older than 6 months.")
    for p in stale_candidates:
        print(f"  - {p['title']} (last updated {p['updated_at']})")

    return stale_candidates
