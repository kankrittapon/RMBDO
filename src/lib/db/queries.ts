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
  iconUrl: string | null
  collectedAt: string
}

/** Central Market prices (Southeast Asia region), scraped from bdolytics'
 * plain server-rendered market table by collector/src/scrapers/market.ts.
 * Scoped to farm-vs-buy-relevant categories (material, alchemy stone,
 * magic crystal, lightstone, enhancement) - see CATEGORIES in that file.
 * `iconUrl` is hotlinked from cdn.questlog.gg (a dedicated game-asset CDN
 * bdolytics itself hotlinks from, not bdolytics' own server) - can be null
 * for items where name-matching the icon during scraping didn't find a hit. */
export async function getDbMarketItems(search?: string): Promise<DbMarketItem[]> {
  const pool = getPool()
  const { rows } = await pool.query(
    search
      ? `SELECT item_name, category, price, volume_14d_avg, stock, icon_url, collected_at FROM market_items
         WHERE item_name ILIKE $1 ORDER BY item_name LIMIT 200`
      : `SELECT item_name, category, price, volume_14d_avg, stock, icon_url, collected_at FROM market_items
         ORDER BY item_name LIMIT 500`,
    search ? [`%${search}%`] : undefined,
  )
  return rows.map((r) => ({
    itemName: r.item_name,
    category: r.category,
    price: r.price !== null ? Number(r.price) : null,
    volume14dAvg: r.volume_14d_avg !== null ? Number(r.volume_14d_avg) : null,
    stock: r.stock !== null ? Number(r.stock) : null,
    iconUrl: r.icon_url ?? null,
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
  iconUrl: string | null
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
    `SELECT recipe_name, category, profit_per_hour, price, volume_14d_avg, experience, personalized, collected_at, recipe_slug, icon_url
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
    iconUrl: r.icon_url ?? null,
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

// ---------------------------------------------------------------------------
// Worker node yields (Phase 2). Design rule, per explicit direction:
// normal (unlucky) and giant (unlucky_gi) are NEVER averaged together -
// they are separate worker-kind variants of the same node (a Giant gets
// ~1.6x base qty, e.g. Wheat 18 normal vs ~29.75 giant). Every response
// carries both variants side by side; the caller picks which to sort by.
// Lucky procs are shared by both variants (matches workerman's own math).
// Items with no live market price get price: null and are EXCLUDED from
// cycle-value sums - shown, never guessed (anti-fabrication rule).
// ---------------------------------------------------------------------------

export type DropKind = "unlucky" | "lucky" | "unlucky_gi"

export interface NodeYieldItem {
  itemId: number | null
  name: string
  quantity: number
  price: number | null // null = no live market price; excluded from cycle value
  value: number | null // quantity * price, null when price is null
}

export interface NodeYieldVariant {
  workerKind: "normal" | "giant"
  items: NodeYieldItem[] // base (unlucky / unlucky_gi) + shared lucky procs
  cycleValue: number // Σ value over PRICED items only
  unpricedCount: number // items shown with price: null
}

export interface NodeDetail {
  waypointKey: number
  name: string | null
  parentKey: number | null
  kind: number | null
  cpCost: number
  workload: number | null
  regionGroup: number | null
  normal: NodeYieldVariant
  giant: NodeYieldVariant
}

export interface NodeSearchHit {
  waypointKey: number
  name: string | null
  cpCost: number
  // The resource name this row matched (the ILIKE query can match
  // near-misses - clients MUST re-filter to exact names themselves and
  // never present a near-miss as a source).
  matchedName: string
  // Quantities per worker-kind variant for the matched resource only.
  normalQty: number | null
  giantQty: number | null
  luckyQty: number | null
  price: number | null
  // Per-cycle values (qty * price) per variant, null when unpriced.
  normalValue: number | null
  giantValue: number | null
  // Ranking keys. null when cpCost is 0 (free node - value shown, not ranked)
  // or when the price is missing.
  normalValuePerCp: number | null
  giantValuePerCp: number | null
}

/** Latest live price per item name (Central Market, whatever region the
 * collector last wrote - currently Southeast Asia only). */
async function getLatestPrices(names: string[]): Promise<Map<string, number>> {
  const pool = getPool()
  const map = new Map<string, number>()
  if (names.length === 0) return map
  const { rows } = await pool.query(
    `SELECT DISTINCT ON (item_name) item_name, price FROM market_items
     WHERE item_name = ANY($1) ORDER BY item_name, collected_at DESC`,
    [names],
  )
  for (const r of rows) {
    if (r.price !== null) map.set(r.item_name, Number(r.price))
  }
  return map
}

function buildVariant(
  workerKind: "normal" | "giant",
  base: { itemId: number | null; name: string; quantity: number }[],
  lucky: { itemId: number | null; name: string; quantity: number }[],
  prices: Map<string, number>,
): NodeYieldVariant {
  const items: NodeYieldItem[] = [...base, ...lucky].map((it) => {
    const price = prices.get(it.name) ?? null
    return { ...it, price, value: price !== null ? it.quantity * price : null }
  })
  return {
    workerKind,
    items,
    cycleValue: items.reduce((sum, it) => sum + (it.value ?? 0), 0),
    unpricedCount: items.filter((it) => it.price === null).length,
  }
}

export async function getNodeDetail(waypointKey: number): Promise<NodeDetail | null> {
  const pool = getPool()
  const meta = await pool.query(
    `SELECT waypoint_key, name, parent_key, kind, cp_cost FROM node_meta WHERE waypoint_key = $1`,
    [waypointKey],
  )
  if (meta.rows.length === 0) return null
  const m = meta.rows[0]
  const res = await pool.query(
    `SELECT resource_item_id, resource_name, quantity, drop_kind, workload, region_group
     FROM node_resources WHERE waypoint_key = $1`,
    [waypointKey],
  )
  const row = (kind: DropKind) =>
    res.rows
      .filter((r) => r.drop_kind === kind)
      .map((r) => ({ itemId: r.resource_item_id, name: r.resource_name, quantity: Number(r.quantity) }))
  const prices = await getLatestPrices(res.rows.map((r) => r.resource_name))
  const lucky = row("lucky")
  return {
    waypointKey: m.waypoint_key,
    name: m.name,
    parentKey: m.parent_key,
    kind: m.kind,
    cpCost: Number(m.cp_cost),
    workload: res.rows[0]?.workload ?? null,
    regionGroup: res.rows[0]?.region_group ?? null,
    normal: buildVariant("normal", row("unlucky"), lucky, prices),
    giant: buildVariant("giant", row("unlucky_gi"), lucky, prices),
  }
}

/** Reverse lookup: which nodes yield this resource. One row per node, both
 * worker-kind variants kept separate; `kind` param only picks the sort key. */
export async function searchNodesByResource(
  search: string,
  kind: "normal" | "giant" = "normal",
): Promise<NodeSearchHit[]> {
  const pool = getPool()
  const { rows } = await pool.query(
    `SELECT m.waypoint_key, m.name, m.cp_cost,
            r.resource_name, r.quantity, r.drop_kind
     FROM node_resources r JOIN node_meta m ON m.waypoint_key = r.waypoint_key
     WHERE r.resource_name ILIKE $1`,
    [`%${search}%`],
  )
  const byNode = new Map<number, NodeSearchHit & { _q: Record<string, number> }>()
  for (const r of rows) {
    let hit = byNode.get(r.waypoint_key)
    if (!hit) {
      hit = {
        waypointKey: r.waypoint_key,
        name: r.name,
        cpCost: Number(r.cp_cost),
        matchedName: r.resource_name,
        normalQty: null,
        giantQty: null,
        luckyQty: null,
        price: null,
        normalValue: null,
        giantValue: null,
        normalValuePerCp: null,
        giantValuePerCp: null,
        _q: {},
      }
      byNode.set(r.waypoint_key, hit)
    }
    // Same resource name matched twice (e.g. exact + ILIKE dupes can't
    // happen per UNIQUE key, but keep the merge total-free: one qty per kind)
    hit._q[r.drop_kind] = Number(r.quantity)
  }
  const names = Array.from(byNode.values()).map((h) => {
    const first = rows.find((r) => r.waypoint_key === h.waypointKey)
    return first.resource_name as string
  })
  const prices = await getLatestPrices(names)
  const hits: NodeSearchHit[] = []
  byNode.forEach((hit) => {
    const first = rows.find((r) => r.waypoint_key === hit.waypointKey)
    const price = prices.get(first.resource_name) ?? null
    const q = hit._q
    // Lucky procs count toward BOTH variants (shared table, see above)
    const lucky = q["lucky"] ?? null
    const mk = (qty: number | null) => (qty !== null && price !== null ? qty * price : null)
    const perCp = (v: number | null) => (v !== null && hit.cpCost > 0 ? v / hit.cpCost : null)
    const normalValue = mk(q["unlucky"] ?? null)
    const giantValue = mk(q["unlucky_gi"] ?? null)
    const { _q, ...rest } = hit
    void _q
    hits.push({
      ...rest,
      normalQty: q["unlucky"] ?? null,
      giantQty: q["unlucky_gi"] ?? null,
      luckyQty: lucky,
      price,
      // NOTE: lucky-proc value intentionally NOT folded into these
      // per-resource sort values - this endpoint ranks nodes for ONE
      // resource, and the lucky table usually pays a different item.
      // Full cycle value (base + lucky) lives on getNodeDetail instead.
      normalValue,
      giantValue,
      normalValuePerCp: perCp(normalValue),
      giantValuePerCp: perCp(giantValue),
    })
  })
  const key = kind === "giant" ? "giantValuePerCp" : "normalValuePerCp"
  // Ranked rows first (priced + CP > 0), then unrankable rows (free nodes
  // and unpriced resources) in name order - never hidden, never guessed.
  hits.sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    if (av !== null && bv !== null) return bv - av
    if (av !== null) return -1
    if (bv !== null) return 1
    return (a.name ?? "").localeCompare(b.name ?? "")
  })
  return hits.slice(0, 100)
}
