export interface PermanentJournalItem {
  id: string;
  name: string;
  totalChapters: number;
  completedChapters: number;
  apReward: number;
  dpReward: number;
  hpReward: number;
  staminaReward: number;
  category: 'ADVENTURE_LOG' | 'EXPEDITION' | 'BOSS_BLITZ' | 'FAMILY_STATS';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
  keyObjective: string;
  costSilver: string;
}

export const permanentJournals: PermanentJournalItem[] = [
  {
    id: "bartali",
    name: "Igor Bartali's Adventure Log",
    totalChapters: 15,
    completedChapters: 15,
    apReward: 4,
    dpReward: 2,
    hpReward: 90,
    staminaReward: 65,
    category: "ADVENTURE_LOG",
    status: "COMPLETED",
    keyObjective: "Volumes 1 to 15 journey across Balenos, Calpheon, Mediah, Valencia",
    costSilver: "1.2B Silver"
  },
  {
    id: "deve",
    name: "Deve's Encyclopedia",
    totalChapters: 6,
    completedChapters: 6,
    apReward: 1,
    dpReward: 0,
    hpReward: 100,
    staminaReward: 0,
    category: "ADVENTURE_LOG",
    status: "COMPLETED",
    keyObjective: "Showcase themed item sets to Deve in Altinova",
    costSilver: "800M Silver"
  },
  {
    id: "dorin_morgrim",
    name: "Dorin Morgrim's Secret Book",
    totalChapters: 2,
    completedChapters: 2,
    apReward: 1,
    dpReward: 1,
    hpReward: 0,
    staminaReward: 0,
    category: "ADVENTURE_LOG",
    status: "COMPLETED",
    keyObjective: "Surrender DUO/TRI Green and Boss weapons to Dorin Morgrim at Helm's Post",
    costSilver: "1.5B Silver"
  },
  {
    id: "herald",
    name: "Herald's Journal (Rubin)",
    totalChapters: 4,
    completedChapters: 4,
    apReward: 0,
    dpReward: 1,
    hpReward: 0,
    staminaReward: 40,
    category: "ADVENTURE_LOG",
    status: "COMPLETED",
    keyObjective: "Timed speedrun challenges around Calpheon territory",
    costSilver: "0 Silver"
  },
  {
    id: "pavino_greko",
    name: "Pavino Greko's Collection",
    totalChapters: 4,
    completedChapters: 4,
    apReward: 0,
    dpReward: 0,
    hpReward: 600,
    staminaReward: 0,
    category: "ADVENTURE_LOG",
    status: "COMPLETED",
    keyObjective: "Donate gold bars to Pavino Greko in Epheria for huge HP pool",
    costSilver: "4.5B Silver"
  },
  {
    id: "barrier_infestation",
    name: "Barrier of Infestation (Elvia Kzarka)",
    totalChapters: 5,
    completedChapters: 5,
    apReward: 1,
    dpReward: 1,
    hpReward: 20,
    staminaReward: 0,
    category: "EXPEDITION",
    status: "COMPLETED",
    keyObjective: "Defeat Elvia Hadum Kzarka solo levels 1 through 5",
    costSilver: "0 Silver"
  },
  {
    id: "loml_boss_blitz",
    name: "Land of the Morning Light Boss Blitz",
    totalChapters: 10,
    completedChapters: 7,
    apReward: 1,
    dpReward: 1,
    hpReward: 0,
    staminaReward: 0,
    category: "BOSS_BLITZ",
    status: "IN_PROGRESS",
    keyObjective: "Defeat Calamity 5-7 bosses in Sungma/Earth/Water/Wind orbs",
    costSilver: "0 Silver"
  }
];
