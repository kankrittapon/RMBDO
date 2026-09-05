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

# MARKET_PLAYWRIGHT_FALLBACK re-scrapes material/alchemy-stone/magic-crystal
# via Playwright in addition to the fast daily Arsha.io fetch - Arsha's
# matching category IDs don't cover everything bdolytics groups under these
# names (confirmed: 277 items, mostly "material", never appear in Arsha's
# response for any subCategory). Weekly-only, not daily, to keep Cloudflare
# exposure low while still refreshing these stragglers periodically instead
# of leaving them stale forever.
MARKET_PLAYWRIGHT_FALLBACK=true npm run collect:all
npm run normalize

echo "=== $(date -u +%FT%TZ) collect-and-sync done ==="
