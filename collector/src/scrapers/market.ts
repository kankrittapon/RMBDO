// Central Market price collector. Unlike the map (canvas), bdolytics'
// Central Market pages (bdolytics.com/en/market/<category>) are a plain
// server-rendered table - no canvas, no synthetic-click limitation, no
// tRPC-cache sniffing needed. Region defaults to whatever was last selected
// via a cookie, so we select "Southeast Asia" once per run (matches the
// user's server) before reading any category page.
import { mkdirSync, writeFileSync } from "node:fs"
import type { Page } from "playwright"
import { launch, politeDelay, sleep, assertNotBlocked } from "../lib/browser.js"

// Scoped to categories relevant to farm-vs-buy decisions (raw/processed
// crafting materials), not the entire market (weapon/armor/accessory
// listings aren't "do I farm this or buy it" material comparisons).
const CATEGORIES = [
  "material",
  "alchemy-stone",
  "magic-crystal",
  "lightstone",
  "enhancement",
] as const

export interface MarketItemRecord {
  itemName: string
  category: string
  price: number | null
  volume14dAvg: number | null
  stock: number | null
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

/** Parses the plain-text table dump (name, price, %change, volume, %change,
 * stock rows in sequence, "-" for blanks) into structured rows. bdolytics
 * renders this as a real table (get_page_text-equivalent innerText), not a
 * canvas, so this is just line-based parsing, not DOM querying. */
function parseMarketPageText(text: string, category: string): MarketItemRecord[] {
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

    let text = await page.locator("main").innerText().catch(() => "")
    let rows = parseMarketPageText(text, category)
    // One retry on a still-empty page 1 (seen intermittently even after the
    // waitFor above - a slow hydration case, not a wrong-slug case, since
    // the exact same category succeeded on other runs) before concluding
    // the category is genuinely empty/wrong.
    if (rows.length === 0 && pageNum === 1) {
      await sleep(2000)
      text = await page.locator("main").innerText().catch(() => "")
      rows = parseMarketPageText(text, category)
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
  console.log("Launching browser...")
  const { browser, page } = await launch()

  try {
    await page.goto("https://bdolytics.com/en/market", { waitUntil: "domcontentloaded" })
    await assertNotBlocked(page, "initial navigation")
    await politeDelay()

    console.log("Selecting Southeast Asia region...")
    await selectSoutheastAsia(page)
    await assertNotBlocked(page, "after selecting region")

    const results: MarketItemRecord[] = []
    for (const category of CATEGORIES) {
      console.log(`Scraping category: ${category}`)
      const rows = await scrapeCategory(page, category)
      results.push(...rows)
      await politeDelay()
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
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
