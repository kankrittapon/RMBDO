import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db/pool"

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = decodeURIComponent(params.slug)

  if (!slug || slug.length < 2) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 })
  }

  try {
    const pool = getPool()

    // 1. Check cache: crafting_recipe_details (top-level) + ingredients
    const detailRes = await pool.query(
      `SELECT recipe_slug, recipe_name, category, total_cost, profit, profit_per_hour, ingredients_json, collected_at
       FROM crafting_recipe_details WHERE recipe_slug = $1`,
      [slug]
    )

    if (detailRes.rows.length > 0) {
      const row = detailRes.rows[0]
      // Also fetch normalized ingredients if needed
      const ingRes = await pool.query(
        `SELECT ingredient_name, quantity, unit_price, total_cost, is_sub_recipe, sub_recipe_slug
         FROM crafting_recipe_ingredients WHERE recipe_slug = $1 ORDER BY id`,
        [slug]
      )
      return NextResponse.json({
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
        // Fallback to ingredients_json if normalized table empty (flexibility)
        ingredientsJson: row.ingredients_json,
        collectedAt: row.collected_at,
        source: "cache",
      })
    }

    // 2. Cache miss — do NOT bulk scrape. Return 404 with guidance.
    // On-demand scraping is intentionally not auto-triggered in Vercel (no Playwright).
    // Client should show "Not yet cached — click to fetch" and the collector can be
    // run manually: `npm run collect:crafting-detail -- <slug>` (stealth, 3-8s delay).
    // If ENABLE_ON_DEMAND_SCRAPE=true locally, the scraper in collector/src/scrapers/craftingDetail.ts
    // can be invoked manually and will populate the cache for this slug.
    return NextResponse.json(
      {
        error: "Recipe details not yet cached",
        hint: "This recipe's ingredient tree hasn't been fetched yet. Click 'Fetch details' to load it on-demand (stealth, 3-8s). Bulk scraping 854 recipes is disabled to avoid Cloudflare blocks.",
        recipeSlug: slug,
      },
      { status: 404 }
    )
  } catch (err) {
    console.error("GET /api/crafting-recipes/[slug]/ingredients failed:", err)
    return NextResponse.json({ error: "db unavailable" }, { status: 500 })
  }
}
