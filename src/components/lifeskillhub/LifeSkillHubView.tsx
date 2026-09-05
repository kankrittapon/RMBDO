'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChefHat, Search, TrendingUp, Info, Sparkles, Settings2, Save, CheckCircle2, X, Loader2, AlertCircle, ShoppingCart, Pickaxe, Wheat, Package, CloudDownload, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const INVENTORY_KEY = "rmbdo_inventory_v1";
const LEDGER_KEY = "rmbdo_ledger_v1";

type ProcurementAdvice = { label: string; icon: "market" | "gather" | "node"; tooltip?: string };

// Lightweight procurement map — extend with src/data if needed
const PROCUREMENT_MAP: Record<string, ProcurementAdvice> = {
  // Vendor / Market Buy
  "Mineral Water": { label: "Market Buy", icon: "market", tooltip: "Vendor: General Goods" },
  "Cooking Wine": { label: "Market Buy", icon: "market", tooltip: "Vendor: General Goods" },
  "Salt": { label: "Market Buy", icon: "market", tooltip: "Vendor: General Goods" },
  "Sugar": { label: "Market Buy", icon: "market", tooltip: "Vendor: General Goods" },
  "Olive Oil": { label: "Market Buy", icon: "market", tooltip: "Vendor: General Goods" },
  "Dressing": { label: "Market Buy", icon: "market", tooltip: "Vendor" },
  "Vinegar": { label: "Market Buy", icon: "market", tooltip: "Vendor" },
  // Worker Node / Farm
  "Wheat": { label: "Worker Node", icon: "node", tooltip: "Node: Wheat (Velia, Heidel)" },
  "Barley": { label: "Worker Node", icon: "node", tooltip: "Node: Barley" },
  "Corn": { label: "Worker Node", icon: "node", tooltip: "Node: Corn" },
  "Potato": { label: "Worker Node", icon: "node", tooltip: "Node: Potato (Velia)" },
  "Sweet Potato": { label: "Worker Node", icon: "node", tooltip: "Node: Sweet Potato" },
  "Chicken Meat": { label: "Worker Node", icon: "node", tooltip: "Node: Chicken Meat" },
  "Oatmeal": { label: "Worker Node", icon: "node", tooltip: "Node: Oatmeal" },
  "White Cedar Timber": { label: "Worker Node", icon: "node", tooltip: "Node: White Cedar" },
  "Maple Timber": { label: "Worker Node", icon: "node", tooltip: "Node: Maple" },
  "Ash Timber": { label: "Worker Node", icon: "node", tooltip: "Node: Ash" },
};

function getProcurementAdvice(name: string): ProcurementAdvice {
  if (PROCUREMENT_MAP[name]) return PROCUREMENT_MAP[name];
  const lower = name.toLowerCase();
  if (/(meat|blood|trace|sap|hide|leather|feather|claw|hoof)/i.test(lower)) {
    return { label: "Gather", icon: "gather", tooltip: "Hunting / Gathering hotspot" };
  }
  if (/(wheat|barley|corn|potato|tomato|pumpkin|grape|apple| timber|wood|ore|coal|iron| copper| zinc| grain|vegetable)/i.test(lower)) {
    return { label: "Worker Node", icon: "node", tooltip: "Worker Node / Farm" };
  }
  return { label: "Market Buy", icon: "market", tooltip: "Central Market" };
}

interface CraftingRecipe {
  recipeName: string;
  category: string;
  profitPerHour: number | null;
  price: number | null;
  volume14dAvg: number | null;
  experience: string | null;
  personalized: boolean;
  collectedAt: string;
  recipeSlug: string | null;
}

interface RecipeDetail {
  recipeSlug: string;
  recipeName: string;
  category: string | null;
  totalCost: number | null;
  profit: number | null;
  profitPerHour: number | null;
  ingredients: Array<{
    name: string;
    quantity: number;
    unitPrice: number | null;
    totalCost: number | null;
    isSubRecipe: boolean;
    subRecipeSlug: string | null;
  }>;
  collectedAt: string;
  source: string;
}

interface PlayerSettings {
  cookingMastery: number | null;
  alchemyMastery: number | null;
  processingMastery: number | null;
  updatedAt: string | null;
}

