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
  const { lifeSkills } = store;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      
      {/* Header Banner */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider">
          <Wheat className="w-4 h-4 text-emerald-400" />
          <span>Life Skill Mastery & Olvia Academy Economy Engine</span>
        </div>
        <h1 className="text-lg font-heading font-bold text-text-primary">
          LIFE SKILL MASTERY & IMPERIAL DELIVERY DASHBOARD
        </h1>
        <p className="text-xs text-text-secondary">
          Track 11 life skill masteries, upcoming bracket yield thresholds, Manos gear recommendations, and Olvia Academy daily checklists.
        </p>
      </div>

      {/* 11 Life Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {lifeSkills.map((ls) => (
          <div
            key={ls.id}
            className="bg-bg-surface-1 border border-border-subtle rounded-lg p-3.5 space-y-3 flex flex-col justify-between hover:border-border-active transition-colors"
          >
            <div className="space-y-2.5">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                <div>
                  <h3 className="font-bold text-sm text-text-primary">{ls.name}</h3>
                  <span className="text-[11px] font-mono text-emerald-400 font-medium">
                    Level: {ls.currentLevel}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-text-primary bg-bg-surface-3 px-2 py-0.5 rounded border border-border-subtle">
                    {ls.currentMastery} Mastery
                  </span>
                </div>
              </div>

              {/* Next Breakpoint Bonus */}
              <div className="p-2 rounded bg-bg-surface-2 border border-border-subtle space-y-1 text-xs font-mono">
                <div className="flex items-center justify-between text-[10px] text-text-muted">
                  <span>Next Breakpoint:</span>
                  <span className="text-amber-400 font-bold">{ls.nextBreakpointMastery} Mastery</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-tight">
                  Bonus: <span className="text-text-primary font-medium">{ls.nextBreakpointBonus}</span>
                </p>
              </div>

              {/* Gear & Lightstone Recommendation */}
              <div className="text-xs space-y-1">
                <div className="text-[11px]">
                  <span className="text-text-muted font-mono">Gear: </span>
                  <span className="text-text-secondary">{ls.recommendedGear}</span>
                </div>
                <div className="text-[11px]">
                  <span className="text-text-muted font-mono">Lightstone: </span>
                  <span className="text-brand-gold font-medium">{ls.recommendedLightstone}</span>
                </div>
              </div>

              {/* Recommended Activity */}
              <div className="p-2 rounded bg-bg-surface-3/70 border border-border-subtle/50 text-[11px] text-text-secondary">
                <span className="text-brand-primary font-mono font-bold block mb-0.5">Tactical Activity:</span>
                {ls.recommendedActivity}
              </div>

            </div>

            {/* Olvia Tasks Mini Checklist */}
            <div className="pt-2 border-t border-border-subtle space-y-1 text-xs">
              <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                <span>Olvia Academy Goals:</span>
                <span className={ls.olviaAcademyCompleted ? "text-emerald-400 font-bold" : "text-amber-400"}>
                  {ls.olviaAcademyCompleted ? "[ACADEMY PASS]" : "[IN PROGRESS]"}
                </span>
              </div>
              <div className="space-y-0.5 text-[10px] text-text-secondary font-mono">
                {ls.olviaTasks.map((t, idx) => (
                  <div key={idx} className="truncate">
                    • {t}
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
