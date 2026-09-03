import { getPool } from "./pool"

export interface DbGrindSpot {
  name: string
  recommendedAP: number | null
  recommendedDP: number | null
  coordinates: [number, number] | null
  notableDrops: string | null
  dataSource: "db-verified"
}

export interface DbFishingSpot {
  name: string
  coordinates: [number, number] | null
  isDeepestPoint: boolean
  hasRedFish: boolean
  dataSource: "db-verified"
}

/** Grind spot rows collected via the Playwright collector (see /collector)
 * and synced into Postgres by scripts/normalize.mjs - real AP/DP/coordinates
 * from bdolytics' live API, not the hand-authored placeholder values in
 * src/data/grind-spots/spots.ts. Match by `name` against GrindSpotItem.name
 * to overlay verified numbers in the UI. */
export async function getDbGrindSpots(): Promise<DbGrindSpot[]> {
  const pool = getPool()
  const { rows } = await pool.query(
    `SELECT name, recommended_ap, recommended_dp, coord_x, coord_y, notable_drops FROM grind_spots`,
  )
  return rows.map((r) => ({
    name: r.name,
    recommendedAP: r.recommended_ap,
    recommendedDP: r.recommended_dp,
    coordinates: r.coord_x !== null && r.coord_y !== null ? [Number(r.coord_x), Number(r.coord_y)] : null,
    notableDrops: r.notable_drops,
    dataSource: "db-verified" as const,
  }))
}

/** Depth-4 (deepest) fishing zones - real coordinates from the in-game
 * bookmark export + collector, synced by scripts/normalize.mjs. */
export async function getDbFishingSpots(): Promise<DbFishingSpot[]> {
  const pool = getPool()
  const { rows } = await pool.query(
    `SELECT name, coord_x, coord_y, is_deepest_point, has_red_fish FROM fishing_spots WHERE is_deep_sea = TRUE`,
  )
  return rows.map((r) => ({
    name: r.name,
    coordinates: r.coord_x !== null && r.coord_y !== null ? [Number(r.coord_x), Number(r.coord_y)] : null,
    isDeepestPoint: r.is_deepest_point,
    hasRedFish: r.has_red_fish,
    dataSource: "db-verified" as const,
  }))
}

export interface DbMarketItem {
  itemName: string
  category: string | null
  price: number | null
  volume14dAvg: number | null
  stock: number | null
  collectedAt: string
}

/** Central Market prices (Southeast Asia region), scraped from bdolytics'
 * plain server-rendered market table by collector/src/scrapers/market.ts.
 * Scoped to farm-vs-buy-relevant categories (material, alchemy stone,
 * magic crystal, lightstone, enhancement) - see CATEGORIES in that file. */
export async function getDbMarketItems(search?: string): Promise<DbMarketItem[]> {
  const pool = getPool()
  const { rows } = await pool.query(
    search
      ? `SELECT item_name, category, price, volume_14d_avg, stock, collected_at FROM market_items
         WHERE item_name ILIKE $1 ORDER BY item_name LIMIT 200`
      : `SELECT item_name, category, price, volume_14d_avg, stock, collected_at FROM market_items
         ORDER BY item_name LIMIT 500`,
    search ? [`%${search}%`] : undefined,
  )
  return rows.map((r) => ({
    itemName: r.item_name,
    category: r.category,
    price: r.price !== null ? Number(r.price) : null,
    volume14dAvg: r.volume_14d_avg !== null ? Number(r.volume_14d_avg) : null,
    stock: r.stock !== null ? Number(r.stock) : null,
    collectedAt: r.collected_at,
  }))
}

export interface DbCraftingRecipe {
  recipeName: string
  category: string
  profitPerHour: number | null
  price: number | null
  volume14dAvg: number | null
  experience: string | null
  collectedAt: string
}

/** Cooking/Alchemy/Processing/Imperial Crates profit-per-hour ranking,
 * scraped directly from bdolytics' own Crafting Calculator by
 * collector/src/scrapers/crafting.ts - the profit/hour number reflects
 * bdolytics' default mastery/settings, not this player's personal mastery
 * (see the "Known gaps" note in README.md and the comment in crafting.ts). */
export async function getDbCraftingRecipes(search?: string, category?: string): Promise<DbCraftingRecipe[]> {
  const pool = getPool()
  const conditions: string[] = []
  const params: string[] = []
  if (search) {
    params.push(`%${search}%`)
    conditions.push(`recipe_name ILIKE $${params.length}`)
  }
  if (category) {
    params.push(category)
    conditions.push(`category = $${params.length}`)
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""
  const { rows } = await pool.query(
    `SELECT recipe_name, category, profit_per_hour, price, volume_14d_avg, experience, collected_at
     FROM crafting_recipes ${where}
     ORDER BY profit_per_hour DESC NULLS LAST LIMIT 500`,
    params,
  )
  return rows.map((r) => ({
    recipeName: r.recipe_name,
    category: r.category,
    profitPerHour: r.profit_per_hour !== null ? Number(r.profit_per_hour) : null,
    price: r.price !== null ? Number(r.price) : null,
    volume14dAvg: r.volume_14d_avg !== null ? Number(r.volume_14d_avg) : null,
    experience: r.experience,
    collectedAt: r.collected_at,
  }))
}
