'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import { slumberingOriginPiecesList } from '@/data/gear/slumberingOriginArmor';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { TaskChecklistView } from '@/components/shared/TaskChecklistView';

interface SlumberingOriginViewProps {
  store: ReturnType<typeof useRoadmapStore>;
}

export const SlumberingOriginView: React.FC<SlumberingOriginViewProps> = ({ store }) => {
  const { profile, setSlumberingOriginTaskStatus, progressStats, resetCategory } = store;

  return (
    <TaskChecklistView
      icon={Shield}
      headerLabel="เกราะเทพผู้ล่วงลับ (Slumbering Origin Armor Set)"
      title="ชุดเกราะ Slumbering Origin — 4 ชิ้น"
      description="ทั้ง 4 ชิ้นมาจากเควส Black Spirit Support แยกกัน (ไม่ต้องฟาร์มบอสเอง) เควสจะพาไปปราบให้อัตโนมัติเมื่อ AP ถึงเกณฑ์"
      tasks={slumberingOriginPiecesList}
      statusMap={profile.slumberingOriginTasks}
      onSetStatus={setSlumberingOriginTaskStatus}
      onReset={() => resetCategory('SLUMBERING_ORIGIN')}
      progress={progressStats.slumberingOrigin}
    />
  );
};
