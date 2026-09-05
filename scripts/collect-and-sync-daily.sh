#!/usr/bin/env bash
# Daily counterpart to collect-and-sync.sh - only the two collectors whose
# data actually changes day to day (Central Market prices from real player
# trading, and the Life Skill profit/hour ranking, which depends on those
# same prices). Fishing zones and grind spots are static world data and
# stay on the weekly collect-and-sync.sh run - running them daily would
# just add unnecessary Cloudflare exposure for no new information.
#
# Crontab example (edit with `crontab -e`), runs daily at 05:00:
#   0 5 * * * cd /home/kanfullbuster/RMBDO && ./scripts/collect-and-sync-daily.sh >> logs/collector.log 2>&1
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p logs
echo "=== $(date -u +%FT%TZ) collect-and-sync-daily start ==="

npm run collect:daily
npm run normalize

# Incrementally backfill ingredient trees, most-profitable-first, a small
# batch at a time (never all 487+ at once - same Cloudflare-exposure
# reasoning as every other collector here). After a few weeks this fills
# in every profitable recipe's cache with zero manual clicking, so the
# deployed app (no Playwright there) can serve it straight from Postgres
# instead of depending on ENABLE_ON_DEMAND_SCRAPE on a local dev server.
npm run collect:crafting-detail-batch

echo "=== $(date -u +%FT%TZ) collect-and-sync-daily done ==="
