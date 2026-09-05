'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Network, Plus, Trash2, Loader2, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// This view solves BDO's real worker-empire node-connection problem: given
// a set of (terminal, root) waypoint pairs, which nodes to activate to
// connect them for the least total Contribution Points. The actual solving
// is delegated to Thell/bdo-noderouter's WASM build (public domain,
// vendored unmodified in src/lib/noderouter/ - see LICENSE file there) -
// this component only handles loading it, the graph data, and the UI.
// The node graph itself (public/data/bdo-node-graph.json) is also sourced
// from that project's repo (same license), not scraped or hand-authored.

interface GraphNode {
  waypoint_key: number;
  region_key: number;
  region_group_key: number;
  node_type: number;
  is_town: boolean;
  is_base_town: boolean;
  is_plantzone: boolean;
  is_warehouse_town: boolean;
  is_worker_npc_town: boolean;
  need_exploration_point: number;
  position: { x: number; y: number; z: number };
  link_list: number[];
  worker_types: number[];
}

type NodeGraph = Record<string, GraphNode>;

interface TerminalRootPair {
  id: string;
  terminal: number | '';
  root: number | '';
}

interface SolveResult {
  nodeIds: number[];
  totalCp: number;
}

const STORAGE_KEY = 'rmbdo_worker_empire_pairs_v1';