const CATEGORIES = ['Cooking', 'Alchemy', 'Processing', 'Imperial Crates'] as const;

const fmtSilver = (n: number | null) => (n === null ? '-' : n.toLocaleString('en-US'));

// Imperial Crates has no entry here on purpose: its recipes bundle
// already-made Cooking/Alchemy/Processing goods (e.g. "Master's Cooking
// Box"), so no single Mastery stat governs it - bdolytics' own "Training
// Mastery" setting is the separate Horse Training life skill and doesn't
// apply here either. See the matching note in collector/src/scrapers/crafting.ts.
const MASTERY_FIELDS: Array<{ key: keyof PlayerSettings; label: string; category: (typeof CATEGORIES)[number] }> = [
  { key: 'cookingMastery', label: 'Cooking Mastery', category: 'Cooking' },
  { key: 'alchemyMastery', label: 'Alchemy Mastery', category: 'Alchemy' },
  { key: 'processingMastery', label: 'Processing Mastery', category: 'Processing' },
];

// Life Skill Hub - the main "what should I do today" screen. Silver/Hour
// per recipe is scraped directly from bdolytics' own Crafting Calculator
// (never recomputed here - that needs BDO's unpublished mastery-speed /
// success-rate / market-tax formulas). Once you fill in your real Mastery
// below, collector/src/scrapers/crafting.ts feeds those values into
// bdolytics' own calculator before scraping, so the ranking reflects your
// actual numbers instead of bdolytics' generic default - check each row's
// "personalized" tag rather than assuming, since a settings change only
// takes effect on the next collector run (cron), not immediately.
export const LifeSkillHubView: React.FC = () => {
  const [recipes, setRecipes] = useState<CraftingRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');

  const [settings, setSettings] = useState<PlayerSettings>({
    cookingMastery: null,
    alchemyMastery: null,
    processingMastery: null,
    updatedAt: null,
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedJustNow, setSavedJustNow] = useState(false);

  // Drawer state — on-demand ingredient tree (never bulk 854)
  const [selected, setSelected] = useState<CraftingRecipe | null>(null);
  const [detail, setDetail] = useState<RecipeDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Planner state — batch + inventory (persisted in localStorage, shared across recipes)
  const [batchCount, setBatchCount] = useState<number>(100);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  // Load inventory once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(INVENTORY_KEY);
      if (raw) setInventory(JSON.parse(raw));
    } catch {}
  }, []);
  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    } catch {}
  }, [inventory]);

  // Sync from Google Sheets — overwrite local inventory (sheet is single source of truth)
  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/sync/inventory", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || `HTTP ${res.status}`);
      const incoming: Record<string, number> = data.inventory || {};
      const ledger = data.ledger || [];
      // Overwrite: sheet is single source of truth
      const clean: Record<string, number> = {};
      for (const [k, v] of Object.entries(incoming)) {
        const key = String(k).trim();
        if (!key) continue;
        clean[key] = Number(v) || 0;
      }
      setInventory(clean);
      try {
        localStorage.setItem(INVENTORY_KEY, JSON.stringify(clean));
        localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger));
      } catch {}
      setSyncMsg({ tone: "ok", text: `Synced ${Object.keys(clean).length} items from Google Sheet` });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setSyncMsg({ tone: "err", text: message });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(null), 4000);
    }
  };

  // Fetch detail when drawer opens — checks cache first, never bulk
  useEffect(() => {
    if (!selected?.recipeSlug) {
      setDetail(null);
      setDetailError(selected && !selected.recipeSlug ? "Recipe detail not available for this entry (missing slug — re-collect with updated scraper)." : null);
      return;
    }
    const slug = selected.recipeSlug;
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    const categoryParam = selected.category ? `?category=${encodeURIComponent(selected.category)}` : '';
    fetch(`/api/crafting-recipes/${encodeURIComponent(slug)}/ingredients${categoryParam}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.hint || body.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data: RecipeDetail) => setDetail(data))
      .catch((err: Error) => setDetailError(err.message))
      .finally(() => setDetailLoading(false));
  }, [selected]);

  useEffect(() => {
    fetch('/api/player-settings')
      .then((res) => res.json())
      .then((data: { settings?: PlayerSettings | null }) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (category) params.set('category', category);
    const qs = params.toString();
    fetch(`/api/crafting-recipes${qs ? `?${qs}` : ''}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: { recipes?: CraftingRecipe[] }) => setRecipes(data.recipes ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [search, category]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await fetch('/api/player-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSavedJustNow(true);
      setTimeout(() => setSavedJustNow(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const topByCategory = useMemo(() => {
    const map = new Map<string, CraftingRecipe>();
    for (const r of recipes) {
      if (!map.has(r.category) && r.profitPerHour !== null) map.set(r.category, r);
    }
    return map;
  }, [recipes]);

  const overallTop = useMemo(() => {
    const withProfit = recipes.filter((r) => r.profitPerHour !== null);
    if (withProfit.length === 0) return null;
    return withProfit.reduce((best, r) => (r.profitPerHour! > best.profitPerHour! ? r : best));
  }, [recipes]);

  const anyPersonalized = recipes.some((r) => r.personalized);
  const anyMasterySet = MASTERY_FIELDS.some((f) => settings[f.key] !== null);

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      {/* Header */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider">
          <ChefHat className="w-4 h-4" />
          <span>Life Skill Hub — Southeast Asia</span>
        </div>
        <h1 className="text-lg md:text-xl font-heading font-bold text-text-primary">
          วันนี้ทำอะไรดี (Cooking / Alchemy / Processing / Imperial Crates)
        </h1>
        <p className="text-xs text-text-secondary">
          Silver/Hour ต่อสูตร ดึงมาจากตัวเลขที่ bdolytics.com คำนวณไว้แล้วโดยตรง (ไม่ได้คิดสูตรเอง)
        </p>
      </div>

      {/* Mastery settings */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 space-y-3">
        <div className="flex items-center gap-2 text-brand-primary font-mono text-xs uppercase tracking-wider">
          <Settings2 className="w-4 h-4" />
          <span>Mastery ของคุณ (ใช้คำนวณ GAP รายวัน)</span>
        </div>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          กรอก Mastery จริงของแต่ละสาย — cronjob รายวันจะเอาค่านี้ไปกรอกในตัวคำนวณของ bdolytics ก่อน scrape
          ทำให้ Silver/Hour ที่เห็นเป็นของคุณจริง ไม่ใช่ค่า default การเปลี่ยนที่นี่จะมีผลใน**รอบ collector ถัดไป**
          ไม่ใช่ทันที
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {MASTERY_FIELDS.map((f) => (
            <div key={f.key} className="space-y-1">
              <label className="text-[10px] font-mono text-text-muted block">{f.label}</label>
              <input
                type="number"
                min={0}
                disabled={settingsLoading}
                value={settings[f.key] ?? ''}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    [f.key]: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
                placeholder="ไม่ระบุ = ค่า default"
                className="w-full px-2.5 py-1.5 bg-bg-surface-3 border border-border-subtle rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:border-brand-primary outline-none font-mono"
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary/15 border border-brand-primary/40 text-text-primary text-xs font-mono font-bold hover:bg-brand-primary/25 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'กำลังบันทึก...' : 'บันทึก Mastery'}
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/40 text-blue-300 text-xs font-mono font-bold hover:bg-blue-500/25 disabled:opacity-50"
            title="Pull inventory from Google Sheet (overwrite local)"
          >
            {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudDownload className="w-3.5 h-3.5" />}
            {syncing ? 'Syncing...' : 'Sync from Google Sheet'}
          </button>
          {savedJustNow && (
            <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" /> บันทึกแล้ว
            </span>
          )}
          {syncMsg && (
            <span className={`flex items-center gap-1 text-[11px] font-mono ${syncMsg.tone === "ok" ? "text-emerald-400" : "text-rose-400"}`}>
              {syncMsg.tone === "ok" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {syncMsg.text}
            </span>
          )}
          {settings.updatedAt && (
            <span className="text-[10px] text-text-muted font-mono ml-auto">
              อัปเดตล่าสุด: {new Date(settings.updatedAt).toLocaleString('th-TH')}
            </span>
          )}
        </div>
      </div>

      {/* Today's recommendation */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 space-y-3">
        <div className="flex items-center gap-2 text-brand-gold font-mono text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>คำแนะนำวันนี้</span>
        </div>

        {!anyMasterySet && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>ยังไม่ได้กรอก Mastery — คำแนะนำด้านล่างใช้ค่า default ของ bdolytics อยู่ ไม่ใช่ของคุณจริง</span>
          </div>
        )}
        {anyMasterySet && !anyPersonalized && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>กรอก Mastery แล้วแต่ยังไม่มีรอบ collector ที่ใช้ค่านี้ — รอ cronjob รอบถัดไป หรือรัน `npm run collect:crafting` + `npm run normalize` เองตอนนี้เลย</span>
          </div>
        )}
        {anyPersonalized && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 leading-relaxed">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>ตัวเลขด้านล่างคำนวณจาก Mastery จริงของคุณแล้ว</span>
          </div>
        )}

        {overallTop && (
          <div className="p-3 rounded-lg bg-brand-gold/10 border border-brand-gold/30">
            <span className="text-[10px] font-mono text-brand-gold uppercase block mb-1">อันดับ 1 โดยรวม</span>
            <p className="text-sm font-bold text-text-primary">{overallTop.recipeName}</p>
            <p className="text-xs font-mono text-text-muted">{overallTop.category}</p>
            <p className="text-lg font-mono font-bold text-emerald-400 mt-1">{fmtSilver(overallTop.profitPerHour)} Silver/ชม.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {CATEGORIES.map((c) => {
            const top = topByCategory.get(c);
            const masteryField = MASTERY_FIELDS.find((f) => f.category === c);
            const masteryVal = masteryField ? settings[masteryField.key] : null;
            return (
              <div key={c} className="bg-bg-surface-2 border border-border-subtle rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-text-muted uppercase">{c}</span>
                  <span className="text-[10px] font-mono text-text-muted">Mastery: {masteryVal ?? '-'}</span>
                </div>
                {top ? (
                  <>
                    <p className="text-xs font-bold text-text-primary truncate">{top.recipeName}</p>
                    <p className="text-sm font-mono font-bold text-emerald-400">{fmtSilver(top.profitPerHour)} /ชม.</p>
                    {top.personalized && (
                      <span className="text-[9px] font-mono text-emerald-400">✓ ตาม mastery จริง</span>
                    )}
                  </>
                ) : (
                  <p className="text-[11px] text-text-muted">ไม่มีข้อมูล</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Full ranking table */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 space-y-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อสูตร..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-bg-surface-3 border border-border-subtle rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:border-brand-primary outline-none font-mono"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setCategory('')}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-[11px] font-mono border',
                category === '' ? 'bg-brand-primary/15 border-brand-primary/40 text-text-primary' : 'bg-bg-surface-3 border-border-subtle text-text-muted hover:text-text-primary'
              )}
            >
              ทั้งหมด
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-[11px] font-mono border',
                  category === c ? 'bg-brand-primary/15 border-brand-primary/40 text-text-primary' : 'bg-bg-surface-3 border-border-subtle text-text-muted hover:text-text-primary'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead className="bg-bg-surface-2 text-text-muted">
              <tr>
                <th className="text-left p-2.5">สูตร</th>
                <th className="text-left p-2.5">หมวด</th>
                <th className="text-right p-2.5">
                  <span className="inline-flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Silver/Hour</span>
                </th>
                <th className="text-right p-2.5">ราคาขาย</th>
                <th className="text-right p-2.5">Volume 14d</th>
                <th className="text-right p-2.5">Exp</th>
                <th className="text-center p-2.5">ส่วนตัว?</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="p-4 text-center text-text-muted">กำลังโหลด...</td></tr>
              )}
              {!loading && recipes.length === 0 && (
                <tr><td colSpan={7} className="p-4 text-center text-text-muted">ไม่มีข้อมูล - รัน `npm run collect:crafting` แล้ว `npm run normalize` ก่อน</td></tr>
              )}
              {recipes.map((r) => (
                <tr
                  key={r.recipeSlug ? `${r.recipeSlug}` : `${r.category}-${r.recipeName}`}
                  onClick={() => setSelected(r)}
                  className="border-t border-border-subtle/60 hover:bg-bg-surface-2/80 cursor-pointer transition-colors"
                  title={r.recipeSlug ? "Click to view ingredient tree" : "No detail slug — re-collect to enable"}
                >
                  <td className="p-2.5 text-text-primary font-bold">
                    {r.recipeName}
                    {r.recipeSlug && <span className="ml-1 text-[10px] text-brand-primary/60">↗</span>}
                  </td>
                  <td className="p-2.5 text-text-muted">{r.category}</td>
                  <td className="p-2.5 text-right text-emerald-400 font-bold">{fmtSilver(r.profitPerHour)}</td>
                  <td className="p-2.5 text-right text-amber-300">{fmtSilver(r.price)}</td>
                  <td className="p-2.5 text-right text-text-secondary">{fmtSilver(r.volume14dAvg)}</td>
                  <td className="p-2.5 text-right text-text-secondary">{r.experience ?? '-'}</td>
                  <td className="p-2.5 text-center">{r.personalized ? '✓' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ingredient Tree Drawer — on-demand, never bulk */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg bg-bg-surface-1 border-l border-border-subtle shadow-2xl flex flex-col max-h-screen">
            <div className="flex items-center justify-between p-4 border-b border-border-subtle">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-text-primary">{selected.recipeName}</h2>
                <p className="text-[11px] font-mono text-text-muted">
                  {selected.category} • {selected.recipeSlug ? `/${selected.recipeSlug}` : "no slug"}
                  {selected.personalized && <span className="ml-2 text-emerald-400">✓ personalized</span>}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg hover:bg-bg-surface-2 text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {detailLoading && (
                <div className="space-y-3">
                  <div className="h-4 bg-bg-surface-2 rounded animate-pulse" />
                  <div className="h-20 bg-bg-surface-2 rounded animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-3 bg-bg-surface-2 rounded animate-pulse w-1/3" />
                    <div className="h-8 bg-bg-surface-2 rounded animate-pulse" />
                    <div className="h-8 bg-bg-surface-2 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
                    <Loader2 className="w-4 h-4 animate-spin" /> Fetching ingredient tree (stealth, 3–8s)...
                  </div>
                </div>
              )}

              {detailError && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
                  <div className="flex items-start gap-2 text-amber-200 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{detailError}</span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    This recipe’s breakdown hasn’t been cached yet. On-demand fetch uses the same stealth + 3–8s delay as the daily collector and aborts on Cloudflare block. Bulk fetching 854 recipes is disabled.
                  </p>
                  <button
                    onClick={() => {
                      setDetailError(null);
                      setDetailLoading(true);
                      const slug = selected.recipeSlug;
                      if (!slug) return;
                      const categoryParam = selected.category ? `?category=${encodeURIComponent(selected.category)}` : '';
                      fetch(`/api/crafting-recipes/${encodeURIComponent(slug)}/ingredients${categoryParam}`)
                        .then(async (res) => {
                          if (!res.ok) throw new Error((await res.json().catch(() => ({}))).hint || `HTTP ${res.status}`);
                          return res.json();
                        })
                        .then((data: RecipeDetail) => setDetail(data))
                        .catch((err: Error) => setDetailError(err.message))
                        .finally(() => setDetailLoading(false));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs font-mono hover:bg-amber-500/30"
                  >
                    Retry fetch
                  </button>
                </div>
              )}

              {detail && !detailLoading && (
                <div className="space-y-4">
                  {/* Batch + Summary — scaled from bdolytics precomputed (never recomputed locally) */}
                  {(() => {
                    const batch = Math.max(1, batchCount || 1);
                    const revenuePerCraft = detail.totalCost !== null && detail.profit !== null ? detail.totalCost + detail.profit : selected.price;
                    const totalRevenue = revenuePerCraft !== null ? revenuePerCraft * batch : null;
                    const totalCostBatch = detail.totalCost !== null ? detail.totalCost * batch : null;
                    // Compute missing cost from inventory
                    let totalMissingCost = 0;
                    let hasMissingPrice = false;
                    for (const ing of detail.ingredients) {
                      const owned = inventory[ing.name] ?? 0;
                      const totalReq = ing.quantity * batch;
                      const shortage = Math.max(0, totalReq - owned);
                      if (shortage > 0 && ing.unitPrice !== null) totalMissingCost += shortage * ing.unitPrice;
                      if (shortage > 0 && ing.unitPrice === null) hasMissingPrice = true;
                    }
                    const adjustedProfit = totalRevenue !== null ? totalRevenue - totalMissingCost : detail.profit !== null ? detail.profit * batch - totalMissingCost : null;
                    return (
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          <label className="text-xs font-mono text-text-muted">Batch / Crafts:</label>
                          <input
                            type="number"
                            min={1}
                            value={batchCount}
                            onChange={(e) => setBatchCount(Math.max(1, Number(e.target.value) || 1))}
                            className="w-24 px-2 py-1 bg-bg-surface-2 border border-border-subtle rounded text-xs font-mono text-text-primary"
                          />
                          <span className="text-[10px] text-text-muted">x{batch} crafts</span>
                          <button
                            onClick={() => setBatchCount(100)}
                            className="ml-2 text-[10px] font-mono px-2 py-1 rounded bg-bg-surface-2 border border-border-subtle text-text-muted hover:text-text-primary"
                          >
                            100
                          </button>
                          <button
                            onClick={() => setBatchCount(1000)}
                            className="text-[10px] font-mono px-2 py-1 rounded bg-bg-surface-2 border border-border-subtle text-text-muted hover:text-text-primary"
                          >
                            1000
                          </button>
                          <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="ml-auto flex items-center gap-1 px-2 py-1 rounded bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] font-mono hover:bg-blue-500/25 disabled:opacity-50"
                            title="Sync inventory from Google Sheet (overwrite)"
                          >
                            {syncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CloudDownload className="w-3 h-3" />}
                            Sync
                          </button>
                        </div>
                        {syncMsg && (
                          <div className={`text-[11px] font-mono ${syncMsg.tone === "ok" ? "text-emerald-400" : "text-rose-400"}`}>
                            {syncMsg.text}
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                          <div className="bg-bg-surface-2 border border-border-subtle rounded-lg p-2.5 text-center">
                            <div className="text-[10px] text-text-muted uppercase">Crafting Cost x{batch}</div>
                            <div className="font-bold text-text-primary">{totalCostBatch !== null ? fmtSilver(totalCostBatch) : "-"}</div>
                          </div>
                          <div className="bg-bg-surface-2 border border-border-subtle rounded-lg p-2.5 text-center">
                            <div className="text-[10px] text-text-muted uppercase">Revenue x{batch}</div>
                            <div className="font-bold text-amber-300">{totalRevenue !== null ? fmtSilver(totalRevenue) : "-"}</div>
                          </div>
                          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2.5 text-center">
                            <div className="text-[10px] text-emerald-400 uppercase">Adj. Profit x{batch}</div>
                            <div className="font-bold text-emerald-400">{adjustedProfit !== null ? fmtSilver(adjustedProfit) : "-"}</div>
                            <div className="text-[9px] text-text-muted">out-of-pocket {fmtSilver(totalMissingCost)}{hasMissingPrice ? "*" : ""}</div>
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-text-muted -mt-2">
                          Silver/Hour (bdolytics): {detail.profitPerHour !== null ? fmtSilver(detail.profitPerHour) : fmtSilver(selected.profitPerHour)} {hasMissingPrice && "* some missing prices unknown"}
                        </div>
                      </>
                    );
                  })()}

                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-text-primary">Ingredients — Shortage Calculator</h3>
                    {detail.ingredients.length === 0 ? (
                      <p className="text-xs text-text-muted">No ingredient data — detail page may have changed. Try re-running the on-demand scraper.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {detail.ingredients.map((ing, idx) => {
                          const owned = inventory[ing.name] ?? 0;
                          const totalReq = ing.quantity * Math.max(1, batchCount || 1);
                          const shortage = Math.max(0, totalReq - owned);
                          const missingCost = ing.unitPrice !== null ? shortage * ing.unitPrice : null;
                          const advice = getProcurementAdvice(ing.name);
                          return (
                            <div key={`${ing.name}-${idx}`} className="p-2.5 rounded-lg bg-bg-surface-2 border border-border-subtle space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <div className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                                    {ing.name}
                                    {ing.isSubRecipe && <span className="text-[10px] px-1 py-0.5 rounded bg-brand-primary/15 border border-brand-primary/30 text-brand-primary">sub-recipe</span>}
                                  </div>
                                  <div className="text-[11px] font-mono text-text-muted">
                                    x{ing.quantity} per craft • {fmtSilver(ing.unitPrice)} each • total {fmtSilver(ing.totalCost)}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs font-mono font-bold text-amber-300">
                                    {ing.totalCost !== null ? fmtSilver(ing.totalCost) : "-"}
                                  </div>
                                  {ing.subRecipeSlug && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const sub = recipes.find((r) => r.recipeSlug === ing.subRecipeSlug);
                                        if (sub) setSelected(sub);
                                      }}
                                      className="text-[10px] font-mono text-brand-primary hover:underline"
                                    >
                                      view sub-recipe
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-4 gap-1.5 text-[11px] font-mono">
                                <div className="bg-bg-surface-3 border border-border-subtle rounded p-1.5 text-center">
                                  <div className="text-[9px] text-text-muted uppercase">Need x{Math.max(1, batchCount || 1)}</div>
                                  <div className="font-bold text-text-primary">{totalReq.toLocaleString()}</div>
                                </div>
                                <div className="bg-bg-surface-3 border border-border-subtle rounded p-1.5 text-center">
                                  <div className="text-[9px] text-text-muted uppercase">In Stock</div>
                                  <input
                                    type="number"
                                    min={0}
                                    value={owned === 0 ? "" : owned}
                                    placeholder="0"
                                    onChange={(e) => {
                                      const v = e.target.value === "" ? 0 : Math.max(0, Number(e.target.value) || 0);
                                      setInventory((prev) => ({ ...prev, [ing.name]: v }));
                                    }}
                                    className="w-full mt-1 px-1 py-0.5 bg-bg-surface-1 border border-border-subtle rounded text-center text-xs font-mono"
                                  />
                                </div>
                                <div className={`border rounded p-1.5 text-center ${shortage > 0 ? "bg-amber-500/10 border-amber-500/30" : "bg-emerald-500/10 border-emerald-500/30"}`}>
                                  <div className="text-[9px] text-text-muted uppercase">Shortage</div>
                                  <div className={`font-bold ${shortage > 0 ? "text-amber-300" : "text-emerald-400"}`}>{shortage.toLocaleString()}</div>
                                </div>
                                <div className="bg-bg-surface-3 border border-border-subtle rounded p-1.5 text-center">
                                  <div className="text-[9px] text-text-muted uppercase">Missing Cost</div>
                                  <div className="font-bold text-text-primary">{missingCost !== null ? fmtSilver(missingCost) : "-"}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                                    advice.icon === "market"
                                      ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                                      : advice.icon === "gather"
                                      ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                  }`}
                                  title={advice.tooltip}
                                >
                                  {advice.icon === "market" ? <ShoppingCart className="w-3 h-3" /> : advice.icon === "gather" ? <Pickaxe className="w-3 h-3" /> : <Wheat className="w-3 h-3" />}
                                  {advice.label === "Market Buy" ? "🛒 Market Buy" : advice.label === "Gather" ? "⛏️ Gather" : "🌾 Worker Node"}
                                </span>
                                {advice.tooltip && <span className="text-[10px] text-text-muted">{advice.tooltip}</span>}
                                {ing.isSubRecipe && <span className="ml-auto text-[10px] text-text-muted"><Package className="w-3 h-3 inline" /> sub-recipe</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] font-mono text-text-muted border-t border-border-subtle pt-2">
                    Source: bdolytics precomputed • {new Date(detail.collectedAt).toLocaleString()} • {detail.source} • batch {Math.max(1, batchCount || 1)} • owned shared via {INVENTORY_KEY}
                  </div>
                </div>
              )}

              {!detail && !detailLoading && !detailError && selected.recipeSlug && (
                <div className="text-xs text-text-muted">No data yet — fetching…</div>
              )}
            </div>

            <div className="p-3 border-t border-border-subtle bg-bg-surface-2/50 flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="px-3 py-1.5 rounded-lg bg-bg-surface-3 border border-border-subtle text-xs font-mono text-text-primary hover:bg-bg-surface-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
