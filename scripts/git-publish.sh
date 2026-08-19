#!/usr/bin/env sh
set -eu

branch="$(git branch --show-current)"
if [ -z "$branch" ]; then
  echo "Could not detect the current branch."
  exit 1
fi

message="${*:-}"
if [ -z "$message" ]; then
  printf "Commit message: "
  IFS= read -r message
fi

if [ -z "$message" ]; then
  echo "Commit message is required."
  exit 1
fi

git add .

if git diff --cached --quiet; then
  echo "No changes to commit."
else
  git commit -m "$message"
fi

git push origin "$branch"