function loadSavedPairs(): TerminalRootPair[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const WorkerEmpireView: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [graph, setGraph] = useState<NodeGraph | null>(null);
  const [router, setRouter] = useState<any>(null);
  const [pairs, setPairs] = useState<TerminalRootPair[]>([]);
  const [result, setResult] = useState<SolveResult | null>(null);
  const [solving, setSolving] = useState(false);
  const [solveError, setSolveError] = useState<string | null>(null);

  useEffect(() => {
    setPairs(loadSavedPairs());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pairs));
    } catch {
      // best-effort only, same as every other localStorage write in this app
    }
  }, [pairs]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const [wasmModule, graphRes] = await Promise.all([
          import('@/lib/noderouter/noderouter.mjs'),
          fetch('/data/bdo-node-graph.json'),
        ]);
        if (!graphRes.ok) throw new Error(`Failed to load node graph (${graphRes.status})`);
        const graphJson: NodeGraph = await graphRes.json();

        const wasmRes = await fetch('/wasm/noderouter_bg.wasm');
        if (!wasmRes.ok) throw new Error(`Failed to load solver WASM (${wasmRes.status})`);
        const wasmBytes = await wasmRes.arrayBuffer();
        await wasmModule.default({ module_or_path: wasmBytes });

        if (cancelled) return;
        const routerInstance = new wasmModule.WasmNodeRouter(graphJson);
        setGraph(graphJson);
        setRouter(routerInstance);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(err instanceof Error ? err.message : String(err));
        setStatus('error');
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const addPair = () => {
    setPairs((prev) => [...prev, { id: crypto.randomUUID(), terminal: '', root: '' }]);
  };

  const removePair = (id: string) => {
    setPairs((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePair = (id: string, field: 'terminal' | 'root', value: string) => {
    const num = value === '' ? '' : Number(value);
    setPairs((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: num } : p)));
  };

  const solve = () => {
    if (!router || !graph) return;
    setSolveError(null);
    setResult(null);

    const validPairs = pairs.filter((p) => p.terminal !== '' && p.root !== '');
    if (validPairs.length === 0) {
      setSolveError('เพิ่มอย่างน้อย 1 คู่ terminal/root ก่อนกดคำนวณ');
      return;
    }
    const unknownIds = validPairs
      .flatMap((p) => [p.terminal, p.root])
      .filter((id) => !graph[String(id)]);
    if (unknownIds.length > 0) {
      setSolveError(`ไม่พบ Node ID: ${Array.from(new Set(unknownIds)).join(', ')} ในกราฟ`);
      return;
    }

    setSolving(true);
    try {
      const pairArrays = validPairs.map((p) => [p.terminal, p.root]);
      const [nodeIds, totalCp] = router.solveForTerminalPairs(pairArrays);
      setResult({ nodeIds, totalCp });
    } catch (err) {
      setSolveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSolving(false);
    }
  };

  const resultNodes = useMemo(() => {
    if (!result || !graph) return [];
    return result.nodeIds
      .map((id) => ({ id, node: graph[String(id)] }))
      .filter((r) => r.node)
      .sort((a, b) => a.id - b.id);
  }, [result, graph]);

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-16 md:pb-6">
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-brand-primary font-mono text-xs uppercase tracking-wider">
          <Network className="w-4 h-4" />
          <span>Worker Empire Node Optimizer</span>
        </div>
        <h1 className="text-lg md:text-xl font-heading font-bold text-text-primary">
          คำนวณ Node ที่ต้องเปิดเพื่อเชื่อม Worker Empire
        </h1>
        <p className="text-xs text-text-secondary leading-relaxed">
          ใส่คู่ Node ID (terminal → root) แล้วระบบจะคำนวณชุด Node ที่ใช้ Contribution Point
          น้อยที่สุดที่เชื่อมทุกคู่เข้าด้วยกัน คำนวณด้วย solver จาก{' '}
          <a
            href="https://github.com/Thell/bdo-noderouter"
            target="_blank"
            rel="noreferrer"
            className="underline text-brand-primary"
          >
            Thell/bdo-noderouter
          </a>{' '}
          (public domain) รันในเบราว์เซอร์ของคุณเองทั้งหมด ไม่มีข้อมูลส่งออกไปเซิร์ฟเวอร์ไหน
        </p>
      </div>

      <div className="bg-amber-950/30 border border-amber-500/40 rounded-lg p-3.5 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/90 leading-relaxed">
          ตอนนี้ยังไม่มีชื่อเมือง/Node ที่แปลเป็นภาษาให้เลือกจากรายการ (ยังไม่มีข้อมูล mapping
          ID → ชื่อที่ยืนยันได้) ต้องใส่เป็น Node ID ตัวเลขตรงๆ ก่อน - ดู ID ได้จาก Node Manager
          ในเกม หรือจากเว็บ{' '}
          <a
            href="https://shrddr.github.io/workerman/"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Workerman
          </a>{' '}
          (เว็บอ้างอิงเดิมที่แนะนำมา) แล้วนำเลขมาใส่ที่นี่
        </p>
      </div>

      {status === 'loading' && (
        <div className="flex items-center gap-2 text-text-secondary text-sm p-6 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          กำลังโหลด solver และข้อมูล node graph...
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-950/30 border border-red-500/40 rounded-lg p-4 text-sm text-red-300">
          โหลดไม่สำเร็จ: {errorMessage}
        </div>
      )}

      {status === 'ready' && graph && (
        <>
          <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                คู่ Terminal → Root ({pairs.length})
              </h3>
              <button
                onClick={addPair}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-primary/20 text-brand-primary border border-brand-primary/30 text-xs font-mono hover:bg-brand-primary/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                เพิ่มคู่
              </button>
            </div>

            {pairs.length === 0 && (
              <p className="text-xs text-text-muted">ยังไม่มีคู่ node - กด "เพิ่มคู่" เพื่อเริ่ม</p>
            )}

            <div className="space-y-2">
              {pairs.map((pair) => (
                <div key={pair.id} className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Terminal ID"
                    value={pair.terminal}
                    onChange={(e) => updatePair(pair.id, 'terminal', e.target.value)}
                    className="flex-1 bg-bg-surface-2 border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-primary font-mono"
                  />
                  <span className="text-text-muted text-xs">→</span>
                  <input
                    type="number"
                    placeholder="Root (Base Town ID)"
                    value={pair.root}
                    onChange={(e) => updatePair(pair.id, 'root', e.target.value)}
                    className="flex-1 bg-bg-surface-2 border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-primary font-mono"
                  />
                  <button
                    onClick={() => removePair(pair.id)}
                    className="p-1.5 rounded-lg bg-bg-surface-3 text-text-muted hover:text-red-400 border border-border-subtle transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={solve}
              disabled={solving || pairs.length === 0}
              className={cn(
                'w-full py-2 rounded-lg text-sm font-bold transition-colors',
                solving || pairs.length === 0
                  ? 'bg-bg-surface-3 text-text-muted cursor-not-allowed'
                  : 'bg-brand-primary text-bg-canvas hover:opacity-90',
              )}
            >
              {solving ? 'กำลังคำนวณ...' : 'คำนวณ Node ที่ต้องเปิด'}
            </button>

            {solveError && <p className="text-xs text-red-400">{solveError}</p>}
          </div>

          {result && (
            <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  ผลลัพธ์
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400">
                  รวม {result.totalCp} CP - {resultNodes.length} Node
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {resultNodes.map(({ id, node }) => (
                  <div
                    key={id}
                    className="p-2.5 rounded-lg bg-bg-surface-2 border border-border-subtle text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-text-primary">#{id}</span>
                      {node.is_base_town && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-brand-gold/20 text-brand-gold">
                          Base Town
                        </span>
                      )}
                      {node.is_town && !node.is_base_town && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/20 text-blue-400">
                          Town
                        </span>
                      )}
                    </div>
                    <span className="text-text-muted font-mono">{node.need_exploration_point} CP</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 text-[11px] text-text-muted p-2">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>
              Node graph: {Object.keys(graph).length} node จาก bdo-noderouter (public domain,
              ไม่ใช่ scrape สด - อาจไม่ตรงกับแพตช์ล่าสุด 100% ถ้าเกมมีการเพิ่ม node ใหม่)
            </p>
          </div>
        </>
      )}
    </div>
  );
};
