// One-time scrape of the gathering mastery bracket table from
// bdocodex.com/us/gatheringmastery/ (static game math - no cron, re-run
// only if the game changes the brackets). Saves vendor JSON + upserts
// gathering_mastery_brackets (migration 004). Percentages stored as
// fractions (80.00% -> 0.8). Bracket rows are mastery 0..3000 step 50.
// Usage: npm run collect:gathering-brackets

import { readFileSync, writeFileSync } from "node:fs"
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

function toFrac(s: string): number | null {
  const m = s.replace(/,/g, "").trim().match(/^(-?[\d.]+)\s*%$/)
  if (!m) return null
  return Number(m[1]) / 100
}

async function main() {
  const { browser, page } = await launch()
  let rows: Array<{
    mastery: number
    commonChance: number | null
    commonAmount: number | null
    specialChance: number | null
    specialAmount: number | null
    rareChance: number | null
    rareAmount: number | null
    veryRareChance: number | null
    veryRareAmount: number | null
  }> = []
  try {
    await page.goto("https://bdocodex.com/us/gatheringmastery/", { waitUntil: "domcontentloaded" })
    await assertNotBlocked(page, "gathering brackets")
    await politeDelay()
    // DataTables pager: 61 entries, 10 per page ("Showing 1 to 10 of 61
    // entries"). Walk pages 1..7 via pager pills (same pattern as
    // crafting.ts goToPage), accumulating rows.
    for (let pageNum = 1; pageNum <= 7; pageNum++) {
      if (pageNum > 1) {
        const pill = page.getByText(String(pageNum), { exact: true }).last()
        if ((await pill.count()) === 0) break
        await pill.click().catch(() => {})
        await sleep(800)
      }
      const got = await page.evaluate(() => {
      const out: Array<{
        mastery: number
        commonChance: number | null
        commonAmount: number | null
        specialChance: number | null
        specialAmount: number | null
        rareChance: number | null
        rareAmount: number | null
        veryRareChance: number | null
        veryRareAmount: number | null
      }> = []
      const tables = document.querySelectorAll("table")
      for (let t = 0; t < tables.length; t++) {
        const trs = tables[t].querySelectorAll("tr")
        for (let i = 0; i < trs.length; i++) {
          const cells: string[] = []
          trs[i].querySelectorAll("td").forEach((td) => cells.push(((td.textContent || "").trim())))
          // Data rows: 9 numeric cells (mastery + 8 percentages). Header
          // rows use th or non-numeric text and are skipped by the guard.
          if (cells.length < 9) continue
          const mastery = Number(cells[0].replace(/,/g, ""))
          if (!Number.isInteger(mastery)) continue
          // (inlined, not a helper: const-arrows inside evaluate break
          // under tsx keepNames - see bdocodexRecipe.ts NOTE)
          const nums: Array<number | null> = []
          for (let c = 1; c <= 8; c++) {
            const mm = cells[c].replace(/,/g, "").trim().match(/^(-?[\d.]+)\s*%$/)
            nums.push(mm ? Number(mm[1]) / 100 : null)
          }
          out.push({
            mastery,
            commonChance: nums[0],
            commonAmount: nums[1],
            specialChance: nums[2],
            specialAmount: nums[3],
            rareChance: nums[4],
            rareAmount: nums[5],
            veryRareChance: nums[6],
            veryRareAmount: nums[7],
          })
        }
        if (out.length > 0) break // first table with data rows wins
      }
      return out
      })
      rows.push(...got)
      await politeDelay()
    }
  } finally {
    await browser.close().catch(() => {})
  }

  console.log(`Parsed ${rows.length} bracket row(s)`)
  const bad = rows.filter((r) =>
    [r.commonChance, r.commonAmount, r.specialChance, r.specialAmount, r.rareChance, r.rareAmount, r.veryRareChance, r.veryRareAmount].some((v) => v === null),
  )
  if (rows.length === 0) throw new Error("zero bracket rows parsed - layout changed?")
  if (bad.length > 0) {
    console.error(`Refusing to save: ${bad.length} row(s) with unparsable cells (e.g. mastery ${bad[0].mastery})`)
    process.exit(1)
  }

  writeFileSync(new URL("../../../vendor/gathering-brackets.json", import.meta.url), JSON.stringify(rows, null, 2))
  console.log("Wrote vendor/gathering-brackets.json")

  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not set - vendor JSON saved, DB upsert skipped.")
    return
  }
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    await client.query(readFileSync(new URL("../../../schema/migrations/004_gathering_brackets.sql", import.meta.url), "utf8"))
    for (const r of rows) {
      await client.query(
        `INSERT INTO gathering_mastery_brackets
           (mastery, common_chance, common_amount, special_chance, special_amount, rare_chance, rare_amount, very_rare_chance, very_rare_amount, collected_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())
         ON CONFLICT (mastery) DO UPDATE SET
           common_chance = EXCLUDED.common_chance, common_amount = EXCLUDED.common_amount,
           special_chance = EXCLUDED.special_chance, special_amount = EXCLUDED.special_amount,
           rare_chance = EXCLUDED.rare_chance, rare_amount = EXCLUDED.rare_amount,
           very_rare_chance = EXCLUDED.very_rare_chance, very_rare_amount = EXCLUDED.very_rare_amount,
           collected_at = now()`,
        [r.mastery, r.commonChance, r.commonAmount, r.specialChance, r.specialAmount, r.rareChance, r.rareAmount, r.veryRareChance, r.veryRareAmount],
      )
    }
    console.log(`Upserted ${rows.length} bracket row(s) to Postgres.`)
  } finally {
    await client.end().catch(() => {})
  }
}

main().catch((err) => {
  console.error(`collect:gathering-brackets failed: ${err.message}`)
  process.exit(1)
})
