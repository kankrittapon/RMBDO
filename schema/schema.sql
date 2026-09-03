-- =========================================================
-- RMBDO (Road Map BDO) — PostgreSQL schema
-- Purpose: personal knowledge base for a Black Desert Online
-- "new player roadmap", queryable later by a Discord bot.
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

-- ---------------------------------------------------------
-- Reference / lookup tables
-- ---------------------------------------------------------

CREATE TABLE regions (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,        -- e.g. 'Balenos', 'Serendia', 'Mediah', 'Valencia'
    name_th     TEXT,                        -- Thai name if known
    description TEXT
);

CREATE TABLE towns (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,        -- e.g. 'Velia', 'Heidel', 'Altinova'
    region_id   INT REFERENCES regions(id),
    is_capital  BOOLEAN DEFAULT FALSE,
    has_worker_exchange BOOLEAN DEFAULT FALSE,
    has_wharf   BOOLEAN DEFAULT FALSE,        -- ท่าเรือ
    coord_x     NUMERIC,                      -- in-game map coordinate, if tracked
    coord_y     NUMERIC,
    notes       TEXT
);

-- ---------------------------------------------------------
-- Life skill: Fishing
-- ---------------------------------------------------------

CREATE TABLE fishing_spots (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    region_id       INT REFERENCES regions(id),
    is_hotspot      BOOLEAN DEFAULT FALSE,     -- ฮอตสปอต (fishing spot with schooling icon)
    is_deep_sea     BOOLEAN DEFAULT FALSE,     -- ต้องใช้เรือ/deep sea
    is_deepest_point BOOLEAN DEFAULT FALSE,    -- จุดลึกสุดของโซนนี้
    has_red_fish    BOOLEAN DEFAULT FALSE,     -- ได้ปลาแดง (ปลาเกรดพิเศษ)
    coord_x         NUMERIC,
    coord_y         NUMERIC,
    source_url      TEXT,                      -- reference link (bdolytics/map etc.)
    notes           TEXT
);

CREATE TABLE fish_species (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    name_th     TEXT,
    grade       TEXT,                          -- e.g. 'Red', 'Gold', 'Blue', 'Common'
    sells_for   INT,
    used_for    TEXT                            -- cooking / alchemy / trade / knowledge
);

CREATE TABLE fishing_spot_fish (
    fishing_spot_id INT REFERENCES fishing_spots(id) ON DELETE CASCADE,
    fish_species_id INT REFERENCES fish_species(id) ON DELETE CASCADE,
    PRIMARY KEY (fishing_spot_id, fish_species_id)
);

-- ---------------------------------------------------------
-- Trading: ships, wharfs, exchange routes
-- ---------------------------------------------------------

CREATE TABLE ship_types (
    id                  SERIAL PRIMARY KEY,
    name                TEXT NOT NULL UNIQUE,   -- e.g. 'Bartali Sailboat', 'Epheria Sailboat', 'Epheria Caravel', 'Epheria Frigate', 'Carrack (Advance/Balance/Volante)'
    category            TEXT,                    -- 'Fishing Boat', 'Trade Ship', 'Guild Galleass', 'Carrack'
    cargo_slots         INT,
    max_speed           NUMERIC,
    accel               NUMERIC,
    turn_speed          NUMERIC,
    durability           INT,
    cannon_slots        INT,
    can_deep_sea        BOOLEAN DEFAULT FALSE,
    crafting_material_summary TEXT,             -- short summary; full BOM goes in materials table
    build_location      TEXT,                    -- e.g. 'Epheria Wharf', "O'draxxia"
    gear_slots          INT,
    prerequisite_ship   TEXT,                    -- e.g. must own Epheria Sailboat first
    notes               TEXT
);

CREATE TABLE wharfs (
    id          SERIAL PRIMARY KEY,
    town_id     INT REFERENCES towns(id),
    name        TEXT,
    can_dock_deep_sea BOOLEAN DEFAULT FALSE
);

CREATE TABLE trade_routes (
    id              SERIAL PRIMARY KEY,
    name            TEXT,
    from_town_id    INT REFERENCES towns(id),
    to_town_id      INT REFERENCES towns(id),
    by_sea          BOOLEAN DEFAULT FALSE,
    goods_summary   TEXT,
    notes           TEXT
);

-- ---------------------------------------------------------
-- Horses / mounts
-- ---------------------------------------------------------

CREATE TABLE horse_tiers (
    id              SERIAL PRIMARY KEY,
    tier            TEXT NOT NULL,               -- 'T1'...'T9', 'Draft Horse', 'Pegasus' etc.
    base_speed      NUMERIC,
    base_accel      NUMERIC,
    base_turn       NUMERIC,
    base_brake      NUMERIC,
    notes           TEXT
);

-- ---------------------------------------------------------
-- Grind / hunting spots (PvE combat)
-- ---------------------------------------------------------

