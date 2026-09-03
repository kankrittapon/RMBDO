# RMBDO — BDO Progression Optimizer & Tactical HUD

Personal BDO progression & decision intelligence. This repo is the merge of
two things that were built separately and joined on 2026-09-02:

1. **The app** (`src/app`, `src/components`, `src/data`, `src/hooks`,
   `design-system/`) — a fully client-side Next.js 14 + Tailwind dashboard.
   Player state (gear, AP/DP, checkpoint progress, treasure pieces) lives in
   `localStorage` via `useRoadmapStore`. Reference data under `src/data/*`
   was originally hand-authored/plausible-but-unverified content (same
   category of risk as the extension's old `BDO_MASTER_GRIND_SPOTS` — see
   `docs/audit-and-plan-2026-09-02.md`). The Olvia Academy files
   (`olviaCombatTasks.ts`, `olviaLifeTasks.ts`, `olviaSubCourses.ts`,
   `hyperboostTasks.ts`, and the related `checkpoints.ts` entries) have
   since been corrected against official Asia/SEA data and the user's own
   in-game screenshots — see **Data trust** below for what's verified vs
   still unaudited.
2. **The backend** (`schema/`, `data/*.sql`, `collector/`, `scripts/`) — a
   Postgres/Supabase reference-data layer, populated either by hand
   (`data/*.sql`, confidence noted per file in `data/README.md`) or by the
   `collector/` Playwright scraper, which reads bdolytics.com directly
   instead of requiring the openclick_private browser extension to be run
   by hand each time.

See [docs/audit-and-plan-2026-09-02.md](docs/audit-and-plan-2026-09-02.md)
and [docs/data-collection-checklist.md](docs/data-collection-checklist.md)
for the fuller history/reasoning.

## Layout

```
design-system/            UI/UX spec (MASTER.md + per-page specs) - unchanged from the original app
src/app/                  Next.js pages + API routes
src/app/api/grind-spots/  GET - real AP/DP/coordinates from Postgres (collector-verified)
src/app/api/fishing-spots/ GET - real Depth-4 fishing zone coordinates from Postgres
src/app/api/market-items/ GET - real Central Market prices from Postgres (?q= to search)
src/components/           All UI views (Dashboard, GrindSpotOptimizer, Roadmap, Treasures, Market, ...)
src/data/                 Reference data - mixed trust, see "Data trust" below
src/hooks/useRoadmapStore.ts  Client-side player state (localStorage)
src/lib/db/               Postgres client (pool.ts) + typed queries (queries.ts)
src/lib/intelligence/     Decision-layer engines (Location Engine v1) - not yet wired into any view
schema/schema.sql         Postgres DDL (reference-data layer, incl. market_items)
data/*.sql                Manually curated seed INSERTs
collector/                Playwright scraper: fishing, grind spots, Central Market prices
scripts/                  DB migrate/normalize/cron entrypoint
extension/, and the openclick_private repo it's built from  Manual browser-extension scraper (superseded by collector/ for routine use, still useful for one-off/interactive digging)
```

## What's wired together, and what isn't yet

- `/api/grind-spots`, `/api/fishing-spots`, `/api/market-items` **exist and
  query Postgres successfully** (verified with `npm run build` +
  `npm run typecheck`, both pass, and by actually running each collector +
  normalize end to end).
- **`GrindSpotOptimizerView` is the only view wired to a DB API** — it
  overlays `db-verified` AP/DP/coordinates on top of the static
  `src/data/grind-spots/spots.ts` list, matched by name, with a "✓ DB"
  badge when a match exists.
- **`MarketPriceView` (the "ตลาดกลาง" tab) reads live from `/api/market-items`**
  — it's not a static-data view at all, just a price browser + shopping
  cart over whatever `market_items` currently holds.
- Every other view (Treasures, Classes, Life Skills, War Readiness, Gear
  Planner, Sovereign Forge) still renders entirely from static
  `src/data/*` files. None of them have been cross-checked against a real
  source the way Olvia/Hyperboost and the Central Market were — see
  **Known gaps** below.
- `src/lib/intelligence/locationEngine.ts` (Location Engine v1) is not
  called from any page yet.

## Known gaps / what's explicitly NOT done

Listed here instead of silently left out, so a gap reads as "not built yet"
rather than "forgotten":

- **No automatic Buy-vs-Farm verdict.** `MarketPriceView` shows real
  Central Market prices and a running cart total, but it does **not**
  compute "you should buy this" or "you should farm this" for you. That
  calculation needs the player's own silver/hour rate (how much they
  actually earn farming per hour), which RMBDO doesn't track anywhere yet
  — there's no grind-spot-to-silver-per-hour data, no session timer, no
  player throughput input. Rather than invent a plausible-looking formula
  with a made-up default rate (exactly the kind of fabricated-but-authoritative-looking
  number this project has had to repeatedly strip out of `src/data/*` this
  session), the UI just shows the total buy cost and tells the player to
  compare it against their own time estimate by hand. Building the real
  version needs, at minimum: a `player_state.silverPerHour` field (or a
  derived one from logged sessions), and matching material names in
  `market_items` against what a grind spot/quest/craft recipe actually
  requires and in what quantity - none of which exists yet.
- **Olvia Academy Field Tactics (19 quests): only a count, not quest
  titles.** `olviaSubCourses.ts` tracks `combat_field_tactics: 19` as a
  number; unlike Basic Tactics (12 real quest names, from the user's own
  screenshot), nobody has supplied the individual Field Tactics quest
  names yet, so `olviaCombatTasks.ts` has no per-quest entries for it.
