'use client';

import React, { useState } from 'react';
import {
  Shield,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Coins,
  Sparkles,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { GearSlotItem, GearStatus } from '@/data/gear/gearSlots';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { cn } from '@/lib/utils';

interface GearPlannerViewProps {
  store: ReturnType<typeof useRoadmapStore>;
}

export const GearPlannerView: React.FC<GearPlannerViewProps> = ({ store }) => {
  const { gearSlots, setGearStatus } = store;
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'WEAPON', 'ARMOR', 'ACCESSORY', 'SPECIAL'];

  const filteredGear = gearSlots.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  const totalCurrentAP = gearSlots.reduce((acc, curr) => acc + curr.currentAP, 0);
  const totalTargetAP = gearSlots.reduce((acc, curr) => acc + curr.targetAP, 0);
  const totalCurrentDP = gearSlots.reduce((acc, curr) => acc + curr.currentDP, 0);
  const totalTargetDP = gearSlots.reduce((acc, curr) => acc + curr.targetDP, 0);

  const getStatusButton = (slotId: string, currentStatus: GearStatus, status: GearStatus) => {
    const isActive = currentStatus === status;
    return (
      <button
        key={status}
        onClick={() => setGearStatus(slotId, status)}
        className={cn(
          "px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors",
          isActive
            ? status === 'ENHANCED' || status === 'CRAFTED'
              ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40"
              : status === 'OWNED'
              ? "bg-blue-500/20 text-blue-400 font-bold border border-blue-500/40"
              : "bg-red-500/20 text-red-400 font-bold border border-red-500/40"
            : "bg-bg-surface-3 text-text-muted hover:text-text-secondary"
        )}
      >
        {status}
      </button>
    );
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      
      {/* Header & Stat Delta Bar */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-heading font-bold text-text-primary tracking-wide flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-primary" />
              TACTICAL GEAR PLANNER & UPGRADE GAIN MATRIX
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Track 14 equipment slots from Current Gear → Next Upgrade → Endgame Dec (X) Sovereign.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-2.5 py-1 rounded text-[11px] transition-colors",
                  selectedCategory === cat
                    ? "bg-brand-primary text-white font-bold"
                    : "bg-bg-surface-2 text-text-muted hover:text-text-primary"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Global Delta Projection Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border-subtle/80 text-xs font-mono">
          <div className="p-2 rounded bg-bg-surface-2 border border-border-subtle">
            <span className="text-[10px] text-text-muted block">Projected Total Sheet AP</span>
            <div className="flex items-center gap-2 font-bold">
              <span className="text-amber-400">+{totalTargetAP - totalCurrentAP} AP Gain</span>
            </div>
          </div>
          <div className="p-2 rounded bg-bg-surface-2 border border-border-subtle">
            <span className="text-[10px] text-text-muted block">Projected Total Sheet DP</span>
            <div className="flex items-center gap-2 font-bold">
              <span className="text-emerald-400">+{totalTargetDP - totalCurrentDP} DP Gain</span>
            </div>
          </div>
          <div className="p-2 rounded bg-bg-surface-2 border border-border-subtle">
            <span className="text-[10px] text-text-muted block">Active Planned Upgrades</span>
            <span className="text-brand-primary font-bold">14 Equipment Slots</span>
          </div>
          <div className="p-2 rounded bg-bg-surface-2 border border-border-subtle">
            <span className="text-[10px] text-text-muted block">Estimated Total Budget</span>
            <span className="text-text-primary font-bold">~480 Billion Silver</span>
          </div>
        </div>
      </div>

      {/* High-Density Gear Table */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-bg-surface-2/90 border-b border-border-subtle font-mono text-[11px] text-text-muted uppercase tracking-wider">
                <th className="py-2.5 px-3">Slot / Item</th>
                <th className="py-2.5 px-3">Current Gear</th>
                <th className="py-2.5 px-3">Next Target Upgrade</th>
                <th className="py-2.5 px-3 text-center">AP / DP Gain</th>
                <th className="py-2.5 px-3 text-center">Accuracy</th>
                <th className="py-2.5 px-3">Est. Cost & Source</th>
                <th className="py-2.5 px-3 text-center">Priority</th>
                <th className="py-2.5 px-3 text-center">Status Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60 font-mono">
              {filteredGear.map((gear) => {
                const apGain = gear.targetAP > 0 ? gear.targetAP - gear.currentAP : 0;
                const aapGain = gear.targetAAP > 0 ? gear.targetAAP - gear.currentAAP : 0;
                const dpGain = gear.targetDP > 0 ? gear.targetDP - gear.currentDP : 0;

                return (
                  <tr
                    key={gear.id}
                    className="hover:bg-bg-surface-2/70 transition-colors group"
                  >
                    {/* Slot Name */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-text-primary text-xs">{gear.slotName}</div>
                      <span className="text-[10px] text-text-muted font-mono">{gear.category}</span>
                    </td>

                    {/* Current Gear */}
                    <td className="py-2.5 px-3">
                      <div className="text-text-secondary font-sans text-xs">{gear.currentName}</div>
                      <div className="text-[10px] text-text-muted">
                        {gear.currentAP > 0 && <span className="text-amber-400 mr-2">AP: {gear.currentAP}</span>}
                        {gear.currentAAP > 0 && <span className="text-purple-400 mr-2">AAP: {gear.currentAAP}</span>}
                        {gear.currentDP > 0 && <span className="text-emerald-400">DP: {gear.currentDP}</span>}
                      </div>
                    </td>

                    {/* Next Target */}
                    <td className="py-2.5 px-3">
                      <div className="text-brand-gold font-sans font-medium text-xs">{gear.targetName}</div>
                      <div className="text-[10px] text-text-muted">
                        Target: <span className="text-text-primary font-bold">{gear.targetEnhancement}</span> (End: {gear.endTargetEnhancement})
                      </div>
                      {gear.safetyNote && (
                        <div className="text-[10px] text-red-400 font-sans italic mt-0.5">
                          ⚠️ {gear.safetyNote}
                        </div>
                      )}
                    </td>

                    {/* AP / DP Gain */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex flex-col items-center justify-center gap-0.5 text-xs font-bold">
                        {apGain > 0 && <span className="text-amber-400">+{apGain} AP</span>}
                        {aapGain > 0 && <span className="text-purple-400">+{aapGain} AAP</span>}
                        {dpGain > 0 && <span className="text-emerald-400">+{dpGain} DP</span>}
                        {apGain === 0 && aapGain === 0 && dpGain === 0 && (
                          <span className="text-text-muted">-</span>
                        )}
                      </div>
                    </td>

                    {/* Accuracy */}
                    <td className="py-2.5 px-3 text-center text-text-secondary text-xs">
                      {gear.accuracyGain > 0 ? `+${gear.accuracyGain}` : '-'}
                    </td>

                    {/* Cost & Source */}
                    <td className="py-2.5 px-3 max-w-[200px]">
                      <div className="text-text-primary text-xs truncate">{gear.estimatedCost}</div>
                      <div className="text-[10px] text-text-muted truncate font-sans">{gear.source}</div>
                    </td>

                    {/* Priority */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-bold",
                          gear.priority === 'CRITICAL'
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : gear.priority === 'HIGH'
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-bg-surface-3 text-text-muted"
                        )}
                      >
                        {gear.priority}
                      </span>
                    </td>

                    {/* Status Toggle Buttons */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {(['OWNED', 'CRAFTED', 'ENHANCED', 'MISSING'] as GearStatus[]).map((st) =>
                          getStatusButton(gear.id, gear.status, st)
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
