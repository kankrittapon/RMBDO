import { NextRequest, NextResponse } from "next/server"
import { getBdocodexDetail } from "@/lib/db/queries"

// Ingredient list for one bdocodex recipe, for the drawer. Prices are
// always null (bdocodex v1 leaves them unscraped - shown as "no price").
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ recipe: null, error: "invalid bdocodex id" }, { status: 400 })
  }
  try {
    const detail = await getBdocodexDetail(id)
    if (!detail) {
      return NextResponse.json({ recipe: null, error: "unknown bdocodex recipe" }, { status: 404 })
    }
    return NextResponse.json({ ...detail, source: "bdocodex" })
  } catch (err) {
    console.error("GET /api/bdocodex-recipes/[id]/ingredients failed:", err)
    return NextResponse.json({ recipe: null, error: "db unavailable" }, { status: 500 })
  }
}
