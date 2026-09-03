'use client';

import React from 'react';
import { Minus, Plus, ListChecks } from 'lucide-react';
import { olviaSubCoursesList } from '@/data/progression/olviaSubCourses';
import { cn } from '@/lib/utils';

interface SubCourseProgressPanelProps {
  branch: 'COMBAT' | 'LIFE_SKILL';
  progress: Record<string, number>;
  onSetProgress: (id: string, completed: number) => void;
}

// Quest-count tracker for Olvia Academy sub-courses (Basic Tactics, Field
// Tactics, Gathering, Fishing, ...). Separate from the reward-milestone
// checklists (olviaCombatTasks.ts / olviaLifeTasks.ts) - this just tracks
// "how many of the N quests in this sub-course are done" since no source
// publishes individual quest titles, only totals the user reads off their
// own in-game Olvia Academy panel.
export const SubCourseProgressPanel: React.FC<SubCourseProgressPanelProps> = ({ branch, progress, onSetProgress }) => {
  const courses = olviaSubCoursesList.filter((c) => c.branch === branch);

  return (
    <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 space-y-3">
      <div className="flex items-center gap-2 text-brand-primary font-mono text-xs uppercase tracking-wider">
        <ListChecks className="w-4 h-4" />
        <span>ความคืบหน้าเควสรายคอร์ส (Sub-course Quest Count)</span>
      </div>
      <p className="text-[11px] text-text-muted">
        จำนวนเควสจริงต่อคอร์สยังไม่มีแหล่งข้อมูลทางการยืนยันทุกคอร์ส - กรอกตามที่เห็นในหน้าต่าง Olvia Academy ของคุณเองได้เลย
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {courses.map((course) => {
          const completed = progress[course.id] ?? 0;
          const total = course.totalQuests;
          const pct = total ? Math.min(100, Math.round((completed / total) * 100)) : 0;

          return (
            <div key={course.id} className="p-3 rounded-lg bg-bg-surface-2 border border-border-subtle space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary">{course.name}</span>
                <span className="text-[10px] font-mono text-text-muted">
                  {total === null ? 'ยังไม่ทราบจำนวน' : `${completed} / ${total}`}
                </span>
              </div>

              {total !== null ? (
                <>
                  <div className="w-full bg-bg-surface-3 h-1.5 rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all duration-300", pct === 100 ? "bg-emerald-500" : "bg-brand-primary")} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      onClick={() => onSetProgress(course.id, completed - 1)}
                      disabled={completed <= 0}
                      className="p-1 rounded bg-bg-surface-3 hover:bg-bg-surface-1 border border-border-subtle text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-[11px] font-mono text-text-secondary w-10 text-center">{completed}</span>
                    <button
                      onClick={() => onSetProgress(course.id, completed + 1)}
                      disabled={completed >= total}
                      className="p-1 rounded bg-bg-surface-3 hover:bg-bg-surface-1 border border-border-subtle text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </>
              ) : (
                course.notes && <p className="text-[10px] text-text-muted italic">{course.notes}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
