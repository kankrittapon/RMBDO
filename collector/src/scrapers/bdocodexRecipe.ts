// On-demand scraper for bdocodex.com recipe pages - SUPPLEMENTAL source for
// recipes bdolytics' Crafting Calculator doesn't list (confirmed example:
// "Sweet Honey Wine", bdocodex id 225, absent from all 4 bdolytics Cooking
// pages). This is gap-filling, NOT a parallel pipeline: bdolytics stays the
// primary source and its scrapers are untouched.
//
// Scope decision (deliberate, not a technical limit): scrape ONLY single
// recipe pages by numeric ID (`/us/recipe/<id>/`), either one ID from the
// CLI or the small curated list in data/bdocodex-missing.json. The category
// listings (e.g. /us/recipes/culinary/) DO render ~20 /us/recipe/ links
// after ~1.5s of JS (verified by hand) - so a bulk harvest would be
// technically possible, but it is out of scope for the same anti-bulk
// reasons as craftingDetailBatch.ts's batch cap: bdocodex data is only
// useful for the handful of recipes bdolytics is missing.
//
// DOM patterns below were read off the LIVE page for id 225 (2026-09-08),
// not guessed from pasted text:
// - header: `#item_name b` (name), `.yellow_text` (category e.g. Cooking),
//   `Skill level: X` / `EXP: Y` as plain card text, recipe icon in `.icon_cell img`
// - each ingredient: `a.qtooltip[href^="/us/item/"]` + sibling
//   `.quantity_small.nowrap` (qty); `data-tiptype="recipekey"` = base
//   ingredient that cannot be substituted (lock icon), `"recipe"` = group/
//   substitutable (repeat icon); name = the SECOND anchor's text
//   (the first anchor wraps only the icon)
// - result: after the literal text "Base products:" the same
//   iconset+anchor pattern for the crafted item
// Prices are intentionally NOT scraped: bdocodex loads them via an AJAX
// call (`real_materials_prices` token) and v1 leaves unit prices NULL
// (shown as "no price") rather than guessing. See plan notes before
// attempting to reverse that endpoint.

import { readFileSync } from "node:fs"
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

export interface BdocodexIngredient {
  itemId: number | null
  name: string
  quantity: number
  isBase: boolean
  iconUrl: string | null
}

export interface BdocodexRecipe {
  bdocodexId: number
  recipeName: string
  category: string
  skillLevel: string | null
  exp: string | null
  iconUrl: string | null
  sourceUrl: string
  resultItemId: number | null
  resultItemName: string | null
  resultQuantity: number | null
  ingredients: BdocodexIngredient[]
  collectedAt: string
}

interface RawRow {
  itemId: number | null
  name: string
  qtyText: string | null
  tiptype: string | null
  iconUrl: string | null
}

function parseQty(s: string | null): number | null {
  if (!s) return null
  const n = Number(s.replace(/,/g, "").trim())
  return Number.isFinite(n) ? n : null
}

function absUrl(src: string | null): string | null {
  if (!src) return null
  if (src.startsWith("http")) return src
  return `https://bdocodex.com${src.startsWith("/") ? "" : "/"}${src}`
}

