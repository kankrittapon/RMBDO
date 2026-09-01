'use client';

import React from 'react';
import {
  BookOpen,
  Sparkles,
  Zap,
  Shield,
  Activity,
  ArrowRight,
  Info,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { classGuideList, ClassGuideItem } from '@/data/classes/classList';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { cn } from '@/lib/utils';

interface ClassGuidesViewProps {
  store: ReturnType<typeof useRoadmapStore>;
}

export const ClassGuidesView: React.FC<ClassGuidesViewProps> = ({ store }) => {
  const { selectedClassId, setSelectedClassId } = store;

  const currentClass = classGuideList.find((c) => c.id === selectedClassId) || classGuideList[0];

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      
      {/* Header Banner */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2 text-brand-primary font-mono text-xs uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-brand-primary" />
          <span>Class Mastery & Spot-Specific Build Presets</span>
        </div>
        <h1 className="text-lg font-heading font-bold text-text-primary">
          CLASS GUIDES & SPOT-SPECIFIC BUILD MATRIX
        </h1>
        <p className="text-xs text-text-secondary">
          Compare combat attributes, protected skill rotations, Tier 3 Add-on presets, and spot-customized builds (e.g. Gyfin Underground vs Inner Edania).
        </p>
      </div>

      {/* Class Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto bg-bg-surface-1 border border-border-subtle p-2 rounded-lg">
        {classGuideList.map((cls) => (
          <button
            key={cls.id}
            onClick={() => setSelectedClassId(cls.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors shrink-0",
              selectedClassId === cls.id
                ? "bg-brand-primary text-white font-bold shadow-sm"
                : "bg-bg-surface-2 text-text-secondary hover:text-text-primary"
            )}
          >
            <span>{cls.name}</span>
            <span className="text-[10px] opacity-75 font-sans">({cls.spec})</span>
          </button>
        ))}
      </div>

      {/* Class Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left 5 Cols: Combat Attributes & Rotation */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Class Overview Card */}
          <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <div>
                <h2 className="text-base font-heading font-bold text-text-primary">
                  {currentClass.name}
                </h2>
                <span className="text-[11px] font-mono text-brand-primary font-bold">
                  {currentClass.spec} • {currentClass.role}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-bg-surface-3 text-text-secondary border border-border-subtle">
                APM: {currentClass.apmLevel}
              </span>
            </div>

            {/* Tactical Stat Ratings */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Mobility</span>
                <span className="text-text-primary font-bold">{currentClass.mobilityRating} / 10</span>
              </div>
              <div className="w-full bg-bg-surface-3 h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand-accent h-full" style={{ width: `${currentClass.mobilityRating * 10}%` }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-text-muted">Sustain (HP/MP)</span>
                <span className="text-emerald-400 font-bold">{currentClass.sustainRating} / 10</span>
              </div>
              <div className="w-full bg-bg-surface-3 h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand-success h-full" style={{ width: `${currentClass.sustainRating * 10}%` }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-text-muted">AoE Coverage</span>
                <span className="text-brand-gold font-bold">{currentClass.aoeRating} / 10</span>
              </div>
              <div className="w-full bg-bg-surface-3 h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand-gold h-full" style={{ width: `${currentClass.aoeRating * 10}%` }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-text-muted">Execution Difficulty</span>
                <span className="text-red-400 font-bold">{currentClass.difficultyRating} / 10</span>
              </div>
              <div className="w-full bg-bg-surface-3 h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand-danger h-full" style={{ width: `${currentClass.difficultyRating * 10}%` }} />
              </div>
            </div>

            {/* Strengths */}
            <div className="pt-2 border-t border-border-subtle space-y-1 text-xs">
              <h4 className="font-bold text-text-primary text-[11px] uppercase tracking-wider">
                Key Archetype Strengths:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-text-secondary text-[11px]">
                {currentClass.keyStrengths.map((str, idx) => (
                  <li key={idx}>{str}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Protected Skill Rotation */}
          <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-4 space-y-2">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-brand-primary" /> Core PvE Skill Rotation
            </h3>
            <div className="space-y-1.5">
              {currentClass.coreRotation.map((rot, i) => (
                <div key={i} className="p-2 rounded bg-bg-surface-2 text-xs font-mono flex items-center gap-2">
                  <span className="text-brand-primary font-bold">#{i + 1}</span>
                  <span className="text-text-primary">{rot}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 7 Cols: Spot-Specific Build Matrix & Add-ons */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* Spot-Specific Build Matrix (Critical UX feature) */}
          <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-gold" />
                Spot-Specific Build Matrix (Non-Universal Presets)
              </h3>
              <span className="text-[10px] font-mono text-text-muted">
                {currentClass.spotBuilds.length} Optimized Spot Profiles
              </span>
            </div>

            <div className="space-y-3">
              {currentClass.spotBuilds.map((sb, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-bg-surface-2 border border-border-subtle space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-border-subtle/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary font-heading text-sm">
                        {sb.spotName}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary font-mono text-[10px] font-bold">
                        {sb.presetName}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded bg-bg-surface-3 border border-border-subtle">
                      <span className="text-text-muted text-[10px] block">Crystals Focus:</span>
                      <span className="text-text-primary">{sb.crystalFocus}</span>
                    </div>
                    <div className="p-2 rounded bg-bg-surface-3 border border-border-subtle">
                      <span className="text-text-muted text-[10px] block">Artifacts & Lightstones:</span>
                      <span className="text-brand-gold font-medium">{sb.lightstoneCombo}</span>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono space-y-1 bg-bg-surface-3/60 p-2 rounded border border-border-subtle/40">
                    <div>
                      <span className="text-text-muted">Opening Add-on: </span>
                      <span className="text-text-secondary">{sb.addonPreset}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Execution Key: </span>
                      <span className="text-text-primary font-bold">{sb.rotationKey}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-text-secondary italic">
                    💡 Tactical Note: {sb.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tier 3 Skill Add-ons Table */}
          <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-4 space-y-2.5">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Recommended Tier 3 Skill Add-on Specializations
            </h3>
            <div className="space-y-1.5">
              {currentClass.addons.map((add, i) => (
                <div
                  key={i}
                  className="p-2 rounded bg-bg-surface-2 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono"
                >
                  <span className="font-bold text-text-primary">{add.skillName}</span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-amber-400 font-medium">[1] {add.buff1}</span>
                    <span className="text-text-muted">|</span>
                    <span className="text-purple-400 font-medium">[2] {add.buff2}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
