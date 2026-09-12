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
];
