'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Wand2, Loader2, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseNodeInput, nodeLabel } from '@/lib/workerEmpire/nodeLabels';
import { estimateBaseCosts, dijkstra } from '@/lib/workerEmpire/bestBase';
import type { DijkstraNode } from '@/lib/workerEmpire/bestBase';
import { useThNames } from '@/hooks/useThNames';

// Minimal node shape the wizard needs. WorkerEmpireView's richer GraphNode
// is structurally compatible (extra fields are fine).
export interface WizardGraphNode {
  waypoint_key: number;
  name: string | null;
  is_base_town: boolean;
  is_warehouse_town?: boolean;
}

interface WizardHit {
  waypointKey: number;
  name: string | null;
  matchedName: string;
  normalQty: number | null;
  giantQty: number | null;
  price: number | null;
  normalValue: number | null;
  giantValue: number | null;
}

interface Candidate {
  waypointKey: number;
  name: string | null;
  cpCost: number; // path CP from the WINNING base (Dijkstra, real - not the node's own cost)
  items: Array<{ resource: string; qty: number | null; value: number | null }>;
  totalValue: number; // Σ priced values for the picked resources (this worker kind)
  unpricedCount: number;
  valuePerCp: number | null; // null when cpCost is 0 (free node - shown, not ranked)
}

interface WonBase {
  townId: number;
  name: string | null;
  exactTotal: number | null; // real solver total, null = solver failed (estimate shown instead)
  estTotal: number;
  runnersUp: Array<{ townId: number; name: string | null; estTotal: number }>;
}

interface EmpireWizardProps {
  graph: Record<string, WizardGraphNode>;
  solving: boolean;
  // Selections become solver pairs (terminal = โหนดเป้าหมาย, root =
  // เมืองฐาน) and solve immediately - one click total.
  onApply: (selections: Array<{ terminalId: number; rootId: number }>) => void;
  // Exact total-CP probe (WASM solver, sync). Null on solver error.
  onSolveTotal: (pairArrays: number[][]) => number | null;
}

const norm = (s: string) => s.trim().toLowerCase();
const fmt = (n: number | null) =>
  n === null ? '—' : n.toLocaleString('en-US', { maximumFractionDigits: 0 });

