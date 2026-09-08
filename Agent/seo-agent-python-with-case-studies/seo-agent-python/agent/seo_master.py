"""HMorix SEO Master — Interactive Conversational Content & SEO Engine.

Powers the ChatGPT-like conversational workspace.
Provides:
- Claude-style questioning & thinking mode
- Long-tail keyword discovery & search intent analysis
- HMorix product/achievement anchoring (BillingFlow, HRM, CRM, local UP/NCR markets)
- Generates high-impact blogs, whitepapers, case studies, press releases, and audits
- Formats draft packages ready for direct pipeline publishing or local saving.
"""

import json
import os
import re
from lib import nvidia

KNOWLEDGE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "knowledge")


def _load_knowledge():
    """Loads HMorix core context so generated content is deeply grounded."""
    parts = []
    files = ["company.md", "products.md", "services.md", "brand-voice.md", "audience.md", "faq.md"]
    for f in files:
        p = os.path.join(KNOWLEDGE_DIR, f)
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as fh:
                    parts.append(f"### Knowledge: {f}\n{fh.read()[:2500]}")
            except Exception:
                pass
    return "\n\n".join(parts)


SYSTEM_PROMPT = f"""You are the **HMorix SEO Master & Content Strategist**, an enterprise-grade AI content director for HMorix (https://hmorix.in).

HMorix is a unified SaaS and digital transformation platform founded by Harsh Sharma, headquartered in Hathras, Uttar Pradesh, with active markets across Delhi NCR, Agra, Mathura, and Mumbai.
Key Products & Capabilities:
- **HRM (Human Resource Management)**: Biometric/geo-fenced attendance, multi-tiered leave approvals, automated PF/ESI/TDS payroll, ATS recruitment.
- **BillingFlow**: Real-time GST compliant invoice engine, automated PDF tax receipts, recurring billing.
- **CRM & Sales**: Lead pipeline tracking, field sales check-in, revenue forecasting.
- **Client & Employee Portals**: Self-service documents, tickets, clock-in/out, milestone delivery.
- **AI & Automation**: Enterprise custom AI agents, automated workflow pipelines.

{_load_knowledge()}

### OPERATIONAL DIRECTIVES:
1. **Interactive Claude-style dialogue**:
   - If the user's prompt is an open idea, topic, or brief request, DO NOT just vomit generic text.
   - First, provide your analytical **Thinking Process** (target search intent, long-tail keyword cluster, user persona, competitor gap).
   - Then, present a high-level strategic angle, and provide 2-3 sharp **Clarifying Questions** with suggested response options to narrow the target audience, tone, or specific case metrics.
   - If the user says "generate now", "write it", "proceed", or provides comprehensive details, draft the **Full, Publication-Ready Content**.

2. **SEO & Content Excellence**:
   - Every piece of content must feature:
     * Primary Keyword and 4-8 high-intent **Long-tail Keywords**.
     * Search Intent classification (Informational, Commercial, Navigational, Transactional).
     * Semantic H2/H3 architecture (optimized for Google Featured Snippets & People Also Ask).
     * Quantitative metrics, case numbers, or operational ROI wherever applicable.
     * Strategic Call-to-Action (CTA) directing readers to HMorix solutions.
     * Schema suggestion (e.g. FAQPage schema, Article schema).

3. **Output Format**:
   You MUST return a JSON object with this exact structure:
   {{
     "thinking_steps": [
       "Step 1: Search Intent & Persona Analysis...",
       "Step 2: Long-tail Keyword Semantic Expansion...",
       "Step 3: Strategic Angle & Competitive Differentiation...",
       "Step 4: HMorix Product Ecosystem & Evidence Weaving..."
     ],
     "clarifying_questions": [
       {{
         "question": "Which specific industry sector should we anchor this piece on?",
         "options": ["Hospitality & Hotels", "Manufacturing SMBs", "Retail & Distribution", "Healthcare & Clinics"]
       }},
       {{
         "question": "What is the primary target geographic market?",
         "options": ["Delhi NCR & Tier 1", "Agra, Mathura & Hathras (Regional UP)", "Pan-India Enterprise"]
       }}
     ],
     "title": "Extracted or Proposed Catchy Headline",
     "reply": "The full conversational response formatted in clean Markdown (including the draft content if ready, or the strategic pitch with the questions)."
   }}

Always return raw JSON with no markdown wrapping fences around the JSON object.
"""


def handle_chat(message: str, content_type: str = "blog", model: str = None, thinking_enabled: bool = True, history: list = None):
    """Processes a user message through the SEO Master conversation loop."""
    selected_model = model or nvidia.WRITER_MODEL
    history = history or []

    # Build conversation context from history
    context_msgs = []
    for h in history[-6:]:  # last 6 exchanges
        role = "User" if h.get("role") == "user" else "Assistant"
        text = h.get("text") or ""
        context_msgs.append(f"{role}: {text[:1500]}")

    history_str = "\n\n".join(context_msgs) if context_msgs else "(No prior context)"

    user_prompt = f"""Target Content Mode: {content_type.upper()}
Thinking Mode Active: {"YES" if thinking_enabled else "NO"}

Conversation Context:
{history_str}

User's Latest Input:
{message}

Analyze the user's intent. If this is a new topic or idea, deliver thinking steps, proposed outline with target long-tails, and 2-3 clarifying questions. If the user is giving answers or asking for full generation, generate the complete, comprehensive piece with full headings, long-tails, meta description, and CTA. Return the specified JSON object."""

    try:
        data = nvidia.generate_json(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_prompt,
            model=selected_model,
            temperature=0.6,
            max_tokens=4096,
            label="seo_master"
        )
        return {
            "ok": True,
            "thinking_steps": data.get("thinking_steps") or [],
            "clarifying_questions": data.get("clarifying_questions") or [],
            "title": data.get("title") or "Generated Content",
            "reply": data.get("reply") or "Analysis complete.",
        }
    except Exception as err:
        # Graceful fallback: text generation if JSON parse fails
        try:
            fallback_text = nvidia.generate_text(
                system_prompt=SYSTEM_PROMPT + "\nReturn markdown response directly.",
                user_prompt=user_prompt,
                model=selected_model,
                temperature=0.7,
                max_tokens=4096,
                label="seo_master_fallback"
            )
            return {
                "ok": True,
                "thinking_steps": [
                    "Identified user query intent and target audience requirements",
                    "Mapped long-tail keywords for enterprise and SMB search profiles",
                    "Drafted comprehensive content with HMorix brand context"
                ],
                "clarifying_questions": [],
                "title": "HMorix Content Draft",
                "reply": fallback_text
            }
        except Exception as inner_err:
            return {
                "ok": False,
                "error": f"Model inference error: {str(inner_err or err)}"
            }
