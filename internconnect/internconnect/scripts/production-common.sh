#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
mode=${1:-}
project=${2:-}
storage=${3:-bind}
[[ "$mode" == host || "$mode" == docker ]] || { echo 'Usage: bash scripts/preflight-production.sh host|docker VERIFIED_PROJECT [bind|volume]' >&2; exit 1; }
[[ "$project" =~ ^[a-z0-9][a-z0-9_-]*$ ]] || { echo 'Supply the verified application Compose project name.' >&2; exit 1; }
[[ "$storage" == bind || "$storage" == volume ]] || exit 1
[[ -f .env.production ]] || { echo 'Create .env.production from the example first.' >&2; exit 1; }
export PRODUCTION_ENV_FILE=.env.production
compose=(docker compose --project-name "$project" --env-file .env.production -f compose.prod.yaml -f "compose.prod.${mode}-db.yaml")
if [[ "$storage" == volume ]]; then compose+=(-f compose.prod.upload-volume.yaml); fi
