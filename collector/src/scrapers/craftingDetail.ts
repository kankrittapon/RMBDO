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
  iconUrl: string | null
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

    // Ingredient extraction, rewritten 2026-09-07 after a real bug: recipes
    // whose ingredients are ALL raw/base materials (nothing craftable, e.g.
    // "Beer" = Wheat + Sugar + Leavening Agent + Mineral Water) came back
    // with ZERO ingredients, because the old version only ever looked for
    // `<a href="/crafting/...">` anchors - which only exist for ingredients
    // that are themselves sub-recipes. Confirmed by live DOM inspection:
    // the page renders a fully-expanded dependency tree as nested
    // `<ul><li>` elements (one root `<ul>` per DIRECT ingredient of this
    // recipe; a sub-recipe's own ingredients render as a further-nested
    // `<ul>` inside that root `<ul>`'s `<li>`, recursively). Each root
    // `<ul>`'s single direct `<li>` child holds: a small quantity number
    // (`span.text-sm.text-darker`, e.g. "5" - this is the real per-craft
    // amount, NOT the large comma-formatted bulk number in the separate
    // summary table above), the ingredient name (inside an `<a
    // href="/crafting/...">` when it's a sub-recipe, otherwise a plain
    // `<span>`), and its icon. Taking only ROOT-level `<ul>`s (those whose
    // parent isn't itself a `<ul>`) - rather than every `<li>` on the page -
    // is what keeps this to exactly this recipe's own direct ingredients,
    // not the flattened recursive tree of every sub-ingredient too (which
    // this app's own IngredientTreeNode already fetches on demand,
    // separately, when the user expands a sub-recipe row).
    const ingredients = await page.evaluate(() => {
      const main = document.querySelector("main")
      if (!main) return [] as Array<{ name: string; qtyText: string | null; href: string | null; iconUrl: string | null }>
      const rows: Array<{ name: string; qtyText: string | null; href: string | null; iconUrl: string | null }> = []
      const allUls = Array.from(main.querySelectorAll("ul"))
      const rootUls = allUls.filter((ul) => ul.parentElement?.tagName !== "UL")
      for (const ul of rootUls) {
        const li = ul.querySelector(":scope > li")
        if (!li || !(li.className || "").includes("select-none")) continue
        const a = li.querySelector('a[href*="/crafting/"]') as HTMLAnchorElement | null
        // The name lives in the bold/colored `div[style*="font-weight"]` -
        // NOT just "the next span", which would match the quantity span
        // (e.g. "5") that comes first in document order instead.
        const nameEl: Element | null = a ?? li.querySelector('div[style*="font-weight"]')
        // Sub-recipe anchors include a trailing profit-rate annotation in
        // their own text (e.g. "Red Sauce (22.6M/h)", "Onion (0/h)") -
        // strip it so the stored ingredient name matches the plain-text
        // name used everywhere else (recipe lists, market items, icons).
        const name = (nameEl?.textContent || "")
          .replace(/\(\s*-?[\d,.]+[KMB]?\s*\/\s*h\s*\)\s*$/i, "")
          .trim()
        if (!name) continue
        const qtySpan = li.querySelector("span.text-sm.text-darker") as HTMLElement | null
        const img = li.querySelector("img") as HTMLImageElement | null
        rows.push({
          name,
          qtyText: qtySpan?.textContent?.trim() ?? null,
          href: a?.getAttribute("href") ?? null,
          iconUrl: img?.src || null,
        })
      }
      return rows
    })

    let parsedIngredients: CraftingIngredient[] = []
    for (const ing of ingredients) {
      const subSlugMatch = ing.href?.match(/\/crafting\/([^/?#]+)/)
      const subSlug = subSlugMatch ? subSlugMatch[1] : null
      const qty = ing.qtyText ? parseFloat(ing.qtyText) : 1
      parsedIngredients.push({
        name: ing.name,
        quantity: isNaN(qty) ? 1 : qty,
        unitPrice: null, // will be filled from market or detail page price column if available
        totalCost: null,
        isSubRecipe: !!subSlug,
        subRecipeSlug: subSlug,
        iconUrl: ing.iconUrl,
      })
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
            iconUrl: ing.iconUrl ?? ing.icon ?? null,
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
export async function saveCraftingDetail(detail: CraftingDetail, category: string | null): Promise<void> {
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
        `INSERT INTO crafting_recipe_ingredients (recipe_slug, ingredient_name, quantity, unit_price, total_cost, is_sub_recipe, sub_recipe_slug, icon_url, collected_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
         ON CONFLICT (recipe_slug, ingredient_name) DO UPDATE SET
           quantity = EXCLUDED.quantity, unit_price = EXCLUDED.unit_price, total_cost = EXCLUDED.total_cost,
           is_sub_recipe = EXCLUDED.is_sub_recipe, sub_recipe_slug = EXCLUDED.sub_recipe_slug,
           icon_url = EXCLUDED.icon_url, collected_at = now()`,
        [detail.recipeSlug, ing.name, ing.quantity, ing.unitPrice, ing.totalCost, ing.isSubRecipe, ing.subRecipeSlug, ing.iconUrl],
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
