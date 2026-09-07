'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Wheat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeHit {
  waypointKey: number;
  name: string | null;
  cpCost: number;
  matchedName: string;
  normalQty: number | null;
  giantQty: number | null;
  price: number | null;
  normalValue: number | null;
  giantValue: number | null;
  normalValuePerCp: number | null;
  giantValuePerCp: number | null;
}

const norm = (s: string) => s.trim().toLowerCase();

const fmt = (n: number | null) =>
  n === null ? '—' : n.toLocaleString('en-US', { maximumFractionDigits: 2 });

/** Reverse lookup: which worker nodes yield this exact ingredient?
 * Matching rule (explicit direction): EXACT name match only
 * (case/whitespace-insensitive). The API searches with ILIKE, so this
 * component re-filters to exact hits - a near-miss (e.g. "Milk" vs
 * "Sour Milk") shows "not found" instead of a wrong node. Never fuzzy. */
export const NodeSourceLookup: React.FC<{ ingredientName: string }> = ({ ingredientName }) => {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<'normal' | 'giant'>('normal');
  const [hits, setHits] = useState<NodeHit[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setHits(null);
    fetch(`/api/nodes?resource=${encodeURIComponent(ingredientName)}&kind=${kind}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((json: { nodes?: NodeHit[] }) => {
        if (cancelled) return;
        const exact = (json.nodes ?? []).filter((h) => norm(h.matchedName) === norm(ingredientName));
        setHits(exact.slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setHits([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, kind, ingredientName]);

  return (
    <div className="space-y-1.5">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
      >
        <Wheat className="w-3 h-3" />
        {open ? 'ซ่อนโหนดที่ขุดได้' : 'ดูโหนดที่ขุดได้'}
      </button>

      {open && (
        <div className="space-y-1.5 rounded-lg border border-border-subtle bg-bg-surface-3 p-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className="text-text-muted">จัดอันดับตาม:</span>
            <button
              onClick={() => setKind('normal')}
              className={cn(
                'px-2 py-0.5 rounded border',
                kind === 'normal'
                  ? 'bg-brand-primary/20 border-brand-primary/40 text-brand-primary font-bold'
                  : 'border-border-subtle text-text-muted',
              )}
            >
              👨 Normal
            </button>
            <button
              onClick={() => setKind('giant')}
              className={cn(
                'px-2 py-0.5 rounded border',
                kind === 'giant'
                  ? 'bg-brand-primary/20 border-brand-primary/40 text-brand-primary font-bold'
                  : 'border-border-subtle text-text-muted',
              )}
            >
              🐢 Giant
            </button>
          </div>

          {loading && (
            <div className="flex items-center gap-1.5 text-[11px] text-text-muted py-1">
              <Loader2 className="w-3 h-3 animate-spin" /> กำลังหาโหนด...
            </div>
          )}

          {!loading && hits !== null && hits.length === 0 && (
            <p className="text-[11px] text-text-muted">
              ไม่พบโหนดที่ขุด {ingredientName} ได้ — อาจเป็นของ vendor/farm-only หรือชื่อไม่ตรงกับฐานข้อมูลโหนด
            </p>
          )}

          {!loading &&
            hits !== null &&
            hits.map((h) => {
              const qty = kind === 'giant' ? h.giantQty : h.normalQty;
              const value = kind === 'giant' ? h.giantValue : h.normalValue;
              const perCp = kind === 'giant' ? h.giantValuePerCp : h.normalValuePerCp;
              return (
                <div
                  key={h.waypointKey}
                  className="flex items-center justify-between gap-2 text-[11px] p-1.5 rounded bg-bg-surface-2 border border-border-subtle"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-text-primary truncate">
                      {h.name ?? `#${h.waypointKey}`}
                    </span>
                    <span className="ml-1.5 text-text-muted font-mono text-[10px]">
                      #{h.waypointKey} • {h.cpCost} CP • ×{fmt(qty)}
                    </span>
                  </div>
                  <div className="text-right font-mono shrink-0">
                    <div className="text-text-primary font-bold">{value === null ? 'ไม่มีราคา' : fmt(value)}</div>
                    <div className="text-text-muted text-[10px]">
                      {perCp === null ? '' : `${fmt(perCp)}/CP`}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};
