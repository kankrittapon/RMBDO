// Live-API-only grind spot collector. Equivalent to extractGrindSpotsFromCache
// in openclick_private's bdolyticsFastExtractor.ts, but driven headlessly:
// navigate to the map, enable the Grind Spots filter, let the SPA make its
// own map.getGrindspots request (captured by the bridge fetch hook), then
// read it straight from window.__RMBDO_CACHE__. No synthetic clicks needed -
// this data isn't gated behind a canvas click like fishing zones are.
import { mkdirSync, writeFileSync } from "node:fs"
import { launch, politeDelay, assertNotBlocked } from "../lib/browser.js"
import { readCachedTrpcDataScript } from "../lib/bridge.js"

interface RawGrindSpot {
  name?: string
  ap?: number
  dp?: number
  coordinates?: [number, number]
  grindspotHasItems?: Array<{ name?: string }>
}

export interface GrindSpotRecord {
  locationId: string
  name: string
  recommendedAP: number
  recommendedDP: number
  coordinates: [number, number] | null
  rareDrops: string[]
  dataSource: "live-api"
}

async function main() {
  console.log("Launching browser...")
  const { browser, page } = await launch()

  try {
    await page.goto("https://bdolytics.com/en/map", { waitUntil: "domcontentloaded" })
    await assertNotBlocked(page, "initial navigation")
    await politeDelay()

    // Open Filters and enable "Grind Spots" if not already on. We only click
    // it when it looks inactive (best-effort text/class check) - clicking an
    // already-active toggle would disable it.
    const filtersTab = page.getByRole("tab", { name: "Filters" })
    if (await filtersTab.isVisible().catch(() => false)) {
      await filtersTab.click()
      await politeDelay()
    }
    const grindToggle = page.getByText("Grind Spots", { exact: true }).first()
    if (await grindToggle.isVisible().catch(() => false)) {
      const alreadyOn = await grindToggle
        .locator("xpath=ancestor::*[contains(@class,'orange') or contains(@class,'active')][1]")
        .count()
        .catch(() => 0)
      if (!alreadyOn) {
        await grindToggle.click()
      }
    }

    // Give the SPA time to fire map.getGrindspots and for the bridge to cache it.
    await page.waitForTimeout(2500)
    await assertNotBlocked(page, "after enabling Grind Spots filter")

    const raw = (await page.evaluate(readCachedTrpcDataScript, "getGrindspots")) as RawGrindSpot[] | null

    if (!raw) {
      console.warn(
        "No getGrindspots response captured. The map UI may have changed - " +
          "open https://bdolytics.com/en/map by hand, enable Grind Spots, and check " +
          "DevTools Network tab for the request name before adjusting this script.",
      )
    }

    const spots: GrindSpotRecord[] = (raw ?? [])
      .map((s): GrindSpotRecord | null => {
        const name = s.name?.trim()
        if (!name) return null
        return {
          locationId: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name,
          recommendedAP: Number(s.ap || 0),
          recommendedDP: Number(s.dp || 0),
          coordinates: Array.isArray(s.coordinates)
            ? [Number(s.coordinates[0]), Number(s.coordinates[1])]
            : null,
          rareDrops: (s.grindspotHasItems ?? []).map((i) => i.name || "").filter(Boolean),
          dataSource: "live-api",
        }
      })
      .filter((s): s is GrindSpotRecord => s !== null)

    mkdirSync("out", { recursive: true })
    const outPath = `out/grindspots-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
    writeFileSync(
      outPath,
      JSON.stringify(
        { format: "rmbdo-collector-grindspots/v1", exportedAt: new Date().toISOString(), spots },
        null,
        2,
      ),
    )
    console.log(`Wrote ${spots.length} grind spots to ${outPath}`)
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
