import http.client
import itertools
import json
import os
import random
import socket
import ssl
import threading
import time

from lib.env import load_env

load_env()

NVIDIA_HOST = "integrate.api.nvidia.com"
NVIDIA_PATH = "/v1/chat/completions"
API_KEY = os.environ.get("NVIDIA_API_KEY", "")

# Optional pool of multiple keys (e.g. from different NVIDIA accounts) for
# true parallel generation — each worker thread pins to one key for the
# whole job, so concurrent jobs don't share (and rate-limit) a single key.
# NVIDIA_API_KEYS="key1,key2,key3,key4,key5" — falls back to the single
# NVIDIA_API_KEY above if unset.
_pool_raw = os.environ.get("NVIDIA_API_KEYS", "")
KEY_POOL = [k.strip() for k in _pool_raw.split(",") if k.strip()] or ([API_KEY] if API_KEY else [])

_key_cycle_lock = threading.Lock()
_key_cycle = itertools.cycle(KEY_POOL) if KEY_POOL else None
_thread_state = threading.local()


def next_pool_key():
    """Round-robins through KEY_POOL. Call once per job from the thread that
    will run it, then set_current_key(...) with the result."""
    with _key_cycle_lock:
        if not _key_cycle:
            return API_KEY
        return next(_key_cycle)


def set_current_key(key):
    """Pins the calling thread to a specific API key for all subsequent
    generate_text/generate_json calls it makes."""
    _thread_state.api_key = key


def _get_api_key():
    return getattr(_thread_state, "api_key", None) or API_KEY


def set_progress_callback(callback):
    """callback(model, total_chars_received_so_far) — called periodically
    while streaming, for a caller (e.g. the web UI's job tracker) to show
    live "characters received" progress per job. Thread-local, so it only
    affects the calling thread's generations."""
    _thread_state.on_progress = callback


def _get_progress_callback():
    return getattr(_thread_state, "on_progress", None)


WRITER_MODEL = os.environ.get("NVIDIA_MODEL_WRITER", "meta/llama-4-maverick-17b-128e-instruct")
FAST_MODEL = os.environ.get("NVIDIA_MODEL_FAST", "nvidia/llama-3.3-nemotron-super-49b-v1")

# Ordered fallback chain. Whatever model a call starts on, if it 404s (not
# entitled on this account) or exhausts its retries, we drop to the next
# entry here that hasn't been tried yet. Override with a comma-separated
# NVIDIA_MODEL_CHAIN env var if you want a different order/set.
# meta/llama-3.1-70b-instruct is kept in the chain since it's the one that
# was actually confirmed working for you; meta/llama-3.2-1b-instruct stays
# as the final, low-quality, last-resort fallback.
# NOTE: NVIDIA's free catalog changes — models get deprecated/added with
# little notice. If something in this chain stops working, swap it via
# NVIDIA_MODEL_CHAIN rather than editing this file.
_default_chain = os.environ.get(
    "NVIDIA_MODEL_CHAIN",
    f"{WRITER_MODEL},{FAST_MODEL},meta/llama-3.1-70b-instruct,meta/llama-3.2-1b-instruct",
)
MODEL_CHAIN = [m.strip() for m in _default_chain.split(",") if m.strip()]

RETRYABLE_CODES = {
    "ETIMEDOUT",
    "ECONNRESET",
    "ENOTFOUND",
    "EAI_AGAIN",
    "ECONNREFUSED",
    "ECONNABORTED",
    "EPIPE",
    "ERR_STREAM_PREMATURE_CLOSE",  # stream died mid-generation — a network drop, not a bad request. Retry it.
}

# How long, total, we're willing to keep cycling through retries/models before
# giving up for real. Flaky mobile connections can take several minutes to
# stabilize, so this defaults to a generous window rather than a fixed retry count.
MAX_WAIT_S = int(os.environ.get("NVIDIA_MAX_WAIT_MS", str(12 * 60 * 1000))) / 1000
REQUEST_TIMEOUT_S = int(os.environ.get("NVIDIA_TIMEOUT_MS", "60000")) / 1000


