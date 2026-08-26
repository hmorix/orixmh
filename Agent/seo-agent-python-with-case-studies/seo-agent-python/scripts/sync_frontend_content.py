import json
import os
import re
import sys
from datetime import datetime, timezone
from xml.sax.saxutils import escape

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.env import load_env  # noqa: E402

load_env()

SITE_URL = os.environ.get("SITE_URL", "https://hmorix.in").rstrip("/")
SITEMAP_OUTPUT_PATH = os.environ.get(
    "SITEMAP_OUTPUT_PATH",
    os.path.join(os.getcwd(), "generated", "sitemap.xml"),
)
POSTS_INDEX_FILE = os.environ.get(
    "POSTS_INDEX_FILE",
    os.path.join(os.getcwd(), "generated", "postsIndex.json"),
)
CASE_STUDIES_INDEX_FILE = os.environ.get(
    "CASE_STUDIES_INDEX_FILE",
    os.path.join(os.getcwd(), "generated", "caseStudiesIndex.json"),
)
WHITEPAPERS_INDEX_FILE = os.environ.get(
    "WHITEPAPERS_INDEX_FILE",
    os.path.join(os.getcwd(), "generated", "whitepapersIndex.json"),
)
PRESS_INDEX_FILE = os.environ.get(
    "PRESS_INDEX_FILE",
    os.path.join(os.getcwd(), "generated", "pressIndex.json"),
)

agent_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
repo_root = os.path.abspath(os.path.join(agent_root, "..", "..", ".."))
PUBLIC_LINKS_OUTPUT_PATH = os.environ.get(
    "PUBLIC_SITEMAP_LINKS_OUTPUT_PATH",
    os.path.join(repo_root, "client", "src", "lib", "publicSitemapLinks.ts"),
)

STATIC_SECTIONS = [
    {
        "title": "Main Pages",
        "links": [
            {"to": "/", "label": "Home", "priority": "1.0", "changefreq": "weekly"},
            {"to": "/about", "label": "About Us", "priority": "0.8"},
            {"to": "/services", "label": "Services", "priority": "0.9", "changefreq": "weekly"},
            {"to": "/pricing", "label": "Pricing", "priority": "0.8"},
            {"to": "/contact", "label": "Contact", "priority": "0.8"},
            {"to": "/sitemap", "label": "Sitemap", "priority": "0.5"},
        ],
    },
    {
        "title": "Services",
        "links": [
            {"to": "/services/web-design", "label": "Web Design & Development", "priority": "0.9", "changefreq": "weekly"},
            {"to": "/services/mobile-apps", "label": "Mobile App & APK Development", "priority": "0.9", "changefreq": "weekly"},
            {"to": "/services/digital-marketing", "label": "Digital Marketing & SEO", "priority": "0.9", "changefreq": "weekly"},
            {"to": "/services/ai-solutions", "label": "AI & Machine Learning", "priority": "0.9", "changefreq": "weekly"},
            {"to": "/services/software-development", "label": "Custom Software Development", "priority": "0.9", "changefreq": "weekly"},
            {"to": "/services/advertising", "label": "Advertising & Ad Tech", "priority": "0.8", "changefreq": "weekly"},
            {"to": "/services/ecommerce", "label": "E-commerce Solutions", "priority": "0.8", "changefreq": "weekly"},
        ],
    },
    {
        "title": "Products",
        "links": [
            {"to": "/billingflow", "label": "BillingFlow", "priority": "0.9", "changefreq": "weekly"},
            {"to": "/billingflow/features", "label": "BillingFlow Features", "priority": "0.8"},
            {"to": "/billingflow/pricing", "label": "BillingFlow Pricing", "priority": "0.8"},
            {"to": "/billingflow/docs", "label": "BillingFlow Docs", "priority": "0.7"},
            {"to": "/billingflow/api", "label": "BillingFlow API", "priority": "0.7"},
            {"to": "/billingflow/demo", "label": "BillingFlow Demo", "priority": "0.7"},
            {"to": "/billingflow/changelog", "label": "BillingFlow Changelog", "priority": "0.6"},
            {"to": "/agent", "label": "AI Agent", "priority": "0.8", "changefreq": "weekly"},
            {"to": "/agent/playground", "label": "AI Agent Playground", "priority": "0.7"},
            {"to": "/agent/docs", "label": "AI Agent Docs", "priority": "0.7"},
            {"to": "/agent/templates", "label": "AI Agent Templates", "priority": "0.7"},
            {"to": "/agent/workflows", "label": "AI Agent Workflows", "priority": "0.7"},
            {"to": "/agent/examples", "label": "AI Agent Examples", "priority": "0.6"},
            {"to": "/pdf-automation", "label": "PDF Automation", "priority": "0.8", "changefreq": "weekly"},
            {"to": "/pdf-automation/docs", "label": "PDF Docs", "priority": "0.7"},
            {"to": "/pdf-automation/demo", "label": "PDF Demo", "priority": "0.7"},
            {"to": "/pdf-automation/templates", "label": "PDF Templates", "priority": "0.7"},
            {"to": "/smart-home", "label": "Smart Home Division", "priority": "0.7"},
        ],
    },
    {
        "title": "Trust & Support",
        "links": [
            {"to": "/security", "label": "Security Center", "priority": "0.7"},
            {"to": "/status", "label": "System Status", "priority": "0.6"},
            {"to": "/trust", "label": "Trust Center", "priority": "0.7"},
            {"to": "/compliance", "label": "Compliance Center", "priority": "0.6"},
            {"to": "/certifications", "label": "Certifications", "priority": "0.6"},
            {"to": "/support", "label": "Support Center", "priority": "0.6"},
            {"to": "/knowledge-base", "label": "Knowledge Base", "priority": "0.6"},
            {"to": "/faq", "label": "FAQ", "priority": "0.6"},
            {"to": "/testimonials", "label": "Testimonials", "priority": "0.5"},
        ],
    },
    {
        "title": "Company",
        "links": [
            {"to": "/careers", "label": "Careers", "priority": "0.6"},
            {"to": "/investors", "label": "Investors", "priority": "0.5"},
            {"to": "/partners", "label": "Partners", "priority": "0.5"},
            {"to": "/roadmap", "label": "Roadmap", "priority": "0.5"},
            {"to": "/media-kit", "label": "Media Kit", "priority": "0.5"},
            {"to": "/harsh-sharma", "label": "Harsh Sharma", "priority": "0.7"},
            {"to": "/harsh-sharma-developer", "label": "Harsh Sharma Developer", "priority": "0.7"},
        ],
    },
    {
        "title": "Legal",
        "links": [
            {"to": "/terms", "label": "Terms of Service", "priority": "0.3", "changefreq": "yearly"},
            {"to": "/privacy", "label": "Privacy Policy", "priority": "0.3", "changefreq": "yearly"},
        ],
    },
]

