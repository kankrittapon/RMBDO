# Dashboard Specific Design System & HUD Specs

> **Page**: Main Home Dashboard
> **Source of Truth Parent**: `MASTER.md`

---

## 🧭 Layout Structure & Information Hierarchy

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 🎮 TOP COMMAND HUD (Sticky h-14)                                                       │
│ [BDO Tactical Optimizer] [Asia/TH-SEA | Sep 2026] [Server Preset: End-Mid] [Search ⌘K] │
└────────────────────────────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 📊 HERO TACTICAL STATUS BAR (Dense HUD Matrix)                                         │
│ ┌──────────────┬──────────────┬──────────────┬──────────────────┬────────────────────┐ │
│ │ GS: 692      │ AP: 309      │ AAP: 311     │ DP: 383          │ WAR READY: 84%     │ │
│ │ Bracket: 309 │ Next: 316 AP │ Next: 316 AP │ Next: 401 DP (T3)│ T1/T2 Cap Met      │ │
│ └──────────────┴──────────────┴──────────────┴──────────────────┴────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 🎯 CRITICAL PATH & BLOCKER BANNER (High Visual Priority)                               │
│ CURRENT PHASE: [HYPER-ENDGAME TRANSITION]                                              │
│ NEXT OBJECTIVE: Complete Sovereign Awakening Weapon                                   │
│ 🚨 ACTIVE BLOCKER: Requires PEN Blackstar Awakening x1 (or Flame of Primordial)        │
└────────────────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────┬─────────────────────────────┐
│ ⚡ [DO NOW] TASKS   │ 🗺️ PROGRESSION & AUDIT MATRIX      │ 🛡️ STATS & READINESS GAUGE  │
│                     │                                    │                             │
│ 🔴 Immediate (High) │ 📜 Permanent Completion (15/18)    │ ⚔️ War Readiness Breakdown   │
│  - Farm Darkseekers │   - Igor Bartali: 15/15 (+4 AP)    │   - T1 Node War: 100% [CAP] │
│    for Flame        │   - Herald's Journal: Missing +1 DP│   - T2 Node War: 100% [CAP] │
│  - Weekly Atoraxxion│                                    │   - Siege/Uncapped: 84%     │
│                     │ 🏆 Treasure Completion (3/6)       │                             │
│ 🟡 Medium Priority  │   - Infinite HP Pot: [DONE]        │ 🌿 Life Skill Progress      │
│  - Craft Kabua #2   │   - Infinite MP Pot: [DONE]        │   - Gathering: Master 12    │
│  - Dorin Book +1 AP │   - Archaeologist Map: [2/4 Pieces]│   - Cooking: Guru 28        │
│                     │   - Compass: [0/3 Pieces]          │   - Hunting: Artisan 8      │
└─────────────────────┴────────────────────────────────────┴─────────────────────────────┘
```

---

## 🎨 Token Highlights for Dashboard Page

- **Hero HUD Background**: `#131627` with `#1E2442` border
- **Active Blocker Accent**: `#EF4444` (Crimson Warning Tag)
- **Next Objective Accent**: `#8B5CF6` (Arcane Purple Pill)
- **Do Now Priority Badges**:
  - `DO NOW`: `#EF4444` Background / `#FFFFFF` Text
  - `HIGH EFFICIENCY`: `#F59E0B` Background / `#000000` Text
  - `COMPLETED`: `#10B981` Background / `#FFFFFF` Text
