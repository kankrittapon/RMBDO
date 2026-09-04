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
src/app/api/crafting-recipes/ GET - Cooking/Alchemy/Processing/Imperial Crates profit/hour ranking (?q=, ?category=)
src/app/api/crafting-recipes/[slug]/ingredients/ GET - on-demand ingredient tree for a recipe (cached, bdolytics precomputed)
src/app/api/player-settings/ GET/POST - your real Mastery per skill (Postgres, not localStorage - see Life Skill Hub below)
src/app/api/sync/inventory/ GET/POST - Google Sheets → localStorage inventory & ledger sync (proxied, server-side secret)
src/components/           All UI views (Dashboard, GrindSpotOptimizer, Roadmap, Treasures, Market, Life Skill Hub, ...)
src/data/                 Reference data - mixed trust, see "Data trust" below
src/hooks/useRoadmapStore.ts  Client-side player state (localStorage)
src/lib/db/               Postgres client (pool.ts) + typed queries (queries.ts)
src/lib/intelligence/     Decision-layer engines (Location Engine v1) - not yet wired into any view
src/types/sheets.ts       SheetInventoryResponse, LedgerItem, TotalWealthSummary (Google Sheets sync)
schema/schema.sql         Postgres DDL (reference-data layer, incl. market_items, crafting_recipes, crafting_recipe_ingredients/details, player_settings)
data/*.sql                Manually curated seed INSERTs
collector/                Playwright scraper: fishing, grind spots, Central Market prices, crafting profit/hour + on-demand ingredient detail
scripts/                  DB migrate/normalize/cron entrypoint
docs/sync/Code.gs         Google Apps Script Web App for Sheets → JSON
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
  — a generic price browser + shopping cart over whatever `market_items`
  currently holds. Explicitly **not** the app's main feature (the user
  decides gear/item buy-vs-farm calls themselves) — kept as a plain lookup
  tool, not positioned as a decision engine.
- **`LifeSkillHubView` (the "Life Skill Hub" tab, first item in the nav) is
  the app's main feature** — "what should I do today" for
  Cooking/Alchemy/Processing/Imperial Crates. It reads live from
  `/api/crafting-recipes` (Silver/Hour per recipe, scraped directly from
  bdolytics' own Crafting Calculator, never recomputed locally — that
  needs BDO's unpublished mastery-speed/success-rate/market-tax formulas)
  and `/api/player-settings` (your real Mastery per skill, which you enter
  in this page). **New in 2026-09-03/04:**
  - **On-demand ingredient tree drawer:** Click any recipe row → drawer fetches `GET /api/crafting-recipes/[slug]/ingredients` (checks `crafting_recipe_details` cache first, never bulk 854). Renders bdolytics precomputed `Crafting Cost / Profit / Silver/Hour` + ingredient list with `quantity`, `unitPrice`, `totalCost`, sub-recipe links. Stealth `playwright-extra` + `3–8s` delay, abort on Cloudflare block.
  - **Personal Crafting Planner:** Inside drawer, batch input (default 100, quick 100/1000) scales `totalRequired = qty * batch`, editable **In Stock** per ingredient (persisted `localStorage rmbdo_inventory_v1` keyed by item name, shared across recipes), auto `shortage = max(0, totalRequired - owned)` and `missingCost = shortage * unitPrice`. Top summary shows `Revenue x batch`, `Crafting Cost x batch`, `Adj. Profit = Revenue - totalMissingCost` (all scaled from bdolytics precomputed, never local formula). Procurement badges `🛒 Market Buy` / `⛏️ Gather` / `🌾 Worker Node` via `PROCUREMENT_MAP` + heuristic.
  - **Google Sheets Sync:** `Sync from Google Sheet` button (Mastery card + drawer) calls proxied `GET /api/sync/inventory` (server reads `GOOGLE_SHEETS_WEBHOOK_URL` from Vercel env, follows GAS 302), overwrites `rmbdo_inventory_v1` + `rmbdo_ledger_v1` (sheet is single source of truth), instant recalc of shortage/missing cost, toast `Synced 42 items`. Offline: keeps last localStorage, shows error toast, never clears. See `docs/sync/Code.gs` + `src/types/sheets.ts`.
- Every other view (Treasures, Classes, Life Skills dashboard, War
  Readiness, Gear Planner, Sovereign Forge, Grind Spots) still renders
  entirely from static `src/data/*` files or the collector-verified AP/DP
  overlay. None of them have been cross-checked against a real source the
  way Olvia/Hyperboost and the Central Market were — see **Known gaps**
  below.
- `src/lib/intelligence/locationEngine.ts` (Location Engine v1) is not
  called from any page yet.

## Personalizing the Life Skill ranking

The Life Skill Hub's Silver/Hour numbers can be **your own real numbers**,
not bdolytics' generic default, but it's a two-step process, not instant:

1. Enter your Cooking/Alchemy/Processing Mastery in the Life Skill Hub page
   (saved to Postgres via `POST /api/player-settings` — Postgres, not
   `localStorage`, because step 2 needs it and the collector is a
   standalone cron process, not the browser).
2. The next `npm run collect:crafting` run reads `player_settings`, opens
   bdolytics' own Settings drawer, fills in your Mastery per skill (only
   the ones you've set — anything left blank uses bdolytics' default), and
   *then* scrapes — so bdolytics itself recomputes Silver/Hour using your
   numbers. Each row is tagged `personalized: true` only for the category
   whose own Mastery you actually set; other categories in that same run
   stay `false` and keep showing bdolytics' default until you fill those
   in too. Imperial Crates is always `personalized: false` — its recipes
   bundle already-made Cooking/Alchemy/Processing goods, so no single
   Mastery stat governs it.

A change you make in the Life Skill Hub page takes effect on the **next**
collector run, not immediately — the page shows a note when your settings
are saved but the currently-displayed numbers still predate them.

## Personal Crafting Planner & Sheets Sync

**Batch & Shortage:** In the recipe drawer, set `Batch / Crafts` (e.g., 100). For each ingredient, the table shows `Need x batch` and an editable `In Stock` field. `Shortage` and `Missing Cost` compute instantly (`totalRequired = baseQty * batch`). `In Stock` is stored in `localStorage rmbdo_inventory_v1` as `{[itemName]: number}` and auto-populates across any recipe sharing that ingredient (e.g., `Mineral Water` once, used everywhere).

**Procurement:** Each ingredient row shows `🛒 Market Buy` (vendor, e.g., `Mineral Water`, `Cooking Wine`), `⛏️ Gather` (Meat, Blood, Trace, Sap), or `🌾 Worker Node` (Wheat, Potato, Timber) via `PROCUREMENT_MAP` heuristics; hover shows node/hotspot tooltip.

**Sheets Sync:** Keep your master inventory in Google Sheet tab `Inventory` (`Item Name | Category | Quantity | Unit Price (Optional) | Notes`). In Apps Script, deploy `docs/sync/Code.gs` as Web App (`Anyone` with link) and set `GOOGLE_SHEETS_WEBHOOK_URL` in `.env` + Vercel `Environment Variables` (server-only, never `NEXT_PUBLIC_`). Click `Sync from Google Sheet` (Mastery card or drawer) → `GET /api/sync/inventory` proxies with `redirect: follow` (handles GAS 302), overwrites `rmbdo_inventory_v1` + `rmbdo_ledger_v1`, toasts `Synced N items`, shortage recalculates instantly. Offline or 502 keeps existing local fallback.

**Wealth Ledger (design, v1 localStorage):** `docs/sync/Code.gs` also returns `ledger: [{name,category,quantity,estimatedPrice,notes}]` for grinding trash, Caphras, etc. Stored as `rmbdo_ledger_v1` and aggregated via `computeWealthSummary(ledger, marketPriceMap)` (`totalSilver = Σ qty*price`, `byCategory`) for future dashboard.

## Known gaps / what's explicitly NOT done

Listed here instead of silently left out, so a gap reads as "not built yet"
rather than "forgotten":

- **No automatic Buy-vs-Farm verdict for gear/items.** Explicitly out of
  scope by the user's own call — they decide gear/item buy-vs-farm
  themselves; `MarketPriceView` stays a plain price lookup, not a decision
  engine. This gap is about *items/gear* specifically — Life Skill
  (Cooking/Alchemy/Processing/Imperial Crates) now has its planner above.
- **Crafting Profit data: Imperial Crates collapse fixed, now filtered to profitable only.** `crafting_recipes` captures `recipe_slug` (`/crafting/<id>:<hash>`), the row's own detail-page link — its first implementation deduplicated ALL crafting links page-wide without distinguishing a row's own link from a craftable ingredient's link, which silently mis-assigned slugs (confirmed: two unrelated recipes ended up sharing one slug); fixed by filtering to links whose text is the recipe name, never a bare quantity number. There is no longer a `UNIQUE (recipe_name, category, region)` constraint — `recipe_slug` is the real per-recipe identity now. Combined with `profit_per_hour > 0` filtering (collector + normalize + the read query) to limit Cloudflare exposure and DB bloat, a real run now gives **487 profitable recipes total** (Cooking 50, Alchemy 75, Processing 215, Imperial Crates 147) with **zero duplicate slugs** — verified against the live DB, not estimated.
- **Personalized Silver/Hour only covers Cooking/Alchemy/Processing.**
  Imperial Crates always `personalized: false` (see above).
- **Olvia Academy Field Tactics (19 quests): only a count, not quest
  titles.** `olviaSubCourses.ts` tracks `combat_field_tactics: 19` as a
  number; unlike Basic Tactics (12 real quest names), nobody has supplied the
  individual Field Tactics quest names yet.
- **7 of 9 Olvia Life Skill courses (Cooking, Alchemy, Processing,
  Training, Farming, Sailing/Barter) have progression chains + rewards
  from the user's own research, but no confirmed exact quest counts** -
  `olviaSubCourses.ts` leaves `totalQuests: null` for these (only
  Gathering=10, Fishing=13, Hunting=13 are confirmed).
- **`src/data/treasures/treasureList.ts`, `src/data/classes/classList.ts`,
  `src/data/war-readiness/criteria.ts` have not been audited this
  session.** Same two problems as before: fabricated skill names, hardcoded
  player progress in static data.
- **Central Market collector is scoped to 5 categories** (material,
  alchemy-stone, magic-crystal, lightstone, enhancement) - add categories to
  `CATEGORIES` in `collector/src/scrapers/market.ts` if needed.
- **No player_state / goals tables in Postgres at all.** Original plan called
  for `player_state`, `goals`, `progression_log` — none exist; progress still
  only `localStorage` + `player_settings` Mastery. Sheets ledger is also
  `localStorage` (`rmbdo_ledger_v1`) for v1, not yet Postgres.

## First-time setup

```bash
cp .env.example .env        # fill in DATABASE_URL from Supabase + GOOGLE_SHEETS_WEBHOOK_URL from Apps Script Web App URL
npm install
npm run db:migrate          # creates tables + loads seed data - already run once
npx playwright install chromium --with-deps   # collector browser, needed before running collect:*
npm run dev                 # the actual app, http://localhost:3000
```

## Running the collector manually

```bash
npm run collect:fishing      # writes collector/out/fishing-depth4-*.json
npm run collect:grindspots   # writes collector/out/grindspots-*.json
npm run collect:market       # writes collector/out/market-*.json (Southeast Asia region)
npm run collect:crafting     # writes collector/out/crafting-*.json (profitable only, profitPerHour >0, with recipe_slug)
npm run collect:crafting-detail -- <slug>  # on-demand single recipe detail (e.g. 123:abc) -> crafting_recipe_details
npm run collect:daily        # collect:market + collect:crafting only (the two that change day to day)
npm run normalize            # upserts latest collector/out/*.json files into Postgres (filters profitable, uses recipe_slug when present)
```

Weekly full run (also what `scripts/collect-and-sync.sh` runs via cron):
`npm run collect:all && npm run normalize`

Daily run (also what `scripts/collect-and-sync-daily.sh` runs via cron):
`npm run collect:daily && npm run normalize`

Sheets inventory sync (on-demand from UI, not cron):
`Sync from Google Sheet` button → `GET /api/sync/inventory` → overwrites `rmbdo_inventory_v1` + `rmbdo_ledger_v1`

## Automating it (no more manually running the extension)

Two cron entries (`crontab -e`) — see the comments at the top of each
script for the exact lines:

- `scripts/collect-and-sync.sh` — weekly, everything (fishing/grind spots
  world data barely changes, no reason to hit it daily).
- `scripts/collect-and-sync-daily.sh` — daily, Central Market + Life Skill
  Hub only (real player trading moves these every day, and this is where
  a personalized Mastery setting takes effect on its next run).

The collector adds a 4-10s randomized delay between every action and
aborts the run the moment it detects a Cloudflare block instead of
retrying into a longer ban.

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

`collect:daily` (Central Market + Life Skill Hub) runs separately from
`collect:all` for exactly this reason — real player trading moves prices
daily, but the two still shouldn't run back-to-back with each other on a
manual trigger; space them out the same way as any other pair of
`collect:*` runs.

Sheets sync needs no cron — it's user-initiated `Sync` button. The Google Sheet remains the single source of truth; `localStorage` is just a cache.

## Data trust

- **Verified this session, high confidence:** the 17 real Depth-4 fishing
  zones (in-game bookmark export), 91 real grind spots (collector, live
  API), 1,486 real Central Market prices (collector), 487 profitable
  crafting recipes with `recipe_slug` and zero duplicate slugs (Cooking 50,
  Alchemy 75, Processing 215, Imperial Crates 147 — an exact count from a
  real collector run + live DB query, not an estimate), and the Olvia
  Academy / Hyperboost data — corrected against official Asia/SEA sources and the user's
  own in-game screenshots.
- **Not audited this session, treat as unverified:** `src/data/treasures/`,
  `src/data/classes/`, `src/data/war-readiness/` — see **Known gaps**.
- `data/*.sql` (Postgres seed): confidence noted per file in `data/README.md`.
- Rows written by `collector/` + `scripts/normalize.mjs`: tagged
  `dataSource: "live-click" | "live-api" | "unresolved"` (fishing/grind spots), and the `notes` column records
  which. Market items don't carry a per-row trust tag since the entire
  `market_items` table only ever gets written by the collector — every row is collector-sourced.
- `crafting_recipe_details`/`ingredients` rows are bdolytics precomputed `totalCost/profit/profitPerHour` per detail page, never locally recomputed, cached on-demand per drawer open (never bulk 854).
- `rmbdo_inventory_v1` / `rmbdo_ledger_v1` are user-owned Google Sheets data, proxied via Vercel, not a scraper source.
