'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

// Real BDO world map (public/maps/bdo-world-map.webp, from
// Thell/bdo-noderouter, Unlicense - see ATTRIBUTION.txt next to it) with
// node markers positioned via a coordinate transform verified this session:
// rendered ~1025 node positions over the actual map image with Playwright,
// visually confirmed nodes land on the correct real landmasses only after
// (a) clipping to the 1st-99th percentile of x/z (excludes ~40 much-newer
// Land of the Morning Light-era nodes this older map render doesn't cover
// at all - not a bug, the image genuinely doesn't extend that far) and
// (b) flipping the z axis (game z increases going up-screen, image y
// increases going down). Un-flipped or full-min/max versions were tried
// first and visibly wrong (most points floated off the map into blank
// space) - this is the transform that actually worked, not a guess.
const MAP_WIDTH = 2304;
const MAP_HEIGHT = 2048;
const BOUNDS = {
  minX: -1496630,
  maxX: 1218140,
  minZ: -597347,
  maxZ: 1439840,
};

export interface MapGraphNode {
  waypoint_key: number;
  is_town: boolean;
  is_base_town: boolean;
  name: string | null;
  position: { x: number; y: number; z: number };
  link_list: number[];
}

interface WorkerMapCanvasProps {
  graph: Record<string, MapGraphNode>;
  terminalId: number | null;
  rootId: number | null;
  resultNodeIds: number[] | null;
  onPickNode: (id: number) => void;
  // Open the yields/coords popover for a node WITHOUT disturbing the
  // terminal/root pair-picking flow (click still fills pairs; the hover
  // name chip is the popover entry point).
  onInspectNode?: (id: number) => void;
}

function toPixel(node: MapGraphNode): { x: number; y: number } | null {
  const x = ((node.position.x - BOUNDS.minX) / (BOUNDS.maxX - BOUNDS.minX)) * MAP_WIDTH;
  const y = MAP_HEIGHT - ((node.position.z - BOUNDS.minZ) / (BOUNDS.maxZ - BOUNDS.minZ)) * MAP_HEIGHT;
  if (x < 0 || x > MAP_WIDTH || y < 0 || y > MAP_HEIGHT) return null; // off this map render - use the text list instead
  return { x, y };
}

