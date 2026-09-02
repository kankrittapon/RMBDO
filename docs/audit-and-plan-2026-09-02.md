# RMBDO — Audit & Plan (2026-09-02)

## 1. Audit: what exists on the server right now

```
RMBDO/
├── schema/schema.sql        236 lines — Postgres DDL, reference-data layer only
├── data/*.sql                9 files, 267 lines — seed INSERTs for the schema above
├── data/README.md            confidence notes per file
├── docs/                     (this file)
└── extension/chrome-mv3/     compiled Chrome MV3 extension, v0.3.3, "RMBDO DOM Inspector"
```

### schema.sql
Covers only the **reference/world-data layer**: `regions`, `towns`,
`fishing_spots` + `fish_species`, `ship_types`, `wharfs`, `trade_routes`,
`horse_tiers`, `grind_spots`, `knowledge_categories/entries`,
`quest_chains/quests`, `item_categories/checklist_items`,
`roadmap_stages/roadmap_steps`.

**Missing entirely** (needed for the Intelligence Engine described in the
RMBDO plan, section 6-8): `player_state` (gear/AP/AAP/DP/silver/goals),
`goals`, `progression_log`, any table that isn't "facts about the game
world." Nothing about a specific player exists yet — schema is 100%
BDOLytics-style reference data today, 0% RMBDO decision layer.

Also missing: a unified `locations` view across the six typed location
tables (fishing_spots, grind_spots, towns, wharfs, ...) that the Route
Optimizer / Location Engine (plan section 3, 13) needs to query
polymorphically.

### data/*.sql — confidence by topic

