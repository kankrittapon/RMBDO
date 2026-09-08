// Thai recipe-TITLE backfill from bdolytics /th/ category list pages.
// Joins by SLUG (stable IDs), never by row order: each row's own link gives
// (slug, thName), and the EN name comes from our DB via that slug. No order
// assumption, no count guard needed - unknown slugs are skipped loudly.
// Covers all recipe TITLES in ~16 page loads (4 categories x ~4 pager
// pages); ingredients still come from thNamesBatch.ts detail pages.
// politeDelay between pages, abort on block. Usage: npm run collect:th-names-lists

import { readFileSync } from "node:fs"
import pg from "pg"
import { launch, sleep, politeDelay, assertNotBlocked } from "../lib/browser.js"

if (!process.env.DATABASE_URL) {
  try {
    const envText = readFileSync(new URL("../../../.env", import.meta.url), "utf8")
    for (const line of envText.split("\n")) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
    }
  } catch {}
}

const CATEGORIES = [
  { label: "Cooking", slug: "cooking" },
  { label: "Alchemy", slug: "alchemy" },
  { label: "Processing", slug: "processing" },
  { label: "Imperial Crates", slug: "imperial-crates" },
] as const

const SOURCE = "bdolytics-th"
const SOURCE_URL = "https://bdolytics.com/th/crafting"

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.")
    process.exit(1)
  }
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  const { browser, page } = await launch()
  let saved = 0
  let unknown = 0
  try {
    for (const category of CATEGORIES) {
      await page.goto(`https://bdolytics.com/th/crafting?category=${category.slug}`, { waitUntil: "domcontentloaded" })
      await assertNotBlocked(page, `th-names-lists ${category.label}`)
      for (let pageNum = 1; pageNum <= 20; pageNum++) {
        if (pageNum > 1) {
          const pill = page.getByText(String(pageNum), { exact: true }).last()
          if ((await pill.count()) === 0) break
          await pill.click().catch(() => {})
          await sleep(600)
        }
        await page.getByText("Experience", { exact: true }).first().waitFor({ timeout: 10000 }).catch(() => {})
        await sleep(400)
        // (slug, thName) per row: the row's own link is the anchor whose
        // text is the recipe name (never a bare number) - same filter as
        // crafting.ts extractRecipeSlugs, plus the text this time.
        const rows = await page.evaluate(() => {
          const main = document.querySelector("main")
          if (!main) return [] as Array<{ slug: string; name: string }>
          const anchors = Array.from(main.querySelectorAll('a[href*="/crafting/"]')) as HTMLAnchorElement[]
          const out: Array<{ slug: string; name: string }> = []
          for (const a of anchors) {
            const text = (a.textContent || "").trim()
            if (!text || /^\d+$/.test(text)) continue
            const m = (a.getAttribute("href") || "").match(/\/crafting\/([^/?#]+)/)
            if (m) out.push({ slug: m[1], name: text })
          }
          return out
        })
        if (rows.length === 0) break
        for (const r of rows) {
          const en = await client.query(`SELECT recipe_name FROM crafting_recipes WHERE recipe_slug = $1 LIMIT 1`, [r.slug])
          if (en.rows.length === 0) {
            unknown++
            continue
          }
          await client.query(
            `INSERT INTO item_name_translations (en_name, th_name, source, source_url, collected_at)
             VALUES ($1, $2, $3, $4, now())
             ON CONFLICT (en_name) DO UPDATE SET
               th_name = EXCLUDED.th_name, source = EXCLUDED.source,
               source_url = EXCLUDED.source_url, collected_at = now()`,
            [(en.rows[0].recipe_name as string).trim(), r.name.trim(), SOURCE, SOURCE_URL],
          )
          saved++
        }
        console.log(`  [${category.label}] page ${pageNum}: ${rows.length} rows`)
        await politeDelay()
      }
    }
  } finally {
    await browser.close().catch(() => {})
    await client.end().catch(() => {})
  }
  console.log(`Done: ${saved} title translation(s) saved, ${unknown} unknown slug(s) skipped.`)
}

main().catch((err) => {
  console.error(`collect:th-names-lists failed: ${err.message}`)
  process.exit(1)
})
