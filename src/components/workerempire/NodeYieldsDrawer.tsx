'use client';

import React, { useEffect, useState } from 'react';
import { X, Loader2, AlertCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YieldItem {
  itemId: number | null;
  name: string;
  quantity: number;
  price: number | null;
  value: number | null;
}

interface YieldVariant {
  workerKind: 'normal' | 'giant';
  items: YieldItem[];
  cycleValue: number;
  unpricedCount: number;
}

interface NodeDetailData {
  waypointKey: number;
  name: string | null;
  parentKey: number | null;
  kind: number | null;
  cpCost: number;
  workload: number | null;
  regionGroup: number | null;
  normal: YieldVariant;
  giant: YieldVariant;
}

interface NodeYieldsDrawerProps {
  // Node (waypoint) id - NOT a resource item id. These share no namespace
  // (e.g. Wheat the item is 7001, Wheat Farming the node is 852), so the
  // caller must pass waypointKey explicitly; this component never guesses
  // a node id from an item id.
  waypointKey: number | null;
  onClose: () => void;
  // Called with the same waypointKey (node id) to prefill a solver pair.
  onSendToSolver: (waypointKey: number) => void;
}

const fmt = (n: number | null) =>
  n === null ? '—' : n.toLocaleString('en-US', { maximumFractionDigits: 2 });

export const NodeYieldsDrawer: React.FC<NodeYieldsDrawerProps> = ({
  waypointKey,
  onClose,
  onSendToSolver,
}) => {
  const [data, setData] = useState<NodeDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<'normal' | 'giant'>('normal');

  useEffect(() => {
    if (waypointKey === null) {
      setData(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    fetch(`/api/nodes/${waypointKey}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((json: { node?: NodeDetailData; error?: string }) => {
        if (cancelled) return;
        if (json.node) {
          setData(json.node);
        } else {
          setError(json.error ?? 'ไม่พบข้อมูล yields ของโหนดนี้');
        }
      })
      .catch(() => {
        if (!cancelled) setError('โหลดข้อมูลไม่สำเร็จ');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [waypointKey]);

  if (waypointKey === null) return null;

  const variant = data?.[kind] ?? null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md h-full overflow-y-auto bg-bg-surface-1 border-l border-border-subtle p-4 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
              Node #{waypointKey} yields
            </p>
            <h2 className="text-base font-bold text-text-primary">
              {loading ? 'กำลังโหลด...' : (data?.name ?? (error ? 'โหลดไม่สำเร็จ' : '...'))}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-bg-surface-3 text-text-muted hover:text-text-primary border border-border-subtle"
            aria-label="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-text-secondary py-8 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
            กำลังโหลด yields...
          </div>
        )}

        {error && !loading && (
          <div className="flex items-start gap-2 text-xs text-red-300 bg-red-950/30 border border-red-500/40 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error} (โหนดนี้อาจอยู่นอก 370 plantzones ที่มี observed drops)</span>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Meta - every nullable field renders '—', never crashes */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-bg-surface-2 border border-border-subtle">
                <p className="text-text-muted font-mono text-[10px]">CP COST</p>
                <p className="font-bold text-text-primary">{fmt(data.cpCost)} CP</p>
              </div>
              <div className="p-2 rounded-lg bg-bg-surface-2 border border-border-subtle">
                <p className="text-text-muted font-mono text-[10px]">WORKLOAD</p>
                <p className="font-bold text-text-primary">{fmt(data.workload)}</p>
              </div>
              <div className="p-2 rounded-lg bg-bg-surface-2 border border-border-subtle">
                <p className="text-text-muted font-mono text-[10px]">PARENT NODE</p>
                <p className="font-bold text-text-primary">
                  {data.parentKey === null ? '—' : `#${data.parentKey}`}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-bg-surface-2 border border-border-subtle">
                <p className="text-text-muted font-mono text-[10px]">REGION GROUP</p>
                <p className="font-bold text-text-primary">
                  {data.regionGroup === null ? '—' : `#${data.regionGroup}`}
                </p>
              </div>
            </div>

            {/* Worker-kind toggle - variants never averaged */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <button
                onClick={() => setKind('normal')}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg border',
                  kind === 'normal'
                    ? 'bg-brand-primary/20 border-brand-primary/40 text-brand-primary font-bold'
                    : 'bg-bg-surface-2 border-border-subtle text-text-muted',
                )}
              >
                👨 Normal
              </button>
              <button
                onClick={() => setKind('giant')}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg border',
                  kind === 'giant'
                    ? 'bg-brand-primary/20 border-brand-primary/40 text-brand-primary font-bold'
                    : 'bg-bg-surface-2 border-border-subtle text-text-muted',
                )}
              >
                🐢 Giant
              </button>
            </div>

            {variant && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">
                    Cycle value ({kind === 'giant' ? 'giant' : 'normal'})
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {fmt(variant.cycleValue)}
                  </span>
                </div>
                {variant.unpricedCount > 0 && (
                  <p className="text-[11px] text-text-muted">
                    * {variant.unpricedCount} อย่างไม่มีราคาตลาดตอนนี้ — โชว์ไว้แต่ไม่นับเข้า cycle value
                  </p>
                )}
                <div className="space-y-1.5">
                  {variant.items.map((it) => (
                    <div
                      key={`${it.itemId ?? it.name}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-bg-surface-2 border border-border-subtle text-xs"
                    >
                      <div>
                        <span className="font-bold text-text-primary">{it.name}</span>
                        <span className="ml-2 text-text-muted font-mono">×{fmt(it.quantity)}</span>
                      </div>
                      <span className={cn('font-mono', it.value === null ? 'text-text-muted' : 'text-text-primary')}>
                        {it.value === null ? 'ไม่มีราคา' : fmt(it.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => onSendToSolver(data.waypointKey)}
              className="w-full py-2 rounded-lg text-sm font-bold bg-brand-primary text-bg-canvas hover:opacity-90 transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              ใส่โหนดนี้ในคู่ solver (#{data.waypointKey})
            </button>
            <p className="text-[10px] text-text-muted text-center">
              ส่ง Node ID #{data.waypointKey} เป็น terminal — เลือก root town ต่อเองด้านล่าง
            </p>
          </>
        )}
      </div>
    </div>
  );
};
