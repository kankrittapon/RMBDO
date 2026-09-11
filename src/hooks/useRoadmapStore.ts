'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  PlayerProfile,
  PlayerStats,
  PlayerGearSlot,
  CheckpointStatus,
  GearSlotStatus
} from '@/types/profile';
import { seasonTasksList } from '@/data/progression/seasonTasks';
import { hyperboostTasksList } from '@/data/progression/hyperboostTasks';
import { olviaCombatTasksList } from '@/data/progression/olviaCombatTasks';
import { olviaLifeTasksList } from '@/data/progression/olviaLifeTasks';
import { slumberingOriginPiecesList } from '@/data/gear/slumberingOriginArmor';
import { kharazadPiecesList } from '@/data/gear/kharazadAccessories';
import { olviaSubCoursesList } from '@/data/progression/olviaSubCourses';
import { masterCheckpointsList } from '@/data/progression/checkpoints';
import { treasureList } from '@/data/treasures/treasureList';
import { permanentJournals } from '@/data/permanent/journals';
import { initialGearSlots } from '@/data/gear/gearSlots';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';

const STORAGE_KEY_V2 = 'bdo_progression_state_v2';
const STORAGE_KEY_V1 = 'bdo_progression_state_v1';

export const initialEmptyProfile: PlayerProfile = {
  version: 'v2',
  hasCompletedSetup: false,
  primaryPaths: ['grind', 'life'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  stats: {
    ap: null,
    aap: null,
    dp: null,
    gearScore: null,
    characterClass: 'Witch',
    characterLevel: null,
    serverRegion: 'Asia / TH-SEA',
    isUnknownStats: true
  },
  gear: initialGearSlots.reduce((acc, slot) => {
    acc[slot.id] = {
      slotId: slot.id,
      slotName: slot.slotName,
      category: slot.category as any,
      itemName: slot.currentName,
      enhancementLevel: slot.currentEnhancement,
      status: 'UNKNOWN'
    };
    return acc;
  }, {} as Record<string, PlayerGearSlot>),
  seasonTasks: seasonTasksList.reduce((acc, t) => {
    acc[t.id] = 'UNKNOWN';
    return acc;
  }, {} as Record<string, CheckpointStatus>),
  hyperboostClaims: hyperboostTasksList.reduce((acc, t) => {
    acc[t.id] = { claimed: false, used: false, status: 'UNKNOWN' };
    return acc;
  }, {} as Record<string, { claimed: boolean; used: boolean; status: CheckpointStatus }>),
  olviaCombatTasks: olviaCombatTasksList.reduce((acc, t) => {
    acc[t.id] = 'UNKNOWN';
    return acc;
  }, {} as Record<string, CheckpointStatus>),
  olviaLifeTasks: olviaLifeTasksList.reduce((acc, t) => {
    acc[t.id] = 'UNKNOWN';
    return acc;
  }, {} as Record<string, CheckpointStatus>),
  slumberingOriginTasks: slumberingOriginPiecesList.reduce((acc, t) => {
    acc[t.id] = 'UNKNOWN';
    return acc;
  }, {} as Record<string, CheckpointStatus>),
  kharazadTasks: kharazadPiecesList.reduce((acc, t) => {
    acc[t.id] = 'UNKNOWN';
    return acc;
  }, {} as Record<string, CheckpointStatus>),
  subCourseProgress: olviaSubCoursesList.reduce((acc, c) => {
    acc[c.id] = 0;
    return acc;
  }, {} as Record<string, number>),
  journalChapters: {
    bartali_1: 'UNKNOWN',
    bartali_2: 'UNKNOWN',
    bartali_3: 'UNKNOWN',
    deve_1: 'UNKNOWN',
    dorin_1: 'UNKNOWN',
    herald_1: 'UNKNOWN',
    pavino_1: 'UNKNOWN',
    barrier_1: 'UNKNOWN',
    loml_1: 'UNKNOWN'
  },
  treasurePieces: {
    panacea: false,
    tintinnabulum: false,
    ash_halfmoon: false,
    markthanan_gland: false,
    narc_crimson_tear: false,
    valtarra_clairvoyance: false,
    map_piece_1: false,
    map_piece_2: false,
    map_piece_3: false,
    map_piece_4: false,
    compass_vodkhan: false,
    compass_elten: false,
    compass_aakman: false,
    telescope_tungrad: false,
    telescope_city: false,
    telescope_scholar: false,
    krogdalo_arduanatt: false,
    krogdalo_dine: false,
    krogdalo_doom: false,
    merchant_ring_1: false
  },
  checkpointOverrides: {},
  safetyItemLocks: {
    gem_twilight: true,
    flame_primordial: true,
    flame_despair: true,
    flame_frost: true,
    flame_hongik: true,
    flame_resonance: true,
    pen_bs_box: true,
    specter_energy: true,
    weapon_exchange_coupon: true,
    valks_200: true
  },
  customNotes: ''
};

export function useRoadmapStore() {
  const [profile, setProfile] = useState<PlayerProfile>(initialEmptyProfile);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasV1Data, setHasV1Data] = useState(false);
  const [selectedDrawerNodeId, setSelectedDrawerNodeId] = useState<string | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string>('gyfin_underground');
  const [selectedClassId, setSelectedClassId] = useState<string>('witch_awakening');

  // Login / cross-device sync (added 2026-09-07). localStorage stays the
  // fast, always-on cache; when signed in, the same profile blob also
  // mirrors to Postgres (user_profiles, one JSONB row per user) so it
  // follows the account across devices/browsers instead of being stuck on
  // one machine. Logged-out behavior is unchanged from before this existed.
  const auth = useAuth();
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [hasPulledCloudProfile, setHasPulledCloudProfile] = useState(false);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      // Check for v1 data
      const v1Raw = localStorage.getItem(STORAGE_KEY_V1);
      if (v1Raw && !localStorage.getItem(STORAGE_KEY_V2)) {
        setHasV1Data(true);
      }

      // Check for v2 data
      const v2Raw = localStorage.getItem(STORAGE_KEY_V2);
      if (v2Raw) {
        const parsed = JSON.parse(v2Raw);
        if (parsed.version === 'v2') {
          // Backfill fields added after this profile was first saved
          // (slumberingOriginTasks/kharazadTasks, added 2026-09-03) so older
          // saved profiles don't crash on missing keys.
          if (!parsed.slumberingOriginTasks) parsed.slumberingOriginTasks = initialEmptyProfile.slumberingOriginTasks;
          if (!parsed.kharazadTasks) parsed.kharazadTasks = initialEmptyProfile.kharazadTasks;
          if (!parsed.subCourseProgress) parsed.subCourseProgress = initialEmptyProfile.subCourseProgress;
          if (!parsed.primaryPaths) parsed.primaryPaths = initialEmptyProfile.primaryPaths;
          if (!parsed.checkpointOverrides) parsed.checkpointOverrides = {};
          setProfile(parsed);
        }
      }
    } catch (e) {
      console.warn('LocalStorage hydration warning:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage v2 on profile change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const toSave = {
        ...profile,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(toSave));
    } catch (e) {
      console.error('Failed to save to localStorage v2:', e);
    }
  }, [profile, isHydrated]);

  // Pull the cloud profile once per login (after local hydration finishes,
  // so we have something real to compare against). Whichever side has the
  // newer updatedAt wins - this handles both "first login on a new device"
  // (cloud is newer/only copy, adopt it) and "signed up just now with
  // existing local progress" (local is newer/only copy, push it up) without
  // needing a separate "is this a new account" flag.
  useEffect(() => {
    if (!isHydrated || !auth.session || !supabase || hasPulledCloudProfile) return;
    const userId = auth.session.user.id;
    setCloudSyncStatus('syncing');
    supabase
      .from('user_profiles')
      .select('profile, updated_at')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        setHasPulledCloudProfile(true);
        if (error) {
          console.error('Cloud profile pull failed:', error.message);
          setCloudSyncStatus('error');
          return;
        }
        if (data?.profile) {
          const cloudUpdatedAt = new Date(data.updated_at).getTime();
          const localUpdatedAt = new Date(profile.updatedAt).getTime();
          if (cloudUpdatedAt > localUpdatedAt) {
            const incoming = data.profile as PlayerProfile;
            if (!incoming.primaryPaths) incoming.primaryPaths = initialEmptyProfile.primaryPaths;
            if (!incoming.checkpointOverrides) incoming.checkpointOverrides = {};
            setProfile(incoming);
          }
          // else: local is newer (or equal) - keep it, the push-effect
          // below will overwrite the cloud row with it shortly.
        }
        setCloudSyncStatus('synced');
      });
    // profile.updatedAt intentionally excluded - this should only run once
    // right after login, not re-run every time the profile changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, auth.session, hasPulledCloudProfile]);

  // Reset the "already pulled" flag on logout, so a different account
  // logging in next does its own fresh pull instead of reusing this one's.
  useEffect(() => {
    if (!auth.session) setHasPulledCloudProfile(false);
  }, [auth.session]);

  // Push to the cloud on profile change, debounced (matches this project's
  // existing pattern of not hammering the network on every keystroke - see
  // the Life Skill Hub Mastery save button for the non-debounced-on-purpose
  // counterexample, which is fine there because it's an explicit button
  // click, not a stream of automatic state changes like this one).
  useEffect(() => {
    if (!isHydrated || !auth.session || !supabase || !hasPulledCloudProfile) return;
    const userId = auth.session.user.id;
    const timer = setTimeout(() => {
      setCloudSyncStatus('syncing');
      supabase!
        .from('user_profiles')
        .upsert({ user_id: userId, profile, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) {
            console.error('Cloud profile push failed:', error.message);
            setCloudSyncStatus('error');
          } else {
            setCloudSyncStatus('synced');
          }
        });
    }, 1500);
    return () => clearTimeout(timer);
  }, [profile, isHydrated, auth.session, hasPulledCloudProfile]);

  // Actions
  const updateStats = useCallback((newStats: Partial<PlayerStats>) => {
    setProfile((prev) => {
      const nextStats = { ...prev.stats, ...newStats };
      if (nextStats.isUnknownStats) {
        nextStats.gearScore = null;
      } else if (nextStats.ap !== null && nextStats.dp !== null) {
        const higherAP = Math.max(nextStats.ap || 0, nextStats.aap || nextStats.ap || 0);
        nextStats.gearScore = higherAP + (nextStats.dp || 0);
      }
      return { ...prev, stats: nextStats };
    });
  }, []);

  const setSetupCompleted = useCallback((completed: boolean = true) => {
    setProfile((prev) => ({ ...prev, hasCompletedSetup: completed }));
  }, []);

  const setPrimaryPaths = useCallback((paths: Array<'grind' | 'life'>) => {
    const clean = paths.length > 0 ? paths : (['grind', 'life'] as Array<'grind' | 'life'>);
    setProfile((prev) => ({ ...prev, primaryPaths: clean }));
  }, []);

  const setCheckpointOverride = useCallback(
    (nodeId: string, patch: { rewards?: string[]; requirements?: string[]; nextRecommendedStep?: string }) => {
      setProfile((prev) => ({
        ...prev,
        checkpointOverrides: {
          ...prev.checkpointOverrides,
          [nodeId]: { ...patch, updatedAt: new Date().toISOString() },
        },
      }));
    },
    [],
  );

  const clearCheckpointOverride = useCallback((nodeId: string) => {
    setProfile((prev) => {
      const next = { ...prev.checkpointOverrides };
      delete next[nodeId];
      return { ...prev, checkpointOverrides: next };
    });
  }, []);

  const setGearSlot = useCallback((slotId: string, slotData: Partial<PlayerGearSlot>) => {
    setProfile((prev) => ({
      ...prev,
      gear: {
        ...prev.gear,
        [slotId]: {
          ...prev.gear[slotId],
          ...slotData
        }
      }
    }));
  }, []);

  const setSeasonTaskStatus = useCallback((taskId: string, status: CheckpointStatus) => {
    setProfile((prev) => ({
      ...prev,
      seasonTasks: {
        ...prev.seasonTasks,
        [taskId]: status
      }
    }));
  }, []);

  const setHyperboostClaim = useCallback(
    (taskId: string, field: 'claimed' | 'used' | 'status', value: boolean | CheckpointStatus) => {
      setProfile((prev) => {
        const current = prev.hyperboostClaims[taskId] || { claimed: false, used: false, status: 'UNKNOWN' };
        const updated = { ...current, [field]: value };
        if (field === 'claimed' && value === true && updated.status === 'NOT_STARTED') {
          updated.status = 'IN_PROGRESS';
        }
        if (field === 'used' && value === true) {
          updated.status = 'COMPLETED';
        }
        return {
          ...prev,
          hyperboostClaims: {
            ...prev.hyperboostClaims,
            [taskId]: updated
          }
        };
      });
    },
    []
  );

  const setOlviaCombatTaskStatus = useCallback((taskId: string, status: CheckpointStatus) => {
    setProfile((prev) => ({
      ...prev,
      olviaCombatTasks: {
        ...prev.olviaCombatTasks,
        [taskId]: status
      }
    }));
  }, []);

  const setOlviaLifeTaskStatus = useCallback((taskId: string, status: CheckpointStatus) => {
    setProfile((prev) => ({
      ...prev,
      olviaLifeTasks: {
        ...prev.olviaLifeTasks,
        [taskId]: status
      }
    }));
  }, []);

  const setSlumberingOriginTaskStatus = useCallback((taskId: string, status: CheckpointStatus) => {
    setProfile((prev) => ({
      ...prev,
      slumberingOriginTasks: {
        ...prev.slumberingOriginTasks,
        [taskId]: status
      }
    }));
  }, []);

  const setKharazadTaskStatus = useCallback((taskId: string, status: CheckpointStatus) => {
    setProfile((prev) => ({
      ...prev,
      kharazadTasks: {
        ...prev.kharazadTasks,
        [taskId]: status
      }
    }));
  }, []);

  const setSubCourseProgress = useCallback((subCourseId: string, completed: number) => {
    setProfile((prev) => ({
      ...prev,
      subCourseProgress: {
        ...prev.subCourseProgress,
        [subCourseId]: Math.max(0, completed)
      }
    }));
  }, []);

  const setJournalChapterStatus = useCallback((chapterId: string, status: CheckpointStatus) => {
    setProfile((prev) => ({
      ...prev,
      journalChapters: {
        ...prev.journalChapters,
        [chapterId]: status
      }
    }));
  }, []);

  const toggleTreasurePiece = useCallback((pieceId: string) => {
    setProfile((prev) => ({
      ...prev,
      treasurePieces: {
        ...prev.treasurePieces,
        [pieceId]: !prev.treasurePieces[pieceId]
      }
    }));
  }, []);

  const toggleSafetyItemLock = useCallback((itemId: string) => {
    setProfile((prev) => ({
      ...prev,
      safetyItemLocks: {
        ...prev.safetyItemLocks,
        [itemId]: !prev.safetyItemLocks[itemId]
      }
    }));
  }, []);

  const updateCustomNotes = useCallback((notes: string) => {
    setProfile((prev) => ({ ...prev, customNotes: notes }));
  }, []);

  // Category Resets
  const resetCategory = useCallback((category: 'SEASON' | 'HYPERBOOST' | 'OLVIA_COMBAT' | 'OLVIA_LIFE' | 'OLVIA_SUBCOURSES' | 'SLUMBERING_ORIGIN' | 'KHARAZAD' | 'GEAR' | 'TREASURES' | 'ALL') => {
    setProfile((prev) => {
      switch (category) {
        case 'SEASON':
          return { ...prev, seasonTasks: initialEmptyProfile.seasonTasks };
        case 'HYPERBOOST':
          return { ...prev, hyperboostClaims: initialEmptyProfile.hyperboostClaims };
        case 'OLVIA_COMBAT':
          return { ...prev, olviaCombatTasks: initialEmptyProfile.olviaCombatTasks };
        case 'OLVIA_LIFE':
          return { ...prev, olviaLifeTasks: initialEmptyProfile.olviaLifeTasks };
        case 'OLVIA_SUBCOURSES':
          return { ...prev, subCourseProgress: initialEmptyProfile.subCourseProgress };
        case 'SLUMBERING_ORIGIN':
          return { ...prev, slumberingOriginTasks: initialEmptyProfile.slumberingOriginTasks };
        case 'KHARAZAD':
          return { ...prev, kharazadTasks: initialEmptyProfile.kharazadTasks };
        case 'GEAR':
          return { ...prev, gear: initialEmptyProfile.gear };
        case 'TREASURES':
          return { ...prev, treasurePieces: initialEmptyProfile.treasurePieces };
        case 'ALL':
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY_V2);
          }
          return { ...initialEmptyProfile, createdAt: new Date().toISOString() };
        default:
          return prev;
      }
    });
  }, []);

  // Migration from v1
  const migrateV1Data = useCallback(() => {
    try {
      const v1Raw = localStorage.getItem(STORAGE_KEY_V1);
      if (!v1Raw) return;
      const v1 = JSON.parse(v1Raw);
      setProfile((prev) => ({
        ...prev,
        hasCompletedSetup: true,
        stats: {
          ap: v1.stats?.ap || 309,
          aap: v1.stats?.aap || 311,
          dp: v1.stats?.dp || 383,
          gearScore: (v1.stats?.ap && v1.stats?.dp) ? Math.max(v1.stats.ap, v1.stats.aap || v1.stats.ap) + v1.stats.dp : 694,
          characterClass: v1.stats?.characterClass || 'Witch',
          characterLevel: v1.stats?.characterLevel || 63,
          serverRegion: 'Asia / TH-SEA',
          isUnknownStats: false
        }
      }));
      setHasV1Data(false);
    } catch (e) {
      console.error('Migration failed:', e);
    }
  }, []);

  const dismissV1Migration = useCallback(() => {
    setHasV1Data(false);
  }, []);

  // Import / Export JSON
  const exportProfileJson = useCallback(() => {
    return JSON.stringify(profile, null, 2);
  }, [profile]);

  const importProfileJson = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.version === 'v2') {
        setProfile(parsed);
        return { success: true, message: 'นำเข้าข้อมูลโปรไฟล์สำเร็จเรียบร้อย' };
      }
      return { success: false, message: 'โครงสร้างไฟล์ JSON ไม่ถูกต้องสำหรับ v2' };
    } catch (e: any) {
      return { success: false, message: `เกิดข้อผิดพลาดในการนำเข้า: ${e.message}` };
    }
  }, []);

  // Derived Metrics & Progress
  const progressStats = useMemo(() => {
    // Season
    const seasonTotal = seasonTasksList.length;
    const seasonCompleted = Object.values(profile.seasonTasks).filter((s) => s === 'COMPLETED').length;
    const seasonUnknown = Object.values(profile.seasonTasks).filter((s) => s === 'UNKNOWN').length;

    // Hyperboost
    const hbTotal = hyperboostTasksList.length;
    const hbCompleted = Object.values(profile.hyperboostClaims).filter((c) => c.status === 'COMPLETED' || c.used).length;
    const hbUnknown = Object.values(profile.hyperboostClaims).filter((c) => c.status === 'UNKNOWN').length;

    // Olvia Combat
    const combatTotal = olviaCombatTasksList.length;
    const combatCompleted = Object.values(profile.olviaCombatTasks).filter((s) => s === 'COMPLETED').length;
    const combatUnknown = Object.values(profile.olviaCombatTasks).filter((s) => s === 'UNKNOWN').length;

    // Olvia Life
    const lifeTotal = olviaLifeTasksList.length;
    const lifeCompleted = Object.values(profile.olviaLifeTasks).filter((s) => s === 'COMPLETED').length;
    const lifeUnknown = Object.values(profile.olviaLifeTasks).filter((s) => s === 'UNKNOWN').length;

    // Slumbering Origin armor (4 pieces via Black Spirit Support quests)
    const slumberingOriginTotal = slumberingOriginPiecesList.length;
    const slumberingOriginCompleted = Object.values(profile.slumberingOriginTasks).filter((s) => s === 'COMPLETED').length;
    const slumberingOriginUnknown = Object.values(profile.slumberingOriginTasks).filter((s) => s === 'UNKNOWN').length;

    // Kharazad accessories (6 pieces + OCT upgrade via Alustin's Support)
    const kharazadTotal = kharazadPiecesList.length;
    const kharazadCompleted = Object.values(profile.kharazadTasks).filter((s) => s === 'COMPLETED').length;
    const kharazadUnknown = Object.values(profile.kharazadTasks).filter((s) => s === 'UNKNOWN').length;

    // Treasures
    const treasureTotal = Object.keys(profile.treasurePieces).length;
    const treasureCompleted = Object.values(profile.treasurePieces).filter(Boolean).length;

    return {
      season: { completed: seasonCompleted, total: seasonTotal, unknown: seasonUnknown, pct: Math.round((seasonCompleted / seasonTotal) * 100) },
      hyperboost: { completed: hbCompleted, total: hbTotal, unknown: hbUnknown, pct: Math.round((hbCompleted / hbTotal) * 100) },
      olviaCombat: { completed: combatCompleted, total: combatTotal, unknown: combatUnknown, pct: Math.round((combatCompleted / combatTotal) * 100) },
      olviaLife: { completed: lifeCompleted, total: lifeTotal, unknown: lifeUnknown, pct: Math.round((lifeCompleted / lifeTotal) * 100) },
      slumberingOrigin: { completed: slumberingOriginCompleted, total: slumberingOriginTotal, unknown: slumberingOriginUnknown, pct: Math.round((slumberingOriginCompleted / slumberingOriginTotal) * 100) },
      kharazad: { completed: kharazadCompleted, total: kharazadTotal, unknown: kharazadUnknown, pct: Math.round((kharazadCompleted / kharazadTotal) * 100) },
      treasures: { completed: treasureCompleted, total: treasureTotal, pct: Math.round((treasureCompleted / treasureTotal) * 100) }
    };
  }, [profile]);

  // Derived Current Phase & Next Actions
  const currentPhase = useMemo(() => {
    if (!profile.hasCompletedSetup) {
      return {
        id: 'SETUP',
        name: 'ตั้งค่าความคืบหน้าบัญชีเริ่มต้น',
        category: 'SETUP',
        badge: 'ขั้นตอนแรก',
        desc: 'กรอกข้อมูล Gear Score และตรวจสอบสิ่งที่ทำเสร็จแล้วเพื่อคำนวณเป้าหมายที่แท้จริง'
      };
    }
    if (progressStats.season.pct < 100) {
      return {
        id: 'SEASON',
        name: '1. เซิร์ฟเวอร์ซีซั่น & อุปกรณ์ทูบัลล่า (Season Progression)',
        category: 'FOUNDATION',
        badge: 'ซีซั่น',
        desc: 'ตีบวกอุปกรณ์ทูบัลล่า PEN ครบเซ็ต และสำเร็จการศึกษาเพื่อรับของขวัญซีซั่น'
      };
    }
    if (progressStats.hyperboost.pct < 75 || progressStats.olviaCombat.pct < 60) {
      return {
        id: 'OLVIA_ACADEMY',
        name: '2. สถาบัน Olvia Academy & จัดการอาวุธดวงดาวรัตติกาล PEN',
        category: 'ACADEMY',
        badge: 'ไฮเปอร์บูสต์ / Olvia',
        desc: 'เคลียร์ภารกิจสถาบัน รับกล่อง PEN/TET Blackstar จากภารกิจท้าทาย Y และ Combat Academy Capstone พร้อมหัวใจของกามอส'
      };
    }
    return {
      id: 'SOVEREIGN_FORGE',
      name: '3. อาวุธราชัน (Sovereign Weapon Forge) & เกราะเทพผู้ล่วงลับ',
      category: 'ENDGAME',
      badge: 'ราชัน / Endgame',
      desc: 'หลอมสร้างอาวุธราชัน Tier 10 และคราฟต์ชุดเกราะ Fallen God / Labreska / Dahn / Ator'
    };
  }, [profile.hasCompletedSetup, progressStats]);

  // Top 3 Next Actions
  const nextActions = useMemo(() => {
    const list: Array<{ title: string; category: string; reason: string; safetyNote?: string }> = [];

    // Check Season
    const uncompletedSeason = seasonTasksList.find((t) => profile.seasonTasks[t.id] !== 'COMPLETED');
    if (uncompletedSeason) {
      list.push({
        title: uncompletedSeason.title,
        category: 'ซีซั่น (Season)',
        reason: uncompletedSeason.description,
        safetyNote: uncompletedSeason.safetyNote
      });
    }

    // Check Hyperboost Claim
    const uncompletedHB = hyperboostTasksList.find(
      (t) => profile.hyperboostClaims[t.id]?.status !== 'COMPLETED' && !profile.hyperboostClaims[t.id]?.used
    );
    if (uncompletedHB) {
      list.push({
        title: uncompletedHB.title,
        category: 'ไฮเปอร์บูสต์ (Hyperboost)',
        reason: uncompletedHB.description,
        safetyNote: uncompletedHB.importantNote
      });
    }

    // Check Olvia Combat
    const uncompletedCombat = olviaCombatTasksList.find((t) => profile.olviaCombatTasks[t.id] !== 'COMPLETED');
    if (uncompletedCombat) {
      list.push({
        title: uncompletedCombat.title,
        category: 'Olvia สายต่อสู้',
        reason: uncompletedCombat.objective,
        safetyNote: uncompletedCombat.importantNote
      });
    }

    return list.slice(0, 3);
  }, [profile]);

  // Unverified Checkpoints (Unknown State)
  const unverifiedAudits = useMemo(() => {
    const items: Array<{ id: string; title: string; category: string }> = [];
    if (profile.stats.isUnknownStats) {
      items.push({ id: 'stats', title: 'ยังไม่ได้ระบุค่า AP / AAP / DP และระดับ Gear Score', category: 'ข้อมูลตัวละคร' });
    }
    if (progressStats.season.unknown > 0) {
      items.push({ id: 'season_unknown', title: `ภารกิจซีซั่นยังไม่ได้ตรวจสอบ (${progressStats.season.unknown} ข้อ)`, category: 'ซีซั่น' });
    }
    if (progressStats.hyperboost.unknown > 0) {
      items.push({ id: 'hb_unknown', title: `การรับ/ใช้อาวุธ Blackstar ยังไม่ได้ตรวจสอบ (${progressStats.hyperboost.unknown} ชิ้น)`, category: 'ไฮเปอร์บูสต์' });
    }
    if (progressStats.olviaCombat.unknown > 0) {
      items.push({ id: 'combat_unknown', title: `แบบฝึกหัด Olvia สายต่อสู้ยังไม่ได้ตรวจสอบ (${progressStats.olviaCombat.unknown} ข้อ)`, category: 'Olvia ต่อสู้' });
    }
    if (progressStats.olviaLife.unknown > 0) {
      items.push({ id: 'life_unknown', title: `แบบฝึกหัด Olvia สาย Life Skill ยังไม่ได้ตรวจสอบ (${progressStats.olviaLife.unknown} ข้อ)`, category: 'Olvia Life' });
    }
    if (progressStats.slumberingOrigin.unknown > 0) {
      items.push({ id: 'slumbering_origin_unknown', title: `ชุดเกราะ Slumbering Origin ยังไม่ได้ตรวจสอบ (${progressStats.slumberingOrigin.unknown} ชิ้น)`, category: 'เกราะเทพผู้ล่วงลับ' });
    }
    if (progressStats.kharazad.unknown > 0) {
      items.push({ id: 'kharazad_unknown', title: `เครื่องประดับ Kharazad ยังไม่ได้ตรวจสอบ (${progressStats.kharazad.unknown} ชิ้น)`, category: 'เครื่องประดับคาราซัด' });
    }
    return items;
  }, [profile.stats, progressStats]);

  return {
    profile,
    isHydrated,
    hasV1Data,
    selectedDrawerNodeId,
    selectedSpotId,
    selectedClassId,
    setSelectedDrawerNodeId,
    setSelectedSpotId,
    setSelectedClassId,
    updateStats,
    setSetupCompleted,
    setPrimaryPaths,
    setCheckpointOverride,
    clearCheckpointOverride,
    setGearSlot,
    setSeasonTaskStatus,
    setHyperboostClaim,
    setOlviaCombatTaskStatus,
    setOlviaLifeTaskStatus,
    setSlumberingOriginTaskStatus,
    setKharazadTaskStatus,
    setSubCourseProgress,
    setJournalChapterStatus,
    toggleTreasurePiece,
    toggleSafetyItemLock,
    updateCustomNotes,
    resetCategory,
    migrateV1Data,
    dismissV1Migration,
    exportProfileJson,
    importProfileJson,
    progressStats,
    currentPhase,
    nextActions,
    unverifiedAudits,
    auth,
    cloudSyncStatus
  };
}
