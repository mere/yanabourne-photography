#!/usr/bin/env bash
set -euo pipefail

HOST="${DEPLOY_HOST:-deploy@2.29.178.86}"
DEST="${DEPLOY_DEST:-/srv/yanabourne/photography/}"
SSH_KEY="${DEPLOY_SSH_KEY:-}"

if [[ -n "$SSH_KEY" ]]; then
  RSYNC_SSH=(ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new)
else
  RSYNC_SSH=(ssh -o StrictHostKeyChecking=accept-new)
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

npm ci
npm run build

echo "Syncing dist/ to ${HOST}:${DEST}"
rsync -avz --delete -e "${RSYNC_SSH[*]}" dist/ "${HOST}:${DEST}"

echo "Deploy complete."