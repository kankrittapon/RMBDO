// Imports vendor/workerman/ (shrddr/workermanjs@c2ae3c2, see ATTRIBUTION.md)
// into node_meta + node_resources. Idempotent: re-runnable any time
// (CREATE TABLE IF NOT EXISTS + ON CONFLICT DO UPDATE), unlike
// scripts/migrate.mjs which only works on a fresh database.
//
// Usage: npm run import:nodes   (needs DATABASE_URL in .env)
// Provenance: every row carries source='workerman@c2ae3c2' so a
// remove-on-request is one DELETE (see ATTRIBUTION.md).

import { readFileSync } from "node:fs"
import { join } from "node:path"
import pg from "pg"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error("Set DATABASE_URL in .env first - see .env.example.")
  process.exit(1)
}

const SOURCE = "workerman@c2ae3c2"
const DROP_KINDS = ["unlucky", "lucky", "unlucky_gi"]

function load(rel) {
  return JSON.parse(readFileSync(join("vendor", "workerman", rel), "utf8"))
}

const client = new pg.Client({ connectionString })

async function run() {
  await client.connect()

  console.log("Applying schema/migrations/001_node_resources.sql ...")
  await client.query(readFileSync(join("schema", "migrations", "001_node_resources.sql"), "utf8"))

  const drops = load("plantzone_drops.json")          // 370 nodes: {workload, rolls, unlucky, lucky, unlucky_gi}
  const names = load("loc_en_item.json")              // item id -> English name
  const staticNodes = load("plantzone.json")          // 437 nodes: node{kind, CP}, parent
  const graph = JSON.parse(readFileSync(join("public", "data", "bdo-node-graph.json"), "utf8"))

  let metaCount = 0
  for (const [pzk, drop] of Object.entries(drops)) {
    const g = graph[pzk]
    const st = staticNodes[pzk]
    await client.query(
      `INSERT INTO node_meta (waypoint_key, name, parent_key, kind, cp_cost, source, collected_at)
       VALUES ($1, $2, $3, $4, $5, $6, now())
       ON CONFLICT (waypoint_key) DO UPDATE SET
         name = EXCLUDED.name, parent_key = EXCLUDED.parent_key, kind = EXCLUDED.kind,
         cp_cost = EXCLUDED.cp_cost, source = EXCLUDED.source, collected_at = now()`,
      [
        Number(pzk),
        g?.name ?? null,
        st?.parent ?? null,
        st?.node?.kind ?? null,
        // Solver consistency first: our graph's CP is what the WASM router
        // charges. Vendor CP is the same lineage; use it only as fallback.
        g?.need_exploration_point ?? st?.node?.CP ?? 0,
        SOURCE,
      ],
    )
    metaCount++
  }
  console.log(`node_meta: ${metaCount} upserted.`)

  // Batched (UNNEST, 500 rows per roundtrip): the pooler connection has
  // high per-query latency, one-row-at-a-time never finishes in time.
  const CHUNK = 500
  async function upsertChunk(rows) {
    const cols = ["waypoint_key", "resource_item_id", "resource_name", "quantity", "drop_kind", "workload", "region_group", "source"]
    const values = []
    const params = []
    rows.forEach((r, i) => {
      const base = i * cols.length
      params.push(`(${cols.map((_, j) => `$${base + j + 1}`).join(", ")}, now())`)
      values.push(r.waypoint_key, r.resource_item_id, r.resource_name, r.quantity, r.drop_kind, r.workload, r.region_group, SOURCE)
    })
    await client.query(
      `INSERT INTO node_resources (waypoint_key, resource_item_id, resource_name, quantity, drop_kind, workload, region_group, source, collected_at)
       VALUES ${params.join(", ")}
       ON CONFLICT (waypoint_key, resource_item_id, drop_kind) DO UPDATE SET
         resource_name = EXCLUDED.resource_name, quantity = EXCLUDED.quantity,
         workload = EXCLUDED.workload, region_group = EXCLUDED.region_group,
         source = EXCLUDED.source, collected_at = now()`,
      values,
    )
  }

  let resCount = 0, skippedNoName = 0, batch = []
  for (const [pzk, drop] of Object.entries(drops)) {
    for (const kind of DROP_KINDS) {
      const table = drop[kind]
      if (!table) continue
      for (const [itemId, qty] of Object.entries(table)) {
        const name = names[itemId]
        if (!name) {
          skippedNoName++
          continue // no English name -> can't join market_items later; skip loudly
        }
        batch.push({
          waypoint_key: Number(pzk), resource_item_id: Number(itemId), resource_name: name,
          quantity: Number(qty), drop_kind: kind,
          workload: drop.workload ?? null, region_group: drop.regiongroup ?? null,
        })
        if (batch.length >= CHUNK) {
          await upsertChunk(batch)
          resCount += batch.length
          batch = []
          process.stdout.write(`\rnode_resources: ${resCount} upserted...`)
        }
      }
    }
  }
  if (batch.length > 0) {
    await upsertChunk(batch)
    resCount += batch.length
  }
  console.log(`\nnode_resources: ${resCount} upserted, ${skippedNoName} skipped (no English name).`)

  // Phase-2 readiness: how many of these resources have LIVE market prices?
  const { rows } = await client.query(
    `SELECT COUNT(DISTINCT r.resource_name) AS priced,
            (SELECT COUNT(DISTINCT resource_name) FROM node_resources) AS total
     FROM node_resources r JOIN market_items m ON m.item_name = r.resource_name`,
  )
  console.log(`Price coverage: ${rows[0].priced}/${rows[0].total} resources have live market_items prices.`)

  await client.end()
}

run().catch(async (err) => {
  console.error("import-node-resources failed:", err.message)
  await client.end().catch(() => {})
  process.exit(1)
})
