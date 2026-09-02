-- Quests: recommended main / Black Spirit quest chain for a brand-new player
-- Sources: BDFoundry Simplified Questline Guide (https://www.blackdesertfoundry.com/simplified-questline-guide/),
-- GrumpyG Simplified Main Quest (https://grumpygreen.cricket/simplified-main-quest/),
-- BDFoundry Beginner/Returning Player Guide (https://www.blackdesertfoundry.com/new-player-guide/),
-- general BDO knowledge. Exact per-quest giver_npc/town_id/reward_summary details were not individually
-- verified this session for most rows -> left NULL, only chain-level structure and order is asserted.

INSERT INTO quest_chains (name, chain_type, region_id, order_index, notes) VALUES
('Black Spirit Prologue & Tutorial', 'Main', (SELECT id FROM regions WHERE name = 'Balenos'), 1,
 'Character creation intro through first town; teaches basic UI/combat.'),
('Balenos Main Questline', 'Main', (SELECT id FROM regions WHERE name = 'Balenos'), 2,
 'Velia/Olvia questline, unlocks Balenos Adventure Log.'),
('Serendia Main Questline', 'Main', (SELECT id FROM regions WHERE name = 'Serendia'), 3,
 'Heidel-centered questline, continues story into Calpheon.'),
('Calpheon Main Questline', 'Main', (SELECT id FROM regions WHERE name = 'Calpheon'), 4,
 'Calpheon City arc; commonly cited as a natural "first major stopping point" for brand new players around level 50ish.'),
('Mediah Main Questline', 'Main', (SELECT id FROM regions WHERE name = 'Mediah'), 5,
 'Continues story into Altinova/Mediah after Calpheon.'),
('Succession or Awakening Questline', 'Awakening', NULL, 6,
 'Available from level 56 via Black Spirit Main quest tab; unlocks either Succession (base weapon path) or Awakening (awakening weapon) skill kit. Zone-story characters (Everfrost/Land of the Morning Light starts) must finish their own zone story + this chain first.'),
('Simplified Questline (Special Growth: Birth of a Prestigious Family)', 'Main', NULL, 7,
 'Fast-tracked catch-up questline for characters that skip early regional stories (e.g. via Season servers); starts from Black Spirit quest "[Special Growth] Birth of Prestigious Family". Recommended once base leveling/awakening is done to mop up remaining main-quest rewards efficiently.'),
('Valencia Main Questline', 'Main', (SELECT id FROM regions WHERE name = 'Valencia'), 8,
 'Post level-56 desert story arc, unlocks Valencia Adventure Log and higher-level grind zones.');

-- Individual quests: only structurally important milestone quests seeded; most granular quest steps
-- intentionally omitted (too many, and this project's roadmap_steps table is the intended place for
-- fine-grained per-player checklist steps).
INSERT INTO quests (quest_chain_id, name, order_in_chain, recommended_level, giver_npc, town_id, reward_summary, is_required_for_roadmap, notes) VALUES
((SELECT id FROM quest_chains WHERE name = 'Black Spirit Prologue & Tutorial'), 'Tutorial: Meeting the Black Spirit', 1, 1, NULL, NULL, NULL, TRUE, 'First quest after character creation.'),
((SELECT id FROM quest_chains WHERE name = 'Balenos Main Questline'), 'Reach Velia', 1, 1, NULL, (SELECT id FROM towns WHERE name = 'Velia'), NULL, TRUE, 'Opens up Velia hub and early life skills.'),
((SELECT id FROM quest_chains WHERE name = 'Serendia Main Questline'), 'Arrival in Heidel', 1, 15, NULL, (SELECT id FROM towns WHERE name = 'Heidel'), NULL, TRUE, 'Opens worker exchange and Serendia grind zones.'),
((SELECT id FROM quest_chains WHERE name = 'Calpheon Main Questline'), 'Arrival in Calpheon City', 1, 30, NULL, (SELECT id FROM towns WHERE name = 'Calpheon City'), NULL, TRUE, 'Major trade hub unlock; many guides treat this as the "real game starts here" milestone.'),
((SELECT id FROM quest_chains WHERE name = 'Succession or Awakening Questline'), 'Black Spirit: Succession/Awakening Trial', 1, 56, NULL, NULL, 'Succession or Awakening skill kit', TRUE, 'Pick one path per class rules; some classes have Ascension/Talent variants instead.'),
((SELECT id FROM quest_chains WHERE name = 'Simplified Questline (Special Growth: Birth of a Prestigious Family)'), '[Special Growth] Birth of Prestigious Family', 1, 56, 'Black Spirit', NULL, NULL, FALSE, 'Entry point of the catch-up Simplified Questline; optional depending on how the character reached 56.'),
((SELECT id FROM quest_chains WHERE name = 'Valencia Main Questline'), 'Arrival in Valencia City', 1, 56, NULL, (SELECT id FROM towns WHERE name = 'Valencia City'), NULL, TRUE, 'Unlocks desert region grind spots (Crescent Shrine, Aakman, etc.).');
