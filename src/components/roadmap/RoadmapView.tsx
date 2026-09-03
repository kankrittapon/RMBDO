'use client';

import React, { useState } from 'react';
import {
  Milestone,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Info,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { masterCheckpointsList, CheckpointNode } from '@/data/progression/checkpoints';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { CheckpointStatus } from '@/types/profile';
import { cn } from '@/lib/utils';

interface RoadmapViewProps {
  store: ReturnType<typeof useRoadmapStore>;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ store }) => {
  const {
    profile,
    progressStats,
    setSelectedDrawerNodeId,
    setSeasonTaskStatus,
    setOlviaCombatTaskStatus,
    setOlviaLifeTaskStatus
  } = store;

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', label: 'ทั้งหมด (All)' },
    { id: 'FOUNDATION', label: 'รากฐาน (Season)' },
    { id: 'WEAPONS', label: 'อาวุธ & Blackstar' },
    { id: 'ACADEMY', label: 'Olvia ต่อสู้' },
    { id: 'LIFE_SKILL', label: 'Olvia Life' },
    { id: 'ENDGAME_GEAR', label: 'ราชัน & เกราะเทพ' },
    { id: 'PERMANENT_STATS', label: 'บันทึกผจญภัย' },
    { id: 'TREASURE', label: 'สมบัติโบราณ' },
    { id: 'WAR_READY', label: 'ความพร้อม War' }
  ];

  const filteredCheckpoints = masterCheckpointsList.filter((cp) => {
    if (selectedCategory === 'ALL') return true;
    return cp.category === selectedCategory;
  });

  const getCheckpointDerivedProgress = (node: CheckpointNode) => {
    if (node.id === 'cp_season') {
      return progressStats.season;
    }
    if (node.id === 'cp_hyperboost') {
      return progressStats.hyperboost;
    }
    if (node.id === 'cp_olvia_combat') {
      return progressStats.olviaCombat;
    }
    if (node.id === 'cp_olvia_life') {
      return progressStats.olviaLife;
    }
    if (node.id === 'cp_slumbering_armors') {
      return progressStats.slumberingOrigin;
    }
    if (node.id === 'cp_kharazad_accessories') {
      return progressStats.kharazad;
    }
    if (node.id === 'cp_infinite_potions') {
      return progressStats.treasures;
    }
    if (node.id === 'cp_war_readiness') {
      return progressStats.war;
    }
    return null;
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      
      {/* Header Banner */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
          <div>
            <div className="flex items-center gap-2 text-brand-primary font-mono text-xs uppercase tracking-wider mb-1">
              <Milestone className="w-4 h-4 text-brand-primary" />
              <span>ลำดับขั้นการพัฒนาบัญชี (Progression Checkpoint Hierarchy)</span>
            </div>
            <h1 className="text-lg md:text-xl font-heading font-bold text-text-primary">
              เส้นทางพัฒนาบัญชีจากศูนย์สู่ระดับแนวหน้า (Zero to Apex)
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              คลิกที่จุดตรวจเพื่อดูรายละเอียด ข้อกำหนด รางวัล คำเตือนความปลอดภัย และแผนงานขั้นถัดไป
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-2.5 py-1 rounded text-[11px] shrink-0 transition-colors",
                selectedCategory === cat.id
                  ? "bg-brand-primary text-white font-bold"
                  : "bg-bg-surface-2 text-text-muted hover:text-text-primary"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Checkpoints Timeline Cards */}
      <div className="space-y-3">
        {filteredCheckpoints.map((node, index) => {
          const stats = getCheckpointDerivedProgress(node);

          return (
            <div
              key={node.id}
              className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-sm hover:border-border-active transition-all space-y-3 cursor-pointer group"
              onClick={() => setSelectedDrawerNodeId(node.id)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-surface-3 text-brand-primary font-bold">
                      จุดตรวจ #{node.order}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">
                      หมวด: {node.category}
                    </span>
                  </div>
                  <h2 className="text-base font-heading font-bold text-text-primary group-hover:text-brand-primary transition-colors flex items-center gap-2">
                    <span>{node.title}</span>
                  </h2>
                  <span className="text-xs font-mono text-text-muted block">
                    {node.englishTitle}
                  </span>
                </div>

                {/* Progress / Status Pill */}
                <div className="flex items-center gap-3 shrink-0">
                  {stats ? (
                    <div className="text-right font-mono text-xs">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-text-muted">ความคืบหน้า:</span>
                        <span className={stats.pct === 100 ? "text-emerald-400 font-bold" : "text-brand-gold font-bold"}>
                          {stats.completed} / {stats.total} ({stats.pct}%)
                        </span>
                      </div>
                      <div className="w-28 bg-bg-surface-3 h-1.5 rounded-full overflow-hidden mt-1 ml-auto">
                        <div
                          className={cn("h-full transition-all duration-300", stats.pct === 100 ? "bg-emerald-500" : "bg-brand-primary")}
                          style={{ width: `${stats.pct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-bg-surface-3 text-text-secondary border border-border-subtle">
                      ดูรายละเอียด
                    </span>
                  )}

                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Short Description */}
              <p className="text-xs text-text-secondary leading-relaxed border-t border-border-subtle/60 pt-2">
                {node.shortDesc}
              </p>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-bg-surface-2/60 p-2.5 rounded-lg border border-border-subtle/50">
                <div className="truncate">
                  <span className="text-text-muted text-[10px] block">เงื่อนไขสำคัญ:</span>
                  <span className="text-text-primary text-[11px] truncate">{node.requirements[0]}</span>
                </div>
                <div className="truncate">
                  <span className="text-text-muted text-[10px] block">รางวัลที่จะได้รับ:</span>
                  <span className="text-amber-300 text-[11px] font-bold truncate">★ {node.rewards[0]}</span>
                </div>
              </div>

              {node.safetyNote && (
                <div className="text-[11px] font-mono text-amber-300/90 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">ข้อควรระวัง: {node.safetyNote}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
