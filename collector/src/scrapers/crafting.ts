// Crafting profitability collector. Scrapes bdolytics' own Crafting
// Calculator (bdolytics.com/en/crafting) "Silver/Hour" ranking directly,
// rather than re-deriving it locally - that number depends on BDO's
// mastery-speed, processing-success-rate and market-tax formulas, which
// Pearl Abyss never published and are only known via community
// reverse-engineering. Trusting bdolytics' already-computed value is safer
// than risking a wrong-but-precise-looking formula here (the same mistake
// this project has had to strip out of src/data/* before). The scraped
// number reflects bdolytics' DEFAULT settings (~1000-1500 mastery, no
// personal buffs) - it is a general ranking, not this specific player's
// actual mastery/buffs. See README "Known gaps".
import { mkdirSync, writeFileSync } from "node:fs"
import type { Page } from "playwright"
import { launch, politeDelay, sleep, assertNotBlocked } from "../lib/browser.js"

// bdolytics' category tabs are togglable (additive multi-select) with no
// reliable "select only this one" click sequence - isolating a category by
// clicking was tried first and produced wrong/duplicate data (confirmed:
// isolating "Alchemy" that way actually returned Processing's 289 rows).
// The tabs *do* support a direct ?category=<slug> URL for a single
// category, confirmed by checking each one gives an exact count match
// against its badge: cooking=152, alchemy=91, processing=289, imperial=322
// (322 of 854, not "imperial-crates" - the slug is just "imperial").
const CATEGORIES = [
  { label: "Cooking", slug: "cooking" },
  { label: "Alchemy", slug: "alchemy" },
  { label: "Processing", slug: "processing" },
  { label: "Imperial Crates", slug: "imperial" },
] as const

export interface CraftingRecipeRecord {
  recipeName: string
  category: string
  profitPerHour: number | null
  price: number | null
  volume14dAvg: number | null
  experience: string | null
}

async function selectSoutheastAsia(page: Page) {
  const combobox = page.getByRole("combobox").first()
  await combobox.click()
  await sleep(500)
  await page.getByText("Southeast Asia", { exact: true }).first().click()
  await sleep(600)
}

/** "61.6B" -> 61_600_000_000, "6.2K" -> 6200, "-330.9K" -> -330900, plain
 * "32" -> 32, "-" -> null. Some recipes run at a loss at bdolytics' default
 * mastery settings, so the sign matters - dropping it would silently turn a
 * "don't craft this" row into a "do craft this" one. */
function parseSuffixed(s: string | undefined): number | null {
  if (!s || s === "-") return null
  const m = s.match(/^(-?[\d,.]+)\s*([KMB])?$/i)
  if (!m) return null
  let num = parseFloat(m[1].replace(/,/g, ""))
  const suf = m[2]?.toUpperCase()
  if (suf === "K") num *= 1e3
  else if (suf === "M") num *= 1e6
  else if (suf === "B") num *= 1e9
  return Math.round(num)
}

function parseCraftingPageText(text: string, category: string): CraftingRecipeRecord[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
  const headerIdx = lines.findIndex((l) => l === "Experience")
  if (headerIdx === -1) return []

  const isPlainInt = (s: string) => /^\d+$/.test(s)
  const isMoneyOrDash = (s: string) => s === "-" || /^-?\d+(\.\d+)?[KMB]?$/i.test(s)
  const isPagerBlockFrom = (idx: number) => lines.slice(idx).every((l) => /^\d{1,4}$/.test(l))

  const rows: CraftingRecipeRecord[] = []
  let i = headerIdx + 1
  while (i < lines.length) {
    if (isPagerBlockFrom(i)) break

    const recipeName = lines[i]
    i++
    // Input material quantities: zero or more bare integers before the
    // first suffixed/dash value (Silver/Hour never has a bare-integer form
    // in practice - real recipe profits are always K+).
    while (i < lines.length && isPlainInt(lines[i])) i++

    const profitPerHour = parseSuffixed(lines[i])
    i++
    const price = isMoneyOrDash(lines[i] ?? "") ? parseSuffixed(lines[i]) : null
    i++
    const volume = parseSuffixed(lines[i])
    i++
    const experience = lines[i] ?? null
    i++

    rows.push({ recipeName, category, profitPerHour, price, volume14dAvg: volume, experience })
  }
  return rows
}

