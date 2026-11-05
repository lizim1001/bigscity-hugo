#!/usr/bin/env sh
set -eu

# Run this on the lab server after setting the repository path and web root.
REPO_DIR="${REPO_DIR:-/srv/bigscity}"
WEB_ROOT="${WEB_ROOT:-/var/www/bigscity/public}"

cd "$REPO_DIR"
git pull --ff-only
hugo --minify --destination "$WEB_ROOT"
