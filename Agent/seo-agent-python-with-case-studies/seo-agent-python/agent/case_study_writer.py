import json
import re

from lib.nvidia import generate_text, generate_json, WRITER_MODEL, FAST_MODEL
from agent.prompt_loader import load_system_prompt, load_knowledge_base

DEFAULT_PLACEHOLDER_INPUT = {
    "is_demo": True,
    "client_name": "[Client Name]",
    "client_logo_url": "",
    "industry": "[Industry]",
    "company_size": "[Company Size]",
    "location": "[Location]",
    "service_used": "[HMorix Service Used]",
    "timeline": "[Project Timeline]",
    "challenge": "[Describe the client's real problem here.]",
    "solution": "[Describe what HMorix actually built/did here.]",
    "results": [
        {"metric": "[Metric]", "value": "[Result Placeholder]", "is_placeholder": True},
        {"metric": "[Metric]", "value": "[Result Placeholder]", "is_placeholder": True},
        {"metric": "[Metric]", "value": "[Result Placeholder]", "is_placeholder": True},
    ],
    "testimonial_quote": "",
    "testimonial_author": "",
    "testimonial_role": "",
    "hero_image_url": "",
    "gallery_images": [],
    "cta_text": "Ready to build something like this?",
    "cta_url": "/contact",
    "reference_links": [],
}

# Fixed section outline with an approximate word-count budget per section.
# Long-form (~10k word) output is built by generating ONE section at a time
# rather than one giant JSON blob — this is both more reliable against
# model output-length limits and keeps each call's context small enough
# that the model doesn't start drifting into invented specifics.
SECTIONS = [
    ("Executive Summary", 500),
    ("About the Client", 500),
    ("The Challenge", 900),
    ("Goals & Success Criteria", 600),
    ("Why HMorix", 700),
    ("The Solution — Overview", 900),
    ("Implementation", 1400),
    ("Technology & Approach", 900),
    ("Results", 700),
    ("Client Testimonial", 300),
    ("Lessons Learned", 900),
    ("Conclusion & Next Steps", 500),
]


def normalize_input(raw_input):
    merged = dict(DEFAULT_PLACEHOLDER_INPUT)
    merged.update({k: v for k, v in (raw_input or {}).items() if v not in (None, "")})
    if not merged.get("results"):
        merged["results"] = DEFAULT_PLACEHOLDER_INPUT["results"]
    if not merged.get("gallery_images"):
        merged["gallery_images"] = [
            {"url": "", "alt": f"[Gallery image {i + 1} placeholder]", "caption": "[Caption Placeholder]"}
            for i in range(4)
        ]
    return merged


def _facts_block(case_input):
    results_json = json.dumps(case_input.get("results") or [], indent=2)
    return f"""
CLIENT / PROJECT FACTS (the ONLY source of client-specific truth):
- Client name: {case_input['client_name']}
- Industry: {case_input['industry']}
- Company size: {case_input['company_size']}
- Location: {case_input['location']}
- HMorix service used: {case_input['service_used']}
- Timeline: {case_input['timeline']}
- Challenge (as given): {case_input['challenge']}
- Solution (as given): {case_input['solution']}
- Results (as given, may be placeholders): {results_json}
- Testimonial quote (as given, may be empty): {case_input.get('testimonial_quote') or '(none provided)'}
- Testimonial author: {case_input.get('testimonial_author') or '(none provided)'}
- is_demo: {bool(case_input.get('is_demo', True))}

ABSOLUTE RULES:
1. Any bracketed placeholder above (e.g. "[Client Name]", "[Result
   Placeholder]") must be reproduced VERBATIM wherever it's referenced.
   Never replace a placeholder with an invented real-sounding value.
2. If testimonial_quote is empty, do NOT invent one — write the Client
   Testimonial section as a placeholder note instead (e.g. "[Testimonial
   Placeholder — to be added once the client provides a quote]").
3. Never invent statistics, dollar figures, percentages, or dates not given.
4. Statements about HMorix itself must come only from the knowledge base
   provided, not be invented.
5. If is_demo is true, write in illustrative/sample framing (e.g. "In an
   engagement of this kind...") rather than asserting this exact project
   definitely happened.
"""


