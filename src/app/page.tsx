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
import { WorkerEmpireView } from '@/components/workerempire/WorkerEmpireView';
import { AccountSetupWizard } from '@/components/setup/AccountSetupWizard';
import { MigrationModal } from '@/components/modals/MigrationModal';
import { CheckpointDetailDrawer } from '@/components/modals/CheckpointDetailDrawer';
import { ImportExportModal } from '@/components/modals/ImportExportModal';
import { ResetConfirmModal } from '@/components/modals/ResetConfirmModal';
import { RequireAuthGate } from '@/components/auth/RequireAuthGate';

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
    profile,
    auth
  } = store;

  // Show setup wizard if the user explicitly opened it, or if they're a
  // logged-in first-time user who hasn't completed setup. Gated on
  // auth.session too - a guest just browsing public pages (Market, recipe
  // lookup, Worker Empire) should never get forced into a personal setup
  // flow before ever signing in.
  const showWizard = isSetupOpen || (Boolean(auth.session) && !profile.hasCompletedSetup && isHydrated);

  const renderActiveView = () => {
    if (showWizard) {
      return (
        <AccountSetupWizard
          store={store}
          onComplete={() => setIsSetupOpen(false)}
        />
      );
    }

    // Personal progression tracking (this player's own gear/checkpoints/
    // goals) requires login; shared reference data (Market, recipes,
    // Worker Empire, Class Guides, etc.) stays open to everyone - per
    // explicit direction, since this app is shared among a small group
    // rather than being single-user only.
    const gate = (featureName: string, node: React.ReactNode) => (
      <RequireAuthGate session={store.auth.session} authConfigured={store.auth.authConfigured} featureName={featureName}>
        {node}
      </RequireAuthGate>
    );

    switch (activeTab) {
      case 'dashboard':
        return gate(
          'ภาพรวมบัญชี',
          <DashboardView
            onNavigate={(tab) => setActiveTab(tab)}
            store={store}
            onOpenSetup={() => setIsSetupOpen(true)}
          />,
        );
      case 'roadmap':
        return gate('เส้นทางพัฒนา', <RoadmapView store={store} />);
      case 'olvia_combat':
        return gate('Olvia Academy สายต่อสู้', <OlviaCombatView store={store} />);
      case 'olvia_life':
        return gate('Olvia Academy สาย Life', <OlviaLifeView store={store} />);
      case 'slumbering_origin':
        return gate('เกราะเทพผู้ล่วงลับ', <SlumberingOriginView store={store} />);
      case 'kharazad':
        return gate('เครื่องประดับคาราชัด', <KharazadAccessoriesView store={store} />);
      case 'gear':
        return gate('อุปกรณ์ (Gear Planner)', <GearPlannerView store={store as any} />);
      case 'sovereign':
        return gate('ตีนวกราชัน (Sovereign Forge)', <SovereignTrackerView store={store as any} />);
      case 'goals':
        return gate('เป้าหมาย Hyperboost', <EndgameGoalView store={store} onNavigate={(tab) => setActiveTab(tab)} />);
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
        return <LifeSkillHubView session={store.auth.session} />;
      case 'classes':
        return <ClassGuidesView store={store as any} />;
      case 'lifeskills':
        return <LifeSkillDashboardView store={store as any} />;
      case 'worker_empire':
        return <WorkerEmpireView />;
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
