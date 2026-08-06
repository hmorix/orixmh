import contextlib
import sys
import threading
import time
import uuid
from concurrent.futures import ThreadPoolExecutor

from lib import nvidia

_lock = threading.Lock()
_jobs = {}
_executor = None


def _get_executor():
    global _executor
    if _executor is None:
        workers = max(len(nvidia.KEY_POOL), 1)
        _executor = ThreadPoolExecutor(max_workers=workers, thread_name_prefix="job-worker")
    return _executor


class _TeeWriter:
    """Forwards writes to the real stdout (so CLI/terminal still sees output)
    while also buffering complete lines into the job's own log list, for the
    web UI to poll and show live progress per job."""

    def __init__(self, job_id, real_stream):
        self.job_id = job_id
        self.real_stream = real_stream
        self._buf = ""

    def write(self, text):
        self.real_stream.write(text)
        self._buf += text
        while "\n" in self._buf:
            line, self._buf = self._buf.split("\n", 1)
            with _lock:
                job = _jobs.get(self.job_id)
                if job is not None:
                    job["log"].append(line)
                    if len(job["log"]) > 500:
                        job["log"] = job["log"][-500:]

    def flush(self):
        self.real_stream.flush()


def _run_job(job_id, fn):
    key = nvidia.next_pool_key()
    key_label = f"key…{key[-4:]}" if key else "no-key-configured"
    with _lock:
        _jobs[job_id]["status"] = "running"
        _jobs[job_id]["started_at"] = time.time()
        _jobs[job_id]["key_label"] = key_label

    nvidia.set_current_key(key)

    def on_progress(model, total_chars):
        with _lock:
            job = _jobs.get(job_id)
            if job is not None:
                job["chars_received"] = total_chars
                job["current_model"] = model

    nvidia.set_progress_callback(on_progress)

    tee = _TeeWriter(job_id, sys.stdout)
    try:
        with contextlib.redirect_stdout(tee):
            result = fn()
        with _lock:
            _jobs[job_id]["status"] = "done"
            _jobs[job_id]["result"] = result
            _jobs[job_id]["finished_at"] = time.time()
    except Exception as exc:  # noqa: BLE001 — a job failing shouldn't kill the worker thread/server
        with _lock:
            _jobs[job_id]["status"] = "error"
            _jobs[job_id]["error"] = str(exc)
            _jobs[job_id]["finished_at"] = time.time()


def submit(job_type, fn, meta=None):
    """fn: zero-arg callable. Returns the new job's id immediately; the job
    runs on the background thread pool."""
    job_id = uuid.uuid4().hex[:12]
    with _lock:
        _jobs[job_id] = {
            "id": job_id,
            "type": job_type,
            "status": "queued",
            "meta": meta or {},
            "log": [],
            "chars_received": 0,
            "current_model": None,
            "created_at": time.time(),
            "started_at": None,
            "finished_at": None,
            "result": None,
            "error": None,
            "key_label": None,
            "_fn": fn,
        }
    _get_executor().submit(_run_job, job_id, fn)
    return job_id


def get_job(job_id):
    with _lock:
        job = _jobs.get(job_id)
        return _public_job(job) if job else None


def list_jobs():
    with _lock:
        return [_public_job(j) for j in sorted(_jobs.values(), key=lambda j: j["created_at"], reverse=True)]


def pool_size():
    return max(len(nvidia.KEY_POOL), 1)


def retry_job(job_id):
    with _lock:
        job = _jobs.get(job_id)
        if not job:
            return None, "not found"
        if job.get("status") != "error":
            return None, "only failed jobs can be retried"
        fn = job.get("_fn")
        if not fn:
            return None, "retry function is not available for this job"
        job_type = job.get("type", "job")
        meta = dict(job.get("meta") or {})
        meta["retry_of"] = job_id
    return submit(job_type, fn, meta=meta), None


def _public_job(job):
    out = dict(job)
    out.pop("_fn", None)
    return out
