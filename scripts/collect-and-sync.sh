#!/usr/bin/env bash
# Run this on a schedule (see crontab example below) instead of opening the
# extension by hand. Collects fresh data from bdolytics.com, then syncs it
# into Postgres/Supabase. Safe to re-run - normalize.mjs upserts by name.
#
# Crontab example (edit with `crontab -e`), runs every Sunday at 04:00:
#   0 4 * * 0 cd /home/kanfullbuster/RMBDO && ./scripts/collect-and-sync.sh >> logs/collector.log 2>&1
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p logs
echo "=== $(date -u +%FT%TZ) collect-and-sync start ==="

npm run collect:all
npm run normalize

echo "=== $(date -u +%FT%TZ) collect-and-sync done ==="
