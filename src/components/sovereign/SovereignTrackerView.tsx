'use client';

import React from 'react';
import {
  Zap,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Package,
  Flame,
  Gem,
  Info,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { hyperboostTasksList } from '@/data/progression/hyperboostTasks';
import { cn } from '@/lib/utils';

interface SovereignTrackerViewProps {
  store: ReturnType<typeof useRoadmapStore>;
}

export const SovereignTrackerView: React.FC<SovereignTrackerViewProps> = ({ store }) => {
  const { profile, setHyperboostClaim, resetCategory } = store;

  // Rewritten 2026-09-03, third pass: the Y-Challenge window does NOT
  // pre-assign boxes to Main/Awakening/Sub - every box lets the player
  // freely choose the slot when opened (confirmed against current official
  // Asia/SEA data). Tracking a rigid "2 Awakening + 1 Offhand" split was a
  // guess from an earlier pass and is wrong. Instead: track total PEN
  // Blackstar boxes owned (need 5 across both slots+sub: 2 for Main, 2 for
  // Awakening, 1 for Sub) as one pool, since the player assigns slots
  // themselves when opening each box - see hyperboostTasks.ts's top-of-file
  // comment for the full source breakdown (3 PEN direct + 2 TET upgradeable
  // to PEN, split across the Y-Challenge window and Olvia Combat Academy
  // Family Rewards, which are two genuinely different reward sources).
  const combatAcademyCapstone = profile.olviaCombatTasks['oc_sovereign_preparation'] === 'COMPLETED';

  const penBoxClaims = [
    profile.hyperboostClaims['y_pen_blackstar_1'],
    profile.hyperboostClaims['y_pen_blackstar_2_welcome'],
    { claimed: combatAcademyCapstone, used: false, status: combatAcademyCapstone ? ('COMPLETED' as const) : ('UNKNOWN' as const) },
    profile.hyperboostClaims['hb_tet_to_pen_upgrade']
  ];
  const totalPenOwned = penBoxClaims.filter((c) => c?.claimed).length;
  const subReadyClaimed = profile.hyperboostClaims['hb_sovereign_sub_ready']?.claimed ?? false;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      
      {/* Header Banner */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
          <div>
            <div className="flex items-center gap-2 text-brand-primary font-mono text-xs uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 text-brand-primary animate-pulse" />
              <span>ระบบบริหารจัดการอาวุธดวงดาวรัตติกาล & แท่นหลอมราชัน (Sovereign Forge)</span>
            </div>
            <h1 className="text-lg md:text-xl font-heading font-bold text-text-primary">
              แท่นหลอมอาวุธระดับโบราณกาลราชัน (Sovereign Tier 10)
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              ตรวจสอบจำนวน PEN Blackstar ในครอบครองเพื่อวางแผนเปิดกล่องเลือกอาวุธอย่างถูกต้อง ป้องกันการเปิดซ้ำซ้อน
            </p>
          </div>

          <button
            onClick={() => resetCategory('HYPERBOOST')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bg-surface-3 hover:bg-bg-surface-2 text-xs font-mono text-text-muted hover:text-red-400 border border-border-subtle transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ตหมวดนี้</span>
          </button>
        </div>

        {/* Anti-Trap Warning Banner */}
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-lg p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="uppercase tracking-wide">คำเตือนป้องกันข้อผิดพลาด: การเปิดกล่องเลือกอาวุธ PEN Blackstar Box</span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            การสร้างอาวุธราชันจำเป็นต้องใช้ PEN Blackstar 2 ชิ้นในช่องเดียวกัน (เช่น อาวุธตื่นพลัง x2 สำหรับทำราชันตื่นพลัง) อย่าเปิดกล่องเป็นอาวุธหลักซ้ำซ้อนหากยังไม่มีอาวุธตื่นพลังครบ 2 ชิ้น
          </p>
        </div>
      </div>

      {/* PEN Blackstar pool + Sub-weapon extra materials - the game lets you
          freely choose Main/Awakening/Sub when opening each box, so this
          tracks a shared pool (need 5 total: 2 Main + 2 Awakening + 1 Sub)
          rather than pretending each box is pre-assigned to a slot. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">

        {/* PEN Blackstar Pool */}
        <div className="bg-bg-surface-1 border border-brand-primary/40 rounded-xl p-4 space-y-3 flex flex-col justify-between shadow-sm">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-primary font-bold text-xs">
                  P
                </div>
                <span className="text-xs font-bold text-text-primary">คลัง PEN Blackstar (เลือก slot เองตอนเปิด)</span>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-mono font-bold",
                totalPenOwned >= 5 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
              )}>
                {totalPenOwned >= 5 ? "พร้อมหลอมราชันครบ 3 ชิ้น" : "กำลังสะสม"}
              </span>
            </div>

            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-text-muted">จำนวนที่มี:</span>
              <span className="text-sm font-bold text-brand-gold">{totalPenOwned} / 5 ชิ้น</span>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              ต้องการรวม 5 ชิ้น (HYPERBOOST-recommended route): Mainhand x2 + Awakening x1 + Sub x2 - มาจาก Y-Challenge (กล่อง #1, #2 Welcome Gift), Olvia Combat Academy (กล่อง #3), และ TET→PEN อัปเกรด 1 ชิ้น (จาก Darkstar Black Stone)
            </p>
          </div>
        </div>

        {/* Extra materials per piece - Flame goes to Awakening, Gem goes to
            Sub, confirmed by the user directly from the in-game Bonghwang
            Statue synthesis window (2026-09-05). An earlier version of this
            had it backwards (Flame assigned to Sub) based on an external
            guide that assumed a different, rigid recipe. */}
        <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                  +
                </div>
                <span className="text-xs font-bold text-text-primary">วัตถุดิบเสริมต่อชิ้น</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-bg-surface-3 text-text-muted">
                {subReadyClaimed ? "ครบแล้ว" : "ยังขาด"}
              </span>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              <b>Awakening</b>: Blackstar x1 + <b>Flame of the Primordial x1</b> (แลกจาก World Boss seal / Olvia Academy Coin)<br />
              <b>Sub</b>: Blackstar x2 + <b>Gem of Twilight x1</b> (จาก Combat Academy)
            </p>
          </div>
        </div>

      </div>

      {/* Hyperboost Item Claims Checklist */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-3">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <Package className="w-4 h-4 text-brand-primary" />
          รายการรับของรางวัล & สถานะการใช้งาน (Claim & Usage Checklist)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {hyperboostTasksList.map((task) => {
            const state = profile.hyperboostClaims[task.id] || { claimed: false, used: false, status: 'UNKNOWN' };

            return (
              <div
                key={task.id}
                className="p-3 rounded-lg bg-bg-surface-2 border border-border-subtle space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-text-primary">{task.title}</span>
                  {task.safetyTag === 'DO_NOT_OPEN_YET' && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                      [อย่าเพิ่งเปิด]
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  <button
                    onClick={() => setHyperboostClaim(task.id, 'claimed', !state.claimed)}
                    className={cn(
                      "py-1 px-2 rounded border transition-colors flex items-center justify-center gap-1",
                      state.claimed
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/40 font-bold"
                        : "bg-bg-surface-3 text-text-muted border-border-subtle"
                    )}
                  >
                    <span>{state.claimed ? "☑ รับของแล้ว" : "□ ยังไม่ได้รับ"}</span>
                  </button>

                  <button
                    onClick={() => setHyperboostClaim(task.id, 'used', !state.used)}
                    className={cn(
                      "py-1 px-2 rounded border transition-colors flex items-center justify-center gap-1",
                      state.used
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold"
                        : "bg-bg-surface-3 text-text-muted border-border-subtle"
                    )}
                  >
                    <span>{state.used ? "☑ ใช้งานแล้ว" : "□ ยังไม่ใช้"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
