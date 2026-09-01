'use client';

import { useState, useEffect } from 'react';
import { initialPhases, ProgressionPhase, PhaseStatus } from '@/data/progression/phases';
import { initialGearSlots, GearSlotItem, GearStatus } from '@/data/gear/gearSlots';
import { initialSovereignTracker, SovereignTrackerState } from '@/data/gear/sovereignTracker';
import { treasureList, TreasureItem } from '@/data/treasures/treasureList';
import { permanentJournals, PermanentJournalItem } from '@/data/permanent/journals';
import { initialWarReadiness, WarReadinessState } from '@/data/war-readiness/criteria';
import { lifeSkillList, LifeSkillItem } from '@/data/lifeskills/lifeSkills';

export interface AccountStats {
  ap: number;
  aap: number;
  dp: number;
  gearScore: number;
  characterClass: string;
  characterLevel: number;
  serverRegion: string;
}

const STORAGE_KEY = 'bdo_progression_state_v1';

export function useRoadmapStore() {
  const [isHydrated, setIsHydrated] = useState(false);

  // Core Store States
  const [stats, setStats] = useState<AccountStats>({
    ap: 309,
    aap: 311,
    dp: 383,
    gearScore: 694,
    characterClass: 'Witch',
    characterLevel: 63,
    serverRegion: 'Asia / TH-SEA'
  });

  const [phases, setPhases] = useState<ProgressionPhase[]>(initialPhases);
  const [gearSlots, setGearSlots] = useState<GearSlotItem[]>(initialGearSlots);
  const [sovereign, setSovereign] = useState<SovereignTrackerState>(initialSovereignTracker);
  const [treasures, setTreasures] = useState<TreasureItem[]>(treasureList);
  const [journals, setJournals] = useState<PermanentJournalItem[]>(permanentJournals);
  const [warReadiness, setWarReadiness] = useState<WarReadinessState>(initialWarReadiness);
  const [lifeSkills, setLifeSkills] = useState<LifeSkillItem[]>(lifeSkillList);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>('sovereign');
  const [selectedSpotId, setSelectedSpotId] = useState<string>('gyfin_underground');
  const [selectedClassId, setSelectedClassId] = useState<string>('witch_awakening');

  // Hydrate from localStorage once on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.stats) setStats(parsed.stats);
        if (parsed.phases) setPhases(parsed.phases);
        if (parsed.gearSlots) setGearSlots(parsed.gearSlots);
        if (parsed.sovereign) setSovereign(parsed.sovereign);
        if (parsed.treasures) setTreasures(parsed.treasures);
        if (parsed.journals) setJournals(parsed.journals);
        if (parsed.warReadiness) setWarReadiness(parsed.warReadiness);
        if (parsed.lifeSkills) setLifeSkills(parsed.lifeSkills);
      }
    } catch (e) {
      console.warn('Failed to load local storage state:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage whenever state changes after hydration
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const stateToSave = {
        stats,
        phases,
        gearSlots,
        sovereign,
        treasures,
        journals,
        warReadiness,
        lifeSkills
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save store state to localStorage:', e);
    }
  }, [isHydrated, stats, phases, gearSlots, sovereign, treasures, journals, warReadiness, lifeSkills]);

  // Actions
  const updateStats = (newStats: Partial<AccountStats>) => {
    setStats((prev) => {
      const updated = { ...prev, ...newStats };
      updated.gearScore = Math.max(updated.ap, updated.aap) + updated.dp;
      return updated;
    });
  };

  const toggleTask = (phaseId: string, taskId: string) => {
    setPhases((prev) =>
      prev.map((phase) => {
        if (phase.id !== phaseId) return phase;
        const updatedTasks = phase.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        const allDone = updatedTasks.length > 0 && updatedTasks.every((t) => t.completed);
        const someDone = updatedTasks.some((t) => t.completed);
        const updatedStatus: PhaseStatus = allDone
          ? 'COMPLETED'
          : someDone
          ? 'IN_PROGRESS'
          : phase.status;
        return { ...phase, tasks: updatedTasks, status: updatedStatus };
      })
    );
  };

  const setPhaseStatus = (phaseId: string, status: PhaseStatus) => {
    setPhases((prev) =>
      prev.map((p) => (p.id === phaseId ? { ...p, status } : p))
    );
  };

  const setGearStatus = (slotId: string, status: GearStatus) => {
    setGearSlots((prev) =>
      prev.map((item) => (item.id === slotId ? { ...item, status } : item))
    );
  };

  const updateBlackstarCount = (slot: 'MAIN' | 'AWAKENING' | 'SUB', delta: number) => {
    setSovereign((prev) => {
      const key = slot === 'MAIN' ? 'mainhand' : slot === 'AWAKENING' ? 'awakening' : 'subweapon';
      const current = prev[key];
      const newCount = Math.max(0, Math.min(5, current.ownedCount + delta));
      const isReady = newCount >= current.requiredForSovereign;

      const updatedSlot = {
        ...current,
        ownedCount: newCount,
        sovereignStatus: (isReady ? 'READY' : 'BLOCKED') as 'READY' | 'BLOCKED' | 'CRAFTED'
      };

      const updated = {
        ...prev,
        [key]: updatedSlot
      };

      const totalOwned = updated.mainhand.ownedCount + updated.awakening.ownedCount + updated.subweapon.ownedCount;
      updated.totalPenOwned = totalOwned;

      if (updated.awakening.ownedCount < 2) {
        updated.nextCriticalAction = 'Obtain PEN Blackstar Awakening x1 to unlock Sovereign Awakening Weapon Synth.';
      } else if (updated.mainhand.ownedCount < 2) {
        updated.nextCriticalAction = 'Obtain PEN Blackstar Mainhand x1 for Sovereign Mainhand Synth.';
      } else {
        updated.nextCriticalAction = 'All PEN Blackstar requirements met! Proceed to Primordial Forge.';
      }

      return updated;
    });
  };

  const toggleTreasurePiece = (treasureId: string, pieceId: string) => {
    setTreasures((prev) =>
      prev.map((tr) => {
        if (tr.id !== treasureId) return tr;
        const updatedPieces = tr.pieces.map((pc) =>
          pc.id === pieceId ? { ...pc, obtained: !pc.obtained } : pc
        );
        return { ...tr, pieces: updatedPieces };
      })
    );
  };

  const toggleLifeSkillOlviaTask = (skillId: string, taskIndex: number) => {
    setLifeSkills((prev) =>
      prev.map((skill) => {
        if (skill.id !== skillId) return skill;
        return skill;
      })
    );
  };

  const resetAllData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setStats({
      ap: 309,
      aap: 311,
      dp: 383,
      gearScore: 694,
      characterClass: 'Witch',
      characterLevel: 63,
      serverRegion: 'Asia / TH-SEA'
    });
    setPhases(initialPhases);
    setGearSlots(initialGearSlots);
    setSovereign(initialSovereignTracker);
    setTreasures(treasureList);
    setJournals(permanentJournals);
    setWarReadiness(initialWarReadiness);
    setLifeSkills(lifeSkillList);
  };

  return {
    isHydrated,
    stats,
    updateStats,
    phases,
    toggleTask,
    setPhaseStatus,
    selectedPhaseId,
    setSelectedPhaseId,
    gearSlots,
    setGearStatus,
    sovereign,
    updateBlackstarCount,
    treasures,
    toggleTreasurePiece,
    journals,
    warReadiness,
    lifeSkills,
    toggleLifeSkillOlviaTask,
    selectedSpotId,
    setSelectedSpotId,
    selectedClassId,
    setSelectedClassId,
    resetAllData
  };
}
