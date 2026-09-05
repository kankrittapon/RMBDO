'use client';

import React, { useState } from 'react';
import {
  Wheat,
  CheckCircle2,
  Gift,
  Sparkles,
  RotateCcw,
  Check,
  Tag
} from 'lucide-react';
import { olviaLifeTasksList, OlviaLifeTaskItem } from '@/data/progression/olviaLifeTasks';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { CheckpointStatus } from '@/types/profile';
import { SubCourseProgressPanel } from '@/components/shared/SubCourseProgressPanel';
import { cn } from '@/lib/utils';

interface OlviaLifeViewProps {
  store: ReturnType<typeof useRoadmapStore>;
}

export const OlviaLifeView: React.FC<OlviaLifeViewProps> = ({ store }) => {
  const { profile, setOlviaLifeTaskStatus, setSubCourseProgress, progressStats, resetCategory } = store;
  const [selectedSkill, setSelectedSkill] = useState<string>('ALL');

  const { completed, total, pct } = progressStats.olviaLife;

  const skillsList = [
    { id: 'ALL', name: 'ทั้งหมด (All Skills)' },
    { id: 'gathering', name: 'เก็บรวบรวม' },
    { id: 'cooking', name: 'ทำอาหาร' },
    { id: 'hunting', name: 'ล่าสัตว์' },
    { id: 'alchemy', name: 'แปรธาตุ' },
    { id: 'processing', name: 'แปรรูป' },
    { id: 'training', name: 'ฝึกสัตว์' },
    { id: 'fishing', name: 'ตกปลา' },
    { id: 'farming', name: 'เพาะปลูก' },
    { id: 'sailing_barter', name: 'เดินเรือ/แลกเปลี่ยน' },
    { id: 'family_reward', name: 'รางวัลรวม' }
  ];

  const filteredTasks = olviaLifeTasksList.filter((task) => {
    if (selectedSkill === 'ALL') return true;
    return task.skillId === selectedSkill;
  });

  // When showing everything, group by skill (in the same order as the
  // filter tabs above) instead of one long flat list - it was previously
  // impossible to tell where one skill's steps ended and the next began.
  const groupedTasks = selectedSkill === 'ALL'
    ? skillsList
        .filter((sk) => sk.id !== 'ALL')
        .map((sk) => ({ skill: sk, tasks: filteredTasks.filter((t) => t.skillId === sk.id) }))
        .filter((g) => g.tasks.length > 0)
    : [{ skill: skillsList.find((sk) => sk.id === selectedSkill)!, tasks: filteredTasks }];

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      
      {/* Header Banner */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Wheat className="w-4 h-4 text-emerald-400" />
              <span>Olvia Academy — สายอาชีพ (Life Skill Academy)</span>
            </div>
            <h1 className="text-lg md:text-xl font-heading font-bold text-text-primary">
              หลักสูตรสายอาชีพ 9 สาขา & รางวัลจบครบคอร์ส
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              ติ๊กเลือกขั้นตอนที่คุณทำสำเร็จแล้ว (สายเควส / Final Proof / รางวัลจบคอร์ส) เพื่อคำนวณความคืบหน้า
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-text-muted">ความคืบหน้า:</span>
              <span className="text-base font-bold text-emerald-400">{completed} / {total} ({pct}%)</span>
            </div>
            <div className="w-36 bg-bg-surface-3 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {/* Skill Category Selector */}
        <div className="flex items-center justify-between gap-2 text-xs font-mono flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {skillsList.map((sk) => (
              <button
                key={sk.id}
                onClick={() => setSelectedSkill(sk.id)}
                className={cn(
                  "px-2.5 py-1 rounded text-[11px] shrink-0 transition-colors",
                  selectedSkill === sk.id
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-bg-surface-2 text-text-muted hover:text-text-primary"
                )}
              >
                {sk.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => resetCategory('OLVIA_LIFE')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-bg-surface-3 hover:bg-bg-surface-2 text-[11px] text-text-muted hover:text-red-400 border border-border-subtle transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>รีเซ็ตหมวดนี้</span>
          </button>
        </div>
      </div>

      <SubCourseProgressPanel branch="LIFE_SKILL" progress={profile.subCourseProgress} onSetProgress={setSubCourseProgress} />

      {/* Tasks grouped by skill (when viewing all) */}
      {groupedTasks.map((group) => {
        const groupDone = group.tasks.filter((t) => (profile.olviaLifeTasks[t.id] || 'UNKNOWN') === 'COMPLETED').length;
        return (
          <div key={group.skill.id} className="space-y-2.5">
            {selectedSkill === 'ALL' && (
              <div className="flex items-baseline justify-between px-1">
                <h2 className="text-sm font-bold text-text-primary">{group.skill.name}</h2>
                <span className="text-[11px] font-mono text-text-muted">{groupDone}/{group.tasks.length} เสร็จแล้ว</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {group.tasks.map((task) => {
          const currentStatus = profile.olviaLifeTasks[task.id] || 'UNKNOWN';
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
                
                {/* Title */}
                <div className="flex items-start justify-between gap-2 border-b border-border-subtle/80 pb-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                      [{task.skillName}]
                    </span>
                    <h3 className="font-bold text-xs md:text-sm text-text-primary">
                      {task.title}
                    </h3>
                  </div>

                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0",
                      isDone
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : currentStatus === 'IN_PROGRESS'
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    )}
                  >
                    {isDone ? 'เสร็จแล้ว' : currentStatus === 'IN_PROGRESS' ? 'กำลังทำ' : 'ยังไม่แน่ใจ'}
                  </span>
                </div>

                {/* Objective */}
                <p className="text-xs text-text-secondary leading-relaxed">
                  {task.objective}
                </p>

                {/* Reward & Gear */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-bg-surface-2 border border-border-subtle space-y-0.5">
                    <span className="text-[10px] text-text-muted block">รางวัล:</span>
                    <span className="text-amber-300 text-[11px] font-bold block truncate">★ {task.reward}</span>
                  </div>
                  <div className="p-2 rounded bg-bg-surface-2 border border-border-subtle space-y-0.5">
                    <span className="text-[10px] text-text-muted block">อุปกรณ์แนะนำ:</span>
                    <span className="text-text-primary text-[11px] block truncate">{task.recommendedGear}</span>
                  </div>
                </div>

              </div>

              {/* Status Toggle Buttons */}
              <div className="pt-2 border-t border-border-subtle/60 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-text-muted">เปลี่ยนสถานะ:</span>
                <div className="flex items-center gap-1 font-mono text-[10px]">
                  {(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'UNKNOWN'] as CheckpointStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => setOlviaLifeTaskStatus(task.id, st)}
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
