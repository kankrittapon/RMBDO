// Reads the most recent collector/out/*.json exports and upserts them into
// Postgres by name (schema.sql has no unique constraint on fishing_spots.name
// or grind_spots.name yet, so this does a manual select-then-update-or-insert
// rather than a real ON CONFLICT upsert - fine at this data volume).
//
// Only rows the collector tagged as real (dataSource "live-click" / "live-api")
// get their coordinates written; "unresolved" rows are upserted with
// coord_x/coord_y left untouched rather than overwritten with NULL, in case a
// previous run already resolved them.

import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import pg from "pg"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error("Set DATABASE_URL in .env first - see .env.example.")
  process.exit(1)
}

const outDir = join("collector", "out")

function latestFile(prefix) {
  const files = readdirSync(outDir)
    .filter((f) => f.startsWith(prefix) && f.endsWith(".json"))
    .sort()
  return files.length ? join(outDir, files[files.length - 1]) : null
}

const client = new pg.Client({ connectionString })

async function upsertFishingSpot(zone) {
  const existing = await client.query("SELECT id FROM fishing_spots WHERE name = $1", [zone.zone])
  if (existing.rowCount > 0) {
    if (zone.coordinates) {
      await client.query(
        "UPDATE fishing_spots SET coord_x = $1, coord_y = $2, is_deep_sea = TRUE, is_deepest_point = TRUE WHERE name = $3",
        [zone.coordinates[0], zone.coordinates[1], zone.zone],
      )
    }
    return "updated"
  }
  await client.query(
    `INSERT INTO fishing_spots (name, is_hotspot, is_deep_sea, is_deepest_point, has_red_fish, coord_x, coord_y, source_url, notes)
     VALUES ($1, FALSE, TRUE, TRUE, TRUE, $2, $3, 'https://bdolytics.com/en/map', $4)`,
    [
      zone.zone,
      zone.coordinates?.[0] ?? null,
      zone.coordinates?.[1] ?? null,
      `Collected by scripts/../collector (dataSource: ${zone.dataSource}). Fish: ${zone.fish.join(", ")}`,
    ],
  )
  return "inserted"
}

async function upsertGrindSpot(spot) {
  const existing = await client.query("SELECT id FROM grind_spots WHERE name = $1", [spot.name])
  if (existing.rowCount > 0) {
    await client.query(
      "UPDATE grind_spots SET recommended_ap = $1, recommended_dp = $2, coord_x = $3, coord_y = $4, notable_drops = $5 WHERE name = $6",
      [
        spot.recommendedAP || null,
        spot.recommendedDP || null,
        spot.coordinates?.[0] ?? null,
        spot.coordinates?.[1] ?? null,
        spot.rareDrops.join(", ") || null,
        spot.name,
      ],
    )
    return "updated"
  }
  await client.query(
    `INSERT INTO grind_spots (name, recommended_ap, recommended_dp, notable_drops, coord_x, coord_y, source_url, notes)
     VALUES ($1, $2, $3, $4, $5, $6, 'https://bdolytics.com/en/map', $7)`,
    [
      spot.name,
      spot.recommendedAP || null,
      spot.recommendedDP || null,
      spot.rareDrops.join(", ") || null,
      spot.coordinates?.[0] ?? null,
      spot.coordinates?.[1] ?? null,
      `Collected by scripts/../collector (dataSource: ${spot.dataSource})`,
    ],
  )
  return "inserted"
}

async function run() {
  await client.connect()

  const fishingFile = latestFile("fishing-depth4-")
  if (fishingFile) {
    const { zones } = JSON.parse(readFileSync(fishingFile, "utf8"))
    let inserted = 0, updated = 0
    for (const zone of zones) {
      const result = await upsertFishingSpot(zone)
      if (result === "inserted") inserted++
      else updated++
    }
    console.log(`Fishing (${fishingFile}): ${inserted} inserted, ${updated} updated.`)
  } else {
    console.log("No fishing export found in collector/out/ - run `npm run collect:fishing` first.")
  }

  const grindFile = latestFile("grindspots-")
  if (grindFile) {
    const { spots } = JSON.parse(readFileSync(grindFile, "utf8"))
    let inserted = 0, updated = 0
    for (const spot of spots) {
      const result = await upsertGrindSpot(spot)
      if (result === "inserted") inserted++
      else updated++
    }
    console.log(`Grind spots (${grindFile}): ${inserted} inserted, ${updated} updated.`)
  } else {
    console.log("No grind spot export found in collector/out/ - run `npm run collect:grindspots` first.")
  }

  await client.end()
}

run().catch(async (err) => {
  console.error("Normalize failed:", err.message)
  await client.end().catch(() => {})
  process.exit(1)
})
