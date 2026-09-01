# Gear Planner Architecture Specs

> **Page**: Gear Planner & Optimizer View (`design-system/pages/gear.md`)
> **Core Flow**: CURRENT GEAR ➔ NEXT UPGRADE ➔ END TARGET

---

## 🛡️ 3-Stage Progression Pipeline

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚔️ GEAR PROGRESSION PIPELINE                                                           │
│ ┌───────────────────────┐   ┌───────────────────────┐   ┌────────────────────────────┐ │
│ │ 1. CURRENT GEAR       │ ➔ │ 2. NEXT UPGRADE       │ ➔ │ 3. END TARGET              │ │
│ │ GS: 692 (309/311/383) │   │ Target: 710+ (316/401)│   │ GS: 760+ (330+/430+)       │ │
│ └───────────────────────┘   └───────────────────────┘   └────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎛️ Detailed Slot-by-Slot Blueprint

| Slot | Current Gear (692 GS) | Next Upgrade (Phase Target) | End Target (Pinnacle Meta) | Upgrade Method & Cost |
|---|---|---|---|---|
| **Mainhand** | PEN Blackstar Mainhand | Sovereign Mainhand (TRI) | Sovereign Mainhand (OCT/DEC) | Flame of Primordial (25B) |
| **Awakening**| TET Blackstar Awakening | PEN Blackstar Awakening | Sovereign Awakening (OCT) | J's Hammer / 240+ FS |
| **Sub-Weapon**| PEN Fiery Kutum (C14) | Fiery Sovereign Kutum | Sovereign Sub-Weapon (OCT) | Gem of Twilight + Flame |
| **Helmet** | TRI Labreska Helmet | TET Labreska Helmet | SILENT Labreska Helmet | Embers of Frost + Crons |
| **Armor** | TRI Fallen God Armor | TET Fallen God Armor | SILENT Fallen God Armor | Flame of Despair + Crons |
| **Gloves** | TRI Dahn's Gloves (DR) | TET Dahn's Gloves | SILENT Dahn's Gloves | Flame of Hongik + Crons |
| **Shoes** | TRI Ator's Shoes (DR) | TET Ator's Shoes | SILENT Ator's Shoes | Flame of Resonance + Crons |
| **Necklace** | TET Deboreka Necklace | Kharazad Necklace (TET) | Sovereign Kharazad (OCT) | Dawn Essence + Central Mkt |
| **Belt** | TET Deboreka Belt | Kharazad Belt (TET) | Sovereign Kharazad (OCT) | Dawn Essence + Central Mkt |
| **Ring 1** | PEN Crescent Ring (Jetina)| Kharazad Ring #1 (TET) | Sovereign Kharazad (OCT) | Dawn Essence Craft |
| **Ring 2** | TET Deboreka Ring | Kharazad Ring #2 (TET) | Sovereign Kharazad (OCT) | Dawn Essence Craft |
| **Earring 1**| TET Black Distortion | Kharazad Earring #1 (TET)| Sovereign Kharazad (OCT) | Dawn Essence Craft |
| **Earring 2**| TET Black Distortion | Kharazad Earring #2 (TET)| Sovereign Kharazad (OCT) | Dawn Essence Craft |
| **Artifacts**| 2x Kabua's Artifacts | 2x Kabua (Optimized) | 2x Edania High-Tier Artifact| Deathblow / Target Combos |

---

## 💡 Visual Card Specs for Gear Planner

- **Multi-modal Indicator**: Icon + High-contrast Text + Semantic Status Pill (Not relying on color alone).
- **AP/DP Bracket Calculator**: Dynamic Bracket bonus indicator (e.g. `+160 Bonus Sheet AP`).
- **Cost / ROI Metric**: Silver per stat point gained (e.g. `4.2B / +1 AP` vs `28B / +1 AP`).
