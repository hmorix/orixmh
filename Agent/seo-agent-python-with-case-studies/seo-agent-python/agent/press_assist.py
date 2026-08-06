FIELD_QUESTIONS = {
    "headline": "What's the actual news? A press release needs a real headline — even a rough one you can polish later.",
    "key_facts": "What actually happened — launch, partnership, milestone? One fact per line, used verbatim.",
    "dateline_city": "Where is this release datelined from (city, state/country)?",
    "quote_text": "Do you have a real quote from someone at HMorix (or a partner)? Leave blank if not — one won't be invented.",
    "media_contact_name": "Who should journalists contact about this release?",
    "media_contact_email": "What email should go on the release for press inquiries?",
}

FIELD_LABELS = {
    "headline": "Headline", "key_facts": "Key Facts", "dateline_city": "Dateline City",
    "quote_text": "Quote", "media_contact_name": "Media Contact Name", "media_contact_email": "Media Contact Email",
}


def suggest_questions(press_input):
    """Deterministic — no LLM call. Flags empty/placeholder fields."""
    missing = []
    for field, question in FIELD_QUESTIONS.items():
        value = (press_input or {}).get(field)
        is_placeholder = isinstance(value, str) and value.strip().startswith("[") and value.strip().endswith("]")
        is_empty = not value or (isinstance(value, list) and len(value) == 0)
        if field == "quote_text":
            continue  # blank is a valid, intentional choice — don't nag about it
        if is_empty or is_placeholder:
            missing.append({"field": field, "label": FIELD_LABELS.get(field, field), "question": question})
    return missing
