'use client';

import React, { useState } from 'react';
import {
  Swords,
  CheckCircle2,
  AlertTriangle,
  Gift,
  Shield,
  Zap,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Check
} from 'lucide-react';
import { olviaCombatTasksList, OlviaCombatTaskItem } from '@/data/progression/olviaCombatTasks';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { CheckpointStatus } from '@/types/profile';
import { SubCourseProgressPanel } from '@/components/shared/SubCourseProgressPanel';
import { cn } from '@/lib/utils';

interface OlviaCombatViewProps {
  store: ReturnType<typeof useRoadmapStore>;
}

// Grouping the previously-flat card list by category, with a one-line
// "why this group matters" - the flat list gave no sense of sequence or
// purpose beyond each individual quest's own objective text.
const CATEGORY_LABELS: Record<string, { label: string; why: string }> = {
  BASIC_TACTICS: { label: 'Basic Tactics (12 เควส)', why: 'ทำก่อนเสมอ - ปลดล็อกสิทธิ์ทำ Field Tactics ต่อ' },
  FIELD_TACTICS: { label: 'Field Tactics (19 เควส)', why: 'ทำต่อจาก Basic Tactics - ยังไม่มีชื่อเควสละเอียด มีแค่ตัวนับที่แผงด้านบน' },
  CAPSTONE: { label: 'Family Rewards - Combat', why: 'กล่องราชัน (PEN/TET Blackstar) ที่ใช้ตีอาวุธ Sovereign ในเป้าหมาย Hyperboost' },
  FOUNDATION: { label: 'พื้นฐาน', why: '' },
  MONSTER_ZONE: { label: 'พื้นที่มอนสเตอร์', why: '' },
  BOSS_CONQUEST: { label: 'ปราบบอส', why: '' },
  GEAR_SYNTHESIS: { label: 'สังเคราะห์อุปกรณ์', why: '' },
};
const CATEGORY_ORDER = ['BASIC_TACTICS', 'FIELD_TACTICS', 'CAPSTONE', 'FOUNDATION', 'MONSTER_ZONE', 'BOSS_CONQUEST', 'GEAR_SYNTHESIS'];

