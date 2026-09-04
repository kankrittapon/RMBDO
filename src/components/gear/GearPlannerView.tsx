'use client';

import React, { useMemo, useState } from 'react';
import {
  Shield,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Coins,
  Sparkles,
  CheckCircle2,
  Filter,
  RotateCcw,
  Info,
  Pencil
} from 'lucide-react';
import { initialGearSlots, GearSlotItem } from '@/data/gear/gearSlots';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { GearSlotStatus } from '@/types/profile';
import { cn } from '@/lib/utils';

interface GearPlannerViewProps {
  store: ReturnType<typeof useRoadmapStore>;
}

const PRIORITY_ORDER: Record<GearSlotItem['priority'], number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3
};

const STATUS_LABEL: Record<GearSlotStatus, string> = {
  OWNED: 'มีแล้ว',
  IN_PROGRESS: 'กำลังทำ',
  NONE: 'ไม่มี',
  UNKNOWN: 'ไม่แน่ใจ'
};

export const GearPlannerView: React.FC<GearPlannerViewProps> = ({ store }) => {
  const { profile, setGearSlot, resetCategory, updateStats } = store;
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortByPriority, setSortByPriority] = useState(true);
  const [editingStats, setEditingStats] = useState(false);
  const [apInput, setApInput] = useState(String(profile.stats.ap ?? ''));
  const [aapInput, setAapInput] = useState(String(profile.stats.aap ?? ''));
  const [dpInput, setDpInput] = useState(String(profile.stats.dp ?? ''));

  const categories = [
    { id: 'ALL', label: 'ทั้งหมด (All Slots)' },
    { id: 'WEAPON', label: 'อาวุธ (Weapons)' },
    { id: 'ARMOR', label: 'ชุดเกราะ (Armors)' },
    { id: 'ACCESSORY', label: 'เครื่องประดับ (Accessories)' },
    { id: 'SPECIAL', label: 'พิเศษ (Special)' }
  ];

  const filteredGear = useMemo(() => {
    const list = initialGearSlots.filter((item) => {
      if (selectedCategory === 'ALL') return true;
      return item.category === selectedCategory;
    });
    if (!sortByPriority) return list;
    return [...list].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }, [selectedCategory, sortByPriority]);

  const statusCounts = useMemo(() => {
    const counts: Record<GearSlotStatus, number> = { OWNED: 0, IN_PROGRESS: 0, NONE: 0, UNKNOWN: 0 };
    for (const gear of initialGearSlots) {
      const s = profile.gear[gear.id]?.status ?? 'UNKNOWN';
      counts[s]++;
    }
    return counts;
  }, [profile.gear]);

  const totalSlots = initialGearSlots.length;
  const ownedPct = Math.round((statusCounts.OWNED / totalSlots) * 100);

  const saveStats = () => {
    const ap = apInput === '' ? null : Number(apInput);
    const aap = aapInput === '' ? null : Number(aapInput);
    const dp = dpInput === '' ? null : Number(dpInput);
    updateStats({
      ap,
      aap,
      dp,
      gearScore: ap !== null && dp !== null ? Math.max(ap, aap ?? ap) + dp : profile.stats.gearScore
    });
    setEditingStats(false);
  };

  const getStatusButton = (slotId: string, currentStatus: GearSlotStatus, status: GearSlotStatus, label: string) => {
    const isActive = currentStatus === status;
    return (
      <button
        key={status}
        onClick={() => setGearSlot(slotId, { status })}
        className={cn(
          "px-2 py-0.5 rounded text-[10px] font-mono transition-colors",
          isActive
            ? status === 'OWNED'
              ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40"
              : status === 'IN_PROGRESS'
              ? "bg-blue-500/20 text-blue-400 font-bold border border-blue-500/40"
              : status === 'NONE'
              ? "bg-red-500/20 text-red-400 font-bold border border-red-500/40"
              : "bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40"
            : "bg-bg-surface-3 text-text-muted hover:text-text-secondary"
        )}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">

      {/* Header Banner */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
          <div>
            <div className="flex items-center gap-2 text-brand-primary font-mono text-xs uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4 text-brand-primary" />
              <span>ระบบตรวจสอบและวางแผนอุปกรณ์ (Gear Inventory & Upgrade Planner)</span>
            </div>
            <h1 className="text-lg md:text-xl font-heading font-bold text-text-primary">
              ผังอุปกรณ์ 14 ช่อง & ตารางเปรียบเทียบการอัปเกรด
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              ระบุสถานะอุปกรณ์จริงที่คุณสวมใส่อยู่ (มีแล้ว / กำลังทำ / ไม่มี / ไม่แน่ใจ) เพื่อคำนวณสเตตัส AP/DP ที่จะได้รับ
            </p>
          </div>

          <button
            onClick={() => resetCategory('GEAR')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bg-surface-3 hover:bg-bg-surface-2 text-xs font-mono text-text-muted hover:text-red-400 border border-border-subtle transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ตอุปกรณ์ทั้งหมด</span>
          </button>
        </div>

        {/* Your actual GS summary - editable, and the progress bar is
            computed live from your own status toggles below (not from the
            static reference table, which is illustrative - see the note
            further down). */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-bg-surface-2 border border-border-subtle rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-text-muted uppercase">สเตตัสจริงของคุณ</span>
              <button
                onClick={() => (editingStats ? saveStats() : setEditingStats(true))}
                className="flex items-center gap-1 text-[10px] font-mono text-brand-primary hover:text-brand-primary/80"
              >
                <Pencil className="w-3 h-3" />
                {editingStats ? 'บันทึก' : 'แก้ไข'}
              </button>
            </div>
            {editingStats ? (
              <div className="grid grid-cols-3 gap-1.5">
                <input
                  type="number"
                  value={apInput}
                  onChange={(e) => setApInput(e.target.value)}
                  placeholder="AP"
                  className="px-2 py-1 bg-bg-surface-3 border border-border-subtle rounded text-xs text-center font-mono"
                />
                <input
                  type="number"
                  value={aapInput}
                  onChange={(e) => setAapInput(e.target.value)}
                  placeholder="AAP"
                  className="px-2 py-1 bg-bg-surface-3 border border-border-subtle rounded text-xs text-center font-mono"
                />
                <input
                  type="number"
                  value={dpInput}
                  onChange={(e) => setDpInput(e.target.value)}
                  placeholder="DP"
                  className="px-2 py-1 bg-bg-surface-3 border border-border-subtle rounded text-xs text-center font-mono"
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 font-mono text-sm">
                <span><span className="text-text-muted text-[10px] block">AP</span><span className="text-amber-300 font-bold">{profile.stats.ap ?? '-'}</span></span>
                <span><span className="text-text-muted text-[10px] block">AAP</span><span className="text-amber-300 font-bold">{profile.stats.aap ?? '-'}</span></span>
                <span><span className="text-text-muted text-[10px] block">DP</span><span className="text-emerald-400 font-bold">{profile.stats.dp ?? '-'}</span></span>
                <span className="ml-auto"><span className="text-text-muted text-[10px] block">GS</span><span className="text-brand-gold font-bold">{profile.stats.gearScore ?? '-'}</span></span>
              </div>
            )}
          </div>

          <div className="bg-bg-surface-2 border border-border-subtle rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-text-muted uppercase">ความคืบหน้าช่องอุปกรณ์</span>
              <span className="text-text-primary font-bold">{statusCounts.OWNED}/{totalSlots} มีแล้ว</span>
            </div>
            <div className="w-full bg-bg-surface-3 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${ownedPct}%` }} />
            </div>
            <div className="flex gap-3 text-[10px] font-mono text-text-muted">
              <span>กำลังทำ: {statusCounts.IN_PROGRESS}</span>
              <span>ไม่มี: {statusCounts.NONE}</span>
              <span>ไม่แน่ใจ: {statusCounts.UNKNOWN}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            คอลัมน์ &quot;ไอเทมปัจจุบัน&quot; ในตารางด้านล่างเป็น<b>ตัวอย่างเส้นทางอัปเกรดระดับสูง</b> (ยังไม่ verify กับแพทช์ล่าสุด)
            ไม่ใช่เกียร์จริงของคุณ — ใช้คอลัมน์ &quot;สถานะจริงในบัญชีของคุณ&quot; ทางขวาเพื่อบันทึกของจริง และใช้การ์ด &quot;สเตตัสจริงของคุณ&quot; ด้านบนสำหรับ AP/DP/GS ที่แม่นยำ
          </span>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
          <button
            onClick={() => setSortByPriority((v) => !v)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded text-[11px] shrink-0 border transition-colors",
              sortByPriority ? "bg-brand-gold/15 border-brand-gold/40 text-brand-gold font-bold" : "bg-bg-surface-3 border-transparent text-text-muted hover:text-text-primary"
            )}
          >
            <Filter className="w-3 h-3" />
            เรียงตามความสำคัญ
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-2.5 py-1 rounded text-[11px] shrink-0 transition-colors",
                selectedCategory === cat.id
                  ? "bg-brand-primary text-white font-bold"
                  : "bg-bg-surface-2 text-text-muted hover:text-text-primary"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* High-Density Gear Table */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-bg-surface-2/90 border-b border-border-subtle font-mono text-[11px] text-text-muted uppercase tracking-wider">
                <th className="py-2.5 px-3">ช่องอุปกรณ์ (Slot)</th>
                <th className="py-2.5 px-3">ไอเทมปัจจุบัน</th>
                <th className="py-2.5 px-3">เป้าหมายขั้นถัดไป (Target)</th>
                <th className="py-2.5 px-3 text-center">AP/DP เพิ่มขึ้น</th>
                <th className="py-2.5 px-3">งบประมาณ & แหล่งที่มา</th>
                <th className="py-2.5 px-3 text-center">สถานะจริงในบัญชีของคุณ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60 font-mono">
              {filteredGear.map((gear) => {
                const playerSlot = profile.gear[gear.id] || { status: 'UNKNOWN' };
                const apGain = gear.targetAP > 0 ? gear.targetAP - gear.currentAP : 0;
                const dpGain = gear.targetDP > 0 ? gear.targetDP - gear.currentDP : 0;

                return (
                  <tr key={gear.id} className="hover:bg-bg-surface-2/70 transition-colors">
                    {/* Slot */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-text-primary text-xs">{gear.slotName}</div>
                      <span className="text-[10px] text-text-muted">{gear.category}</span>
                    </td>

                    {/* Current */}
                    <td className="py-2.5 px-3">
                      <div className="text-text-secondary font-sans text-xs font-medium">{gear.currentName}</div>
                      <div className="text-[10px] text-text-muted">
                        {gear.currentAP > 0 && <span className="text-amber-400 mr-2">AP: {gear.currentAP}</span>}
                        {gear.currentDP > 0 && <span className="text-emerald-400">DP: {gear.currentDP}</span>}
                      </div>
                    </td>

                    {/* Target */}
                    <td className="py-2.5 px-3">
                      <div className="text-brand-gold font-sans font-medium text-xs">{gear.targetName}</div>
                      <div className="text-[10px] text-text-muted">
                        เป้าหมาย: <span className="text-text-primary font-bold">{gear.targetEnhancement}</span> (Endgame: {gear.endTargetEnhancement})
                      </div>
                      {gear.safetyNote && (
                        <div className="text-[10px] text-red-400 font-sans italic mt-0.5">
                          ⚠️ {gear.safetyNote}
                        </div>
                      )}
                    </td>

                    {/* Gain */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex flex-col items-center justify-center gap-0.5 text-xs font-bold">
                        {apGain > 0 && <span className="text-amber-400">+{apGain} AP</span>}
                        {dpGain > 0 && <span className="text-emerald-400">+{dpGain} DP</span>}
                        {apGain === 0 && dpGain === 0 && <span className="text-text-muted">-</span>}
                      </div>
                    </td>

                    {/* Cost & Source */}
                    <td className="py-2.5 px-3 max-w-[200px]">
                      <div className="text-text-primary text-xs truncate">{gear.estimatedCost}</div>
                      <div className="text-[10px] text-text-muted truncate font-sans">{gear.source}</div>
                    </td>

                    {/* Status Toggles */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {getStatusButton(gear.id, playerSlot.status, 'OWNED', 'มีแล้ว')}
                        {getStatusButton(gear.id, playerSlot.status, 'IN_PROGRESS', 'กำลังทำ')}
                        {getStatusButton(gear.id, playerSlot.status, 'NONE', 'ไม่มี')}
                        {getStatusButton(gear.id, playerSlot.status, 'UNKNOWN', 'ไม่แน่ใจ')}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
