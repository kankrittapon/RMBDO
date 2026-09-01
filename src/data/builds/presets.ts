export interface CrystalSlot {
  name: string;
  effect: string;
  count: number;
}

export interface BuildPreset {
  id: string;
  name: string;
  mode: 'BUDGET' | 'BALANCED' | 'MAX_DPS' | 'DEFENSIVE' | 'TREASURE_FARM';
  description: string;
  crystals: CrystalSlot[];
  artifacts: {
    slot1: string;
    slot2: string;
    effect: string;
  };
  lightstones: {
    comboName: string;
    stones: string[];
    effect: string;
  };
  buffs: {
    meal: string;
    draught: string;
    perfume: string;
    church: string;
    villa: string;
    house: string;
  };
  addonsSummary: string;
}

export const buildPresets: Record<string, BuildPreset> = {
  BALANCED: {
    id: "BALANCED",
    name: "Endgame Standard Balanced Preset",
    mode: "BALANCED",
    description: "Optimal combination of high monster AP, 100% critical hit damage, and monster damage reduction.",
    crystals: [
      { name: "Tear of the Primordial (Girin's Tear)", effect: "All AP +21, Max HP +100, Critical Hit Damage +2%", count: 1 },
      { name: "Ahkrad's Crystal", effect: "All AP +7, Attack Speed +2%", count: 2 },
      { name: "Glorious Crystal of Gallantry - Ahkrad", effect: "Monster AP +5, Attack Speed +1%", count: 2 },
      { name: "Haetae's Tear", effect: "All AP +10, Monster Damage Reduction +12", count: 1 },
      { name: "Crystal of Darkness - Decimation", effect: "Critical Hit Damage +2%, Back Attack Damage +2%", count: 2 },
      { name: "Rebellious Spirit Crystal", effect: "Extra AP Against Monsters +5, Max HP +175, Critical Damage +2%", count: 2 },
      { name: "Corrupted Magic Crystal", effect: "Critical Hit Damage +10%, Back Attack Damage +2%", count: 2 },
      { name: "Ultimate Combined Magic Crystal - Macalod", effect: "All AP +5, Stamina +20", count: 4 }
    ],
    artifacts: {
      slot1: "Kabua's Artifact (Left)",
      slot2: "Kabua's Artifact (Right)",
      effect: "Monster AP +14, Monster Damage Reduction +14, Max HP +400, Max Stamina +150"
    },
    lightstones: {
      comboName: "The Wild: Kamasylvia / Demihuman Specialization",
      stones: ["Lightstone of Fire: Strike", "Lightstone of Fire: Roar", "Lightstone of Earth: Iron Wall", "Lightstone of Wind: Heart"],
      effect: "Extra AP Against Species +30, Critical Hit Damage +6%, All Accuracy +16"
    },
    buffs: {
      meal: "Simple Cron Meal (Monster AP +30, Monster DR +15, Max HP +200)",
      draught: "Frenzy Draught (Monster AP +35, HP Recovery +3 on hit, Critical Hit Damage +3%)",
      perfume: "Spirit Perfume Elixir (Critical Hit Rate +5, Max MP/WP +300)",
      church: "Church AP +8 & DP +8 (5 Hours Duration)",
      villa: "Body Enhancement Villa Buff (All AP +10, All DP +10, Max HP +200)",
      house: "Heidel Furniture Buff (+15 All AP for 2 Hours)"
    },
    addonsSummary: "Skill Tier 3: +30 Monster AP, +5% Critical Hit Damage, -15 Monster DP debuff on opening skill."
  },
  MAX_DPS: {
    id: "MAX_DPS",
    name: "Hardcore Max DPS & Back Attack Burst",
    mode: "MAX_DPS",
    description: "Maximum raw monster AP and critical/back attack multipliers for high AP-cap zones (Tungrad, Darkseekers, Edania).",
    crystals: [
      { name: "Tear of the Primordial (Girin's Tear)", effect: "All AP +21, Critical Damage +2%", count: 1 },
      { name: "Crystal of Darkness - Decimation", effect: "Critical Damage +2%, Back Attack +2%", count: 2 },
      { name: "Glorious Ahkrad", effect: "Monster AP +5, Attack Speed +1%", count: 2 },
      { name: "Corrupted Magic Crystal", effect: "Critical Damage +10%", count: 2 },
      { name: "Rebellious Spirit Crystal", effect: "Monster AP +5, Critical Damage +2%", count: 2 },
      { name: "Ancient Magic Crystal of Crimson Flame - Power", effect: "All AP +5", count: 2 },
      { name: "BON Magic Crystal - Viper", effect: "All Accuracy +14, Attack Speed +1%", count: 2 }
    ],
    artifacts: {
      slot1: "Kabua's Artifact (Monster AP)",
      slot2: "Kabua's Artifact (Monster AP)",
      effect: "Monster AP +14, Monster DR +14"
    },
    lightstones: {
      comboName: "Target Openings (Max Critical Hit Multiplier)",
      stones: ["Lightstone of Fire: Strike", "Lightstone of Fire: Strike", "Lightstone of Fire: Roar", "Lightstone of Wind: Feather"],
      effect: "Critical Hit Damage +10%, All AP +10, Critical Rate +5%"
    },
    buffs: {
      meal: "Simple Cron Meal",
      draught: "Frenzy Draught + Giant's Draught rotation",
      perfume: "Perfume of Courage (All AP +20, Max HP +200, Attack Speed +5%)",
      church: "Church AP/DP (5 Hours)",
      villa: "Body Enhancement Villa",
      house: "Heidel Furniture +15 AP"
    },
    addonsSummary: "+30 Monster AP, +5% Back Attack Damage, +20% Critical Hit Rate, -20 All DP Debuff."
  },
  DEFENSIVE: {
    id: "DEFENSIVE",
    name: "Survival & High Damage Reduction Preset",
    mode: "DEFENSIVE",
    description: "Configured for under-DP players tackling Dehkia Lantern zones or Inner Edania high burst mobs.",
    crystals: [
      { name: "Haetae's Tear", effect: "Monster DR +12, All AP +10", count: 1 },
      { name: "Frozen Bitterness (Labreska Crystal)", effect: "Monster DR +10, Max HP +150", count: 2 },
      { name: "Haetae's Crystal of Protection", effect: "All DP +10, Damage Reduction +5", count: 2 },
      { name: "Rebellious Spirit Crystal", effect: "Max HP +175, Monster AP +5", count: 2 },
      { name: "Crystal of Harmony", effect: "All Damage Reduction +8, Evasion +12", count: 2 }
    ],
    artifacts: {
      slot1: "Kabua's Artifact (Damage Reduction)",
      slot2: "Kabua's Artifact (Damage Reduction)",
      effect: "Monster DR +14, Max HP +400"
    },
    lightstones: {
      comboName: "Iron Wall / Untouchable (Max Monster Damage Reduction)",
      stones: ["Lightstone of Earth: Iron Wall", "Lightstone of Earth: Iron Wall", "Lightstone of Earth: Rock", "Lightstone of Wind: Heart"],
      effect: "All Damage Reduction +25, Monster Damage Reduction +15, Max HP +300"
    },
    buffs: {
      meal: "Exquisite Cron Meal",
      draught: "Indomitable Draught (Damage Reduction +25, Max HP +300)",
      perfume: "Khalk's Elixir (Max HP +100, Damage Reduction +15)",
      church: "Church DP +8",
      villa: "Body Enhancement Villa",
      house: "DP Furniture +15"
    },
    addonsSummary: "+20 All DP Buff, +15 Monster DR, +5% HP Recovery on hit."
  },
  BUDGET: {
    id: "BUDGET",
    name: "Entry / Season Graduate Budget Preset",
    mode: "BUDGET",
    description: "Low silver cost (< 500M) setup using standard crystals that won't break your bank upon early death.",
    crystals: [
      { name: "Ancient Magic Crystal - Cobelinus", effect: "Max HP +100, Weight +20LT", count: 2 },
      { name: "Magic Crystal of Infinity - Critical", effect: "Critical Hit Damage +1%", count: 2 },
      { name: "Ancient Magic Crystal of Viper", effect: "Attack Speed +1, Casting Speed +1", count: 2 },
      { name: "Black Magic Crystal - Precision", effect: "All Accuracy +8, Ignore Resist +10%", count: 2 },
      { name: "Combined Magic Crystal - Gervish", effect: "All AP +5, Max HP +150", count: 4 }
    ],
    artifacts: {
      slot1: "Monster AP Artifact",
      slot2: "Monster AP Artifact",
      effect: "Monster AP +6, Monster DR +4"
    },
    lightstones: {
      comboName: "Vigor / Basic Roar",
      stones: ["Lightstone of Fire: Roar", "Lightstone of Fire: Roar", "Lightstone of Wind: Feather", "Lightstone of Wind: Feather"],
      effect: "Extra AP Against Monsters +12"
    },
    buffs: {
      meal: "Simple Cron Meal",
      draught: "Frenzy Draught or Beast's Draught",
      perfume: "None / Spirit Perfume",
      church: "Church AP (Optional)",
      villa: "Oasis / Villa (Optional)",
      house: "None"
    },
    addonsSummary: "+20 Monster AP, +3% Attack Speed, +3% Critical Rate."
  },
  TREASURE_FARM: {
    id: "TREASURE_FARM",
    name: "High Movement Speed & Item Drop Rate Preset",
    mode: "TREASURE_FARM",
    description: "Optimized for one-shotting low tier treasure zones (Blood Wolf, Sherekhan, Sulfur, Pila Ku) with max mobility.",
    crystals: [
      { name: "Crystal of Velocity", effect: "Movement Speed +2%, Max Stamina +100", count: 4 },
      { name: "Rebellious Spirit Crystal", effect: "Max HP +175, Monster AP +5", count: 2 },
      { name: "Ancient Magic Crystal - Hystria", effect: "Movement Speed +2, Max Stamina +200", count: 2 },
      { name: "Glorious Ahkrad", effect: "Attack Speed +2%", count: 2 }
    ],
    artifacts: {
      slot1: "Item Drop Rate Artifact (+5%)",
      slot2: "Item Drop Rate Artifact (+5%)",
      effect: "Item Drop Rate +10%, Max Stamina +100"
    },
    lightstones: {
      comboName: "Swift Wind & Fortune (Max Move Speed & Drop Rate)",
      stones: ["Lightstone of Flora: Fortune", "Lightstone of Wind: Feather", "Lightstone of Wind: Feather", "Lightstone of Wind: Heart"],
      effect: "Item Drop Rate +5%, Movement Speed +10%, Stamina +300"
    },
    buffs: {
      meal: "Simple Cron Meal",
      draught: "Beast's Draught",
      perfume: "None",
      church: "None",
      villa: "Skill & EXP Villa",
      house: "None"
    },
    addonsSummary: "+7% Movement Speed on dash skill, +20 Monster AP."
  }
};
