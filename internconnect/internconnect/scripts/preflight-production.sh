#!/usr/bin/env bash
source "$(dirname "$0")/production-common.sh"
command -v python3 >/dev/null
docker info >/dev/null
echo "Branch: $(git branch --show-current); commit: $(git rev-parse --short HEAD)"
git status --short
"${compose[@]}" config --quiet
"${compose[@]}" config --format json | python3 scripts/check-production.py "$mode"
echo 'Preflight passed. Verify both DBs, existing records and backups manually before deploy.'
