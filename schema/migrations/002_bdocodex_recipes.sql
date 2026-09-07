-- Migration 002 — bdocodex supplemental recipes (2026-09-08).
-- Separate tables on purpose: bdocodex rows must NEVER look like bdolytics
-- rows. Different trust level (static ingredient lists, verified once by
-- hand against the live page - not a maintained calculator feed) and a
-- different data shape (no Silver/Hour, no mastery-personalized profit, no
-- recipe_slug - bdocodex uses plain numeric IDs, e.g. 225 = Sweet Honey Wine).
-- Self-contained and re-runnable (IF NOT EXISTS). Apply with:
--   npm run collect:bdocodex -- <id> [category]
-- (the scraper runs this file first). Keep in sync with the matching block
-- appended to schema/schema.sql (fresh-install path).

CREATE TABLE IF NOT EXISTS bdocodex_recipes (
    bdocodex_id     INT PRIMARY KEY,              -- bdocodex numeric ID, e.g. 225
    recipe_name     TEXT NOT NULL,
    category        TEXT NOT NULL,                -- 'Cooking', 'Alchemy', ...
    skill_level     TEXT,                         -- e.g. 'Beginner 1' (as shown, never parsed into a number)
    exp             TEXT,                         -- e.g. '1''200' (as shown, never parsed)
    icon_url        TEXT,                         -- hotlinked https://bdocodex.com/items/... (stored as-is, see market_items precedent)
    source_url      TEXT NOT NULL,                -- https://bdocodex.com/us/recipe/<id>/
    collected_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No profit/price columns by design: bdocodex exposes no profitability
-- computation, only static ingredient lists. unit_price/total_cost below
-- stay NULL (shown as "no price", never guessed) unless a future pass
-- resolves them against our own market_items.
CREATE TABLE IF NOT EXISTS bdocodex_recipe_ingredients (
    id              SERIAL PRIMARY KEY,
    bdocodex_id     INT NOT NULL REFERENCES bdocodex_recipes(bdocodex_id) ON DELETE CASCADE,
    item_id         INT,                          -- bdocodex numeric item id, e.g. 7704
    ingredient_name TEXT NOT NULL,
    quantity        NUMERIC NOT NULL,
    is_base         BOOLEAN NOT NULL DEFAULT FALSE, -- data-tiptype="recipekey": base ingredient, cannot substitute
    icon_url        TEXT,
    collected_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (bdocodex_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_bdocodex_recipes_category ON bdocodex_recipes(category);
CREATE INDEX IF NOT EXISTS idx_bdocodex_ingredients_recipe ON bdocodex_recipe_ingredients(bdocodex_id);