- **7 of 9 Olvia Life Skill courses (Cooking, Alchemy, Processing,
  Training, Farming, Sailing/Barter) have progression chains + rewards
  from the user's own research, but no confirmed exact quest counts** -
  `olviaSubCourses.ts` leaves `totalQuests: null` for these (only
  Gathering=10, Fishing=13, Hunting=13 are confirmed real numbers, also
  from the user checking their own in-game panel).
- **`src/data/treasures/treasureList.ts`, `src/data/classes/classList.ts`,
  `src/data/war-readiness/criteria.ts` have not been audited this
  session.** A quick look found two concrete problems worth flagging
  before trusting any of them:
  - `classList.ts`'s skill names (e.g. "Voltaic Pulse", "Yoke of Ordeal"
    for Witch Awakening) don't match real BDO skill names as far as this
    session could tell - likely fabricated, same pattern as the Olvia data
    before it was corrected. Unverified for all ~20 classes in the file.
  - `treasureList.ts` and `criteria.ts` both hardcode **player-specific
    progress** (`obtained: true/false` per treasure piece; a specific
    GS/AP/DP snapshot in `initialWarReadiness`) as if it were static
    reference data, instead of living in `useRoadmapStore`'s profile state
    like every other progress-tracked system in the app. Works today only
    by coincidence if you happen to match that hardcoded snapshot.
- **Central Market collector is scoped to 5 categories** (material,
  alchemy-stone, magic-crystal, lightstone, enhancement) - the ones
  relevant to farm-vs-buy decisions. Weapon/armor/accessory market prices
  are not collected; add categories to the `CATEGORIES` array in
  `collector/src/scrapers/market.ts` if a future feature needs them.
- **No player_state / goals tables in Postgres at all.** Everything in
  `schema/schema.sql` is world reference data. The original architecture
  plan (`docs/audit-and-plan-2026-09-02.md`) called for `player_state`,
  `goals`, and `progression_log` tables as the actual "decision layer" -
  none of that exists; player progress still only lives in browser
  `localStorage` via `useRoadmapStore`.

## First-time setup

```bash
cp .env.example .env        # fill in DATABASE_URL from Supabase (done already for this checkout)
npm install
npm run db:migrate          # creates tables + loads the curated seed data - already run once
npx playwright install chromium --with-deps   # collector browser, needed before running collect:*
npm run dev                 # the actual app, http://localhost:3000
```

## Running the collector manually

```bash
npm run collect:fishing      # writes collector/out/fishing-depth4-*.json
npm run collect:grindspots   # writes collector/out/grindspots-*.json
npm run collect:market       # writes collector/out/market-*.json (Southeast Asia region)
npm run normalize            # upserts all three into Postgres
```

Or all at once (also what cron runs): `./scripts/collect-and-sync.sh`

## Automating it (no more manually running the extension)

Add to crontab (`crontab -e`) — see the comment at the top of
`scripts/collect-and-sync.sh`. BDO's world data doesn't change often, so
weekly is plenty. The collector adds a 4-10s randomized delay between every
action and aborts the run the moment it detects a Cloudflare block instead
of retrying into a longer ban.

The browser is launched via `playwright-extra` + `puppeteer-extra-plugin-stealth`
(see `collector/src/lib/browser.ts`) rather than plain Playwright - a plain
headless run got a full Cloudflare bot-block ("Attention Required", not just
the earlier rate-limit) during testing, which a real browser session (via
the openclick_private extension) never triggered. Even with stealth mode,
**don't run any `collect:*` script back-to-back or repeatedly within the
same session** - that specific pattern (two fishing runs plus a couple of
ad-hoc debug scripts within ~15 minutes) is what caused the block in the
first place. One `collect:all` run per cron cycle (i.e. per week) is the
intended usage; if a run does get blocked, wait several hours before
trying again, not minutes.

Central Market prices update far more often than fishing/grind spot world
data (real players trading), so `collect:market` is worth running more
frequently than the weekly cadence above if price accuracy matters — just
still not back-to-back with other collectors in the same run.

## Data trust

- **Verified this session, high confidence:** the 17 real Depth-4 fishing
  zones (in-game bookmark export), 91 real grind spots (collector, live
  API), 1,486 real Central Market prices (collector), and the Olvia
  Academy / Hyperboost data (`olviaCombatTasks.ts`, `olviaLifeTasks.ts`,
  `olviaSubCourses.ts`, `hyperboostTasks.ts`, and their `checkpoints.ts`
  entries) — corrected against official Asia/SEA sources and the user's
  own in-game screenshots, with the specific remaining gaps listed under
  **Known gaps** above (Field Tactics quest titles; some Life Skill course
  quest counts).
- **Not audited this session, treat as unverified:** `src/data/treasures/`,
  `src/data/classes/`, `src/data/war-readiness/` — see **Known gaps** for
  the specific problems already spotted in a first look.
- `data/*.sql` (Postgres seed): confidence noted per file in `data/README.md`.
- Rows written by `collector/` + `scripts/normalize.mjs`: tagged
  `dataSource: "live-click" | "live-api" | "unresolved"` at collection time
  (fishing/grind spots), and the `notes` column on the Postgres row records
  which. Market items don't carry a per-row trust tag since the entire
  `market_items` table only ever gets written by the collector (no
  hand-authored seed exists for it) — every row is collector-sourced by
  construction.
