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
