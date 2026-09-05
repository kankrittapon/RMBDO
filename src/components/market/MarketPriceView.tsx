'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Coins, Search, ShoppingCart, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketItem {
  itemName: string;
  category: string | null;
  price: number | null;
  volume14dAvg: number | null;
  stock: number | null;
  iconUrl: string | null;
  collectedAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  material: 'วัตถุดิบ (Material)',
  'alchemy-stone': 'หินแปรธาตุ (Alchemy Stone)',
  'magic-crystal': 'อัญมณีเวทมนตร์ (Magic Crystal)',
  lightstone: 'หินแปรธาตุ (Lightstone)',
  enhancement: 'วัสดุตีบวก (Enhancement)',
};

const fmtSilver = (n: number | null) => (n === null ? '-' : n.toLocaleString('en-US'));

// Central Market price browser + a running "shopping list" so a user can
// compare the total buy cost of the materials a recipe/quest/checklist
// needs against farming them - the actual farm-vs-buy verdict is left to
// the player's own judgement of how long farming would take, since RMBDO
// doesn't track a personal silver/hour rate to compute that automatically
// yet (see docs/audit-and-plan for why that's deferred, not guessed).
export const MarketPriceView: React.FC = () => {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const q = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : '';
    fetch(`/api/market-items${q}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: { items?: MarketItem[] }) => setItems(data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [search]);

  const cartTotal = useMemo(() => {
    return Object.entries(cart).reduce((sum, [name, qty]) => {
      const item = items.find((i) => i.itemName === name);
      return sum + (item?.price ?? 0) * qty;
    }, 0);
  }, [cart, items]);

  const cartEntries = Object.entries(cart).filter(([, qty]) => qty > 0);

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      {/* Header */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-brand-primary font-mono text-xs uppercase tracking-wider">
          <Coins className="w-4 h-4" />
          <span>ตลาดกลาง (Central Market) — Southeast Asia</span>
        </div>
        <h1 className="text-lg md:text-xl font-heading font-bold text-text-primary">
          เปรียบเทียบราคา & รายการซื้อ (Buy vs Farm Helper)
        </h1>
        <p className="text-xs text-text-secondary">
          ราคาจริงจากตลาดกลาง (อัปเดตล่าสุดตามรอบ collector) — เพิ่มจำนวนที่ต้องใช้ในรายการซื้อเพื่อดูราคารวม แล้วเทียบกับเวลาที่คุณคิดว่าต้องใช้ฟาร์มเอง
        </p>
        <div className="relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อไอเทม..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-bg-surface-3 border border-border-subtle rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:border-brand-primary outline-none font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Price table */}
        <div className="lg:col-span-8 bg-bg-surface-1 border border-border-subtle rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="bg-bg-surface-2 text-text-muted">
                <tr>
                  <th className="text-left p-2.5">ชื่อไอเทม</th>
                  <th className="text-left p-2.5">หมวด</th>
                  <th className="text-right p-2.5">ราคา (Silver)</th>
                  <th className="text-right p-2.5">Volume 14d</th>
                  <th className="text-center p-2.5">จำนวนที่ต้องการ</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={5} className="p-4 text-center text-text-muted">กำลังโหลด...</td></tr>
                )}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={5} className="p-4 text-center text-text-muted">ไม่มีข้อมูล - รัน `npm run collect:market` แล้ว `npm run normalize` ก่อน</td></tr>
                )}
                {items.map((item) => (
                  <tr key={item.itemName} className="border-t border-border-subtle/60 hover:bg-bg-surface-2/60">
                    <td className="p-2.5 text-text-primary font-bold">
                      <div className="flex items-center gap-2">
                        {item.iconUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.iconUrl} alt="" className="w-6 h-6 rounded shrink-0 bg-bg-surface-3" loading="lazy" />
                        )}
                        <span>{item.itemName}</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-text-muted">{item.category ? CATEGORY_LABELS[item.category] ?? item.category : '-'}</td>
                    <td className="p-2.5 text-right text-amber-300">{fmtSilver(item.price)}</td>
                    <td className="p-2.5 text-right text-text-secondary">{fmtSilver(item.volume14dAvg)}</td>
                    <td className="p-2.5">
                      <input
                        type="number"
                        min={0}
                        value={cart[item.itemName] ?? ''}
                        onChange={(e) =>
                          setCart((prev) => ({ ...prev, [item.itemName]: Math.max(0, Number(e.target.value) || 0) }))
                        }
                        placeholder="0"
                        className="w-20 mx-auto block px-2 py-1 rounded bg-bg-surface-3 border border-border-subtle text-center text-text-primary"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shopping list / cart */}
        <div className="lg:col-span-4 bg-bg-surface-1 border border-border-subtle rounded-xl p-4 space-y-3 sticky top-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
              <ShoppingCart className="w-4 h-4 text-brand-primary" />
              <span>รายการซื้อ (Shopping List)</span>
            </div>
            {cartEntries.length > 0 && (
              <button
                onClick={() => setCart({})}
                className="flex items-center gap-1 px-2 py-1 rounded bg-bg-surface-3 hover:bg-bg-surface-2 text-[10px] text-text-muted hover:text-red-400 border border-border-subtle"
              >
                <RotateCcw className="w-3 h-3" /> ล้าง
              </button>
            )}
          </div>

          {cartEntries.length === 0 ? (
            <p className="text-[11px] text-text-muted">ใส่จำนวนในตารางด้านซ้ายเพื่อเริ่มรายการซื้อ</p>
          ) : (
            <div className="space-y-1.5 text-[11px] font-mono">
              {cartEntries.map(([name, qty]) => {
                const item = items.find((i) => i.itemName === name);
                const subtotal = (item?.price ?? 0) * qty;
                return (
                  <div key={name} className="flex items-center justify-between p-1.5 rounded bg-bg-surface-2">
                    <span className="text-text-secondary truncate">{name} x{qty}</span>
                    <span className="text-amber-300 shrink-0">{fmtSilver(subtotal)}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary">รวมทั้งหมด:</span>
            <span className="text-sm font-bold text-brand-gold font-mono">{fmtSilver(cartTotal)} Silver</span>
          </div>

          <p className="text-[10px] text-text-muted leading-relaxed pt-1 border-t border-border-subtle/60">
            💡 เทียบราคารวมนี้กับเวลาที่ต้องใช้ฟาร์มเองคูณกับซิลเวอร์/ชั่วโมงที่คุณทำได้จริง — ถ้าซื้อถูกกว่า (คิดเป็นเวลา) ให้ซื้อ ถ้าแพงกว่ามากให้ฟาร์มเอง (ระบบยังไม่คำนวณอัตโนมัติเพราะยังไม่ track silver/hour ส่วนตัวของคุณ)
          </p>
        </div>
      </div>
    </div>
  );
};
