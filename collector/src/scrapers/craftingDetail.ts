// On-demand ingredient breakdown scraper for bdolytics Crafting Calculator detail pages.
// Scrapes ONLY when user opens drawer (never bulk 854), via stealth + 3-8s delays.
// Extracts bdolytics precomputed per-ingredient quantity, unit cost, total cost, and
// top-level crafting cost / profit / profit-per-hour. Never recomputes formulas locally.

import { readFileSync } from "node:fs"
import type { Page } from "playwright"
import pg from "pg"
import { launch, politeDelay, assertNotBlocked } from "../lib/browser.js"

if (!process.env.DATABASE_URL) {
  try {
    const envText = readFileSync(new URL("../../../.env", import.meta.url), "utf8")
    for (const line of envText.split("\n")) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
    }
  } catch {}
}

export interface CraftingIngredient {
  name: string
  quantity: number
  unitPrice: number | null
  totalCost: number | null
  isSubRecipe: boolean
  subRecipeSlug: string | null
}

export interface CraftingDetail {
  recipeSlug: string
  recipeName: string
  category: string | null
  totalCost: number | null
  profit: number | null
  profitPerHour: number | null
  ingredients: CraftingIngredient[]
  collectedAt: string
}

function parseMoney(s: string | undefined): number | null {
  if (!s || s === "-") return null
  const m = s.match(/^(-?[\d,.]+)\s*([KMB])?$/i)
  if (!m) return null
  let n = parseFloat(m[1].replace(/,/g, ""))
  const suf = m[2]?.toUpperCase()
  if (suf === "K") n *= 1e3
  else if (suf === "M") n *= 1e6
  else if (suf === "B") n *= 1e9
  return Math.round(n)
}

