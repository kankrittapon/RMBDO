// Fills icon_url for market_items, crafting_recipes, and
// crafting_recipe_ingredients rows that are still missing one, without any
// Playwright scraping. Three passes, cheapest/most-reliable first:
//
// 1. Name match against veliainn-market-resources' items_all.json (a public
//    GitHub data dump mapping BDO item name -> real item ID), then build the
//    icon URL from Pearl Abyss's own official CDN:
//    https://s1.pearlcdn.com/NAEU/TradeMarket/Common/img/BDO/item/{id}.png
// 2. For crafting_recipe_ingredients still missing one: an ingredient that is
//    itself a top-level recipe already has an icon there (e.g. "Wheat Dough"
//    appears both as a recipe and as an ingredient) - copy it across by name.
// 3. For crafting_recipe_ingredients still missing one: bdolytics' own
//    sub_recipe_slug is formatted "{itemId}:{hash}" - confirmed by
//    cross-checking known items (e.g. "7201:..." for Wheat Dough, item id
//    7201) - so the numeric prefix IS the real item ID and needs no lookup
//    table at all.
//
// Together these closed 0% -> 100% coverage on crafting_recipe_ingredients
// with zero scraping (see git history / session notes for verification).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs"
import { join } from "node:path"
import pg from "pg"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error("Set DATABASE_URL in .env first - see .env.example.")
  process.exit(1)
}

const CACHE_DIR = ".cache"
const ITEMS_CACHE = join(CACHE_DIR, "bdo-items-all.json")
const ITEMS_URL =
  "https://raw.githubusercontent.com/andreivreja/veliainn-market-resources/main/data/items_all.json"

function iconUrlFor(itemId) {
  return `https://s1.pearlcdn.com/NAEU/TradeMarket/Common/img/BDO/item/${itemId}.png`
}

async function loadItemNameToId() {
  if (!existsSync(ITEMS_CACHE)) {
    mkdirSync(CACHE_DIR, { recursive: true })
    console.log(`Downloading ${ITEMS_URL} ...`)
    const res = await fetch(ITEMS_URL)
    if (!res.ok) throw new Error(`Failed to download items_all.json: ${res.status}`)
    writeFileSync(ITEMS_CACHE, await res.text())
  }
  const raw = JSON.parse(readFileSync(ITEMS_CACHE, "utf8"))
  const items = Array.isArray(raw) ? raw : Object.values(raw)
  const byName = new Map()
  for (const it of items) {
    const name = it.locale_name?.us
    if (name && !byName.has(name)) byName.set(name, it.id)
  }
  return byName
}

async function backfillByName(client, table, nameColumn, byName) {
  const { rows } = await client.query(
    `SELECT DISTINCT ${nameColumn} AS name FROM ${table} WHERE icon_url IS NULL`
  )
  let updated = 0
  for (const { name } of rows) {
    const id = byName.get(name)
    if (!id) continue
    const res = await client.query(
      `UPDATE ${table} SET icon_url = $1 WHERE ${nameColumn} = $2 AND icon_url IS NULL`,
      [iconUrlFor(id), name]
    )
    updated += res.rowCount
  }
  return updated
}

async function main() {
  const client = new pg.Client({ connectionString })
  await client.connect()

  const byName = await loadItemNameToId()

  const miUpdated = await backfillByName(client, "market_items", "item_name", byName)
  console.log(`market_items: +${miUpdated} icon_url`)

  const crUpdated = await backfillByName(client, "crafting_recipes", "recipe_name", byName)
  console.log(`crafting_recipes: +${crUpdated} icon_url`)

  const ciByName = await backfillByName(client, "crafting_recipe_ingredients", "ingredient_name", byName)
  console.log(`crafting_recipe_ingredients (by name lookup): +${ciByName} icon_url`)

  const fromRecipes = await client.query(`
    UPDATE crafting_recipe_ingredients cri
    SET icon_url = cr.icon_url
    FROM crafting_recipes cr
    WHERE cri.ingredient_name = cr.recipe_name
      AND cri.icon_url IS NULL
      AND cr.icon_url IS NOT NULL
  `)
  console.log(`crafting_recipe_ingredients (matched to a scraped recipe's own icon): +${fromRecipes.rowCount}`)

  const fromSlug = await client.query(`
    UPDATE crafting_recipe_ingredients
    SET icon_url = concat(
      'https://s1.pearlcdn.com/NAEU/TradeMarket/Common/img/BDO/item/',
      split_part(sub_recipe_slug, ':', 1),
      '.png'
    )
    WHERE icon_url IS NULL AND sub_recipe_slug IS NOT NULL
  `)
  console.log(`crafting_recipe_ingredients (sub_recipe_slug numeric prefix = item id): +${fromSlug.rowCount}`)

  for (const table of ["market_items", "crafting_recipes", "crafting_recipe_ingredients"]) {
    const { rows } = await client.query(
      `SELECT count(*) total, count(icon_url) with_icon FROM ${table}`
    )
    console.log(`${table}: ${rows[0].with_icon}/${rows[0].total} have an icon`)
  }

  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
