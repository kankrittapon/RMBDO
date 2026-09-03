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
  personalized: boolean
  collectedAt: string
  recipeSlug: string | null
}

/** Cooking/Alchemy/Processing/Imperial Crates profit-per-hour ranking,
 * scraped directly from bdolytics' own Crafting Calculator by
 * collector/src/scrapers/crafting.ts. `personalized` says whether
 * profit_per_hour used this player's own Mastery (from player_settings) or
 * bdolytics' generic default - check it per row rather than assuming,
 * since a player_settings change only takes effect on the next collector
 * run. */
export async function getDbCraftingRecipes(search?: string, category?: string): Promise<DbCraftingRecipe[]> {
  const pool = getPool()
  const conditions: string[] = ["profit_per_hour > 0"]
  const params: string[] = []
  if (search) {
    params.push(`%${search}%`)
    conditions.push(`recipe_name ILIKE $${params.length}`)
  }
  if (category) {
    params.push(category)
    conditions.push(`category = $${params.length}`)
  }
  const where = `WHERE ${conditions.join(" AND ")}`
  const { rows } = await pool.query(
    `SELECT recipe_name, category, profit_per_hour, price, volume_14d_avg, experience, personalized, collected_at, recipe_slug
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
    personalized: r.personalized,
    collectedAt: r.collected_at,
    recipeSlug: r.recipe_slug ?? null,
  }))
}

export interface PlayerSettings {
  cookingMastery: number | null
  alchemyMastery: number | null
  processingMastery: number | null
  updatedAt: string | null
}

/** Singleton row (id=1) - collector/src/scrapers/crafting.ts reads this
 * directly (via DATABASE_URL, not this function - it's a separate Node
 * process) to fill bdolytics' Mastery settings before scraping, so
 * crafting_recipes.profit_per_hour reflects this player's real mastery.
 * No trainingMastery: bdolytics' "Training Mastery" setting is the
 * separate Horse Training life skill, unrelated to Cooking/Alchemy/
 * Processing/Imperial Crates - see the note in crafting.ts. */
export async function getPlayerSettings(): Promise<PlayerSettings | null> {
  const pool = getPool()
  const { rows } = await pool.query(
    `SELECT cooking_mastery, alchemy_mastery, processing_mastery, updated_at
     FROM player_settings WHERE id = 1`,
  )
  if (rows.length === 0) return null
  const r = rows[0]
  return {
    cookingMastery: r.cooking_mastery,
    alchemyMastery: r.alchemy_mastery,
    processingMastery: r.processing_mastery,
    updatedAt: r.updated_at,
  }
}

export async function upsertPlayerSettings(settings: {
  cookingMastery: number | null
  alchemyMastery: number | null
  processingMastery: number | null
}): Promise<void> {
  const pool = getPool()
  await pool.query(
    `INSERT INTO player_settings (id, cooking_mastery, alchemy_mastery, processing_mastery, updated_at)
     VALUES (1, $1, $2, $3, now())
     ON CONFLICT (id) DO UPDATE SET
       cooking_mastery = EXCLUDED.cooking_mastery, alchemy_mastery = EXCLUDED.alchemy_mastery,
       processing_mastery = EXCLUDED.processing_mastery,
       updated_at = now()`,
    [settings.cookingMastery, settings.alchemyMastery, settings.processingMastery],
  )
}
