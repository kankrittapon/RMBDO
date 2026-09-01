'use client';

import React from 'react';
import {
  Zap,
  ShieldAlert,
  AlertTriangle,
  Plus,
  Minus,
  CheckCircle2,
  Package,
  Flame,
  Gem,
  Info,
  ArrowRight
} from 'lucide-react';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { cn } from '@/lib/utils';

interface SovereignTrackerViewProps {
  store: ReturnType<typeof useRoadmapStore>;
}

export const SovereignTrackerView: React.FC<SovereignTrackerViewProps> = ({ store }) => {
  const { sovereign, updateBlackstarCount } = store;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      
      {/* Header Banner */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2 text-brand-primary font-mono text-xs uppercase tracking-wider">
          <Zap className="w-4 h-4 text-brand-primary animate-pulse" />
          <span>Tier 10 Primordial Weapon Allocation Engine</span>
        </div>
        <h1 className="text-lg font-heading font-bold text-text-primary">
          BLACKSTAR ALLOCATION & SOVEREIGN FORGE TRACKER
        </h1>
        <p className="text-xs text-text-secondary">
          Carefully allocate PEN (V) Blackstars into Sovereign Mainhand, Awakening, and Sub-weapons. Prevent incorrect selectable box claims.
        </p>
      </div>

      {/* Critical Selectable Box Warning Banner */}
      <div className="bg-amber-950/30 border border-amber-500/40 rounded-lg p-3.5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="uppercase tracking-wide">Anti-Trap Warning: Selectable Blackstar Box Decision</span>
        </div>
        <p className="text-xs text-amber-200/90 leading-relaxed">
          {sovereign.selectableBoxWarning}
        </p>
        <div className="flex items-center gap-2 text-[11px] font-mono text-amber-300 pt-1">
          <span>Rule:</span>
          <span className="bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
            DO NOT OPEN UNTIL AUDIT IS COMPLETE
          </span>
        </div>
      </div>

      {/* PEN Blackstar Inventory Audit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Mainhand */}
        <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
                M
              </div>
              <span className="text-xs font-bold text-text-primary">Mainhand Blackstar</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {sovereign.mainhand.sovereignStatus}
            </span>
          </div>

          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-text-muted">Owned PEN Count:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateBlackstarCount('MAIN', -1)}
                className="w-6 h-6 rounded bg-bg-surface-3 hover:bg-bg-surface-2 flex items-center justify-center text-text-secondary border border-border-subtle"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-bold text-sm text-text-primary w-6 text-center">
                {sovereign.mainhand.ownedCount} / {sovereign.mainhand.requiredForSovereign}
              </span>
              <button
                onClick={() => updateBlackstarCount('MAIN', 1)}
                className="w-6 h-6 rounded bg-bg-surface-3 hover:bg-bg-surface-2 flex items-center justify-center text-text-secondary border border-border-subtle"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-text-secondary leading-relaxed">
            {sovereign.mainhand.detailNote}
          </p>
        </div>

        {/* Awakening */}
        <div className="bg-bg-surface-1 border border-red-500/30 bg-red-950/10 rounded-lg p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-xs">
                A
              </div>
              <span className="text-xs font-bold text-text-primary">Awakening Blackstar</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
              {sovereign.awakening.sovereignStatus}
            </span>
          </div>

          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-text-muted">Owned PEN Count:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateBlackstarCount('AWAKENING', -1)}
                className="w-6 h-6 rounded bg-bg-surface-3 hover:bg-bg-surface-2 flex items-center justify-center text-text-secondary border border-border-subtle"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-bold text-sm text-red-400 w-6 text-center">
                {sovereign.awakening.ownedCount} / {sovereign.awakening.requiredForSovereign}
              </span>
              <button
                onClick={() => updateBlackstarCount('AWAKENING', 1)}
                className="w-6 h-6 rounded bg-bg-surface-3 hover:bg-bg-surface-2 flex items-center justify-center text-text-secondary border border-border-subtle"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-red-200/90 leading-relaxed font-medium">
            {sovereign.awakening.detailNote}
          </p>
        </div>

        {/* Sub-weapon */}
        <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                S
              </div>
              <span className="text-xs font-bold text-text-primary">Sub-weapon Sovereign</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {sovereign.subweapon.sovereignStatus}
            </span>
          </div>

          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-text-muted">Owned PEN Count:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateBlackstarCount('SUB', -1)}
                className="w-6 h-6 rounded bg-bg-surface-3 hover:bg-bg-surface-2 flex items-center justify-center text-text-secondary border border-border-subtle"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-bold text-sm text-text-primary w-6 text-center">
                {sovereign.subweapon.ownedCount} / {sovereign.subweapon.requiredForSovereign}
              </span>
              <button
                onClick={() => updateBlackstarCount('SUB', 1)}
                className="w-6 h-6 rounded bg-bg-surface-3 hover:bg-bg-surface-2 flex items-center justify-center text-text-secondary border border-border-subtle"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-text-secondary leading-relaxed">
            {sovereign.subweapon.detailNote}
          </p>
        </div>

      </div>

      {/* Total Synthesis Readiness Summary */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-4 space-y-3">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-brand-accent" />
          Sovereign Primordial Forge Synthesis Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          
          <div className="p-3 rounded bg-bg-surface-2 border border-border-subtle space-y-2">
            <h4 className="font-bold text-text-primary flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Method A: 2x PEN Blackstars Fusion
            </h4>
            <p className="text-text-secondary text-[11px] leading-relaxed">
              Combine 2 identical PEN (V) Blackstar weapons (e.g. 2x PEN Blackstar Awakening) at the Blacksmith in Land of the Morning Light.
            </p>
            <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">
              Cost: 0 Silver (Uses existing 2x weapons)
            </span>
          </div>

          <div className="p-3 rounded bg-bg-surface-2 border border-border-subtle space-y-2">
            <h4 className="font-bold text-text-primary flex items-center gap-1.5">
              <Gem className="w-3.5 h-3.5 text-purple-400" /> Method B: 1x PEN Blackstar + Flame of Primordial
            </h4>
            <p className="text-text-secondary text-[11px] leading-relaxed">
              Combine 1x PEN Blackstar weapon with 1x Flame of the Primordial (crafted from Darkseekers Retreat / Primordial Embers).
            </p>
            <span className="inline-block px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-[10px]">
              Cost: ~65B Silver Flame Value
            </span>
          </div>

        </div>

        <div className="p-3 rounded-lg bg-bg-surface-3 border border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
          <div>
            <span className="text-text-muted">Critical Path Action: </span>
            <span className="text-text-primary font-bold">{sovereign.nextCriticalAction}</span>
          </div>
          <span className="text-brand-gold font-bold shrink-0">
            Total Sovereign Progress: {Math.round((sovereign.totalPenOwned / sovereign.totalPenRequired) * 100)}%
          </span>
        </div>
      </div>

    </div>
  );
};
