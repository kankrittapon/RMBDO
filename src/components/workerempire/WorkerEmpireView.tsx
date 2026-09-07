'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Network, Plus, Trash2, Loader2, Info, MapPin, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkerMapCanvas } from './WorkerMapCanvas';
import { NodeYieldsDrawer } from './NodeYieldsDrawer';
import { suggestNearestPlantzones, type NodeSuggestion } from '@/lib/workerEmpire/suggestNodes';

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
  // Real English names, merged in from bdo-noderouter's own explore.csv
  // (same repo, same Unlicense) - confirmed by cross-checking every
  // base-town id against known BDO cities (1=Velia, 61=Olvia, 301=Heidel,
  // 601=Calpheon, etc.) before shipping. null for the rare node explore.csv
  // doesn't cover.
  name: string | null;
}

type NodeGraph = Record<string, GraphNode>;

// "Name (#id)" is what the datalist shows and what typing resolves back to
// an id from - avoids needing a custom autocomplete component for 1025
// options, and keeps numeric-id entry working too (typed input that parses
// as a bare number and matches a real node is accepted as a fallback).
function parseNodeInput(raw: string, graph: NodeGraph): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withHash = trimmed.match(/#(\d+)\)?\s*$/);
  if (withHash) {
    const id = Number(withHash[1]);
    return graph[String(id)] ? id : null;
  }
  if (/^\d+$/.test(trimmed)) {
    const id = Number(trimmed);
    return graph[String(id)] ? id : null;
  }
  // Exact name match (case-insensitive) as a last resort, for anyone who
  // types the name without picking from the datalist.
  const lower = trimmed.toLowerCase();
  const match = Object.values(graph).find((n) => n.name?.toLowerCase() === lower);
  return match ? match.waypoint_key : null;
}

function nodeLabel(node: GraphNode): string {
  return node.name ? `${node.name} (#${node.waypoint_key})` : `#${node.waypoint_key}`;
}

interface TerminalRootPair {
  id: string;
  terminalText: string;
  rootText: string;
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

