'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'rmbdo_lang';

// Module-level cache: every mounted component calls the same endpoint,
// fetch it once per page load no matter how many hooks are mounted.
let cachedMap: Record<string, string> | null = null;
let inflight: Promise<Record<string, string>> | null = null;

function loadMap(): Promise<Record<string, string>> {
  if (cachedMap) return Promise.resolve(cachedMap);
  if (!inflight) {
    inflight = fetch('/api/item-names', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: { names?: Record<string, string> }) => {
        cachedMap = data.names ?? {};
        return cachedMap;
      })
      .catch(() => ({} as Record<string, string>))
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export type Lang = 'en' | 'th';

/** EN/TH item-name toggle. Names come from codex sources only
 * (item_name_translations); a missing entry falls back to English -
 * never blank, never guessed. Persisted in localStorage, shared by every
 * component that shows item/recipe/node-yield names. UI chrome stays
 * English by decision - this hook only translates DATA names. */
export function useThNames() {
  const [lang, setLangState] = useState<Lang>('en');
  const [map, setMap] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'th') setLangState('th');
    } catch {}
    loadMap().then((m) => setMap(m));
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  }, []);

  const t = useCallback(
    (en: string | null | undefined): string => {
      if (!en) return '';
      if (lang !== 'th') return en;
      return map[en] ?? en;
    },
    [lang, map],
  );

  return { lang, setLang, t };
}
