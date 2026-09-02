-- Knowledge guide
-- Source: general BDO game knowledge (Knowledge/Adventure Log system is stable and well-documented);
-- no single authoritative page was fetched this session for exact energy_reward numbers -> left NULL
-- except widely-cited figures.

INSERT INTO knowledge_categories (name) VALUES
('Adventure Log'),
('Sub Story'),
('Life'),
('Battle'),
('Order/Others');

INSERT INTO knowledge_entries (category_id, name, energy_reward, xp_reward, prerequisite_knowledge_id, how_to_obtain, region_id, notes) VALUES
((SELECT id FROM knowledge_categories WHERE name = 'Adventure Log'), 'Balenos Adventure Log', NULL, NULL, NULL,
 'Complete the Balenos regional main questline; unlocks a batch of knowledge on completion.', (SELECT id FROM regions WHERE name = 'Balenos'),
 'High priority for new players - Adventure Log completion grants permanent max energy increases.'),
((SELECT id FROM knowledge_categories WHERE name = 'Adventure Log'), 'Serendia Adventure Log', NULL, NULL, NULL,
 'Complete the Serendia regional main questline.', (SELECT id FROM regions WHERE name = 'Serendia'), 'Increases max energy on completion.'),
((SELECT id FROM knowledge_categories WHERE name = 'Adventure Log'), 'Calpheon Adventure Log', NULL, NULL, NULL,
 'Complete the Calpheon regional main questline.', (SELECT id FROM regions WHERE name = 'Calpheon'), 'Increases max energy on completion.'),
((SELECT id FROM knowledge_categories WHERE name = 'Adventure Log'), 'Mediah Adventure Log', NULL, NULL, NULL,
 'Complete the Mediah regional main questline.', (SELECT id FROM regions WHERE name = 'Mediah'), 'Increases max energy on completion.'),
((SELECT id FROM knowledge_categories WHERE name = 'Adventure Log'), 'Valencia Adventure Log', NULL, NULL, NULL,
 'Complete the Valencia regional main questline.', (SELECT id FROM regions WHERE name = 'Valencia'), 'Increases max energy on completion.'),
((SELECT id FROM knowledge_categories WHERE name = 'Life'), 'Basic Life Skill Knowledge Set', NULL, NULL, NULL,
 'Talk to life-skill related NPCs (fishing, cooking, alchemy, trading vendors) to unlock small knowledge entries.', NULL,
 'Cheap early energy gains, do this while walking between towns; exact entry list not enumerated, low confidence on completeness.'),
((SELECT id FROM knowledge_categories WHERE name = 'Battle'), 'Monster Knowledge (Grind Zone Monsters)', NULL, NULL, NULL,
 'Deal a threshold amount of damage to / kill a monster family enough times; knowledge unlocks automatically.', NULL,
 'Passively unlocked while grinding; prioritize the grind spot you are actively leveling at rather than farming specific monsters for knowledge.'),
((SELECT id FROM knowledge_categories WHERE name = 'Order/Others'), 'NPC Acquaintance Knowledge', NULL, NULL, NULL,
 'Talk to town NPCs (dialogue options) across each region; cheap, low-effort knowledge/energy source.', NULL,
 'Recommended as a background task while running errands - talk to every NPC once when passing through a new town.'),
((SELECT id FROM knowledge_categories WHERE name = 'Sub Story'), 'Black Spirit Adventure Sub-Stories', NULL, NULL, NULL,
 'Complete optional Black Spirit side-quest chains that appear periodically.', NULL,
 'Lower priority than Adventure Log for new players but grants extra energy/XP; specific entries not enumerated this session.');