export async function scrapeBdocodexRecipe(id: number): Promise<BdocodexRecipe> {
  const url = `https://bdocodex.com/us/recipe/${id}/`
  console.log(`Scraping bdocodex recipe: ${url}`)

  const { browser, page } = await launch()
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" })
    await assertNotBlocked(page, `bdocodex recipe ${id}`)
    await politeDelay()

    // NOTE (tsx + page.evaluate constraint, verified by a real failure):
    // tsx compiles with esbuild keepNames, which wraps every
    // `const f = (...) => ...` INSIDE the evaluate callback as
    // `__name(..., "f")` - and __name doesn't exist in the browser, so the
    // serialized function throws `ReferenceError: __name is not defined`
    // on the page. Inline arrow *arguments* (.filter(x => ...)) survive,
    // but const-assigned arrows do not. So this whole callback uses only
    // plain for-loops and inline expressions - do NOT refactor helpers
    // into const arrows in here (craftingDetail.ts happens to comply
    // already, which is why it never hit this). The callback takes a
    // `prefix` ARG (`/us/` or `/th/`) - evaluate args are fine, only
    // nested const-arrows break.
    const raw = await page.evaluate((prefix: string) => {
      const card = document.querySelector(".card.item_info")
      if (!card) return null
      // (no const-assigned arrow helpers in here - see NOTE above)
      const nameEl = card.querySelector("#item_name b")
      const name = ((nameEl ? nameEl.textContent : "") || "").trim()
      const headerEl = card.querySelector(".card-header")
      const headerId = ((((headerEl ? headerEl.textContent : "") || "").trim()).match(/ID:\s*(\d+)/) || [])[1] ?? null
      const bodyEl = card.querySelector(".card-body")
      const bodyText = ((bodyEl ? bodyEl.textContent : "") || "").trim()
      const category = bodyText.match(/Recipe\s*([\p{L} ]+)/u)?.[1]?.trim() ?? null
      // NOTE: textContent does NOT insert newlines for <br>, so "Skill
      // level: Beginner 1<br>EXP: ..." arrives as one run - anchor the
      // capture on the trailing EXP: marker instead of end-of-line.
      const skillM = bodyText.match(/Skill level:\s*(.+?)\s*EXP:/)
      const skillLevel = skillM ? skillM[1].trim() : null
      const expM = bodyText.match(/EXP:\s*([0-9', ]+)/)
      const exp = expM ? expM[1].trim() : null
      const iconImg = card.querySelector(".icon_cell img") as HTMLImageElement | null
      const icon = iconImg ? iconImg.getAttribute("src") : null

      // Ingredient icon anchors: href=/us/item/<id>/ wrapping ONLY the
      // icon. The name lives in the FOLLOW-UP sibling anchor with the
      // same href (see id 225: icon anchor then "- <name>" anchor).
      const rows: Array<{
        itemId: number | null
        name: string
        qtyText: string | null
        tiptype: string | null
        iconUrl: string | null
      }> = []
      const seen: Record<string, boolean> = {}
      const anchors = card.querySelectorAll('a.qtooltip[href^="' + prefix + 'item/"]')
      for (let i = 0; i < anchors.length; i++) {
        const a = anchors[i] as HTMLAnchorElement
        const href = a.getAttribute("href") || ""
        const m = href.match(/\/[a-z]+\/item\/(\d+)\//)
        if (!m) continue
        if (seen[m[1]]) continue // skip the duplicate icon/name anchor pair
        seen[m[1]] = true
        const wrap = a.closest(".iconset_wrapper_medium")
        const qtyEl = wrap ? wrap.querySelector(".quantity_small.nowrap") : null
        const qty = qtyEl ? ((qtyEl.textContent || "").trim() || null) : null
        // Name anchor = a later qtooltip anchor with the same href that
        // actually contains text (the icon anchor's own text is empty).
        // NOTE: the name anchor is a sibling of the icon's wrapper DIV,
        // not of the icon anchor itself, so walk from the wrapper (or the
        // anchor when there is no wrapper).
        let nodeName = ""
        let sib: Element | null = wrap || a
        while ((sib = sib.nextElementSibling)) {
          if (sib.tagName === "A" && (sib as HTMLAnchorElement).href.indexOf(prefix + `item/${m[1]}/`) !== -1) {
            const cand = ((sib.textContent || "").trim())
            if (cand) {
              nodeName = cand
              break
            }
          }
          if (sib.tagName === "BR") break
        }
        if (!nodeName) {
          const all = document.querySelectorAll('a.qtooltip[href="' + prefix + `item/${m[1]}/"]`)
          for (let j = 0; j < all.length; j++) {
            if (wrap && wrap.contains(all[j])) continue
            const cand = (((all[j].textContent) || "").trim())
            if (cand) {
              nodeName = cand
              break
            }
          }
        }
        let imgSrc: string | null = null
        if (wrap) {
          const wimg = wrap.querySelector("img.list_icon_medium") as HTMLImageElement | null
          if (wimg) imgSrc = wimg.getAttribute("src")
        }
        if (!imgSrc) {
          const aimg = a.querySelector("img") as HTMLImageElement | null
          if (aimg) imgSrc = aimg.getAttribute("src")
        }
        rows.push({ itemId: Number(m[1]), name: nodeName, qtyText: qty, tiptype: a.getAttribute("data-tiptype"), iconUrl: imgSrc })
      }
      return { name, headerId, category, skillLevel, exp, icon, rows }
    }, "/us/")

    if (!raw || !raw.name) {
      throw new Error(`bdocodex recipe ${id}: no recipe card found (page may not exist or layout changed)`)
    }
    if (raw.headerId !== null && Number(raw.headerId) !== id) {
      throw new Error(`bdocodex recipe ${id}: page header shows ID ${raw.headerId} - wrong page?`)
    }

    // Partition result vs ingredients: the result item is the row whose
    // name equals the recipe name (bdocodex lists the crafted item itself
    // under "Base products:"). Verified on 225 (result "Sweet Honey Wine"
    // == recipe name). If no row matches, result stays null - never guess.
    const ingredients: BdocodexIngredient[] = []
    let resultItemId: number | null = null
    let resultItemName: string | null = null
    let resultQuantity: number | null = null
    for (const r of raw.rows as RawRow[]) {
      const qty = parseQty(r.qtyText)
      if (qty === null || !r.name) continue // skip rows we cannot read exactly
      if (r.name === raw.name && resultItemId === null) {
        resultItemId = r.itemId
        resultItemName = r.name
        resultQuantity = qty
        continue
      }
      ingredients.push({
        itemId: r.itemId,
        name: r.name,
        quantity: qty,
        isBase: r.tiptype === "recipekey",
        iconUrl: absUrl(r.iconUrl),
      })
    }

    if (ingredients.length === 0) {
      throw new Error(`bdocodex recipe ${id} ("${raw.name}"): zero ingredient rows parsed - layout may have changed, refusing to save an empty recipe`)
    }

    // Thai names: same page under /th/ locale, same DOM, same item IDs.
    // Matched to EN rows by itemId ONLY (never by order) and saved to
    // item_name_translations. A TH row with no EN counterpart (or vice
    // versa) is skipped loudly, never guessed. One extra navigation per
    // recipe - acceptable for on-demand use, NOT for bulk.
    const thUrl = `https://bdocodex.com/th/recipe/${id}/`
    const thNames: Array<{ en: string; th: string }> = []
    try {
      await page.goto(thUrl, { waitUntil: "domcontentloaded" })
      await assertNotBlocked(page, `bdocodex recipe ${id} (th)`)
      await politeDelay()
      const thRaw = await page.evaluate((prefix: string) => {
        const card = document.querySelector(".card.item_info")
        if (!card) return null
        const nameEl = card.querySelector("#item_name b")
        const recipeName = ((nameEl ? nameEl.textContent : "") || "").trim()
        const pairs: Array<{ itemId: number; name: string }> = []
        const seen: Record<string, boolean> = {}
        const anchors = card.querySelectorAll('a.qtooltip[href^="' + prefix + 'item/"]')
        for (let i = 0; i < anchors.length; i++) {
          const a = anchors[i] as HTMLAnchorElement
          const mm = (a.getAttribute("href") || "").match(/\/[a-z]+\/item\/(\d+)\//)
          if (!mm || seen[mm[1]]) continue
          seen[mm[1]] = true
          const wrap = a.closest(".iconset_wrapper_medium")
          let nm = ""
          let sib: Element | null = wrap || a
          while ((sib = sib.nextElementSibling)) {
            if (sib.tagName === "A" && (sib as HTMLAnchorElement).href.indexOf(prefix + `item/${mm[1]}/`) !== -1) {
              const cand = ((sib.textContent || "").trim())
              if (cand) {
                nm = cand
                break
              }
            }
            if (sib.tagName === "BR") break
          }
          if (nm) pairs.push({ itemId: Number(mm[1]), name: nm })
        }
        return { recipeName, pairs }
      }, "/th/")
      if (thRaw && thRaw.recipeName) {
        const enByItemId = new Map<number, string>()
        for (const r of raw.rows as RawRow[]) {
          if (r.itemId !== null && r.name) enByItemId.set(r.itemId, r.name)
        }
        if (resultItemId !== null && resultItemName) enByItemId.set(resultItemId, resultItemName)
        thNames.push({ en: raw.name, th: thRaw.recipeName })
        let thSkipped = 0
        for (const p of thRaw.pairs) {
          const en = enByItemId.get(p.itemId)
          if (!en) {
            thSkipped++
            continue
          }
          thNames.push({ en, th: p.name })
        }
        if (thSkipped > 0) console.log(`bdocodex recipe ${id}: ${thSkipped} TH row(s) with no EN counterpart skipped`)
      } else {
        console.log(`bdocodex recipe ${id}: no TH card found, skipping Thai names`)
      }
    } catch (err) {
      // TH names are a bonus, never a blocker: EN recipe still saves.
      console.log(`bdocodex recipe ${id}: TH fetch failed (${err instanceof Error ? err.message : String(err)}), continuing with EN only`)
    }

    if (thNames.length > 0) await saveThNames(thNames, thUrl)

    await politeDelay()
    return {
      bdocodexId: id,
      recipeName: raw.name,
      category: raw.category ?? "Cooking",
      skillLevel: raw.skillLevel,
      exp: raw.exp,
      iconUrl: absUrl(raw.icon),
      sourceUrl: url,
      resultItemId,
      resultItemName,
      resultQuantity,
      ingredients,
      collectedAt: new Date().toISOString(),
    }
  } finally {
    await browser.close().catch(() => {})
  }
}

export async function saveBdocodexRecipe(detail: BdocodexRecipe): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not set - scraped bdocodex recipe was NOT saved to Postgres, only printed below.")
    return
  }
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    await client.query(
      `INSERT INTO bdocodex_recipes (bdocodex_id, recipe_name, category, skill_level, exp, icon_url, source_url, collected_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())
       ON CONFLICT (bdocodex_id) DO UPDATE SET
         recipe_name = EXCLUDED.recipe_name, category = EXCLUDED.category,
         skill_level = EXCLUDED.skill_level, exp = EXCLUDED.exp,
         icon_url = EXCLUDED.icon_url, source_url = EXCLUDED.source_url, collected_at = now()`,
      [detail.bdocodexId, detail.recipeName, detail.category, detail.skillLevel, detail.exp, detail.iconUrl, detail.sourceUrl],
    )
    await client.query(`DELETE FROM bdocodex_recipe_ingredients WHERE bdocodex_id = $1`, [detail.bdocodexId])
    for (const ing of detail.ingredients) {
      await client.query(
        `INSERT INTO bdocodex_recipe_ingredients (bdocodex_id, item_id, ingredient_name, quantity, is_base, icon_url, collected_at)
         VALUES ($1, $2, $3, $4, $5, $6, now())
         ON CONFLICT (bdocodex_id, item_id) DO UPDATE SET
           ingredient_name = EXCLUDED.ingredient_name, quantity = EXCLUDED.quantity,
           is_base = EXCLUDED.is_base, icon_url = EXCLUDED.icon_url, collected_at = now()`,
        [detail.bdocodexId, ing.itemId, ing.name, ing.quantity, ing.isBase, ing.iconUrl],
      )
    }
    console.log(`Saved to Postgres: bdocodex_recipes + ${detail.ingredients.length} ingredient row(s) for #${detail.bdocodexId} "${detail.recipeName}"`)
  } finally {
    await client.end().catch(() => {})
  }
}

/** Upserts EN->TH name pairs. Skips empties, overwrites on re-scrape
 * (latest scrape wins - same convention as every other upsert here). */
export async function saveThNames(entries: Array<{ en: string; th: string }>, sourceUrl: string, source = "bdocodex-th"): Promise<void> {
  const clean = entries.filter((e) => e.en.trim() && e.th.trim())
  if (clean.length === 0) return
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not set - TH names were NOT saved to Postgres.")
    return
  }
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    for (const e of clean) {
      await client.query(
        `INSERT INTO item_name_translations (en_name, th_name, source, source_url, collected_at)
         VALUES ($1, $2, $3, $4, now())
         ON CONFLICT (en_name) DO UPDATE SET
           th_name = EXCLUDED.th_name, source = EXCLUDED.source,
           source_url = EXCLUDED.source_url, collected_at = now()`,
        [e.en.trim(), e.th.trim(), source, sourceUrl],
      )
    }
    console.log(`Saved to Postgres: ${clean.length} TH name(s) from ${sourceUrl}`)
  } finally {
    await client.end().catch(() => {})
  }
}

