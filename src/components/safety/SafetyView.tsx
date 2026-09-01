'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Lock,
  Unlock,
  AlertOctagon,
  Flame,
  Gem,
  Package,
  FileCode,
  DollarSign,
  CheckCircle,
  Filter
} from 'lucide-react';
import { itemSafetyRules, SafetyRuleItem, SafetyAction } from '@/data/gear/safetyRules';
import { cn } from '@/lib/utils';

export const SafetyView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [rules, setRules] = useState<SafetyRuleItem[]>(itemSafetyRules);

  const toggleLock = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, lockedByDefault: !r.lockedByDefault } : r))
    );
  };

  const filteredRules = rules.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.purpose.toLowerCase().includes(search.toLowerCase()) ||
      item.dangerRisk.toLowerCase().includes(search.toLowerCase());
    const matchesAction = selectedAction === 'ALL' || item.action === selectedAction;
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: SafetyAction) => {
    switch (action) {
      case 'DO_NOT_USE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">[DO NOT USE]</span>;
      case 'DO_NOT_SELL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">[DO NOT SELL]</span>;
      case 'DO_NOT_HEAT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">[DO NOT HEAT]</span>;
      case 'DO_NOT_OPEN_YET':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">[DO NOT OPEN YET]</span>;
      case 'SAFE_TO_USE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">[SAFE TO USE]</span>;
      case 'SAFE_TO_SELL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">[SAFE TO SELL]</span>;
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      
      {/* Header Banner */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2 text-red-400 font-mono text-xs uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>Item Protection & Anti-Trap Intelligence</span>
        </div>
        <h1 className="text-lg font-heading font-bold text-text-primary">
          ITEM SAFETY AUDIT SYSTEM
        </h1>
        <p className="text-xs text-text-secondary">
          Clear, unambiguous safety classifications for rare, time-gated, and future synthesis materials. Never waste a valuable item by mistake.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-bg-surface-1 border border-border-subtle p-3 rounded-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search item name, purpose, or danger rule..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-bg-surface-3 border border-border-subtle rounded text-xs text-text-primary placeholder:text-text-muted focus:border-brand-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          {['ALL', 'DO_NOT_USE', 'DO_NOT_SELL', 'DO_NOT_OPEN_YET', 'SAFE_TO_USE'].map((act) => (
            <button
              key={act}
              onClick={() => setSelectedAction(act)}
              className={cn(
                "px-2 py-1 rounded text-[10px] shrink-0 transition-colors",
                selectedAction === act
                  ? "bg-brand-primary text-white font-bold"
                  : "bg-bg-surface-2 text-text-muted hover:text-text-primary"
              )}
            >
              {act.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Safety Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredRules.map((item) => (
          <div
            key={item.id}
            className="bg-bg-surface-1 border border-border-subtle rounded-lg p-3.5 space-y-3 flex flex-col justify-between hover:border-border-active transition-colors"
          >
            <div className="space-y-2">
              
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 border-b border-border-subtle pb-2">
                <div>
                  <h3 className="font-bold text-text-primary text-xs flex items-center gap-1.5">
                    {item.name}
                  </h3>
                  <span className="text-[10px] font-mono text-text-muted">{item.category}</span>
                </div>
                {getActionBadge(item.action)}
              </div>

              {/* Purpose & Needed */}
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-text-muted text-[11px]">Purpose: </span>
                  <span className="text-text-secondary font-medium">{item.purpose}</span>
                </div>
                <div>
                  <span className="text-text-muted text-[11px]">Needed: </span>
                  <span className="text-text-primary font-mono text-[11px]">{item.needed}</span>
                </div>
                <div>
                  <span className="text-text-muted text-[11px]">Use When: </span>
                  <span className="text-brand-gold font-medium">{item.useWhen}</span>
                </div>
              </div>

              {/* Danger Box */}
              <div className="p-2 rounded bg-red-950/20 border border-red-500/20 text-[11px] text-red-200/90 flex items-start gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span>{item.dangerRisk}</span>
              </div>

            </div>

            {/* Lock toggle button */}
            <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-text-muted">Storage Safety Lock:</span>
              <button
                onClick={() => toggleLock(item.id)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition-colors",
                  item.lockedByDefault
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold"
                    : "bg-bg-surface-3 text-text-muted border border-border-subtle"
                )}
              >
                {item.lockedByDefault ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                <span>{item.lockedByDefault ? 'LOCKED' : 'UNLOCKED'}</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
