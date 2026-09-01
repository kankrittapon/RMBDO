# Design System Master File — BDO Progression Optimizer & Tactical HUD

> **Single Source of Truth** for UI/UX tokens, layout structures, and component rules.
> Strictly adheres to the **High-Density, Dark-First Gaming Optimizer** design guidelines.

---

## 🌌 Visual Direction & Philosophy

- **Goal**: Immediate actionable intelligence for Black Desert Online progression.
- **Tone**: Professional, tactical, data-dense, dark-first MMORPG optimizer HUD.
- **Core Principles**:
  - ✅ **High Information Density without clutter**: Maximum screen utility, compact KPI badges, structured grids.
  - ✅ **Strong Visual Hierarchy**: Primary next-actions stand out instantly; secondary data is easily scannable.
  - ✅ **Readable Data Tables**: Dense tabular layouts with sticky headers, monospaced numbers, and subtle zebra stripes.
  - ✅ **Restrained Gold/Accent Usage**: Gold `#F59E0B` reserved strictly for Endgame/Slumbering Origin/Top Tier milestones.
  - ✅ **Clear Progression States**: Completed (Emerald `#10B981`), In-Progress (Arcane Purple `#8B5CF6`), Locked/Upcoming (Slate `#64748B`), Warning/Trap (Crimson `#EF4444`).
- **Strict Anti-Patterns (AVOID)**:
  - ❌ No giant hero banners or wasteful marketing copy.
  - ❌ No excessive fantasy fluff, ornate scrollwork, or blurry glassmorphism everywhere.
  - ❌ No slow/distracting decorative animations (keep micro-transitions < 200ms).
  - ❌ No giant rounded corners (use clean 4px - 6px corners).
  - ❌ No emoji as interface icons (Use crisp **Lucide SVG icons** exclusively).
  - ❌ No low contrast gray-on-gray text (Body text contrast > 4.5:1).
  - ❌ No hiding essential stats behind deep nested clicks.

---

## 🎨 Design Tokens & Palette

### Semantic Colors

| Role | Token Name | Hex Code | Purpose |
|---|---|---|---|
| **Canvas Background** | `--color-bg-canvas` | `#0B0D17` | Deep dark tactical void |
| **Surface 1 (Base Cards)** | `--color-bg-surface-1` | `#131627` | Primary card & section background |
| **Surface 2 (Elevated/Hover)** | `--color-bg-surface-2` | `#1C2038` | Interactive cards, active rows, dropdowns |
| **Surface 3 (Input/Muted)** | `--color-bg-surface-3` | `#242A4A` | Search bars, filter chips, compact tags |
| **Border Subtle** | `--color-border-subtle` | `#1E2442` | Division lines & card outlines |
| **Border Active/Focus** | `--color-border-active` | `#6366F1` | Focus rings & active tab indicators |
| **Primary Arcane** | `--color-primary` | `#8B5CF6` | Black Spirit / Progression links |
| **Action Accent** | `--color-accent` | `#3B82F6` | Primary action buttons & active filters |
| **Milestone Gold** | `--color-gold` | `#F59E0B` | Softcap / Fallen God / High value drops |
| **Success / Complete** | `--color-success` | `#10B981` | Completed books, gear goals reached |
| **Trap / Danger** | `--color-danger` | `#EF4444` | Cron waste warning, trap items, dead ends |
| **Text Primary (High Contrast)** | `--color-text-primary` | `#F8FAFC` | Main headings, crucial numbers, stats |
| **Text Secondary (Subtle)** | `--color-text-secondary` | `#94A3B8` | Labels, descriptions, passive info |
| **Text Muted** | `--color-text-muted` | `#64748B` | Table headers, footnote timestamps |

---

## 🔤 Typography & Hierarchy

- **Header & Metric Font**: `Chakra Petch` / `Space Grotesk` (Technical, sharp, esports feel)
- **Data & Tabular Numbers**: `JetBrains Mono` / `Fira Code` (Tabular figures for AP/DP/Silver alignments)
- **Body Text**: `Inter` / `system-ui` (Maximum legibility at 13px - 14px)

---

## 📊 Component & Layout Specifications

### 1. Main Dashboard HUD Structure
- **Top Sticky Command Bar (h-14)**: Live Player AP / AAP / DP / GS Badges + Quick Search + Profile State.
- **Three-Column Information Grid**:
  - **Left Column (Col-3)**: Current Target & Milestone Checklist (What have I completed?).
  - **Center Column (Col-6)**: "What should I do NEXT?" Tactical Engine + Grind Efficiency Matrix.
  - **Right Column (Col-3)**: Missing Permanent Stats (Journals) + Trap Warnings + War-Ready Meter.

### 2. High-Density Tables
- Sticky Header with dark background (`#131627`).
- Row hover with crisp highlight (`#1C2038`).
- Monospaced right-aligned numerical columns (`JetBrains Mono`).
- Visual inline badges for monster zone tier & requirement checks.

### 3. Responsive & Mobile Rules
- Desktop (>= 1280px): 3-column dense tactical view.
- Tablet (768px - 1279px): 2-column view with collapsible side drawers.
- Mobile (< 768px): Single column with Bottom Sticky Navigation Dock (<= 5 buttons) and Horizontal Card Transformation for wide tables.
