'use client';

import React from 'react';
import { Gem } from 'lucide-react';
import { kharazadPiecesList } from '@/data/gear/kharazadAccessories';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { TaskChecklistView } from '@/components/shared/TaskChecklistView';

interface KharazadAccessoriesViewProps {
  store: ReturnType<typeof useRoadmapStore>;
}

export const KharazadAccessoriesView: React.FC<KharazadAccessoriesViewProps> = ({ store }) => {
  const { profile, setKharazadTaskStatus, progressStats, resetCategory } = store;

  return (
    <TaskChecklistView
      icon={Gem}
      headerLabel="เครื่องประดับคาราซัด (Kharazad Accessories Set)"
      title="ชุดเครื่องประดับ Kharazad PEN — 6 ชิ้น + OCT"
      description="รับทุกชิ้นจาก Alustin's Support ที่ Velia ทุกชิ้นใช้วัสดุเหมือนกัน (Essence of Dawn x10 + Sharp Black Crystal Shard x50) ชิ้นสุดท้ายคืออัปเกรด OCT ด้วย Ancient Black Stone จาก Emma Bartali's Journal"
      tasks={kharazadPiecesList}
      statusMap={profile.kharazadTasks}
      onSetStatus={setKharazadTaskStatus}
      onReset={() => resetCategory('KHARAZAD')}
      progress={progressStats.kharazad}
    />
  );
};
