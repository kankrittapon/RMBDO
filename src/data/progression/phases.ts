export interface TaskItem {
  id: string;
  text: string;
  priority: 'DO_NOW' | 'HIGH' | 'THIS_WEEK' | 'LATER';
  completed: boolean;
  category?: string;
}

export type PhaseStatus = 'COMPLETED' | 'IN_PROGRESS' | 'BLOCKED' | 'AVAILABLE' | 'FUTURE';

export interface ProgressionPhase {
  id: string;
  title: string;
  subtitle: string;
  status: PhaseStatus;
  tierBadge: string;
  order: number;
  apRange: string;
  dpRange: string;
  requirements: string[];
  rewards: string[];
  itemsRequired: string[];
  itemsToPreserve: string[];
  estimatedCost: string;
  grindLocations: string[];
  exitConditions: string[];
  tasks: TaskItem[];
}

export const initialPhases: ProgressionPhase[] = [
  {
    id: "season",
    title: "1. Season Graduation",
    subtitle: "Tuvala Gear Full PEN (V) & Season Pass Completion",
    status: "COMPLETED",
    tierBadge: "FOUNDATION",
    order: 1,
    apRange: "240-245",
    dpRange: "305-310",
    requirements: ["Create Season Character", "Level 61 Reached", "Complete Season Pass"],
    rewards: ["Full PEN Tuvala Gear Set", "PEN Capotia Accessory of choice", "Graduation Gift Box"],
    itemsRequired: ["Time-filled Black Stones", "Tuvala Ores", "Refined Magical Black Stones"],
    itemsToPreserve: ["Sealed Weapon Exchange Coupons", "Advice of Valks +100"],
    estimatedCost: "0 Silver (Season Free Currency)",
    grindLocations: ["Polly's Forest", "Desert Fogans", "Marie Cave (Traitor's Graveyard)"],
    exitConditions: ["Full PEN Tuvala Armor & Weapons", "Level 61+", "Graduation Certificate obtained"],
    tasks: [
      { id: "s1", text: "Reach Level 61 via Questing / Polly's Forest", priority: "DO_NOW", completed: true },
      { id: "s2", text: "Enhance all Tuvala Weapons and Armors to PEN (V)", priority: "DO_NOW", completed: true },
      { id: "s3", text: "Claim PEN Capotia Necklace from Fughar", priority: "HIGH", completed: true }
    ]
  },
  {
    id: "hyperboost",
    title: "2. Hyperboost Server Phase",
    subtitle: "Accelerated XP, TET Blackstar Conversion, Jetina Guaranteed PENs",
    status: "COMPLETED",
    tierBadge: "BOOST",
    order: 2,
    apRange: "281-290",
    dpRange: "340-350",
    requirements: ["Graduate Season", "Activate Hyperboost Combat & Skill XP buffs"],
    rewards: ["Free TET Blackstar Weapon Box", "Jetina Guaranteed PEN Crescent Ring V", "Magnus Fast Travel + PEN Boss Armor"],
    itemsRequired: ["Yona's Fragments", "Concentrated Boss Auras", "Old Moon Crystals"],
    itemsToPreserve: ["Free TET Blackstar Weapon (Do NOT sell)", "J's Hammer of Precision"],
    estimatedCost: "15-25 Billion Silver",
    grindLocations: ["Centaurs (Kama/Valencia)", "Kratuga Ancient Ruins", "Aakman Temple"],
    exitConditions: ["Abyss One: The Magnus Completed", "Jetina PEN Accessory V completed", "2x TET Blackstar Weapons"],
    tasks: [
      { id: "hb1", text: "Complete Abyss One: The Magnus for Global Storage & PEN Boss Armor", priority: "DO_NOW", completed: true },
      { id: "hb2", text: "Claim Free TET Blackstar Box & Equip Mainhand", priority: "DO_NOW", completed: true },
      { id: "hb3", text: "Complete Jetina Guaranteed PEN Crescent Ring (Stage 5)", priority: "HIGH", completed: true }
    ]
  },
  {
    id: "olvia_combat",
    title: "3. Olvia Combat Academy",
    subtitle: "Skill Add-on Specialization, Magnus Skills, Adventure Journals AP/DP",
    status: "COMPLETED",
    tierBadge: "TACTICAL",
    order: 3,
    apRange: "295-305",
    dpRange: "360-375",
    requirements: ["Level 62 Reached", "1,800+ Skill Points", "Magnus Skill Unlocked"],
    rewards: ["+7 Permanent AP, +6 Permanent DP from Journals", "Optimal Tier 3 Skill Add-on Presets"],
    itemsRequired: ["Gold Bars for Bartali", "Forbidden Books for Dorin Morgrim", "Pavino Greko Tomes"],
    itemsToPreserve: ["Specter's Energy", "Shakatu's Special Seals"],
    estimatedCost: "8-12 Billion Silver (Journal items)",
    grindLocations: ["Sycraia Abyssal Ruins", "Orc Camp (Elvia Serendia)", "Biraghi Den"],
    exitConditions: ["Igor Bartali (+4 AP/+2 DP)", "Deve Encyclopedia (+1 AP)", "Herald & Dorin Journals Completed"],
    tasks: [
      { id: "oc1", text: "Finish Igor Bartali Adventure Log Volume 1-15 (+4 AP / +2 DP)", priority: "DO_NOW", completed: true },
      { id: "oc2", text: "Complete Deve's Encyclopedia Volumes 1-6 (+1 AP)", priority: "HIGH", completed: true },
      { id: "oc3", text: "Setup 6x T3 Skill Add-ons optimized for Elvia monster caps", priority: "THIS_WEEK", completed: true }
    ]
  },
  {
    id: "olvia_lifeskill",
    title: "4. Olvia Life Skill Academy",
    subtitle: "Guru Cooking, Master Gathering, Worker Empire 400 CP Setup",
    status: "IN_PROGRESS",
    tierBadge: "ECONOMY",
    order: 4,
    apRange: "Mastery 1200+",
    dpRange: "Weight 2200LT",
    requirements: ["350+ Contribution Points", "Guru 1 Cooking", "Master 1 Gathering"],
    rewards: ["Daily Imperial Cooking Box (180M-250M Silver/day passive)", "Continuous Resource Supply for Elixirs/Perfumes"],
    itemsRequired: ["Log / Rough Stone for Utensils", "Meat / Milk / Pepper / Onion crops"],
    itemsToPreserve: ["Concentrated Magical Black Gems", "Manos Accessories"],
    estimatedCost: "10-20 Billion Silver (TET Loggia -> TET Manos gear)",
    grindLocations: ["Behr Herb Gathering", "Calpheon City Cooking Stations", "Valencia Sulfur Node Empire"],
    exitConditions: ["Guru 1 Cooking reached", "Imperial Delivery automated daily", "400 CP reached"],
    tasks: [
      { id: "ol1", text: "Reach Guru 1 Cooking using Pickled Vegetables & Balenos Meals", priority: "DO_NOW", completed: false },
      { id: "ol2", text: "Push Contribution Points to 380+ via Calpheon / Drieghan Dailies", priority: "HIGH", completed: false },
      { id: "ol3", text: "Setup 10x 10-slot Farming Fences for Pepper & High-Quality Onion", priority: "THIS_WEEK", completed: true }
    ]
  },
  {
    id: "sovereign",
    title: "5. Sovereign Weapon Forge",
    subtitle: "Synthesizing 2x PEN Blackstars + Flame of the Primordial for Tier 10 Primordial Sovereign",
    status: "IN_PROGRESS",
    tierBadge: "PRIMORDIAL",
    order: 5,
    apRange: "309-318",
    dpRange: "380-395",
    requirements: ["2x PEN (V) Blackstar Weapons of the same type OR 1x PEN Blackstar + Flame of the Primordial"],
    rewards: ["Sovereign Weapon (Base AP +5 over PEN Blackstar, 5 gem sockets, Primordial glow)"],
    itemsRequired: ["PEN Blackstar Main/Awk x2", "Flame of the Primordial x1", "Gem of Twilight (Sub-weapon)"],
    itemsToPreserve: ["Gem of Twilight (DO NOT USE until ready)", "PEN Blackstar Sub-weapon"],
    estimatedCost: "60-90 Billion Silver per Sovereign slot",
    grindLocations: ["Gyfin Rhasia Underground", "Darkseekers Retreat", "Tungrad Ruins", "City of the Dead"],
    exitConditions: ["Sovereign Mainhand & Awakening Weapon Crafted and at least PRI/DUO enhanced"],
    tasks: [
      { id: "sov1", text: "Obtain 2nd PEN Blackstar Awakening Weapon (Currently 1/2 !)", priority: "DO_NOW", completed: false },
      { id: "sov2", text: "Forge Sovereign Mainhand (2x PEN BS Main READY ✓)", priority: "HIGH", completed: true },
      { id: "sov3", text: "Secure Gem of Twilight for future Sovereign Sub-weapon", priority: "THIS_WEEK", completed: true }
    ]
  },
  {
    id: "kharazad",
    title: "6. Kharazad Accessory Transition",
    subtitle: "New Sovereign Accessory Tier — Safe Enhancement without Destruction",
    status: "AVAILABLE",
    tierBadge: "SOVEREIGN ACC",
    order: 6,
    apRange: "318-325",
    dpRange: "395-405",
    requirements: ["TET/PEN Deboreka Accessories or Pure Silver Purchase", "Dawn's Essence / Crystal of Harmony"],
    rewards: ["Kharazad Necklace, Belt, Rings & Earrings with custom socket slots"],
    itemsRequired: ["Dawn's Black Stones", "Essence of Dawn", "TET Deboreka Base"],
    itemsToPreserve: ["PEN Deboreka Accessories", "Origin of Dark Hunger"],
    estimatedCost: "80-140 Billion Silver",
    grindLocations: ["Yzrahid Highlands", "Tungrad Ruins", "Dehkia Ash Forest", "Dehkia Olun's Valley"],
    exitConditions: ["Full Kharazad Accessory Set at OCT (VIII) / NOV (IX)"],
    tasks: [
      { id: "kh1", text: "Farm Yzrahid Highlands for Essence of Dawn & Kabua fragments", priority: "HIGH", completed: false },
      { id: "kh2", text: "Convert Deboreka Necklace to Kharazad Necklace", priority: "THIS_WEEK", completed: false },
      { id: "kh3", text: "Slot specialized stat crystals into Kharazad socket slots", priority: "LATER", completed: false }
    ]
  },
  {
    id: "slumbering_origin",
    title: "7. Slumbering Origin Armor Quad",
    subtitle: "Fallen God's Armor, Labreska's Helmet, Dahn's Gloves, Ator's Shoes to DUO/TRI",
    status: "IN_PROGRESS",
    tierBadge: "FALLEN GOD",
    order: 7,
    apRange: "315-320",
    dpRange: "401-415",
    requirements: ["Flame of Despair (Tunkuta)", "Flame of Frost (Jade)", "Flame of Hongik (Dahn)", "Flame of Resonance (Ator)"],
    rewards: ["Full 4-piece Slumbering Origin Armor Set, Massive Monster Damage Reduction"],
    itemsRequired: ["Caphras Stones Lv.10 on C20 Boss Armor", "Flames of Slumbering Origin"],
    itemsToPreserve: ["Flames (DO NOT SELL)", "Flawless Chaotic Black Stones"],
    estimatedCost: "70-110 Billion Silver",
    grindLocations: ["Jade Starlight Forest (Winter)", "Tunkuta (O'dyllita)", "Dokkebi Princess (LoML)", "Darkseekers Retreat"],
    exitConditions: ["All 4 Armors at TRI (III) Slumbering Origin (Silent / Wailing)"],
    tasks: [
      { id: "so1", text: "Enhance Fallen God Armor to DUO (Desirable)", priority: "DO_NOW", completed: true },
      { id: "so2", text: "Enhance Labreska Helmet to DUO (Desirable)", priority: "HIGH", completed: true },
      { id: "so3", text: "Craft Ator's Shoes from Flame of Resonance", priority: "THIS_WEEK", completed: false },
      { id: "so4", text: "Push all 4 pieces to TRI (Silent Fallen God)", priority: "LATER", completed: false }
    ]
  },
  {
    id: "edania",
    title: "8. Edania Demon Realm Entrance",
    subtitle: "Outer Edania Grind Zones, Abyssal Crystal Sockets, Edanian Artifact Sets",
    status: "FUTURE",
    tierBadge: "EXPANSION",
    order: 8,
    apRange: "325-335",
    dpRange: "415-430",
    requirements: ["320+ AP with 1050+ Total Monster AP", "415+ DP", "Edania Prelude Questline"],
    rewards: ["Edanian Essences, Abyssal Decimation Crystals, Sovereign Sub-weapon catalyst"],
    itemsRequired: ["Edanian Black Stones", "Demon Ward Charms", "Purified Abyssal Draughts"],
    itemsToPreserve: ["Primordial Essences", "High Grade Cron Stones"],
    estimatedCost: "150+ Billion Silver",
    grindLocations: ["Edania: Outer Wastes", "Demon Citadel Perimeter", "Abyssal Rift Vanguard"],
    exitConditions: ["Equip 2x Kabua Artifacts with +14 Monster AP +7 Monster DR lightstones"],
    tasks: [
      { id: "ed1", text: "Complete Edania Realm Entry Main Quest", priority: "LATER", completed: false },
      { id: "ed2", text: "Achieve 1,080 Total Monster AP with Buffs", priority: "LATER", completed: false }
    ]
  },
  {
    id: "inner_edania",
    title: "9. Inner Edania High-End Apex",
    subtitle: "Hardcore 335+ AP / 430+ DP Apex Zones — Sovereign Subweapon Catalyst",
    status: "FUTURE",
    tierBadge: "APEX ENDGAME",
    order: 9,
    apRange: "335-345",
    dpRange: "430-450",
    requirements: ["330+ Sheet AP, 430+ DP", "100% Back Attack uptime rotation", "Maximum Monster DR"],
    rewards: ["Apex Demon Core, Primordial Sub-weapon Core, 2.5B+ Silver/hr raw liquid"],
    itemsRequired: ["Elixir Rotations (14 active elixirs)", "Perfume of Courage", "Church + Villa Buffs"],
    itemsToPreserve: ["All high tier defensive crystals"],
    estimatedCost: "250+ Billion Silver",
    grindLocations: ["Inner Edania: Core of Void", "Lord of Edania Sanctum"],
    exitConditions: ["Sovereign Sub-weapon crafted & DEC (X) Sovereign progression"],
    tasks: [
      { id: "ie1", text: "Master Group/Solo mechanics in Void Core", priority: "LATER", completed: false }
    ]
  },
  {
    id: "permanent_completion",
    title: "10. Permanent Completionist Audit",
    subtitle: "All Adventure Journals, HP/MP Infinite Potions, Archaeologist's Map, Compass",
    status: "IN_PROGRESS",
    tierBadge: "PERMANENT STATS",
    order: 10,
    apRange: "Maxed Permanent",
    dpRange: "Maxed Permanent",
    requirements: ["All 10 Journal Books Completed", "Ornette & Odore Potions in Family Inventory"],
    rewards: ["+10 Sheet AP, +9 Sheet DP, +1100 HP across Family permanently", "Instant Infinite Sustain"],
    itemsRequired: ["Sherekhan Panacea", "Ron's Tintinnabulum", "Ash Halfmoon Kagtunak"],
    itemsToPreserve: ["Ancient Treasure Pieces (Do NOT sell)"],
    estimatedCost: "40-60 Billion Silver",
    grindLocations: ["Blood Wolf Settlement", "Sherekhan Necropolis", "Forest Ronaros", "Manshaum Forest"],
    exitConditions: ["10/10 Permanent Family Journals Completed", "Both Infinite Potions Family Bound"],
    tasks: [
      { id: "pc1", text: "Finish Land of the Morning Light Boss Blitz Calamity 5-7 (+1 AP / +1 DP)", priority: "DO_NOW", completed: false },
      { id: "pc2", text: "Complete Ornette's HP Potion (3/3 pieces done ✓)", priority: "DO_NOW", completed: true },
      { id: "pc3", text: "Finish Odore's MP Potion (2/3 pieces done - Missing Valtarra Clairvoyance)", priority: "HIGH", completed: false }
    ]
  },
  {
    id: "war_ready",
    title: "11. War Readiness — Node War & Siege",
    subtitle: "Uncapped Tier 3/4 Node War & Castle Siege Certification",
    status: "BLOCKED",
    tierBadge: "PVP PEAK",
    order: 11,
    apRange: "315+ Sheet AP",
    dpRange: "410+ Sheet DP",
    requirements: ["730+ Total Gearscore", "Full PvP Crystal Preset with 100% Resistance Cap", "Telescope for Instant Squad Call"],
    rewards: ["Guild Capital Territory Control, Sovereign Crown, BiS Guild Buffs"],
    itemsRequired: ["Perfumes of Charm / Deep Sea", "Special PvP Draughts", "Resilience Crystals"],
    itemsToPreserve: ["PvP Crystal Presets (Separate from PvE)"],
    estimatedCost: "50 Billion Silver (PvP Consumables & Specialized Setup)",
    grindLocations: ["Red Battlefield", "Arsha Server Open World", "Guild League 15v15"],
    exitConditions: ["Pass 7-Pillar War Readiness Audit (Mandatory items 100%)"],
    tasks: [
      { id: "wr1", text: "Complete Permanent AP +1 from LoML Boss Blitz", priority: "DO_NOW", completed: false },
      { id: "wr2", text: "Build dedicated PvP Resistance / Human Damage Crystal Preset", priority: "HIGH", completed: false },
      { id: "wr3", text: "Farm Upgraded Telescope for Node War Commander Calls", priority: "THIS_WEEK", completed: false }
    ]
  }
];
