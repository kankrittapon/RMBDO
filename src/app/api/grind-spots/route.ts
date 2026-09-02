import { NextResponse } from "next/server"
import { getDbGrindSpots } from "@/lib/db/queries"

// Served to the client so useRoadmapStore / GrindSpotOptimizerView can
// overlay real, collector-verified AP/DP/coordinates on top of the
// hand-authored src/data/grind-spots/spots.ts list (matched by name).
// Returns [] on any DB error rather than 500ing the whole page - the static
// list is always a usable fallback.
export async function GET() {
  try {
    const spots = await getDbGrindSpots()
    return NextResponse.json({ spots })
  } catch (err) {
    console.error("GET /api/grind-spots failed:", err)
    return NextResponse.json({ spots: [], error: "db unavailable" }, { status: 200 })
  }
}
