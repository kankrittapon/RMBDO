-- Checklist items: things a new player commonly needs to gather early
-- Source: general BDO community knowledge (AFK life-skill costume bonuses, ship mats, value pack are
-- extremely well-established mechanics). Exact quantities for ship materials NOT verified this session.

INSERT INTO item_categories (name) VALUES
('Costume'),
('Life Tool'),
('Ship Material'),
('Gear'),
('Consumable');

INSERT INTO checklist_items (category_id, name, quantity_needed, used_for, how_to_obtain, notes) VALUES
((SELECT id FROM item_categories WHERE name = 'Costume'), 'Fisher''s Clothes / Fishing Costume', 1, 'AFK fishing life-skill XP + catch rate bonus', 'Item shop (Pearl Shop) purchase, or occasional in-game event reward', 'Not required but strongly recommended before doing long AFK fishing sessions.'),
((SELECT id FROM item_categories WHERE name = 'Costume'), 'Sailor''s Clothes / Sailing Costume', 1, 'Sailing/barter life-skill bonus while on a ship', 'Item shop purchase', 'Improves barter success and sailing XP; optional quality-of-life item.'),
((SELECT id FROM item_categories WHERE name = 'Life Tool'), 'Fishing Rod (basic → upgraded)', 1, 'Fishing life skill', 'Bought from fishing NPC in any town; can be enhanced/upgraded over time', NULL),
((SELECT id FROM item_categories WHERE name = 'Life Tool'), 'Hoe / Sickle / Fluid Collector (gathering tools)', 1, 'Gathering life skill (farming, foraging)', 'Bought from tool vendor NPCs', 'Basic set needed to start gathering-based life skills.'),
((SELECT id FROM item_categories WHERE name = 'Life Tool'), 'Hunting Matchlock / Rifle', 1, 'Hunting life skill (hides, horns)', 'Crafted via Tools workshop or bought/blacksmith NPC', 'Needed before doing dedicated hunting-zone hides/horns collection.'),
((SELECT id FROM item_categories WHERE name = 'Ship Material'), 'Plywood Plank', NULL, 'Epheria Sailboat / Caravel / Frigate crafting', 'Processing (chopping timber then processing into plywood) or Epheria Wharf material exchange', 'Exact quantity needed per ship not confidently verified this session, check BDFoundry ship guide before crafting.'),
((SELECT id FROM item_categories WHERE name = 'Ship Material'), 'Adventurer''s/Old Ancient Ingot', NULL, 'Epheria-tier ship crafting', 'Trade/barter or processing chain', 'Quantity not confidently verified this session.'),
((SELECT id FROM item_categories WHERE name = 'Ship Material'), 'Ship Design: Epheria Sailboat/Caravel/Frigate', 1, 'Unlocking ability to craft respective ship', 'Reward from Epheria Wharf quest chain, or purchasable at high silver cost', 'One-time unlock per ship type, not consumed per build in the newer material system (verify current patch behavior).'),
((SELECT id FROM item_categories WHERE name = 'Gear'), 'PEN (V) starter accessories or TRI Tuvala gear', NULL, 'Baseline AP/DP to safely grind Serendia/Mediah spots', 'Aakman Ancient Relic Crystal Shard exchange, or market purchase', 'This row intentionally vague — actual gear progression depends heavily on class and playstyle, treat as a placeholder reminder rather than a fixed target.'),
((SELECT id FROM item_categories WHERE name = 'Consumable'), 'Value Pack', 1, 'Increased trade/sell profit, extra weight limit, more workers slots (Marketplace category), faster movement/fishing/etc.', 'Purchased from Pearl Shop with real money or Pearl Shop items via Central Market silver trade', 'Very commonly recommended as the first Pearl Shop purchase for new players; can often be bought with in-game silver via the Pearl item marketplace rather than real money.'),
((SELECT id FROM item_categories WHERE name = 'Consumable'), 'Elixir/Cooking food stockpile (basic buffs)', NULL, 'Combat buffs while grinding', 'Cooking life skill or Marketplace purchase', 'Quantity depends on grind session length; not a fixed number.');
