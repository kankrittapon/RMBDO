// Suggests the cheapest-to-reach plantzone nodes from a given base town,
// using a node-weighted Dijkstra over the same graph the WASM solver uses
// (public/data/bdo-node-graph.json). This is deliberately a separate, plain
// TypeScript implementation rather than a call into the WASM solver -
// solveForTerminalPairs answers "connect these specific pairs as cheaply as
// possible" (a Steiner-forest problem), not "what's near me and worth
// grabbing" (a single-source shortest-path ranking). Reusing the WASM
// solver for this would mean solving N separate one-pair problems just to
// rank candidates, which is both semantically wrong (Steiner-forest sharing
// logic doesn't apply to a single source) and slower than one Dijkstra pass.

export interface SuggestGraphNode {
  waypoint_key: number;
  is_plantzone: boolean;
  is_base_town: boolean;
  need_exploration_point: number;
  link_list: number[];
  name: string | null;
  worker_types: number[];
}

export interface NodeSuggestion {
  waypointKey: number;
  name: string | null;
  cpCost: number;
  hops: number;
  workerTypeCount: number;
}

/** Cost to "reach" a node = sum of need_exploration_point along the path,
 * excluding the source itself (you already own the base town, cost 0) -
 * matches how CP actually works in-game: you pay per node you activate. */
export function suggestNearestPlantzones(
  graph: Record<string, SuggestGraphNode>,
  fromWaypointKey: number,
  limit = 10,
): NodeSuggestion[] {
  const start = graph[String(fromWaypointKey)];
  if (!start) return [];

  const dist = new Map<number, number>();
  const hops = new Map<number, number>();
  dist.set(start.waypoint_key, 0);
  hops.set(start.waypoint_key, 0);

  // Simple binary-heap-free Dijkstra (linear scan for the min each round) -
  // the graph is ~1000 nodes, this runs in well under a frame, no need for
  // a priority queue dependency for this scale.
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
      const edgeCost = neighbor.need_exploration_point;
      const candidateDist = currentDist + edgeCost;
      const existing = dist.get(neighborId);
      if (existing === undefined || candidateDist < existing) {
        dist.set(neighborId, candidateDist);
        hops.set(neighborId, (hops.get(current) ?? 0) + 1);
        frontier.add(neighborId);
      }
    }
  }

  const candidates: NodeSuggestion[] = [];
  for (const [id, cost] of Array.from(dist.entries())) {
    if (id === start.waypoint_key) continue;
    const node = graph[String(id)];
    if (!node || !node.is_plantzone) continue;
    candidates.push({
      waypointKey: id,
      name: node.name,
      cpCost: cost,
      hops: hops.get(id) ?? 0,
      workerTypeCount: node.worker_types.length,
    });
  }

  candidates.sort((a, b) => a.cpCost - b.cpCost || b.workerTypeCount - a.workerTypeCount);
  return candidates.slice(0, limit);
}
