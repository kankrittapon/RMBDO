// Depth 4 (deepest) fishing zone collector - headless equivalent of
// openclick_private's bdolyticsFishing.ts, but using Playwright's real OS-level
// mouse clicks instead of waiting for a human. BDOLytics' map only reacts to
// trusted clicks; a content script's dispatchEvent() is untrusted and does
// nothing (confirmed during manual testing), but Playwright's page.mouse.click()
// drives actual OS input events, so it IS trusted and unlocks full automation
// of the coordinate-reveal click that the browser-extension version couldn't do.
import { mkdirSync, writeFileSync } from "node:fs"
import type { Page } from "playwright"
import { launch, politeDelay, sleep, assertNotBlocked } from "../lib/browser.js"

const PRIZE_FISH = [
  "Yellow Corvina", "Blue Bat Star", "Golden Sea Bass", "White Grouper", "Albino Coelacanth",
  "Black Eye Crab", "Golden Albacore", "Footballfish", "Pirarucu", "Black Spotted Dolphin",
  "Giant Black Squid", "Requiem Shark", "Ghost Whale", "Pink Dolphin", "Moon Jelly",
  "Flapjack Octopus", "Salp", "Rainbowfish", "Red Handfish", "Migaloo",
  "Humphead Parrotfish", "Blanket Octopus", "Frilled Shark", "Betta", "Green Sea Turtle",
  "Manta Ray", "Mantis Shrimp", "Duke Squid", "Sea Pig", "Barreleye",
  "Blue-ringed Octopus", "Blobfish", "Sea Bunny", "Deep Sea Snailfish", "Nautilus",
  "Sea Angel", "Gar", "Blue Lobster", "Silver Beltfish", "Ghost Fish",
  "Red Garra", "Vaquita", "Rainbow Sardine", "Blue Angel", "Spotted Spined Loach",
  "Koi", "Hammer Mackerel", "Glass Octopus", "Giant Bitterling", "Cloaking Shark",
  "Black Halibut", "Tripod Fish", "White Crucian Carp", "Dorado", "Whitefin Trevally",
  "Pelican Eel", "Electric Catfish", "Ranchu", "Edania Gar", "Cano Toadfish",
]

export interface FishingZoneRecord {
  zone: string
  fish: string[]
  coordinates: [number, number] | null
  dataSource: "live-click" | "unresolved"
}

async function searchInput(page: Page) {
  return page.locator('input[placeholder="Search.."]').first()
}

async function resultTitles(page: Page): Promise<string[]> {
  return page.locator("div.truncate.text-sm.font-medium").allInnerTexts()
}

async function searchFor(page: Page, query: string) {
  const input = await searchInput(page)
  await input.fill("")
  await sleep(100)
  await input.fill(query)
  // Debounce + render wait; a zero-result search is valid, so this is a
  // fixed wait rather than "wait for at least one result".
  await sleep(700)
}

/** Phase 1: search every Prize Fish, collect which Depth 4 zones each one
 * turns up, grouped by zone so each zone is recorded once. */
async function collectZoneFishMap(page: Page): Promise<Map<string, Set<string>>> {
  const zoneToFish = new Map<string, Set<string>>()
  for (let i = 0; i < PRIZE_FISH.length; i++) {
    const fish = PRIZE_FISH[i]!
    await searchFor(page, fish)
    const titles = await resultTitles(page)
    for (const title of titles) {
      if (!/\bDepth 4\b/i.test(title)) continue
      if (!zoneToFish.has(title)) zoneToFish.set(title, new Set())
      zoneToFish.get(title)!.add(fish)
    }
    if (i % 10 === 0) console.log(`  [${i + 1}/${PRIZE_FISH.length}] ${fish} -> ${titles.length} results`)
    await politeDelay()
  }
  return zoneToFish
}

/** Pans/zooms the map to a named zone by searching its exact name and
 * clicking the matching result row. */
