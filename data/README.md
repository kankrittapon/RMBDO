# RMBDO seed data

Research pass for the "new player roadmap" database, using WebSearch/WebFetch against
public BDO wikis/guides. All FK references use `(SELECT id FROM ... WHERE name = ...)`
subqueries rather than hardcoded IDs, so files must be run in numeric filename order.

## Run order

1. `010_regions.sql` — 12 regions, 15 towns
2. `020_fishing_spots.sql` — 7 fish species, 8 fishing spots
3. `030_ship_types.sql` — 8 ship types (Bartali → Carrack variants)
4. `040_horse_tiers.sql` — 10 horse tier rows (T1–T9 + Draft)
5. `050_grind_spots.sql` — 13 grind/hunting spots
6. `060_knowledge.sql` — 5 knowledge categories, 8 knowledge entries
7. `070_quests.sql` — 8 quest chains, 7 milestone quests
8. `080_checklist_items.sql` — 5 item categories, 11 checklist items
9. `090_roadmap.sql` — 6 roadmap stages only (no steps — intentionally left for the user)

## Sources used

- bdolytics.com/th/map and bdolytics.com/en — **attempted, both failed** (403 Forbidden /
  JS-rendered SPA not readable via WebFetch). Noted explicitly as a placeholder row in
  `020_fishing_spots.sql`; recommend re-fetching with a browser-capable tool.
- blackdesertfoundry.com — ships guide, fishing guide, leveling guide, questline guides
- grumpygreen.cricket — grind spot table, horse tier stats, simplified main quest guide
- community.battlexo.com — fishing spot list
- bdofish.com — referenced for fishing spot coordinates (not scraped directly)
- General trained knowledge of stable, well-documented BDO mechanics (region/town layout,
  ship line relationships, Adventure Log system, Value Pack, etc.)

## Weak / low-confidence areas — double check before relying on this data

- **Fishing spots**: this was the #1 ask but the primary source (bdolytics map) never
  loaded. Spot names/regions are directionally correct but **no real coordinates** were
  obtained, and hotspot/deepest-point flags for several rows are approximations from
  guide text rather than the authoritative map. Re-run against bdolytics or bdofish.com
  with a JS-capable fetch before trusting is_hotspot/is_deepest_point/has_red_fish flags.
- **Ship stats**: cargo/cannon slot counts are reasonably solid; numeric speed/accel/
  turn/durability values were NOT found with confidence and are all NULL. Carrack variant
  rows (Advance/Balance/Volante) have almost no numeric data — lowest-confidence section.
- **Horse tiers**: only T6 has a concrete numeric example (from one sample horse, not a
  fixed tier baseline); T1–T5, T7, Draft Horse are entirely NULL. T8/T9 have descriptive
  notes only since individual horses vary within a tier. Needs a dedicated pull from
  GrumpyG's filterable horse table.
- **Grind spots**: AP/DP recommendations are rough community rules-of-thumb that shift
  with balance patches — treat as directional, not precise. Hunting-zone rows (deer/wolf/
  fogan) have low-confidence exact locations.
- **Knowledge entries**: only chain-level structure asserted; energy_reward/xp_reward
  are all NULL since no per-entry table was retrieved this session.
- **Quests**: only major milestone quests seeded, not the full quest-by-quest chain
  (the schema note suggests fine-grained steps belong in `roadmap_steps` anyway, which
  is intentionally left for the user to author).
- **Towns**: coord_x/coord_y are NULL everywhere; a couple of town/region assignments
  (Epheria, O'draxxia settlement, Muiquun) are marked low-confidence in their notes.

## Recommended next step

Re-fetch bdolytics.com (or bdofish.com) fishing data with a browser/JS-capable tool to
replace the placeholder fishing_spots rows with real coordinates and verified flags —
that was the explicit top priority and is currently the weakest section.
