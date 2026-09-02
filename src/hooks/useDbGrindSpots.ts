'use client';

import { useEffect, useState } from 'react';

export interface DbGrindSpot {
  name: string;
  recommendedAP: number | null;
  recommendedDP: number | null;
  coordinates: [number, number] | null;
  notableDrops: string | null;
  dataSource: 'db-verified';
}

/** Fetches /api/grind-spots and returns a lookup by exact spot name, so a
 * view can overlay real (collector-verified) AP/DP/coordinates on top of
 * the hand-authored src/data/grind-spots/spots.ts list. Empty map (not an
 * error) if the DB has nothing yet or the request fails - the static list
 * always renders regardless. Matching is exact-name for now; the DB's
 * seed/collector rows don't all share spots.ts's exact naming yet, so most
 * spots will show no verified badge until the collector has actually run
 * and/or names are reconciled - that's expected, not a bug. */
export function useDbGrindSpots() {
  const [byName, setByName] = useState<Map<string, DbGrindSpot>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/grind-spots')
      .then((res) => res.json())
      .then((data: { spots?: DbGrindSpot[] }) => {
        if (cancelled) return;
        const map = new Map<string, DbGrindSpot>();
        for (const spot of data.spots ?? []) {
          map.set(spot.name.trim().toLowerCase(), spot);
        }
        setByName(map);
      })
      .catch(() => {
        // Static data is always the fallback - swallow and leave the map empty.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    loading,
    getVerified: (name: string) => byName.get(name.trim().toLowerCase()) ?? null,
  };
}