export const EmpireWizard: React.FC<EmpireWizardProps> = ({ graph, solving, onApply, onSolveTotal }) => {
  const { t } = useThNames();
  const [allResources, setAllResources] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [kind, setKind] = useState<'normal' | 'giant'>('normal');
  const [budget, setBudget] = useState('');
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [wonBase, setWonBase] = useState<WonBase | null>(null);
  const [checked, setChecked] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBaseOverride, setShowBaseOverride] = useState(false);
  const [overrideBase, setOverrideBase] = useState('');

  useEffect(() => {
    fetch('/api/node-resource-names', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: { names?: string[] }) => {
        if (Array.isArray(data.names)) setAllResources(data.names);
      })
      .catch(() => {});
  }, []);

  const baseOptions = useMemo(() => {
    return Object.values(graph)
      .filter((n) => n.name)
      .sort((a, b) => (a.name && b.name ? a.name.localeCompare(b.name) : 0));
  }, [graph]);

  const addResource = (raw: string) => {
    const name = raw.trim();
    if (!name) return;
    // Exact match only (case-insensitive) - never fuzzy-add a near-miss.
    const hit = allResources.find((r) => norm(r) === norm(name));
    setQuery('');
    if (!hit || picked.includes(hit)) return;
    setPicked((prev) => [...prev, hit]);
    setCandidates(null);
    setWonBase(null);
  };

  const toggleCheck = (key: number) => {
    setChecked((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const runWizard = async (forcedBaseId?: number) => {
    setError(null);
    setCandidates(null);
    setWonBase(null);
    if (picked.length === 0) {
      setError('เลือกของที่อยากได้อย่างน้อย 1 อย่างก่อน');
      return;
    }
    setLoading(true);
    try {
      // Candidate node set first (no base needed): one lookup per picked
      // resource, exact-match only (API searches ILIKE, near-misses die here).
      const nodeIds = new Set<number>();
      const hitsByResource = new Map<string, WizardHit[]>();
      for (const resource of picked) {
        const res = await fetch(
          `/api/nodes?resource=${encodeURIComponent(resource)}&kind=${kind}`,
          { cache: 'no-store' },
        );
        const json: { nodes?: WizardHit[] } = await res.json();
        const exact = (json.nodes ?? []).filter((h) => norm(h.matchedName) === norm(resource));
        hitsByResource.set(resource, exact);
        for (const h of exact) nodeIds.add(h.waypointKey);
      }
      if (nodeIds.size === 0) {
        setError('ไม่พบโหนดที่ขุดของที่เลือก - ลองเปลี่ยนของ');
        return;
      }
      const towns = Object.values(graph)
        .filter((n) => n.is_base_town)
        .map((n) => ({ id: n.waypoint_key, name: n.name, isWarehouse: n.is_warehouse_town ?? false }));
      // Winner: estimate all towns, exact-solve the top 3 with the real
      // solver, take the minimum. Manual override skips straight to it.
      let winner: WonBase;
      if (forcedBaseId !== undefined) {
        const node = graph[String(forcedBaseId)];
        winner = {
          townId: forcedBaseId,
          name: node?.name ?? null,
          exactTotal: null,
          estTotal: 0,
          runnersUp: [],
        };
      } else {
        const estimates = estimateBaseCosts(
          graph as unknown as Record<string, DijkstraNode>,
          Array.from(nodeIds),
          towns,
        ).slice(0, 3);
        if (estimates.length === 0) {
          setError('หาเมืองฐานที่เชื่อมถึงได้ไม่เจอ');
          return;
        }
        const ids = Array.from(nodeIds);
        let best: { townId: number; total: number } | null = null;
        for (const e of estimates) {
          const total = onSolveTotal(ids.map((id) => [id, e.townId]));
          if (total !== null && (best === null || total < best.total)) {
            best = { townId: e.townId, total };
          }
        }
        const win = estimates.find((e) => best !== null && e.townId === best.townId) ?? estimates[0];
        winner = {
          townId: win.townId,
          name: win.name,
          exactTotal: best !== null && best.townId === win.townId ? best.total : null,
          estTotal: win.estCp,
          runnersUp: estimates
            .filter((e) => e.townId !== win.townId)
            .map((e) => ({ townId: e.townId, name: e.name, estTotal: e.estCp })),
        };
      }
      // Rank candidates by value/CP from the winning base.
      const dist = dijkstra(graph as unknown as Record<string, DijkstraNode>, winner.townId);
      const byNode = new Map<number, Candidate>();
      for (const [resource, hits] of Array.from(hitsByResource.entries())) {
        for (const h of hits) {
          const cp = dist.get(h.waypointKey);
          if (cp === undefined) continue; // unreachable from the winner
          const qty = kind === 'giant' ? h.giantQty : h.normalQty;
          const value = kind === 'giant' ? h.giantValue : h.normalValue;
          let c = byNode.get(h.waypointKey);
          if (!c) {
            c = {
              waypointKey: h.waypointKey,
              name: h.name,
              cpCost: cp,
              items: [],
              totalValue: 0,
              unpricedCount: 0,
              valuePerCp: null,
            };
            byNode.set(h.waypointKey, c);
          }
          c.items.push({ resource, qty, value });
          if (value !== null) c.totalValue += value;
          else c.unpricedCount += 1;
        }
      }
      const list = Array.from(byNode.values()).map((c) => ({
        ...c,
        valuePerCp: c.cpCost > 0 ? c.totalValue / c.cpCost : null,
      }));
      list.sort((a, b) => (b.valuePerCp ?? -1) - (a.valuePerCp ?? -1));
      setCandidates(list);
      setWonBase(winner);
      setChecked(list.slice(0, 10).map((c) => c.waypointKey));
    } catch {
      setError('ค้นหาโหนดไม่สำเร็จ - ลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const applyOverride = () => {
    const id = parseNodeInput(overrideBase, graph);
    const node = id !== null ? graph[String(id)] : undefined;
    if (id === null || !node || !node.is_base_town) {
      setError('เมืองฐานไม่ถูกต้อง - เลือกจากรายการ autocomplete');
      return;
    }
    setShowBaseOverride(false);
    void runWizard(id);
  };

  const checkedList = (candidates ?? []).filter((c) => checked.includes(c.waypointKey));
  const checkedValue = checkedList.reduce((s, c) => s + c.totalValue, 0);
  const checkedCpUpper = checkedList.reduce((s, c) => s + c.cpCost, 0);
  const budgetNum = budget.trim() === '' ? null : Number(budget);
  const overBudget =
    budgetNum !== null && Number.isFinite(budgetNum) && checkedCpUpper > budgetNum;

  return (
    <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 space-y-3">
      <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
        <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
        ตัวช่วยจัด Empire: อยากได้อะไร → ติ๊กโหนด → คำนวณทีเดียว
      </h3>

      {/* Step 1: resources (no base town asked - the system picks it) */}
      <div className="space-y-2">
        <p className="text-[11px] font-mono text-text-muted">
          ขั้น 1 — ของที่อยากได้ (ระบบเลือกเมืองฐานที่ถูกสุดให้เอง)
        </p>
        <datalist id="wizard-resource-options">
          {allResources.map((r) => (
            <option key={r} value={r}>
              {t(r) !== r ? t(r) : undefined}
            </option>
          ))}
        </datalist>
        <div className="flex items-center gap-2">
          <input
            type="text"
            list="wizard-resource-options"
            placeholder="พิมพ์ชื่อของ เช่น Wheat / น้ำผึ้ง"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addResource(query);
            }}
            onBlur={() => {
              if (query.trim()) addResource(query);
            }}
            className="flex-1 bg-bg-surface-2 border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-primary"
          />
          <button
            onClick={() => addResource(query)}
            className="px-3 py-1.5 rounded-lg bg-bg-surface-3 border border-border-subtle text-xs font-mono text-text-primary hover:bg-bg-surface-2 whitespace-nowrap"
          >
            + เพิ่ม
          </button>
        </div>
        {picked.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {picked.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs"
              >
                {t(p) !== p ? `${t(p)} (${p})` : p}
                <button
                  onClick={() => {
                    setPicked((prev) => prev.filter((x) => x !== p));
                    setCandidates(null);
                    setWonBase(null);
                  }}
                  className="hover:text-white"
                  aria-label={`ลบ ${p}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <button
              onClick={() => {
                setKind('normal');
                setCandidates(null);
                setWonBase(null);
              }}
              className={cn(
                'px-2 py-1.5 rounded-lg border',
                kind === 'normal'
                  ? 'bg-brand-primary/20 border-brand-primary/40 text-brand-primary font-bold'
                  : 'bg-bg-surface-2 border-border-subtle text-text-muted',
              )}
            >
              👨 Normal
            </button>
            <button
              onClick={() => {
                setKind('giant');
                setCandidates(null);
                setWonBase(null);
              }}
              className={cn(
                'px-2 py-1.5 rounded-lg border',
                kind === 'giant'
                  ? 'bg-brand-primary/20 border-brand-primary/40 text-brand-primary font-bold'
                  : 'bg-bg-surface-2 border-border-subtle text-text-muted',
              )}
            >
              🐢 Giant
            </button>
          </div>
          <input
            type="number"
            min={0}
            placeholder="งบ CP (ไม่ใส่ก็ได้)"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-36 bg-bg-surface-2 border border-border-subtle rounded-lg px-3 py-1.5 text-sm font-mono text-text-primary"
          />
          <button
            onClick={() => void runWizard()}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold hover:bg-emerald-500/30 transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {loading ? 'กำลังหา...' : 'หาโหนด + เมืองที่คุ้มสุด'}
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {/* Winning base */}
      {wonBase && !loading && (
        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
          <p className="text-emerald-300 font-bold">
            🏠 เมืองฐานที่คุ้มสุด: {wonBase.name ?? `#${wonBase.townId}`}
            {wonBase.exactTotal !== null ? (
              <span className="ml-2 font-mono">รวม {fmt(wonBase.exactTotal)} CP (เลขจริงจาก solver)</span>
            ) : (
              <span className="ml-2 font-mono">ประมาณ {fmt(wonBase.estTotal)} CP</span>
            )}
          </p>
          {wonBase.runnersUp.length > 0 && (
            <p className="text-text-muted font-mono text-[11px]">
              รองลงมา:{' '}
              {wonBase.runnersUp.map((r) => `${r.name ?? `#${r.townId}`} ~${fmt(r.estTotal)}`).join(' • ')}
            </p>
          )}
          {!showBaseOverride ? (
            <button
              onClick={() => setShowBaseOverride(true)}
              className="text-[11px] font-mono text-text-muted underline underline-offset-2 hover:text-text-primary"
            >
              เปลี่ยนเมืองเอง
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <datalist id="wizard-override-options">
                {baseOptions.map((n) => (
                  <option key={n.waypoint_key} value={nodeLabel(n)} />
                ))}
              </datalist>
              <input
                type="text"
                list="wizard-override-options"
                placeholder="พิมพ์ชื่อเมือง หรือ Node ID"
                value={overrideBase}
                onChange={(e) => setOverrideBase(e.target.value)}
                className="flex-1 bg-bg-surface-2 border border-border-subtle rounded-lg px-3 py-1 text-xs text-text-primary"
              />
              <button
                onClick={applyOverride}
                className="px-2 py-1 rounded-lg bg-bg-surface-3 border border-border-subtle text-[11px] font-mono text-text-primary"
              >
                ใช้เมืองนี้
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: candidates */}
      {loading && (
        <div className="flex items-center gap-2 text-text-secondary text-sm p-4 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          กำลังค้นโหนดจากของที่เลือก...
        </div>
      )}
      {candidates !== null && !loading && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-mono text-text-muted">
            ขั้น 2 — ติ๊กโหนดที่เอา (ติ๊กมาให้แล้วตามคุ้มสุด, {kind === 'giant' ? 'เรียงแบบ Giant' : 'เรียงแบบ Normal'})
          </p>
          {candidates.length === 0 ? (
            <p className="text-xs text-text-muted">ไม่พบโหนดที่ขุดของที่เลือก - ลองเปลี่ยนของ</p>
          ) : (
            candidates.map((c) => {
              const on = checked.includes(c.waypointKey);
              return (
                <div
                  key={c.waypointKey}
                  onClick={() => toggleCheck(c.waypointKey)}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer',
                    on
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : 'bg-bg-surface-2 border-border-subtle',
                  )}
                >
                  <span className="text-text-muted">{on ? <CheckSquareIcon /> : <SquareIcon />}</span>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-text-primary">
                      {c.name ?? `#${c.waypointKey}`}
                    </span>
                    <span className="ml-2 text-text-muted font-mono text-[11px]">
                      #{c.waypointKey} • {c.cpCost} CP
                      {c.items.map((it) => (
                        <span key={it.resource} className="ml-1.5">
                          {t(it.resource)}×{it.qty === null ? '—' : it.qty}
                        </span>
                      ))}
                      {c.unpricedCount > 0 && <span className="ml-1.5">(บางอย่างไม่มีราคา)</span>}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 shrink-0">
                    {c.valuePerCp === null ? fmt(c.totalValue) : `${fmt(c.valuePerCp)}/CP`}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Step 3: apply + solve */}
      {candidates !== null && candidates.length > 0 && wonBase && (
        <div className="space-y-2 border-t border-border-subtle pt-3">
          <div className="flex items-center justify-between text-xs font-mono flex-wrap gap-2">
            <span className="text-text-secondary">
              เลือก {checkedList.length} โหนด • มูลค่า/รอบรวม {fmt(checkedValue)} • CP สูงสุด {fmt(checkedCpUpper)}
              <span className="text-text-muted"> (หักทางร่วมหลังคำนวณ)</span>
            </span>
            {overBudget && (
              <span className="text-red-400 font-bold">เกินงบ {fmt(budgetNum)} CP</span>
            )}
          </div>
          <button
            onClick={() => {
              if (checkedList.length === 0) return;
              onApply(
                checkedList.map((c) => ({ terminalId: c.waypointKey, rootId: wonBase.townId })),
              );
            }}
            disabled={solving || checkedList.length === 0}
            className={cn(
              'w-full py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1.5',
              solving || checkedList.length === 0
                ? 'bg-bg-surface-3 text-text-muted cursor-not-allowed'
                : 'bg-brand-primary text-bg-canvas hover:opacity-90',
            )}
          >
            <Send className="w-4 h-4" />
            {solving ? 'กำลังคำนวณ...' : `คำนวณ Empire (${checkedList.length} โหนด → ${wonBase.name ?? 'เมืองฐาน'})`}
          </button>
        </div>
      )}
    </div>
  );
};

const CheckSquareIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="m8 12 3 3 5-6" />
  </svg>
);

const SquareIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);
