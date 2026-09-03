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
// Corrected 2026-09-03 against a screenshot of the user's own in-game
// Olvia Academy panel - the ground truth, overriding the earlier version of
// this file which wrongly added "Relic" and "Light Stone Combination" as
// separate combat sub-courses based on a community guide
// (vortexgaming.io) that turned out to be wrong/outdated. The real sidebar
// has exactly 2 Combat sub-courses and 9 Life Skill sub-courses - note
// Sailing and Bartering are ONE combined "Sailing/Barter" entry in-game,
// not two.
export const olviaSubCoursesList: SubCourseItem[] = [
  { id: "combat_basic_tactics", name: "Basic Tactics", branch: "COMBAT", totalQuests: 12, order: 1 },
  { id: "combat_field_tactics", name: "Field Tactics", branch: "COMBAT", totalQuests: 19, order: 2 },

  { id: "life_gathering", name: "Gathering", branch: "LIFE_SKILL", totalQuests: 10, order: 3 },
  { id: "life_fishing", name: "Fishing", branch: "LIFE_SKILL", totalQuests: 13, order: 4 },
  { id: "life_hunting", name: "Hunting", branch: "LIFE_SKILL", totalQuests: 13, order: 5 },
  { id: "life_cooking", name: "Cooking", branch: "LIFE_SKILL", totalQuests: null, order: 6 },
  { id: "life_alchemy", name: "Alchemy", branch: "LIFE_SKILL", totalQuests: null, order: 7 },
  { id: "life_processing", name: "Processing", branch: "LIFE_SKILL", totalQuests: null, order: 8 },
  { id: "life_training", name: "Training", branch: "LIFE_SKILL", totalQuests: null, order: 9 },
  { id: "life_farming", name: "Farming", branch: "LIFE_SKILL", totalQuests: null, order: 10 },
  { id: "life_sailing_barter", name: "Sailing/Barter", branch: "LIFE_SKILL", totalQuests: null, notes: "one combined sub-course in-game, not separate Sailing + Bartering entries", order: 11 }
];
