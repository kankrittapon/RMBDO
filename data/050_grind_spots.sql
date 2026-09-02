-- Grind / hunting spots
-- Sources: GrumpyG Grinding Spots table (https://grumpygreen.cricket/bdo-grinding-spots/),
-- BDFoundry Leveling 1-61 Guide (https://www.blackdesertfoundry.com/leveling-1-60-guide/),
-- general BDO knowledge for well-established named zones (Sausan Garrison, Pila Ku, Aakman, etc.).
-- recommended_ap/dp figures are rough community rules-of-thumb and change with balance patches -> many left NULL.

INSERT INTO grind_spots (name, region_id, recommended_ap, recommended_dp, min_level, monster_family, notable_drops, is_hunting_zone, coord_x, coord_y, source_url, notes) VALUES
('Olvia Coast', (SELECT id FROM regions WHERE name = 'Balenos'), NULL, NULL, 1, 'Seagulls / Foxes / Imps', NULL, FALSE, NULL, NULL,
 'https://www.blackdesertfoundry.com/leveling-1-60-guide/', 'Very early leveling area near Olvia, weak monsters, good density for level 1-10.'),
('Glish Swamp', (SELECT id FROM regions WHERE name = 'Serendia'), NULL, NULL, 21, NULL, NULL, FALSE, NULL, NULL,
 'https://www.blackdesertfoundry.com/leveling-1-60-guide/', 'Leveling area recommended roughly level 21-25.'),
('Bloody Monastery', (SELECT id FROM regions WHERE name = 'Serendia'), NULL, NULL, 25, NULL, NULL, FALSE, NULL, NULL,
 'https://www.blackdesertfoundry.com/leveling-1-60-guide/', 'South of Glish, recommended roughly level 25-30.'),
('Sausan Garrison', (SELECT id FROM regions WHERE name = 'Serendia'), 130, 150, 45, 'Sausans', 'Black Stone, Sharp/Hard Black Crystal Shards, silver', FALSE, NULL, NULL,
 'https://grumpygreen.cricket/bdo-grinding-spots/', 'Classic mid-level grind spot, high monster density and solid loot; long-standing community favorite. AP/DP figures are rough community guidance, verify current values.'),
('Pila Ku Jail', (SELECT id FROM regions WHERE name = 'Mediah'), 150, 180, 50, 'Pila Ku', 'Black Stone, silver, Old Moon Guild materials', FALSE, NULL, NULL,
 NULL, 'Mediah-region grind spot popular for early-mid gear progression. AP/DP figures approximate, not confidently verified this session.'),
('Sycrakea', (SELECT id FROM regions WHERE name = 'Mediah'), 160, 200, 52, 'Sycrakea', 'Black Stone, Caphras-relevant drops', FALSE, NULL, NULL,
 NULL, 'Mediah grind zone; figures approximate, not confidently verified this session.'),
('Crescent Shrine', (SELECT id FROM regions WHERE name = 'Valencia'), 180, 230, 56, 'Crescent Order', 'Black Stone, Sharp Black Crystal Shard, silver', FALSE, NULL, NULL,
 'https://grumpygreen.cricket/bdo-grinding-spots/', 'Popular post-56 (awakened) grind spot in Valencia. AP/DP figures approximate community guidance.'),
('Hystria Ruins', (SELECT id FROM regions WHERE name = 'Valencia'), 190, 240, 58, 'Hystria', 'Black Stone, silver, low-tier accessory drops', FALSE, NULL, NULL,
 NULL, 'Valencia-region grind spot for early awakened characters; figures approximate.'),
('Aakman Temple', (SELECT id FROM regions WHERE name = 'Valencia'), 210, 270, 59, 'Aakman', 'Black Stone, Ancient Relic Crystal Shard, Tuvala gear drops', FALSE, NULL, NULL,
 'https://grumpygreen.cricket/bdo-grinding-spots/', 'Major endgame-entry grind spot, source of Tuvala gear progression via Ancient Relic Crystal Shards. Long-running community top pick.'),
('Manshaum Forest', (SELECT id FROM regions WHERE name = 'Valencia'), 220, 280, 60, 'Manshaum', 'Black Stone, Manshaum-specific accessories', FALSE, NULL, NULL,
 NULL, 'Higher-tier Valencia grind spot for well-geared level 60+ characters; figures approximate, not confidently verified this session.'),
-- Hunting zones (life skill hunting for hides/horns, not combat-XP grinding)
('Balenos Forest Deer Hunting Ground', (SELECT id FROM regions WHERE name = 'Balenos'), NULL, NULL, NULL, 'Deer', 'Deer hide, deer blood', TRUE, NULL, NULL,
 NULL, 'General deer hunting area used for hunting-lifeskill hides; specific named spot low confidence, verify exact location.'),
('Serendia Wolf Hunting Ground', (SELECT id FROM regions WHERE name = 'Serendia'), NULL, NULL, NULL, 'Wolves', 'Wolf hide, wolf meat', TRUE, NULL, NULL,
 NULL, 'General wolf hunting ground for life-skill hunting; specific named spot low confidence.'),
('Fogan Forest', (SELECT id FROM regions WHERE name = 'Balenos'), NULL, NULL, NULL, 'Fogans', 'Fogan hides / plant fiber', TRUE, NULL, NULL,
 NULL, 'Used for life-skill hunting of Fogans in Balenos; exact zone name/location low confidence, verify.');
