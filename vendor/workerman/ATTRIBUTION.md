# Attribution — vendor/workerman/

Data in this folder is curated by **shrddr (Workerman)** — https://shrddr.github.io/workerman/
(repo: https://github.com/shrddr/workermanjs). Thank you for maintaining it.

## Pinned source

- Commit SHA: `c2ae3c2041cc1ccfcd7f077792ba6a5652c15c53` (2026-09-06)
- Fetched: 2026-09-08. Files kept **unmodified** except `loc_en_item.json`
  (extracted subset `en.item` from `data/loc.json` — full file is 2.7MB).

## Files taken (facts only — no UI code, no WASM, no raw observation dumps)

| File | Upstream | Content |
|---|---|---|
| `plantzone_drops.json` | `data/manual/plantzone_drops.json` (370 entries) | per-node `{workload, rolls, unlucky, lucky, unlucky_gi}` — observed drop quantities |
| `loc_en_item.json` | `data/loc.json` → `en.item` (3053 names) | item ID → English name (e.g. `5960` = Trace of Nature) |
| `worker_static.json` | `data/worker_static.json` (101 workers) | base worker stats for median-lv40 yield math |
| `skills.json` | `data/manual/skills.json` (54 skills) | worker skill bonuses (wspd/mspd/luck) |
| `regiongroups.json` | `data/manual/regiongroups.json` | productivity per region group |
| `distances_tk2pzk.json` | `data/distances_tk2pzk.json` | town→node distances for cycles/day |

Join key: `waypoint_key` — verified 370/370 drop entries exist in
`public/data/bdo-node-graph.json` (max id 2128 both sides, zero reconciliation).

## License status

Upstream repo has **no LICENSE file** (checked 2026-09-08). Permission request
filed at https://github.com/shrddr/workermanjs/issues — **status: PENDING**.
Use here is facts-only with credit + link back. **Remove-on-request:** if the
author declines, delete this folder and all `node_resources` rows sourced from
it (`source LIKE 'workerman@%'`), then switch to the `bdo-data-extractor`
fallback. Our own market prices (`market_items`) are used for valuation, never
the upstream price feed.
