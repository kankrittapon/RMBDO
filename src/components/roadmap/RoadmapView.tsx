'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Shield,
  Coins,
  MapPin,
  Lock,
  ArrowDown,
  Sparkles,
  Info
} from 'lucide-react';
import { ProgressionPhase, PhaseStatus } from '@/data/progression/phases';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { cn } from '@/lib/utils';

interface RoadmapViewProps {
  store: ReturnType<typeof useRoadmapStore>;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ store }) => {
  const { phases, selectedPhaseId, setSelectedPhaseId, toggleTask, setPhaseStatus } = store;
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const selectedPhase = phases.find((p) => p.id === selectedPhaseId) || phases[0];

  const filteredPhases = phases.filter((p) => {
    if (filterStatus === 'ALL') return true;
    return p.status === filterStatus;
  });

  const getStatusBadge = (status: PhaseStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center gap-1"><Clock className="w-3 h-3 animate-spin" /> In Progress</span>;
      case 'BLOCKED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Blocked</span>;
      case 'AVAILABLE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center gap-1">Available</span>;
      case 'FUTURE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-500/20 text-slate-400 border border-slate-500/40 flex items-center gap-1"><Lock className="w-3 h-3" /> Future</span>;
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      
      {/* Header & Filter Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-bg-surface-1 border border-border-subtle p-3.5 rounded-lg">
        <div>
          <h1 className="text-lg font-heading font-bold text-text-primary tracking-wide flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            MASTER PROGRESSION ROADMAP (11 PHASES)
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Sequential progression milestones from Season graduation to Endgame War Readiness.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono">
          {['ALL', 'COMPLETED', 'IN_PROGRESS', 'AVAILABLE', 'FUTURE'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={cn(
                "px-2.5 py-1 rounded text-[11px] transition-colors",
                filterStatus === st
                  ? "bg-brand-primary text-white font-bold"
                  : "bg-bg-surface-2 text-text-muted hover:text-text-primary"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Roadmap Layout: Left Timeline, Right Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left Column: Interactive 11-step visual timeline */}
        <div className="lg:col-span-5 space-y-2">
          {filteredPhases.map((phase, index) => {
            const isSelected = phase.id === selectedPhaseId;
            const completedCount = phase.tasks.filter((t) => t.completed).length;
            const totalTasks = phase.tasks.length;
            const pct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

            return (
              <div key={phase.id} className="relative">
                <div
                  onClick={() => setSelectedPhaseId(phase.id)}
                  className={cn(
                    "p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-2",
                    isSelected
                      ? "bg-bg-surface-2 border-brand-primary shadow-md"
                      : "bg-bg-surface-1/90 border-border-subtle hover:border-border-active"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-text-muted">
                        #{phase.order.toString().padStart(2, '0')}
                      </span>
                      <span className="text-xs font-bold text-text-primary truncate max-w-[200px]">
                        {phase.title}
                      </span>
                    </div>
                    {getStatusBadge(phase.status)}
                  </div>

                  <p className="text-[11px] text-text-secondary line-clamp-1">
                    {phase.subtitle}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-1 border-t border-border-subtle/60">
                    <div className="flex items-center gap-2">
                      <span>AP: <strong className="text-amber-400">{phase.apRange}</strong></span>
                      <span>DP: <strong className="text-emerald-400">{phase.dpRange}</strong></span>
                    </div>
                    <span>Tasks: {completedCount}/{totalTasks} ({pct}%)</span>
                  </div>

                  {/* Tiny progress bar */}
                  <div className="w-full bg-bg-surface-3 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-primary h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {index < filteredPhases.length - 1 && (
                  <div className="flex justify-center my-0.5 text-text-muted/40">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Phase Detail Inspector */}
        <div className="lg:col-span-7 bg-bg-surface-1 border border-border-subtle rounded-lg p-4 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30">
                  {selectedPhase.tierBadge}
                </span>
                <span className="text-xs font-mono text-text-muted">
                  Phase #{selectedPhase.order} of 11
                </span>
              </div>
              <h2 className="text-base md:text-lg font-heading font-bold text-text-primary">
                {selectedPhase.title}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {selectedPhase.subtitle}
              </p>
            </div>

            {/* Quick Status Override Dropdown */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-text-muted text-[11px]">Status:</span>
              <select
                value={selectedPhase.status}
                onChange={(e) => setPhaseStatus(selectedPhase.id, e.target.value as PhaseStatus)}
                className="bg-bg-surface-3 border border-border-subtle text-text-primary px-2 py-1 rounded text-xs"
              >
                <option value="COMPLETED">COMPLETED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="BLOCKED">BLOCKED</option>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="FUTURE">FUTURE</option>
              </select>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2 rounded bg-bg-surface-2 border border-border-subtle">
              <span className="text-[10px] text-text-muted block">Target AP</span>
              <span className="text-amber-400 font-bold">{selectedPhase.apRange}</span>
            </div>
            <div className="p-2 rounded bg-bg-surface-2 border border-border-subtle">
              <span className="text-[10px] text-text-muted block">Target DP</span>
              <span className="text-emerald-400 font-bold">{selectedPhase.dpRange}</span>
            </div>
            <div className="p-2 rounded bg-bg-surface-2 border border-border-subtle">
              <span className="text-[10px] text-text-muted block">Est. Cost</span>
              <span className="text-text-primary font-bold truncate block">{selectedPhase.estimatedCost}</span>
            </div>
            <div className="p-2 rounded bg-bg-surface-2 border border-border-subtle">
              <span className="text-[10px] text-text-muted block">Locations</span>
              <span className="text-text-secondary truncate block">{selectedPhase.grindLocations.length} Zones</span>
            </div>
          </div>

          {/* Tasks Checklist */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wide flex items-center justify-between">
              <span>Milestone Action Checklist</span>
              <span className="text-[10px] font-mono text-text-muted">Click to toggle completion</span>
            </h3>
            <div className="space-y-1.5">
              {selectedPhase.tasks.map((t) => (
                <label
                  key={t.id}
                  className="flex items-start gap-2.5 p-2.5 rounded bg-bg-surface-2/70 hover:bg-bg-surface-2 border border-border-subtle/50 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleTask(selectedPhase.id, t.id)}
                    className="mt-0.5 rounded border-border-subtle text-brand-primary focus:ring-0 bg-bg-surface-3"
                  />
                  <div className="text-xs leading-relaxed flex-1">
                    <span className={cn("font-medium", t.completed ? "line-through text-text-muted" : "text-text-primary")}>
                      {t.text}
                    </span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-bg-surface-3 text-text-secondary ml-2 border border-border-subtle">
                      {t.priority}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Requirements & Rewards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-bg-surface-2/60 border border-border-subtle space-y-1.5">
              <h4 className="font-bold text-text-primary flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 text-brand-accent" /> Entry Requirements
              </h4>
              <ul className="list-disc list-inside space-y-1 text-text-secondary text-[11px]">
                {selectedPhase.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-bg-surface-2/60 border border-border-subtle space-y-1.5">
              <h4 className="font-bold text-brand-gold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-brand-gold" /> Major Rewards
              </h4>
              <ul className="list-disc list-inside space-y-1 text-text-secondary text-[11px]">
                {selectedPhase.rewards.map((rew, i) => (
                  <li key={i}>{rew}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Items Required vs Items to Preserve */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-bg-surface-2/60 border border-border-subtle space-y-1.5">
              <h4 className="font-bold text-blue-400 text-[11px] uppercase tracking-wider">
                📦 Items Required
              </h4>
              <ul className="list-disc list-inside space-y-1 text-text-secondary text-[11px]">
                {selectedPhase.itemsRequired.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/30 space-y-1.5">
              <h4 className="font-bold text-red-400 text-[11px] uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-red-400" /> Items To Preserve (DO NOT WASTE)
              </h4>
              <ul className="list-disc list-inside space-y-1 text-red-200/90 text-[11px]">
                {selectedPhase.itemsToPreserve.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Exit Conditions */}
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-1.5 text-xs">
            <h4 className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Exit & Phase Completion Conditions
            </h4>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedPhase.exitConditions.map((cond, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono">
                  ✓ {cond}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
