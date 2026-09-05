// Central Market price collector. Four of five categories are fetched
// directly from Arsha.io's public, Cloudflare-free API (no browser at all -
// see fetchArshaCategory below) - their real numeric BDO category IDs were
// confirmed by cross-checking sample item names against this project's own
// previously-scraped market_items rows. "lightstone" is the one holdout:
// its category ID could not be found anywhere (checked bdo-categories.json,
// items_all.json, and a live scan of all ~80 Arsha mainCategory IDs - zero
// matches), so it still goes through the original Playwright scrape of
// bdolytics.com's server-rendered table below.
import { mkdirSync, writeFileSync } from "node:fs"
import type { Page } from "playwright"
import { launch, politeDelay, sleep, assertNotBlocked } from "../lib/browser.js"

// Scoped to categories relevant to farm-vs-buy decisions (raw/processed
// crafting materials), not the entire market (weapon/armor/accessory
// listings aren't "do I farm this or buy it" material comparisons).
const PLAYWRIGHT_CATEGORIES = ["lightstone"] as const

const ARSHA_REGION = "sea"
const ARSHA_BASE = `https://api.arsha.io/v2/${ARSHA_REGION}/GetWorldMarketList`

interface ArshaCategoryConfig {
  category: string
  mainCategory: number
  // null = query mainCategory alone (Arsha returns everything under it).
  subCategories: number[] | null
}

// mainCategory/subCategory IDs confirmed 2026-09-05 by a live scan against
// Arsha.io + spot-checking item names against this project's own
// already-scraped market_items rows (e.g. mainCategory=25 subCategory=1
// returns "Iron Ore" etc., matching the existing "material" category).
const ARSHA_CATEGORIES: ArshaCategoryConfig[] = [
  { category: "material", mainCategory: 25, subCategories: [1, 2, 3, 4, 5, 6, 7, 8] },
  { category: "alchemy-stone", mainCategory: 45, subCategories: null },
  { category: "magic-crystal", mainCategory: 50, subCategories: null },
  { category: "enhancement", mainCategory: 30, subCategories: [1, 2, 3] },
]

interface ArshaItem {
  name: string
  id: number
  currentStock: number
  totalTrades: number
  basePrice: number
  mainCategory: number
  subCategory: number
}

/** Arsha has no "14-day volume" field like bdolytics does - only cumulative
 * totalTrades (all-time), which is a different unit and would be misleading
 * if written into the volume14dAvg column. Left null for Arsha-sourced rows
 * rather than fabricating a number; confirmed with the user this field is
 * display-only (no calculation reads it), so it just renders "-" in the UI. */
async function fetchArshaList(mainCategory: number, subCategory?: number): Promise<ArshaItem[]> {
  const url = subCategory
    ? `${ARSHA_BASE}?mainCategory=${mainCategory}&subCategory=${subCategory}`
    : `${ARSHA_BASE}?mainCategory=${mainCategory}`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json().catch(() => null)
  return Array.isArray(data) ? (data as ArshaItem[]) : []
}

/** Retries on Arsha's frequent transient "connection timeout" errors and
 * occasional empty-array responses (observed repeatedly during manual
 * testing - not a real absence of data, confirmed by immediately retrying
 * the exact same URL and getting a normal response - one retry wasn't
 * always enough, e.g. magic-crystal came back empty twice in a row once). */
async function fetchArshaListWithRetry(mainCategory: number, subCategory?: number): Promise<ArshaItem[]> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const items = await fetchArshaList(mainCategory, subCategory)
    if (items.length > 0) return items
    if (attempt < 3) await sleep(1000 * attempt)
  }
  return []
}

async function fetchArshaCategories(): Promise<MarketItemRecord[]> {
  const results: MarketItemRecord[] = []
  for (const config of ARSHA_CATEGORIES) {
    const subCategories = config.subCategories ?? [undefined]
    let categoryTotal = 0
    for (const sub of subCategories) {
      const items = await fetchArshaListWithRetry(config.mainCategory, sub)
      for (const item of items) {
        results.push({
          itemName: item.name,
          category: config.category,
          price: item.basePrice ?? null,
          volume14dAvg: null,
          stock: item.currentStock ?? null,
          iconUrl: null,
        })
      }
      categoryTotal += items.length
      await sleep(300)
    }
    console.log(`  [arsha:${config.category}] mainCategory=${config.mainCategory}: ${categoryTotal} items`)
    // A real category (unlike "no items at all") should never legitimately
    // come back empty after 3 retries - that means Arsha itself is down or
    // its API shape changed, not that BDO stopped having Iron Ore for sale.
    // Fail loudly instead of silently writing 0 rows, which normalize.mjs
    // would otherwise upsert as if this category genuinely emptied out.
    if (categoryTotal === 0) {
      throw new Error(
        `Arsha.io returned 0 items for category "${config.category}" (mainCategory=${config.mainCategory}) after retries - aborting rather than writing an empty category.`,
      )
    }
  }
  return results
}

