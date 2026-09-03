// On-demand ingredient breakdown scraper for bdolytics Crafting Calculator detail pages.
// Scrapes ONLY when user opens drawer (never bulk 854), via stealth + 3-8s delays.
// Extracts bdolytics precomputed per-ingredient quantity, unit cost, total cost, and
// top-level crafting cost / profit / profit-per-hour. Never recomputes formulas locally.

import { readFileSync } from "node:fs"
import type { Page } from "playwright"
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

    // Try to find ingredients via DOM: look for links to /crafting/ inside main
    const ingredients = await page.evaluate(() => {
      const main = document.querySelector("main")
      if (!main) return [] as Array<{ name: string; href: string | null; quantity: string | null }>
      const rows: Array<{ name: string; href: string | null; quantity: string | null }> = []
      // Heuristic: ingredient rows often have an <a> + a quantity nearby (e.g. "5" or "x5")
      const anchors = Array.from(main.querySelectorAll('a[href*="/crafting/"]')) as HTMLAnchorElement[]
      for (const a of anchors) {
        const name = a.innerText?.trim()
        if (!name || name.length < 2) continue
        // Skip the title itself (first large heading)
        if (a.closest("h1")) continue
        // Find quantity near this anchor — look at next sibling or parent's text
        let quantity: string | null = null
        const parent = a.closest("tr") || a.closest("div") || a.parentElement
        if (parent) {
          const txt = parent.innerText || ""
          const m = txt.match(/x\s*(\d+(?:\.\d+)?)|\b(\d+)\s*x\b/i)
          if (m) quantity = m[1] || m[2]
        }
        rows.push({ name, href: a.getAttribute("href"), quantity })
      }
      return rows
    })

    // If we got nothing via DOM, try to parse bodyText for ingredient-like lines
    let parsedIngredients: CraftingIngredient[] = []
    if (ingredients.length > 0) {
      parsedIngredients = ingredients.map((ing) => {
        const qty = ing.quantity ? parseFloat(ing.quantity) : 1
        const subSlugMatch = ing.href?.match(/\/crafting\/([^/?#]+)/)
        const subSlug = subSlugMatch ? subSlugMatch[1] : null
        return {
          name: ing.name,
          quantity: isNaN(qty) ? 1 : qty,
          unitPrice: null, // will be filled from market or detail page price column if available
          totalCost: null,
          isSubRecipe: !!subSlug,
          subRecipeSlug: subSlug,
        }
      })
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

// CLI: npm run collect:crafting-detail -- <slug>
if (import.meta.url === `file://${process.argv[1]}`) {
  const slug = process.argv[2]
  if (!slug) {
    console.error("Usage: npm run collect:crafting-detail -- <slug>   e.g. 123:abc")
    process.exit(1)
  }
  scrapeCraftingDetail(slug)
    .then((d) => {
      console.log(JSON.stringify(d, null, 2))
    })
    .catch((e) => {
      console.error("Scrape failed:", e.message)
      process.exit(1)
    })
}
