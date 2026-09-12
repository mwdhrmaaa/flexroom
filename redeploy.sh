#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

ACTIVE_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

echo "==================================================================="
echo "[*] Redeploying Flexroom on branch: $ACTIVE_BRANCH"
echo "==================================================================="

echo "[*] Pulling latest changes..."
git pull origin "$ACTIVE_BRANCH"

echo "[*] Re-running deployment pipeline..."
bash "$APP_DIR/deploy.sh"

echo "[OK] Redeployment completed."