CITY_SERVICES = {
    "hathras": ["web-app-development", "hosting", "automation", "ai-integration", "software", "seo", "products"],
    "mathura": ["web-app-development", "hosting", "automation", "ai-integration", "software", "seo", "products"],
    "aligarh": ["web-app-development", "hosting", "automation", "ai-integration", "software", "seo", "products"],
    "agra": ["web-app-development", "hosting", "automation", "ai-integration", "software", "seo", "products"],
    "vrindavan": ["web-app-development", "hosting", "automation", "ai-integration", "software", "seo", "products"],
    "delhi": ["web-app-development", "ai-integration", "software", "seo"],
    "noida": ["web-app-development", "ai-integration", "software", "seo"],
    "mumbai": ["web-app-development", "ai-integration", "software", "products"],
    "bengaluru": ["web-app-development", "ai-integration", "software", "products"],
}

SERVICE_LABELS = {
    "web-app-development": "Web App Development",
    "hosting": "Hosting",
    "automation": "Automation",
    "ai-integration": "AI Integration",
    "software": "Software",
    "seo": "SEO",
    "products": "Products",
}


def sync_frontend_content():
    sections = [dict(section, links=[dict(link) for link in section["links"]]) for section in STATIC_SECTIONS]

    resources = {
        "title": "Resources",
        "links": [
            {"to": "/blog", "label": "Blog", "priority": "0.8", "changefreq": "daily"},
            {"to": "/case-studies", "label": "Case Studies", "priority": "0.7"},
            {"to": "/whitepapers", "label": "Whitepapers", "priority": "0.6"},
            {"to": "/press", "label": "Press Releases", "priority": "0.6"},
            {"to": "/developers", "label": "Developer Platform", "priority": "0.7"},
            {"to": "/playground", "label": "AI Playground", "priority": "0.6"},
            {"to": "/architecture", "label": "Technical Architecture", "priority": "0.6"},
        ],
    }

    posts = _publishable_items(_read_json(POSTS_INDEX_FILE))
    case_studies = _publishable_items(_read_json(CASE_STUDIES_INDEX_FILE))
    whitepapers = _publishable_items(_read_json(WHITEPAPERS_INDEX_FILE))
    press_releases = _publishable_items(_read_json(PRESS_INDEX_FILE))

    for post in posts:
        resources["links"].append(_content_link("/blog", post, post.get("title"), "0.7"))
    for item in case_studies:
        resources["links"].append(_content_link("/case-studies", item, item.get("title"), "0.6"))
    for item in whitepapers:
        resources["links"].append(_content_link("/whitepapers", item, item.get("title"), "0.6"))
        pdf_link = _pdf_link("/whitepaper-pdfs", item)
        if pdf_link:
            resources["links"].append(pdf_link)
    for item in press_releases:
        resources["links"].append(_content_link("/press", item, item.get("headline") or item.get("title"), "0.6"))
        pdf_link = _pdf_link("/press-pdfs", item)
        if pdf_link:
            resources["links"].append(pdf_link)

    sections.insert(4, resources)
    sections.insert(-1, {"title": "Service Areas", "links": _location_links()})

    _write_public_links_ts(sections)
    _write_xml_sitemap(sections)

    print(
        "[sync-frontend-content] Synced "
        f"{len(posts)} blog(s), {len(case_studies)} case stud(y/ies), "
        f"{len(whitepapers)} whitepaper(s), {len(press_releases)} press release(s)"
    )
    print(f"[sync-frontend-content] Wrote {PUBLIC_LINKS_OUTPUT_PATH}")
    print(f"[sync-frontend-content] Wrote {SITEMAP_OUTPUT_PATH}")
    return SITEMAP_OUTPUT_PATH


