// Incremental Thai-name backfill from bdolytics /th/ detail pages.
// Same slugs as /en/. EN<>TH alignment is done LIVE (both pages loaded in
// the same run) because our DB rows can be stale: the EN extractor was
// rewritten 2026-09-07 (root-UL fix) and older rows predate it (confirmed:
// 9479 has 3 DB rows but both live pages show 5; 9855 shows 1 live vs 25
// stale DB rows). Aligning TH against stale DB rows caused systematic
// count-mismatch skips - aligning live-vs-live fixes it. Only translations
// are saved; EN tables are never touched by this script (out of scope).
// Count guard stays: TH row count must equal live EN row count or the page
// is skipped (never save a possibly-shifted mapping).
// Bounded batch (default 12 pages - 2 loads each), politeDelay between
// pages, abort on Cloudflare block.

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

const LIMIT = Number(process.argv[2] ?? 12)
const SOURCE = "bdolytics-th"

// Root-ingredient rows in DOM order. Shared by both locales (same DOM).
// Node-side helper - the page.evaluate callback itself is passed inline,
// so tsx keepNames never touches it (see bdocodexRecipe.ts NOTE).
async function extractRows(page: Page): Promise<{ title: string | null; names: string[] }> {
  return page.evaluate(() => {
    const h1 = document.querySelector("h1")
    const title = ((h1 ? h1.textContent : "") || "").trim() || null
    const main = document.querySelector("main")
    const names: string[] = []
    if (main) {
      const allUls = Array.from(main.querySelectorAll("ul"))
      const roots = allUls.filter((ul) => ul.parentElement?.tagName !== "UL")
      for (const ul of roots) {
        const li = ul.querySelector(":scope > li")
        if (!li || ((li.className || "").includes("select-none") === false)) continue
        const a = li.querySelector('a[href*="/crafting/"]')
        const nameEl = a || li.querySelector('div[style*="font-weight"]')
        const nm = (((nameEl && nameEl.textContent) || "").replace(/\(\s*-?[\d,.]+[KMB]?\s*\/\s*h\s*\)\s*$/i, "").trim())
        if (nm) names.push(nm)
      }
    }
    return { title, names }
  })
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.")
    process.exit(1)
  }
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  // Untranslated names by frequency (ingredients + recipe titles alike -
  // both are just EN strings missing a TH row).
  const freq = await client.query(
    `SELECT COALESCE(i.ingredient_name, r.recipe_name) AS name, COUNT(*) AS n
     FROM crafting_recipe_ingredients i
     FULL JOIN crafting_recipes r ON 1 = 0
     LEFT JOIN item_name_translations t ON t.en_name = COALESCE(i.ingredient_name, r.recipe_name)
     WHERE t.en_name IS NULL AND COALESCE(i.ingredient_name, r.recipe_name) IS NOT NULL
     GROUP BY 1 ORDER BY 2 DESC LIMIT 120`,
  )
  const need = new Set<string>(freq.rows.map((x) => x.name as string))
  console.log(`Untranslated names in top-120: ${need.size}`)

  // Candidate pages: cached details with ingredients, most-profitable first.
  // EXCLUDES Imperial Crates, EXCEPT crates whose TITLE is still
  // untranslated (their live pages yield title + 1 row - fine for titles,
  // but their DB ingredient rows predate the 2026-09-07 extractor rewrite
  // (avg ~19 stale rows/slug vs 1 live row), so crate ingredients must not
  // drive page selection or they'd grind 121 pages for names that don't
  // exist on any live page. Titles came mostly from thNamesLists.ts.)
  // (The stale EN crate rows themselves are a separate EN-cache
  // data-quality issue - this script never touches EN.)
  const pages = await client.query(
    `SELECT d.recipe_slug, MAX(d.recipe_name) AS recipe_name, MAX(cr.profit_per_hour) AS pph,
            MAX(cr.category) AS category, MAX(t.en_name) AS already
     FROM crafting_recipe_details d JOIN crafting_recipes cr ON cr.recipe_slug = d.recipe_slug
     LEFT JOIN item_name_translations t ON t.en_name = cr.recipe_name
     WHERE cr.profit_per_hour > 0 AND d.recipe_slug IS NOT NULL
     GROUP BY d.recipe_slug
     HAVING MAX(cr.category) <> 'Imperial Crates' OR MAX(t.en_name) IS NULL
     ORDER BY pph DESC NULLS LAST LIMIT 400`,
  )
  const ingBySlug = new Map<string, string[]>()
  for (const p of pages.rows) {
    const g = await client.query(`SELECT ingredient_name FROM crafting_recipe_ingredients WHERE recipe_slug = $1 ORDER BY id`, [p.recipe_slug])
    ingBySlug.set(p.recipe_slug, g.rows.map((x) => x.ingredient_name as string))
  }

  // Slugs already processed by a previous th-run (translations stamped
  // with their page URL). Excluded so stale DB rows - e.g. crate pages
  // whose DB rows predate the 2026-09-07 extractor rewrite and no longer
  // match EITHER live page - can't cause the same page to be re-picked
  // forever. (Those stale EN rows are a separate data-quality issue in the
  // EN detail cache; this script never touches EN tables.)
  const doneRows = await client.query(
    `SELECT DISTINCT source_url FROM item_name_translations WHERE source = 'bdolytics-th' AND source_url LIKE '%/crafting/%'`,
  )
  const done = new Set<string>()
  for (const r of doneRows.rows) {
    const m = (r.source_url as string).match(/\/crafting\/([^/?#]+)/)
    if (m) done.add(m[1])
  }

  // Greedy set-cover over need, bounded by LIMIT. Titles count too (a
  // crate page is worth picking for an untranslated title alone).
  const picked: string[] = []
  const covered = new Set<string>()
  const remaining = new Map(ingBySlug)
  const titleBySlug = new Map<string, string>()
  for (const p of pages.rows) titleBySlug.set(p.recipe_slug, p.recipe_name)
  for (const slug of done) remaining.delete(slug)
  while (picked.length < LIMIT && remaining.size > 0) {
    let best: string | null = null
    let bestGain = 0
    for (const [slug, ings] of remaining) {
      let gain = ings.filter((n) => need.has(n) && !covered.has(n)).length
      const title = titleBySlug.get(slug)
      if (title && need.has(title) && !covered.has(title)) gain += 1
      if (gain > bestGain) {
        bestGain = gain
        best = slug
      }
    }
    if (!best || bestGain === 0) break
    picked.push(best)
    for (const n of remaining.get(best)!) covered.add(n)
    const bt = titleBySlug.get(best)
    if (bt) covered.add(bt)
    remaining.delete(best)
  }
  console.log(`Picked ${picked.length} page(s), covering ~${covered.size} untranslated name(s).`)
  if (picked.length === 0) {
    console.log("Nothing to do.")
    await client.end()
    return
  }

  const { browser, page } = await launch()
  let saved = 0
  let skipped = 0
  try {
    for (const slug of picked) {
      await page.goto(`https://bdolytics.com/en/crafting/${slug}`, { waitUntil: "domcontentloaded" })
      await assertNotBlocked(page, `th-names ${slug} (en)`)
      await politeDelay()
      const en = await extractRows(page)
      await page.goto(`https://bdolytics.com/th/crafting/${slug}`, { waitUntil: "domcontentloaded" })
      await assertNotBlocked(page, `th-names ${slug} (th)`)
      await politeDelay()
      const th = await extractRows(page)
      if (th.names.length !== en.names.length || !th.title || !en.title) {
        console.log(`${slug}: count mismatch (th=${th.names.length} en=${en.names.length}) - SKIPPED whole page`)
        skipped++
        continue
      }
      const pairs: Array<{ en: string; th: string }> = [{ en: en.title, th: th.title }]
      for (let i = 0; i < en.names.length; i++) pairs.push({ en: en.names[i], th: th.names[i] })
      const url = `https://bdolytics.com/th/crafting/${slug}`
      for (const p of pairs) {
        await client.query(
          `INSERT INTO item_name_translations (en_name, th_name, source, source_url, collected_at)
           VALUES ($1, $2, $3, $4, now())
           ON CONFLICT (en_name) DO UPDATE SET
             th_name = EXCLUDED.th_name, source = EXCLUDED.source,
             source_url = EXCLUDED.source_url, collected_at = now()`,
          [p.en.trim(), p.th.trim(), SOURCE, url],
        )
        saved++
      }
      console.log(`${slug}: saved ${pairs.length} TH name(s)`)
    }
  } finally {
    await browser.close().catch(() => {})
    await client.end().catch(() => {})
  }
  console.log(`Done: ${saved} TH name(s) saved, ${skipped} page(s) skipped on count mismatch.`)
}

main().catch((err) => {
  console.error(`collect:th-names-bdolytics failed: ${err.message}`)
  process.exit(1)
})
