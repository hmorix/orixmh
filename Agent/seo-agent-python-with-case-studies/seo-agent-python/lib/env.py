import os


def load_env(path=None):
    """Minimal .env loader — stdlib only, no python-dotenv dependency.

    Mirrors `import "dotenv/config"` from the Node version: reads KEY=VALUE
    lines from a .env file in the project root and sets them into
    os.environ, without overriding any value already set in the real
    environment.
    """
    agent_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    repo_root = os.path.abspath(os.path.join(agent_root, "..", "..", ".."))

    candidate_paths = [
        path if path else os.path.join(agent_root, ".env"),
        os.path.join(repo_root, ".env"),
    ]

    for p in candidate_paths:
        if not p or not os.path.exists(p):
            continue
        with open(p, "r", encoding="utf-8") as f:
            for raw_line in f:
                line = raw_line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip()
                if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
                    value = value[1:-1]
                if value == "":
                    continue
                os.environ.setdefault(key, value)

    # Alias VITE_NVIDIA_API_KEY to NVIDIA_API_KEY if not explicitly set
    if "NVIDIA_API_KEY" not in os.environ and "VITE_NVIDIA_API_KEY" in os.environ:
        os.environ["NVIDIA_API_KEY"] = os.environ["VITE_NVIDIA_API_KEY"]

    set_default_frontend_outputs()


def set_default_frontend_outputs():
    """When this Agent lives under the main HMorix repo, default generated
    React/SEO assets into client/src and client/public so running the Agent
    updates the website directly even if .env only contains API keys."""
    agent_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    repo_root = os.path.abspath(os.path.join(agent_root, "..", "..", ".."))
    client_root = os.path.join(repo_root, "client")
    if not os.path.isdir(client_root):
        return

    defaults = {
        "BLOG_PAGES_OUTPUT_DIR": os.path.join(client_root, "src", "generated", "blog-pages"),
        "POSTS_INDEX_FILE": os.path.join(client_root, "src", "generated", "postsIndex.json"),
        "CASE_STUDY_PAGES_OUTPUT_DIR": os.path.join(client_root, "src", "generated", "case-study-pages"),
        "CASE_STUDIES_INDEX_FILE": os.path.join(client_root, "src", "generated", "caseStudiesIndex.json"),
        "WHITEPAPER_PAGES_OUTPUT_DIR": os.path.join(client_root, "src", "generated", "whitepaper-pages"),
        "WHITEPAPERS_INDEX_FILE": os.path.join(client_root, "src", "generated", "whitepapersIndex.json"),
        "WHITEPAPER_PDF_OUTPUT_DIR": os.path.join(client_root, "public", "whitepaper-pdfs"),
        "PRESS_PAGES_OUTPUT_DIR": os.path.join(client_root, "src", "generated", "press-pages"),
        "PRESS_INDEX_FILE": os.path.join(client_root, "src", "generated", "pressIndex.json"),
        "PRESS_PDF_OUTPUT_DIR": os.path.join(client_root, "public", "press-pdfs"),
        "SITEMAP_OUTPUT_PATH": os.path.join(client_root, "public", "sitemap.xml"),
        "RSS_OUTPUT_PATH": os.path.join(client_root, "public", "rss.xml"),
    }
    for key, value in defaults.items():
        os.environ.setdefault(key, value)
