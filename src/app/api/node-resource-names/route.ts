import { NextResponse } from "next/server"
import { getPool } from "@/lib/db/pool"

// Full distinct list of verified worker-node yield names (node_resources).
// Small (~241 names) - lets the client label "Worker Node" ONLY on proof
// instead of guessing from regexes (which mislabeled farm produce like
// Tomato/Cabbage/Onion that no node actually yields). Fail-open: [] means
// the client falls back to its map + heuristics.
export async function GET() {
  try {
    const pool = getPool()
    const { rows } = await pool.query(
      `SELECT DISTINCT resource_name FROM node_resources ORDER BY resource_name`,
    )
    return NextResponse.json({ names: rows.map((r) => r.resource_name as string) })
  } catch (err) {
    console.error("GET /api/node-resource-names failed:", err)
    return NextResponse.json({ names: [], error: "db unavailable" }, { status: 200 })
  }
}
