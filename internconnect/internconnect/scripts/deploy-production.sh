#!/usr/bin/env bash
source "$(dirname "$0")/production-common.sh"
[[ -z "$(git status --porcelain)" ]] || { echo 'Working tree must be clean before deploy.' >&2; exit 1; }
[[ "${DEPLOY_BACKUP_CONFIRMED:-}" == yes ]] || { echo 'Verify DB/upload backups, then set DEPLOY_BACKUP_CONFIRMED=yes.' >&2; exit 1; }
bash scripts/preflight-production.sh "$mode" "$project" "$storage"
# Builds do not touch running containers; failed builds preserve the old app.
"${compose[@]}" build api nginx
# Dynamic upstream resolves only at request time; syntax check needs no running API.
nginx_image=$("${compose[@]}" config --format json | python3 -c 'import json,sys; print(json.load(sys.stdin)["services"]["nginx"]["image"])')
docker run --rm --network none --entrypoint nginx "$nginx_image" -t
"${compose[@]}" up -d --no-deps --wait --wait-timeout 180 api
"${compose[@]}" up -d --no-deps --wait --wait-timeout 180 nginx
"${compose[@]}" ps
echo 'Containers healthy. Complete the manual data/login/upload checks in DEPLOYMENT_CHECKLIST.md.'
