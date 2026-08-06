import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request

from lib.env import load_env

load_env()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

# Same class of connection error the NVIDIA client watches for. Supabase
# calls are small/fast, so we don't need the full model-chain machinery —
# just a short retry, since the same flaky connection can affect these too.
_RETRYABLE_TRANSIENT = (
    TimeoutError,
    ConnectionResetError,
    ConnectionAbortedError,
    ConnectionRefusedError,
    BrokenPipeError,
)


class SupabaseError(Exception):
    def __init__(self, message, status=None):
        super().__init__(message)
        self.status = status


def _require_config():
    missing = []
    if not SUPABASE_URL:
        missing.append("SUPABASE_URL")
    if not SUPABASE_SERVICE_KEY:
        missing.append("SUPABASE_SERVICE_KEY")
    if missing:
        raise SupabaseError(
            f"{', '.join(missing)} not set. Check that a .env file exists in the project root "
            f"(it isn't included when the project is re-downloaded/re-extracted — you have to "
            f"copy your real .env over each time) and that it defines these values."
        )


def _headers(extra=None):
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
    }
    if extra:
        headers.update(extra)
    return headers


def _request(method, url, headers, data=None, retries=3):
    last_err = None
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, data=data, headers=headers, method=method)
            with urllib.request.urlopen(req, timeout=30) as resp:
                body = resp.read().decode("utf-8")
                return json.loads(body) if body else None
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            raise SupabaseError(f"Supabase {method} {url} failed: {exc.code} {body[:300]}", status=exc.code)
        except _RETRYABLE_TRANSIENT as exc:
            last_err = exc
            if attempt == retries:
                raise SupabaseError(f"Supabase {method} {url} failed after {attempt + 1} attempt(s): {exc}")
            delay = min(1 * (2 ** attempt), 10)
            print(f"[supabase] transient error ({exc}), retry {attempt + 1}/{retries} in {delay}s")
            time.sleep(delay)
        except urllib.error.URLError as exc:
            # DNS failure, connection refused, no network, etc. — not worth
            # retrying (it won't resolve itself), but must still come back
            # as SupabaseError so callers' fallback/offline-cache logic runs
            # instead of an unhandled exception.
            raise SupabaseError(f"Supabase {method} {url} unreachable: {exc.reason}")
    raise SupabaseError(f"Supabase {method} {url} failed: {last_err}")


def insert_row(table, record):
    """Insert one row, return the inserted row as a dict (mirrors
    `.insert(record).select().single()` in the JS supabase-js client)."""
    _require_config()
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = _headers({"Prefer": "return=representation"})
    data = json.dumps(record).encode("utf-8")
    rows = _request("POST", url, headers, data=data)
    if isinstance(rows, list):
        return rows[0] if rows else None
    return rows


def upsert_row(table, record, on_conflict="slug"):
    """Insert-or-update by a unique column (default: slug). Used for
    publishing: re-running the pipeline for the same slug updates the
    existing row instead of creating a duplicate."""
    _require_config()
    url = f"{SUPABASE_URL}/rest/v1/{table}?on_conflict={urllib.parse.quote(on_conflict)}"
    headers = _headers({"Prefer": "return=representation,resolution=merge-duplicates"})
    data = json.dumps(record).encode("utf-8")
    rows = _request("POST", url, headers, data=data)
    if isinstance(rows, list):
        return rows[0] if rows else None
    return rows


def select_rows(table, select="*", filters=None, order=None, limit=None):
    """filters: dict of {column: "operator.value"}, e.g.
    {"updated_at": "lt.2026-01-01T00:00:00.000Z"}
    order: string like "updated_at.asc" or "published_at.desc"
    """
    _require_config()
    params = {"select": select}
    if filters:
        params.update(filters)
    if order:
        params["order"] = order
    if limit:
        params["limit"] = str(limit)
    url = f"{SUPABASE_URL}/rest/v1/{table}?{urllib.parse.urlencode(params)}"
    rows = _request("GET", url, _headers())
    return rows or []


