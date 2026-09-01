'use client';

import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  MapPin,
  ExternalLink,
  Shield,
  Heart,
  Compass,
  Navigation,
  Eye,
  Coins
} from 'lucide-react';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { cn } from '@/lib/utils';

interface TreasureViewProps {
  store: ReturnType<typeof useRoadmapStore>;
  onNavigateToSpot?: (spotName: string) => void;
  onNavigateToClass?: (className: string) => void;
}

export const TreasureView: React.FC<TreasureViewProps> = ({
  store,
  onNavigateToSpot,
  onNavigateToClass
}) => {
  const { treasures, toggleTreasurePiece } = store;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      
      {/* Header Banner */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2 text-brand-gold font-mono text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-brand-gold" />
          <span>Account-Wide Permanent Masterpieces</span>
        </div>
        <h1 className="text-lg font-heading font-bold text-text-primary">
          TREASURE COLLECTION & DROP PIECE TRACKER
        </h1>
        <p className="text-xs text-text-secondary">
          Track piece-by-piece completion for Infinite Potions, Archaeologist's Map, Compass, Upgraded Telescope, and Krogdalo's Sanctuary.
        </p>
      </div>

      {/* Treasures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {treasures.map((tr) => {
          const obtainedCount = tr.pieces.filter((p) => p.obtained).length;
          const totalPieces = tr.pieces.length;
          const pct = Math.round((obtainedCount / totalPieces) * 100);
          const isFinished = obtainedCount === totalPieces;

          return (
            <div
              key={tr.id}
              className={cn(
                "bg-bg-surface-1 border rounded-lg p-4 space-y-3 flex flex-col justify-between transition-colors",
                isFinished ? "border-emerald-500/40 bg-emerald-950/10" : "border-border-subtle"
              )}
            >
              <div className="space-y-3">
                
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-2 border-b border-border-subtle pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-text-primary">{tr.name}</h3>
                    </div>
                    <span className="text-[10px] font-mono text-text-muted">{tr.category}</span>
                  </div>

                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-mono font-bold",
                      isFinished
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-bg-surface-3 text-amber-400 border border-border-subtle"
                    )}
                  >
                    {obtainedCount} / {totalPieces} ({pct}%)
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-bg-surface-3 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", isFinished ? "bg-brand-success" : "bg-brand-gold")}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {tr.description}
                </p>

                {/* Piece Checkboxes */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-mono uppercase text-text-muted">
                    Artifact Piece Checklist:
                  </div>
                  {tr.pieces.map((piece) => (
                    <label
                      key={piece.id}
                      className={cn(
                        "flex items-start justify-between p-2 rounded border transition-colors cursor-pointer text-xs",
                        piece.obtained
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                          : "bg-bg-surface-2/70 border-border-subtle text-text-secondary hover:border-border-active"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={piece.obtained}
                          onChange={() => toggleTreasurePiece(tr.id, piece.id)}
                          className="mt-0.5 rounded border-border-subtle text-brand-primary focus:ring-0 bg-bg-surface-3"
                        />
                        <div>
                          <div className="font-medium text-text-primary">{piece.name}</div>
                          <div className="text-[10px] text-text-muted">
                            Spot: <span className="text-text-secondary">{piece.dropSpot}</span> ({piece.monsterName})
                          </div>
                        </div>
                      </div>

                      {piece.pityTarget && (
                        <span className="text-[10px] font-mono text-text-muted shrink-0">
                          Pity: {piece.pityCount || 0} / {piece.pityTarget}
                        </span>
                      )}
                    </label>
                  ))}
                </div>

              </div>

              {/* Card Footer Recommendations */}
              <div className="pt-3 border-t border-border-subtle space-y-1.5 text-xs font-mono">
                <div className="text-[11px] text-text-muted flex items-center justify-between">
                  <span>Recommended Spot:</span>
                  <span className="text-text-primary truncate max-w-[240px]">{tr.recommendedSpot}</span>
                </div>
                <div className="text-[11px] text-text-muted flex items-center justify-between">
                  <span>Recommended Class:</span>
                  <span className="text-brand-primary truncate max-w-[240px]">{tr.recommendedClass}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
