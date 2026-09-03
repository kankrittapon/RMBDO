import type { Browser, Page } from "playwright"
import { chromium } from "playwright-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import { bridgeInitScript } from "./bridge.js"

// playwright-extra wraps the real playwright chromium launcher with a
// puppeteer-extra-style plugin pipeline; the stealth plugin patches the
// usual headless tells (navigator.webdriver, missing plugins/languages,
// WebGL vendor strings, etc.) that Cloudflare's bot-management checks for.
// Added after a plain headless Playwright run got a full "Attention
// Required" Cloudflare bot-block (not just the earlier rate-limit) during
// manual testing - a real browser session (via the openclick_private
// extension) never triggered that, only headless automation did.
chromium.use(StealthPlugin())

const MIN_DELAY = Number(process.env.COLLECTOR_MIN_DELAY_MS ?? 4000)
const MAX_DELAY = Number(process.env.COLLECTOR_MAX_DELAY_MS ?? 10000)
const HEADFUL = process.env.COLLECTOR_HEADFUL === "true"

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Randomized delay between actions - deliberately slow to avoid the
 * Cloudflare rate-limit ban we hit once already testing this by hand. */
export async function politeDelay() {
  const ms = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY)
  await sleep(ms)
}

export async function launch(): Promise<{ browser: Browser; page: Page }> {
  // launch()'s return type is playwright-extra's own Browser/Page, which is
  // structurally identical to playwright's for everything this codebase
  // uses - cast at the boundary so the rest of the collector can keep
  // importing plain `Browser`/`Page` types from "playwright".
  const browser = (await chromium.launch({ headless: !HEADFUL })) as unknown as Browser
  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    locale: "en-US",
    timezoneId: "Asia/Bangkok",
  })
  const page = await context.newPage()
  await page.addInitScript(bridgeInitScript)
  return { browser, page }
}

/** Detects a Cloudflare rate-limit page (Error 1015) or a full bot-block /
 * challenge page ("Attention Required", "Sorry, you have been blocked",
 * "Checking your browser"). Collector scripts should check this after every
 * navigation and abort the run rather than retry aggressively - retrying
 * into a block makes the next cooldown longer, not shorter. */
export async function isCloudflareBlocked(page: Page): Promise<boolean> {
  const title = await page.title().catch(() => "")
  if (/access denied|attention required|just a moment|cloudflare/i.test(title)) return true
  const bodyText = await page
    .locator("body")
    .innerText()
    .catch(() => "")
  return /error 1015|you are being rate limited|checking your browser|sorry, you have been blocked/i.test(
    bodyText,
  )
}

export async function assertNotBlocked(page: Page, context: string) {
  if (await isCloudflareBlocked(page)) {
    throw new Error(
      `Cloudflare blocked/rate-limited the request during "${context}". ` +
        `Stopping this run rather than retrying - wait at least several hours (a full bot-block, not just a ` +
        `rate-limit, was seen here before) before running the collector again, and space out separate runs ` +
        `by more than a few minutes - running collect:fishing twice back-to-back plus ad-hoc debug scripts is ` +
        `what triggered it last time.`,
    )
  }
}