/** The pager ("1 2 3 »") isn't URL-driven - navigating to ?page=N just
 * reloads the default (unfiltered, page-1) view, which silently produced
 * duplicate rows when this collector first tried that (confirmed: 3
 * "pages" of identical/mixed-category content). Real pagination is a
 * client-side click on the page-number pill. The pills have no accessible
 * role/name (confirmed via inspection - they don't show up in an
 * interactive-elements accessibility scan at all), so this locates them by
 * their exact rendered text and takes the LAST match, since the pager is
 * the last such element in DOM order (later than any per-row input-qty
 * cell that happens to also read e.g. "2"). */
async function goToPage(page: Page, pageNum: number): Promise<boolean> {
  const pill = page.getByText(String(pageNum), { exact: true }).last()
  if ((await pill.count()) === 0) return false
  await pill.click().catch(() => {})
  await sleep(600)
  return true
}

async function scrapeCategory(page: Page, category: (typeof CATEGORIES)[number]): Promise<CraftingRecipeRecord[]> {
  await page.goto(`https://bdolytics.com/en/crafting?category=${category.slug}`, { waitUntil: "domcontentloaded" })
  await assertNotBlocked(page, `crafting category ${category.label}`)
  await selectSoutheastAsia(page)

  const all: CraftingRecipeRecord[] = []
  let previousSignature: string | null = null
  for (let pageNum = 1; pageNum <= 20; pageNum++) {
    if (pageNum > 1) {
      const advanced = await goToPage(page, pageNum)
      if (!advanced) break
    }

    await page
      .getByText("Experience", { exact: true })
      .first()
      .waitFor({ timeout: 10000 })
      .catch(() => {})
    await sleep(400)

    let text = await page.locator("main").innerText().catch(() => "")
    let rows = parseCraftingPageText(text, category.label)
    if (rows.length === 0 && pageNum === 1) {
      await sleep(2000)
      text = await page.locator("main").innerText().catch(() => "")
      rows = parseCraftingPageText(text, category.label)
    }
    if (rows.length === 0) break

    // Guard against a click that silently failed to advance. Imperial
    // Crates recipes repeat the same name many times (different box
    // tiers), so comparing just the first row's name false-triggered on a
    // real page 2 that happened to start with another "Master's Cooking
    // Box" - use the first 3 rows' name+profit as a signature instead.
    const signature = rows
      .slice(0, 3)
      .map((r) => `${r.recipeName}:${r.profitPerHour}`)
      .join("|")
    if (signature === previousSignature) break
    previousSignature = signature

    all.push(...rows)
    console.log(`  [${category.label}] page ${pageNum}: ${rows.length} recipes`)
    await politeDelay()
  }
  return all
}

async function main() {
  console.log("Launching browser...")
  const { browser, page } = await launch()

  try {
    const results: CraftingRecipeRecord[] = []
    for (const category of CATEGORIES) {
      console.log(`Scraping category: ${category.label}`)
      const rows = await scrapeCategory(page, category)
      results.push(...rows)
      await politeDelay()
    }

    mkdirSync("out", { recursive: true })
    const outPath = `out/crafting-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
    writeFileSync(
      outPath,
      JSON.stringify(
        {
          format: "rmbdo-collector-crafting/v1",
          exportedAt: new Date().toISOString(),
          region: "Southeast Asia",
          note: "profitPerHour reflects bdolytics' default calculator settings, not a personalized mastery/buff profile",
          recipes: results,
        },
        null,
        2,
      ),
    )
    console.log(`Wrote ${results.length} crafting recipes to ${outPath}`)
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
