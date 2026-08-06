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
