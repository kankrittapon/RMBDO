export interface ReadinessPillar {
  id: string;
  name: string;
  status: 'READY' | 'IN_PROGRESS' | 'NOT_STARTED' | 'BLOCKED';
  tier: 'MANDATORY' | 'RECOMMENDED' | 'COMPLETIONIST';
  score: string;
  weightPercent: number;
  blockerList: string[];
  summary: string;
}

export interface WarReadinessState {
  overallStatus: 'READY' | 'NEARLY_READY' | 'NOT_READY';
  mandatoryCompletionPct: number;
  totalScorePct: number;
  criticalBlockers: string[];
  pillars: ReadinessPillar[];
}

export const initialWarReadiness: WarReadinessState = {
  overallStatus: "NOT_READY",
  mandatoryCompletionPct: 75,
  totalScorePct: 68,
  criticalBlockers: [
    "Permanent Sheet AP +1 missing (Complete Land of the Morning Light Boss Blitz Calamity 5-7)",
    "Missing PEN Blackstar Awakening Weapon + Flame of the Primordial for Sovereign Awakening Forge",
    "PvP Crystal Preset with 100% Stun/Knockdown Resistance not yet configured",
    "Upgraded Telescope not finished (Needed for instant commander calls in Tier 3/4 Node Wars)"
  ],
  pillars: [
    {
      id: "gear",
      name: "Gear Score & Core Brackets",
      status: "IN_PROGRESS",
      tier: "MANDATORY",
      score: "692 GS (309 AP / 383 DP)",
      weightPercent: 30,
      blockerList: ["Awakening Sovereign missing (Needs PEN BS Awakening x1 + Flame of the Primordial)", "Shoes need Ator's conversion (+8 DP gain)"],
      summary: "309 AP bracket reached. Needs 395+ DP to withstand Tier 4 Node War burst damage."
    },
    {
      id: "permanent_stats",
      name: "Permanent Journal Stats",
      status: "IN_PROGRESS",
      tier: "MANDATORY",
      score: "8 / 10 Books",
      weightPercent: 15,
      blockerList: ["LoML Boss Blitz Calamity 5-7 (+1 AP / +1 DP) incomplete"],
      summary: "Igor Bartali, Deve, Dorin, Pavino, and Barrier completed. Missing +1 AP from Boss Blitz."
    },
    {
      id: "treasures",
      name: "Combat Treasures",
      status: "READY",
      tier: "MANDATORY",
      score: "3 / 4 Pieces",
      weightPercent: 15,
      blockerList: ["Valtarra's Clairvoyance (68/100 pity)"],
      summary: "Infinite HP Potion (Ornette) is fully completed and slotted in Fairy Auto-Pot."
    },
    {
      id: "family_infra",
      name: "Family Infrastructure & Maids",
      status: "READY",
      tier: "RECOMMENDED",
      score: "45 Maids, T5 Fairy",
      weightPercent: 10,
      blockerList: [],
      summary: "Miraculous Cheer V, Feathery Steps V, Continuous Care V active on T5 Radiant Fairy."
    },
    {
      id: "consumables",
      name: "War Consumables & Perfumes",
      status: "READY",
      tier: "RECOMMENDED",
      score: "500+ Draughts Stocked",
      weightPercent: 10,
      blockerList: [],
      summary: "Full supply of Perfume of Courage, Spirit Perfume, and Savage Draughts ready in Storage."
    },
    {
      id: "pvp_build",
      name: "PvP Crystal & Add-on Preset",
      status: "NOT_STARTED",
      tier: "MANDATORY",
      score: "0 / 1 Preset",
      weightPercent: 10,
      blockerList: ["PvP Jin Viper + Haetae + Red Battlefield Crystal preset not slotted"],
      summary: "PvE Girin preset is active. Must configure dedicated PvP Resistance preset."
    },
    {
      id: "class_readiness",
      name: "Class Mastery & Awakening Matchup",
      status: "READY",
      tier: "RECOMMENDED",
      score: "Level 63 / 2200 SP",
      weightPercent: 10,
      blockerList: [],
      summary: "Class skill tree maxed with Tier 3 PvP Add-ons and Protected SA/FG rotation mapped."
    }
  ]
};
