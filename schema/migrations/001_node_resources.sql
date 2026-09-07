-- Migration 001 — Worker node yields (Phase 1, 2026-09-08).
-- Self-contained and re-runnable (IF NOT EXISTS everywhere), because
-- scripts/migrate.mjs + schema.sql only work on a FRESH database.
-- Apply with: npm run import:nodes  (the importer runs this file first)
-- Source data: vendor/workerman/ (shrddr/workermanjs@c2ae3c2, see ATTRIBUTION.md).
-- NOTE: keep in sync with the matching block appended to schema/schema.sql
-- (fresh-install path). If you change one, change the other.

CREATE TABLE IF NOT EXISTS node_meta (
    waypoint_key  INT PRIMARY KEY,               -- same id as public/data/bdo-node-graph.json
    name          TEXT,                          -- English node name (from our graph, explore.csv merge)
    parent_key    INT,                           -- parent node id (workerman plantzone.parent)
    kind          INT,                           -- workerman node kind (4/6/7/8/14/15 = workable)
    cp_cost       NUMERIC NOT NULL DEFAULT 0,    -- need_exploration_point, mirrors the WASM solver graph
    source        TEXT NOT NULL DEFAULT 'workerman@c2ae3c2',
    collected_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per (node, item, drop kind). Quantities are workerman's OBSERVED
-- expected yields per work cycle (plantzone_drops.json), NOT guarantees:
-- unlucky = base table, lucky = rare procs, unlucky_gi = giant-worker variant.
-- Prices are deliberately NOT stored here - they come from market_items
-- (live) at query time, so a stale price never hides inside this table.
CREATE TABLE IF NOT EXISTS node_resources (
    id              SERIAL PRIMARY KEY,
    waypoint_key    INT NOT NULL REFERENCES node_meta(waypoint_key) ON DELETE CASCADE,
    resource_item_id INT,                         -- workerman item id (e.g. 5960); NULL only if name-only
    resource_name   TEXT NOT NULL,                -- English name (loc en.item, e.g. 'Trace of Nature')
    quantity        NUMERIC NOT NULL,             -- expected qty per cycle for this drop kind
    drop_kind       TEXT NOT NULL,                -- 'unlucky' | 'lucky' | 'unlucky_gi'
    workload        INT,                          -- workerman workload for this node (higher = slower cycles)
    region_group    INT,                          -- productivity region group
    source          TEXT NOT NULL DEFAULT 'workerman@c2ae3c2',
    collected_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (waypoint_key, resource_item_id, drop_kind),
    CHECK (drop_kind IN ('unlucky', 'lucky', 'unlucky_gi'))
);

CREATE INDEX IF NOT EXISTS idx_node_resources_waypoint ON node_resources(waypoint_key);
CREATE INDEX IF NOT EXISTS idx_node_resources_item ON node_resources(resource_item_id);
CREATE INDEX IF NOT EXISTS idx_node_resources_name ON node_resources(resource_name);
