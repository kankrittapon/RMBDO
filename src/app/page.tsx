'use client';

import React, { useState } from 'react';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { HeaderCommandBar } from '@/components/layout/HeaderCommandBar';
import { NavigationSidebar, NavTabId } from '@/components/layout/NavigationSidebar';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { RoadmapView } from '@/components/roadmap/RoadmapView';
import { OlviaCombatView } from '@/components/olvia/OlviaCombatView';
import { OlviaLifeView } from '@/components/olvia/OlviaLifeView';
import { SlumberingOriginView } from '@/components/gear/SlumberingOriginView';
import { KharazadAccessoriesView } from '@/components/gear/KharazadAccessoriesView';
import { GearPlannerView } from '@/components/gear/GearPlannerView';
import { SovereignTrackerView } from '@/components/sovereign/SovereignTrackerView';
import { EndgameGoalView } from '@/components/goals/EndgameGoalView';
import { SafetyView } from '@/components/safety/SafetyView';
import { TreasureView } from '@/components/treasures/TreasureView';
import { GrindSpotOptimizerView } from '@/components/grind-spots/GrindSpotOptimizerView';
import { MarketPriceView } from '@/components/market/MarketPriceView';
import { LifeSkillHubView } from '@/components/lifeskillhub/LifeSkillHubView';
import { ClassGuidesView } from '@/components/classes/ClassGuidesView';
import { LifeSkillDashboardView } from '@/components/lifeskills/LifeSkillDashboardView';
import { WarReadinessView } from '@/components/war-readiness/WarReadinessView';
import { AccountSetupWizard } from '@/components/setup/AccountSetupWizard';
import { MigrationModal } from '@/components/modals/MigrationModal';
import { CheckpointDetailDrawer } from '@/components/modals/CheckpointDetailDrawer';
import { ImportExportModal } from '@/components/modals/ImportExportModal';
import { ResetConfirmModal } from '@/components/modals/ResetConfirmModal';

export default function Home() {
  const store = useRoadmapStore();
  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const {
    isHydrated,
    hasV1Data,
    migrateV1Data,
    dismissV1Migration,
    selectedDrawerNodeId,
    setSelectedDrawerNodeId,
    profile
  } = store;

  // Show setup wizard if user explicitly opened it or if they are a first-time user who hasn't completed setup
  const showWizard = isSetupOpen || (!profile.hasCompletedSetup && isHydrated);

  const renderActiveView = () => {
    if (showWizard) {
      return (
        <AccountSetupWizard
          store={store}
          onComplete={() => setIsSetupOpen(false)}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={(tab) => setActiveTab(tab)}
            store={store}
            onOpenSetup={() => setIsSetupOpen(true)}
          />
        );
      case 'roadmap':
        return <RoadmapView store={store} />;
      case 'olvia_combat':
        return <OlviaCombatView store={store} />;
      case 'olvia_life':
        return <OlviaLifeView store={store} />;
      case 'slumbering_origin':
        return <SlumberingOriginView store={store} />;
      case 'kharazad':
        return <KharazadAccessoriesView store={store} />;
      case 'gear':
        return <GearPlannerView store={store as any} />;
      case 'sovereign':
        return <SovereignTrackerView store={store as any} />;
      case 'goals':
        return <EndgameGoalView store={store} onNavigate={(tab) => setActiveTab(tab)} />;
      case 'safety':
        return <SafetyView />;
      case 'treasures':
        return (
          <TreasureView
            store={store as any}
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
        return <GrindSpotOptimizerView store={store as any} />;
      case 'market':
        return <MarketPriceView />;
      case 'crafting':
        return <LifeSkillHubView />;
      case 'classes':
        return <ClassGuidesView store={store as any} />;
      case 'lifeskills':
        return <LifeSkillDashboardView store={store as any} />;
      case 'war':
        return <WarReadinessView store={store as any} />;
      default:
        return (
          <DashboardView
            onNavigate={(tab) => setActiveTab(tab)}
            store={store}
            onOpenSetup={() => setIsSetupOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-canvas text-text-primary">
      {/* Top Sticky Command Bar */}
      <HeaderCommandBar
        store={store}
        onOpenSetup={() => setIsSetupOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onOpenReset={() => setIsResetOpen(true)}
      />

      {/* Main Layout Container */}
      <div className="flex flex-1 max-w-full">
        {/* Navigation Sidebar & Mobile Bottom Dock */}
        {!showWizard && (
          <NavigationSidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            seasonPct={store.progressStats.season.pct}
            combatPct={store.progressStats.olviaCombat.pct}
            lifePct={store.progressStats.olviaLife.pct}
          />
        )}

        {/* Dynamic Core View Content */}
        <main className="flex-1 p-3 md:p-5 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* Modals & Drawers */}
      <MigrationModal
        isOpen={hasV1Data}
        onMigrate={migrateV1Data}
        onDismiss={dismissV1Migration}
      />

      <CheckpointDetailDrawer
        nodeId={selectedDrawerNodeId}
        onClose={() => setSelectedDrawerNodeId(null)}
        store={store}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        store={store}
      />

      <ResetConfirmModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        store={store}
      />
    </div>
  );
}
