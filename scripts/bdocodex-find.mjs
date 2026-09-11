// Find bdocodex recipe IDs by sweeping /us/recipe/<id>/ titles with plain
// HTTP (static pages, no browser, no bot protection) and matching against
// our unresolved sub-recipe names. Output: {enName: id} JSON for human
// review before merging into data/bdocodex-missing.json (curated gate -
// never auto-queue scrapes from unverified mappings).
// Usage: npm run bdocodex-find -- 1-700 [800-1200 ...]

import pg from "pg"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}

async function getTitle(id) {
  const res = await fetch(`https://bdocodex.com/us/recipe/${id}/`, {
    headers: { "User-Agent": "RMBDO-bdocodex-find/1.0" },
  })
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
    console.error("Usage: npm run bdocodex-find -- <from-to> [more...]")
    process.exit(1)
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.")
    process.exit(1)
  }
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  try {
    // Unresolved sub-recipe names: flagged sub-recipes with no counterpart
    // in either recipe table.
    const r = await client.query(
      `SELECT DISTINCT i.ingredient_name AS name FROM crafting_recipe_ingredients i
       WHERE i.is_sub_recipe IS TRUE
         AND NOT EXISTS (SELECT 1 FROM crafting_recipes cr WHERE cr.recipe_slug IS NOT NULL AND LOWER(TRIM(cr.recipe_name)) = LOWER(TRIM(i.ingredient_name)))
         AND NOT EXISTS (SELECT 1 FROM bdocodex_recipes b WHERE LOWER(TRIM(b.recipe_name)) = LOWER(TRIM(i.ingredient_name)))`,
    )
    const missing = new Map(r.rows.map((x) => [x.name.trim().toLowerCase(), x.name]))
    console.log(`Unresolved sub-recipe names: ${missing.size}`)
    const found = {}
    for (const range of ranges) {
      const [from, to] = range.split("-").map(Number)
      for (let id = from; id <= to; id++) {
        const title = await getTitle(id).catch(() => null)
        await sleep(300 + Math.random() * 200)
        if (!title) continue
        const key = title.trim().toLowerCase()
        if (missing.has(key) && found[missing.get(key)] === undefined) {
          found[missing.get(key)] = id
          console.log(`${id}: ${missing.get(key)}`)
        }
      }
    }
    console.log("FOUND-MAP:" + JSON.stringify(found))
  } finally {
    await client.end().catch(() => {})
  }
}

main().catch((err) => {
  console.error(`bdocodex-find failed: ${err.message}`)
  process.exit(1)
})
