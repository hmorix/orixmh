import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.sync_frontend_content import sync_frontend_content  # noqa: E402


def generate_sitemap():
    return sync_frontend_content()


if __name__ == "__main__":
    generate_sitemap()