class NvidiaError(Exception):
    """Wraps any failure from the NVIDIA call with a status and/or code, the
    same way the JS version's error objects carried .status / .code."""

    def __init__(self, message, status=None, code=None):
        super().__init__(message)
        self.status = status
        self.code = code


def _classify(exc):
    """Map a raw exception to an (status, code) pair used by _is_retryable /
    _is_not_entitled."""
    if isinstance(exc, NvidiaError):
        return exc.status, exc.code
    if isinstance(exc, (socket.timeout, TimeoutError)):
        return None, "ETIMEDOUT"
    if isinstance(exc, http.client.IncompleteRead):
        return None, "ERR_STREAM_PREMATURE_CLOSE"
    if isinstance(exc, (ConnectionResetError, http.client.RemoteDisconnected)):
        return None, "ECONNRESET"
    if isinstance(exc, ConnectionRefusedError):
        return None, "ECONNREFUSED"
    if isinstance(exc, BrokenPipeError):
        return None, "EPIPE"
    if isinstance(exc, socket.gaierror):
        return None, "ENOTFOUND"
    return None, type(exc).__name__


def _is_retryable(status, code):
    if code in RETRYABLE_CODES:
        return True
    if status == 429:
        return True
    if status is not None and 500 <= status < 600:
        return True
    return False


def _is_not_entitled(status, _code):
    # "Function not found" style 404s mean the model isn't deployed/entitled
    # for this account/key — retrying the same model will never help.
    return status == 404


def _build_chain(requested_model):
    return [requested_model] + [m for m in MODEL_CHAIN if m != requested_model]


def _stream_completion(model, system_prompt, user_prompt, temperature, max_tokens, label):
    """Raw HTTPS POST to NVIDIA's OpenAI-compatible endpoint, parsing SSE
    chunks and accumulating the text. Opens a brand-new connection every
    call (no pooling/keep-alive) — a stale reused socket getting silently
    killed mid-stream by the network is what caused the original failures.
    """
    payload = json.dumps(
        {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }
    ).encode("utf-8")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {_get_api_key()}",
        "Content-Length": str(len(payload)),
        "Connection": "close",
    }

    conn = http.client.HTTPSConnection(
        NVIDIA_HOST, timeout=REQUEST_TIMEOUT_S, context=ssl.create_default_context()
    )
    try:
        conn.request("POST", NVIDIA_PATH, body=payload, headers=headers)
        resp = conn.getresponse()

        if resp.status < 200 or resp.status >= 300:
            err_body = resp.read().decode("utf-8", errors="replace")
            raise NvidiaError(f"NVIDIA API error {resp.status}: {err_body[:300]}", status=resp.status)

        full_parts = []
        chunks = 0
        while True:
            line = resp.readline()
            if not line:
                break
            text = line.decode("utf-8", errors="ignore").strip()
            if not text.startswith("data:"):
                continue
            data_str = text[5:].strip()
            if data_str == "[DONE]":
                continue
            try:
                parsed = json.loads(data_str)
            except json.JSONDecodeError:
                continue
            choices = parsed.get("choices") or []
            delta = choices[0].get("delta", {}).get("content", "") if choices else ""
            if delta:
                full_parts.append(delta)
                chunks += 1
                if chunks % 25 == 0:
                    total_len = sum(len(p) for p in full_parts)
                    prefix = f" {label}" if label else ""
                    print(f"[nvidia]{prefix} ...{total_len} chars received (model: {model})")
                    callback = _get_progress_callback()
                    if callback:
                        try:
                            callback(model, total_len)
                        except Exception:  # noqa: BLE001 — never let a UI hook break generation
                            pass
        final_text = "".join(full_parts).strip()
        callback = _get_progress_callback()
        if callback:
            try:
                callback(model, len(final_text))
            except Exception:  # noqa: BLE001
                pass
        return final_text
    finally:
        conn.close()


