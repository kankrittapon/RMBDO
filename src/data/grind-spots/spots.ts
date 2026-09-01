import { buildPresets, BuildPreset } from '../builds/presets';

export interface GrindSpotItem {
  id: string;
  name: string;
  region: string;
  recommendedAP: number;
  recommendedAAP: number;
  recommendedDP: number;
  monsterAPCap: number;
  accuracyRequirement: number;
  species: 'HUMAN' | 'DEMIHUMAN' | 'KAMASYLVIA' | 'ABYSSAL_EDANIAN' | 'WILD_BEAST';
  difficulty: 'ENTRY' | 'MID' | 'HIGH' | 'DEHKIA' | 'APEX_ENDGAME';
  silverPerHour: string;
  treasureDrops: string[];
  keyMechanics: string[];
  recommendedClasses: string[];
  recommendedPresetId: string;
  backAttackImportance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  dehkiaCompatible: boolean;
}

export const grindSpotsList: GrindSpotItem[] = [
  {
    id: "gyfin_underground",
    name: "Gyfin Rhasia Temple (Underground)",
    region: "Kamasylvia",
    recommendedAP: 300,
    recommendedAAP: 300,
    recommendedDP: 380,
    monsterAPCap: 890,
    accuracyRequirement: 820,
    species: "KAMASYLVIA",
    difficulty: "HIGH",
    silverPerHour: "1.1B - 1.4B Silver/hr",
    treasureDrops: ["Caphras Stones", "TET Tungrad Belt", "Kamasylvia Essence"],
    keyMechanics: [
      "Color matching aura: Attack matching statue (Red/Blue/Green) for 300% bonus damage.",
      "Butcher of Gyfin: Instant kill mechanic on big swings — maintain Forward Guard / I-frame.",
      "Despair Phase: Clear 4 mini statues quickly to spawn Despair boss for high Caphras drops."
    ],
    recommendedClasses: ["Witch Awakening", "Wizard Awakening", "Nova Awakening", "Agent"],
    recommendedPresetId: "BALANCED",
    backAttackImportance: "CRITICAL",
    dehkiaCompatible: false
  },
  {
    id: "darkseekers_retreat",
    name: "Darkseekers Retreat",
    region: "Ulukita",
    recommendedAP: 310,
    recommendedAAP: 310,
    recommendedDP: 400,
    monsterAPCap: 950,
    accuracyRequirement: 900,
    species: "DEMIHUMAN",
    difficulty: "HIGH",
    silverPerHour: "1.4B - 1.8B Silver/hr",
    treasureDrops: ["Flame of Resonance (Ator's Shoes)", "Kabua's Fragment", "Deboreka Ring"],
    keyMechanics: [
      "Eternal Flame Beacon: Keep ember alive by killing elite mobs around the shrine.",
      "Punisher charge: High CC knockdown danger — cap Knockdown Resistance to 100%.",
      "Burst phase: Group mobs tightly into flame circle for massive damage boost."
    ],
    recommendedClasses: ["Agent", "Nova Awakening", "Witch Awakening", "Berserker"],
    recommendedPresetId: "MAX_DPS",
    backAttackImportance: "HIGH",
    dehkiaCompatible: false
  },
  {
    id: "tungrad_ruins",
    name: "Tungrad Ruins",
    region: "Ulukita",
    recommendedAP: 320,
    recommendedAAP: 320,
    recommendedDP: 410,
    monsterAPCap: 1020,
    accuracyRequirement: 940,
    species: "DEMIHUMAN",
    difficulty: "APEX_ENDGAME",
    silverPerHour: "1.8B - 2.2B Silver/hr",
    treasureDrops: ["Telescope Part 1 (Tungrad Fragment)", "Origin of Dark Hunger", "Deboreka Earring"],
    keyMechanics: [
      "Tungrad Core: Destroy lightning spires to stun surrounding elite executioners.",
      "Heavy front smash: Guard break danger — rotate Back Attacks continuously."
    ],
    recommendedClasses: ["Agent", "Nova Awakening", "Witch Awakening"],
    recommendedPresetId: "MAX_DPS",
    backAttackImportance: "CRITICAL",
    dehkiaCompatible: false
  },
  {
    id: "city_of_the_dead",
    name: "City of the Dead",
    region: "Ulukita",
    recommendedAP: 310,
    recommendedAAP: 310,
    recommendedDP: 390,
    monsterAPCap: 940,
    accuracyRequirement: 890,
    species: "DEMIHUMAN",
    difficulty: "HIGH",
    silverPerHour: "1.3B - 1.7B Silver/hr",
    treasureDrops: ["Telescope Part 2 (City Fragment)", "Kabua's Fragment", "Ator's Flame Ember"],
    keyMechanics: [
      "Tephra Bomb: Lure large golems to explode near surrounding minions.",
      "High density pull: Rotate wide AoE skills with Super Armor protection."
    ],
    recommendedClasses: ["Witch Awakening", "Wizard Awakening", "Nova Awakening"],
    recommendedPresetId: "BALANCED",
    backAttackImportance: "MEDIUM",
    dehkiaCompatible: false
  },
  {
    id: "yzrahid_highlands",
    name: "Yzrahid Highlands",
    region: "Ulukita",
    recommendedAP: 325,
    recommendedAAP: 325,
    recommendedDP: 415,
    monsterAPCap: 1050,
    accuracyRequirement: 950,
    species: "DEMIHUMAN",
    difficulty: "APEX_ENDGAME",
    silverPerHour: "2.0B - 2.5B Silver/hr",
    treasureDrops: ["Essence of Dawn (Kharazad)", "Kabua's Artifact Base", "Flame of Resonance"],
    keyMechanics: [
      "Dynamic turret towers: Hack towers with high burst skill to deactivate boss shield.",
      "High damage spikes: Keep Indomitable / Frenzy buffs refreshed."
    ],
    recommendedClasses: ["Agent", "Nova Awakening", "Witch Awakening"],
    recommendedPresetId: "MAX_DPS",
    backAttackImportance: "CRITICAL",
    dehkiaCompatible: false
  },
  {
    id: "dehkia_ash_forest",
    name: "Dehkia Lantern: Ash Forest",
    region: "Kamasylvia (Dehkia)",
    recommendedAP: 310,
    recommendedAAP: 310,
    recommendedDP: 400,
    monsterAPCap: 980,
    accuracyRequirement: 920,
    species: "KAMASYLVIA",
    difficulty: "DEHKIA",
    silverPerHour: "1.5B - 2.0B Silver/hr",
    treasureDrops: ["Deboreka Necklace Base", "Specter's Gaze", "Merchant Ring Piece 3"],
    keyMechanics: [
      "Lantern Summon: Constant waves of enraged Volkras and Barnas.",
      "CC Immune elite charges: Maintain SA movement and defensive Super Armor."
    ],
    recommendedClasses: ["Nova Awakening", "Witch Awakening", "Agent"],
    recommendedPresetId: "DEFENSIVE",
    backAttackImportance: "HIGH",
    dehkiaCompatible: true
  },
  {
    id: "dehkia_olun",
    name: "Dehkia Lantern: Olun's Valley (Trio / Solo)",
    region: "O'dyllita (Dehkia)",
    recommendedAP: 315,
    recommendedAAP: 315,
    recommendedDP: 410,
    monsterAPCap: 1020,
    accuracyRequirement: 940,
    species: "KAMASYLVIA",
    difficulty: "DEHKIA",
    silverPerHour: "2.0B - 2.6B Silver/hr",
    treasureDrops: ["Deboreka Earring Base", "Quturan's Black Leaf", "Merchant Ring Piece 5"],
    keyMechanics: [
      "Left Arm destruction: Focus fire Left Arm during windup for guaranteed high drop loot.",
      "Heart of Golem: Break heart before 60s timer expires to prevent wipe wave."
    ],
    recommendedClasses: ["Agent", "Witch Awakening", "Wizard Awakening"],
    recommendedPresetId: "MAX_DPS",
    backAttackImportance: "CRITICAL",
    dehkiaCompatible: true
  },
  {
    id: "inner_edania_core",
    name: "Inner Edania: Core of Void",
    region: "Edania Realm",
    recommendedAP: 335,
    recommendedAAP: 335,
    recommendedDP: 430,
    monsterAPCap: 1150,
    accuracyRequirement: 1010,
    species: "ABYSSAL_EDANIAN",
    difficulty: "APEX_ENDGAME",
    silverPerHour: "2.8B - 3.5B Silver/hr",
    treasureDrops: ["Sovereign Sub-weapon Catalyst", "Primordial Abyssal Core", "Decimation Crystal"],
    keyMechanics: [
      "Void Rift Inversion: Boss swaps player position with abyssal shadow — instantly dash 180° for Back Attack.",
      "Rift Overcharge: Requires 14-elixir continuous rotation and 100% Forward Guard precision."
    ],
    recommendedClasses: ["Agent", "Witch Awakening", "Nova Awakening"],
    recommendedPresetId: "MAX_DPS",
    backAttackImportance: "CRITICAL",
    dehkiaCompatible: false
  },
  {
    id: "centaurs",
    name: "Centaur Herd (Kama/Valencia)",
    region: "Valencia",
    recommendedAP: 240,
    recommendedAAP: 240,
    recommendedDP: 290,
    monsterAPCap: 550,
    accuracyRequirement: 500,
    species: "DEMIHUMAN",
    difficulty: "ENTRY",
    silverPerHour: "600M - 800M Silver/hr",
    treasureDrops: ["Black Stones", "Caphras Stones", "Centaur Belt"],
    keyMechanics: [
      "High speed pack clear: Infinite sprint / one-shot dash rotation.",
      "Agriss Fever spot: Best return per Agriss point in mid game."
    ],
    recommendedClasses: ["Musa", "Nova Awakening", "Maehwa"],
    recommendedPresetId: "TREASURE_FARM",
    backAttackImportance: "LOW",
    dehkiaCompatible: false
  },
  {
    id: "kratuga",
    name: "Kratuga Ancient Ruins",
    region: "Mediah Sub-level",
    recommendedAP: 260,
    recommendedAAP: 260,
    recommendedDP: 320,
    monsterAPCap: 700,
    accuracyRequirement: 650,
    species: "DEMIHUMAN",
    difficulty: "MID",
    silverPerHour: "800M - 1.1B Silver/hr",
    treasureDrops: ["Elten / Compass Piece 3", "Tungrad Earring", "Laytenn's Power Stone"],
    keyMechanics: [
      "Security Alarm Phase: Clear security elites within 3 minutes for massive gold drops.",
      "Tight pack pulls: Group ancient sentinels into room chokepoints."
    ],
    recommendedClasses: ["Witch Awakening", "Nova Awakening", "Agent"],
    recommendedPresetId: "BALANCED",
    backAttackImportance: "MEDIUM",
    dehkiaCompatible: false
  }
];
