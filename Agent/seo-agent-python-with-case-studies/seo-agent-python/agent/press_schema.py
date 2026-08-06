from lib.util import iso_now


def press_schema(draft, seo, press_input, sources):
    site_url = seo.get("canonicalUrl", "")

    citations = [
        {"@type": "CreativeWork", "name": s.get("title"), "url": s.get("url")}
        for s in (sources or []) if s.get("url")
    ]

    graph = [
        {
            "@type": "NewsArticle",
            "headline": draft.get("headline"),
            "description": draft.get("excerpt"),
            "articleSection": press_input.get("category"),
            "author": {"@type": "Organization", "name": "HMorix"},
            "publisher": {"@type": "Organization", "name": "HMorix"},
            "datePublished": iso_now(),
            "dateModified": iso_now(),
            "mainEntityOfPage": {"@type": "WebPage", "@id": site_url},
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
