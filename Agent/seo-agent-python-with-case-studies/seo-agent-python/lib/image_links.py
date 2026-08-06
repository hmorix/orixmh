import urllib.parse


def image_search_links(query):
    """Returns ready-to-click search URLs for a query — no image scraping or
    downloading happens here (that would raise copyright/ToS issues); this
    just builds the same URL you'd get typing the query into each site
    yourself, so you can browse and pick/download an image manually."""
    q = urllib.parse.quote(query)
    return {
        "query": query,
        "google_images": f"https://www.google.com/search?tbm=isch&q={q}",
        "pinterest": f"https://www.pinterest.com/search/pins/?q={q}",
        "unsplash": f"https://unsplash.com/s/photos/{urllib.parse.quote(query.replace(' ', '-'))}",
        "pexels": f"https://www.pexels.com/search/{q}/",
    }


def image_link_suggestions_for_post(record, max_headings=5):
    """One image-link set for the title/primary topic, plus one per H2
    heading in the content (capped), so there's a relevant visual for each
    major section rather than just one generic cover-image search."""
    suggestions = [image_search_links(record.get("title", ""))]
    headings = [
        block.get("text", "")
        for block in (record.get("content") or [])
        if block.get("type") == "heading" and block.get("text")
    ]
    for heading in headings[:max_headings]:
        suggestions.append(image_search_links(heading))
    return suggestions