/** Single-item TH lookup: /us/item/<id>/ for the EN name, /th/item/<id>/
 * for the Thai name. For items that never appear in a scraped recipe
 * (bdolytics-side ingredients). Same DOM card (#item_name b) as recipes. */
export async function scrapeThItemName(itemId: number): Promise<{ en: string; th: string } | null> {
  const all = await scrapeThItemNames([itemId])
  return all[0] ?? null
}

/** Multi-ID version: one browser session for the whole list (NOT one
 * launch per id - a 159-item backlog would mean 159 browser launches).
 * Polite delay between items, abort on block. Returns only successes. */
export async function scrapeThItemNames(itemIds: number[]): Promise<Array<{ en: string; th: string }>> {
  const out: Array<{ en: string; th: string }> = []
  if (itemIds.length === 0) return out
  const { browser, page } = await launch()
  try {
    const readName = async (url: string, context: string): Promise<string | null> => {
      await page.goto(url, { waitUntil: "domcontentloaded" })
      await assertNotBlocked(page, context)
      await politeDelay()
      return page.evaluate(() => {
        const el = document.querySelector("#item_name b")
        const nm = ((el ? el.textContent : "") || "").trim()
        return nm || null
      })
    }
    for (const itemId of itemIds) {
      const en = await readName(`https://bdocodex.com/us/item/${itemId}/`, `bdocodex item ${itemId} (en)`)
      if (!en) {
        console.log(`bdocodex item ${itemId}: no EN name found, skipping`)
        continue
      }
      const th = await readName(`https://bdocodex.com/th/item/${itemId}/`, `bdocodex item ${itemId} (th)`)
      if (!th) {
        console.log(`bdocodex item ${itemId} ("${en}"): no TH name found, skipping`)
        continue
      }
      out.push({ en, th })
      await saveThNames([{ en, th }], `https://bdocodex.com/th/item/${itemId}/`)
    }
  } finally {
    await browser.close().catch(() => {})
  }
  return out
}

