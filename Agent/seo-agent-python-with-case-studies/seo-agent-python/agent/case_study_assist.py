from lib.nvidia import generate_text, FAST_MODEL
from agent.prompt_loader import load_system_prompt

FIELD_QUESTIONS = {
    "client_name": "What's the client's name — and are you allowed to publish it, or should it be anonymized (e.g. \"a fintech startup in Mumbai\")?",
    "industry": "What industry is the client in?",
    "company_size": "Roughly how big is the client (employee count, or \"startup\"/\"SMB\"/\"enterprise\")?",
    "location": "Where's the client based (city/country)?",
    "service_used": "Which HMorix service did this project use — AI Solutions, Web Design, E-commerce, Automation, SEO, or something else?",
    "timeline": "How long did the project take, start to finish?",
    "challenge": "What specific problem did the client come to you with? What was manual, slow, or broken?",
    "solution": "What did you actually build or do for them?",
    "results": "Do you have any real numbers — response time, conversion rate, hours saved, revenue impact? If not, that's fine, we'll leave it as a placeholder.",
    "testimonial_quote": "Do you have a real quote from the client? If not, leave this blank — we won't invent one.",
}

FIELD_LABELS = {
    "client_name": "Client Name", "industry": "Industry", "company_size": "Company Size",
    "location": "Location", "service_used": "Service Used", "timeline": "Timeline",
    "challenge": "Challenge", "solution": "Solution", "results": "Results",
    "testimonial_quote": "Testimonial",
}


def suggest_questions(case_input):
    """Deterministic — no LLM call, so there's zero risk of it inventing a
    question that implies a fact we don't have. Just looks at which fields
    are empty or still bracketed placeholders and asks about those."""
    missing = []
    for field, question in FIELD_QUESTIONS.items():
        value = (case_input or {}).get(field)
        is_placeholder = isinstance(value, str) and value.strip().startswith("[") and value.strip().endswith("]")
        is_empty = not value or (isinstance(value, list) and len(value) == 0)
        if is_empty or is_placeholder:
            missing.append({"field": field, "label": FIELD_LABELS.get(field, field), "question": question})
    return missing


def polish_text(field_name, user_text):
    """Rewrites the user's OWN text for clarity/grammar/professional tone.
    Hard constraint: must not introduce any fact, number, or claim that
    wasn't already in user_text. This is proofreading, not writing."""
    if not user_text or not user_text.strip():
        return {"polished": user_text, "note": "Nothing to polish — field is empty."}

    system = load_system_prompt()
    prompt = f"""
You are proofreading ONE field ("{field_name}") of a case study form. The
user wrote this themselves:

---
{user_text}
---

Rewrite it for clarity, grammar, and a professional tone. Rules:
- Do NOT add any fact, number, name, or claim that isn't already present above.
- Do NOT make it longer by padding with generic filler — tighten it if anything.
- Keep any bracketed placeholders (e.g. "[Client Name]") exactly as-is.
- If the text is already fine, return it with only minor polish.

Return ONLY the rewritten text, nothing else — no preamble, no quotes around it.
"""
    polished = generate_text(system, prompt, model=FAST_MODEL, temperature=0.3, max_tokens=600, label="case-study-polish")
    return {"polished": polished.strip()}
