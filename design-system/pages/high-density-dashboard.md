# High-Density Dashboard Implementation Specs

> **Page**: High-Density Dashboard Grid Specs (`design-system/pages/high-density-dashboard.md`)
> **Goal**: Maximum tactical information density with zero clutter, instant readability, and crisp hierarchy.

---

## 🖥️ Screen Layout & Density Blueprint (1440px / Ultrawide & Responsive)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🎮 TACTICAL TOP HUD BAR (h-12 | Sticky | #0B0D17)                                                  │
│ [⚔️ BDO PROGRESSION OPTIMIZER] [Asia/TH-SEA] [GS: 692 (309/311/383)] [War: 84%] [Search ⌘K] [⚙️]  │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────┬───────────────────────────────────────┬─────────────────────────────┐
│ 📍 LEFT COLUMN (w-80 / Col-3)│ ⚔️ CENTER WORKSPACE (Flex / Col-6)   │ 📊 RIGHT COLUMN (w-80/Col-3)│
│                              │                                       │                             │
│ 🎯 NEXT OBJECTIVE & BLOCKER  │ 🗺️ INTERACTIVE PROGRESSION ROADMAP    │ ⚔️ WAR READINESS AUDIT      │
│ • Phase: Hyper-Endgame Trans │ • [✓] Season -> [✓] Hyperboost        │ • Gear: 🟢 READY (100%/88%) │
│ • Target: Sovereign Awk      │ • [✓] Olvia -> [•] Lifeskill (Active) │ • Stats: 🟡 8/10 Journals   │
│ • Blocker: PEN BS Awk x1     │ • [ ] Sovereign -> [ ] Kharazad       │ • Pots: 🟢 READY (HP/MP)    │
│                              │                                       │                             │
│ 🛡️ 14-SLOT GEAR STATUS       │ 💰 GRIND SPOT REVENUE MATRIX (Live)   │ 🚫 SAFETY & TRAP RADAR      │
│ • Main: Sovereign (TRI) [✓]  │ • Darkseekers: 1.85B/Hr [AP 310/DP410]│ • 🛑 Gem of Twilight        │
│ • Awk:  TET BS Awk [BLOCK]   │ • Giants Post: 1.35B/Hr [AP 290/DP380]│   [DO NOT USE: Sub-Weapon]  │
│ • Sub:  Sovereign (OCT) [✓]  │ • Gyfin Under: 1.15B/Hr [AP 280/DP360]│ • ⚠️ Do not Cron TET BS!    │
│ • Armor: TRI Fallen God [✓]  │                                       │                             │
│                              │ 🧪 ONE-CLICK BUFF & CRYSTAL PRESET    │ 🏆 TREASURE VAULT (Quick)   │
│ 🌿 LIFE SKILL MASTERY (Top)  │ • Preset A (All-Monster AP + BackAtk) │ • Infinite HP/MP: [DONE]    │
│ • Gathering: 1,450 (M12)     │ • Buff: Frenzy + Exquisite + Villa    │ • Map: 2/4 | Compass: 1/3   │
│ • Cooking:   1,650 (G28)     │ • Hourly Cost: 42.5M / Silver Net     │ • Telescope: 0/3            │
└──────────────────────────────┴───────────────────────────────────────┴─────────────────────────────┘
```

---

## ⚡ Key High-Density Features

1. **Monospaced Data Alignment**: Numbers, Silver values, and AP/DP brackets use `JetBrains Mono` for crisp scannability.
2. **Compact Status Pills**: High-contrast, tight badges (e.g. `[✓ 100%]`, `[🚨 BLOCKED]`, `[+12 AP]`).
3. **Zero-Scroll Actionability**: Core questions ("What to do next", "What grind spot to farm", "What to avoid") answered above the fold.
