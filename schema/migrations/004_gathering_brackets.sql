-- Migration 004 — gathering mastery brackets (2026-09-11).
-- Static game-math table (does not change with market/patches under normal
-- circumstances): per-mastery drop chance + amount multipliers for
-- common/special/rare/very-rare gathering yields. Sourced from
-- bdocodex.com/us/gatheringmastery/ (matches Garmoth + bdolytics tables).
-- Self-contained and re-runnable (IF NOT EXISTS). Keep in sync with the
-- matching block appended to schema/schema.sql (fresh-install path).

CREATE TABLE IF NOT EXISTS gathering_mastery_brackets (
    mastery             INT PRIMARY KEY,              -- 0..3000 step 50
    common_chance       NUMERIC NOT NULL,             -- fraction 0..1 (0.8 = 80%)
    common_amount       NUMERIC NOT NULL,             -- +fraction (0.16 = +16%)
    special_chance      NUMERIC NOT NULL,
    special_amount      NUMERIC NOT NULL,
    rare_chance         NUMERIC NOT NULL,
    rare_amount         NUMERIC NOT NULL,
    very_rare_chance    NUMERIC NOT NULL,
    very_rare_amount    NUMERIC NOT NULL,
    source              TEXT NOT NULL DEFAULT 'bdocodex-gatheringmastery',
    collected_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
