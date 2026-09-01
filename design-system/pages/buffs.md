# Recommended Buffs & Consumables Architecture Specs

> **Category**: PvE / PvP Buff Optimization & Stacking Rules
> **Key Feature**: Instant One-Click Buff Presets with Duration & Cost Tracker

---

## 🧪 5-Tier Stacking Buff Engine

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 🧪 RECOMMENDED BUFF PRESETS (Interactive Stacking Matrix)                              │
├─────────────────────┬────────────────────────────────────┬─────────────────────────────┤
│ 🍲 MEAL / FOOD      │ • Exquisite Cron Meal (All Stats)  │ +30 Monster AP / +30 DR     │
│                     │   (Alternative: Simple Cron Meal)  │ +300 Max HP / +5% Crit Dmg  │
├─────────────────────┼────────────────────────────────────┼─────────────────────────────┤
│ 🧪 ELIXIR / DRAUGHT │ • Frenzy Draught (High Life Leech) │ +35 Monster AP / +12% Crit  │
│                     │   (Alternative: Harmony / Giants)  │ +10% Back Attack / LifeSteal│
├─────────────────────┼────────────────────────────────────┼─────────────────────────────┤
│ 🏺 PERFUME / SPIRIT │ • Spirit Perfume Elixir (+5 Crit)  │ +5 Critical Rate / +300 HP  │
│                     │   (Alternative: Perfume of Courage)│ +20 Sheet AP / +5 Attack Spd│
├─────────────────────┼────────────────────────────────────┼─────────────────────────────┤
│ 🎪 TENT & CHURCH    │ • Old Moon Villa Buff (Camping)    │ +10 Monster AP / +10 All DR │
│                     │ • Church Stat Buff (Attack+Defense)│ +8 Extra AP / +8 All DP     │
├─────────────────────┼────────────────────────────────────┼─────────────────────────────┤
│ 📜 SCROLL & DROP    │ • Item Collection Scroll (Level 2) │ +100% Item Drop / +100% Qty │
│                     │ • Agris Fever (Zone-dependent)     │ +100% or +150% Trash Qty    │
└─────────────────────┴────────────────────────────────────┴─────────────────────────────┘
```

---

## ⚡ Interactive Features for Buff Matrix

- **Total Hourly Buff Cost**: e.g., `~45M Silver / Hour` (Calculated dynamically).
- **Preset Toggles**:
  - 🟢 `Standard Solo Grind`: Frenzy + Exquisite Cron + Spirit Perfume + Tent Buff.
  - 🟣 `Hardcore Dehkia / Party`: Party Elixir Rotation (14 Elixirs + Perfume of Courage).
  - 🟡 `Treasure Hunting Speed`: Giant's Draught + Simple Cron Meal + 300% Drop Rate Stack.
