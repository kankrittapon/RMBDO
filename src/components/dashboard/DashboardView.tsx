'use client';

import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Gem,
  Package,
  Shield,
  ShieldAlert,
  Sparkles,
  Swords,
  Zap,
  HelpCircle,
  Wheat,
  RotateCcw
} from 'lucide-react';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { NavTabId } from '../layout/NavigationSidebar';
import { cn } from '@/lib/utils';

interface DashboardViewProps {
  onNavigate: (tab: NavTabId) => void;
  store: ReturnType<typeof useRoadmapStore>;
  onOpenSetup: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, store, onOpenSetup }) => {
  const { profile, currentPhase, nextActions, unverifiedAudits, progressStats } = store;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16 md:pb-6">
      
      {/* 🚀 Section 1: บัญชีของฉัน & สรุปเป้าหมายหลัก 10 วินาที */}
      <div className="bg-gradient-to-r from-bg-surface-1 via-bg-surface-2 to-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-48 h-48 bg-brand-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          
          {/* Left Column: ข้อมูลบัญชี & GS */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-border-subtle pb-3 lg:pb-0 lg:pr-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">
                บัญชีของฉัน (Account HUD)
              </span>
              <span className="text-[11px] text-text-muted font-mono">Asia / TH-SEA</span>
            </div>

            <h1 className="text-xl md:text-2xl font-heading font-bold text-text-primary tracking-tight">
              {profile.stats.characterClass}
            </h1>
            <p className="text-xs text-text-secondary">
              เป้าหมายปัจจุบัน: <span className="text-brand-gold font-bold">{currentPhase.name}</span>
            </p>

            {/* GS & Stats Pill Grid */}
            <div className="grid grid-cols-4 gap-1.5 pt-1 text-center font-mono">
              <div className="bg-bg-surface-3 p-1.5 rounded border border-border-subtle">
                <div className="text-[9px] text-text-muted">GS</div>
                <div className="text-xs font-bold text-brand-gold">
                  {profile.stats.isUnknownStats ? '?' : profile.stats.gearScore || 0}
                </div>
              </div>
              <div className="bg-bg-surface-3 p-1.5 rounded border border-border-subtle">
                <div className="text-[9px] text-amber-400">AP</div>
                <div className="text-xs font-bold text-amber-300">
                  {profile.stats.isUnknownStats ? '?' : profile.stats.ap || 0}
                </div>
              </div>
              <div className="bg-bg-surface-3 p-1.5 rounded border border-border-subtle">
                <div className="text-[9px] text-purple-400">AAP</div>
                <div className="text-xs font-bold text-purple-300">
                  {profile.stats.isUnknownStats ? '?' : profile.stats.aap || profile.stats.ap || 0}
                </div>
              </div>
              <div className="bg-bg-surface-3 p-1.5 rounded border border-border-subtle">
                <div className="text-[9px] text-emerald-400">DP</div>
                <div className="text-xs font-bold text-emerald-300">
                  {profile.stats.isUnknownStats ? '?' : profile.stats.dp || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: ขั้นปัจจุบัน & คำอธิบาย */}
          <div className="lg:col-span-5 space-y-2">
            <div className="bg-bg-surface-3/80 border border-brand-primary/30 rounded-lg p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-brand-primary font-bold">
                <Zap className="w-3.5 h-3.5 animate-pulse" />
                <span>ขั้นปัจจุบันที่คุณกำลังทำ:</span>
              </div>
              <p className="text-sm font-bold text-text-primary font-heading">
                {currentPhase.name}
              </p>
              <p className="text-xs text-text-secondary leading-relaxed">
                {currentPhase.desc}
              </p>
            </div>

            {/* Quick progress badges */}
            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
              <div className="p-1.5 rounded bg-bg-surface-3/60 border border-border-subtle text-center">
                <span className="text-[9px] text-text-muted block">ซีซั่น</span>
                <span className="font-bold text-emerald-400">{progressStats.season.pct}%</span>
              </div>
              <div className="p-1.5 rounded bg-bg-surface-3/60 border border-border-subtle text-center">
                <span className="text-[9px] text-text-muted block">Olvia ต่อสู้</span>
                <span className="font-bold text-blue-400">{progressStats.olviaCombat.pct}%</span>
              </div>
              <div className="p-1.5 rounded bg-bg-surface-3/60 border border-border-subtle text-center">
                <span className="text-[9px] text-text-muted block">Olvia Life</span>
                <span className="font-bold text-purple-400">{progressStats.olviaLife.pct}%</span>
              </div>
            </div>
          </div>

          {/* Right Column: ทางลัด & ตรวจสอบ */}
          <div className="lg:col-span-3 flex flex-col gap-2">
            {!profile.hasCompletedSetup && (
              <button
                onClick={onOpenSetup}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-brand-primary hover:bg-purple-600 text-white font-bold text-xs shadow-md transition-all group animate-bounce"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>เริ่มตั้งค่าเริ่มต้น (Setup)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            <button
              onClick={() => onNavigate('olvia_combat')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-bg-surface-3 hover:bg-bg-surface-2 border border-border-subtle text-text-primary text-xs transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Swords className="w-3.5 h-3.5 text-blue-400" />
                <span>Olvia Academy สายต่อสู้</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary" />
            </button>

            <button
              onClick={() => onNavigate('sovereign')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-bg-surface-3 hover:bg-bg-surface-2 border border-border-subtle text-text-primary text-xs transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-brand-gold" />
                <span>แท่นหลอมอาวุธราชัน</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary" />
            </button>

            <button
              onClick={() => onNavigate('safety')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-bg-surface-3 hover:bg-bg-surface-2 border border-border-subtle text-text-primary text-xs transition-colors group"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>เช็คความปลอดภัยไอเทม</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary" />
            </button>
          </div>

        </div>
      </div>

      {/* 🎯 Section 2: "ตอนนี้ผมควรทำอะไร?" (Next Actions Engine) */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-gold" />
            <h2 className="text-sm md:text-base font-heading font-bold text-text-primary">
              ตอนนี้ผมควรทำอะไรต่อ? (Next Recommended Actions)
            </h2>
          </div>
          <span className="text-[10px] font-mono text-text-muted">
            คำนวณจากสิ่งที่คุณเช็คแล้ว
          </span>
        </div>

        {nextActions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {nextActions.map((action, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-bg-surface-2 border border-border-subtle space-y-2 flex flex-col justify-between hover:border-border-active transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-brand-primary/20 text-brand-primary font-bold">
                      อันดับ #{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">{action.category}</span>
                  </div>
                  <h3 className="font-bold text-xs text-text-primary leading-snug">
                    {action.title}
                  </h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    {action.reason}
                  </p>
                </div>

                {action.safetyNote && (
                  <div className="pt-2 border-t border-border-subtle text-[10px] font-mono text-amber-300">
                    ⚠️ {action.safetyNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-bg-surface-2 text-center text-xs text-emerald-400 font-mono">
            🎉 ยอดเยี่ยมมาก! คุณได้ทำภารกิจหลักในระดับปัจจุบันครบถ้วนแล้ว สามารถตรวจสอบขั้นถัดไปในหน้าเส้นทางพัฒนา
          </div>
        )}
      </div>

      {/* ⚠️ Section 3: สิ่งที่ยังไม่ได้ตรวจสอบ (Unverified Audits) */}
      {unverifiedAudits.length > 0 && (
        <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm md:text-base font-heading font-bold text-text-primary">
                สิ่งที่ยังไม่ได้ตรวจสอบในบัญชี (Unverified Audits)
              </h2>
            </div>
            <span className="text-[10px] font-mono text-text-muted">
              {unverifiedAudits.length} รายการ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {unverifiedAudits.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-bg-surface-2/80 border border-amber-500/20 flex items-start gap-2.5 text-xs font-mono"
              >
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-[10px] text-text-muted font-bold">[{item.category}]</div>
                  <div className="text-text-secondary font-medium">{item.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