// CLI: npm run collect:bdocodex -- <id> [category]
//      npm run collect:th-names -- <bdocodex-item-id>
// On-demand only - no bulk mode exists on purpose (see header comment).
if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv[2] === "item" ? "item" : "recipe"
  if (mode === "item") {
    const itemIds = process.argv.slice(3).map(Number)
    if (itemIds.length === 0 || itemIds.some((n) => !Number.isInteger(n) || n <= 0)) {
      console.error("Usage: npm run collect:th-names -- <bdocodex-item-id> [more ids...]   e.g. 7704 4608 5408")
      process.exit(1)
    }
    scrapeThItemNames(itemIds)
      .then(async (rows) => {
        console.log(JSON.stringify(rows, null, 2))
      })
      .catch((err) => {
        console.error(`collect:th-names failed: ${err.message}`)
        process.exit(1)
      })
  } else {
    const id = Number(process.argv[2])
    const category = process.argv[3] ?? null
    if (!Number.isInteger(id) || id <= 0) {
      console.error("Usage: npm run collect:bdocodex -- <id> [category]   e.g. 225 Cooking")
      process.exit(1)
    }
    scrapeBdocodexRecipe(id)
      .then(async (d) => {
        if (category) d.category = category
        console.log(JSON.stringify(d, null, 2))
        await saveBdocodexRecipe(d)
      })
      .catch((err) => {
        console.error(`collect:bdocodex failed: ${err.message}`)
        process.exit(1)
      })
  }
}
