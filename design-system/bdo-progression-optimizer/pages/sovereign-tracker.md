# Blackstar & Sovereign Allocation Tracker Specs

> **Page**: Blackstar & Sovereign Tracker (`design-system/pages/sovereign-tracker.md`)
> **Goal**: Prevent wasteful Blackstar weapon consumption and optimize Sovereign crafting pipeline.

---

## ⚔️ Blackstar & Sovereign Tracker UI Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔮 BLACKSTAR WEAPON ALLOCATION & SOVEREIGN FORGE TRACKER                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 📊 PEN BLACKSTAR INVENTORY AUDIT                                                       │
│ ┌──────────────────────┬──────────────────────┬──────────────────────┬───────────────┐ │
│ │ Mainhand Weapons     │ Awakening Weapons    │ Sub-Weapons          │ TOTAL PEN BS  │ │
│ │ 2 / 2  [✓ COMPLETE]  │ 1 / 2  [🚨 BLOCKER]  │ 1 / 1  [✓ COMPLETE]  │ 4 / 5 (80%)   │ │
│ └──────────────────────┴──────────────────────┴──────────────────────┴───────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 🎯 CRITICAL PATH ACTION:                                                               │
│ ➔ Obtain PEN Blackstar Awakening x1 (Required to synthesize Sovereign Awakening)       │
│                                                                                        │
│ 🛡️ SOVEREIGN WEAPON FORGE READINESS:                                                   │
│ • Mainhand Sovereign:  🟢 [READY]   (2x PEN BS Main + Flame of Primordial Available)  │
│ • Awakening Sovereign: 🔴 [BLOCKED] (Missing 2nd PEN BS Awakening Weapon)             │
│ • Sub-Weapon Sovereign:🟢 [READY]   (Gem of Twilight + Flame of Primordial Ready)     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚫 Critical Allocation Warnings (Anti-Trap Engine)

- ⚠️ **DO NOT USE** PEN Blackstar Mainhand to attempt Sovereign Awakening.
- ⚠️ **DO NOT CRON** TET Blackstar if J's Hammer of Precision is available.
- ⚠️ **DO NOT CONVERT** Sovereign Weapon without locking primary crystal slots.
