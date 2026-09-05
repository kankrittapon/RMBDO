// One-off discovery tool: finds the real Arsha.io (BDO Central Market)
// mainCategory/subCategory ID for a given item-name search term, by
// enumerating GetWorldMarketList across category ranges and inspecting
// actual item names in each response - since neither bdolytics' URL
// slugs nor the local veliainn-market-resources category dump contain
// "Lightstone" at all (confirmed by direct grep - it's simply missing
// from that data source, not a naming mismatch). Arsha.io works off
// BDO's real numeric category IDs, so this bypasses that gap entirely.
//
// Usage: node scripts/discover-arsha-categories.mjs "Lightstone"
const REGION = "sea"
const BASE = `https://api.arsha.io/v2/${REGION}/GetWorldMarketList`

// BDO's real mainCategory IDs run roughly 1-80, sparsely populated.
// subCategory is usually 1-20 within a mainCategory that has one.
const MAIN_CATEGORY_RANGE = Array.from({ length: 80 }, (_, i) => i + 1)
const SUB_CATEGORY_RANGE = Array.from({ length: 12 }, (_, i) => i + 1)

const searchTerm = process.argv[2]
if (!searchTerm) {
  console.error('Usage: node scripts/discover-arsha-categories.mjs "<search term>"')
  process.exit(1)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchCategory(mainCategory, subCategory) {
  const url = subCategory
    ? `${BASE}?mainCategory=${mainCategory}&subCategory=${subCategory}`
    : `${BASE}?mainCategory=${mainCategory}`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    return Array.isArray(data) ? data : null
  } catch {
    return null
  }
}

async function main() {
  const matches = []
  const seenCategories = new Set()

  for (const mainCategory of MAIN_CATEGORY_RANGE) {
    // Try mainCategory alone first (some categories don't need a subCategory).
    const flat = await fetchCategory(mainCategory)
    await sleep(150)
    if (flat) {
      for (const item of flat) {
        if (item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          matches.push(item)
        }
      }
      const key = `${mainCategory}`
      if (!seenCategories.has(key) && flat.length) {
        console.log(`mainCategory=${mainCategory}: ${flat.length} items, e.g. "${flat[0].name}"`)
      }
      seenCategories.add(key)
      continue
    }

    // Otherwise probe subcategories explicitly.
    for (const subCategory of SUB_CATEGORY_RANGE) {
      const items = await fetchCategory(mainCategory, subCategory)
      await sleep(150)
      if (!items || !items.length) continue
      console.log(`mainCategory=${mainCategory} subCategory=${subCategory}: ${items.length} items, e.g. "${items[0].name}"`)
      for (const item of items) {
        if (item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          matches.push(item)
        }
      }
    }
  }

  console.log(`\n=== Matches for "${searchTerm}" ===`)
  if (!matches.length) {
    console.log("No matches found in any scanned category.")
  } else {
    for (const m of matches) {
      console.log(`${m.name} (id=${m.id}) -> mainCategory=${m.mainCategory}, subCategory=${m.subCategory}`)
    }
  }
}

main()
