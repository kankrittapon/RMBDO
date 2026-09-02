-- Horse tiers
-- Source: GrumpyG BDO Horse Tiers/Skills/Stats (https://grumpygreen.cricket/bdo-horse-tiers-skills-stats/)
-- Exact base % stats vary by individual coat/horse within a tier (not a single fixed number per tier).
-- Only the T6 figure was confidently retrieved as a concrete example this session; others left NULL
-- with directional notes. Recommend re-pulling the full filterable table from GrumpyG for precise seeding.

INSERT INTO horse_tiers (tier, base_speed, base_accel, base_turn, base_brake, notes) VALUES
('T1', NULL, NULL, NULL, NULL, 'Lowest tier, starting/wild-caught horses. Stats not confidently retrieved this session.'),
('T2', NULL, NULL, NULL, NULL, 'Low tier. Stats not confidently retrieved this session.'),
('T3', NULL, NULL, NULL, NULL, 'Low-mid tier. Stats not confidently retrieved this session.'),
('T4', NULL, NULL, NULL, NULL, 'Mid tier. Stats not confidently retrieved this session.'),
('T5', NULL, NULL, NULL, NULL, 'Mid tier. Stats not confidently retrieved this session.'),
('T6', 121, 121, 127, 127, 'Values are percentage stat figures from GrumpyG example horse, not a fixed universal T6 baseline (varies per individual horse/coat).'),
('T7', NULL, NULL, NULL, NULL, 'High tier, obtainable via breeding/exchange. Stats not confidently retrieved this session.'),
('T8', NULL, NULL, NULL, NULL, 'Very high tier; per GrumpyG, individual T8 horses trade off between Speed/Accel vs Turn/Brake (e.g. 8-5 best Speed/Accel worst Brake/Turn, 8-6 opposite, 8-1/8-7 balanced). No single representative numeric baseline.'),
('T9 (Dream Horse)', NULL, NULL, NULL, NULL, 'Named Dream Horses, e.g. Arduanatt (Speed 165.4%, Accel 166.6%, Turn 149.2%, Brake ~144.6-151.6%), Dine (Speed 160.7%, Accel 162.6%, Turn 158.0%, Brake 155.7%), Doom (Speed 157.5%, Accel 159.5%, Turn 168.6%, Brake 165.0%). Each Dream Horse has unique stats, no single T9 baseline - see individual notes.'),
('Draft Horse', NULL, NULL, NULL, NULL, 'Used for wagon-pulling / cart transport rather than riding speed; stat profile differs from riding tiers, not confidently retrieved this session.');
