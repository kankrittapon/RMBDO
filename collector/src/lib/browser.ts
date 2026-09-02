import { chromium, type Browser, type Page } from "playwright"
import { bridgeInitScript } from "./bridge.js"

const MIN_DELAY = Number(process.env.COLLECTOR_MIN_DELAY_MS ?? 3000)
const MAX_DELAY = Number(process.env.COLLECTOR_MAX_DELAY_MS ?? 8000)
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
  const browser = await chromium.launch({ headless: !HEADFUL })
  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  })
  const page = await context.newPage()
  await page.addInitScript(bridgeInitScript)
  return { browser, page }
}

/** Detects the Cloudflare rate-limit / challenge page we hit during manual
 * testing (Error 1015 "You are being rate limited", or a JS challenge).
 * Collector scripts should check this after every navigation and abort
 * the run rather than retry aggressively - retrying into a ban makes it
 * worse and longer. */
export async function isCloudflareBlocked(page: Page): Promise<boolean> {
  const title = await page.title().catch(() => "")
  if (/access denied|attention required|just a moment/i.test(title)) return true
  const bodyText = await page
    .locator("body")
    .innerText()
    .catch(() => "")
  return /error 1015|you are being rate limited|checking your browser/i.test(bodyText)
}

export async function assertNotBlocked(page: Page, context: string) {
  if (await isCloudflareBlocked(page)) {
    throw new Error(
      `Cloudflare blocked/rate-limited the request during "${context}". ` +
        `Stopping this run rather than retrying - wait at least an hour before running the collector again, ` +
        `and consider increasing COLLECTOR_MIN_DELAY_MS/COLLECTOR_MAX_DELAY_MS in .env.`,
    )
  }
}
