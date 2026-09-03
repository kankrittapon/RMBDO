import { NextRequest, NextResponse } from "next/server"
import { getPlayerSettings, upsertPlayerSettings } from "@/lib/db/queries"

export async function GET() {
  try {
    const settings = await getPlayerSettings()
    return NextResponse.json({ settings })
  } catch (err) {
    console.error("GET /api/player-settings failed:", err)
    return NextResponse.json({ settings: null, error: "db unavailable" }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const toIntOrNull = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v))
    await upsertPlayerSettings({
      cookingMastery: toIntOrNull(body.cookingMastery),
      alchemyMastery: toIntOrNull(body.alchemyMastery),
      processingMastery: toIntOrNull(body.processingMastery),
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("POST /api/player-settings failed:", err)
    return NextResponse.json({ ok: false, error: "db unavailable" }, { status: 500 })
  }
}
