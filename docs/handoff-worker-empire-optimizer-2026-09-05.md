# Handoff — Worker Empire Node Optimizer (planning only, no code yet)

Read this before starting any implementation. This document is a plan, not
a build log — nothing described here has been coded. It exists so the next
session (or the next you) can pick this up without re-deriving the research
already done.

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
