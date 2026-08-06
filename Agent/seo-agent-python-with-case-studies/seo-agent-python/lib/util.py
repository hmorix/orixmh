from datetime import datetime, timezone


def iso_now():
    """Matches JS's `new Date().toISOString()` format, e.g.
    2026-07-19T10:14:21.123Z"""
    now = datetime.now(timezone.utc)
    return now.strftime("%Y-%m-%dT%H:%M:%S.") + f"{now.microsecond // 1000:03d}Z"