| File | Rows | Confidence | Notes |
|---|---|---|---|
| 010_regions.sql | 12 regions, 15 towns | Medium | Stable facts, not individually re-verified this session |
| 020_fishing_spots.sql | 14 fish, 20 spots | **High** for the 17 Depth-4 zones (real in-game coords, one zone's catch table hand-verified in browser); **Low** for the 3 supplementary coastal rows (no coordinates, community-guide guesses) |
| 030_ship_types.sql | 8 ships | Medium — cargo/cannon slots solid; speed/accel/turn/durability mostly NULL |
| 040_horse_tiers.sql | 10 rows | Low — only one tier has a real stat sample |
| 050_grind_spots.sql | 13 rows | Low-Medium — names/regions right, AP/DP recs mostly NULL |
| 060_knowledge.sql | 5 cat / 8 entries | Low — a sampling, not a real inventory |
| 070_quests.sql | 8 chains / 7 quests | Low — a sampling, not the real BDO quest graph |
| 080_checklist_items.sql | 5 cat / 11 items | Low — generic starting-gear guesses |
| 090_roadmap.sql | 6 stage rows | Placeholder only, by design (no steps yet) |

**Bottom line:** only the fishing Depth-4 data is currently trustworthy
enough to build on. Everything else is a directional sketch that needs a
real pass (via your extension + bdolytics, or another source) before any
Intelligence Engine logic should depend on it.

### extension/chrome-mv3
A compiled Chrome MV3 extension (**no source code committed, only the
built `dist`**) named "RMBDO DOM Inspector", permissions
`storage/activeTab/tabs/scripting` + `host_permissions: <all_urls>`, a
content script injected on every page, and a background service worker.
This is presumably the collector you're building per plan section 11
("Collector / Extension / Scraper"). I have not inspected its actual
scraping logic (minified JS chunks, not readable source) — can't audit
correctness, only confirm it exists and what permissions it holds.

**Gap:** no source repo for the extension checked in (only compiled
output), so it can't be reviewed, versioned meaningfully, or modified by
me. Recommend committing the actual source (plasmo/vite project by the
look of the chunk names) alongside the build.

## 2. Audit against the RMBDO plan's own roadmap (section 15)

| Phase | Plan feature | Status |
|---|---|---|
| 1 | Location DB + Fishing Intelligence | **~30%** — fishing_spots table + real Depth-4 data done; no `locationId` unified view, no "nearest zone" / "missing prize fish" logic (Location Engine) written anywhere yet |
| 2 | Treasure / Goal Dependency Graph | **0%** — no `goals`, no dependency graph tables/logic |
| 3 | Grind Spot Advisor | **0%** — grind_spots table exists but no player_state to score against, no advisor logic |
| 4 | Asia Central Market Integration | **0%** — no market tables, no CM API/scraper |
| 5 | Smart Daily Route | **0%** — depends on Phase 1-3 |
| 6 | Craft / Life Skill Optimizer | **0%** |
| 7 | Knowledge / Title Completion | **0%** — knowledge tables exist but no player-progress tracking |

Also **no application layer exists at all** — plan section 12 specifies a
Next.js app (`src/data/bdo/`, `src/lib/intelligence/*.ts`); right now
there is only raw SQL in a bare directory, no runnable project, no
`package.json`, no ORM/migration tool wired to the Postgres schema, no
Postgres instance confirmed running anywhere yet.

## 3. Plan — proposed order of work

This follows your own section 16 ("Data Inventory before scraping more")
and section 15 roadmap, sequenced so each step only depends on things
already done.

### Step 0 — Decide the collector pipeline (blocking, needs your input)
You're writing the extension's scraping logic yourself. Before I extend
the schema further I need to know **what shape of JSON it will output**
(one file per data type? one combined dump? field names?) so the
normalizer (plan section 11: `bdolytics-fishing-raw.json` →
`normalize-fishing.ts` → `fishing-zones.json`) has a real contract to
target instead of another guess. *Action for you:* once the extension can
export even one data type (e.g. fishing zones) end-to-end, hand me a
sample export.

### Step 1 — Stand up the actual project skeleton
Nothing runs right now — it's a folder of `.sql` files. Needs:
- `package.json` + Next.js app per plan section 12 (`src/data/bdo/`,
  `src/lib/intelligence/`)
- A migration tool (Prisma or plain `psql schema.sql` bootstrap script) so
  `schema.sql` + `data/*.sql` actually get applied to a real Postgres
  instance
- Decide/confirm where Postgres runs (local docker, Supabase, VPS — your
  earlier answer was "PostgreSQL" but not a specific host)

### Step 2 — Extend schema for the player/decision layer
Add, informed by plan sections 5-8:
- `player_state` (gear score, AP/AAP/DP, silver, current region, life
  skill levels)
- `goals` (goal type, target, progress, priority)
- `progression_log` (timestamped snapshots, so trends/velocity can be
  computed later)
- a `v_locations` view unifying fishing_spots/grind_spots/towns/wharfs
  into the polymorphic `(id, type, name, coord_x, coord_y)` shape the
  Location/Route engines need

### Step 3 — Location Engine v1 (smallest end-to-end slice)
Using only the data that's actually trustworthy today (the 17 Depth-4
fishing zones): implement `nearest zone` + `missing prize fish` scoring
(plan section 4) as a real TypeScript function against `player_state`
(current position) + `fishing_spots`. This is deliberately the smallest
possible vertical slice that proves the whole pipeline (DB → engine →
answer) before investing in Grind Advisor / Market / Dependency Graph,
which all need data that's currently low-confidence or entirely missing.

### Step 4 — Re-collect the low-confidence tables via the extension
Once the extension pipeline is proven on fishing data (Step 0-3), reuse
it for: grind spots (AP/DP recs), ship stats (speed/accel/durability),
horse tiers, knowledge entries — replacing the placeholder rows in
`data/030-060_*.sql` with real numbers the same way `020_fishing_spots.sql`
was upgraded today.

### Step 5 — Central Market + Buy-vs-Farm
Requires a Central Market data source (bdolytics has one, or Pearl
Abyss's own CM API might be reachable — worth checking before scraping
bdolytics again). Blocked on Step 2 (`player_state.silver_per_hour` needed
for the opportunity-cost formula in plan section 5).

### Step 6 — Grind Spot Advisor, Dependency Graph, Route Planner, Dashboard
In the order given in your own roadmap (section 15, phases 3, 2, 5, and
finally the dashboard in section 14) — each needs Steps 1-5 done first,
so no reason to sequence them differently than you already proposed.

## 4. What I need from you to keep moving

1. Confirm Postgres hosting target (local/docker vs managed) so Step 1 is unblocked.
2. A sample JSON export from the extension once it can pull one data type, so the normalizer contract is real instead of assumed.
3. Confirmation you want me to start Step 1 (project skeleton) now, or hold until the extension's first export exists.
