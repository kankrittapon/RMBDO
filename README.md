# RMBDO — BDO Progression Optimizer & Tactical HUD

Personal BDO progression & decision intelligence. This repo is the merge of
two things that were built separately and joined on 2026-09-02:

1. **The app** (`src/app`, `src/components`, `src/data`, `src/hooks`,
   `design-system/`) — a fully client-side Next.js 14 + Tailwind dashboard.
   Player state (gear, AP/DP, checkpoint progress, treasure pieces) lives in
   `localStorage` via `useRoadmapStore`. Reference data (grind spots,
   treasures, checkpoints, journals, gear slots) is hand-authored TypeScript
   under `src/data/*` — same category of "plausible but unverified" content
   as the extension's old `BDO_MASTER_GRIND_SPOTS` (see
   `docs/audit-and-plan-2026-09-02.md`), not scraped from anywhere.
2. **The backend** (`schema/`, `data/*.sql`, `collector/`, `scripts/`) — a
   Postgres/Supabase reference-data layer, populated either by hand
   (`data/*.sql`, confidence noted per file in `data/README.md`) or by the
   `collector/` Playwright scraper, which reads bdolytics.com's own internal
   API/DOM automatically instead of requiring the openclick_private browser
   extension to be run by hand each time.

See [docs/audit-and-plan-2026-09-02.md](docs/audit-and-plan-2026-09-02.md)
and [docs/data-collection-checklist.md](docs/data-collection-checklist.md)
for the fuller history/reasoning.

## Layout

```
design-system/            UI/UX spec (MASTER.md + per-page specs) - unchanged from the original app
src/app/                  Next.js pages + API routes
src/app/api/grind-spots/  GET - real AP/DP/coordinates from Postgres (collector-verified)
src/app/api/fishing-spots/ GET - real Depth-4 fishing zone coordinates from Postgres
src/components/           All UI views (Dashboard, GrindSpotOptimizer, Roadmap, Treasures, ...) - unchanged
src/data/                 Hand-authored reference data (unverified) - unchanged, still the UI's default source
src/hooks/useRoadmapStore.ts  Client-side player state (localStorage) - unchanged
src/lib/db/               Postgres client (pool.ts) + typed queries (queries.ts) - NEW
src/lib/intelligence/     Decision-layer engines (Location Engine v1) - NEW, not yet wired into any view
schema/schema.sql         Postgres DDL (reference-data layer)
data/*.sql                Manually curated seed INSERTs
collector/                Playwright scraper (see its own section below)
scripts/                  DB migrate/normalize/cron entrypoint
extension/, and the openclick_private repo it's built from  Manual browser-extension scraper (superseded by collector/ for routine use, still useful for one-off/interactive digging)
```

## What's wired together, and what isn't yet

- `/api/grind-spots` and `/api/fishing-spots` **exist and query Postgres
  successfully** (verified with `npm run build` + `npm run typecheck`, both
  pass).
- **Nothing in `src/components` or `src/data` reads from these API routes
  yet.** `GrindSpotOptimizerView` and the rest of the UI still render
  entirely from the hand-authored `src/data/*` files, exactly as before the
  merge. Wiring a view to overlay `db-verified` data (real AP/DP/coordinates)
  on top of the static list, matched by `name`, is the next concrete step -
  not done in this pass to avoid changing UI behavior without you seeing it
  first.
- `src/lib/intelligence/locationEngine.ts` (Location Engine v1) is not
  called from any page in the merged app yet either.

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
npm run normalize            # upserts both into Postgres
```

Or all at once (also what cron runs): `./scripts/collect-and-sync.sh`

## Automating it (no more manually running the extension)

Add to crontab (`crontab -e`) — see the comment at the top of
`scripts/collect-and-sync.sh`. BDO's world data doesn't change often, so
weekly is plenty. The collector adds a 3-8s randomized delay between every
action and aborts the run the moment it detects a Cloudflare block instead
of retrying into a longer ban.

## Data trust

- `src/data/*` (the app's current default data source): hand-authored,
  unverified, same risk category flagged in the extension audit - treat as
  placeholder/plausible, not ground truth.
- `data/*.sql` (Postgres seed): confidence noted per file in `data/README.md`.
- Rows written by `collector/` + `scripts/normalize.mjs`: tagged
  `dataSource: "live-click" | "live-api" | "unresolved"` at collection time,
  and the `notes` column on the Postgres row records which.
