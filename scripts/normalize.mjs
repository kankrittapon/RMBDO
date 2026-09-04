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

async function upsertMarketItems(items, region) {
  let count = 0
  for (const item of items) {
    await client.query(
      `INSERT INTO market_items (item_name, category, region, price, volume_14d_avg, stock, collected_at)
       VALUES ($1, $2, $3, $4, $5, $6, now())
       ON CONFLICT (item_name, region) DO UPDATE SET
         category = EXCLUDED.category, price = EXCLUDED.price,
         volume_14d_avg = EXCLUDED.volume_14d_avg, stock = EXCLUDED.stock, collected_at = now()`,
      [item.itemName, item.category, region, item.price, item.volume14dAvg, item.stock],
    )
    count++
  }
  return count
}

async function upsertCraftingRecipes(recipes, region) {
  // Each recipe carries its own `personalized` flag (per-category, set by
  // collector/src/scrapers/crafting.ts) - do NOT apply one global flag to
  // every row. An earlier version did that and mislabeled every category
  // as personalized just because ONE of them (e.g. Cooking) had its
  // Mastery set in player_settings, even though Alchemy/Processing/
  // Imperial Crates rows in that same run were still bdolytics' defaults.
  // Now also handles recipe_slug to fix Imperial Crates 322->12 collapse:
  // when slug is present, use ON CONFLICT (recipe_slug, region) WHERE slug IS NOT NULL
  let count = 0
  for (const r of recipes) {
    if (r.recipeSlug) {
      await client.query(
        `INSERT INTO crafting_recipes (recipe_name, category, region, profit_per_hour, price, volume_14d_avg, experience, personalized, source_url, recipe_slug, collected_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'https://bdolytics.com/en/crafting', $9, now())
         ON CONFLICT (recipe_slug, region) WHERE recipe_slug IS NOT NULL DO UPDATE SET
           recipe_name = EXCLUDED.recipe_name, category = EXCLUDED.category,
           profit_per_hour = EXCLUDED.profit_per_hour, price = EXCLUDED.price,
           volume_14d_avg = EXCLUDED.volume_14d_avg, experience = EXCLUDED.experience,
           personalized = EXCLUDED.personalized, collected_at = now()`,
        [r.recipeName, r.category, region, r.profitPerHour, r.price, r.volume14dAvg, r.experience, Boolean(r.personalized), r.recipeSlug],
      )
    } else {
      // No recipe_slug for this row (scrape fallback failed to capture a
      // detail-page link) - there's no unique constraint to upsert against
      // any more (see schema.sql), so this is a plain insert. Rare in
      // practice since the collector attaches a slug to virtually every
      // row; worst case a slug-less recipe accumulates a duplicate row
      // across runs, which is a much smaller problem than the crash this
      // replaced.
      await client.query(
        `INSERT INTO crafting_recipes (recipe_name, category, region, profit_per_hour, price, volume_14d_avg, experience, personalized, source_url, collected_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'https://bdolytics.com/en/crafting', now())`,
        [r.recipeName, r.category, region, r.profitPerHour, r.price, r.volume14dAvg, r.experience, Boolean(r.personalized)],
      )
    }
    count++
  }
  return count
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

  const marketFile = latestFile("market-")
  if (marketFile) {
    const { items, region } = JSON.parse(readFileSync(marketFile, "utf8"))
    const count = await upsertMarketItems(items, region)
    console.log(`Market items (${marketFile}): ${count} upserted.`)
  } else {
    console.log("No market export found in collector/out/ - run `npm run collect:market` first.")
  }

  const craftingFile = latestFile("crafting-")
  if (craftingFile) {
    const { recipes: rawRecipes, region } = JSON.parse(readFileSync(craftingFile, "utf8"))
    // Safe scraping policy: only sync profitable recipes (profitPerHour > 0)
    // Keeps DB lean and avoids Cloudflare exposure from dead recipes
    const recipes = rawRecipes.filter((r) => r.profitPerHour !== null && r.profitPerHour > 0)
    const filtered = rawRecipes.length - recipes.length
    if (filtered > 0) console.log(`Crafting filter: ${filtered} unprofitable recipes skipped (profitPerHour <=0), ${recipes.length} profitable kept`)
    const count = await upsertCraftingRecipes(recipes, region)
    const personalizedCount = recipes.filter((r) => r.personalized).length
    console.log(`Crafting recipes (${craftingFile}): ${count} upserted (${personalizedCount} personalized, filtered ${filtered}).`)
  } else {
    console.log("No crafting export found in collector/out/ - run `npm run collect:crafting` first.")
  }

  await client.end()
}

run().catch(async (err) => {
  console.error("Normalize failed:", err.message)
  await client.end().catch(() => {})
  process.exit(1)
})