def generate_text(
    system_prompt,
    user_prompt,
    model=None,
    temperature=0.7,
    max_tokens=4096,
    retries=3,
    label=None,
):
    """
    Generic completion call against NVIDIA NIM (OpenAI-compatible), using a
    raw HTTPS connection — no external SDK, no connection pooling.
    - Streams the response (keeps the connection "warm" during long generations).
    - Retries the SAME model first on transient errors (timeouts, resets,
      dropped streams, 429/5xx) with exponential backoff.
    - Falls to the next model in the chain on repeated failure, or immediately
      on a 404 (model not entitled on this account).
    - Keeps cycling through the whole chain, round after round, until
      something succeeds or a wall-clock budget (NVIDIA_MAX_WAIT_MS, default
      12 min) runs out — flaky connections can take a few minutes to stabilize.
    """
    model = model or WRITER_MODEL
    chain = _build_chain(model)
    deadline = time.monotonic() + MAX_WAIT_S
    last_err = None
    round_num = 0

    while time.monotonic() < deadline:
        round_num += 1
        for current_model in chain:
            attempt = 0
            while attempt <= retries:
                if time.monotonic() >= deadline:
                    print(
                        f"[nvidia] gave up after {round_num} round(s) through the model chain "
                        f"— {MAX_WAIT_S:.0f}s budget exceeded"
                    )
                    raise last_err
                try:
                    return _stream_completion(
                        current_model, system_prompt, user_prompt, temperature, max_tokens, label
                    )
                except Exception as exc:  # noqa: BLE001 — deliberately broad; classified below
                    last_err = exc
                    status, code = _classify(exc)

                    if _is_not_entitled(status, code):
                        print(
                            f'[nvidia] model "{current_model}" returned 404 '
                            f"(not entitled on this account?) — moving to next model in chain"
                        )
                        break

                    if attempt == retries or not _is_retryable(status, code):
                        print(
                            f'[nvidia] model "{current_model}" failed after {attempt + 1} attempt(s) '
                            f"({code or status}) — moving to next model in chain"
                        )
                        break

                    delay = min(1000 * (2 ** attempt), 20_000) / 1000 + random.random() * 0.5
                    print(
                        f'[nvidia] transient error ({code or status}) on "{current_model}", '
                        f"retry {attempt + 1}/{retries} in {delay:.2f}s"
                    )
                    time.sleep(delay)
                    attempt += 1
        if time.monotonic() < deadline:
            round_delay = min(5 * round_num, 30)
            print(
                f"[nvidia] all models failed this round (round {round_num}) — "
                f"waiting {round_delay}s before trying the chain again"
            )
            time.sleep(round_delay)

    print(f"[nvidia] gave up after {round_num} round(s) through the model chain — {MAX_WAIT_S:.0f}s budget exceeded")
    raise last_err


def _strip_fences(text):
    return text.replace("```json", "").replace("```JSON", "").replace("```", "").strip()


def generate_json(system_prompt, user_prompt, model=None, temperature=0.7, max_tokens=4096, retries=3, label=None):
    model = model or FAST_MODEL
    raw = generate_text(
        system_prompt, user_prompt, model=model, temperature=temperature, max_tokens=max_tokens,
        retries=retries, label=label,
    )
    return _safe_parse_json(raw, system_prompt, user_prompt, model, temperature, max_tokens, retries, label)


def _safe_parse_json(raw, system_prompt, user_prompt, model, temperature, max_tokens, retries, label, attempt=0):
    try:
        return json.loads(_strip_fences(raw))
    except json.JSONDecodeError as exc:
        if attempt >= 1:
            raise ValueError(f"Failed to parse JSON from model after retry: {exc}\nRaw: {raw[:500]}") from exc
        retry_prompt = (
            user_prompt
            + "\n\nIMPORTANT: Your previous response was not valid JSON. "
            "Return ONLY raw JSON, no markdown fences, no commentary, no preamble."
        )
        retry_raw = generate_text(
            system_prompt, retry_prompt, model=model, temperature=temperature, max_tokens=max_tokens,
            retries=retries, label=label,
        )
        return _safe_parse_json(retry_raw, system_prompt, user_prompt, model, temperature, max_tokens, retries, label, attempt + 1)
