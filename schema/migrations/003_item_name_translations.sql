-- Migration 003 — Thai item-name translations (2026-09-08).
-- One table keyed by EXACT English name (same exact-match discipline as
-- sub-recipe resolution): en_name -> th_name with provenance. No translation
-- is ever guessed - a missing row means "show English", never a blank or a
-- machine-translated guess. Sources: bdocodex /th/ pages (same item IDs as
-- /us/, e.g. 7704 = Top-quality Cooking Honey = น้ำผึ้งคุณภาพสูง...), and
-- bdolytics /th/ detail pages via Playwright (same slugs, incremental).
-- Self-contained and re-runnable (IF NOT EXISTS). Keep in sync with the
-- matching block appended to schema/schema.sql (fresh-install path).

CREATE TABLE IF NOT EXISTS item_name_translations (
    en_name       TEXT PRIMARY KEY,               -- exact English name as stored elsewhere
    th_name       TEXT NOT NULL,                  -- Thai name from codex (never null, never guessed)
    source        TEXT NOT NULL,                  -- 'bdocodex-th' | 'bdolytics-th'
    source_url    TEXT,                           -- page the translation was read from
    collected_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_item_name_translations_th ON item_name_translations(th_name);
