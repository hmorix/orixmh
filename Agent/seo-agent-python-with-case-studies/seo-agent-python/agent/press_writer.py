import json

from lib.nvidia import generate_json, WRITER_MODEL
from agent.prompt_loader import load_system_prompt, load_knowledge_base

DEFAULTS = {
    "category": "Company News",
    "headline": "",
    "subheadline": "",
    "dateline_city": "[City, State/Country]",
    "is_commentary": False,
    "key_facts": [],
    "quote_text": "",
    "quote_attribution": "",
    "quote_role": "",
    "media_contact_name": "[Media Contact Name]",
    "media_contact_email": "[press@example.com]",
    "media_contact_phone": "",
    "cover_image_url": "",
    "reference_links": [],
    "cta_text": "Learn more about HMorix",
    "cta_url": "/contact",
}


def normalize_input(raw_input):
    merged = dict(DEFAULTS)
    merged.update({k: v for k, v in (raw_input or {}).items() if v not in (None, "")})
    return merged


def press_writer(press_input, sources, target_word_count=600):
    """Single-call generation — press releases are short enough (400-900
    words typically) that section-by-section chunking isn't needed. Same
    fabrication rules as the other writers: facts only from key_facts/
    sources, never invents a quote, boilerplate only from the knowledge
    base.
    """
    system = load_system_prompt()
    knowledge = load_knowledge_base()
    press_input = normalize_input(press_input)

    key_facts_txt = "\n".join(f"- {f}" for f in press_input.get("key_facts", []) if f and not str(f).startswith("[")) or "(none supplied)"
    sources_txt = "\n".join(f"[{i+1}] {s.get('title', s.get('url'))} — {s.get('url')}\n    {s.get('snippet','')}" for i, s in enumerate(sources or [])) or "(none)"
    has_quote = bool(press_input.get("quote_text"))

    prompt = f"""
{knowledge}

---
You are writing a press release for HMorix.

Category: {press_input['category']}
Headline (if given, keep close to it; else write one): {press_input.get('headline') or '(write one)'}
Dateline city: {press_input['dateline_city']}
is_commentary (discusses other real companies/industry news): {press_input['is_commentary']}

KEY FACTS (the ONLY source of truth for what actually happened):
{key_facts_txt}

SOURCES (numbered — cite by number if is_commentary and you reference one; never state a
third-party fact/claim that isn't traceable to one of these):
{sources_txt}

QUOTE: {'Use this EXACT quote text, do not alter it: "' + press_input['quote_text'] + '"' if has_quote else 'No quote was supplied — do NOT invent one. Set "hasQuote": false and omit quote fields from body flow (a placeholder will be shown separately).'}

ABSOLUTE RULES:
1. Do not state any fact not in KEY FACTS above. If the headline/facts are
   placeholders (start with "["), keep the release illustrative/generic
   rather than inventing specifics.
2. NEVER write a quote — use the supplied quote_text verbatim or none at all.
3. Boilerplate ("About HMorix") must be grounded only in the knowledge base above.
4. If is_commentary is true, any claim about a named third party must cite a
   source number. If false, don't discuss named third parties at all.
5. Standard press release structure: headline, dateline + lead paragraph
   (who/what/when/where/why in 1-2 sentences), 2-4 body paragraphs expanding
   on the facts, one quote (if supplied), boilerplate paragraph, closing.
   Target about {target_word_count} words total for headline through closing
   (excluding boilerplate/contact info).

Return ONLY JSON:
{{
  "headline": "",
  "subheadline": "",
  "slug": "url-friendly-slug",
  "excerpt": "one sentence summary",
  "hasQuote": {str(has_quote).lower()},
  "content": [
    {{ "type": "paragraph", "text": "lead paragraph" }},
    {{ "type": "paragraph", "text": "body paragraph" }}
  ],
  "boilerplate": "About HMorix paragraph, grounded in the knowledge base only"
}}"""

    result = generate_json(system, prompt, model=WRITER_MODEL, temperature=0.5, max_tokens=3000, label="press-writer")
    words = sum(len(b.get("text", "").split()) for b in result.get("content", []))
    result["wordCount"] = words
    result["readTime"] = f"{max(1, round(words / 220))} min read"
    result["_input"] = press_input
    return result
