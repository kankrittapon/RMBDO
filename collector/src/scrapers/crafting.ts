// Crafting profitability collector. Scrapes bdolytics' own Crafting
// Calculator (bdolytics.com/en/crafting) "Silver/Hour" ranking directly,
// rather than re-deriving it locally - that number depends on BDO's
// mastery-speed, processing-success-rate and market-tax formulas, which
// Pearl Abyss never published and are only known via community
// reverse-engineering. Trusting bdolytics' already-computed value is safer
// than risking a wrong-but-precise-looking formula here (the same mistake
// this project has had to strip out of src/data/* before).
//
// If player_settings has this player's real mastery per skill, this fills
// bdolytics' own Settings drawer with those values before scraping -
// confirmed (by testing manually) that the Mastery fields there change the
// Silver/Hour column immediately and the value persists across page
// navigations (a cookie, same mechanism as the Southeast Asia region
// selection) - so it only needs to be set once per run, not per category.
// Falls back to bdolytics' own defaults (~1000-1500 mastery) for any skill
// left unset in player_settings.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import type { Page } from "playwright"
import pg from "pg"
import { launch, politeDelay, sleep, assertNotBlocked } from "../lib/browser.js"

// This runs as `npm run collect:crafting -w collector` from the repo root,
// which doesn't pass `--env-file=.env` (unlike scripts/normalize.mjs) -
// load it manually so DATABASE_URL is available for the player_settings
// read below. No-op if it's already set (e.g. run directly with
// --env-file) or the file doesn't exist.
if (!process.env.DATABASE_URL) {
  try {
    const envText = readFileSync(new URL("../../../.env", import.meta.url), "utf8")
    for (const line of envText.split("\n")) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
    }
  } catch {
    // no .env file - fine, DATABASE_URL just won't be available and
    // fetchPlayerSettings() will skip personalization.
  }
}

// bdolytics' category tabs are togglable (additive multi-select) with no
// reliable "select only this one" click sequence - isolating a category by
// clicking was tried first and produced wrong/duplicate data (confirmed:
// isolating "Alchemy" that way actually returned Processing's 289 rows).
// The tabs *do* support a direct ?category=<slug> URL for a single
// category, confirmed by checking each one gives an exact count match
// against its badge: cooking=152, alchemy=91, processing=289, imperial=322
// (322 of 854, not "imperial-crates" - the slug is just "imperial").
//
// `masteryKey` says which player_settings field, if any, cleanly
// corresponds to this category's own Mastery stat - used only to decide
// whether a row can honestly be tagged `personalized: true`. Imperial
// Crates has none: its recipes bundle already-made Cooking/Alchemy/
// Processing goods (e.g. "Master's Cooking Box"), so no single Mastery
// stat governs it - it's always left `personalized: false` rather than
// guessed. (bdolytics' Settings drawer also has a "Training Mastery"
// field, but that's the separate Horse Training life skill, unrelated to
// any of these four categories - it's never touched here.)
const CATEGORIES: Array<{ label: string; slug: string; masteryKey: keyof MasterySettings | null }> = [
  { label: "Cooking", slug: "cooking", masteryKey: "cookingMastery" },
  { label: "Alchemy", slug: "alchemy", masteryKey: "alchemyMastery" },
  { label: "Processing", slug: "processing", masteryKey: "processingMastery" },
  { label: "Imperial Crates", slug: "imperial", masteryKey: null },
]

export interface CraftingRecipeRecord {
  recipeName: string
  category: string
  profitPerHour: number | null
  price: number | null
  volume14dAvg: number | null
  experience: string | null
  personalized: boolean
}

async function selectSoutheastAsia(page: Page) {
  const combobox = page.getByRole("combobox").first()
  await combobox.click()
  await sleep(500)
  await page.getByText("Southeast Asia", { exact: true }).first().click()
  await sleep(600)
}

interface MasterySettings {
  cookingMastery: number | null
  alchemyMastery: number | null
  processingMastery: number | null
}

async function fetchPlayerSettings(): Promise<MasterySettings | null> {
  if (!process.env.DATABASE_URL) return null
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    const { rows } = await client.query(
      "SELECT cooking_mastery, alchemy_mastery, processing_mastery FROM player_settings WHERE id = 1",
    )
    if (rows.length === 0) return null
    const r = rows[0]
    return {
      cookingMastery: r.cooking_mastery,
      alchemyMastery: r.alchemy_mastery,
      processingMastery: r.processing_mastery,
    }
  } catch (err) {
    console.warn("Could not read player_settings - using bdolytics' default mastery instead:", (err as Error).message)
    return null
  } finally {
    await client.end().catch(() => {})
  }
}