async function focusZone(page: Page, zoneName: string): Promise<boolean> {
  await searchFor(page, zoneName)
  const row = page.locator("div.truncate.text-sm.font-medium", { hasText: zoneName }).first()
  if (!(await row.isVisible().catch(() => false))) return false
  const button = row.locator("xpath=ancestor::button[1]")
  await button.click()
  await sleep(800) // let the pan/zoom animation settle
  return true
}

function detailPanel(page: Page) {
  return page.locator('div.absolute.right-2.top-2.z-\\[1000\\]')
}

/** Reads [x, y] out of the currently-open detail panel, if its title matches
 * the zone we expect (guards against clicking the wrong overlapping depth
 * band). */
async function readPanelIfMatches(page: Page, expectedZone: string): Promise<[number, number] | null> {
  const panel = detailPanel(page)
  if (!(await panel.isVisible().catch(() => false))) return null
  const title = (await panel.locator("h3").innerText().catch(() => "")).trim()
  if (title !== expectedZone) return null
  const code = (await panel.locator("code").innerText().catch(() => "")).trim()
  const m = code.match(/^\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]$/)
  return m ? [Number(m[1]), Number(m[2])] : null
}

/** Phase 2: for a focused zone, click a small grid of points around the map
 * viewport center (the panned/zoomed view fills most of its viewport with the
 * target zone's polygon), stopping as soon as the detail panel confirms the
 * right zone. Depth-tier zones sit as thin adjacent bands, so a few offsets
 * are tried rather than a single center click. */
async function clickUntilResolved(page: Page, zoneName: string): Promise<[number, number] | null> {
  const mapBox = await page.locator("canvas").first().boundingBox()
  if (!mapBox) return null
  const cx = mapBox.x + mapBox.width / 2
  const cy = mapBox.y + mapBox.height / 2
  const offsets: Array<[number, number]> = [
    [0, 0], [-20, 0], [20, 0], [0, -20], [0, 20],
    [-40, -20], [40, 20], [-20, 40], [20, -40],
  ]
  for (const [dx, dy] of offsets) {
    await page.mouse.click(cx + dx, cy + dy)
    await sleep(400)
    const coords = await readPanelIfMatches(page, zoneName)
    if (coords) return coords
  }
  return null
}

async function main() {
  console.log("Launching browser...")
  const { browser, page } = await launch()

  try {
    await page.goto("https://bdolytics.com/en/map", { waitUntil: "domcontentloaded" })
    await assertNotBlocked(page, "initial navigation")
    await politeDelay()

    const filtersTab = page.getByRole("tab", { name: "Filters" })
    if (await filtersTab.isVisible().catch(() => false)) {
      await filtersTab.click()
      await politeDelay()
    }

    console.log("Phase 1: searching Prize Fish list for Depth 4 zones...")
    const zoneToFish = await collectZoneFishMap(page)
    await assertNotBlocked(page, "after phase 1 fish search loop")
    console.log(`Found ${zoneToFish.size} Depth 4 zones.`)

    const zones: FishingZoneRecord[] = []
    let i = 0
    for (const [zone, fishSet] of zoneToFish) {
      i++
      console.log(`Phase 2 [${i}/${zoneToFish.size}]: ${zone}`)
      const focused = await focusZone(page, zone)
      if (!focused) {
        zones.push({ zone, fish: [...fishSet].sort(), coordinates: null, dataSource: "unresolved" })
        continue
      }
      const coordinates = await clickUntilResolved(page, zone)
      zones.push({
        zone,
        fish: [...fishSet].sort(),
        coordinates,
        dataSource: coordinates ? "live-click" : "unresolved",
      })
      await politeDelay()
      await assertNotBlocked(page, `after clicking zone "${zone}"`)
    }

    mkdirSync("out", { recursive: true })
    const outPath = `out/fishing-depth4-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
    writeFileSync(
      outPath,
      JSON.stringify(
        { format: "rmbdo-collector-fishing-depth4/v1", exportedAt: new Date().toISOString(), zones },
        null,
        2,
      ),
    )
    const resolved = zones.filter((z) => z.dataSource === "live-click").length
    console.log(`Wrote ${zones.length} zones (${resolved} with coordinates) to ${outPath}`)
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