def delete_row(table, filters):
    """Deletes row(s) matching filters, e.g. delete_row("case_studies",
    {"slug": "eq.my-slug"}). Returns the deleted row(s), or [] if nothing
    matched. Careful: with no filters this would delete every row —
    filters is a required positional argument on purpose."""
    _require_config()
    if not filters:
        raise ValueError("delete_row requires at least one filter — refusing to delete an entire table.")
    params = dict(filters)
    url = f"{SUPABASE_URL}/rest/v1/{table}?{urllib.parse.urlencode(params)}"
    headers = _headers({"Prefer": "return=representation"})
    rows = _request("DELETE", url, headers)
    return rows or []


def get_by_id(table, id_value, select="*"):
    rows = select_rows(table, select=select, filters={"id": f"eq.{id_value}"}, limit=1)
    return rows[0] if rows else None


_MISSING_COLUMN_RE = re.compile(r"Could not find the '([^']+)' column")
_MISSING_SELECT_COLUMN_RE = re.compile(r"column [\w\"]+\.(\w+) does not exist")


def _strip_missing_column(record, error_message):
    match = _MISSING_COLUMN_RE.search(error_message)
    if not match:
        return None
    col = match.group(1)
    if col not in record:
        return None
    stripped = dict(record)
    stripped.pop(col)
    return col, stripped


def insert_row_resilient(table, record, max_strip=8):
    """Like insert_row, but if Supabase says a column doesn't exist (PGRST204
    — usually a migration that hasn't been run yet), strips that field and
    retries rather than failing the save entirely. Returns (row, stripped_cols)
    so callers can warn once about what didn't get saved."""
    attempt_record = dict(record)
    stripped_cols = []
    for _ in range(max_strip):
        try:
            return insert_row(table, attempt_record), stripped_cols
        except SupabaseError as err:
            result = _strip_missing_column(attempt_record, str(err))
            if not result:
                raise
            col, attempt_record = result
            stripped_cols.append(col)
    raise SupabaseError(f"Too many missing columns on {table}; gave up after stripping {stripped_cols}")


def upsert_row_resilient(table, record, on_conflict="slug", max_strip=8):
    """Same self-healing behavior as insert_row_resilient, for upserts."""
    attempt_record = dict(record)
    stripped_cols = []
    for _ in range(max_strip):
        try:
            return upsert_row(table, attempt_record, on_conflict=on_conflict), stripped_cols
        except SupabaseError as err:
            result = _strip_missing_column(attempt_record, str(err))
            if not result:
                raise
            col, attempt_record = result
            stripped_cols.append(col)
    raise SupabaseError(f"Too many missing columns on {table}; gave up after stripping {stripped_cols}")


def select_rows_resilient(table, select="*", filters=None, order=None, limit=None, max_strip=8):
    """Like select_rows, but if a requested column doesn't exist on the table
    (e.g. code asks for a column a migration hasn't added yet), drops just
    that column from the select list and retries instead of failing the
    whole read. Returns (rows, stripped_cols)."""
    columns = [c.strip() for c in select.split(",")] if select != "*" else ["*"]
    stripped_cols = []
    for _ in range(max_strip):
        try:
            rows = select_rows(table, select=",".join(columns), filters=filters, order=order, limit=limit)
            return rows, stripped_cols
        except SupabaseError as err:
            match = _MISSING_SELECT_COLUMN_RE.search(str(err))
            if not match or match.group(1) not in columns:
                raise
            col = match.group(1)
            columns.remove(col)
            stripped_cols.append(col)
            if order and order.split(".")[0] == col:
                raise SupabaseError(f"Can't self-heal: order-by column '{col}' doesn't exist on {table}")
    raise SupabaseError(f"Too many missing columns on {table}; gave up after stripping {stripped_cols}")
