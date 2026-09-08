import { NextResponse } from "next/server"
import { getItemNameTranslations } from "@/lib/db/queries"

// EN -> TH item-name map for the language toggle. Small table, fetched
// once per page load and cached client-side. Missing entry = show English.
export async function GET() {
  try {
    const names = await getItemNameTranslations()
    return NextResponse.json({ names })
  } catch (err) {
    console.error("GET /api/item-names failed:", err)
    return NextResponse.json({ names: {}, error: "db unavailable" }, { status: 200 })
  }
}
