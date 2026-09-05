# Handoff — Worker Empire Node Optimizer

## Update 2026-09-06 — implemented

User approved proceeding with the WASM-reuse approach (option (a) from the
original plan below). Built and shipped:

- `src/lib/noderouter/noderouter.mjs` + `.d.ts` — vendored unmodified from
  `Thell/bdo-noderouter` v0.4.0's prebuilt release (`pkg.zip`), public
  domain (Unlicense, `LICENSE-noderouter-unlicense.txt` alongside). One
  line was patched (the default-fallback `new URL(...)` for the wasm path)
  because webpack statically resolves that call at build time and fails
  since the `.wasm` is served from `/public/wasm` instead of bundled
  alongside the JS - noted inline in the file. No other changes.
- `public/wasm/noderouter_bg.wasm` — the compiled solver, fetched
  client-side and passed to the module as raw bytes.
- `public/data/bdo-node-graph.json` — `clean_exploration.json` from the
  same repo, copied unmodified (~1035 nodes, real waypoint/region/CP/link
  data, also Unlicense).
- `src/components/workerempire/WorkerEmpireView.tsx` — new page, nav id
  `worker_empire`, added to `NavigationSidebar.tsx`'s "reference" section
  and wired in `src/app/page.tsx`. Lets the user add (terminal, root)
  waypoint-ID pairs, calls `WasmNodeRouter.solveForTerminalPairs()`
  entirely client-side, shows the resulting node set + total CP.

**Verified**: a standalone Node script (outside the app) constructed the
router with the real graph JSON and called `solveForTerminalPairs([[3, 1]])`
- got back a real node set (`[1, 3, 41, 42, 43]`) and CP total (`5`), so
the vendored WASM + data actually work together, not just "compiles."
`npm run typecheck` and `npm run build` both pass. The dev server was
confirmed serving both new static assets with `200 OK`.

**Not verified**: I could not drive the actual page in a real browser this
session (the available browser-automation tool refused to navigate to
`localhost`) - so the in-browser fetch → WASM-init → solve → render chain
has not been click-tested end to end, only reasoned through and unit
-verified piece by piece (Node-level solve call, curl against the dev
server's static routes, and a clean production build). If something is
subtly wrong in the browser-only glue (e.g. a CORS/MIME issue serving
`.wasm` in production on Vercel), it would only surface there - check this
first if the page doesn't work after deploying.

**Known gap, unchanged from the original plan**: node IDs have no
human-readable name mapping yet (see "Explicitly not decided yet" below -
this was flagged before building and intentionally left unresolved rather
than guessing city names). The UI currently requires raw numeric waypoint
IDs, with a visible in-app disclaimer pointing users to shrddr's Workerman
site to look up IDs manually in the meantime.

## Original plan (below, superseded where it says "no code yet")

This document was originally planning-only. Read the update above first -

## Correction to an earlier verdict

An earlier session-turn evaluated "Workerman" and concluded it wasn't worth
adopting - that verdict was about the **wrong project entirely**, a pure
name collision. The mistaken assumption was that "Workerman" referred to:

- **`walkor/workerman`** (github.com/walkor/workerman) - a well-known PHP
  package, "an asynchronous event-driven PHP socket framework" supporting
  HTTP, WebSocket, SSL and custom protocols. It's a library for building
  long-running, persistent-connection servers (chat servers, game servers,
  push-notification services) - completely generic, nothing to do with BDO
  at all. The earlier assessment reasoned (correctly, for *that* project)
  that RMBDO has no persistent-connection server component anywhere in its
  architecture, so adopting it would mean building a whole new category of
  infrastructure with no current use case - hence "do not adopt."

That reasoning was sound, but for the wrong target. The user actually meant
**https://shrddr.github.io/workerman/**, a same-named but completely
unrelated project: a BDO-specific "worker empire" node-planning tool (see
below). It is not a server framework, has no persistent connections, and
raises none of the concerns the earlier verdict was about. **The earlier
"do not adopt" conclusion does not apply here and should be disregarded**
for this feature - this document supersedes it.

## What the real reference project actually is

Confirmed by reading the live repos (not guessed):

- **`shrddr/workermanjs`** (GitHub, Vue 3, MIT-unlicensed but public) - a
  client-side-only web app ("Workerman", the BDO "worker empire" planner).
  It has no backend of its own; per its own README, all routing math is
  delegated to a WASM module built from a separate project.
- **`Thell/bdo-noderouter`** - the actual solver, in Rust (with Python
  bindings and a WASM build target). It solves a **Multi-Commodity Flow /
  node-weighted Steiner Forest problem**: given BDO's real trade-node graph
  (towns, waypoints, and the edges connecting them, each waypoint/edge
  costing a fixed amount of Contribution Points to activate), and a set of
  (terminal, root) pairs - i.e. "I want workers gathering resource X at
  location A to route back to my base town B" - it computes either the
  **optimal** node set (MIP solver, via HiGHS) or a fast **approximation**
  (PD / GSSP / Pulsing-Bridge-Spanners heuristics) that connects every
  requested terminal to its root while minimizing total CP spent on nodes.
- This is a pure graph/optimization computation. No game-client
  interaction, no packet capture, no server component of any kind - it
  runs entirely in the requester's own browser (or a Python/Rust CLI).

## Why this is a real, unfilled gap in RMBDO

Checked directly against the current codebase (`src/data`, `src/components`,
`schema/schema.sql`) - RMBDO has **zero** existing worker-empire / node /
CP-planning data or UI. The only trace is a single unrelated boolean column
(`has_worker_exchange` on some other table) and generic "worker" mentions
inside Life Skill task descriptions - nothing modeling the actual node
graph, CP budget, or worker assignment problem. This would be a genuinely
new feature area, not an extension of something half-built already.

It fits naturally under this project's existing "Life Skill" progression
track (same nav section as Life Skill Hub, Olvia Life, Life Skills
reference) since worker empire management is a core Life Skill activity
professional players actively plan around.

## What this feature would need to actually do something useful

1. **BDO's real node graph as data**: every town/waypoint node, its CP
   cost to activate, and which nodes connect to which (the planar graph
   `bdo-noderouter`'s README describes, <1000 nodes). This does not exist
   in RMBDO's DB today and would need to be sourced - likely from the same
   public data ecosystem already used this session (bdolytics itself may
   list node connections in its "Node Manager" tool; `bdo-noderouter`'s
   own `python/bdo_noderouter/data` folder may already ship a clean,
   reusable `exploration.json` describing this exact graph - **this needs
   to be checked before building anything**, since if that JSON is
   redistributable, it removes the need to scrape/rebuild the graph from
   scratch).
2. **The user's real CP budget and already-owned worker/town setup** -
   this is player-specific state, same category as `profile.stats` /
   `profile.gear` already in `useRoadmapStore` (localStorage-backed).
3. **A solver** - either:
   - **(a) Reuse the compiled WASM module directly** (fastest to ship,
     but: confirm license terms on `Thell/bdo-noderouter` allow
     redistributing/embedding the compiled `.wasm` in this project before
     doing this - not yet checked), or
   - **(b) Re-run the Rust source through `wasm-pack` ourselves** against
     RMBDO's own build pipeline (more control, same license question
     applies), or
   - **(c) Ship a much simpler first-pass heuristic** scoped to a single
     (terminal, root) pair at a time rather than the full empire-wide
     optimizer, deferring the harder multi-commodity solver to a later
     phase - lower payoff but zero license/integration risk and buildable
     with this project's existing TypeScript-only stack (no WASM toolchain
     currently exists anywhere in this repo - `collector/` and `src/` are
     both plain Node/TS, so a WASM dependency would be a first for this
     codebase and its own small scope decision).