def _plan_titles(case_input):
    """Generate a short, real title/slug/excerpt/read-time via one small
    JSON call — cheap and doesn't need the full section budget."""
    system = load_system_prompt()
    prompt = f"""
{_facts_block(case_input)}

Generate ONLY the metadata for this case study page (not the body). If
client_name is a placeholder, keep the title generic/illustrative
(e.g. "How a [Industry] Company Streamlined Operations with HMorix") rather
than pretending it's a real named client.

Return ONLY JSON:
{{
  "title": "",
  "slug": "url-friendly-slug",
  "excerpt": "one to two sentence summary, no invented specifics"
}}"""
    return generate_json(system, prompt, model=FAST_MODEL, temperature=0.5, max_tokens=1024, label="case-study-meta")


def _write_section(system, knowledge, case_input, section_title, word_budget):
    prompt = f"""
{knowledge}

---
{_facts_block(case_input)}

Write ONLY the "{section_title}" section of this case study (not the whole
document). Target roughly {word_budget} words for this section — expand
with genuine process detail, reasoning, and context grounded in the facts
and knowledge base above; do not pad with fabricated client specifics.

Format as plain text using this lightweight markup:
- A line starting with "## " for the section heading (use "{section_title}")
- Lines starting with "### " for a sub-heading, if useful
- Lines starting with "- " for a bullet list item
- Blank lines between paragraphs
No JSON, no code fences — just the formatted text.
"""
    return generate_text(
        system, prompt, model=WRITER_MODEL, temperature=0.65, max_tokens=2200,
        label=f"case-study-section:{section_title}",
    )


def _parse_section_to_blocks(raw_text):
    """Turns the lightweight markup from _write_section into content
    blocks matching the same shape blog posts use (paragraph/heading/list)."""
    blocks = []
    list_buffer = []

    def flush_list():
        if list_buffer:
            blocks.append({"type": "list", "items": list(list_buffer)})
            list_buffer.clear()

    for raw_line in raw_text.splitlines():
        line = raw_line.strip()
        if not line:
            flush_list()
            continue
        if line.startswith("### "):
            flush_list()
            blocks.append({"type": "heading", "level": 3, "text": line[4:].strip()})
        elif line.startswith("## "):
            flush_list()
            blocks.append({"type": "heading", "level": 2, "text": line[3:].strip()})
        elif line.startswith("- ") or line.startswith("* "):
            list_buffer.append(line[2:].strip())
        else:
            flush_list()
            blocks.append({"type": "paragraph", "text": line})
    flush_list()
    return blocks


def _word_count(blocks):
    total = 0
    for b in blocks:
        if b.get("text"):
            total += len(b["text"].split())
        if b.get("items"):
            total += sum(len(i.split()) for i in b["items"])
    return total


def case_study_writer(case_input, target_word_count=10000, on_section=None):
    """Generates a long-form case study section by section, from ONLY the
    facts in case_input. Returns the same overall shape blog_writer does
    (title/slug/excerpt/category/readTime/content) plus case-study-specific
    fields, so it slots into the rest of the pipeline the same way.

    on_section(index, total, section_title, word_count_so_far) is an
    optional progress callback (used by the web UI job tracker).
    """
    system = load_system_prompt()
    knowledge = load_knowledge_base()
    case_input = normalize_input(case_input)

    meta = _plan_titles(case_input)

    # Scale each section's word budget so the sections sum to roughly
    # target_word_count, preserving the outline's relative proportions.
    total_default = sum(w for _, w in SECTIONS)
    scale = target_word_count / total_default if total_default else 1.0

    content = []
    running_words = 0
    for i, (section_title, base_words) in enumerate(SECTIONS):
        if section_title == "Client Testimonial" and not case_input.get("testimonial_quote"):
            content.append({"type": "heading", "level": 2, "text": "Client Testimonial"})
            content.append({
                "type": "paragraph",
                "text": "[Testimonial Placeholder — to be added once the client provides a quote]",
            })
            running_words += 8
            if on_section:
                on_section(i + 1, len(SECTIONS), section_title, running_words)
            continue

        budget = max(150, round(base_words * scale))
        raw = _write_section(system, knowledge, case_input, section_title, budget)
        blocks = _parse_section_to_blocks(raw)
        content.extend(blocks)
        running_words += _word_count(blocks)
        if on_section:
            on_section(i + 1, len(SECTIONS), section_title, running_words)

    return {
        "title": meta.get("title"),
        "slug": meta.get("slug"),
        "excerpt": meta.get("excerpt"),
        "category": "Case Study",
        "readTime": f"{max(1, round(running_words / 220))} min read",
        "hasTestimonial": bool(case_input.get("testimonial_quote")),
        "content": content,
        "wordCount": running_words,
        "_input": case_input,
    }
