from lib.util import iso_now


def case_study_schema(draft, seo, case_input):
    """Deterministic (no LLM call) JSON-LD builder — a case study's schema
    fields map directly to data we already have, so there's no reason to
    risk an LLM inventing or dropping a field here. Uses Article as the
    base type (schema.org has no dedicated "CaseStudy" type) with an
    articleSection marker, matching how Google's own docs recommend
    handling case studies.
    """
    site_url = seo.get("canonicalUrl", "")
    is_demo = bool(case_input.get("is_demo", True))

    graph = [
        {
            "@type": "Article",
            "headline": draft.get("title"),
            "description": draft.get("excerpt"),
            "articleSection": "Case Study",
            "author": {"@type": "Organization", "name": "HMorix"},
            "publisher": {"@type": "Organization", "name": "HMorix"},
            "datePublished": iso_now(),
            "dateModified": iso_now(),
            "mainEntityOfPage": {"@type": "WebPage", "@id": site_url},
            "about": {
                "@type": "Organization",
                "name": case_input.get("client_name"),
                "industry": case_input.get("industry"),
            },
        },
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": i + 1, "name": b.get("name"), "item": b.get("url")}
                for i, b in enumerate(seo.get("breadcrumbs") or [])
            ],
        },
    ]

    # Only emit a Review/testimonial node if a real quote exists — never
    # synthesize one just to fill out the schema.
    if not is_demo and case_input.get("testimonial_quote") and case_input.get("testimonial_author"):
        graph.append({
            "@type": "Review",
            "reviewBody": case_input["testimonial_quote"],
            "author": {"@type": "Person", "name": case_input["testimonial_author"]},
            "itemReviewed": {"@type": "Organization", "name": "HMorix"},
        })

    return {"@context": "https://schema.org", "@graph": graph}