export const WorkerMapCanvas: React.FC<WorkerMapCanvasProps> = ({
  graph,
  terminalId,
  rootId,
  resultNodeIds,
  onPickNode,
  onInspectNode,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT });
  const viewBoxRef = useRef(viewBox);
  viewBoxRef.current = viewBox;
  const [dragging, setDragging] = useState<{ startX: number; startY: number; startVb: typeof viewBox } | null>(null);
  const [hoverId, setHoverId] = useState<number | null>(null);

  const nodesWithPixels = useMemo(() => {
    return Object.values(graph)
      .map((n) => ({ node: n, pixel: toPixel(n) }))
      .filter((r): r is { node: MapGraphNode; pixel: { x: number; y: number } } => r.pixel !== null);
  }, [graph]);

  const resultSet = useMemo(() => (resultNodeIds ? new Set(resultNodeIds) : null), [resultNodeIds]);

  const edges = useMemo(() => {
    if (!resultSet) return [];
    const seen = new Set<string>();
    const lines: Array<{ a: { x: number; y: number }; b: { x: number; y: number } }> = [];
    for (const { node, pixel } of nodesWithPixels) {
      if (!resultSet.has(node.waypoint_key)) continue;
      for (const linkedId of node.link_list) {
        if (!resultSet.has(linkedId)) continue;
        const key = [node.waypoint_key, linkedId].sort((a, b) => a - b).join('-');
        if (seen.has(key)) continue;
        seen.add(key);
        const other = nodesWithPixels.find((r) => r.node.waypoint_key === linkedId);
        if (other) lines.push({ a: pixel, b: other.pixel });
      }
    }
    return lines;
  }, [nodesWithPixels, resultSet]);

  const clampViewBox = (vb: typeof viewBox) => {
    const w = Math.min(Math.max(vb.w, MAP_WIDTH / 20), MAP_WIDTH * 1.5);
    const h = w * (MAP_HEIGHT / MAP_WIDTH);
    const x = Math.min(Math.max(vb.x, -MAP_WIDTH * 0.25), MAP_WIDTH - w + MAP_WIDTH * 0.25);
    const y = Math.min(Math.max(vb.y, -MAP_HEIGHT * 0.25), MAP_HEIGHT - h + MAP_HEIGHT * 0.25);
    return { x, y, w, h };
  };

  // React attaches its synthetic wheel listener as passive by default, so
  // `e.preventDefault()` inside a normal onWheel prop silently fails
  // (confirmed via a real browser console warning during testing: "Unable
  // to preventDefault inside passive event listener invocation" - the zoom
  // math still ran, but the page could still scroll underneath it at the
  // same time). Attaching the listener natively with `{ passive: false }`
  // fixes this properly. Reads current viewBox via a ref (updated every
  // render, above) instead of depending on `viewBox` directly, so this
  // effect only runs once on mount - re-subscribing a native listener on
  // every single zoom/pan tick was wasteful and, during stress-testing
  // with many rapid synthetic wheel events, coincided with a headless
  // browser crash (not reproduced with normal-paced interaction, but not
  // worth risking either).
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    // Coalesce rapid-fire wheel events (a real trackpad/mouse wheel can fire
    // far more often than the screen repaints) into at most one viewBox
    // update per animation frame, instead of one React re-render of ~1000
    // SVG circles per individual wheel tick - cheap insurance against
    // render-storm jank/crashes regardless of device, on top of fixing the
    // passive-listener warning below.
    let pendingScale: number | null = null;
    let pendingClientX = 0;
    let pendingClientY = 0;
    let rafId: number | null = null;

    const applyPendingZoom = () => {
      rafId = null;
      if (pendingScale === null) return;
      const vb = viewBoxRef.current;
      const rect = svg.getBoundingClientRect();
      const mx = vb.x + ((pendingClientX - rect.left) / rect.width) * vb.w;
      const my = vb.y + ((pendingClientY - rect.top) / rect.height) * vb.h;
      const newW = vb.w * pendingScale;
      const newH = vb.h * pendingScale;
      const newX = mx - ((mx - vb.x) / vb.w) * newW;
      const newY = my - ((my - vb.y) / vb.h) * newH;
      pendingScale = null;
      setViewBox(clampViewBox({ x: newX, y: newY, w: newW, h: newH }));
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const tickScale = e.deltaY > 0 ? 1.15 : 1 / 1.15;
      pendingScale = pendingScale === null ? tickScale : pendingScale * tickScale;
      pendingClientX = e.clientX;
      pendingClientY = e.clientY;
      if (rafId === null) rafId = requestAnimationFrame(applyPendingZoom);
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      svg.removeEventListener('wheel', onWheel);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const handleMouseDown: React.MouseEventHandler<SVGSVGElement> = (e) => {
    setDragging({ startX: e.clientX, startY: e.clientY, startVb: viewBox });
  };
  const handleMouseMove: React.MouseEventHandler<SVGSVGElement> = (e) => {
    if (!dragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragging.startX) / rect.width) * dragging.startVb.w;
    const dy = ((e.clientY - dragging.startY) / rect.height) * dragging.startVb.h;
    setViewBox(clampViewBox({ ...dragging.startVb, x: dragging.startVb.x - dx, y: dragging.startVb.y - dy }));
  };
  const handleMouseUp = () => setDragging(null);

  const resetView = () => setViewBox({ x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT });

  const markerRadius = Math.max(2, viewBox.w / 260);

  return (
    <div className="relative rounded-xl overflow-hidden border border-border-subtle bg-black">
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        className="w-full h-[420px] md:h-[520px] cursor-grab active:cursor-grabbing touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <image href="/maps/bdo-world-map.webp" width={MAP_WIDTH} height={MAP_HEIGHT} />

        {edges.map((edge, idx) => (
          <line
            key={idx}
            x1={edge.a.x}
            y1={edge.a.y}
            x2={edge.b.x}
            y2={edge.b.y}
            stroke="#34d399"
            strokeWidth={markerRadius * 0.8}
            strokeOpacity={0.85}
          />
        ))}

        {nodesWithPixels.map(({ node, pixel }) => {
          const isTerminal = node.waypoint_key === terminalId;
          const isRoot = node.waypoint_key === rootId;
          const isActivated = resultSet?.has(node.waypoint_key) ?? false;
          const isHover = hoverId === node.waypoint_key;

          let fill = 'rgba(103,232,249,0.55)'; // plain node - cyan
          let r = markerRadius * 0.6;
          if (node.is_base_town) {
            fill = '#fbbf24';
            r = markerRadius * 1.3;
          } else if (node.is_town) {
            fill = '#60a5fa';
            r = markerRadius;
          }
          if (isActivated) {
            fill = '#34d399';
            r = Math.max(r, markerRadius);
          }
          if (isTerminal) fill = '#f87171';
          if (isRoot) fill = '#a78bfa';
          if (isTerminal || isRoot) r = markerRadius * 1.6;

          return (
            <circle
              key={node.waypoint_key}
              cx={pixel.x}
              cy={pixel.y}
              r={isHover ? r * 1.6 : r}
              fill={fill}
              stroke={isTerminal || isRoot ? '#fff' : 'none'}
              strokeWidth={isTerminal || isRoot ? markerRadius * 0.3 : 0}
              onMouseEnter={() => setHoverId(node.waypoint_key)}
              onMouseLeave={() => setHoverId((id) => (id === node.waypoint_key ? null : id))}
              onClick={(e) => {
                e.stopPropagation();
                onPickNode(node.waypoint_key);
              }}
              className="cursor-pointer"
            />
          );
        })}
      </svg>

      {hoverId !== null && graph[String(hoverId)]?.name && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onInspectNode && hoverId !== null) onInspectNode(hoverId);
          }}
          title="คลิกเพื่อดูพิกัด + yields"
          className="absolute top-2 left-2 px-2 py-1 rounded bg-black/80 text-white text-xs font-mono hover:bg-black hover:underline underline-offset-2 text-left"
        >
          {graph[String(hoverId)].name} ⓘ
        </button>
      )}

      <div className="absolute bottom-2 right-2 flex gap-1.5">
        <button
          onClick={resetView}
          className="px-2 py-1 rounded bg-black/70 text-white text-[10px] font-mono border border-white/20 hover:bg-black/90"
        >
          รีเซ็ตมุมมอง
        </button>
      </div>

      <div className="absolute top-2 right-2 flex flex-col gap-1 text-[10px] font-mono text-white bg-black/70 rounded px-2 py-1.5 border border-white/20">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Terminal (คลิกเลือก)</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-400 inline-block" /> Root</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Base Town</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> เปิดแล้ว (ผลลัพธ์)</div>
      </div>
    </div>
  );
};
