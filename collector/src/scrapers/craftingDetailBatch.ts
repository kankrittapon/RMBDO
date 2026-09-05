// Daily incremental ingredient-tree backfill. Scrapes a small batch of
// recipes that don't have a crafting_recipe_details row yet (never all
// 487+ at once - that's exactly the bulk-scrape pattern this project
// avoids to stay clear of Cloudflare blocks), prioritized by profit/hour
// so the recipes a player is actually likely to open first get cached
// first. Run daily via scripts/collect-and-sync-daily.sh; after a few
// weeks every profitable recipe accumulates a cached ingredient tree with
// zero manual clicking, and the deployed app (Vercel, no Playwright) can
// serve all of it straight from Postgres.
import { readFileSync } from "node:fs"
import pg from "pg"
import { scrapeCraftingDetail, saveCraftingDetail } from "./craftingDetail.js"
import { politeDelay } from "../lib/browser.js"

if (!process.env.DATABASE_URL) {
  try {
    const envText = readFileSync(new URL("../../../.env", import.meta.url), "utf8")
    for (const line of envText.split("\n")) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
    }
  } catch {
    // no .env file - DATABASE_URL just won't be available and this will exit below.
  }
}

const BATCH_SIZE = Number(process.env.CRAFTING_DETAIL_BATCH_SIZE ?? 25)

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set - cannot pick recipes to backfill.")
    process.exit(1)
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  const { rows } = await client.query(
    `SELECT cr.recipe_slug, cr.recipe_name, cr.category
     FROM crafting_recipes cr
     LEFT JOIN crafting_recipe_details d ON d.recipe_slug = cr.recipe_slug
     WHERE cr.recipe_slug IS NOT NULL AND d.recipe_slug IS NULL
     ORDER BY cr.profit_per_hour DESC NULLS LAST
     LIMIT $1`,
    [BATCH_SIZE],
  )
  await client.end()

  if (rows.length === 0) {
    console.log("No uncached recipes left to backfill - every recipe with a slug already has an ingredient-tree cache entry.")
    return
  }

  console.log(`Backfilling ingredient trees for ${rows.length} recipe(s) (batch size ${BATCH_SIZE}):`)
  let ok = 0
  let failed = 0
  for (const row of rows) {
    try {
      const detail = await scrapeCraftingDetail(row.recipe_slug)
      await saveCraftingDetail(detail, row.category)
      ok++
    } catch (err) {
      console.error(`Failed to backfill ${row.recipe_slug} (${row.recipe_name}):`, (err as Error).message)
      failed++
      // A Cloudflare block or similar aborts the whole run rather than
      // continuing to hammer the site - same posture as the other
      // collectors (see collector/src/lib/browser.ts assertNotBlocked).
      if (/blocked|rate limit/i.test((err as Error).message)) {
        console.error("Stopping batch early - looks like a Cloudflare block, not a one-off failure.")
        break
      }
    }
    await politeDelay()
  }
  console.log(`Backfill done: ${ok} saved, ${failed} failed.`)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
