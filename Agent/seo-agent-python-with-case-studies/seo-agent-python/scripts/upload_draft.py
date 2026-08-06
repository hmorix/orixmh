#!/usr/bin/env python3
# Manually (re-)upload draft(s) that were saved locally because Supabase
# couldn't be reached at the end of a pipeline run.
#
# Usage (always invoke with the interpreter — chmod/executable bits often
# don't survive a zip download + extract on Android/Termux, so `./upload_draft.py`
# can 403/Permission-denied even after chmod +x):
#   python3 scripts/upload_draft.py "drafts/pending/1737300000000-my-post.json"
#   python scripts/upload_draft.py --all      # upload every file in drafts/pending
#
import json
import os
import sys

# Allow running this script directly (`python scripts/upload_draft.py`) by
# putting the project root — not just scripts/ — on sys.path, so `lib` and
# `agent` resolve as packages either way.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.supabase import insert_row, SupabaseError  # noqa: E402

PENDING_DIR = os.path.join(os.getcwd(), "drafts", "pending")


def upload_one(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        record = json.load(f)
    print(f"[upload] {os.path.basename(file_path)} → \"{record.get('title')}\"")

    try:
        data = insert_row("blog_drafts", record)
    except SupabaseError as err:
        print(f"[upload] FAILED: {err}")
        return False

    os.remove(file_path)
    print(f"[upload] OK — saved as id {data['id']}, local copy removed.")
    return True


def main():
    args = sys.argv[1:]

    if "--all" in args:
        if not os.path.isdir(PENDING_DIR):
            print("[upload] No pending drafts directory found — nothing to do.")
            return
        files = sorted(f for f in os.listdir(PENDING_DIR) if f.endswith(".json"))
        if not files:
            print("[upload] No pending drafts found.")
            return
        print(f"[upload] Found {len(files)} pending draft(s).")
        ok = 0
        for f in files:
            if upload_one(os.path.join(PENDING_DIR, f)):
                ok += 1
        print(f"[upload] Done. {ok}/{len(files)} uploaded successfully.")
        return

    if not args:
        print("Usage: python scripts/upload_draft.py <path-to-draft.json>")
        print("   or: python scripts/upload_draft.py --all")
        sys.exit(1)

    target = args[0]
    if not os.path.exists(target):
        print(f"File not found: {target}")
        sys.exit(1)

    success = upload_one(target)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
