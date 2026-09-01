export interface BlackstarSlotStatus {
  slot: 'MAIN' | 'AWAKENING' | 'SUB';
  slotName: string;
  ownedCount: number;
  requiredForSovereign: number;
  sovereignStatus: 'READY' | 'BLOCKED' | 'CRAFTED';
  detailNote: string;
}

export interface SovereignTrackerState {
  mainhand: BlackstarSlotStatus;
  awakening: BlackstarSlotStatus;
  subweapon: BlackstarSlotStatus;
  totalPenOwned: number;
  totalPenRequired: number;
  nextCriticalAction: string;
  selectableBoxWarning: string;
}

export const initialSovereignTracker: SovereignTrackerState = {
  mainhand: {
    slot: "MAIN",
    slotName: "Mainhand Blackstar",
    ownedCount: 2,
    requiredForSovereign: 2,
    sovereignStatus: "READY",
    detailNote: "2 / 2 PEN Blackstar Mainhand owned. Ready to synthesize Sovereign Mainhand!"
  },
  awakening: {
    slot: "AWAKENING",
    slotName: "Awakening Blackstar",
    ownedCount: 1,
    requiredForSovereign: 2,
    sovereignStatus: "BLOCKED",
    detailNote: "1 / 2 PEN Blackstar Awakening owned. CRITICAL BLOCKER: Missing 1x PEN Blackstar Awakening!"
  },
  subweapon: {
    slot: "SUB",
    slotName: "Sub-weapon Blackstar / Kutum",
    ownedCount: 1,
    requiredForSovereign: 1,
    sovereignStatus: "READY",
    detailNote: "1 / 1 PEN Blackstar Sub + Gem of Twilight available."
  },
  totalPenOwned: 4,
  totalPenRequired: 5,
  nextCriticalAction: "Obtain PEN Blackstar Awakening x1 to unlock Sovereign Awakening Weapon Synth.",
  selectableBoxWarning: "CRITICAL ALERT: If opening a Selectable PEN Blackstar Weapon Box, CHOOSE AWAKENING WEAPON. Choosing Mainhand will cause a redundant duplicate and waste 85 Billion Silver!"
};
