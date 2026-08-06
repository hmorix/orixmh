"""Client for image.pollinations.ai — a free, no-signup-required image
generation API. Simple GET request, returns raw image bytes.

API shape (as documented at https://pollinations.ai/):
  GET https://image.pollinations.ai/prompt/{url-encoded prompt}
      ?width=W&height=H&seed=S&nologo=true&model=flux

No API key needed. Since this is a public, free, rate-limited service, we
keep requests conservative (reasonable timeout, small retry budget, no
concurrency) rather than hammering it.
"""
import os
import time
import urllib.error
import urllib.parse
import urllib.request

BASE_URL = "https://image.pollinations.ai/prompt"
DEFAULT_MODEL = os.environ.get("POLLINATIONS_MODEL", "flux")
DEFAULT_WIDTH = int(os.environ.get("POLLINATIONS_WIDTH", "1024"))
DEFAULT_HEIGHT = int(os.environ.get("POLLINATIONS_HEIGHT", "1024"))
TIMEOUT_S = int(os.environ.get("POLLINATIONS_TIMEOUT_S", "60"))


class PollinationsError(Exception):
    pass


def generate_image_bytes(prompt, width=None, height=None, seed=None, model=None, retries=2):
    """Returns raw image bytes (jpeg/png) for one prompt. Raises
    PollinationsError on failure after retries — callers should catch this
    per-image so one bad prompt doesn't kill a whole batch."""
    encoded_prompt = urllib.parse.quote(prompt, safe="")
    params = {
        "width": str(width or DEFAULT_WIDTH),
        "height": str(height or DEFAULT_HEIGHT),
        "nologo": "true",
        "model": model or DEFAULT_MODEL,
    }
    if seed is not None:
        params["seed"] = str(seed)
    url = f"{BASE_URL}/{encoded_prompt}?{urllib.parse.urlencode(params)}"

    last_err = None
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (seo-agent image generator)"})
            with urllib.request.urlopen(req, timeout=TIMEOUT_S) as resp:
                data = resp.read()
                if not data or len(data) < 100:
                    raise PollinationsError(f"Response too small ({len(data)} bytes) — likely an error page, not an image.")
                return data
        except urllib.error.HTTPError as exc:
            last_err = f"HTTP {exc.code}: {exc.reason}"
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            last_err = str(exc)
        if attempt < retries:
            time.sleep(2 * (attempt + 1))
    raise PollinationsError(f"Failed to generate image after {retries + 1} attempt(s): {last_err}")


def generate_image_to_file(prompt, out_path, width=None, height=None, seed=None, model=None):
    data = generate_image_bytes(prompt, width=width, height=height, seed=seed, model=model)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "wb") as f:
        f.write(data)
    return out_path
