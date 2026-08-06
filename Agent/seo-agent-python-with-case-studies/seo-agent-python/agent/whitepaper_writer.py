import json

from lib.nvidia import generate_text, generate_json, WRITER_MODEL, FAST_MODEL
from agent.prompt_loader import load_system_prompt, load_knowledge_base

SECTIONS = [
    ("Executive Summary", 350),
    ("Introduction & Context", 500),
    ("The Landscape / The Problem", 700),
    ("Key Findings", 700),
    ("Our Approach & Methodology", 600),
    ("Deep Dive: Core Analysis", 900),
    ("Deep Dive: Practical Implications", 700),
    ("Comparison & Trade-offs", 500),
    ("Recommendations", 600),
    ("Conclusion", 350),
    ("About HMorix", 300),
]


def _sources_block(sources):
    if not sources:
        return "(no researched sources available — do not cite anything, and do not state any fact about a " \
               "third party company/product/statistic; stick to the knowledge base and key_facts given below)"
    lines = []
    for i, s in enumerate(sources, 1):
        lines.append(f"[{i}] {s.get('title', s.get('url'))} — {s.get('url')}\n    snippet: {s.get('snippet', '')}")
    return "\n".join(lines)


def _facts_block(wp_input, sources):
    stats = wp_input.get("stats") or []
    stats_json = json.dumps(stats, indent=2) if stats else "(none supplied)"
    key_facts = wp_input.get("key_facts") or []
    key_facts_txt = "\n".join(f"- {f}" for f in key_facts if f and not str(f).startswith("[")) or "(none supplied)"
    comparison = wp_input.get("comparison_table") or {}

    return f"""
TOPIC: {wp_input.get('topic')}
TARGET AUDIENCE: {wp_input.get('target_audience')}
IS_RESEARCH (discusses other real companies/industry data): {bool(wp_input.get('is_research'))}

KEY FACTS SUPPLIED BY THE USER (treat as true, use verbatim where relevant):
{key_facts_txt}

REAL STATISTICS SUPPLIED (each has its own source — cite the source when you use one; never alter the number):
{stats_json}

COMPARISON TABLE DATA (if present, discuss it factually; don't invent extra rows/columns):
{json.dumps(comparison, indent=2) if comparison.get('headers') else '(none supplied)'}

RESEARCHED / SUPPLIED SOURCES (numbered — cite by number, e.g. "[2]", when you state something
that traces back to one of these; NEVER state a specific fact, number, or claim about a
real third-party company that isn't traceable to one of these sources, key_facts, or stats):
{_sources_block(sources)}

ABSOLUTE RULES:
1. Any specific claim about a real, named third-party company, product, or industry
   statistic MUST be attributed to a numbered source above, key_facts, or stats.
   If you don't have a source for something, don't say it — write generally
   instead (e.g. "many companies in this space report..." is not acceptable
   either; omit the claim or clearly frame it as illustrative/hypothetical).
2. Numbers in `stats` are the ONLY numbers you may state as fact. Do not
   compute, extrapolate, or invent additional statistics.
3. Paraphrase source snippets in your own words — never copy phrasing
   verbatim, and keep any single paraphrased idea to 1-2 sentences per source.
4. Statements about HMorix itself must come only from the knowledge base
   below, not be invented.
5. If IS_RESEARCH is false, do not make any claims about named third-party
   companies at all — keep the discussion general/industry-level or focused
   on HMorix's own work.
"""


def _plan_titles(wp_input, sources):
    system = load_system_prompt()
    prompt = f"""
{_facts_block(wp_input, sources)}

Generate ONLY the metadata for this white paper (not the body).

Return ONLY JSON:
{{
  "title": "",
  "slug": "url-friendly-slug",
  "excerpt": "one to two sentence summary, no invented specifics"
}}"""
    return generate_json(system, prompt, model=FAST_MODEL, temperature=0.5, max_tokens=1024, label="whitepaper-meta")


def _write_section(system, knowledge, wp_input, sources, section_title, word_budget):
    prompt = f"""
{knowledge}

---
{_facts_block(wp_input, sources)}

Write ONLY the "{section_title}" section of this white paper (not the whole
document). Target roughly {word_budget} words. Cite sources inline by number
(e.g. "[2]") wherever you state something that traces back to one.

Format as plain text using this lightweight markup:
- A line starting with "## " for the section heading (use "{section_title}")
- Lines starting with "### " for a sub-heading, if useful
- Lines starting with "- " for a bullet list item
- Blank lines between paragraphs
No JSON, no code fences — just the formatted text.
"""
    return generate_text(
        system, prompt, model=WRITER_MODEL, temperature=0.6, max_tokens=2200,
        label=f"whitepaper-section:{section_title}",
    )


def _parse_section_to_blocks(raw_text):
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


def whitepaper_writer(wp_input, sources, target_word_count=6000, on_section=None):
    """Section-by-section long-form writer. `sources` is the output of
    agent/whitepaper_researcher.research_topic — a list of real, verifiable
    {title, url, snippet} entries. Nothing in the output should assert a
    third-party fact that isn't traceable to one of these, key_facts, or
    stats in wp_input.
    """
    system = load_system_prompt()
    knowledge = load_knowledge_base()

    meta = _plan_titles(wp_input, sources)

    total_default = sum(w for _, w in SECTIONS)
    scale = target_word_count / total_default if total_default else 1.0

    content = []
    running_words = 0
    for i, (section_title, base_words) in enumerate(SECTIONS):
        budget = max(150, round(base_words * scale))
        raw = _write_section(system, knowledge, wp_input, sources, section_title, budget)
        blocks = _parse_section_to_blocks(raw)
        content.extend(blocks)
        running_words += _word_count(blocks)
        if on_section:
            on_section(i + 1, len(SECTIONS), section_title, running_words)

    return {
        "title": meta.get("title"),
        "slug": meta.get("slug"),
        "excerpt": meta.get("excerpt"),
        "content": content,
        "wordCount": running_words,
        "readTime": f"{max(1, round(running_words / 220))} min read",
        "_input": wp_input,
        "_sources": sources,
    }
