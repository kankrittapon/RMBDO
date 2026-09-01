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

  const bsMainClaims = [
    profile.hyperboostClaims['hb_tet_bs_challenge'],
    profile.hyperboostClaims['hb_olvia_welcome_pen_bs']
  ];
  const bsAwakeningClaims = [
    profile.hyperboostClaims['hb_pen_bs_lv61_challenge'],
    profile.hyperboostClaims['hb_sovereign_awakening_ready']
  ];
  const bsSubClaims = [
    profile.hyperboostClaims['hb_olvia_combat_pen_bs']
  ];

  const mainOwnedCount = bsMainClaims.filter((c) => c?.claimed).length;
  const awakeningOwnedCount = bsAwakeningClaims.filter((c) => c?.claimed).length;
  const subOwnedCount = bsSubClaims.filter((c) => c?.claimed).length;

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

      {/* 3 Weapon Audit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        {/* Mainhand */}
        <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
                  M
                </div>
                <span className="text-xs font-bold text-text-primary">อาวุธหลัก (Mainhand)</span>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-mono font-bold",
                mainOwnedCount >= 2 ? "bg-emerald-500/20 text-emerald-400" : "bg-bg-surface-3 text-text-muted"
              )}>
                {mainOwnedCount >= 2 ? "พร้อมหลอมราชัน" : "ยังขาดวัตถุดิบ"}
              </span>
            </div>

            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-text-muted">จำนวนที่มี:</span>
              <span className="text-sm font-bold text-text-primary">{mainOwnedCount} / 2 ชิ้น</span>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              ใช้สำหรับหลอมอาวุธราชันหลัก (Sovereign Mainhand) เพิ่มพลังโจมตีมอนสเตอร์พื้นฐาน
            </p>
          </div>
        </div>

        {/* Awakening */}
        <div className="bg-bg-surface-1 border border-brand-primary/40 rounded-xl p-4 space-y-3 flex flex-col justify-between shadow-sm">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-primary font-bold text-xs">
                  A
                </div>
                <span className="text-xs font-bold text-text-primary">อาวุธตื่นพลัง (Awakening)</span>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-mono font-bold",
                awakeningOwnedCount >= 2 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
              )}>
                {awakeningOwnedCount >= 2 ? "พร้อมหลอมราชัน" : "เป้าหมายอันดับ 1"}
              </span>
            </div>

            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-text-muted">จำนวนที่มี:</span>
              <span className="text-sm font-bold text-brand-gold">{awakeningOwnedCount} / 2 ชิ้น</span>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              เป้าหมายสำคัญที่สุดในการดัน Sheet AP 310+ สำหรับสาย Awakening
            </p>
          </div>
        </div>

        {/* Sub-weapon */}
        <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                  S
                </div>
                <span className="text-xs font-bold text-text-primary">อาวุธเสริม (Sub-weapon)</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-bg-surface-3 text-text-muted">
                {subOwnedCount >= 1 ? "มี PEN Blackstar" : "ยังขาด"}
              </span>
            </div>

            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-text-muted">จำนวนที่มี:</span>
              <span className="text-sm font-bold text-text-primary">{subOwnedCount} / 1 ชิ้น</span>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              ใช้ PEN Blackstar Sub หรือ PEN Kutum C20 สำหรับเตรียมอัปเกรดในอนาคต
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
