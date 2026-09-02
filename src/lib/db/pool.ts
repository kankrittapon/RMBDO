import { Pool } from "pg"

let pool: Pool | undefined

/** Shared Postgres pool for server-side code (API routes, RSC data loaders,
 * intelligence engine functions). Reads DATABASE_URL - see .env.example. */
export function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set - copy .env.example to .env and fill it in.")
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL })
  }
  return pool
}
