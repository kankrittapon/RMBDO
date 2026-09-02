-- Fishing spots
--
-- PRIMARY SOURCE (high confidence): user's own in-game bookmark export from
-- C:\Users\KANV9\Documents\Black Desert\UserCache\2247567\gameVariable.xml,
-- collected 2026-09-02 via bdolytics.com's map (search fish -> toggle off the
-- overlapping Depth 3 layer -> click the Depth 4 polygon -> BOOKMARK).
-- PosX/PosZ from the game's <WorldmapBookMark> XML map directly to coord_x/coord_y
-- (PosY is vertical height, always 0 for sea level, not stored).
-- These are all "Depth 4" zones = the deepest fishing tier per sea, i.e. exactly
-- the "จุดลึกสุด" the user asked for.
--
-- SECONDARY SOURCE (lower confidence, approximate): community guides
-- (BattleXO, BDFoundry, bdofish.com) for hotspot/coastal spots not covered
-- by the Depth 4 list above. Coordinates NOT confirmed -> left NULL.

INSERT INTO fish_species (name, name_th, grade, sells_for, used_for) VALUES
('Yellow Corvina', NULL, 'Prize', NULL, 'trade/cooking - common deep-sea prize fish'),
('Mudskipper', NULL, 'Prize', NULL, 'trade/cooking'),
('Blue Bat Star', NULL, 'Prize', NULL, 'trade/cooking'),
('Tripod Fish', NULL, 'Prize', NULL, 'trade/cooking'),
('Blobfish', NULL, 'Prize', NULL, 'trade/cooking'),
('Tilefish', NULL, 'Rare', NULL, 'trade - rare-tier deep sea fish'),
('Porcupine Fish', NULL, 'Rare', NULL, 'trade - rare-tier deep sea fish'),
('Coelacanth', NULL, 'Rare', NULL, 'trade - rare-tier deep sea fish, low drop rate'),
('Nibbler', NULL, 'Gold', NULL, 'cooking/trade'),
('Moray', NULL, 'Gold', NULL, 'cooking/trade'),
('Grunt', NULL, 'Gold', NULL, 'cooking/trade'),
('Prize Catfish', NULL, 'Red', NULL, 'trade - high value prize fish'),
('Old Man Fish', NULL, 'Red', NULL, 'trade - high value prize fish, river spots'),
('Blowfish', NULL, 'Blue', NULL, 'cooking (poison ingredient)');

-- Depth 4 (deepest tier) fishing zones - confirmed real coordinates.
-- region_id mapped only where the sea name confidently corresponds to an
-- existing region row; left NULL otherwise rather than guess.
INSERT INTO fishing_spots (name, region_id, is_hotspot, is_deep_sea, is_deepest_point, has_red_fish, coord_x, coord_y, source_url, notes) VALUES
('Arsha Sea - Depth 4', NULL, FALSE, TRUE, TRUE, TRUE, 217781, 270672,
  'https://bdolytics.com/en/map',
  'Confirmed via in-game bookmark export 2026-09-02. Region not confidently mapped - verify.'),
('Elsana Sea - Depth 4', NULL, FALSE, TRUE, TRUE, TRUE, -393407, -564844,
  'https://bdolytics.com/en/map',
  'Confirmed via in-game bookmark export 2026-09-02. Region not confidently mapped - verify.'),
('Eltro Sea - Depth 4', NULL, FALSE, TRUE, TRUE, TRUE, 347608, 470054,
  'https://bdolytics.com/en/map',
  'Confirmed via in-game bookmark export 2026-09-02. Region not confidently mapped - verify.'),
('Epheria Sea - Depth 4', (SELECT id FROM regions WHERE name = 'Mediah'), FALSE, TRUE, TRUE, TRUE, -409859, 139466,
  'https://bdolytics.com/en/map',
  'Confirmed via in-game bookmark export 2026-09-02. Near Epheria Wharf (Mediah region).'),
('Nox Sea - Depth 4', NULL, FALSE, TRUE, TRUE, TRUE, -2616, 349668,
  'https://bdolytics.com/en/map',
  'Confirmed via in-game bookmark export 2026-09-02. Region not confidently mapped - verify.'),
('Peyon Sea - Depth 4', NULL, FALSE, TRUE, TRUE, TRUE, -552134, 129748,
  'https://bdolytics.com/en/map',
  'Confirmed via in-game bookmark export 2026-09-02. Region not confidently mapped - verify.'),
('Serni Sea - Depth 4', NULL, FALSE, TRUE, TRUE, TRUE, -659084, -303811,
  'https://bdolytics.com/en/map',
  'Confirmed via in-game bookmark export 2026-09-02. Region not confidently mapped - verify.'),
