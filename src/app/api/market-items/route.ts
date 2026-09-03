import { NextRequest, NextResponse } from "next/server"
import { getDbMarketItems } from "@/lib/db/queries"

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("q") ?? undefined
    const items = await getDbMarketItems(search)
    return NextResponse.json({ items })
  } catch (err) {
    console.error("GET /api/market-items failed:", err)
    return NextResponse.json({ items: [], error: "db unavailable" }, { status: 200 })
  }
}
