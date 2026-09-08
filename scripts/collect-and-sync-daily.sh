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

# Refresh pre-2026-09-07 detail rows, 15/day (see REFRESH_MODE in
# craftingDetailBatch.ts). Old rows under-count ingredients (single-row
# saves like Antidote Elixir's 1 row vs 4 live) - a user caught the gaps.
# Self-terminating: refreshed rows postdate the cutoff and drop out, so
# this becomes a no-op once the backlog (479 as of 2026-09-08) converges.
npm run collect:crafting-detail-batch -- refresh 15

# Fills icon_url for any new market/recipe/ingredient rows the runs above
# just added. Pure DB work (name/ID lookup against a public data dump +
# Pearl Abyss's own icon CDN) - no scraping, safe to run every day.
npm run backfill:icons

echo "=== $(date -u +%FT%TZ) collect-and-sync-daily done ==="
