'use client';

import React from 'react';
import {
  Swords,
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { cn } from '@/lib/utils';

interface WarReadinessViewProps {
  store: ReturnType<typeof useRoadmapStore>;
}

export const WarReadinessView: React.FC<WarReadinessViewProps> = ({ store }) => {
  const { warReadiness } = store;

  const getPillarStatusBadge = (status: string) => {
    switch (status) {
      case 'READY':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">READY</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">IN PROGRESS</span>;
      case 'BLOCKED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">BLOCKED</span>;
      case 'NOT_STARTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">NOT STARTED</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      
      {/* Header Banner */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2 text-brand-gold font-mono text-xs uppercase tracking-wider">
          <Swords className="w-4 h-4 text-brand-gold" />
          <span>7-Pillar Multi-Dimensional War Readiness Meter</span>
        </div>
        <h1 className="text-lg font-heading font-bold text-text-primary">
          NODE WAR & SIEGE WAR READINESS AUDIT
        </h1>
        <p className="text-xs text-text-secondary">
          A structured readiness breakdown separating Mandatory combat prerequisites from Recommended and Completionist family infrastructure.
        </p>
      </div>

      {/* Overall Score & Critical Blockers Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left 4 Cols: Big Gauge */}
        <div className="lg:col-span-4 bg-bg-surface-1 border border-border-subtle rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              War Readiness Status
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
              {warReadiness.overallStatus.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <div className="text-4xl font-heading font-bold text-brand-gold font-mono">
              {warReadiness.totalScorePct}%
            </div>
            <p className="text-xs text-text-secondary text-center font-mono">
              Mandatory Requirements: <span className="text-text-primary font-bold">{warReadiness.mandatoryCompletionPct}% Completed</span>
            </p>
          </div>

          <div className="w-full bg-bg-surface-3 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-gold h-full rounded-full transition-all"
              style={{ width: `${warReadiness.totalScorePct}%` }}
            />
          </div>

          <p className="text-[11px] text-text-muted leading-relaxed text-center font-sans">
            Must reach 100% Mandatory completion before entering Tier 3/4 Uncapped Node Wars or Siege.
          </p>
        </div>

        {/* Right 8 Cols: Critical Blockers List */}
        <div className="lg:col-span-8 bg-red-950/20 border border-red-500/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wide border-b border-red-500/20 pb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Active War Blockers ({warReadiness.criticalBlockers.length} Items To Resolve)</span>
          </div>

          <div className="space-y-2">
            {warReadiness.criticalBlockers.map((blocker, i) => (
              <div
                key={i}
                className="p-2.5 rounded bg-bg-surface-1/90 border border-red-500/20 flex items-start gap-2.5 text-xs font-mono"
              >
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="text-red-200/90 leading-relaxed">{blocker}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 7 Pillars Detail Grid */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-4 space-y-3">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-primary" />
          Individual Readiness Pillars Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {warReadiness.pillars.map((pillar) => (
            <div
              key={pillar.id}
              className="p-3.5 rounded-lg bg-bg-surface-2 border border-border-subtle space-y-2 text-xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                
                <div className="flex items-center justify-between border-b border-border-subtle pb-1.5">
                  <div>
                    <h4 className="font-bold text-text-primary text-xs">{pillar.name}</h4>
                    <span className="text-[10px] font-mono text-brand-gold font-medium">
                      [{pillar.tier}]
                    </span>
                  </div>
                  {getPillarStatusBadge(pillar.status)}
                </div>

                <div className="font-mono text-[11px] text-text-secondary">
                  Score: <span className="text-text-primary font-bold">{pillar.score}</span>
                </div>

                <p className="text-[11px] text-text-secondary leading-tight font-sans">
                  {pillar.summary}
                </p>

                {pillar.blockerList.length > 0 && (
                  <div className="p-2 rounded bg-red-950/30 border border-red-500/20 space-y-1 text-[10px] font-mono text-red-300">
                    <span className="font-bold text-red-400 block">Pillar Blockers:</span>
                    {pillar.blockerList.map((b, idx) => (
                      <div key={idx}>• {b}</div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
