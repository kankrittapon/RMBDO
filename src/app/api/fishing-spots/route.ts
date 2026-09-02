import { NextResponse } from "next/server"
import { getDbFishingSpots } from "@/lib/db/queries"

export async function GET() {
  try {
    const spots = await getDbFishingSpots()
    return NextResponse.json({ spots })
  } catch (err) {
    console.error("GET /api/fishing-spots failed:", err)
    return NextResponse.json({ spots: [], error: "db unavailable" }, { status: 200 })
  }
}
