# RMBDO — Data Collection Checklist (what to scrape, in priority order)

Priority follows the RMBDO plan's own table (section 2: P0 > P1 > P2) and
what's still missing/low-confidence per the audit
([audit-and-plan-2026-09-02.md](audit-and-plan-2026-09-02.md)).
For each item: which `schema.sql` table it fills + exact fields to capture.

## P0 — collect first (blocks the Location/Grind/Dependency engines)

### 1. Fishing zones — mostly DONE, small gap left
Table: `fishing_spots`, `fish_species`, `fishing_spot_fish`
- [x] All Depth 4 (deepest) zone coordinates — done via bookmark export
- [ ] Depth 3 zones per sea (same technique: toggle off Depth 4, click Depth 3 polygon) — coords + catch table
- [ ] Coast zones per sea/region (no depth suffix)
- [ ] Per zone, from the right-side panel: **bite time, possible drops count, Prize/Rare/General/Treasure %, full fish list with %** (only Altinova Depth 4 has this fully recorded right now)
- [ ] Confirm: does bdolytics have a separate "Hotspot" point layer anywhere, or is it really zone-only? (checked once, found none — worth a second look inside a specific sub-region view if your extension can enumerate map layers programmatically)

### 2. Grind spots
Table: `grind_spots`
- [ ] Name, region, coordinates
- [ ] Recommended AP / DP (bdolytics or garmoth usually states a "recommended gear" range)
- [ ] Min level
- [ ] Monster family / notable drops
- [ ] Silver/hour or XP/hour if the site tracks it (needed later for Grind Advisor scoring, plan section 6)

### 3. Nodes (worker empire / node map)
Table: none yet — **new table needed**, see gap below
- [ ] Node name, type (production/gateway/plantation zone), CP cost, connections, town it belongs to, output resource
- This is what the "โหนดหลัก/โหนดย่อย" filter on the map controls — not modeled in schema.sql yet; flag this as a schema gap, don't scrape until a `nodes`/`node_connections` table exists (tell me and I'll add it)

### 4. Items / Quests / Knowledge / NPC (Dependency Resolver, plan section 7)
Tables: `checklist_items`, `quests`/`quest_chains`, `knowledge_entries`, none yet for NPC
- [ ] For each early-game required item: name, how obtained (quest reward / craft / market / drop), prerequisite item(s)
- [ ] For each main/black-spirit quest: giver NPC, town, recommended level, reward summary, and — most important for the dependency graph — **what it unlocks** (region access, knowledge, life skill tool, etc.)
- [ ] For each knowledge entry: category, energy/XP reward, how obtained, prerequisite knowledge
- NPC table doesn't exist in schema yet either — hold off scraping NPC-only data until we add one, unless it's just "giver_npc" text on a quest row (already supported)

## P1 — collect after P0 is solid

### 5. Central Market (Buy-vs-Farm engine, plan section 5)
Table: none yet — **new table needed** (`market_items`: item name, current price, min/max price, last-updated timestamp)
- [ ] Item name, current price, price range, region (Asia PC server specifically per your doc's "Target: BDO Asia PC")
- Note: bdolytics' Central Market page is a different data source than the map — separate scraping pass, likely a table/list UI rather than canvas, so probably much easier to scrape than the map was

### 6. Ship types
Table: `ship_types`
- [ ] Fill in the NULLs from today's audit: max speed, acceleration, turn speed, durability for all 8 ships, especially the 3 Carrack variants
- [ ] Crafting material list (full bill of materials, not just a summary string) — consider whether this needs its own `ship_materials` table if you want per-material buy-vs-farm later

### 7. Horse tiers
Table: `horse_tiers`
- [ ] Real base stats (speed/accel/turn/brake) for T1–T9 and Draft — only one sample row exists today

## P2 — later, once the engine is proven on P0 data

### 8. Trade routes / wharfs / worker exchange towns
Table: `trade_routes`, `wharfs`, `towns`
- [ ] Just needs verification pass on the existing rows in `010_regions.sql`, not new discovery — town list is fairly stable

### 9. Crafting / Cooking / Alchemy / Processing recipes
No table yet — hold until Phase 6 (Craft/Life Skill Optimizer) is actually being built; don't scrape ahead of need per your own section 9 ("things not to clone yet")

---

## How to record what you collect

Whatever your extension exports, keep the **field names close to the
`schema.sql` column names** above — that's what makes the normalizer
(plan section 11) trivial instead of another translation layer. If a
field doesn't map to an existing column, tell me before scraping a lot of
it — might mean a schema table is missing (like `nodes` and
`market_items` above) rather than the data being unimportant.
