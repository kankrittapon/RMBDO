'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChefHat, Search, TrendingUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CraftingRecipe {
  recipeName: string;
  category: string;
  profitPerHour: number | null;
  price: number | null;
  volume14dAvg: number | null;
  experience: string | null;
  collectedAt: string;
}

const CATEGORIES = ['Cooking', 'Alchemy', 'Processing', 'Imperial Crates'] as const;

const fmtSilver = (n: number | null) => (n === null ? '-' : n.toLocaleString('en-US'));

// Life Skill "ควรทำอะไรตอนนี้" ranking - Silver/Hour is scraped directly
// from bdolytics' own Crafting Calculator, not recomputed here (that needs
// BDO's unpublished mastery-speed / success-rate / market-tax formulas).
// It reflects bdolytics' DEFAULT settings (~1000-1500 mastery, no personal
// buffs), not this player's own mastery - a general ranking, not a
// personalized one. See README "Known gaps".
export const CraftingProfitView: React.FC = () => {
  const [recipes, setRecipes] = useState<CraftingRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');

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

  const topByCategory = useMemo(() => {
    const map = new Map<string, CraftingRecipe>();
    for (const r of recipes) {
      if (!map.has(r.category) && r.profitPerHour !== null) map.set(r.category, r);
    }
    return map;
  }, [recipes]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider">
          <ChefHat className="w-4 h-4" />
          <span>Crafting Profit Ranking — Southeast Asia</span>
        </div>
        <h1 className="text-lg md:text-xl font-heading font-bold text-text-primary">
          Buy-vs-Farm สำหรับ Life Skill (Cooking / Alchemy / Processing / Imperial Crates)
        </h1>
        <p className="text-xs text-text-secondary">
          จัดอันดับ Silver/Hour ของสูตรทำ/แปรรูปทั้งหมด — ดึงมาจากตัวเลขที่ bdolytics.com คำนวณไว้แล้วโดยตรง (ไม่ได้คิดสูตรเอง)
        </p>
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            ตัวเลข Silver/Hour นี้คำนวณด้วย <b>ค่าเริ่มต้นของ bdolytics</b> (mastery ~1000-1500, ไม่มีบัฟส่วนตัว)
            ไม่ใช่ mastery จริงของคุณ — ใช้เป็น "อันดับเปรียบเทียบ" ว่าสูตรไหนน่าทำกว่ากันโดยรวม ไม่ใช่ตัวเลขที่คุณจะได้จริงเป๊ะๆ
          </span>
        </div>
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
      </div>

      {topByCategory.size > 0 && !search && !category && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {CATEGORIES.map((c) => {
            const top = topByCategory.get(c);
            return (
              <div key={c} className="bg-bg-surface-1 border border-border-subtle rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-mono text-text-muted uppercase">{c} อันดับ 1</span>
                {top ? (
                  <>
                    <p className="text-xs font-bold text-text-primary truncate">{top.recipeName}</p>
                    <p className="text-sm font-mono font-bold text-emerald-400">{fmtSilver(top.profitPerHour)} /ชม.</p>
                  </>
                ) : (
                  <p className="text-[11px] text-text-muted">ไม่มีข้อมูล</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl overflow-hidden">
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
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="p-4 text-center text-text-muted">กำลังโหลด...</td></tr>
              )}
              {!loading && recipes.length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center text-text-muted">ไม่มีข้อมูล - รัน `npm run collect:crafting` แล้ว `npm run normalize` ก่อน</td></tr>
              )}
              {recipes.map((r) => (
                <tr key={`${r.category}-${r.recipeName}`} className="border-t border-border-subtle/60 hover:bg-bg-surface-2/60">
                  <td className="p-2.5 text-text-primary font-bold">{r.recipeName}</td>
                  <td className="p-2.5 text-text-muted">{r.category}</td>
                  <td className="p-2.5 text-right text-emerald-400 font-bold">{fmtSilver(r.profitPerHour)}</td>
                  <td className="p-2.5 text-right text-amber-300">{fmtSilver(r.price)}</td>
                  <td className="p-2.5 text-right text-text-secondary">{fmtSilver(r.volume14dAvg)}</td>
                  <td className="p-2.5 text-right text-text-secondary">{r.experience ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
