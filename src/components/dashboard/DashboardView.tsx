'use client';

import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Gem,
  Package,
  Shield,
  ShieldAlert,
  Sparkles,
  Swords,
  Zap
} from 'lucide-react';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { NavTabId } from '../layout/NavigationSidebar';
import { cn } from '@/lib/utils';

interface DashboardViewProps {
  onNavigate: (tab: NavTabId) => void;
  store: ReturnType<typeof useRoadmapStore>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, store }) => {
  const { stats, phases, sovereign, toggleTask, journals, warReadiness } = store;

  // Active sovereign phase tasks
  const allCurrentTasks = phases
    .flatMap((p) => p.tasks.map((t) => ({ ...t, phaseId: p.id, phaseTitle: p.title })))
    .filter((t) => !t.completed);

  const doNowTasks = allCurrentTasks.filter((t) => t.priority === 'DO_NOW').slice(0, 3);
  const highPriorityTasks = allCurrentTasks.filter((t) => t.priority === 'HIGH').slice(0, 3);
  const thisWeekTasks = allCurrentTasks.filter((t) => t.priority === 'THIS_WEEK').slice(0, 3);

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      
      {/* 🚀 Top 10-Second Tactical Decision Banner */}
      <div className="bg-gradient-to-r from-bg-surface-1 via-bg-surface-2 to-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-40 h-40 bg-brand-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          
          {/* Left Summary Box */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-border-subtle pb-3 lg:pb-0 lg:pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">
                Live Tactical Mission
              </span>
              <span className="text-[11px] text-text-muted font-mono">Asia / TH-SEA</span>
            </div>
            <h1 className="text-xl md:text-2xl font-heading font-bold text-text-primary tracking-tight">
              BDO ACCOUNT ROADMAP
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Current Target: <span className="text-brand-gold font-medium">HYPERBOOST → SOVEREIGN WEAPON FORGE</span>
            </p>

            {/* Compact GS pill grid */}
            <div className="grid grid-cols-4 gap-1.5 mt-3 text-center font-mono">
              <div className="bg-bg-surface-3 p-1.5 rounded border border-border-subtle">
                <div className="text-[9px] text-text-muted">GS</div>
                <div className="text-xs font-bold text-text-primary">{stats.gearScore}</div>
              </div>
              <div className="bg-bg-surface-3 p-1.5 rounded border border-border-subtle">
                <div className="text-[9px] text-amber-400">AP</div>
                <div className="text-xs font-bold text-amber-300">{stats.ap}</div>
              </div>
              <div className="bg-bg-surface-3 p-1.5 rounded border border-border-subtle">
                <div className="text-[9px] text-purple-400">AAP</div>
                <div className="text-xs font-bold text-purple-300">{stats.aap}</div>
              </div>
              <div className="bg-bg-surface-3 p-1.5 rounded border border-border-subtle">
                <div className="text-[9px] text-emerald-400">DP</div>
                <div className="text-xs font-bold text-emerald-300">{stats.dp}</div>
              </div>
            </div>
          </div>

          {/* Center Next Objective & Blocker */}
          <div className="lg:col-span-5 space-y-2">
            <div className="bg-bg-surface-3/80 border border-brand-primary/30 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-xs text-brand-primary font-medium mb-1">
                <Zap className="w-3.5 h-3.5 animate-pulse" />
                <span>NEXT PRIMARY OBJECTIVE:</span>
              </div>
              <p className="text-sm font-semibold text-text-primary">
                Complete Sovereign Awakening Weapon Synthesis
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                Synthesize 2x PEN Blackstar Awakening + Flame of Primordial for +5 Base Sheet AP.
              </p>
            </div>

            <div className="bg-red-950/30 border border-red-500/40 rounded-lg p-2.5 flex items-start gap-2.5 text-xs">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-red-400 uppercase tracking-wide">CRITICAL BLOCKER: </span>
                <span className="text-red-200">
                  Missing 2nd PEN Blackstar Awakening (Currently {sovereign.awakening.ownedCount}/2).
                </span>
                <p className="text-[11px] text-red-300/80 mt-0.5">
                  Do NOT open selectable Blackstar boxes randomly until Awakening is secured.
                </p>
              </div>
            </div>
          </div>

          {/* Right Fast Action Buttons */}
          <div className="lg:col-span-3 flex flex-col gap-2">
            <button
              onClick={() => onNavigate('sovereign')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-brand-primary hover:bg-purple-600 text-white font-medium text-xs shadow-md transition-all group"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" />
                <span>Open Sovereign Forge</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('spots')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-bg-surface-3 hover:bg-bg-surface-2 border border-border-subtle text-text-primary text-xs transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Find Optimal Grind Spot</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary transition-colors" />
            </button>

            <button
              onClick={() => onNavigate('safety')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-bg-surface-3 hover:bg-bg-surface-2 border border-border-subtle text-text-primary text-xs transition-colors group"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>Audit Protected Items</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary transition-colors" />
            </button>
          </div>

        </div>
      </div>

      {/* 📋 3-Column Tactical Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left 7 Cols: Action Tasks Hierarchy */}
        <div className="lg:col-span-7 space-y-3">
          
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-text-muted flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-brand-accent" />
              Actionable Task Priority Queue
            </h2>
            <button
              onClick={() => onNavigate('roadmap')}
              className="text-xs text-brand-primary hover:underline flex items-center gap-1 font-mono"
            >
              View Full Timeline ({phases.length} Phases)
            </button>
          </div>

          {/* DO NOW */}
          <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-border-subtle">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                [DO NOW] Immediate Priorities
              </div>
              <span className="text-[10px] font-mono text-text-muted">Max 3 items</span>
            </div>
            {doNowTasks.length > 0 ? (
              <div className="space-y-1.5">
                {doNowTasks.map((task) => (
                  <label
                    key={task.id}
                    className="flex items-start gap-2.5 p-2 rounded bg-bg-surface-2/60 hover:bg-bg-surface-2 border border-transparent hover:border-border-subtle transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.phaseId, task.id)}
                      className="mt-0.5 rounded border-border-subtle text-brand-primary focus:ring-0 bg-bg-surface-3"
                    />
                    <div className="text-xs leading-relaxed">
                      <span className="text-text-primary font-medium">{task.text}</span>
                      <span className="text-[10px] font-mono text-text-muted block mt-0.5">
                        Source: {task.phaseTitle}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted italic py-1">All DO NOW tasks completed!</p>
            )}
          </div>

          {/* HIGH PRIORITY */}
          <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-border-subtle">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                [HIGH PRIORITY] Core Upgrades
              </div>
              <span className="text-[10px] font-mono text-text-muted">Next steps</span>
            </div>
            {highPriorityTasks.length > 0 ? (
              <div className="space-y-1.5">
                {highPriorityTasks.map((task) => (
                  <label
                    key={task.id}
                    className="flex items-start gap-2.5 p-2 rounded bg-bg-surface-2/60 hover:bg-bg-surface-2 border border-transparent hover:border-border-subtle transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.phaseId, task.id)}
                      className="mt-0.5 rounded border-border-subtle text-brand-primary focus:ring-0 bg-bg-surface-3"
                    />
                    <div className="text-xs leading-relaxed">
                      <span className="text-text-primary font-medium">{task.text}</span>
                      <span className="text-[10px] font-mono text-text-muted block mt-0.5">
                        Source: {task.phaseTitle}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted italic py-1">No pending high priority tasks.</p>
            )}
          </div>

          {/* THIS WEEK */}
          <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-border-subtle">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                [THIS WEEK] Weekly Progression
              </div>
            </div>
            {thisWeekTasks.length > 0 ? (
              <div className="space-y-1.5">
                {thisWeekTasks.map((task) => (
                  <label
                    key={task.id}
                    className="flex items-start gap-2.5 p-2 rounded bg-bg-surface-2/60 hover:bg-bg-surface-2 border border-transparent hover:border-border-subtle transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.phaseId, task.id)}
                      className="mt-0.5 rounded border-border-subtle text-brand-primary focus:ring-0 bg-bg-surface-3"
                    />
                    <div className="text-xs leading-relaxed">
                      <span className="text-text-primary font-medium">{task.text}</span>
                      <span className="text-[10px] font-mono text-text-muted block mt-0.5">
                        Source: {task.phaseTitle}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted italic py-1">Weekly checklist is clean.</p>
            )}
          </div>

        </div>

        {/* Right 5 Cols: Strategic Meters & Anti-Trap Quick Lock */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Sovereign Readiness Card */}
          <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
                <Zap className="w-4 h-4 text-brand-primary" />
                <span>Sovereign Forge Status</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-bg-surface-3 text-text-secondary border border-border-subtle">
                PEN BS: {sovereign.totalPenOwned} / {sovereign.totalPenRequired}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-bg-surface-2/60 border border-border-subtle">
                <span className="text-text-secondary">Mainhand Sovereign:</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  [READY] (2/2 BS)
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-bg-surface-2/60 border border-red-500/30 bg-red-950/20">
                <span className="text-text-secondary">Awakening Sovereign:</span>
                <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                  [BLOCKED] (1/2 BS)
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-bg-surface-2/60 border border-border-subtle">
                <span className="text-text-secondary">Sub-weapon Sovereign:</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  [READY] (Gem of Twilight)
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('sovereign')}
              className="w-full text-center text-xs text-brand-primary hover:underline font-medium pt-1"
            >
              Manage PEN Blackstars & Forge Simulator →
            </button>
          </div>

          {/* Protected Item Quick Warning Box */}
          <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Protected Items Safety Snapshot</span>
              </div>
              <button
                onClick={() => onNavigate('safety')}
                className="text-[11px] text-brand-accent hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded bg-bg-surface-2/70 border border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gem className="w-3.5 h-3.5 text-purple-400" />
                  <span className="font-medium text-text-primary">Gem of Twilight</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                  DO NOT USE
                </span>
              </div>

              <div className="p-2 rounded bg-bg-surface-2/70 border border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-medium text-text-primary">Selectable PEN BS Box</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                  DO NOT OPEN YET
                </span>
              </div>

              <div className="p-2 rounded bg-bg-surface-2/70 border border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span className="font-medium text-text-primary">Flames of Slumbering Origin</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                  DO NOT SELL
                </span>
              </div>
            </div>
          </div>

          {/* War Readiness Quick Badge */}
          <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
                <Swords className="w-4 h-4 text-brand-gold" />
                <span>War Readiness Meter</span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">
                {warReadiness.totalScorePct}%
              </span>
            </div>

            <div className="w-full bg-bg-surface-3 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-gold h-full rounded-full transition-all"
                style={{ width: `${warReadiness.totalScorePct}%` }}
              />
            </div>

            <div className="text-[11px] text-text-secondary flex items-center justify-between pt-1 font-mono">
              <span>Mandatory: {warReadiness.mandatoryCompletionPct}%</span>
              <button
                onClick={() => onNavigate('war')}
                className="text-brand-accent hover:underline"
              >
                Inspect Blockers ({warReadiness.criticalBlockers.length}) →
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
