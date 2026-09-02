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
import { useDbGrindSpots } from '@/hooks/useDbGrindSpots';
import { cn } from '@/lib/utils';

interface GrindSpotOptimizerViewProps {
  store: ReturnType<typeof useRoadmapStore>;
}

export const GrindSpotOptimizerView: React.FC<GrindSpotOptimizerViewProps> = ({ store }) => {
  const { profile, selectedSpotId, setSelectedSpotId } = store;
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('ALL');
  const [activeBuildMode, setActiveBuildMode] = useState<string>('BALANCED');
  const { getVerified } = useDbGrindSpots();

  const selectedSpot = grindSpotsList.find((s) => s.id === selectedSpotId) || grindSpotsList[0];
  const selectedVerified = getVerified(selectedSpot.name);
  const currentPreset: BuildPreset = buildPresets[activeBuildMode] || buildPresets.BALANCED;

  const playerAP = profile.stats.ap || 0;
  const playerDP = profile.stats.dp || 0;

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
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-brand-cyan font-mono text-xs uppercase tracking-wider">
          <MapPin className="w-4 h-4 text-brand-cyan" />
          <span>ระบบค้นหาและวิเคราะห์จุดฟาร์มมอนสเตอร์ (Grind Spot Optimizer)</span>
        </div>
        <h1 className="text-lg md:text-xl font-heading font-bold text-text-primary">
          จุดฟาร์มที่เหมาะสม & พรีเซ็ตอัญมณี โบราณวัตถุ บัฟอาหาร
        </h1>
        <p className="text-xs text-text-secondary">
          เปรียบเทียบ AP/DP ของตัวละครกับความต้องการของมอนสเตอร์แต่ละพื้นที่ พร้อมพรีเซ็ตอัญมณีเฉพาะทาง
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-3.5 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อจุดฟาร์ม, ภูมิภาค หรือสมบัติที่ดรอป..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-bg-surface-3 border border-border-subtle rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:border-brand-primary outline-none font-mono"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-text-muted text-[11px]">ระดับความยาก:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-bg-surface-3 border border-border-subtle text-text-primary px-2 py-1 rounded text-xs font-mono"
            >
              <option value="ALL">ทั้งหมด (All)</option>
              <option value="ENTRY">เริ่มต้น (Entry)</option>
              <option value="MID">ปานกลาง (Mid)</option>
              <option value="HIGH">ระดับสูง (High)</option>
              <option value="DEHKIA">เดคิอา (Dehkia)</option>
              <option value="APEX_ENDGAME">จุดสูงสุด (Apex Endgame)</option>
            </select>
          </div>

        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left: Spots List */}
        <div className="lg:col-span-6 space-y-2.5">
          {filteredSpots.map((spot) => {
            const isSelected = spot.id === selectedSpotId;
            const verified = getVerified(spot.name);
            const effectiveAP = verified?.recommendedAP ?? spot.recommendedAP;
            const effectiveDP = verified?.recommendedDP ?? spot.recommendedDP;
            const isApReady = playerAP >= effectiveAP;
            const isDpReady = playerDP >= effectiveDP;

            return (
              <div
                key={spot.id}
                onClick={() => setSelectedSpotId(spot.id)}
                className={cn(
                  "p-3.5 rounded-xl border transition-all cursor-pointer space-y-2",
                  isSelected
                    ? "bg-bg-surface-2 border-brand-primary shadow-md"
                    : "bg-bg-surface-1 border-border-subtle hover:border-border-active"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xs md:text-sm text-text-primary flex items-center gap-1.5">
                      {spot.name}
                      {verified && (
                        <span
                          title="AP/DP ยืนยันจากข้อมูล bdolytics จริง (collector)"
                          className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono"
                        >
                          ✓ DB
                        </span>
                      )}
                    </h3>
                    <span className="text-[10px] font-mono text-text-muted">
                      {spot.region} • เผ่า: {spot.species}
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

                <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono text-text-secondary bg-bg-surface-3/60 p-2 rounded-lg border border-border-subtle/40">
                  <div>
                    AP แนะนำ: <span className={isApReady ? "text-amber-400 font-bold" : "text-text-muted"}>{effectiveAP}</span>
                  </div>
                  <div>
                    DP แนะนำ: <span className={isDpReady ? "text-emerald-400 font-bold" : "text-text-muted"}>{effectiveDP}</span>
                  </div>
                  <div className="text-text-primary truncate">
                    {/* silverPerHour isn't in the DB (collector never scraped a real
                        figure for it) - once AP/DP come from the DB, mixing in the
                        old hand-guessed silver/hr would look verified when it isn't,
                        so it's hidden rather than shown next to a "✓ DB" badge. */}
                    {verified ? 'ไม่ทราบ (รอข้อมูล collector)' : spot.silverPerHour}
                  </div>
                </div>

                {/* Treasure badges */}
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

        {/* Right: Selected Spot Detail & Build Mode */}
        <div className="lg:col-span-6 bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 space-y-4 shadow-lg">
          
          <div className="border-b border-border-subtle pb-3 space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-heading font-bold text-text-primary flex items-center gap-2">
                {selectedSpot.name}
                {selectedVerified && (
                  <span
                    title="ยืนยันจากข้อมูล bdolytics จริง (collector)"
                    className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono"
                  >
                    ✓ DB Verified
                  </span>
                )}
              </h2>
              {!selectedVerified && (
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {selectedSpot.silverPerHour}
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary font-mono">
              ภูมิภาค: {selectedSpot.region} | Monster AP Cap: <span className="text-text-primary font-bold">{selectedSpot.monsterAPCap}</span> | Accuracy: <span className="text-text-primary font-bold">{selectedSpot.accuracyRequirement}</span>
              {selectedVerified?.coordinates && (
                <>
                  {' '}| พิกัด: <span className="text-text-primary font-bold">[{selectedVerified.coordinates[0]}, {selectedVerified.coordinates[1]}]</span>
                </>
              )}
            </p>
          </div>

          {/* Mechanics */}
          <div className="p-3 rounded-lg bg-bg-surface-2/70 border border-border-subtle space-y-1 text-xs">
            <h4 className="font-bold text-text-primary text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-brand-accent" /> กลไกการฟาร์ม (Spot Mechanics):
            </h4>
            <ul className="list-disc list-inside space-y-1 text-text-secondary text-[11px] leading-relaxed">
              {selectedSpot.keyMechanics.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>

          {/* Build Presets */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
                พรีเซ็ตอุปกรณ์แนะนำ (Build Preset):
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

            <div className="p-3 rounded-lg bg-bg-surface-2 border border-border-subtle space-y-2.5 text-xs font-mono">
              <div>
                <span className="font-bold text-text-primary">{currentPreset.name}</span>
                <p className="text-[11px] text-text-secondary mt-0.5">{currentPreset.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-bg-surface-3 border border-border-subtle">
                  <span className="text-text-muted text-[10px] block">โบราณวัตถุ (Artifacts):</span>
                  <span className="text-text-primary font-bold">{currentPreset.artifacts.slot1}</span>
                </div>
                <div className="p-2 rounded bg-bg-surface-3 border border-border-subtle">
                  <span className="text-text-muted text-[10px] block">เซ็ตหินแปรธาตุ (Lightstone Combo):</span>
                  <span className="text-brand-gold font-bold">{currentPreset.lightstones.comboName}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
