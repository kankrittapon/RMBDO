// Daily incremental ingredient-tree backfill. Scrapes a small batch of
// recipes that don't have a crafting_recipe_details row yet - starting
// from the known profitable recipes (crafting_recipes), then following
// any sub-recipe it discovers (an ingredient that's itself craftable)
// recursively, breadth-first, until either the batch cap is hit or the
// queue runs dry (i.e. it bottoms out at raw market materials with no
// sub-recipe of their own). Never bulk-scrapes everything in one run -
// bounded by CRAFTING_DETAIL_BATCH_SIZE regardless of how deep the tree
// goes, same Cloudflare-exposure reasoning as every other collector here.
// Run daily via scripts/collect-and-sync-daily.sh; over repeated runs this
// converges on every reachable recipe/sub-recipe/sub-sub-recipe... having
// a real cached ingredient tree, with zero manual clicking.
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

interface QueueItem {
  slug: string
  category: string | null
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set - cannot pick recipes to backfill.")
    process.exit(1)
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  // Seed the queue from known profitable recipes, most-profitable-first -
  // these are the ones a player is actually likely to open the drawer for.
  const { rows: seedRows } = await client.query(
    `SELECT cr.recipe_slug, cr.category
     FROM crafting_recipes cr
     LEFT JOIN crafting_recipe_details d ON d.recipe_slug = cr.recipe_slug
     WHERE cr.recipe_slug IS NOT NULL AND d.recipe_slug IS NULL
     ORDER BY cr.profit_per_hour DESC NULLS LAST`,
  )
  // Everything already cached, so newly-discovered sub-recipes that
  // happen to already have a details row don't get re-queued.
  const { rows: cachedRows } = await client.query(`SELECT recipe_slug FROM crafting_recipe_details`)
  await client.end()

  const cached = new Set<string>(cachedRows.map((r) => r.recipe_slug))
  const queued = new Set<string>() // slugs already added to the queue this run, to avoid duplicates
  const queue: QueueItem[] = []
  for (const r of seedRows) {
    if (!cached.has(r.recipe_slug) && !queued.has(r.recipe_slug)) {
      queue.push({ slug: r.recipe_slug, category: r.category })
      queued.add(r.recipe_slug)
    }
  }

  if (queue.length === 0) {
    console.log("No uncached recipes left to backfill - every known recipe already has an ingredient-tree cache entry.")
    return
  }

  console.log(`Backfilling up to ${BATCH_SIZE} recipe(s), starting from ${queue.length} known uncached recipe(s), following sub-recipes as they're discovered.`)
  let ok = 0
  let failed = 0
  let processed = 0

  while (queue.length > 0 && processed < BATCH_SIZE) {
    const item = queue.shift()!
    if (cached.has(item.slug)) continue // could have been discovered twice via different parents
    processed++
    try {
      const detail = await scrapeCraftingDetail(item.slug)
      await saveCraftingDetail(detail, item.category)
      cached.add(item.slug)
      ok++

      // Queue any newly-discovered sub-recipes (ingredients that are
      // themselves craftable) that aren't already cached or queued - this
      // is what makes the batch follow recipe -> sub-recipe -> sub-sub-
      // recipe... down to raw materials, which have no sub-recipe at all
      // and simply stop the chain there.
      for (const ing of detail.ingredients) {
        if (ing.isSubRecipe && ing.subRecipeSlug && !cached.has(ing.subRecipeSlug) && !queued.has(ing.subRecipeSlug)) {
          queue.push({ slug: ing.subRecipeSlug, category: null }) // category unknown for a slug we only found as an ingredient - scrapeCraftingDetail fills in the real name from the page itself
          queued.add(ing.subRecipeSlug)
        }
      }
    } catch (err) {
      console.error(`Failed to backfill ${item.slug}:`, (err as Error).message)
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
  console.log(`Backfill done: ${ok} saved, ${failed} failed, ${queue.length} still queued for next run.`)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
