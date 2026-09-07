import { NextRequest, NextResponse } from "next/server"
import { searchNodesByResource } from "@/lib/db/queries"

// Reverse lookup: which worker nodes yield this resource?
//   GET /api/nodes?resource=Wheat            -> ranked by normal-worker value/CP
//   GET /api/nodes?resource=Wheat&kind=giant -> ranked by giant-worker value/CP
//
// Normal and giant variants are NEVER averaged together - each hit carries
// both (normalQty/giantQty, normalValue/giantValue, ...PerCp) and `kind`
// only picks the sort key. Unpriced resources and 0-CP nodes sort last,
// never hidden, never guessed. Fail-open (200 + []) like every other
// reference-data route in this app.
export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("resource") ?? req.nextUrl.searchParams.get("q") ?? ""
    if (!search.trim()) {
      return NextResponse.json({ nodes: [], error: "pass ?resource=<name>" }, { status: 200 })
    }
    const kindParam = req.nextUrl.searchParams.get("kind")
    const kind = kindParam === "giant" ? "giant" : "normal"
    const nodes = await searchNodesByResource(search.trim(), kind)
    return NextResponse.json({ nodes, kind })
  } catch (err) {
    console.error("GET /api/nodes failed:", err)
    return NextResponse.json({ nodes: [], error: "db unavailable" }, { status: 200 })
  }
}
