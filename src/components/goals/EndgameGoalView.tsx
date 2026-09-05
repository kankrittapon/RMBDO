'use client';

import React from 'react';
import { Target, CheckCircle2, Circle, ArrowRight, Info } from 'lucide-react';
import { endgameGoalStages, GoalMaterial } from '@/data/progression/endgameGoalMaterials';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { NavTabId } from '@/components/layout/NavigationSidebar';
import { cn } from '@/lib/utils';

interface EndgameGoalViewProps {
  store: ReturnType<typeof useRoadmapStore>;
  onNavigate: (tab: NavTabId) => void;
}

// Combines Sovereign Weapon (3 pcs) + Slumbering Origin armor (4 pcs) +
// Kharazad accessories (6 pcs) into one staged progression with a
// material shopping list - previously scattered across 3 separate
// checkpoint/view files with no combined view of "what do I still need,
// in what order". Every material quantity here is reformatted from data
// already verified elsewhere (see src/data/progression/endgameGoalMaterials.ts) -
// nothing new is invented here.
export const EndgameGoalView: React.FC<EndgameGoalViewProps> = ({ store, onNavigate }) => {
  const { profile, progressStats } = store;

  const isMaterialDone = (m: GoalMaterial): boolean => {
    if (!m.linkedTaskId) return false;
    // Sovereign materials live in hyperboostClaims; Kharazad's OCT upgrade
    // also happens to live there via kh_oct_upgrade's own task id pattern -
    // check both maps since the two stages use different profile fields.
    const hb = profile.hyperboostClaims[m.linkedTaskId];
    if (hb) return hb.status === 'COMPLETED' || hb.used;
    const kh = profile.kharazadTasks[m.linkedTaskId];
    if (kh) return kh === 'COMPLETED';
    return false;
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-red-400 font-mono text-xs uppercase tracking-wider">
          <Target className="w-4 h-4" />
          <span>เป้าหมาย Hyperboost — Endgame Gear Goal</span>
        </div>
        <h1 className="text-lg md:text-xl font-heading font-bold text-text-primary">
          ราชันครบชุด + เกราะเทพครบชุด + คาราซัด PEN ครบชุด
        </h1>
        <p className="text-xs text-text-secondary">
          รวม 3 เป้าหมายที่เคยกระจายอยู่คนละหน้าไว้ในที่เดียว — ดูภาพรวมว่าทำไปถึงไหน ต้องการวัตถุดิบอะไรอีกบ้าง เรียงตามลำดับที่ควรทำก่อน-หลัง
        </p>
      </div>

      <div className="space-y-4">
        {endgameGoalStages.map((stage) => {
          const stats = stage.progressStatsKey ? progressStats[stage.progressStatsKey] : null;
          const sovereignLinked = stage.materials.filter((m) => m.linkedTaskId);
          const sovereignDone = sovereignLinked.filter(isMaterialDone).length;
          const pct = stats ? stats.pct : sovereignLinked.length > 0 ? Math.round((sovereignDone / sovereignLinked.length) * 100) : 0;

          return (
            <div key={stage.id} className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-2">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-surface-3 text-brand-primary font-bold mr-2">
                    ขั้นที่ {stage.order}
                  </span>
                  <h2 className="text-sm font-bold text-text-primary inline">{stage.title}</h2>
                  <span className="text-[10px] font-mono text-text-muted block mt-0.5">{stage.englishTitle}</span>
                </div>
                <button
                  onClick={() => onNavigate(stage.viewTab as NavTabId)}
                  className="flex items-center gap-1 self-start sm:self-auto px-2.5 py-1.5 rounded-lg bg-bg-surface-3 hover:bg-bg-surface-2 text-[11px] font-mono text-text-secondary hover:text-text-primary border border-border-subtle"
                >
                  ไปหน้ารายละเอียด <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {stage.gatingRequirement && (
                <div className="flex items-start gap-2 text-[11px] text-text-secondary">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-text-muted" />
                  <span>{stage.gatingRequirement}</span>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-text-muted">ความคืบหน้า</span>
                  <span className={cn('font-bold', pct === 100 ? 'text-emerald-400' : 'text-brand-gold')}>{pct}%</span>
                </div>
                <div className="w-full bg-bg-surface-3 h-1.5 rounded-full overflow-hidden">
                  <div className={cn('h-full transition-all duration-300', pct === 100 ? 'bg-emerald-500' : 'bg-brand-primary')} style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {stage.materials.map((m) => {
                  const done = isMaterialDone(m);
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        'flex items-start gap-2 p-2.5 rounded-lg border text-xs',
                        done ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-bg-surface-2 border-border-subtle'
                      )}
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className={cn('font-bold truncate', done ? 'text-emerald-300' : 'text-text-primary')}>{m.name}</span>
                          <span className="text-text-muted font-mono text-[10px] shrink-0">x{m.quantity}</span>
                        </div>
                        {m.note && <p className="text-[10px] text-text-muted mt-0.5 leading-snug">{m.note}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
