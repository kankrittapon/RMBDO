-- Regions & towns
-- Sources: general BDO game knowledge (regions/towns are stable, well-documented facts),
-- cross-checked against garmoth.com / bdocodex.com naming conventions.

INSERT INTO regions (name, name_th, description) VALUES
('Balenos', NULL, 'Starting region, southwest continent. Velia, Olvia, farmland areas.'),
('Serendia', NULL, 'Central region around Heidel, largest early-mid game region.'),
('Calpheon', NULL, 'Trade capital region, Calpheon City and surrounding territory.'),
('Mediah', NULL, 'Desert-adjacent region east of Calpheon, Altinova capital.'),
('Valencia', NULL, 'Desert region further east, Valencia City, oasis towns.'),
('Kamasylvia', NULL, 'Elven/druid forest region northwest, Grana and Ynix Garden.'),
('Drieghan', NULL, 'Mountainous northern region, Duvencrune, dragon lore.'),
('Land of the Morning Light', NULL, 'Asian-themed region (Odyllita/Nampo Sea etc.), separate story arc.'),
('Everfrost (Mountain of Eternal Winter)', NULL, 'Snow region, own story arc, gateway to O''draxxia.'),
('O''draxxia', NULL, 'Endgame jungle region beyond Everfrost.'),
('Margoria / Ross Sea', NULL, 'Open ocean regions used for deep-sea fishing, barter, sea monster hunting.'),
('Eastern Continent (Growlgas Rift / Sherekhan)', NULL, 'Newer endgame open-world region; low confidence on exact scope.');

-- Towns; region_id resolved via subquery for FK safety.
INSERT INTO towns (name, region_id, is_capital, has_worker_exchange, has_wharf, coord_x, coord_y, notes) VALUES
('Velia', (SELECT id FROM regions WHERE name = 'Balenos'), FALSE, TRUE, TRUE, NULL, NULL, 'Main starting hub, has wharf for fishing boats and trade ships.'),
('Olvia', (SELECT id FROM regions WHERE name = 'Balenos'), FALSE, FALSE, FALSE, NULL, NULL, 'Tutorial-adjacent town, low level grind nearby.'),
('Heidel', (SELECT id FROM regions WHERE name = 'Serendia'), TRUE, TRUE, FALSE, NULL, NULL, 'Serendia capital, major worker exchange hub.'),
('Glish', (SELECT id FROM regions WHERE name = 'Serendia'), FALSE, TRUE, FALSE, NULL, NULL, NULL),
('Calpheon City', (SELECT id FROM regions WHERE name = 'Calpheon'), TRUE, TRUE, FALSE, NULL, NULL, 'Trade hub, largest city, no wharf itself.'),
('Trent', (SELECT id FROM regions WHERE name = 'Calpheon'), FALSE, TRUE, TRUE, NULL, NULL, 'Coastal town near Calpheon with wharf.'),
('Altinova', (SELECT id FROM regions WHERE name = 'Mediah'), TRUE, TRUE, TRUE, NULL, NULL, 'Mediah capital, has wharf.'),
('Muiquun', (SELECT id FROM regions WHERE name = 'Mediah'), FALSE, FALSE, TRUE, NULL, NULL, 'Small wharf town, low confidence on exact worker exchange flag.'),
('Valencia City', (SELECT id FROM regions WHERE name = 'Valencia'), TRUE, TRUE, FALSE, NULL, NULL, 'Valencia capital, desert trade hub.'),
('Iliya Island', (SELECT id FROM regions WHERE name = 'Valencia'), FALSE, FALSE, TRUE, NULL, NULL, 'Ship wharf island off Valencia coast.'),
('Grana', (SELECT id FROM regions WHERE name = 'Kamasylvia'), TRUE, TRUE, FALSE, NULL, NULL, 'Kamasylvia capital.'),
('Duvencrune', (SELECT id FROM regions WHERE name = 'Drieghan'), TRUE, TRUE, FALSE, NULL, NULL, 'Drieghan capital.'),
('Epheria', (SELECT id FROM regions WHERE name = 'Mediah'), FALSE, FALSE, TRUE, NULL, NULL, 'Epheria Wharf - primary ship building location; region assignment approximate, verify.'),
('Port Ratt', (SELECT id FROM regions WHERE name = 'Calpheon'), FALSE, FALSE, TRUE, NULL, NULL, NULL),
('O''draxxia (settlement)', (SELECT id FROM regions WHERE name = 'O''draxxia'), FALSE, FALSE, TRUE, NULL, NULL, 'Endgame Carrack building location; exact town name low confidence.');
