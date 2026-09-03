'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChefHat, Search, TrendingUp, Info, Sparkles, Settings2, Save, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CraftingRecipe {
  recipeName: string;
  category: string;
  profitPerHour: number | null;
  price: number | null;
  volume14dAvg: number | null;
  experience: string | null;
  personalized: boolean;
  collectedAt: string;
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
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary/15 border border-brand-primary/40 text-text-primary text-xs font-mono font-bold hover:bg-brand-primary/25 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'กำลังบันทึก...' : 'บันทึก Mastery'}
          </button>
          {savedJustNow && (
            <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" /> บันทึกแล้ว
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
                <tr key={`${r.category}-${r.recipeName}`} className="border-t border-border-subtle/60 hover:bg-bg-surface-2/60">
                  <td className="p-2.5 text-text-primary font-bold">{r.recipeName}</td>
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
    </div>
  );
};
