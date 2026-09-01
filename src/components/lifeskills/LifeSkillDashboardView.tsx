'use client';

import React from 'react';
import {
  Wheat,
  Utensils,
  Pickaxe,
  Crosshair,
  FlaskConical,
  Boxes,
  Fish,
  Sprout,
  Truck,
  Ship,
  Repeat,
  Sparkles,
  CheckCircle2,
  Coins
} from 'lucide-react';
import { lifeSkillList, LifeSkillItem } from '@/data/lifeskills/lifeSkills';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { cn } from '@/lib/utils';

interface LifeSkillDashboardViewProps {
  store: ReturnType<typeof useRoadmapStore>;
}

export const LifeSkillDashboardView: React.FC<LifeSkillDashboardViewProps> = ({ store }) => {
  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      
      {/* Header Banner */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider">
          <Wheat className="w-4 h-4 text-emerald-400" />
          <span>ระบบวิเคราะห์ความชำนาญสายอาชีพ & โบนัสผลผลิต (Life Skill Mastery Engine)</span>
        </div>
        <h1 className="text-lg md:text-xl font-heading font-bold text-text-primary">
          ระดับความชำนาญ 11 สายอาชีพ & การจัดส่งอาหารราชสำนัก
        </h1>
        <p className="text-xs text-text-secondary">
          ตรวจสอบจุดคุ้มทุนความชำนาญ (Mastery Breakpoints), โบนัสผลผลิตที่จะได้รับ, และเซ็ตอุปกรณ์มาโนสแนะนำ
        </p>
      </div>

      {/* 11 Life Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {lifeSkillList.map((ls) => (
          <div
            key={ls.id}
            className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 space-y-3 flex flex-col justify-between hover:border-border-active transition-colors shadow-sm"
          >
            <div className="space-y-2.5">
              
              <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                <div>
                  <h3 className="font-bold text-sm text-text-primary">{ls.name}</h3>
                  <span className="text-[11px] font-mono text-emerald-400 font-medium">
                    เลเวลเริ่มต้น: {ls.currentLevel}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-text-primary bg-bg-surface-3 px-2 py-0.5 rounded border border-border-subtle">
                    {ls.currentMastery} Mastery
                  </span>
                </div>
              </div>

              {/* Next Breakpoint */}
              <div className="p-2 rounded bg-bg-surface-2 border border-border-subtle space-y-1 text-xs font-mono">
                <div className="flex items-center justify-between text-[10px] text-text-muted">
                  <span>โบนัสขั้นถัดไป:</span>
                  <span className="text-amber-400 font-bold">{ls.nextBreakpointMastery} Mastery</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-tight">
                  ผลตอบแทน: <span className="text-text-primary font-medium">{ls.nextBreakpointBonus}</span>
                </p>
              </div>

              {/* Gear & Lightstone */}
              <div className="text-xs space-y-1 font-mono">
                <div className="text-[11px]">
                  <span className="text-text-muted">อุปกรณ์: </span>
                  <span className="text-text-secondary">{ls.recommendedGear}</span>
                </div>
                <div className="text-[11px]">
                  <span className="text-text-muted">หินแปรธาตุ: </span>
                  <span className="text-brand-gold font-medium">{ls.recommendedLightstone}</span>
                </div>
              </div>

              {/* Recommended Activity */}
              <div className="p-2 rounded bg-bg-surface-3/70 border border-border-subtle/50 text-[11px] text-text-secondary">
                <span className="text-brand-primary font-mono font-bold block mb-0.5">กิจกรรมแนะนำ:</span>
                {ls.recommendedActivity}
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