CREATE TABLE grind_spots (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    region_id       INT REFERENCES regions(id),
    recommended_ap  INT,
    recommended_dp  INT,
    min_level       INT,
    monster_family  TEXT,                        -- e.g. 'Sausan Garrison', 'Pila Ku Jail'
    notable_drops   TEXT,
    is_hunting_zone BOOLEAN DEFAULT FALSE,        -- true if primarily "hunting" (life skill hides/hunting) vs grind (combat XP/silver)
    coord_x         NUMERIC,
    coord_y         NUMERIC,
    source_url      TEXT,
    notes           TEXT
);

-- ---------------------------------------------------------
-- Knowledge (encyclopedia entries)
-- ---------------------------------------------------------

CREATE TABLE knowledge_categories (
    id      SERIAL PRIMARY KEY,
    name    TEXT NOT NULL UNIQUE               -- 'Adventure Log', 'Sub Story', 'Life', 'Battle', 'Order/Others'
);

CREATE TABLE knowledge_entries (
    id                  SERIAL PRIMARY KEY,
    category_id         INT REFERENCES knowledge_categories(id),
    name                TEXT NOT NULL,
    energy_reward       INT,
    xp_reward           BIGINT,
    prerequisite_knowledge_id INT REFERENCES knowledge_entries(id),
    how_to_obtain       TEXT,
    region_id           INT REFERENCES regions(id),
    notes               TEXT
);

-- ---------------------------------------------------------
-- Quests (main quest line the roadmap should walk through)
-- ---------------------------------------------------------

CREATE TABLE quest_chains (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    chain_type  TEXT,                            -- 'Main', 'Black Spirit', 'Family', 'Succession', 'Awakening', 'Guild', 'Life Skill'
    region_id   INT REFERENCES regions(id),
    order_index INT,                              -- suggested order in the roadmap
    notes       TEXT
);

CREATE TABLE quests (
    id                  SERIAL PRIMARY KEY,
    quest_chain_id      INT REFERENCES quest_chains(id),
    name                TEXT NOT NULL,
    order_in_chain      INT,
    recommended_level   INT,
    giver_npc           TEXT,
    town_id             INT REFERENCES towns(id),
    reward_summary      TEXT,
    is_required_for_roadmap BOOLEAN DEFAULT TRUE,
    notes               TEXT
);

-- ---------------------------------------------------------
-- Items checklist (things a new player needs to acquire)
-- ---------------------------------------------------------

CREATE TABLE item_categories (
    id      SERIAL PRIMARY KEY,
    name    TEXT NOT NULL UNIQUE                -- 'Costume', 'Life Tool', 'Ship Material', 'Gear', 'Consumable'
);

CREATE TABLE checklist_items (
    id              SERIAL PRIMARY KEY,
    category_id     INT REFERENCES item_categories(id),
    name            TEXT NOT NULL,
    quantity_needed INT DEFAULT 1,
    used_for        TEXT,                        -- e.g. 'Epheria Sailboat crafting', 'Fishing rod upgrade'
    how_to_obtain   TEXT,
    notes           TEXT
);

-- ---------------------------------------------------------
-- The roadmap itself: ordered steps for a new player,
-- each step can reference any of the tables above.
-- ---------------------------------------------------------

CREATE TABLE roadmap_stages (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,                  -- e.g. 'Stage 1: Level 1-50 Leveling', 'Stage 2: Life Skill Setup'
    order_index INT NOT NULL,
    description TEXT
);

CREATE TABLE roadmap_steps (
    id              SERIAL PRIMARY KEY,
    stage_id        INT REFERENCES roadmap_stages(id),
    order_index     INT NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    ref_table       TEXT,                        -- e.g. 'quests', 'fishing_spots', 'grind_spots'
    ref_id          INT,                          -- soft-reference to the row in ref_table (no FK, cross-table)
    is_optional     BOOLEAN DEFAULT FALSE
);

-- ---------------------------------------------------------
-- Central Market (for Buy-vs-Farm comparisons)
-- ---------------------------------------------------------

CREATE TABLE market_items (
    id              SERIAL PRIMARY KEY,
    item_name       TEXT NOT NULL,
    category        TEXT,                          -- e.g. 'Material', 'Alchemy Stone', 'Magic Crystal', 'Lightstone', 'Enhancement'
    region          TEXT NOT NULL DEFAULT 'Southeast Asia',
    price           BIGINT,
    volume_14d_avg  BIGINT,
    stock           BIGINT,
    collected_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (item_name, region)
);

CREATE INDEX idx_market_items_category ON market_items(category);
CREATE INDEX idx_market_items_name ON market_items(item_name);

-- ---------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------

CREATE INDEX idx_fishing_spots_region ON fishing_spots(region_id);
CREATE INDEX idx_fishing_spots_flags ON fishing_spots(is_hotspot, has_red_fish, is_deepest_point);
CREATE INDEX idx_grind_spots_region ON grind_spots(region_id);
CREATE INDEX idx_quests_chain ON quests(quest_chain_id);
CREATE INDEX idx_knowledge_category ON knowledge_entries(category_id);
CREATE INDEX idx_roadmap_steps_stage ON roadmap_steps(stage_id);