export interface MarketItemRecord {
  itemName: string
  category: string
  price: number | null
  volume14dAvg: number | null
  stock: number | null
  iconUrl: string | null
}

async function selectSoutheastAsia(page: Page) {
  // The region picker is a real accessible combobox (confirmed via DOM
  // inspection: role="combobox"), not a plain button - the previous attempt
  // at guessing a text-content selector for the trigger matched nothing
  // reliably. A fresh (logged-out) browser profile defaults to "North
  // America", not whatever region a logged-in session last used, so this
  // always needs to actively select Southeast Asia rather than checking if
  // it's already selected.
  const combobox = page.getByRole("combobox").first()
  await combobox.click()
  await sleep(500)
  await page.getByText("Southeast Asia", { exact: true }).first().click()
  await sleep(600)
}

/** Each item row's name is wrapped in <a href="/en/market/item/<id>">
 * containing both the name text and the item's icon <img> - matched back
 * to the text-parsed rows below by exact name (not DOM-order index,
 * having learned from crafting.ts's slug-extraction bug that index
 * alignment silently breaks the moment element counts don't match 1:1;
 * name-matching has no such failure mode here since every row has exactly
 * one name link, unlike crafting's ingredient-icon duplicates). Icon URLs
 * are hotlinked from cdn.questlog.gg (a dedicated game-asset CDN bdolytics
 * itself hotlinks from) and stored as-is, never downloaded. */
async function extractItemIcons(page: Page): Promise<Map<string, string>> {
  try {
    const pairs = await page.evaluate(() => {
      const main = document.querySelector("main")
      if (!main) return [] as Array<[string, string]>
      const anchors = Array.from(main.querySelectorAll('a[href*="/market/item/"]')) as HTMLAnchorElement[]
      const out: Array<[string, string]> = []
      for (const a of anchors) {
        const name = (a.textContent || "").trim()
        const img = a.querySelector("img") as HTMLImageElement | null
        if (name && img?.src) out.push([name, img.src])
      }
      return out
    })
    return new Map(pairs)
  } catch {
    return new Map()
  }
}

/** Parses the plain-text table dump (name, price, %change, volume, %change,
 * stock rows in sequence, "-" for blanks) into structured rows. bdolytics
 * renders this as a real table (get_page_text-equivalent innerText), not a
 * canvas, so this is just line-based parsing, not DOM querying. */
function parseMarketPageText(text: string, category: string, icons: Map<string, string>): MarketItemRecord[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
  const startIdx = lines.findIndex((l) => l === "Stock")
  if (startIdx === -1) return []

  const rows: MarketItemRecord[] = []
  let i = startIdx + 1
  const isNumericOrDash = (s: string) => s === "-" || /^-?[\d,]+%?$/.test(s)

  while (i < lines.length) {
    const line = lines[i]
    // Pagination footer ("1", "2", "3") or trailing "Remove Ads" ends the table.
    if (line === "Remove Ads" || /^\d+$/.test(line)) break

    // A row's Name is the first non-numeric line; the following 5 lines are
    // Price, Price Change, Volume, Volume Change, Stock (numeric or "-").
    if (isNumericOrDash(line)) {
      i++
      continue
    }
    const itemName = line
    const price = lines[i + 1]
    const volume = lines[i + 3]
    const stock = lines[i + 5]
    const parseNum = (s: string | undefined) => {
      if (!s || s === "-") return null
      const n = Number(s.replace(/,/g, ""))
      return Number.isFinite(n) ? n : null
    }
    rows.push({
      itemName,
      category,
      price: parseNum(price),
      volume14dAvg: parseNum(volume),
      stock: parseNum(stock),
      iconUrl: icons.get(itemName) ?? null,
    })
    i += 6
  }
  return rows
}

