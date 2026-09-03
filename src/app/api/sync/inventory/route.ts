import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type SheetInventoryResponse = {
  status: "ok" | "error"
  timestamp: string
  inventory: Record<string, number>
  ledger: Array<{ name: string; category: string; quantity: number; estimatedPrice: number | null; notes: string }>
  message?: string
}

async function handle(): Promise<NextResponse> {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL
  if (!url) {
    return NextResponse.json(
      {
        error: "GOOGLE_SHEETS_WEBHOOK_URL not configured",
        hint: "Add GOOGLE_SHEETS_WEBHOOK_URL to .env and Vercel Dashboard → Settings → Environment Variables",
      },
      { status: 500 },
    )
  }

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      headers: { Accept: "application/json" },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(`Sheets ${res.status} ${res.statusText} ${text.slice(0, 200)}`)
    }

    const json = (await res.json()) as SheetInventoryResponse

    if (json.status !== "ok" || typeof json.inventory !== "object") {
      throw new Error(json.message || "Invalid sheets response")
    }

    const cleanInventory: Record<string, number> = {}
    for (const [k, v] of Object.entries(json.inventory)) {
      const key = String(k).trim()
      if (!key) continue
      cleanInventory[key] = Number(v) || 0
    }

    const cleanLedger = Array.isArray(json.ledger)
      ? json.ledger.map((item) => ({
          name: String(item.name || "").trim(),
          category: String(item.category || "Uncategorized").trim(),
          quantity: Number(item.quantity) || 0,
          estimatedPrice: item.estimatedPrice !== null && item.estimatedPrice !== undefined ? Number(item.estimatedPrice) || null : null,
          notes: String(item.notes || "").trim(),
        }))
      : []

    return NextResponse.json(
      {
        status: "ok",
        timestamp: json.timestamp,
        inventory: cleanInventory,
        ledger: cleanLedger,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: "Failed to fetch Google Sheet", details: message }, { status: 502 })
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  return handle()
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return handle()
}