def _read_json(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, list) else []
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def _publishable_items(items):
    return [item for item in items if _is_publishable(item)]


def _is_publishable(item):
    if not item.get("slug"):
        return False
    if item.get("isDemo") or item.get("is_demo"):
        return False
    haystack = " ".join(
        str(item.get(key) or "")
        for key in ("title", "headline", "excerpt", "clientName", "client_name")
    ).lower()
    return not any(token in haystack for token in ("sample", "demo", "placeholder", "["))


def _content_link(prefix, item, label, priority):
    return {
        "to": f"{prefix}/{item['slug']}",
        "label": label or _title_case(item["slug"]),
        "priority": priority,
        "changefreq": "monthly",
        "lastmod": item.get("updatedAt") or item.get("updated_at") or item.get("publishedAt") or item.get("published_at"),
    }


def _pdf_link(prefix, item):
    if not (item.get("pdfGenerated") or item.get("pdf_generated")):
        return None
    path = f"{prefix}/{item['slug']}.pdf"
    public_root = os.path.abspath(os.path.join(repo_root, "client", "public"))
    if not os.path.exists(os.path.join(public_root, path.lstrip("/"))):
        return None
    return {
        "to": path,
        "label": f"{item.get('title') or item.get('headline') or _title_case(item['slug'])} PDF",
        "priority": "0.4",
        "changefreq": "yearly",
        "lastmod": item.get("updatedAt") or item.get("updated_at") or item.get("publishedAt") or item.get("published_at"),
        "asset": True,
    }


def _location_links():
    links = []
    for city, services in CITY_SERVICES.items():
        for service in services:
            links.append({
                "to": f"/locations/{city}/{service}",
                "label": f"{_title_case(city)} {SERVICE_LABELS.get(service, _title_case(service))}",
                "priority": "0.8" if city in ("delhi", "noida", "mumbai", "bengaluru") else "0.9" if service == "web-app-development" else "0.8",
                "changefreq": "monthly",
            })
    return links


def _write_public_links_ts(sections):
    serializable = [
        {
            "title": section["title"],
            "links": [
                {key: value for key, value in link.items() if key in ("to", "label", "asset")}
                for link in section["links"]
            ],
        }
        for section in sections
    ]
    content = (
        "// AUTO-GENERATED by scripts/sync_frontend_content.py -- do not edit by hand.\n"
        "export type SitemapLink = {\n"
        "  to: string\n"
        "  label: string\n"
        "  asset?: boolean\n"
        "}\n\n"
        "export type SitemapSection = {\n"
        "  title: string\n"
        "  links: SitemapLink[]\n"
        "}\n\n"
        f"export const publicSitemapSections: SitemapSection[] = {_to_ts(serializable)}\n"
    )
    os.makedirs(os.path.dirname(PUBLIC_LINKS_OUTPUT_PATH), exist_ok=True)
    with open(PUBLIC_LINKS_OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(content)


def _write_xml_sitemap(sections):
    seen = set()
    entries = []
    for section in sections:
        for link in section["links"]:
            if link["to"] in seen:
                continue
            seen.add(link["to"])
            entries.append(_url_entry(link))

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(entries)
        + "\n</urlset>\n"
    )
    os.makedirs(os.path.dirname(SITEMAP_OUTPUT_PATH), exist_ok=True)
    with open(SITEMAP_OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(xml)


def _url_entry(link):
    lastmod = _valid_lastmod(link.get("lastmod"))
    parts = ["  <url>", f"    <loc>{escape(SITE_URL + link['to'])}</loc>"]
    if lastmod:
        parts.append(f"    <lastmod>{escape(lastmod)}</lastmod>")
    parts.append(f"    <changefreq>{escape(link.get('changefreq') or 'monthly')}</changefreq>")
    parts.append(f"    <priority>{escape(link.get('priority') or '0.5')}</priority>")
    parts.append("  </url>")
    return "\n".join(parts)


def _valid_lastmod(value):
    if not value:
        return None
    text = str(value)
    try:
        datetime.fromisoformat(text.replace("Z", "+00:00"))
        return text
    except ValueError:
        return None


def _to_ts(value):
    return json.dumps(value, indent=2, ensure_ascii=False).replace('"to"', "to").replace('"label"', "label").replace('"asset"', "asset").replace('"title"', "title").replace('"links"', "links")


def _title_case(value):
    return " ".join(part.capitalize() for part in re.split(r"[-_]+", value or "") if part)


if __name__ == "__main__":
    sync_frontend_content()
