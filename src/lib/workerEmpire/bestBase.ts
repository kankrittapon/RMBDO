// Best-base-town recommendation: try candidate towns for a set of target
// nodes and rank by total connection CP. Shared by the EmpireWizard and
// the alchemy preset so both agree on the math.
//
// Two-stage (fast estimate, then exact):
//  1. estimateBaseCosts() runs one Dijkstra per base town (35 towns x
//     ~1000 nodes each - milliseconds, client-side) and sums path costs.
//     This is an ESTIMATE (shared path segments counted multiple times).
//  2. The caller exact-solves the top shortlist with the WASM solver and
//     picks the real minimum. Never present estimates as exact totals.

export interface DijkstraNode {
  waypoint_key: number;
  need_exploration_point: number;
  link_list: number[];
}

export interface BaseTownInfo {
  id: number;
  name: string | null;
  isWarehouse: boolean;
}

export interface BaseEstimate {
  townId: number;
  name: string | null;
  isWarehouse: boolean;
  /** Sum of Dijkstra path CPs (estimate - shared segments double-counted). */
  estCp: number;
  /** How many of the targets are reachable from this town. */
  covered: number;
}

/** Single-source shortest path (node-weighted, same cost model as the
 * game: you pay need_exploration_point per node you activate, source
 * itself costs 0). Linear-scan Dijkstra - fine at ~1000 nodes. */
export function dijkstra(
  graph: Record<string, DijkstraNode>,
  from: number,
): Map<number, number> {
  const dist = new Map<number, number>();
  const start = graph[String(from)];
  if (!start) return dist;
  dist.set(start.waypoint_key, 0);
  const visited = new Set<number>();
  const frontier = new Set<number>([start.waypoint_key]);
  while (frontier.size > 0) {
    let current: number | null = null;
    let currentDist = Infinity;
    for (const id of Array.from(frontier)) {
      const d = dist.get(id) ?? Infinity;
      if (d < currentDist) {
        currentDist = d;
        current = id;
      }
    }
    if (current === null) break;
    frontier.delete(current);
    if (visited.has(current)) continue;
    visited.add(current);
    const node = graph[String(current)];
    if (!node) continue;
    for (const neighborId of node.link_list) {
      if (visited.has(neighborId)) continue;
      const neighbor = graph[String(neighborId)];
      if (!neighbor) continue;
      const candidate = currentDist + neighbor.need_exploration_point;
      const existing = dist.get(neighborId);
      if (existing === undefined || candidate < existing) {
        dist.set(neighborId, candidate);
        frontier.add(neighborId);
      }
    }
  }
  return dist;
}

export function estimateBaseCosts(
  graph: Record<string, DijkstraNode>,
  nodeIds: number[],
  towns: BaseTownInfo[],
): BaseEstimate[] {
  const targets = nodeIds.filter((id) => graph[String(id)]);
  const out: BaseEstimate[] = [];
  for (const town of towns) {
    const dist = dijkstra(graph, town.id);
    let estCp = 0;
    let covered = 0;
    for (const id of targets) {
      const d = dist.get(id);
      if (d !== undefined) {
        estCp += d;
        covered += 1;
      }
    }
    out.push({ townId: town.id, name: town.name, isWarehouse: town.isWarehouse, estCp, covered });
  }
  // Most targets reachable first, then cheapest, warehouse wins ties.
  out.sort(
    (a, b) =>
      b.covered - a.covered || a.estCp - b.estCp || Number(b.isWarehouse) - Number(a.isWarehouse),
  );
  return out;
}
