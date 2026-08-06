import json
import os

CHECKPOINT_DIR = os.path.join(os.getcwd(), "drafts", ".checkpoints")


def _path(run_id):
    safe = "".join(c if c.isalnum() or c in "-_" else "_" for c in run_id)
    return os.path.join(CHECKPOINT_DIR, f"{safe}.json")


def load(run_id):
    """Returns the saved {step_name: result} dict for this run, or {} if none exists."""
    path = _path(run_id)
    if not os.path.exists(path):
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return {}


def save_step(run_id, step_name, result):
    """Persists the result of one completed step, merging with whatever's already saved."""
    os.makedirs(CHECKPOINT_DIR, exist_ok=True)
    state = load(run_id)
    state[step_name] = result
    with open(_path(run_id), "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)


def clear(run_id):
    """Deletes the checkpoint once a run finishes successfully (fully published/saved)."""
    path = _path(run_id)
    if os.path.exists(path):
        os.remove(path)
