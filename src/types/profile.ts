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

export interface PlayerProfile {
  version: 'v2';
  hasCompletedSetup: boolean;
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
  warReadinessChecks: Record<string, boolean>;
  safetyItemLocks: Record<string, boolean>;
  customNotes: string;
}
