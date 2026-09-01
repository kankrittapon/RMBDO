'use client';

import React from 'react';
import { Shield, Zap, Sparkles, RefreshCw, Globe, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AccountStats } from '@/hooks/useRoadmapStore';
import { metaFreshness } from '@/data/patches/meta';

interface HeaderCommandBarProps {
  stats: AccountStats;
  onUpdateStats: (newStats: Partial<AccountStats>) => void;
  onReset: () => void;
  currentPhaseTitle: string;
}

export const HeaderCommandBar: React.FC<HeaderCommandBarProps> = ({
  stats,
  onUpdateStats,
  onReset,
  currentPhaseTitle
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [apInput, setApInput] = React.useState(stats.ap.toString());
  const [aapInput, setAapInput] = React.useState(stats.aap.toString());
  const [dpInput, setDpInput] = React.useState(stats.dp.toString());

  const handleSaveStats = () => {
    const ap = parseInt(apInput) || 0;
    const aap = parseInt(aapInput) || 0;
    const dp = parseInt(dpInput) || 0;
    onUpdateStats({ ap, aap, dp });
    setIsEditing(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-bg-surface-1/95 backdrop-blur px-4 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        {/* Left Branding & Phase */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-primary font-bold text-sm shadow-sm">
              Ω
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold tracking-wide text-text-primary text-sm">BDO TACTICAL HUD</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                  PRO MAX v2026
                </span>
              </div>
              <p className="text-[11px] text-text-secondary">
                Phase: <span className="text-brand-gold font-medium">{currentPhaseTitle}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center Live KPI Stats Bar */}
        <div className="flex items-center gap-2 flex-wrap bg-bg-surface-2 px-3 py-1.5 rounded-lg border border-border-subtle shadow-inner">
          {isEditing ? (
            <div className="flex items-center gap-2 text-xs font-mono">
              <label className="flex items-center gap-1 text-amber-400">
                AP:
                <input
                  type="number"
                  value={apInput}
                  onChange={(e) => setApInput(e.target.value)}
                  className="w-14 px-1.5 py-0.5 bg-bg-surface-3 border border-border-active rounded text-text-primary text-center font-mono"
                />
              </label>
              <label className="flex items-center gap-1 text-purple-400">
                AAP:
                <input
                  type="number"
                  value={aapInput}
                  onChange={(e) => setAapInput(e.target.value)}
                  className="w-14 px-1.5 py-0.5 bg-bg-surface-3 border border-border-active rounded text-text-primary text-center font-mono"
                />
              </label>
              <label className="flex items-center gap-1 text-emerald-400">
                DP:
                <input
                  type="number"
                  value={dpInput}
                  onChange={(e) => setDpInput(e.target.value)}
                  className="w-14 px-1.5 py-0.5 bg-bg-surface-3 border border-border-active rounded text-text-primary text-center font-mono"
                />
              </label>
              <button
                onClick={handleSaveStats}
                className="px-2 py-0.5 bg-brand-accent hover:bg-blue-600 text-white rounded text-[11px] font-sans font-medium transition-colors"
              >
                Save
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-4 cursor-pointer group hover:opacity-90 transition-opacity"
              title="Click to edit AP / AAP / DP values"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-mono text-text-muted">GS</span>
                <span className="font-mono font-bold text-sm text-text-primary bg-bg-surface-3 px-1.5 py-0.5 rounded border border-border-subtle group-hover:border-brand-accent/50">
                  {stats.gearScore}
                </span>
              </div>
              <div className="h-3 w-px bg-border-subtle" />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-mono text-amber-400">AP</span>
                <span className="font-mono font-bold text-sm text-amber-300">{stats.ap}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-mono text-purple-400">AAP</span>
                <span className="font-mono font-bold text-sm text-purple-300">{stats.aap}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-mono text-emerald-400">DP</span>
                <span className="font-mono font-bold text-sm text-emerald-300">{stats.dp}</span>
              </div>
              <span className="text-[10px] text-text-muted italic group-hover:text-brand-accent ml-1">(Edit)</span>
            </div>
          )}
        </div>

        {/* Right Metadata & Freshness Indicator */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-surface-2 border border-border-subtle text-text-secondary font-mono text-[11px]">
            <Globe className="w-3 h-3 text-brand-cyan" />
            <span>{metaFreshness.region}</span>
            <span className="text-text-muted">|</span>
            <span className="text-brand-success flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 inline" /> {metaFreshness.verifiedAt}
            </span>
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] text-text-muted hover:text-brand-danger px-2 py-1 rounded hover:bg-bg-surface-2 transition-colors"
            title="Reset all checklist progress to default"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden lg:inline">Reset</span>
          </button>
        </div>

      </div>
    </header>
  );
};
