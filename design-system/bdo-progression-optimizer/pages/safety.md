# Item Safety & Anti-Trap System Specs

> **Category**: Item Safety System & Protection Rules
> **Critical UX Requirement**: Visible Safety Badges & Clear Preservations

---

## 🛡️ Safety Status Badges & Color Tokens

| Safety Label | Color Token | Hex | Meaning / Action |
|---|---|---|---|
| `[DO NOT USE]` | `--color-danger` | `#EF4444` | Critical future tier material (Do NOT waste now) |
| `[DO NOT SELL]` | `--color-danger` | `#EF4444` | Rare / Time-gated / Impossible to rebuy cheaply |
| `[DO NOT HEAT]` | `--color-danger` | `#EF4444` | Contains hidden value / Unique crafting prerequisite |
| `[DO NOT OPEN YET]` | `--color-warning` | `#F59E0B` | Box/Selection chest whose value depends on future RNG/Choice |
| `[SAFE TO USE]` | `--color-success` | `#10B981` | Safe to consume / apply now for instant progression |
| `[SAFE TO SELL]` | `--color-secondary` | `#3B82F6` | Pure junk/trade item with no future craft requirement |

---

## 📦 Item Safety Inspector Card Structure

```
┌────────────────────────────────────────────────────────┐
│ 💎 Gem of Twilight                                    │
│ [DO NOT USE]  (Red Warning Pill)                       │
├────────────────────────────────────────────────────────┤
│ • Purpose:   Sovereign Sub-weapon crafting component   │
│ • Needed:    1/1 (Keep in Central Market / Storage)    │
│ • Use When:  Ready to craft Sovereign Kutum/Nouver     │
│ • Risk:      Extremely tedious to re-farm / High Silver │
│ • Safe Lock: [✓ Locked from Quick Sell Suggestions]    │
└────────────────────────────────────────────────────────┘
```

---

## 🚨 Critical BDO Protected Items Database (Live Meta)

1. **Gem of Twilight** -> `[DO NOT USE]` (Sovereign Sub-weapon)
2. **Flame of the Primordial / Flame of Frost / Flame of Despair** -> `[DO NOT SELL]` (Slumbering Origin/Sovereign)
3. **Sealed Weapon Exchange Coupons** -> `[DO NOT USE]` (Keep for meta shifts/new class rerolls)
4. **Shakatu's Seals / Special Seals** -> `[DO NOT OPEN YET]` (Exchange only for high tier T4 pets or Giga failstacks)
5. **Advice of Valks (+100, +150, +200)** -> `[DO NOT USE]` (Reserve for PEN Blackstar / Deboreka TET/PEN)
6. **Specter's Energy** -> `[DO NOT HEAT]` (Blackstar armor/weapon crafting)
7. **Ancient Spirit Dust** -> `[SAFE TO USE]` (Convert to Caphras Stones via Simple Alchemy)
