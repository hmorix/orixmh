import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _read(rel_path):
    with open(os.path.join(ROOT, rel_path), "r", encoding="utf-8") as f:
        return f.read()


def load_system_prompt():
    system = _read("prompts/system.md")
    style = _read("prompts/writing-style.md")
    seo_rules = _read("prompts/seo-rules.md")
    return "\n".join([system, "\n---\n", style, "\n---\n", seo_rules])


def load_knowledge_base():
    files = ["company.md", "products.md", "services.md", "audience.md", "brand-voice.md", "faq.md"]
    parts = []
    for f in files:
        try:
            content = _read(f"knowledge/{f}")
            parts.append(f"## knowledge/{f}\n{content}")
        except OSError:
            parts.append("")
    return "\n\n".join(parts)


def load_template(content_type):
    mapping = {
        "blog": "templates/blog-template.md",
        "tutorial": "templates/tutorial-template.md",
        "comparison": "templates/comparison-template.md",
        "landing-page": "templates/landing-page-template.md",
    }
    file = mapping.get(content_type, mapping["blog"])
    return _read(file)
