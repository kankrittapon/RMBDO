'use client';

import React, { useState } from 'react';
import { Gift, RotateCcw, LucideIcon } from 'lucide-react';
import { CheckpointStatus } from '@/types/profile';
import { cn } from '@/lib/utils';

// Generic checklist item shape shared by slumberingOriginArmor.ts and
// kharazadAccessories.ts (and structurally compatible with
// olviaCombatTasks.ts / olviaLifeTasks.ts, though those keep their own
// dedicated views rather than being migrated onto this to avoid touching
// already-working code).
export interface ChecklistTaskItem {
  id: string;
  title: string;
  category: string;
  objective: string;
  reward: string;
  isImportantReward: boolean;
  importantNote?: string;
  order: number;
}

interface TaskChecklistViewProps {
  icon: LucideIcon;
  headerLabel: string;
  title: string;
  description: string;
  tasks: ChecklistTaskItem[];
  statusMap: Record<string, CheckpointStatus>;
  onSetStatus: (taskId: string, status: CheckpointStatus) => void;
  onReset: () => void;
  progress: { completed: number; total: number; pct: number };
}

const STATUS_LABEL: Record<CheckpointStatus, string> = {
  COMPLETED: 'เสร็จแล้ว',
  IN_PROGRESS: 'กำลังทำ',
  NOT_STARTED: 'ยังไม่ทำ',
  UNKNOWN: 'ไม่แน่ใจ'
};

export const TaskChecklistView: React.FC<TaskChecklistViewProps> = ({
  icon: Icon,
  headerLabel,
  title,
  description,
  tasks,
  statusMap,
  onSetStatus,
  onReset,
  progress
}) => {
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'UNKNOWN'>('ALL');

  const filteredTasks = tasks.filter((task) => {
    const status = statusMap[task.id] || 'UNKNOWN';
    if (filter === 'ALL') return true;
    return status === filter;
  });

  const getStatusBadge = (status: CheckpointStatus) => {
    const styles: Record<CheckpointStatus, string> = {
      COMPLETED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      NOT_STARTED: "bg-bg-surface-3 text-text-muted border-border-subtle",
      UNKNOWN: "bg-amber-500/20 text-amber-400 border-amber-500/30"
    };
    return (
      <span className={cn("px-2 py-0.5 rounded text-[10px] font-mono font-bold border", styles[status])}>
        {STATUS_LABEL[status]}
      </span>
    );
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">

      {/* Header Banner */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
          <div>
            <div className="flex items-center gap-2 text-brand-primary font-mono text-xs uppercase tracking-wider mb-1">
              <Icon className="w-4 h-4 text-brand-primary" />
              <span>{headerLabel}</span>
            </div>
            <h1 className="text-lg md:text-xl font-heading font-bold text-text-primary">{title}</h1>
            <p className="text-xs text-text-secondary mt-0.5">{description}</p>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-text-muted">ความคืบหน้า:</span>
              <span className="text-base font-bold text-brand-gold">
                {progress.completed} / {progress.total} ({progress.pct}%)
              </span>
            </div>
            <div className="w-36 bg-bg-surface-3 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${progress.pct}%` }} />
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
                {f === 'ALL' ? 'ทั้งหมด (All)' : STATUS_LABEL[f]}
              </button>
            ))}
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-bg-surface-3 hover:bg-bg-surface-2 text-[11px] text-text-muted hover:text-red-400 border border-border-subtle transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>รีเซ็ตหมวดนี้</span>
          </button>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredTasks.map((task) => {
          const currentStatus = statusMap[task.id] || 'UNKNOWN';
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
                <div className="flex items-start justify-between gap-2 border-b border-border-subtle/80 pb-2">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-xs md:text-sm text-text-primary leading-snug">{task.title}</h3>
                    <span className="text-[10px] font-mono text-text-muted">หมวด: {task.category}</span>
                  </div>
                  {getStatusBadge(currentStatus)}
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">{task.objective}</p>

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
                  <div className="font-bold text-amber-300 text-xs">★ {task.reward}</div>
                </div>

                {task.importantNote && (
                  <div className="p-2 rounded bg-bg-surface-3/80 border border-border-subtle/60 text-[11px] text-text-muted font-mono leading-tight">
                    💡 <span className="text-text-secondary">{task.importantNote}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-border-subtle/60 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-text-muted">เปลี่ยนสถานะ:</span>
                <div className="flex items-center gap-1 font-mono text-[10px]">
                  {(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'UNKNOWN'] as CheckpointStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => onSetStatus(task.id, st)}
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
                      {STATUS_LABEL[st]}
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
};