  // Which pair + which side (terminal/root) a map click writes into. Clicking
  // the map is just an alternate way of filling in the same `pairs` state
  // the text inputs use - both stay in sync automatically since they share
  // this one source of truth.
  const [activePairId, setActivePairId] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<'terminalText' | 'rootText'>('terminalText');

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
    const newPair = { id: crypto.randomUUID(), terminalText: '', rootText: '' };
    setPairs((prev) => [...prev, newPair]);
    setActivePairId(newPair.id);
    setActiveRole('terminalText');
    return newPair.id;
  };

  const removePair = (id: string) => {
    setPairs((prev) => prev.filter((p) => p.id !== id));
    setActivePairId((prev) => (prev === id ? null : prev));
  };

  const updatePair = (id: string, field: 'terminalText' | 'rootText', value: string) => {
    setPairs((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleMapPickNode = (waypointKey: number) => {
    if (!graph) return;
    const node = graph[String(waypointKey)];
    if (!node) return;
    const label = nodeLabel(node);

    let targetPairId = activePairId;
    if (!targetPairId || !pairs.some((p) => p.id === targetPairId)) {
      targetPairId = addPair();
    }
    updatePair(targetPairId, activeRole, label);
    // After picking a terminal, switch to picking the root next (common
    // flow: click one node, then click the town you want it routed to).
    setActiveRole((prev) => (prev === 'terminalText' ? 'rootText' : 'terminalText'));
  };

  const activePair = pairs.find((p) => p.id === activePairId) ?? null;

  // "โหมดแนะนำ" - rank the cheapest plantzones reachable from a base town
  // the user already picked, so they don't have to eyeball the map guessing
  // what's worth connecting. Recomputed on demand (button click), not on
  // every keystroke, since Dijkstra over ~1000 nodes is cheap but there's
  // no reason to re-run it before the user has settled on a base town.
  const [suggestFromText, setSuggestFromText] = useState('');
  const [suggestions, setSuggestions] = useState<NodeSuggestion[] | null>(null);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  // Node yields drawer - holds a WAYPOINT (node) id, never a resource item
  // id. Opened from suggestion/result rows; "send to solver" below fills a
  // terminal→root pair with this same node id.
  const [drawerNodeId, setDrawerNodeId] = useState<number | null>(null);

  const sendNodeToSolver = (waypointKey: number) => {
    if (!graph) return;
    const node = graph[String(waypointKey)];
    if (!node) return;
    const newId = addPair();
    updatePair(newId, 'terminalText', nodeLabel(node));
    updatePair(newId, 'rootText', '');
    setActivePairId(newId);
    setActiveRole('rootText');
    setDrawerNodeId(null);
  };

  const runSuggest = () => {
    if (!graph) return;
    setSuggestError(null);
    const fromId = parseNodeInput(suggestFromText, graph);
    if (fromId === null) {
      setSuggestError('หา Base Town ไม่เจอ - เลือกจากรายการ autocomplete');
      setSuggestions(null);
      return;
    }
    if (!graph[String(fromId)].is_base_town) {
      setSuggestError(`${graph[String(fromId)].name ?? `#${fromId}`} ไม่ใช่ Base Town - เลือก Base Town ที่คุณมีจริง`);
      setSuggestions(null);
      return;
    }
    setSuggestions(suggestNearestPlantzones(graph, fromId, 10));
  };

  const applySuggestion = (fromId: number, suggestion: NodeSuggestion) => {
    if (!graph) return;
    const fromNode = graph[String(fromId)];
    const targetNode = graph[String(suggestion.waypointKey)];
    if (!fromNode || !targetNode) return;
    const newId = addPair();
    updatePair(newId, 'terminalText', nodeLabel(targetNode));
    updatePair(newId, 'rootText', nodeLabel(fromNode));
  };

  const nodeOptions = useMemo(() => {
    if (!graph) return [];
    return Object.values(graph)
      .filter((n) => n.name)
      .sort((a, b) => (a.name && b.name ? a.name.localeCompare(b.name) : 0));
  }, [graph]);

  const solve = () => {
    if (!router || !graph) return;
    setSolveError(null);
    setResult(null);

    const resolved = pairs
      .filter((p) => p.terminalText.trim() && p.rootText.trim())
      .map((p) => ({
        raw: p,
        terminal: parseNodeInput(p.terminalText, graph),
        root: parseNodeInput(p.rootText, graph),
      }));

    if (resolved.length === 0) {
      setSolveError('เพิ่มอย่างน้อย 1 คู่ terminal/root ก่อนกดคำนวณ');
      return;
    }
    const badEntries = resolved.filter((r) => r.terminal === null || r.root === null);
    if (badEntries.length > 0) {
      setSolveError(
        `หา Node ไม่เจอ: ${badEntries
          .map((r) => (r.terminal === null ? r.raw.terminalText : r.raw.rootText))
          .join(', ')} - เลือกจากรายการ autocomplete หรือใส่ Node ID ที่ถูกต้อง`,
      );
      return;
    }

    setSolving(true);
    try {
      const pairArrays = resolved.map((r) => [r.terminal, r.root]);
      const [nodeIds, totalCp] = router.solveForTerminalPairs(pairArrays);
      setResult({ nodeIds, totalCp });
    } catch (err) {
      setSolveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSolving(false);
    }
  };

  const activeTerminalId = graph && activePair ? parseNodeInput(activePair.terminalText, graph) : null;
  const activeRootId = graph && activePair ? parseNodeInput(activePair.rootText, graph) : null;

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

      {status === 'ready' && graph && (
        <datalist id="worker-empire-node-options">
          {nodeOptions.map((n) => (
            <option key={n.waypoint_key} value={nodeLabel(n)} />
          ))}
        </datalist>
      )}

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
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                คลิกแผนที่เพื่อเลือก Node
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                <span className="text-text-muted">กำลังเลือก:</span>
                <button
                  onClick={() => setActiveRole('terminalText')}
                  className={cn(
                    'px-2 py-1 rounded border',
                    activeRole === 'terminalText'
                      ? 'bg-red-500/20 border-red-500/40 text-red-300 font-bold'
                      : 'bg-bg-surface-2 border-border-subtle text-text-muted',
                  )}
                >
                  Terminal
                </button>
                <button
                  onClick={() => setActiveRole('rootText')}
                  className={cn(
                    'px-2 py-1 rounded border',
                    activeRole === 'rootText'
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-300 font-bold'
                      : 'bg-bg-surface-2 border-border-subtle text-text-muted',
                  )}
                >
                  Root
                </button>
                {!activePair && <span className="text-text-muted">(คลิก node แรกจะสร้างคู่ใหม่ให้เอง)</span>}
              </div>
            </div>
            <WorkerMapCanvas
              graph={graph}
              terminalId={activeTerminalId}
              rootId={activeRootId}
              resultNodeIds={result?.nodeIds ?? null}
              onPickNode={handleMapPickNode}
            />
            <p className="text-[10px] text-text-muted">
              ลาก = แพน, scroll = ซูม • Node ที่ไม่ขึ้นบนแผนที่ (โซนใหม่ เช่น Land of the Morning
              Light) ยังเลือกได้จากช่องพิมพ์ชื่อด้านล่าง
            </p>
          </div>

          <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              โหมดแนะนำ: Node ที่คุ้มที่สุดต่อจาก Base Town
            </h3>
            <p className="text-[11px] text-text-secondary">
              เลือก Base Town ที่คุณมีอยู่แล้ว ระบบจะไล่หา plantzone ที่ใช้ CP น้อยที่สุดในการต่อถึง
              (คำนวณด้วย Dijkstra ตาม CP ต่อ node จริง ไม่ใช่ค่าคาดเดา)
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                list="worker-empire-node-options"
                placeholder="Base Town ของคุณ เช่น Velia"
                value={suggestFromText}
                onChange={(e) => setSuggestFromText(e.target.value)}
                className="flex-1 bg-bg-surface-2 border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-primary"
              />
              <button
                onClick={runSuggest}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold hover:bg-amber-500/30 transition-colors whitespace-nowrap"
              >
                แนะนำให้หน่อย
              </button>
            </div>
            {suggestError && <p className="text-xs text-red-400">{suggestError}</p>}
            {suggestions && (
              <div className="space-y-1.5">
                {suggestions.length === 0 ? (
                  <p className="text-xs text-text-muted">ไม่พบ plantzone ที่เชื่อมถึงได้จาก Base Town นี้</p>
                ) : (
                  suggestions.map((s) => {
                    const fromId = graph ? parseNodeInput(suggestFromText, graph) : null;
                    return (
                      <div
                        key={s.waypointKey}
                        className="flex items-center justify-between p-2 rounded-lg bg-bg-surface-2 border border-border-subtle text-xs"
                      >
                        <div>
                          <span className="font-bold text-text-primary">{s.name ?? `#${s.waypointKey}`}</span>
                          <span className="ml-2 text-text-muted font-mono">
                            {s.cpCost} CP • {s.hops} hop • {s.workerTypeCount} worker type
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setDrawerNodeId(s.waypointKey)}
                            className="px-2 py-1 rounded bg-bg-surface-3 border border-border-subtle text-text-secondary font-mono hover:text-text-primary"
                          >
                            yields
                          </button>
                          <button
                            onClick={() => fromId !== null && applySuggestion(fromId, s)}
                            className="px-2 py-1 rounded bg-brand-primary/20 border border-brand-primary/30 text-brand-primary font-mono hover:bg-brand-primary/30"
                          >
                            ใส่ในคู่
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

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
                <div
                  key={pair.id}
                  onFocus={() => setActivePairId(pair.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg p-1',
                    activePairId === pair.id && 'ring-1 ring-brand-primary/50',
                  )}
                >
                  <input
                    type="text"
                    list="worker-empire-node-options"
                    placeholder="พิมพ์ชื่อ Node เช่น Velia"
                    value={pair.terminalText}
                    onFocus={() => {
                      setActivePairId(pair.id);
                      setActiveRole('terminalText');
                    }}
                    onChange={(e) => updatePair(pair.id, 'terminalText', e.target.value)}
                    className="flex-1 bg-bg-surface-2 border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-primary"
                  />
                  <span className="text-text-muted text-xs">→</span>
                  <input
                    type="text"
                    list="worker-empire-node-options"
                    placeholder="Root เช่น Heidel"
                    value={pair.rootText}
                    onFocus={() => {
                      setActivePairId(pair.id);
                      setActiveRole('rootText');
                    }}
                    onChange={(e) => updatePair(pair.id, 'rootText', e.target.value)}
                    className="flex-1 bg-bg-surface-2 border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-primary"
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
                      <span className="font-bold text-text-primary">
                        {node.name ?? `#${id}`}
                      </span>
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
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setDrawerNodeId(id)}
                        className="px-2 py-0.5 rounded bg-bg-surface-3 border border-border-subtle text-text-secondary font-mono text-[10px] hover:text-text-primary"
                      >
                        yields
                      </button>
                      <span className="text-text-muted font-mono">{node.need_exploration_point} CP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 text-[11px] text-text-muted p-2">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>
              Node graph: {Object.keys(graph).length} node ({nodeOptions.length} มีชื่อ) จาก
              bdo-noderouter (public domain, ไม่ใช่ scrape สด - อาจไม่ตรงกับแพตช์ล่าสุด 100%
              ถ้าเกมมีการเพิ่ม node ใหม่)
            </p>
          </div>

          <NodeYieldsDrawer
            waypointKey={drawerNodeId}
            onClose={() => setDrawerNodeId(null)}
            onSendToSolver={sendNodeToSolver}
          />
        </>
      )}
    </div>
  );
};
