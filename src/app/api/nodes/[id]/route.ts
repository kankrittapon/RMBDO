import { NextRequest, NextResponse } from "next/server"
import { getNodeDetail } from "@/lib/db/queries"

// What does this worker node yield?
//   GET /api/nodes/123
// Returns node meta + TWO separate yield variants (normal / giant - never
// averaged, see queries.ts) with live Central Market prices. Items without
// a live price come back price: null and are excluded from cycleValue.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ node: null, error: "invalid node id" }, { status: 400 })
  }
  try {
    const node = await getNodeDetail(id)
    if (!node) {
      return NextResponse.json({ node: null, error: "unknown node - no yields recorded" }, { status: 404 })
    }
    return NextResponse.json({ node })
  } catch (err) {
    console.error("GET /api/nodes/[id] failed:", err)
    return NextResponse.json({ node: null, error: "db unavailable" }, { status: 500 })
  }
}
