FIELD_QUESTIONS = {
    "topic": "What's this white paper actually about? Be specific — \"AI support automation\" is "
             "too broad; \"How mid-size e-commerce brands are automating tier-1 support\" is usable.",
    "target_audience": "Who's this written for? (e.g. \"Operations leaders at 50-500 person e-commerce brands\")",
    "key_facts": "Any facts you already know and want included? One per line — these are used verbatim, not researched.",
    "source_urls": "Any specific articles/reports you want cited? Paste URLs, one per line. If you leave this "
                    "blank and Google CSE is configured, it'll search for real sources automatically.",
    "stats": "Any real numbers you want to feature (with where they came from)? If none, that's fine — "
             "the bar-chart diagram just won't render.",
    "comparison_table": "Is there a real comparison this white paper should include (e.g. approach A vs B)? "
                         "If not, skip it.",
    "related_whitepapers": "Any other white papers on your site this should link to/from (for internal SEO)?",
}

FIELD_LABELS = {
    "topic": "Topic", "target_audience": "Target Audience", "key_facts": "Key Facts",
    "source_urls": "Source URLs", "stats": "Statistics", "comparison_table": "Comparison Table",
    "related_whitepapers": "Related White Papers",
}


def suggest_questions(wp_input):
    """Deterministic — no LLM call. Looks at which fields are empty or still
    bracketed placeholders and asks about those, same posture as
    agent/case_study_assist.suggest_questions."""
    missing = []
    for field, question in FIELD_QUESTIONS.items():
        value = (wp_input or {}).get(field)
        is_placeholder = isinstance(value, str) and value.strip().startswith("[") and value.strip().endswith("]")
        is_empty = not value or (isinstance(value, list) and len(value) == 0) or (isinstance(value, dict) and not value.get("headers"))
        if field == "comparison_table":
            is_empty = not value or not value.get("headers")
        if is_empty or is_placeholder:
            missing.append({"field": field, "label": FIELD_LABELS.get(field, field), "question": question})
    return missing
