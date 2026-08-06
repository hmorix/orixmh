from agent.update_existing_blog import update_existing_blog
from lib.supabase import get_by_id, insert_row


def run_content_refresh(post_id):
    """Runs the refresh skill on one existing published post and saves the
    suggestions as a new pending draft linked back to the original slug (so
    it goes through the same human-review/publish flow, never auto-updates
    a live post)."""
    post = get_by_id("blog_posts", post_id)
    if not post:
        raise ValueError(f"Post not found: {post_id}")

    print(f"[content-refresh] Analyzing \"{post['title']}\"...")
    suggestions = update_existing_blog(post)

    refreshed = suggestions.get("refreshedMetadata") or {}
    record = {
        "title": post["title"],
        "slug": post["slug"],
        "excerpt": post["excerpt"],
        "content": post["content"],  # original content; suggestions are stored separately for review
        "category": post.get("category"),
        "seo_title": refreshed.get("seoTitle") or post.get("seo_title"),
        "meta_description": refreshed.get("metaDescription") or post.get("meta_description"),
        "keywords": post.get("keywords"),
        "flagged_claims": suggestions.get("flaggedSections"),
        "content_type": "refresh",
        "status": "pending",
    }

    draft = insert_row("blog_drafts", record)

    print(f"[content-refresh] Refresh draft created for review (id: {draft['id']})")
    print("Suggested new sections:", suggestions.get("newSections"))
    print("Suggested replacements:", suggestions.get("suggestedReplacements"))

    return {"draft": draft, "suggestions": suggestions}
