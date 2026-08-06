import os


def load_env(path=None):
    """Minimal .env loader — stdlib only, no python-dotenv dependency.

    Mirrors `import "dotenv/config"` from the Node version: reads KEY=VALUE
    lines from a .env file in the project root and sets them into
    os.environ, without overriding any value already set in the real
    environment.
    """
    if path is None:
        root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        path = os.path.join(root, ".env")

    if not os.path.exists(path):
        set_default_frontend_outputs()
        return

    with open(path, "r", encoding="utf-8") as f:
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
                # An empty RHS (e.g. "SCHEDULE_HOUR=") means "not set" here,
                # not "set to empty string" — otherwise os.environ.get(key,
                # "6")-style defaults elsewhere in the codebase never kick
                # in, because the key exists with value "".
                continue
            os.environ.setdefault(key, value)

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
