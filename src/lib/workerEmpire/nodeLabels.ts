// Shared node-label helpers for the Worker Empire views. Extracted from
// WorkerEmpireView so the EmpireWizard can parse the exact same inputs
// ("Name (#id)" datalist labels, bare numeric ids, exact names) without
// duplicating the logic and drifting apart.

export interface LabeledNode {
  waypoint_key: number;
  name: string | null;
}

// "Name (#id)" is what the datalist shows and what typing resolves back to
// an id from - avoids needing a custom autocomplete component for 1025
// options, and keeps numeric-id entry working too (typed input that parses
// as a bare number and matches a real node is accepted as a fallback).
export function parseNodeInput(raw: string, graph: Record<string, LabeledNode>): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withHash = trimmed.match(/#(\d+)\)?\s*$/);
  if (withHash) {
    const id = Number(withHash[1]);
    return graph[String(id)] ? id : null;
  }
  if (/^\d+$/.test(trimmed)) {
    const id = Number(trimmed);
    return graph[String(id)] ? id : null;
  }
  // Exact name match (case-insensitive) as a last resort, for anyone who
  // types the name without picking from the datalist.
  const lower = trimmed.toLowerCase();
  const match = Object.values(graph).find((n) => n.name?.toLowerCase() === lower);
  return match ? match.waypoint_key : null;
}

export function nodeLabel(node: LabeledNode): string {
  return node.name ? `${node.name} (#${node.waypoint_key})` : `#${node.waypoint_key}`;
}
