'use client';

import React, { useState } from 'react';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { HeaderCommandBar } from '@/components/layout/HeaderCommandBar';
import { NavigationSidebar, NavTabId } from '@/components/layout/NavigationSidebar';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { RoadmapView } from '@/components/roadmap/RoadmapView';
import { GearPlannerView } from '@/components/gear/GearPlannerView';
import { SovereignTrackerView } from '@/components/sovereign/SovereignTrackerView';
import { SafetyView } from '@/components/safety/SafetyView';
import { TreasureView } from '@/components/treasures/TreasureView';
import { GrindSpotOptimizerView } from '@/components/grind-spots/GrindSpotOptimizerView';
import { ClassGuidesView } from '@/components/classes/ClassGuidesView';
import { LifeSkillDashboardView } from '@/components/lifeskills/LifeSkillDashboardView';
import { WarReadinessView } from '@/components/war-readiness/WarReadinessView';

export default function Home() {
  const store = useRoadmapStore();
  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');

  const currentPhaseTitle =
    store.phases.find((p) => p.status === 'IN_PROGRESS')?.title || '5. Sovereign Weapon Forge';

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} store={store} />;
      case 'roadmap':
        return <RoadmapView store={store} />;
      case 'gear':
        return <GearPlannerView store={store} />;
      case 'sovereign':
        return <SovereignTrackerView store={store} />;
      case 'safety':
        return <SafetyView />;
      case 'treasures':
        return (
          <TreasureView
            store={store}
            onNavigateToSpot={(spot) => {
              store.setSelectedSpotId('gyfin_underground');
              setActiveTab('spots');
            }}
            onNavigateToClass={(cls) => {
              store.setSelectedClassId('witch_awakening');
              setActiveTab('classes');
            }}
          />
        );
      case 'spots':
        return <GrindSpotOptimizerView store={store} />;
      case 'classes':
        return <ClassGuidesView store={store} />;
      case 'lifeskills':
        return <LifeSkillDashboardView store={store} />;
      case 'war':
        return <WarReadinessView store={store} />;
      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} store={store} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-canvas text-text-primary">
      {/* Top Sticky Command Bar */}
      <HeaderCommandBar
        stats={store.stats}
        onUpdateStats={store.updateStats}
        onReset={store.resetAllData}
        currentPhaseTitle={currentPhaseTitle}
      />

      {/* Main Layout Container */}
      <div className="flex flex-1 max-w-full">
        {/* Navigation Sidebar & Mobile Bottom Dock */}
        <NavigationSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Dynamic Core View Content */}
        <main className="flex-1 p-3 md:p-5 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
