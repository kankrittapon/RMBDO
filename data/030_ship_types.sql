-- Trade ships
-- Sources: BDFoundry Ships Guide (https://www.blackdesertfoundry.com/ships-guide/),
-- BDFoundry Epheria Sailboat/Caravel Guide (https://www.blackdesertfoundry.com/epheria-sailboat-and-caravel-guide/),
-- BDFoundry Epheria Frigate/Galleass Guide (https://www.blackdesertfoundry.com/epheria-frigate-and-galleass-guide/),
-- GrumpyG Sailboat vs Frigate (https://grumpygreen.cricket/bdo-epheria-sailboat-vs-frigate/).
-- Exact numeric stats (speed/accel/turn/durability) vary by enhancement level in-game and were not
-- confidently pinned to single numbers -> left NULL where uncertain; cargo/cannon slot counts are
-- from guide text and reasonably confident.

INSERT INTO ship_types
  (name, category, cargo_slots, max_speed, accel, turn_speed, durability, cannon_slots, can_deep_sea,
   crafting_material_summary, build_location, gear_slots, prerequisite_ship, notes)
VALUES
('Bartali Sailboat', 'Fishing Boat', 8, NULL, NULL, NULL, NULL, 0, FALSE,
 'Bought with silver, no crafting required.', 'Any wharf (purchase)', NULL, NULL,
 'Entry-level boat, used for early fishing and small cargo runs. Not deep-sea capable.'),
('Epheria Sailboat', 'Trade Ship', 12, NULL, NULL, NULL, NULL, 0, TRUE,
 'Requires Epheria Sailboat design + timber/plywood/ingot materials from Epheria Wharf quest chain.', 'Epheria Wharf', NULL, NULL,
 'First craftable ocean-capable ship; base of the trade line, upgrades into Improved Sailboat / Epheria Caravel.'),
('Epheria Caravel', 'Trade Ship', 30, NULL, NULL, NULL, NULL, 2, TRUE,
 'Upgrade material from Epheria Sailboat + additional Epheria Wharf materials/design.', 'Epheria Wharf', NULL, 'Epheria Sailboat',
 'High cargo (30 slots / ~10,000 LT) trade-line ship, recommended for Bartering and general trading. Has light cannons but primarily a trade hull.'),
('Epheria Frigate', 'Trade Ship', 18, NULL, NULL, NULL, NULL, 4, TRUE,
 'Requires Epheria Sailboat design + combat-line materials from Epheria Wharf quest chain.', 'Epheria Wharf', NULL, 'Epheria Sailboat',
 'Combat-line ship, more cannons and better handling than Caravel but less cargo. Upgrades into Improved Frigate / Epheria Galleass.'),
('Epheria Galleass', 'Guild Galleass', 20, NULL, NULL, NULL, NULL, 8, TRUE,
 'Upgrade from Epheria Frigate + additional materials/design.', 'Epheria Wharf', NULL, 'Epheria Frigate',
 '4 cannons per side (8 total), stores ~600 cannonballs when refueled at wharf manager. Best combat-line ship before Carrack; used for naval combat / sea monster hunting / guild galleys.'),
('Carrack (Advance)', 'Carrack', NULL, NULL, NULL, NULL, NULL, NULL, TRUE,
 'Endgame ship, built at O''draxxia wharf with high-tier materials (Cox/Offin ingredients, imperfect materials etc.).', 'O''draxxia', NULL, NULL,
 'Advance variant balances cargo and combat; exact stat numbers not confidently retrieved this session, verify on BDFoundry/garmoth before use.'),
('Carrack (Balance)', 'Carrack', NULL, NULL, NULL, NULL, NULL, NULL, TRUE,
 'Endgame ship, built at O''draxxia wharf.', 'O''draxxia', NULL, NULL,
 'Balance variant - general purpose endgame ship. Stats not confidently retrieved this session.'),
('Carrack (Volante)', 'Carrack', NULL, NULL, NULL, NULL, NULL, NULL, TRUE,
 'Endgame ship, built at O''draxxia wharf.', 'O''draxxia', NULL, NULL,
 'Volante variant - speed/cargo-focused endgame ship. Stats not confidently retrieved this session.');