async function scrapeCategory(page: Page, category: string): Promise<MarketItemRecord[]> {
  const all: MarketItemRecord[] = []
  for (let pageNum = 1; pageNum <= 50; pageNum++) {
    const url = `https://bdolytics.com/en/market/${category}${pageNum > 1 ? `?page=${pageNum}` : ""}`
    await page.goto(url, { waitUntil: "domcontentloaded" })
    await assertNotBlocked(page, `market/${category} page ${pageNum}`)

    // A fixed sleep here was flaky - some category pages hydrate slower
    // than others (confirmed: material/enhancement/magic-crystal
    // intermittently returned 0 rows with a 500ms sleep, while
    // alchemy-stone/lightstone didn't, no structural difference between
    // them). Wait for the "Stock" column header to actually render instead.
    await page
      .getByText("Stock", { exact: true })
      .first()
      .waitFor({ timeout: 10000 })
      .catch(() => {})
    await sleep(300)

    const icons = await extractItemIcons(page)
    let text = await page.locator("main").innerText().catch(() => "")
    let rows = parseMarketPageText(text, category, icons)
    // One retry on a still-empty page 1 (seen intermittently even after the
    // waitFor above - a slow hydration case, not a wrong-slug case, since
    // the exact same category succeeded on other runs) before concluding
    // the category is genuinely empty/wrong.
    if (rows.length === 0 && pageNum === 1) {
      await sleep(2000)
      text = await page.locator("main").innerText().catch(() => "")
      rows = parseMarketPageText(text, category, icons)
    }
    if (rows.length === 0) break
    all.push(...rows)

    // Stop once we've seen every page number the pager shows (avoids
    // guessing 50 pages deep on small categories). The pager renders as
    // e.g. "...37,365\n1\n\n2\n\n3\n\nRemove Ads" - a run of bare numbers
    // right before the final "Remove Ads". Splitting on "Remove Ads" and
    // taking the last segment was wrong: "Remove Ads" also appears at the
    // very top of the page, and .pop() after the LAST occurrence (which is
    // at the very end of the string) returns an empty string, so pagination
    // silently never advanced past page 1 for any category. Extract just
    // the digit run immediately preceding the trailing "Remove Ads" instead.
    // Numbers are separated by blank lines ("\n1\n\n2\n\n3\n\nRemove Ads"),
    // not single newlines - the first version of this regex used `\n\d` per
    // repetition and silently matched nothing at all (confirmed by testing:
    // pagination never advanced past page 1 for any category).
    const pagerMatch = text.match(/((?:\n+\d{1,4}){1,12})\n*Remove Ads\s*$/)
    const pagerNumbers = pagerMatch ? pagerMatch[1].split(/\n+/).map(Number).filter((n) => !Number.isNaN(n)) : []
    const hasNextPage = pagerNumbers.includes(pageNum + 1)
    console.log(`  [${category}] page ${pageNum}: ${rows.length} items`)
    if (!hasNextPage) break
    await politeDelay()
  }
  return all
}

async function main() {
  console.log("Fetching from Arsha.io (no browser needed)...")
  const arshaResults = await fetchArshaCategories()

  console.log("Launching browser for remaining Playwright-only categories...")
  const { browser, page } = await launch()

  const results: MarketItemRecord[] = [...arshaResults]
  try {
    await page.goto("https://bdolytics.com/en/market", { waitUntil: "domcontentloaded" })
    await assertNotBlocked(page, "initial navigation")
    await politeDelay()

    console.log("Selecting Southeast Asia region...")
    await selectSoutheastAsia(page)
    await assertNotBlocked(page, "after selecting region")

    for (const category of PLAYWRIGHT_CATEGORIES) {
      console.log(`Scraping category: ${category}`)
      const rows = await scrapeCategory(page, category)
      results.push(...rows)
      await politeDelay()
    }
  } finally {
    await browser.close()
  }

  mkdirSync("out", { recursive: true })
  const outPath = `out/market-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        format: "rmbdo-collector-market/v1",
        exportedAt: new Date().toISOString(),
        region: "Southeast Asia",
        items: results,
      },
      null,
      2,
    ),
  )
  console.log(`Wrote ${results.length} market items to ${outPath}`)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
