'use client';

import React from 'react';
import {
  Swords,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { initialWarReadiness } from '@/data/war-readiness/criteria';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { cn } from '@/lib/utils';

interface WarReadinessViewProps {
  store: ReturnType<typeof useRoadmapStore>;
}

export const WarReadinessView: React.FC<WarReadinessViewProps> = ({ store }) => {
  const { profile, toggleWarReadinessCheck, progressStats } = store;

  const { completed, total, pct } = progressStats.war;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      
      {/* Header Banner */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
          <div>
            <div className="flex items-center gap-2 text-red-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Swords className="w-4 h-4 text-red-400" />
              <span>การประเมินความพร้อมสำหรับสงคราม (7-Pillar War Readiness Audit)</span>
            </div>
            <h1 className="text-lg md:text-xl font-heading font-bold text-text-primary">
              เกณฑ์ตรวจสอบความพร้อมสำหรับ Node War & Siege War
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              ติ๊กเลือกเสาหลัก 7 ด้านที่คุณผ่านเกณฑ์จริงเพื่อคำนวณความพร้อมในการเข้าร่วมสงครามกิลด์
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-text-muted">ความพร้อม:</span>
              <span className={pct >= 80 ? "text-emerald-400 font-bold" : "text-brand-gold font-bold"}>
                {completed} / {total} เสาหลัก ({pct}%)
              </span>
            </div>
            <div className="w-36 bg-bg-surface-3 h-2 rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-300", pct >= 80 ? "bg-emerald-500" : "bg-brand-primary")}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 7 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {initialWarReadiness.pillars.map((pillar) => {
          const isDone = Boolean(profile.warReadinessChecks[pillar.id]);

          return (
            <div
              key={pillar.id}
              onClick={() => toggleWarReadinessCheck(pillar.id)}
              className={cn(
                "p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 flex flex-col justify-between",
                isDone
                  ? "bg-bg-surface-1 border-emerald-500/40 shadow-sm"
                  : "bg-bg-surface-1 border-border-subtle hover:border-border-active"
              )}
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2 border-b border-border-subtle/80 pb-2">
                  <div>
                    <h3 className="font-bold text-xs md:text-sm text-text-primary">{pillar.name}</h3>
                    <span className="text-[10px] font-mono text-text-muted">ระดับ: {pillar.tier}</span>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0",
                    isDone ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-bg-surface-3 text-text-muted"
                  )}>
                    {isDone ? "ผ่านเกณฑ์แล้ว" : "ยังไม่ผ่าน"}
                  </span>
                </div>

                <div className="text-xs space-y-1 font-mono">
                  <div className="text-text-secondary">
                    <span className="text-text-muted">สเตตัสเป้าหมาย: </span>{pillar.score}
                  </div>
                  <div className="text-text-secondary">
                    <span className="text-text-muted">รายละเอียด: </span><span className="text-text-primary">{pillar.summary}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border-subtle/60 flex items-center justify-between text-[10px] font-mono text-text-muted">
                <span>คลิกเพื่อเปลี่ยนสถานะ</span>
                <span className={isDone ? "text-emerald-400 font-bold" : "text-amber-400"}>
                  {isDone ? "☑ ผ่านเกณฑ์" : "□ ติ๊กเมื่อผ่าน"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