/** Opens bdolytics' Settings drawer and fills in this player's real Mastery
 * per skill (confirmed via manual testing: these fields recompute
 * Silver/Hour immediately, and the value survives a full page navigation -
 * a cookie, like the region picker - so this only needs to run once per
 * collector run, before the category loop, not once per category/page). */
async function applyMasterySettings(page: Page, settings: MasterySettings) {
  const opened = page.getByRole("button", { name: "Settings" }).first()
  await opened.click()
  await sleep(500)

  const fields: Array<[string, number | null]> = [
    ["Cooking Mastery", settings.cookingMastery],
    ["Alchemy Mastery", settings.alchemyMastery],
    ["Processing Mastery", settings.processingMastery],
  ]
  for (const [label, value] of fields) {
    if (value === null) continue
    const input = page.getByLabel(label, { exact: true })
    await input.click({ clickCount: 3 }).catch(() => {})
    await input.fill(String(value)).catch(() => {})
    // The setting is saved on blur (confirmed via manual testing: typing a
    // value then tabbing away was enough for it to persist across a full
    // page navigation, without needing to explicitly close the drawer).
    await page.keyboard.press("Tab").catch(() => {})
    await sleep(300)
  }

  // No need to explicitly close the drawer - the next step is always a
  // full page.goto for the first category, which discards it anyway, and
  // the Mastery values themselves already persisted (confirmed: they
  // survive a full navigation via a cookie, same as the region picker).
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

function parseCraftingPageText(text: string, category: string, personalized: boolean): CraftingRecipeRecord[] {
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

    rows.push({ recipeName, category, profitPerHour, price, volume14dAvg: volume, experience, personalized })
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

async function scrapeCategory(
  page: Page,
  category: (typeof CATEGORIES)[number],
  playerSettings: MasterySettings | null,
): Promise<CraftingRecipeRecord[]> {
  await page.goto(`https://bdolytics.com/en/crafting?category=${category.slug}`, { waitUntil: "domcontentloaded" })
  await assertNotBlocked(page, `crafting category ${category.label}`)
  await selectSoutheastAsia(page)

  // Only true when THIS category's own Mastery stat was actually set -
  // e.g. setting Cooking Mastery must not make Alchemy rows look
  // personalized too (a real bug caught by checking the output: an
  // earlier version tagged the whole run personalized whenever ANY skill
  // was set, mislabeling every other category's still-default numbers).
  const personalized = Boolean(
    category.masteryKey && playerSettings && playerSettings[category.masteryKey] !== null,
  )

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
    let rows = parseCraftingPageText(text, category.label, personalized)
    if (rows.length === 0 && pageNum === 1) {
      await sleep(2000)
      text = await page.locator("main").innerText().catch(() => "")
      rows = parseCraftingPageText(text, category.label, personalized)
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
    const playerSettings = await fetchPlayerSettings()
    const hasAnyMastery = playerSettings && Object.values(playerSettings).some((v) => v !== null)

    if (hasAnyMastery) {
      console.log("Applying player_settings mastery before scraping:", playerSettings)
      await page.goto("https://bdolytics.com/en/crafting", { waitUntil: "domcontentloaded" })
      await assertNotBlocked(page, "initial navigation (applying mastery settings)")
      await politeDelay()
      await applyMasterySettings(page, playerSettings!)
    } else {
      console.log("No player_settings mastery set - using bdolytics' default settings.")
    }

    const results: CraftingRecipeRecord[] = []
    for (const category of CATEGORIES) {
      console.log(`Scraping category: ${category.label}`)
      const rows = await scrapeCategory(page, category, playerSettings)
      const personalizedCount = rows.filter((r) => r.personalized).length
      console.log(`  -> ${personalizedCount}/${rows.length} rows personalized`)
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
          note: hasAnyMastery
            ? "Each recipe's `personalized` field says whether ITS category's own Mastery was set in player_settings - a category with no mastery configured still used bdolytics' default even in this run. Imperial Crates is always personalized:false (no single Mastery stat governs it)."
            : "No player_settings mastery configured - every row used bdolytics' default calculator settings.",
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
