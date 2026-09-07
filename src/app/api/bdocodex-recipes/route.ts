import { NextRequest, NextResponse } from "next/server"
import { getBdocodexRecipes } from "@/lib/db/queries"

// Supplemental recipes from bdocodex.com - recipes bdolytics' Crafting
// Calculator doesn't list. Separate table, separate route, never merged
// into /api/crafting-recipes. No profitability data exists for these rows
// (bdocodex computes none), so there is deliberately no profit sorting.
export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("q") ?? undefined
    const category = req.nextUrl.searchParams.get("category") ?? undefined
    const recipes = await getBdocodexRecipes(search, category)
    return NextResponse.json({ recipes, source: "bdocodex" })
  } catch (err) {
    console.error("GET /api/bdocodex-recipes failed:", err)
    return NextResponse.json({ recipes: [], source: "bdocodex", error: "db unavailable" }, { status: 200 })
  }
}
