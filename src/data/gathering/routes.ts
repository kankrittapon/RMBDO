// Curated gathering route presets. Every number carries its source -
// nothing here is measured by this project. v1 ships one route (Deer Meat
// @ Cyclops, the best-documented community benchmark); add more routes the
// same way (base yield + rare table + benchmark anchor + sources) rather
// than guessing numbers for spots nobody measured.

export interface GatheringRare {
  name: string; // English market name, priced live from market_items
  note: string; // where this entry comes from
}

export interface GatheringRoute {
  id: string;
  name: string;
  spot: string;
  tool: string;
  // Expected base yield per action BEFORE mastery/Agris (west-games meat
  // route model). Editable in the UI - raise it to account for hedgehogs,
  // spot density, etc. (see the calibration hint in the view).
  baseYieldPerAction: number;
  baseYieldSource: string;
  energyCostPerAction: number;
  // Route-specific calibrated multiplier default (see scorpion route).
  // Absent = 1.
  defaultYieldMult?: number;
  // Rare proc names for price lookup + expected-count display. Per-item
  // drop SHARES are not published anywhere trustworthy, so the estimator
  // shows total expected rare procs (count) and lets each rare be priced
  // from the live market - it never invents a share.
  rares: GatheringRare[];
  // Community benchmark this preset is checked against (NOT an input to
  // the math - a displayed reference with its source).
  benchmark: {
    mastery: number;
    meatPerHour: number;
    totalSilverPerHour: [number, number]; // [low, high]
    agris: boolean;
    source: string;
  };
}

export const gatheringRoutes: GatheringRoute[] = [
  {
    id: "deer-cyclops",
    name: "Deer Meat",
    spot: "Cyclops Land (south of Calpheon, via Behr)",
    tool: "Butcher knife",
    baseYieldPerAction: 4.2,
    baseYieldSource: "west-games meat route model (editable - see calibration hint)",
    energyCostPerAction: 1,
    rares: [
      { name: "Caphras Stone", note: "community benchmark rare (PuteraGaming 2025)" },
      { name: "Ancient Spirit Dust", note: "community benchmark rare (PuteraGaming 2025)" },
      { name: "Black Gem Fragment", note: "community benchmark rare (PuteraGaming 2025)" },
      { name: "Sharp Black Crystal Shard", note: "community benchmark rare (PuteraGaming 2025)" },
      { name: "Fairy Powder", note: "community benchmark rare (PuteraGaming 2025)" },
    ],
    benchmark: {
      mastery: 2500,
      meatPerHour: 20000,
      totalSilverPerHour: [1.2e9, 1.5e9],
      agris: false,
      source: "PuteraGaming 5-hour test, Asia region, 2025 (RNG-dependent, Arca carry varies)",
    },
  },
  {
    id: "scorpion-valencia",
    name: "Scorpion Meat",
    spot: "TBD - mixed Scorpion + Snake loop (spot unconfirmed, user session 2026-09-12)",
    tool: "Butcher knife",
    baseYieldPerAction: 4.2,
    baseYieldSource: "meat-model default; calibrated with yieldMult 1.15 below",
    energyCostPerAction: 1,
    // Calibrated so the estimator reproduces the user's measured session:
    // 293 energy / 28 min -> ~5,290 base vs 6,100 actual => mult ~1.15
    // (hedgehogs + spot density). Stated openly, not hidden.
    defaultYieldMult: 1.15,
    rares: [
      { name: "Sharp Black Crystal Shard", note: "user session: 86/hr" },
      { name: "Black Gem Fragment", note: "user session: 309/hr" },
      { name: "Faint Wildsoul", note: "user session: 49/hr" },
      { name: "Fairy Powder", note: "user session: 561/hr, NO live price in DB" },
    ],
    benchmark: {
      mastery: 1800,
      meatPerHour: 13071,
      totalSilverPerHour: [1.9e9, 1.9e9],
      agris: false,
      source: "user session 2026-09-12: 28 min, mastery 1600-2000 (uncertain, midpoint 1800 used), energy 293, no Agris; scorpion 4,286/hr + snake 8,786/hr; excludes Fairy Powder (unpriced); scorpion price thin (stock 0)",
    },
  },
];