export const OlviaCombatView: React.FC<OlviaCombatViewProps> = ({ store }) => {
  const { profile, setOlviaCombatTaskStatus, setSubCourseProgress, progressStats, resetCategory } = store;
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'UNKNOWN'>('ALL');

  const { completed, total, pct } = progressStats.olviaCombat;

  const filteredTasks = olviaCombatTasksList.filter((task) => {
    const status = profile.olviaCombatTasks[task.id] || 'UNKNOWN';
    if (filter === 'ALL') return true;
    return status === filter;
  });

  const groupedTasks = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    tasks: filteredTasks.filter((t) => t.category === cat),
  })).filter((g) => g.tasks.length > 0);

  const getStatusBadge = (status: CheckpointStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">เสร็จแล้ว</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">กำลังทำ</span>;
      case 'NOT_STARTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-bg-surface-3 text-text-muted border border-border-subtle">ยังไม่ได้ทำ</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">ยังไม่แน่ใจ</span>;
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      
      {/* Header Banner */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
          <div>
            <div className="flex items-center gap-2 text-brand-primary font-mono text-xs uppercase tracking-wider mb-1">
              <Swords className="w-4 h-4 text-brand-primary" />
              <span>Olvia Academy — สายต่อสู้ (Combat Academy)</span>
            </div>
            <h1 className="text-lg md:text-xl font-heading font-bold text-text-primary">
              ภารกิจสถาบันการต่อสู้ & รางวัลระดับตำนาน
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              ติ๊กเลือกแบบฝึกหัดการต่อสู้ที่คุณทำสำเร็จแล้ว ระบบจะคำนวณความพร้อมสำหรับดัน AP/DP เข้าสู่ระดับ Endgame
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-text-muted">ความคืบหน้า:</span>
              <span className="text-base font-bold text-brand-gold">{completed} / {total} ({pct}%)</span>
            </div>
            <div className="w-36 bg-bg-surface-3 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['ALL', 'COMPLETED', 'IN_PROGRESS', 'UNKNOWN'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-2.5 py-1 rounded text-[11px] transition-colors",
                  filter === f
                    ? "bg-brand-primary text-white font-bold"
                    : "bg-bg-surface-2 text-text-muted hover:text-text-primary"
                )}
              >
                {f === 'ALL' ? 'ทั้งหมด (All)' : f === 'COMPLETED' ? 'เสร็จแล้ว' : f === 'IN_PROGRESS' ? 'กำลังทำ' : 'ยังไม่แน่ใจ'}
              </button>
            ))}
          </div>

          <button
            onClick={() => resetCategory('OLVIA_COMBAT')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-bg-surface-3 hover:bg-bg-surface-2 text-[11px] text-text-muted hover:text-red-400 border border-border-subtle transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>รีเซ็ตหมวดนี้</span>
          </button>
        </div>
      </div>

      <SubCourseProgressPanel branch="COMBAT" progress={profile.subCourseProgress} onSetProgress={setSubCourseProgress} />

      {/* Tasks grouped by category, in the order you should actually do them */}
      {groupedTasks.map((group) => {
        const groupDone = group.tasks.filter((t) => (profile.olviaCombatTasks[t.id] || 'UNKNOWN') === 'COMPLETED').length;
        const meta = CATEGORY_LABELS[group.category] || { label: group.category, why: '' };
        return (
          <div key={group.category} className="space-y-2.5">
            <div className="flex items-baseline justify-between px-1">
              <h2 className="text-sm font-bold text-text-primary">{meta.label}</h2>
              <span className="text-[11px] font-mono text-text-muted">{groupDone}/{group.tasks.length} เสร็จแล้ว</span>
            </div>
            {meta.why && <p className="text-[11px] text-text-muted px-1 -mt-1.5">{meta.why}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {group.tasks.map((task) => {
          const currentStatus = profile.olviaCombatTasks[task.id] || 'UNKNOWN';
          const isDone = currentStatus === 'COMPLETED';

          return (
            <div
              key={task.id}
              className={cn(
                "p-4 rounded-xl border transition-all space-y-3 flex flex-col justify-between",
                isDone
                  ? "bg-bg-surface-1/90 border-emerald-500/40 shadow-sm"
                  : "bg-bg-surface-1 border-border-subtle hover:border-border-active"
              )}
            >
              <div className="space-y-2">
                
                {/* Top Title & Status */}
                <div className="flex items-start justify-between gap-2 border-b border-border-subtle/80 pb-2">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-xs md:text-sm text-text-primary leading-snug">
                      {task.title}
                    </h3>
                    <span className="text-[10px] font-mono text-text-muted">
                      หมวด: {task.category}
                    </span>
                  </div>
                  {getStatusBadge(currentStatus)}
                </div>

                {/* Objective */}
                <p className="text-xs text-text-secondary leading-relaxed">
                  {task.objective}
                </p>

                {/* Reward Box */}
                <div className="p-2.5 rounded-lg bg-bg-surface-2 border border-border-subtle space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Gift className="w-3 h-3 text-amber-400" /> ของรางวัล:
                    </span>
                    {task.isImportantReward && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        [รางวัลสำคัญ]
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-amber-300 text-xs">
                    ★ {task.reward}
                  </div>
                </div>

                {/* Safety / Tactical Note */}
                {task.importantNote && (
                  <div className="p-2 rounded bg-bg-surface-3/80 border border-border-subtle/60 text-[11px] text-text-muted font-mono leading-tight">
                    💡 <span className="text-text-secondary">{task.importantNote}</span>
                  </div>
                )}

              </div>

              {/* Status Toggle Stepper */}
              <div className="pt-2 border-t border-border-subtle/60 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-text-muted">เปลี่ยนสถานะ:</span>
                <div className="flex items-center gap-1 font-mono text-[10px]">
                  {(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'UNKNOWN'] as CheckpointStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => setOlviaCombatTaskStatus(task.id, st)}
                      className={cn(
                        "px-2 py-0.5 rounded transition-colors",
                        currentStatus === st
                          ? st === 'COMPLETED'
                            ? "bg-emerald-500 text-white font-bold"
                            : st === 'IN_PROGRESS'
                            ? "bg-blue-500 text-white font-bold"
                            : st === 'NOT_STARTED'
                            ? "bg-bg-surface-3 text-text-primary font-bold"
                            : "bg-amber-500/30 text-amber-300 font-bold"
                          : "bg-bg-surface-3 text-text-muted hover:text-text-primary"
                      )}
                    >
                      {st === 'COMPLETED' ? 'เสร็จแล้ว' : st === 'IN_PROGRESS' ? 'กำลังทำ' : st === 'NOT_STARTED' ? 'ยังไม่ทำ' : 'ไม่แน่ใจ'}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          );
              })}
            </div>
          </div>
        );
      })}

    </div>
  );
};
