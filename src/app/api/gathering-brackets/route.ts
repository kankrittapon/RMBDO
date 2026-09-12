import { NextResponse } from "next/server"
import { getGatheringBrackets } from "@/lib/db/queries"

// All 61 gathering mastery brackets (static game math, tiny payload).
export async function GET() {
  try {
    const brackets = await getGatheringBrackets()
    return NextResponse.json({ brackets })
  } catch (err) {
    console.error("GET /api/gathering-brackets failed:", err)
    return NextResponse.json({ brackets: [], error: "db unavailable" }, { status: 200 })
  }
}
