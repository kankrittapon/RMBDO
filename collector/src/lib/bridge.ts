/**
 * Runs inside the page via page.addInitScript(), before any page JS executes -
 * same technique as packages/extension/entrypoints/bdolyticsBridge.content.ts
 * in the openclick_private repo, just injected by Playwright instead of a
 * content script. Hooks window.fetch to capture bdolytics' internal tRPC
 * JSON responses (map.getFishingZones, map.getGrindspots, ...) as the SPA
 * makes them during normal navigation.
 */
export function bridgeInitScript() {
  const w = window as unknown as {
    __RMBDO_CACHE__?: Record<string, unknown>
  }
  w.__RMBDO_CACHE__ = w.__RMBDO_CACHE__ || {}
  const originalFetch = window.fetch
  window.fetch = async function (...args: Parameters<typeof fetch>) {
    const response = await originalFetch.apply(this, args)
    try {
      const url = typeof args[0] === "string" ? args[0] : (args[0] as Request)?.url || ""
      if (url.includes("bdolytics") || url.includes("questlog.gg") || url.includes("api") || url.includes(".json")) {
        const clone = response.clone()
        clone
          .json()
          .then((data) => {
            if (w.__RMBDO_CACHE__) w.__RMBDO_CACHE__[url] = data
          })
          .catch(() => {})
      }
    } catch {
      // never break the page over a capture failure
    }
    return response
  }
}

/** Reads a cached tRPC response whose request URL contains `urlIncludes`. */
export function readCachedTrpcDataScript(urlIncludes: string): unknown[] | null {
  const w = window as unknown as { __RMBDO_CACHE__?: Record<string, unknown> }
  const cache = w.__RMBDO_CACHE__
  if (!cache) return null
  for (const [url, payload] of Object.entries(cache)) {
    if (!url.includes(urlIncludes)) continue
    const data = (payload as { result?: { data?: unknown } } | undefined)?.result?.data
    if (Array.isArray(data)) return data
  }
  return null
}
