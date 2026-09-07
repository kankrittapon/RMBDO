// Worker species codes (0-8) as used by `worker_types` / `species` in
// public/data/bdo-node-graph.json and vendor/workerman/plantzone.json.
// Mapping mirrors shrddr/workermanjs src/stores/game.js `speciesIcons` +
// `giantSpecies` (see vendor/workerman/ATTRIBUTION.md). Labels for the
// regional variants (3-8) are best-effort - the icon + giant flag are the
// parts the ranking/UI actually depend on, and those are exact.

export interface SpeciesInfo {
  code: number;
  name: string;
  icon: string;
  isGiant: boolean; // giants use the unlucky_gi drop table (higher base qty)
}

const GIANT_SPECIES = new Set([2, 4, 8]);

const NAMES: Record<number, string> = {
  0: "Goblin",
  1: "Human",
  2: "Giant",
  3: "Kama Goblin",
  4: "Kama Giant",
  5: "O'dyllita Goblin",
  6: "LoML Goblin",
  7: "LoML Human",
  8: "LoML Giant",
};

const ICONS: Record<number, string> = {
  0: "👺",
  1: "👨",
  2: "🐢",
  3: "👺",
  4: "🐢",
  5: "👺",
  6: "👺",
  7: "👨",
  8: "🐢",
};

export function speciesInfo(code: number): SpeciesInfo {
  return {
    code,
    name: NAMES[code] ?? `Species ${code}`,
    icon: ICONS[code] ?? "❓",
    isGiant: GIANT_SPECIES.has(code),
  };
}