('Ahrmo Sea - Depth 4', NULL, FALSE, TRUE, TRUE, TRUE, -351393, 241742,
  'https://bdolytics.com/en/map',
  'Confirmed via in-game bookmark export 2026-09-02. Region not confidently mapped - verify.'),
('Altinova Sea - Depth 4', (SELECT id FROM regions WHERE name = 'Mediah'), FALSE, TRUE, TRUE, TRUE, 402441, -125131,
  'https://bdolytics.com/en/map',
  'Confirmed via in-game bookmark export 2026-09-02 AND directly verified by clicking the zone in-browser: catch table = Prize Fish 9% (Yellow Corvina 73%, Mudskipper, Blue Bat Star, Blobfish), Rare Fish 9% (Tilefish, Porcupine Fish, Coelacanth), General Fish 86%, Treasure 6%. Bite time 40-90s.'),
('Banto Sea - Depth 4', NULL, FALSE, TRUE, TRUE, TRUE, -337133, 264885,
  'https://bdolytics.com/en/map',
  'Confirmed via in-game bookmark export 2026-09-02. Region not confidently mapped - verify.'),
('Cron Islands - Depth 4', (SELECT id FROM regions WHERE name = 'Calpheon'), FALSE, TRUE, TRUE, TRUE, 161746, 231208,
  'https://bdolytics.com/en/map',
  'Confirmed via in-game bookmark export 2026-09-02. Cron Castle area, Calpheon coast.'),
('Mediah Sea - Depth 4', (SELECT id FROM regions WHERE name = 'Mediah'), FALSE, TRUE, TRUE, TRUE, 329066, 36181,
  'https://bdolytics.com/en/map',
  'Confirmed via in-game bookmark export 2026-09-02.'),
('Sausan Islands - Depth 4', (SELECT id FROM regions WHERE name = 'Mediah'), FALSE, TRUE, TRUE, TRUE, 233125, 214722,
  'https://bdolytics.com/en/map',
  'Confirmed via in-game bookmark export 2026-09-02. Near Sausan Garrison, Mediah.'),
('Olvia Sea - Depth 4', (SELECT id FROM regions WHERE name = 'Balenos'), FALSE, TRUE, TRUE, TRUE, -249990, 247498,
  'https://bdolytics.com/en/map',
  'Confirmed via in-game bookmark export 2026-09-02.'),
('Valencia Sea - Depth 4', (SELECT id FROM regions WHERE name = 'Valencia'), FALSE, TRUE, TRUE, TRUE, 417056, 262584,
  'https://bdolytics.com/en/map',
  'Confirmed via in-game bookmark export 2026-09-02.'),
('Balenos Islands - Depth 4', (SELECT id FROM regions WHERE name = 'Balenos'), FALSE, TRUE, TRUE, TRUE, 13479, 172614,
  'https://bdolytics.com/en/map',
  'Confirmed via in-game bookmark export 2026-09-02.'),
('Zenato Sea - Depth 4', NULL, FALSE, TRUE, TRUE, TRUE, -266875, 456487,
  'https://bdolytics.com/en/map',
  'Confirmed via in-game bookmark export 2026-09-02. Region not confidently mapped - verify.');

-- Supplementary coastal/hotspot rows (lower confidence, no coordinates) --
INSERT INTO fishing_spots (name, region_id, is_hotspot, is_deep_sea, is_deepest_point, has_red_fish, coord_x, coord_y, source_url, notes) VALUES
('Velia Beach', (SELECT id FROM regions WHERE name = 'Balenos'), FALSE, FALSE, FALSE, TRUE, NULL, NULL,
  'https://community.battlexo.com/best-places-to-fish-in-black-desert/',
  'Reliable early prize-fish (red grade) spot, safe zone, southwest of NPC Crio. Good starter spot, not a hotspot.'),
('Mediah Coast (Altinova wharf area)', (SELECT id FROM regions WHERE name = 'Mediah'), TRUE, FALSE, FALSE, TRUE, NULL, NULL,
  'https://community.battlexo.com/best-places-to-fish-in-black-desert/',
  'Coastal hotspot near Altinova, accessible without deep-sea boat; moderate red fish chance.'),
('Bashim Base Riverside', (SELECT id FROM regions WHERE name = 'Valencia'), FALSE, FALSE, FALSE, TRUE, NULL, NULL,
  NULL,
  'River/inland fishing spot known for high-value fish like Old Man Fish in some guides; unverified in this session, low confidence, double-check location name.');

-- NOTE: "Hotspot" (schooling-fish icon) locations are NOT the same thing as
-- Depth 3/4 zones above and were not collected this pass - bdolytics does not
-- appear to track them as a separate discrete point layer either (only zone
-- polygons). If precise hotspot spawn points matter for RMBDO's route
-- planner, they likely need to come from in-game observation/community
-- video guides rather than bdolytics.
