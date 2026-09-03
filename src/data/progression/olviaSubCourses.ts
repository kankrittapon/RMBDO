export interface SubCourseItem {
  id: string;
  name: string;
  branch: 'COMBAT' | 'LIFE_SKILL';
  totalQuests: number | null; // null = count not yet confirmed
  notes?: string;
  order: number;
}

// Quest-count tracker, separate from olviaCombatTasks.ts / olviaLifeTasks.ts
// (which track specific reward-bearing milestones like the Blackstar capstone -
// those stay as-is; this is purely "how many of the N quests in this
// sub-course have I cleared").
//
// Counts marked with a real number came directly from the user reading
// their own in-game Olvia Academy panel (2026-09-03) - the single most
// reliable source available, since no official or community source
// publishes exact per-quest counts (confirmed by repeated research this
// session). Counts still `null` are pending the user checking that
// sub-course in-game; DO NOT fill these in with a guess.
//
// Combat branch structure (4 sub-courses, not the 2 initially assumed) per
// https://vortexgaming.io/en/postdetail/650591: Basic Tactics, Field
// Tactics, Relic, Light Stone Combination.
export const olviaSubCoursesList: SubCourseItem[] = [
  { id: "combat_basic_tactics", name: "Basic Tactics", branch: "COMBAT", totalQuests: 12, order: 1 },
  { id: "combat_field_tactics", name: "Field Tactics", branch: "COMBAT", totalQuests: 19, order: 2 },
  { id: "combat_relic", name: "Relic", branch: "COMBAT", totalQuests: null, order: 3 },
  { id: "combat_lightstone_combination", name: "Light Stone Combination", branch: "COMBAT", totalQuests: null, order: 4 },

  { id: "life_gathering", name: "Gathering", branch: "LIFE_SKILL", totalQuests: 10, order: 5 },
  { id: "life_fishing", name: "Fishing (AFK Fishing)", branch: "LIFE_SKILL", totalQuests: 13, notes: "official GM Notes calls this course 'AFK Fishing' specifically", order: 6 },
  { id: "life_hunting", name: "Hunting", branch: "LIFE_SKILL", totalQuests: 13, order: 7 },
  { id: "life_cooking", name: "Cooking", branch: "LIFE_SKILL", totalQuests: null, notes: "connects to Finto Farm node for worker food production (vortexgaming.io)", order: 8 },
  { id: "life_alchemy", name: "Alchemy", branch: "LIFE_SKILL", totalQuests: null, notes: "taught by NPC Eileen (official GM Notes); node connection + potion-making (vortexgaming.io)", order: 9 },
  { id: "life_processing", name: "Processing", branch: "LIFE_SKILL", totalQuests: null, notes: "last quest requires high-level crystal production (vortexgaming.io)", order: 10 },
  { id: "life_training", name: "Training", branch: "LIFE_SKILL", totalQuests: null, notes: "capture, breeding, and wild horse activities (vortexgaming.io)", order: 11 },
  { id: "life_farming", name: "Farming", branch: "LIFE_SKILL", totalQuests: null, notes: "requires a 10-slot garden (vortexgaming.io)", order: 12 },
  { id: "life_sailing", name: "Sailing", branch: "LIFE_SKILL", totalQuests: null, notes: "provides Cog and Aria sailboats (vortexgaming.io)", order: 13 },
  { id: "life_bartering", name: "Bartering", branch: "LIFE_SKILL", totalQuests: null, notes: "reaches Skilled Lv.1 for family reward (vortexgaming.io) - unconfirmed whether separate from Sailing", order: 14 }
];
