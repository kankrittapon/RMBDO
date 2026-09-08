// Lightweight TH-name backfill for bdocodex ITEM pages (no browser:
// bdocodex serves plain static HTML with no bot protection - verified by
// repeated plain-HTTP fetches. Playwright is overkill here and would only
// add Cloudflare-exposure surface for zero benefit).
// Usage: npm run th-names-items -- 5400-5490 [4600-4620 ...]
// For each id: fetch /us/item/<id>/ title; if the EN name is in our missing
// set (node_resources/market/ingredient names lacking TH), fetch
// /th/item/<id>/ and save the pair. Anything else is skipped, never guessed.

import pg from "pg"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Page titles carry HTML entities ("Some Farmer&#39;s Sack") while our DB
// stores decoded names ("Some Farmer's Sack") - decode before comparing or
// every apostrophe name silently mismatches and gets skipped.
function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}

async function getTitle(url) {
  const res = await fetch(url, { headers: { "User-Agent": "RMBDO-th-names-items/1.0" } })
  if (!res.ok) return null
  const html = await res.text()
  const m = html.match(/<div class="item_title[^"]*" id="item_name"><b>([^<]+)<\/b>/)
  if (m) return decodeEntities(m[1]).trim()
  const t = html.match(/<title>([^-<]+) - BDO Codex<\/title>/)
  return t ? decodeEntities(t[1]).trim() : null
}

async function main() {
  const ranges = process.argv.slice(2)
  if (ranges.length === 0 || !ranges.every((r) => /^\d+-\d+$/.test(r))) {
    console.error("Usage: npm run th-names-items -- <from-to> [more...]   e.g. 5400-5490")
    process.exit(1)
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.")
    process.exit(1)
  }
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  try {
    // Missing set: every EN name we display that still lacks TH.
    const miss = await client.query(
      `SELECT DISTINCT n AS en FROM (
         SELECT resource_name AS n FROM node_resources
         UNION SELECT item_name FROM market_items
         UNION SELECT ingredient_name FROM crafting_recipe_ingredients
         UNION SELECT recipe_name FROM crafting_recipes
       ) all_names
       LEFT JOIN item_name_translations t ON t.en_name = all_names.n
       WHERE t.en_name IS NULL`,
    )
    const missing = new Set(miss.rows.map((r) => r.en))
    console.log(`Missing TH names: ${missing.size}`)
    let checked = 0
    let saved = 0
    for (const range of ranges) {
      const [from, to] = range.split("-").map(Number)
      for (let id = from; id <= to; id++) {
        const en = await getTitle(`https://bdocodex.com/us/item/${id}/`).catch(() => null)
        checked++
        await sleep(400 + Math.random() * 300)
        if (!en || !missing.has(en)) continue
        const th = await getTitle(`https://bdocodex.com/th/item/${id}/`).catch(() => null)
        await sleep(400 + Math.random() * 300)
        if (!th) {
          console.log(`${id} "${en}": no TH title, skipped`)
          continue
        }
        await client.query(
          `INSERT INTO item_name_translations (en_name, th_name, source, source_url, collected_at)
           VALUES ($1, $2, 'bdocodex-th', $3, now())
           ON CONFLICT (en_name) DO UPDATE SET
             th_name = EXCLUDED.th_name, source = EXCLUDED.source,
             source_url = EXCLUDED.source_url, collected_at = now()`,
          [en, th, `https://bdocodex.com/th/item/${id}/`],
        )
        missing.delete(en)
        saved++
        console.log(`${id}: ${en} = ${th}`)
      }
    }
    console.log(`Done: checked ${checked} id(s), saved ${saved}, still missing ${missing.size}.`)
  } finally {
    await client.end().catch(() => {})
  }
}

main().catch((err) => {
  console.error(`th-names-items failed: ${err.message}`)
  process.exit(1)
})
