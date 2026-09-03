import { NextRequest, NextResponse } from "next/server"
import { getDbCraftingRecipes } from "@/lib/db/queries"

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("q") ?? undefined
    const category = req.nextUrl.searchParams.get("category") ?? undefined
    const recipes = await getDbCraftingRecipes(search, category)
    return NextResponse.json({ recipes })
  } catch (err) {
    console.error("GET /api/crafting-recipes failed:", err)
    return NextResponse.json({ recipes: [], error: "db unavailable" }, { status: 200 })
  }
}
