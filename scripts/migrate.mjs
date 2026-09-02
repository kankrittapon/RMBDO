// Applies schema/schema.sql then every data/*.sql (in filename order) to the
// Postgres database at DIRECT_URL (falls back to DATABASE_URL). Idempotent
// re-runs are NOT supported yet - schema.sql uses plain CREATE TABLE, so
// re-running against a database that already has the tables will error.
// That's intentional for now: this is meant for a fresh Supabase project.
// TODO once the schema stabilizes: switch to CREATE TABLE IF NOT EXISTS /
// a real migration tool, and make data/*.sql use ON CONFLICT DO UPDATE
// instead of plain INSERT so re-collection can be re-applied safely.

import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import pg from "pg"

// Prefer DATABASE_URL (Supavisor pooler, port 6543) over DIRECT_URL: Supabase's
// direct connection (db.<ref>.supabase.co:5432) resolves IPv6-only, which
// times out on networks without outbound IPv6 (confirmed on this machine -
// `connect ETIMEDOUT` on a 2406:... address). The pooler supports IPv4 and
// works fine for plain, unparameterized SQL like schema.sql/data/*.sql.
const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL
if (!connectionString) {
  console.error("Set DATABASE_URL in .env first - see .env.example.")
  process.exit(1)
}

const client = new pg.Client({ connectionString })

async function run() {
  await client.connect()
  console.log(`Connected. Applying schema/schema.sql ...`)
  await client.query(readFileSync(join("schema", "schema.sql"), "utf8"))

  const dataDir = "data"
  const files = readdirSync(dataDir)
    .filter((f) => f.endsWith(".sql"))
    .sort()

  for (const file of files) {
    console.log(`Applying data/${file} ...`)
    const sql = readFileSync(join(dataDir, file), "utf8")
    await client.query(sql)
  }

  console.log(`Done. Applied schema.sql + ${files.length} data file(s).`)
  await client.end()
}

run().catch(async (err) => {
  console.error("Migration failed:", err.message)
  await client.end().catch(() => {})
  process.exit(1)
})