4. **Worker/lodging stat data** (energy cost, work speed, luck, per-worker
   grade) if the feature is meant to also recommend *which workers* to
   assign, not just *which nodes* to connect - out of scope for
   `bdo-noderouter` itself (it only solves the graph-connectivity part),
   so this would be an RMBDO-original addition on top if wanted.

## Suggested phased plan (for whoever picks this up)

1. **Data feasibility check** (no code): confirm whether
   `Thell/bdo-noderouter`'s repo already ships a usable, licensable node
   graph JSON. If yes, this collapses most of item 1 above into "copy a
   file + verify it's current." If no, scope a proper data-sourcing plan
   before writing any UI.
2. **License check** on both `shrddr/workermanjs` and `Thell/bdo-noderouter`
   before embedding or adapting any of their code/WASM output. Neither
   repo's license was confirmed as part of this handoff - do this first,
   it gates every implementation choice below it.
3. **Decide integration approach** (WASM reuse vs. rebuild vs. simplified
   TS-only heuristic per option (c) above) - this is a real architecture
   decision the user should weigh in on given this project's "keep it
   simple, avoid scope creep" pattern seen throughout prior sessions
   (e.g. the Garmoth-calculator request was explicitly walked back for
   being too large relative to payoff).
4. **Design the UI** as a new page under the existing "Life Skill" nav
   section (`src/components/layout/NavigationSidebar.tsx`'s `overview` or
   a new dedicated section) - only after 1-3 are settled, so the page
   isn't designed around an approach that turns out to be blocked by
   licensing or data availability.
5. **Player-state additions** (CP budget, owned nodes/workers) go into
   `useRoadmapStore`'s existing localStorage-backed profile shape, same
   pattern as every other player-specific field already there - no new
   persistence mechanism needed.

## Explicitly not decided yet (flag to the user before building)

- Whether to reuse `bdo-noderouter`'s compiled/source solver at all, or
  build a simpler first pass (option (c)) - this is the single biggest
  scope/complexity fork and should be an explicit user choice, not an
  assumption.
- Where the node-graph data actually comes from if `bdo-noderouter`'s own
  repo doesn't already ship a redistributable one.
- Whether "which workers to assign" is even in scope, or if this feature
  should stay narrowly focused on "which nodes to connect" (matching what
  `bdo-noderouter` itself actually solves).

No code, schema, or UI work has started on this feature. This document is
the entire deliverable for this pass.