// Detail page structure (as of 2026-09 manual inspection):
// - Title: h1 or [data-testid="recipe-title"]
// - Cost/Profit block: contains "Crafting Cost", "Profit", "Silver/Hour" or similar
// - Ingredients: table or list where each row has <a href="/en/crafting/...">Ingredient Name</a> + quantity + price
// We use a resilient multi-selector strategy and fall back to JSON in __NEXT_DATA__ if present.
export async function scrapeCraftingDetail(slug: string): Promise<CraftingDetail> {
  // slug is like "123:abc" or "/en/crafting/123:abc" — normalize to path
  const path = slug.startsWith("/") ? slug : `/en/crafting/${slug}`
  const url = `https://bdolytics.com${path}`
  console.log(`Scraping detail: ${url}`)

  const { browser, page } = await launch()
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" })
    await assertNotBlocked(page, `crafting detail ${slug}`)
    await politeDelay()

    // Try to extract from __NEXT_DATA__ JSON first (most reliable, no DOM fragile)
    const nextData = await page.evaluate(() => {
      const el = document.getElementById("__NEXT_DATA__")
      if (!el) return null
      try {
        return JSON.parse(el.textContent || "")
      } catch {
        return null
      }
    })

    // Fallback: DOM text
    const title = await page.locator("h1").first().innerText().catch(() => slug)
    const bodyText = await page.locator("main").innerText().catch(() => "")

    // Try to find ingredients via DOM: look for links to /crafting/ inside main.
    // The detail page shows each ingredient TWICE: once in the main
    // breakdown list (anchor text is "<Name> ×<qty>", e.g. "Hot Pepper ×2"
    // — the multiplication sign U+00D7, not ASCII "x", confirmed by
    // running this against a live page) and once in a sidebar dependency
    // tree (anchor text is "<Name> (<rate>/h)", no quantity at all). A
    // first version of this function looked for an ASCII "x5"/"5x" pattern
    // in the anchor's *parent* text, which never matched either real
    // format, so quantity always came back 1 and both occurrences were
    // kept as separate (duplicate) ingredient rows - confirmed by running
    // it against a real recipe. Fixed by reading the quantity straight out
    // of the anchor's own text (×N form) and skipping the (rate/h) variant
    // entirely when the ×N variant for the same sub-recipe is present.
    const ingredients = await page.evaluate(() => {
      const main = document.querySelector("main")
      if (!main) return [] as Array<{ name: string; href: string | null; rawText: string }>
      const rows: Array<{ name: string; href: string | null; rawText: string }> = []
      const anchors = Array.from(main.querySelectorAll('a[href*="/crafting/"]')) as HTMLAnchorElement[]
      for (const a of anchors) {
        const rawText = (a.innerText || a.textContent || "").trim()
        if (!rawText || rawText.length < 2) continue
        if (a.closest("h1")) continue // skip the title itself
        rows.push({ name: rawText, href: a.getAttribute("href"), rawText })
      }
      return rows
    })

    // If we got nothing via DOM, try to parse bodyText for ingredient-like lines
    let parsedIngredients: CraftingIngredient[] = []
    if (ingredients.length > 0) {
      const bySlug = new Map<string, CraftingIngredient>()
      for (const ing of ingredients) {
        const subSlugMatch = ing.href?.match(/\/crafting\/([^/?#]+)/)
        const subSlug = subSlugMatch ? subSlugMatch[1] : null
        const key = subSlug ?? ing.rawText // ingredients with no sub-recipe link (raw market materials) have no slug to dedupe on

        const qtyMatch = ing.rawText.match(/[×x]\s*(\d+(?:\.\d+)?)/i)
        const isRateVariant = /\(\s*-?[\d,.]+[KMB]?\s*\/\s*h\s*\)/i.test(ing.rawText) // "(0/h)" sidebar-tree form, no quantity

        if (bySlug.has(key)) {
          // Already have an entry for this ingredient - only replace it if
          // this occurrence actually carries a real quantity and the
          // existing one doesn't (prefer the ×N form over the (rate/h) form).
          if (qtyMatch && bySlug.get(key)!.quantity === 1 && !isRateVariant) {
            // fall through to overwrite below
          } else {
            continue
          }
        }
        if (isRateVariant && !qtyMatch) continue // pure sidebar-tree duplicate, no new info

        const name = ing.rawText.replace(/[×x]\s*\d+(?:\.\d+)?\s*$/i, "").replace(/\(\s*-?[\d,.]+[KMB]?\s*\/\s*h\s*\)\s*$/i, "").trim()
        const qty = qtyMatch ? parseFloat(qtyMatch[1]) : 1
        bySlug.set(key, {
          name: name || ing.rawText,
          quantity: isNaN(qty) ? 1 : qty,
          unitPrice: null, // will be filled from market or detail page price column if available
          totalCost: null,
          isSubRecipe: !!subSlug,
          subRecipeSlug: subSlug,
        })
      }
      parsedIngredients = Array.from(bySlug.values())
    } else {
      // Fallback: try to parse bodyText for "Cost" lines
      // Look for lines that contain ingredient names (heuristic)
      const lines = bodyText.split("\n").map((l) => l.trim()).filter(Boolean)
      // No reliable parse — return empty and let caller know
      parsedIngredients = []
    }

    // Extract top-level costs from bodyText if possible
    let totalCost: number | null = null
    let profit: number | null = null
    let profitPerHour: number | null = null
    const costMatch = bodyText.match(/Crafting Cost[:\s]*([-\d,.]+[KMB]?)/i)
    if (costMatch) totalCost = parseMoney(costMatch[1])
    const profitMatch = bodyText.match(/Profit[:\s]*([-\d,.]+[KMB]?)/i)
    if (profitMatch) profit = parseMoney(profitMatch[1])
    const pphMatch = bodyText.match(/Silver\/Hour[:\s]*([-\d,.]+[KMB]?)/i)
    if (pphMatch) profitPerHour = parseMoney(pphMatch[1])

    // If __NEXT_DATA__ had useful props, prefer it
    if (nextData?.props?.pageProps) {
      const pp = nextData.props.pageProps
      // bdolytics sometimes includes recipe data in pageProps
      if (pp.recipe) {
        const r = pp.recipe
        if (r.totalCost) totalCost = Number(r.totalCost) || totalCost
        if (r.profit) profit = Number(r.profit) || profit
        if (Array.isArray(r.ingredients) && r.ingredients.length > 0) {
          parsedIngredients = r.ingredients.map((ing: any) => ({
            name: ing.name || ing.itemName || "Unknown",
            quantity: Number(ing.quantity || ing.count || 1),
            unitPrice: ing.unitPrice ?? ing.price ?? null,
            totalCost: ing.totalCost ?? null,
            isSubRecipe: !!ing.subRecipeSlug || !!ing.recipeSlug,
            subRecipeSlug: ing.subRecipeSlug || ing.recipeSlug || null,
          }))
        }
      }
    }

    const detail: CraftingDetail = {
      recipeSlug: slug.includes("/") ? slug.split("/").pop() || slug : slug,
      recipeName: title.trim() || slug,
      category: null,
      totalCost,
      profit,
      profitPerHour,
      ingredients: parsedIngredients,
      collectedAt: new Date().toISOString(),
    }

    await politeDelay()
    return detail
  } finally {
    await browser.close().catch(() => {})
  }
}

/** Persists a scraped detail into Postgres so `GET
 * /api/crafting-recipes/[slug]/ingredients` (cache-read-only, never
 * scrapes itself) can actually serve it. This didn't exist at all before -
 * the CLI only ever printed JSON to stdout, so the ingredient drawer had
 * no way to ever show real data in the deployed app, confirmed by
 * checking: nothing else in the codebase references these two tables as a
 * write target. */
async function saveCraftingDetail(detail: CraftingDetail, category: string | null): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not set - scraped detail was NOT saved to Postgres, only printed below.")
    return
  }
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    await client.query(
      `INSERT INTO crafting_recipe_details (recipe_slug, recipe_name, category, total_cost, profit, profit_per_hour, ingredients_json, collected_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())
       ON CONFLICT (recipe_slug) DO UPDATE SET
         recipe_name = EXCLUDED.recipe_name, category = EXCLUDED.category,
         total_cost = EXCLUDED.total_cost, profit = EXCLUDED.profit, profit_per_hour = EXCLUDED.profit_per_hour,
         ingredients_json = EXCLUDED.ingredients_json, collected_at = now()`,
      [detail.recipeSlug, detail.recipeName, category, detail.totalCost, detail.profit, detail.profitPerHour, JSON.stringify(detail.ingredients)],
    )
    // Replace this recipe's ingredient rows wholesale rather than trying to
    // diff - simplest correct option for a small per-recipe row count.
    await client.query(`DELETE FROM crafting_recipe_ingredients WHERE recipe_slug = $1`, [detail.recipeSlug])
    for (const ing of detail.ingredients) {
      await client.query(
        `INSERT INTO crafting_recipe_ingredients (recipe_slug, ingredient_name, quantity, unit_price, total_cost, is_sub_recipe, sub_recipe_slug, collected_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, now())
         ON CONFLICT (recipe_slug, ingredient_name) DO UPDATE SET
           quantity = EXCLUDED.quantity, unit_price = EXCLUDED.unit_price, total_cost = EXCLUDED.total_cost,
           is_sub_recipe = EXCLUDED.is_sub_recipe, sub_recipe_slug = EXCLUDED.sub_recipe_slug, collected_at = now()`,
        [detail.recipeSlug, ing.name, ing.quantity, ing.unitPrice, ing.totalCost, ing.isSubRecipe, ing.subRecipeSlug],
      )
    }
    console.log(`Saved to Postgres: crafting_recipe_details + ${detail.ingredients.length} ingredient row(s) for ${detail.recipeSlug}`)
  } finally {
    await client.end().catch(() => {})
  }
}

// CLI: npm run collect:crafting-detail -- <slug> [category]
if (import.meta.url === `file://${process.argv[1]}`) {
  const slug = process.argv[2]
  const category = process.argv[3] ?? null
  if (!slug) {
    console.error("Usage: npm run collect:crafting-detail -- <slug> [category]   e.g. 123:abc Cooking")
    process.exit(1)
  }
  scrapeCraftingDetail(slug)
    .then(async (d) => {
      console.log(JSON.stringify(d, null, 2))
      await saveCraftingDetail(d, category)
    })
    .catch((e) => {
      console.error("Scrape failed:", e.message)
      process.exit(1)
    })
}
