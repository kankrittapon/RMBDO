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
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-brand-primary font-mono text-xs uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-brand-primary" />
          <span>คู่มืออาชีพ & การจัดเซ็ตสกิลเฉพาะจุดฟาร์ม (Class Mastery Guides)</span>
        </div>
        <h1 className="text-lg md:text-xl font-heading font-bold text-text-primary">
          คู่มืออาชีพ คอมโบป้องกันตัว (SA/FG) และ Tier 3 Skill Add-ons
        </h1>
        <p className="text-xs text-text-secondary">
          เปรียบเทียบคุณสมบัติอาชีพ ลำดับการกดสกิลแบบไม่โดนขัดจังหวะ และพรีเซ็ตอุปกรณ์เฉพาะพื้นที่
        </p>
      </div>

      {/* Class Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto bg-bg-surface-1 border border-border-subtle p-2 rounded-xl">
        {classGuideList.map((cls) => (
          <button
            key={cls.id}
            onClick={() => setSelectedClassId(cls.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors shrink-0",
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

      {/* Class Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left: Attributes */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 space-y-3 shadow-lg">
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

            {/* Ratings */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">ความคล่องตัว (Mobility)</span>
                <span className="text-text-primary font-bold">{currentClass.mobilityRating} / 10</span>
              </div>
              <div className="w-full bg-bg-surface-3 h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand-accent h-full" style={{ width: `${currentClass.mobilityRating * 10}%` }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-text-muted">การฟื้นฟู HP/MP (Sustain)</span>
                <span className="text-emerald-400 font-bold">{currentClass.sustainRating} / 10</span>
              </div>
              <div className="w-full bg-bg-surface-3 h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand-success h-full" style={{ width: `${currentClass.sustainRating * 10}%` }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-text-muted">ระยะสกิลกว้าง (AoE)</span>
                <span className="text-brand-gold font-bold">{currentClass.aoeRating} / 10</span>
              </div>
              <div className="w-full bg-bg-surface-3 h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand-gold h-full" style={{ width: `${currentClass.aoeRating * 10}%` }} />
              </div>
            </div>

            {/* Strengths */}
            <div className="pt-2 border-t border-border-subtle space-y-1 text-xs">
              <h4 className="font-bold text-text-primary text-[11px] uppercase tracking-wider">
                จุดเด่นประจำอาชีพ:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-text-secondary text-[11px]">
                {currentClass.keyStrengths.map((str, idx) => (
                  <li key={idx}>{str}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Core Rotation */}
          <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 space-y-2 shadow-lg">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-brand-primary" /> ลำดับคอมโบสกิล PvE (Core Rotation)
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

        {/* Right: Spot-Specific Matrix */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-gold" />
                การจัดเซ็ตเฉพาะจุดฟาร์ม (Spot-Specific Builds)
              </h3>
            </div>

            <div className="space-y-3">
              {currentClass.spotBuilds.map((sb, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-bg-surface-2 border border-border-subtle space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-border-subtle/80 pb-2">
                    <span className="font-bold text-text-primary font-heading text-sm">{sb.spotName}</span>
                    <span className="px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary font-mono text-[10px] font-bold">
                      {sb.presetName}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded bg-bg-surface-3 border border-border-subtle">
                      <span className="text-text-muted text-[10px] block">อัญมณีเน้น:</span>
                      <span className="text-text-primary">{sb.crystalFocus}</span>
                    </div>
                    <div className="p-2 rounded bg-bg-surface-3 border border-border-subtle">
                      <span className="text-text-muted text-[10px] block">โบราณวัตถุ & หินแปรธาตุ:</span>
                      <span className="text-brand-gold font-medium">{sb.lightstoneCombo}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-text-secondary italic pt-1">
                    💡 ทริคการเล่น: {sb.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
