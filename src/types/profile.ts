export type CheckpointStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'UNKNOWN';

export type GearSlotStatus = 'NONE' | 'OWNED' | 'IN_PROGRESS' | 'UNKNOWN';

export interface PlayerStats {
  ap: number | null;
  aap: number | null;
  dp: number | null;
  gearScore: number | null;
  characterClass: string;
  characterLevel: number | null;
  serverRegion: string;
  isUnknownStats?: boolean;
}

export interface PlayerGearSlot {
  slotId: string;
  slotName: string;
  category: 'WEAPON' | 'ARMOR' | 'ACCESSORY' | 'SPECIAL';
  itemName: string;
  enhancementLevel: string;
  status: GearSlotStatus;
  notes?: string;
}

export interface PlayerCheckpointTask {
  id: string;
  title: string;
  category: string;
  status: CheckpointStatus;
  rewardClaimed?: boolean;
  itemUsed?: boolean;
  notes?: string;
  completedAt?: string;
}

export type ProgressionPath = 'grind' | 'life';

export interface CheckpointOverride {
  rewards?: string[];
  requirements?: string[];
  nextRecommendedStep?: string;
  updatedAt: string;
}

export interface PlayerProfile {
  version: 'v2';
  hasCompletedSetup: boolean;
  // Which tracks this account pursues. Drives the roadmap's default path
  // tab; both = show everything. Editable in RoadmapView.
  primaryPaths: ProgressionPath[];
  createdAt: string;
  updatedAt: string;
  stats: PlayerStats;
  gear: Record<string, PlayerGearSlot>;
  seasonTasks: Record<string, CheckpointStatus>;
  hyperboostClaims: Record<string, { claimed: boolean; used: boolean; status: CheckpointStatus }>;
  olviaCombatTasks: Record<string, CheckpointStatus>;
  olviaLifeTasks: Record<string, CheckpointStatus>;
  slumberingOriginTasks: Record<string, CheckpointStatus>;
  kharazadTasks: Record<string, CheckpointStatus>;
  subCourseProgress: Record<string, number>;
  journalChapters: Record<string, CheckpointStatus>;
  treasurePieces: Record<string, boolean>;
  // Per-checkpoint content corrections made by the user in-app (the TS
  // data files are defaults, not fixed truth). Displayed with a
  // user-corrected badge; revert restores file values.
  checkpointOverrides: Record<string, CheckpointOverride>;
  safetyItemLocks: Record<string, boolean>;
  customNotes: string;
}
