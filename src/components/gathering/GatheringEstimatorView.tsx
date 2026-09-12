'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Shovel, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { gatheringRoutes } from '@/data/gathering/routes';
import type { GatheringBracket } from '@/lib/db/queries';

const STORAGE_KEY = 'rmbdo_gathering_est_v1';

const fmt = (n: number | null) =>
  n === null ? '—' : Math.round(n).toLocaleString('en-US');
const fmt1 = (n: number) =>
  n.toLocaleString('en-US', { maximumFractionDigits: 1 });

interface EstInputs {
  routeId: string;
  mastery: string;
  energy: string;
  pace: string;
  hours: string;
  agris: boolean;
  yieldMult: string;
  priceOverride: string;
}

const DEFAULTS: EstInputs = {
  routeId: 'deer-cyclops',
  mastery: '1500',
  energy: '350',
  pace: '8.2',
  hours: '1',
  agris: false,
  yieldMult: '1',
  priceOverride: '',
};

function loadInputs(): EstInputs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

export const GatheringEstimatorView: React.FC = () => {
  const [inputs, setInputs] = useState<EstInputs>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [brackets, setBrackets] = useState<GatheringBracket[]>([]);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [rarePrices, setRarePrices] = useState<Record<string, number>>({});

  useEffect(() => {
    setInputs(loadInputs());
    setHydrated(true);
    fetch('/api/gathering-brackets', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: { brackets?: GatheringBracket[] }) => {
        if (Array.isArray(data.brackets)) setBrackets(data.brackets);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    } catch {}
  }, [inputs, hydrated]);

  const route = gatheringRoutes.find((r) => r.id === inputs.routeId) ?? gatheringRoutes[0];

  // Live prices: route meat + each rare (display only, editable override).
  // Re-fetches when the route changes; meat price key follows the route.
  const meatName = route.id === 'scorpion-valencia' ? 'Scorpion Meat' : 'Deer Meat';
  useEffect(() => {
    let cancelled = false;
    setLivePrice(null);
    fetch(`/api/market-items?q=${encodeURIComponent(meatName)}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: { items?: Array<{ itemName: string; price: number | null }> }) => {
        if (cancelled) return;
        const hit = (data.items ?? []).find((i) => i.itemName.toLowerCase() === meatName.toLowerCase());
        if (hit?.price !== null && hit?.price !== undefined) setLivePrice(Number(hit.price));
      })
      .catch(() => {});
    Promise.all(
      route.rares.map((r) =>
        fetch(`/api/market-items?q=${encodeURIComponent(r.name)}`, { cache: 'no-store' })
          .then((res) => res.json())
          .then((data: { items?: Array<{ itemName: string; price: number | null }> }) => ({
            name: r.name,
            price: (() => {
              const hit = (data.items ?? []).find((i) => i.itemName.toLowerCase() === r.name.toLowerCase());
              return hit?.price !== null && hit?.price !== undefined ? Number(hit.price) : null;
            })(),
          }))
          .catch(() => ({ name: r.name, price: null as number | null })),
      ),
    ).then((rows) => {
      if (cancelled) return;
      const map: Record<string, number> = {};
      for (const row of rows) if (row.price !== null) map[row.name] = row.price;
      setRarePrices(map);
    });
    return () => {
      cancelled = true;
    };
  }, [route, meatName]);

  const set = (key: keyof EstInputs, value: string | boolean) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const calc = useMemo(() => {
    const mastery = Math.max(0, Number(inputs.mastery) || 0);
    const energy = Math.max(0, Number(inputs.energy) || 0);
    const pace = Math.max(0, Number(inputs.pace) || 0);
    const hours = Math.max(0, Number(inputs.hours) || 0);
    const ymult = Math.max(0, Number(inputs.yieldMult) || 0);
    // Bracket thresholds: mastery 2549 uses the 2500 row (floor to 50).
    const step = Math.min(3000, Math.floor(mastery / 50) * 50);
    const b = brackets.find((x) => x.mastery === step) ?? null;
    const byTime = pace * 60 * hours;
    const byEnergy = energy / route.energyCostPerAction;
    const actions = Math.floor(Math.min(byTime, byEnergy));
    const limiter = byEnergy <= byTime ? 'energy' : 'time';
    const meatPerHour =
      hours > 0 && b
        ? (actions * route.baseYieldPerAction * (1 + b.commonAmount) * ymult * (inputs.agris ? 1.1 : 1)) / hours
        : null;
    const meatPrice = inputs.priceOverride.trim() !== '' ? Number(inputs.priceOverride) || null : livePrice;
    const meatSilver = meatPerHour !== null && meatPrice !== null ? meatPerHour * meatPrice : null;
    const rareProcs = b ? actions * b.rareChance : null;
    const rareProcsPerHour = rareProcs !== null && hours > 0 ? rareProcs / hours : null;
    return { mastery, step, b, actions, limiter, byTime: Math.floor(byTime), byEnergy: Math.floor(byEnergy), meatPerHour, meatPrice, meatSilver, rareProcs, rareProcsPerHour };
  }, [inputs, brackets, route, livePrice]);

  const num = (label: string, value: string, onChange: (v: string) => void, hint?: string) => (
    <div>
      <label className="text-[10px] font-mono text-text-muted block">{label}</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-2.5 py-1.5 bg-bg-surface-3 border border-border-subtle rounded-lg text-xs text-text-primary font-mono"
      />
      {hint && <p className="text-[10px] text-text-muted mt-0.5">{hint}</p>}
    </div>
  );

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-16 md:pb-6">
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
          <Shovel className="w-4 h-4" />
          <span>Gathering Estimator</span>
        </div>
        <h1 className="text-lg md:text-xl font-heading font-bold text-text-primary">
          ประมาณการรวบรวม: ใส่เลขของคุณ ได้เลขประมาณพร้อมที่มา
        </h1>
        <p className="text-xs text-text-secondary leading-relaxed">
          ไม่มี ranking รวบรวมแบบ live ที่ไหนในโลก (yield ขึ้นกับมือ/rotation/energy ของแต่ละคน) —
          ที่นี่คำนวณจาก mastery bracket จริง × ราคาตลาด live ของเรา ทุกสมมติฐานเขียนไว้ข้างล่าง
        </p>
      </div>

      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {gatheringRoutes.map((r) => (
            <button
              key={r.id}
              onClick={() => set('routeId', r.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-mono border font-bold',
                route.id === r.id
                  ? 'bg-brand-primary/15 border-brand-primary/40 text-text-primary'
                  : 'bg-bg-surface-3 border-border-subtle text-text-muted hover:text-text-primary',
              )}
            >
              {r.name}
            </button>
          ))}
        </div>
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
          {route.name} @ {route.spot} ({route.tool})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {num('Gathering Mastery', inputs.mastery, (v) => set('mastery', v), 'เลขในโปรไฟล์ตัวละคร (bracket ปัดลงทีละ 50)')}
          {num('Energy ทั้งหมด', inputs.energy, (v) => set('energy', v), 'รวมพก energy potion แล้ว / ใช้ alt ก็บวกเพิ่ม')}
          {num('Actions/นาที', inputs.pace, (v) => set('pace', v), 'default 8.2 (west-games meat route) — วัดของตัวเองได้ยิ่งดี')}
          {num('ชั่วโมง', inputs.hours, (v) => set('hours', v))}
          {num('Yield multiplier', inputs.yieldMult, (v) => set('yieldMult', v), 'hedgehog/spot density — ดู hint เทียบ benchmark ข้างล่าง')}
          {num('ราคาเนื้อ (override)', inputs.priceOverride, (v) => set('priceOverride', v), livePrice !== null ? `live ตอนนี้ ${fmt(livePrice)} (ว่าง = ใช้ live)` : 'ยังโหลดราคา live ไม่ได้')}
        </div>
        <label className="flex items-center gap-2 text-xs text-text-primary cursor-pointer">
          <input
            type="checkbox"
            checked={inputs.agris}
            onChange={(e) => set('agris', e.target.checked)}
            className="w-4 h-4"
          />
          ใช้ Agris Fever (+10% วัตถุดิบดิบ, ของ rare ไม่ได้)
        </label>
      </div>

      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">ผลประมาณ</h3>
        {brackets.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Loader2 className="w-4 h-4 animate-spin" /> กำลังโหลดตาราง mastery...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
              <div className="bg-bg-surface-2 border border-border-subtle rounded-lg p-2.5 text-center">
                <div className="text-[10px] text-text-muted uppercase">Actions ที่ทำได้</div>
                <div className="font-bold text-text-primary text-base">{fmt(calc.actions)}</div>
                <div className="text-[10px] text-text-muted">
                  ตันที่ {calc.limiter === 'energy' ? 'energy' : 'เวลา'} ({fmt(calc.limiter === 'energy' ? calc.byEnergy : calc.byTime)})
                </div>
              </div>
              <div className="bg-bg-surface-2 border border-border-subtle rounded-lg p-2.5 text-center">
                <div className="text-[10px] text-text-muted uppercase">เนื้อ/ชม.</div>
                <div className="font-bold text-text-primary text-base">{calc.meatPerHour === null ? '—' : fmt1(calc.meatPerHour)}</div>
                <div className="text-[10px] text-text-muted">bracket {calc.step} (+{calc.b ? Math.round(calc.b.commonAmount * 100) : '?'}%)</div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2.5 text-center">
                <div className="text-[10px] text-emerald-400 uppercase">มูลค่าเนื้อ/ชม.</div>
                <div className="font-bold text-emerald-400 text-base">{calc.meatSilver === null ? '—' : fmt(calc.meatSilver)}</div>
                <div className="text-[10px] text-text-muted">@ {calc.meatPrice === null ? 'ไม่มีราคา' : fmt(calc.meatPrice)}</div>
              </div>
              <div className="bg-bg-surface-2 border border-border-subtle rounded-lg p-2.5 text-center">
                <div className="text-[10px] text-text-muted uppercase">Rare procs (ครั้ง)</div>
                <div className="font-bold text-text-primary text-base">{calc.rareProcsPerHour === null ? '—' : fmt1(calc.rareProcsPerHour)}/ชม.</div>
                <div className="text-[10px] text-text-muted">นับครั้ง ไม่ตีราคา (ดูตารางล่าง)</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-text-primary">ของ Rare: เช็คราคา live แล้วคูณเอง</h4>
              <div className="space-y-1.5">
                {route.rares.map((r) => (
                  <div key={r.name} className="flex items-center justify-between p-2 rounded-lg bg-bg-surface-2 border border-border-subtle text-xs">
                    <div>
                      <span className="font-bold text-text-primary">{r.name}</span>
                      <span className="ml-2 text-text-muted text-[11px]">{r.note}</span>
                    </div>
                    <span className="font-mono text-text-primary">
                      {rarePrices[r.name] !== undefined ? fmt(rarePrices[r.name]) : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-text-muted p-2 rounded-lg bg-bg-surface-2 border border-border-subtle">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {route.benchmark.meatPerHour > 0 ? (
              <p className="leading-relaxed">
                เทียบ benchmark: mastery {route.benchmark.mastery} ไม่ใช้ Agris ชุมชนวัดได้เนื้อ ~{fmt(route.benchmark.meatPerHour)}/ชม. รวม ~{fmt(route.benchmark.totalSilverPerHour[0])}–{fmt(route.benchmark.totalSilverPerHour[1])}/ชม. ({route.benchmark.source})
                — ถ้าเลขข้างบนห่างเยอะ ปรับ Yield multiplier (hedgehog + ความแน่นจุดต่างกัน) อย่าปรับ mastery หนีความจริง.
                สูตร: actions = min(energy ÷ {route.energyCostPerAction}, pace × 60 × ชม.) → เนื้อ = actions × {route.baseYieldPerAction} × (1 + bracket) × mult{inputs.agris ? ' × 1.1 (Agris)' : ''}.
                Rare ไม่ตีเป็นเงินให้เพราะสัดส่วนต่อชิ้นไม่มีแหล่งเชื่อถือได้ — RNG รายชั่วโมงแกว่งได้เสมอ.
              </p>
              ) : (
              <p className="leading-relaxed">
                ยังไม่มี benchmark ชุมชนสำหรับสายนี้ ({route.benchmark.source})
                — เลขข้างบนมาจากสูตร bracket × ราคา live ล้วนๆ เทียบกับสายกวางแล้วค่อยตัดสินใจ.
                สูตร: actions = min(energy ÷ {route.energyCostPerAction}, pace × 60 × ชม.) → เนื้อ = actions × {route.baseYieldPerAction} × (1 + bracket) × mult{inputs.agris ? ' × 1.1 (Agris)' : ''}.
              </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
