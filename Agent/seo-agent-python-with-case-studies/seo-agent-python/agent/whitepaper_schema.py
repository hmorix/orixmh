from lib.util import iso_now


def whitepaper_schema(draft, seo, wp_input, sources):
    """Deterministic JSON-LD — uses "Report" type (schema.org's closest fit
    for a white paper) with a `citation` array built directly from the real
    sources list, never from anything the LLM asserts."""
    site_url = seo.get("canonicalUrl", "")

    citations = [
        {"@type": "CreativeWork", "name": s.get("title"), "url": s.get("url")}
        for s in (sources or [])
        if s.get("url")
    ]

    graph = [
        {
            "@type": "Report",
            "headline": draft.get("title"),
            "description": draft.get("excerpt"),
            "author": {"@type": "Organization", "name": "HMorix"},
            "publisher": {"@type": "Organization", "name": "HMorix"},
            "datePublished": iso_now(),
            "dateModified": iso_now(),
            "mainEntityOfPage": {"@type": "WebPage", "@id": site_url},
            "about": wp_input.get("topic"),
            "citation": citations,
        },
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": i + 1, "name": b.get("name"), "item": b.get("url")}
                for i, b in enumerate(seo.get("breadcrumbs") or [])
            ],
        },
    ]

    return {"@context": "https://schema.org", "@graph": graph}
