# Responsive Architecture & War Readiness Audit Specs

> **Pages**: `responsive-rules.md`, `war-readiness.md`
> **Source of Truth**: `MASTER.md`

---

## 📱 1. RESPONSIVE BREAKPOINTS & ADAPTIVE ARCHITECTURE

### Breakpoint Strategy:

| Breakpoint | Target Screen | Layout Paradigm | Navigation Pattern | Table Handling |
|---|---|---|---|---|
| **375px** (Mobile) | iPhone / Android | **Task/Checklist-First** (High Actionability) | Bottom Sticky Nav Dock (<= 5 tabs) | **Card Transformation** (Each row becomes a swipeable/tappable card) |
| **768px** (Tablet) | iPad / Tablets | 2-Column Adaptive Split | Collapsible Left Rail + Slideover | **Horizontal Scroll w/ Sticky Header** & Frozen Left Column |
| **1024px** (Laptop) | Standard Laptops | 3-Column Balanced HUD | Full Left Rail + Top Status Bar | High-Density Condensed Table |
| **1440px+** (Desktop/Ultra)| Gaming Monitors | Ultra-Dense 3-Column Tactical Command | Full Fixed HUD + Multi-inspector | Full Data Table w/ Inline Charts & Badges |

---

## ⚔️ 2. WAR READINESS STATUS (LIVE AUDIT CASE)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚔️ WAR & SIEGE READINESS AUDIT                                                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Gear:                  🟢 READY                                                      │
│ • Permanent Stats:       🟡 8 / 10                                                     │
│ • Infinite Potions:      🟢 READY                                                      │
│ • Family Infrastructure: 🟢 READY                                                      │
│ • PvP Build:             🔴 NOT STARTED                                                │
│ ────────────────────────────────────────────────────────────────────────────────────── │
│ 🚨 OVERALL STATUS:       🔴 NOT READY                                                  │
│                                                                                        │
│ 🛑 ACTIVE WAR BLOCKERS:                                                                │
│   1. Permanent AP +1 (Missing Deve's Encyclopedia Vol 5 / Dorin C20)                  │
│   2. Telescope (0/3 Pieces from Ulukita Monster Zones)                                 │
│   3. PvP Crystal Preset (Missing Glorious Ah'Krad & Special Evasion Set)               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ♿ 3. ACCESSIBILITY COMPLIANCE CHECKLIST (WCAG 2.2)

- [✓] **Semantic HTML**: `<main>`, `<nav>`, `<header>`, `<section>`, `<article>`, `<table>` with `<caption>` and `<th>`.
- [✓] **High-Contrast Text**: Strict ratio >= 4.5:1 for body and >= 7:1 for headers.
- [✓] **Multi-modal Status**: Every status indicator pairs an SVG icon with explicit text and distinct border styles.
- [✓] **Keyboard Navigation**: Full Tab navigation with `focus-visible:ring-2 focus-visible:ring-indigo-500`.
- [✓] **Accessible Form & Icon Buttons**: Explicit `<label>` and `aria-label` on all interactive triggers.
- [✓] **Reduced Motion**: Respects `prefers-reduced-motion` media queries.
