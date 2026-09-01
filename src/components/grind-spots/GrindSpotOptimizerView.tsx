'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Zap,
  Shield,
  Coins,
  Crosshair,
  Info,
  Layers,
  Flame
} from 'lucide-react';
import { grindSpotsList, GrindSpotItem } from '@/data/grind-spots/spots';
import { buildPresets, BuildPreset } from '@/data/builds/presets';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { cn } from '@/lib/utils';

interface GrindSpotOptimizerViewProps {
  store: ReturnType<typeof useRoadmapStore>;
}

export const GrindSpotOptimizerView: React.FC<GrindSpotOptimizerViewProps> = ({ store }) => {
  const { stats, selectedSpotId, setSelectedSpotId } = store;
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('ALL');
  const [activeBuildMode, setActiveBuildMode] = useState<string>('BALANCED');

  const selectedSpot = grindSpotsList.find((s) => s.id === selectedSpotId) || grindSpotsList[0];
  const currentPreset: BuildPreset = buildPresets[activeBuildMode] || buildPresets.BALANCED;

  const filteredSpots = grindSpotsList.filter((spot) => {
    const matchesSearch =
      spot.name.toLowerCase().includes(search.toLowerCase()) ||
      spot.region.toLowerCase().includes(search.toLowerCase()) ||
      spot.treasureDrops.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesDiff = selectedDifficulty === 'ALL' || spot.difficulty === selectedDifficulty;
    const matchesSpecies = selectedSpecies === 'ALL' || spot.species === selectedSpecies;
    return matchesSearch && matchesDiff && matchesSpecies;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      
      {/* Header Banner */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2 text-brand-cyan font-mono text-xs uppercase tracking-wider">
          <MapPin className="w-4 h-4 text-brand-cyan" />
          <span>Combat Zone Intelligence & Optimizer Matrix</span>
        </div>
        <h1 className="text-lg font-heading font-bold text-text-primary">
          GRIND SPOT OPTIMIZER & LOADOUT BUILD PRESETS
        </h1>
        <p className="text-xs text-text-secondary">
          Match your AP/DP and target treasure to the highest efficiency monster zone. Build custom crystal, artifact, and lightstone presets per spot.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-3 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search spot name, region, or treasure drop..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-bg-surface-3 border border-border-subtle rounded text-xs text-text-primary placeholder:text-text-muted focus:border-brand-primary outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-text-muted text-[11px]">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-bg-surface-3 border border-border-subtle text-text-primary px-2 py-1 rounded text-xs"
            >
              <option value="ALL">ALL</option>
              <option value="ENTRY">ENTRY</option>
              <option value="MID">MID</option>
              <option value="HIGH">HIGH</option>
              <option value="DEHKIA">DEHKIA</option>
              <option value="APEX_ENDGAME">APEX ENDGAME</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-text-muted text-[11px]">Species:</span>
            <select
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
              className="bg-bg-surface-3 border border-border-subtle text-text-primary px-2 py-1 rounded text-xs"
            >
              <option value="ALL">ALL</option>
              <option value="KAMASYLVIA">KAMASYLVIA</option>
              <option value="DEMIHUMAN">DEMIHUMAN</option>
              <option value="ABYSSAL_EDANIAN">ABYSSAL EDANIAN</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main 2-Column Optimizer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left Column: Spots Database Table */}
        <div className="lg:col-span-6 space-y-2">
          {filteredSpots.map((spot) => {
            const isSelected = spot.id === selectedSpotId;
            const isApReady = stats.ap >= spot.recommendedAP;
            const isDpReady = stats.dp >= spot.recommendedDP;

            return (
              <div
                key={spot.id}
                onClick={() => setSelectedSpotId(spot.id)}
                className={cn(
                  "p-3 rounded-lg border transition-all cursor-pointer space-y-2",
                  isSelected
                    ? "bg-bg-surface-2 border-brand-primary shadow-md"
                    : "bg-bg-surface-1 border-border-subtle hover:border-border-active"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-text-primary">{spot.name}</h3>
                    <span className="text-[10px] font-mono text-text-muted">
                      {spot.region} • {spot.species}
                    </span>
                  </div>

                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-mono font-bold",
                      spot.difficulty === 'APEX_ENDGAME'
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : spot.difficulty === 'DEHKIA'
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    )}
                  >
                    {spot.difficulty}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono text-text-secondary bg-bg-surface-3/60 p-1.5 rounded border border-border-subtle/40">
                  <div>
                    Req: <span className={isApReady ? "text-amber-400 font-bold" : "text-red-400 font-bold"}>{spot.recommendedAP} AP</span>
                  </div>
                  <div>
                    Req: <span className={isDpReady ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{spot.recommendedDP} DP</span>
                  </div>
                  <div className="text-text-primary truncate">
                    {spot.silverPerHour}
                  </div>
                </div>

                {/* Treasure Drops Badges */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {spot.treasureDrops.map((drop, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-bg-surface-3 text-brand-gold border border-border-subtle">
                      ★ {drop}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Spot Detail & Tactical Loadout Preset Engine */}
        <div className="lg:col-span-6 bg-bg-surface-1 border border-border-subtle rounded-lg p-4 space-y-4">
          
          {/* Selected Spot Details */}
          <div className="border-b border-border-subtle pb-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-heading font-bold text-text-primary">
                {selectedSpot.name}
              </h2>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {selectedSpot.silverPerHour}
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Region: {selectedSpot.region} | Monster AP Cap: <span className="font-mono font-bold text-text-primary">{selectedSpot.monsterAPCap}</span> | Accuracy: <span className="font-mono font-bold text-text-primary">{selectedSpot.accuracyRequirement}</span>
            </p>
          </div>

          {/* Spot Key Mechanics */}
          <div className="p-3 rounded-lg bg-bg-surface-2/60 border border-border-subtle space-y-1.5 text-xs">
            <h4 className="font-bold text-text-primary flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Info className="w-3.5 h-3.5 text-brand-accent" /> Spot Mechanics & Positioning Guide
            </h4>
            <ul className="list-disc list-inside space-y-1 text-text-secondary text-[11px]">
              {selectedSpot.keyMechanics.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>

          {/* Loadout Preset Mode Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-brand-primary" />
                Recommended Build Configuration
              </h3>
              <div className="flex items-center gap-1 text-[10px] font-mono">
                {['BUDGET', 'BALANCED', 'MAX_DPS', 'DEFENSIVE', 'TREASURE_FARM'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setActiveBuildMode(mode)}
                    className={cn(
                      "px-2 py-0.5 rounded transition-colors",
                      activeBuildMode === mode
                        ? "bg-brand-primary text-white font-bold"
                        : "bg-bg-surface-3 text-text-muted hover:text-text-primary"
                    )}
                  >
                    {mode.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-bg-surface-2/80 border border-border-subtle space-y-3 text-xs">
              
              <div>
                <span className="font-bold text-text-primary">{currentPreset.name}</span>
                <p className="text-[11px] text-text-secondary mt-0.5">{currentPreset.description}</p>
              </div>

              {/* Lightstones & Artifacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-bg-surface-3 border border-border-subtle">
                  <span className="text-text-muted text-[10px] block">Artifacts</span>
                  <span className="text-text-primary font-bold">{currentPreset.artifacts.slot1}</span>
                  <span className="text-text-secondary text-[10px] block mt-0.5">{currentPreset.artifacts.effect}</span>
                </div>
                <div className="p-2 rounded bg-bg-surface-3 border border-border-subtle">
                  <span className="text-text-muted text-[10px] block">Lightstone Combo</span>
                  <span className="text-brand-gold font-bold">{currentPreset.lightstones.comboName}</span>
                  <span className="text-text-secondary text-[10px] block mt-0.5">{currentPreset.lightstones.effect}</span>
                </div>
              </div>

              {/* Crystals Focus */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-text-muted">Key Crystal Sockets:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                  {currentPreset.crystals.slice(0, 4).map((c, i) => (
                    <div key={i} className="p-1.5 rounded bg-bg-surface-3/60 border border-border-subtle/50">
                      <div className="font-bold text-text-primary">{c.name} (x{c.count})</div>
                      <div className="text-[10px] text-text-muted font-mono">{c.effect}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buffs Rotation */}
              <div className="space-y-1 text-[11px] font-mono">
                <span className="text-[10px] uppercase text-text-muted">Consumables Buff Rotation:</span>
                <div className="text-text-secondary space-y-0.5 text-[10px]">
                  <div>• Meal: <span className="text-text-primary">{currentPreset.buffs.meal}</span></div>
                  <div>• Draught: <span className="text-text-primary">{currentPreset.buffs.draught}</span></div>
                  <div>• Perfume: <span className="text-brand-cyan">{currentPreset.buffs.perfume}</span></div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
