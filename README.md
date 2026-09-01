# ⚔️ RMBDO — Black Desert Online Progression Optimizer & Tactical HUD

> High-density gaming progression, build optimizer, and analytics dashboard for **Black Desert Online** (Asia / TH-SEA 2026 Meta).
> Built with Next.js 14, React, TypeScript, and Tailwind CSS adhering strictly to **UI UX Pro Max** design standards.

---

## 🚀 Core Systems & Features

1. **Tactical Dashboard (10-Second Action Engine)**: Instant visibility of Account Gear Score, AP/AAP/DP brackets, Current Phase, Next Objective, Active Blockers, and Priority Action Queue (`[DO NOW]`, `[HIGH PRIORITY]`, `[THIS WEEK]`, `[LATER]`).
2. **Master Progression Roadmap (11 Phases)**: Interactive timeline tracking Season Graduation → Hyperboost → Olvia Academy → Sovereign Forge → Kharazad Accessories → Slumbering Origin → Edania & Inner Edania → Permanent Completion → War Readiness.
3. **Sovereign Weapon Forge & Blackstar Allocation Engine**: Dedicated PEN (V) Blackstar inventory audit with anti-trap selection warnings to prevent irreversible mistakes.
4. **Item Safety & Storage Lock System**: High-contrast semantic safety badges (`[DO NOT USE]`, `[DO NOT SELL]`, `[DO NOT HEAT]`, `[DO NOT OPEN YET]`) for rare and time-gated materials.
5. **Tactical Gear Planner**: 14 equipment slot planner with projected AP/DP/Accuracy deltas, silver cost estimates, and status tracking.
6. **Treasure Collection Tracker**: Piece-by-piece checkboxes and progress bars for Ornette, Odore, Map, Compass, Telescope, Krogdalo's Sanctuary, and Merchant Ring.
7. **Grind Spot Optimizer & Custom Presets**: Searchable monster zone matrix with dynamic loadout presets (`BUDGET`, `BALANCED`, `MAX_DPS`, `DEFENSIVE`, `TREASURE_FARM`).
8. **Class Guides & Spot-Specific Build Matrix**: Combat radar ratings, protected rotations (SA/FG/Iframe), Tier 3 Add-ons, and spot-specific builds for Witch, Wizard, Nova, Agent, and extensible classes.
9. **Life Skill Mastery & Olvia Economy**: 11 life skill mastery brackets, next threshold yield bonuses, and Olvia Academy task lists.
10. **7-Pillar War Readiness Meter**: Structured readiness evaluation separating Mandatory combat criteria from Recommended family infrastructure.

---

## 🎨 Design System

The project's design system is documented in:
- [`design-system/MASTER.md`](./design-system/MASTER.md) — Single Source of Truth for tokens, typography, dark gaming palette, and anti-patterns.
- [`design-system/pages/`](./design-system/pages/) — Detailed page-level overrides and layout specifications.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: Client-safe LocalStorage hydration with fallback rendering
- **Data Layer**: Cleanly isolated in `src/data/` (patches, progression, gear, treasures, spots, builds, classes, lifeskills, war-readiness, permanent journals)

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type check
npm run typecheck

# Production build
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🌐 Deployment (Vercel)

This repository is optimized for zero-configuration deployment on **Vercel**:
1. Import repository `kankrittapon/RMBDO` into Vercel.
2. Framework Preset: **Next.js** (auto-detected).
3. Deploy to production on `main` branch.
