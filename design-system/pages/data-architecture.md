# Data Architecture & Decoupled State Specs

> **Core Architecture Rule**: Data Must Be Strictly Separated from UI Components.
> **Directory Blueprint**: `data/` serves as the centralized, strictly typed single source of game meta.

---

## 📁 Data Directory Architecture

```
src/
├── data/
│   ├── classes/          # Class profiles, specs, Awakening/Succ APM, tiers
│   │   ├── warrior.ts
│   │   ├── witch.ts
│   │   ├── wizard.ts
│   │   ├── nova.ts
│   │   ├── scholar.ts
│   │   └── index.ts
│   ├── grind-spots/      # Monster AP caps, DP, Species, Silver/hr, Drops
│   │   ├── ulukita.ts
│   │   ├── elvia-calpheon.ts
│   │   ├── dehkia.ts
│   │   └── index.ts
│   ├── crystals/         # Preset A/B, individual crystal stats, set effects
│   ├── artifacts/        # Kabua, Monster, Species, Accuracy artifacts
│   ├── lightstones/      # Deathblow, Target Opening, Wild combos
│   ├── treasures/        # Ornette, Odore, Map, Compass, Telescope, Merchant Ring
│   ├── lifeskills/       # 11 Professions, Mastery brackets, Manos stats, Olvia Academy
│   ├── progression/      # Roadmap stages (Season -> Sovereign -> Edania), requirements
│   ├── safety/           # Protected items (Do not use, Do not sell, Do not heat)
│   └── patches/          # 2026 Live Meta patch changes (Kharazad, Sovereign, Edania)
├── types/                # Strict TypeScript interfaces matching the data schema
│   ├── class.ts
│   ├── grind-spot.ts
│   ├── gear.ts
│   ├── treasure.ts
│   ├── lifeskill.ts
│   └── roadmap.ts
└── components/           # Pure, reusable UI components consuming data via props/hooks
```

---

## 🔒 Strict Separation Contract

- ❌ **NEVER** hardcode AP/DP caps, silver amounts, or item names directly inside JSX/React components.
- ✅ **ALWAYS** import from `@/data/...` with full TypeScript type validation.
- ✅ **EXTENSIBLE**: Adding a new class or new grind spot requires editing only a single file in `data/`, automatically updating the UI, search, and filters.
