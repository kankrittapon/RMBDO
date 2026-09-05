import { NextRequest, NextResponse } from "next/server"
import { execFile } from "node:child_process"
import path from "node:path"
import { getPool } from "@/lib/db/pool"

const REPO_ROOT = path.join(process.cwd())

async function fetchCached(slug: string) {
  const pool = getPool()
  const detailRes = await pool.query(
    `SELECT recipe_slug, recipe_name, category, total_cost, profit, profit_per_hour, ingredients_json, collected_at
     FROM crafting_recipe_details WHERE recipe_slug = $1`,
    [slug],
  )
  if (detailRes.rows.length === 0) return null

  const row = detailRes.rows[0]
  const ingRes = await pool.query(
    `SELECT ingredient_name, quantity, unit_price, total_cost, is_sub_recipe, sub_recipe_slug
     FROM crafting_recipe_ingredients WHERE recipe_slug = $1 ORDER BY id`,
    [slug],
  )
  return {
    recipeSlug: row.recipe_slug,
    recipeName: row.recipe_name,
    category: row.category,
    totalCost: row.total_cost !== null ? Number(row.total_cost) : null,
    profit: row.profit !== null ? Number(row.profit) : null,
    profitPerHour: row.profit_per_hour !== null ? Number(row.profit_per_hour) : null,
    ingredients: ingRes.rows.map((r) => ({
      name: r.ingredient_name,
      quantity: Number(r.quantity),
      unitPrice: r.unit_price !== null ? Number(r.unit_price) : null,
      totalCost: r.total_cost !== null ? Number(r.total_cost) : null,
      isSubRecipe: r.is_sub_recipe,
      subRecipeSlug: r.sub_recipe_slug,
    })),
    ingredientsJson: row.ingredients_json,
    collectedAt: row.collected_at,
  }
}

/** Runs collector/src/scrapers/craftingDetail.ts for one slug as a child
 * process (rather than importing it directly - the collector is a
 * separate npm workspace with its own ESM/tsx setup, and shelling out
 * avoids bundling Playwright into this route's serverless function).
 * Gated behind ENABLE_ON_DEMAND_SCRAPE, which must stay unset on Vercel:
 * there's no Playwright/chromium there, and even where there is, spawning
 * a real browser per HTTP request is only reasonable for a single-user
 * local/self-hosted dev server, not production traffic. The script itself
 * already persists its result to Postgres (see saveCraftingDetail in
 * craftingDetail.ts), so this just re-reads the cache afterward. */
function runOnDemandScrape(slug: string, category: string | null): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = ["tsx", "src/scrapers/craftingDetail.ts", slug, ...(category ? [category] : [])]
    const child = execFile(
      "npx",
      args,
      { cwd: path.join(REPO_ROOT, "collector"), timeout: 30_000 },
      (err, stdout, stderr) => {
        if (err) {
          console.error("On-demand craftingDetail scrape failed:", stderr || err.message)
          reject(err)
          return
        }
        resolve()
      },
    )
    void child
  })
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug)
  const category = req.nextUrl.searchParams.get("category")

  if (!slug || slug.length < 2) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 })
  }

  try {
    const cached = await fetchCached(slug)
    if (cached) {
      return NextResponse.json({ ...cached, source: "cache" })
    }

    if (process.env.ENABLE_ON_DEMAND_SCRAPE === "true") {
      try {
        await runOnDemandScrape(slug, category)
      } catch {
        return NextResponse.json(
          { error: "On-demand scrape failed", hint: "See server logs. The recipe may not exist, or bdolytics blocked the request.", recipeSlug: slug },
          { status: 502 },
        )
      }
      const fresh = await fetchCached(slug)
      if (fresh) {
        return NextResponse.json({ ...fresh, source: "scraped-now" })
      }
      // Scrape ran without error but produced no ingredients (e.g. a raw
      // material with no sub-recipe of its own) - still a real result.
      return NextResponse.json({ error: "Scrape completed but no data found for this recipe", recipeSlug: slug }, { status: 404 })
    }

    // On-demand scraping disabled (default for any deployed environment,
    // including Vercel, which has no Playwright) - populate the cache
    // manually instead: `npm run collect:crafting-detail -- <slug> [category]`.
    return NextResponse.json(
      {
        error: "Recipe details not yet cached",
        hint: "This recipe's ingredient tree hasn't been fetched yet. Run `npm run collect:crafting-detail -- <slug> [category]` to populate it, or enable ENABLE_ON_DEMAND_SCRAPE=true on a local/self-hosted server with Playwright installed.",
        recipeSlug: slug,
      },
      { status: 404 },
    )
  } catch (err) {
    console.error("GET /api/crafting-recipes/[slug]/ingredients failed:", err)
    return NextResponse.json({ error: "db unavailable" }, { status: 500 })
  }
}
