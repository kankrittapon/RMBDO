import { getPool } from "@/lib/db/pool"

export interface FishingZoneRow {
  id: number
  name: string
  coord_x: number | null
  coord_y: number | null
}

/** Smallest possible vertical slice of the Location Engine (RMBDO plan
 * section 3-4): given the player's current position, rank Depth 4 fishing
 * zones by distance. Missing-prize-fish scoring needs a fish_species /
 * fishing_spot_fish join once that data is populated by the collector -
 * left as a TODO rather than guessed. */
export async function nearestFishingZones(
  origin: [number, number],
  limit = 5,
): Promise<Array<FishingZoneRow & { distance: number }>> {
  const pool = getPool()
  const { rows } = await pool.query<FishingZoneRow>(
    `SELECT id, name, coord_x, coord_y
     FROM fishing_spots
     WHERE is_deepest_point = TRUE AND coord_x IS NOT NULL AND coord_y IS NOT NULL`,
  )

  return rows
    .map((row) => ({
      ...row,
      distance: Math.hypot(Number(row.coord_x) - origin[0], Number(row.coord_y) - origin[1]),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
}
