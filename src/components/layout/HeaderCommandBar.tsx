'use client';

import React, { useState } from 'react';
import {
  Shield,
  Zap,
  Sparkles,
  RotateCcw,
  Sliders,
  CheckCircle2,
  FileCode,
  HelpCircle,
  Pencil
} from 'lucide-react';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { cn } from '@/lib/utils';

interface HeaderCommandBarProps {
  store: ReturnType<typeof useRoadmapStore>;
  onOpenSetup: () => void;
  onOpenImportExport: () => void;
  onOpenReset: () => void;
}

export const HeaderCommandBar: React.FC<HeaderCommandBarProps> = ({
  store,
  onOpenSetup,
  onOpenImportExport,
  onOpenReset
}) => {
  const { profile, updateStats, currentPhase } = store;
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [ap, setAp] = useState<string>(profile.stats.ap ? String(profile.stats.ap) : '');
  const [aap, setAap] = useState<string>(profile.stats.aap ? String(profile.stats.aap) : '');
  const [dp, setDp] = useState<string>(profile.stats.dp ? String(profile.stats.dp) : '');
  const [isUnknown, setIsUnknown] = useState<boolean>(Boolean(profile.stats.isUnknownStats));

  const handleSaveStats = () => {
    if (isUnknown) {
      updateStats({
        ap: null,
        aap: null,
        dp: null,
        gearScore: null,
        isUnknownStats: true
      });
    } else {
      const numAP = parseInt(ap, 10) || 0;
      const numAAP = parseInt(aap, 10) || numAP;
      const numDP = parseInt(dp, 10) || 0;
      updateStats({
        ap: numAP > 0 ? numAP : null,
        aap: numAAP > 0 ? numAAP : null,
        dp: numDP > 0 ? numDP : null,
        isUnknownStats: false
      });
    }
    setIsEditingStats(false);
  };

  const formattedGS = profile.stats.isUnknownStats
    ? 'ยังไม่ระบุ'
    : profile.stats.gearScore
    ? `${profile.stats.gearScore} GS`
    : 'ยังไม่ระบุ';

  return (
    <header className="sticky top-0 z-40 w-full bg-bg-surface-1/95 backdrop-blur border-b border-border-subtle px-3 md:px-5 py-2.5 shadow-sm">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 max-w-7xl mx-auto">
        
        {/* Left Brand & Current Phase */}
        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-primary flex items-center justify-center font-heading font-black text-white text-xs shadow-md">
              RM
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-xs md:text-sm tracking-wide text-text-primary">
                  RMBDO
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                  THAI v2.0
                </span>
              </div>
              <span className="text-[10px] text-text-muted font-mono hidden sm:inline">
                ระบบวางแผนและตรวจสอบความคืบหน้า BDO (TH-SEA)
              </span>
            </div>
          </div>

          {/* Current Phase Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-surface-2 border border-border-subtle text-xs">
            <Zap className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
            <span className="text-text-muted font-mono text-[11px]">ขั้นปัจจุบัน:</span>
            <span className="font-heading font-bold text-text-primary text-[11px] truncate max-w-[200px]">
              {currentPhase.name.split(' ')[1] || currentPhase.name}
            </span>
          </div>
        </div>

        {/* Right Stats & Command Actions */}
        <div className="flex items-center justify-between md:justify-end gap-2 text-xs font-mono">
          
          {/* Quick Stats Pill (Click to edit) */}
          <div
            onClick={() => setIsEditingStats(!isEditingStats)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-bg-surface-2 hover:bg-bg-surface-3 border border-border-subtle cursor-pointer transition-colors"
            title="คลิกเพื่อแก้ไขค่าสเตตัส AP / DP"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-text-muted">สเตตัส:</span>
              <span className="font-bold text-brand-gold">{formattedGS}</span>
            </div>
            {!profile.stats.isUnknownStats && profile.stats.ap && (
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-text-secondary border-l border-border-subtle pl-1.5">
                <span className="text-amber-400 font-bold">{profile.stats.ap}</span> /
                <span className="text-purple-400 font-bold">{profile.stats.aap || profile.stats.ap}</span> /
                <span className="text-emerald-400 font-bold">{profile.stats.dp}</span>
              </div>
            )}
            <Pencil className="w-3 h-3 text-text-muted" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenSetup}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-primary/15 hover:bg-brand-primary/25 border border-brand-primary/30 text-brand-primary text-xs font-bold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ตั้งค่าเริ่มต้น</span>
            </button>

            <button
              onClick={onOpenImportExport}
              className="p-1.5 rounded-lg bg-bg-surface-2 hover:bg-bg-surface-3 border border-border-subtle text-text-muted hover:text-text-primary transition-colors"
              title="สำรอง / กู้คืนข้อมูล (JSON)"
            >
              <FileCode className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenReset}
              className="p-1.5 rounded-lg bg-bg-surface-2 hover:bg-bg-surface-3 border border-border-subtle text-text-muted hover:text-red-400 transition-colors"
              title="รีเซ็ตความคืบหน้า"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Inline Quick Stat Editor Modal/Dropdown */}
      {isEditingStats && (
        <div className="mt-2.5 pt-2.5 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto animate-in fade-in">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsUnknown(!isUnknown)}
              className={cn(
                "px-2 py-1 rounded text-[11px] font-mono border transition-colors",
                isUnknown
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : "bg-bg-surface-3 text-text-muted border-border-subtle"
              )}
            >
              [ยังไม่ทราบค่าสเตตัส]
            </button>

            {!isUnknown && (
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <input
                  type="number"
                  placeholder="AP"
                  value={ap}
                  onChange={(e) => setAp(e.target.value)}
                  className="w-16 px-2 py-1 bg-bg-surface-3 border border-border-subtle rounded text-amber-400 font-bold outline-none"
                />
                <input
                  type="number"
                  placeholder="AAP"
                  value={aap}
                  onChange={(e) => setAap(e.target.value)}
                  className="w-16 px-2 py-1 bg-bg-surface-3 border border-border-subtle rounded text-purple-400 font-bold outline-none"
                />
                <input
                  type="number"
                  placeholder="DP"
                  value={dp}
                  onChange={(e) => setDp(e.target.value)}
                  className="w-16 px-2 py-1 bg-bg-surface-3 border border-border-subtle rounded text-emerald-400 font-bold outline-none"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditingStats(false)}
              className="px-2.5 py-1 rounded bg-bg-surface-3 text-text-muted text-xs hover:text-text-primary"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSaveStats}
              className="px-3 py-1 rounded bg-brand-primary text-white text-xs font-bold hover:bg-purple-600 shadow-sm"
            >
              บันทึกสเตตัส
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
