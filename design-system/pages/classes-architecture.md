# Extensible Class Meta & Architecture Specs

> **Page**: Classes & Tier System (`design-system/pages/classes.md`)
> **Core Feature**: Modular JSON Schema to support all 28+ BDO classes with Awakening / Succession variants.

---

## 🏛️ Extensible Class Data Schema

```json
{
  "classes": [
    {
      "id": "warrior",
      "name": "Warrior",
      "role": "Melee Bruiser / Frontline",
      "awakening": {
        "spec": "Awakening (Greatsword)",
        "pveTier": "A",
        "pvpTier": "S",
        "apm": "High (4/5)",
        "strengths": ["Block Cancels", "High Burst DPS", "Frontal Guard"],
        "recommendedSpots": ["Giants", "Dehkia Hystria", "Crypt"],
        "buffs": ["Frenzy", "Exquisite Cron", "Spirit Perfume"],
        "crystalPreset": "All-Monster AP + Corrupted",
        "lightstoneCombo": "Target Opening (Back Attack)"
      },
      "succession": {
        "spec": "Succession (Sword & Shield)",
        "pveTier": "B+",
        "pvpTier": "A",
        "apm": "Medium (3/5)",
        "strengths": ["Infinite Super Armor", "Safe Grinding", "High Tankiness"],
        "recommendedSpots": ["Gyfin Rhasia", "Ash Forest"],
        "buffs": ["Giant Draught", "Exquisite Cron"],
        "crystalPreset": "Monster AP + Damage Reduction",
        "lightstoneCombo": "Deathblow"
      }
    }
  ]
}
```

---

## ⚡ Architecture Scalability Principles

- **Dynamic Class Registry**: Supports adding future classes (e.g. Dosa Awakening, Scholar, etc.) without altering UI component code.
- **Filterable Taxonomy**:
  - By Playstyle: `Melee`, `Ranged`, `Magic`, `Assassin`, `Tank`
  - By APM: `Low Chill Grind (1-2/5)`, `Medium (3/5)`, `High APM Piano (4-5/5)`
  - By Special Attack: `Back Attack Heavy`, `Down Attack Heavy`, `Crit Flat Multiplier`
- **Dynamic Tier Comparison Radar**: Real-time PvE Grind Tier, Node War Tier, and 1v1 PvP Tier.
