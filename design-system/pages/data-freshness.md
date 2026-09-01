# Data Freshness & Global Lab Badge Specs

> **Page**: Data Freshness UI Standard (`design-system/pages/data-freshness.md`)
> **Goal**: Transparent metadata verification status on all meta-sensitive views.

---

## 🏷️ Freshness Header Component Architecture

Every meta-sensitive page/section (Grind Spots, Classes, Gear, Patches) includes:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 🌐 REGION: Asia / TH-SEA  |  📅 LIVE LAST VERIFIED: 2026-09-01  |  📊 CONFIDENCE: HIGH │
│ 📡 DATA SOURCE: Pearl Abyss Official Patch Notes + Garmoth Live API Sync               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Global Lab / Unreleased Content Warning Badge

When content originates from **Global Lab (Test Server)** or is unreleased on Live Servers:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ [ UPCOMING / NOT LIVE — GLOBAL LAB TEST SERVER ]                                    │
│ Status: Subject to balance changes. Do NOT sell existing gear based on these numbers!   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Visual Styling**:
  - Border: 2px dashed Amber/Crimson (`#F59E0B` / `#EF4444`)
  - Background: Strobe/Pulse Dark Amber `#291B00`
  - Text: High-contrast `#FDE68A` with Warning SVG Icon (`FlaskConical` / `AlertTriangle`)
