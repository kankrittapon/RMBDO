'use client';

import React from 'react';
import {
  LayoutDashboard,
  Milestone,
  Shield,
  Zap,
  ShieldAlert,
  Sparkles,
  MapPin,
  BookOpen,
  Wheat,
  Swords
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavTabId =
  | 'dashboard'
  | 'roadmap'
  | 'olvia_combat'
  | 'olvia_life'
  | 'gear'
  | 'sovereign'
  | 'safety'
  | 'treasures'
  | 'spots'
  | 'classes'
  | 'lifeskills'
  | 'war';

interface NavigationSidebarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  seasonPct?: number;
  combatPct?: number;
  lifePct?: number;
}

const navItems: Array<{ id: NavTabId; label: string; englishLabel: string; icon: React.ElementType; badge?: string; badgeColor?: string }> = [
  { id: 'dashboard', label: 'ภาพรวมบัญชี', englishLabel: 'Dashboard', icon: LayoutDashboard },
  { id: 'roadmap', label: 'เส้นทางพัฒนา', englishLabel: 'Roadmap Timeline', icon: Milestone, badge: '9 จุดตรวจ' },
  { id: 'olvia_combat', label: 'Olvia สายต่อสู้', englishLabel: 'Olvia Combat', icon: Swords, badge: 'แนะนำ' },
  { id: 'olvia_life', label: 'Olvia สาย Life', englishLabel: 'Olvia Life', icon: Wheat },
  { id: 'gear', label: 'อุปกรณ์', englishLabel: 'Gear Planner', icon: Shield },
  { id: 'sovereign', label: 'ตีบวกราชัน', englishLabel: 'Sovereign Forge', icon: Zap, badge: 'สำคัญ', badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30' },
  { id: 'safety', label: 'ความปลอดภัยไอเทม', englishLabel: 'Item Safety', icon: ShieldAlert, badge: 'กันพลาด' },
  { id: 'treasures', label: 'สมบัติโบราณ', englishLabel: 'Treasures', icon: Sparkles },
  { id: 'spots', label: 'จุดฟาร์ม', englishLabel: 'Grind Spots', icon: MapPin },
  { id: 'classes', label: 'อาชีพ', englishLabel: 'Class Guides', icon: BookOpen },
  { id: 'lifeskills', label: 'สายอาชีพ Life', englishLabel: 'Life Skills', icon: Wheat },
  { id: 'war', label: 'ความพร้อม War', englishLabel: 'War Readiness', icon: Swords }
];

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({ activeTab, onSelectTab }) => {
  return (
    <>
      {/* Desktop Vertical Sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r border-border-subtle bg-bg-surface-1 min-h-[calc(100vh-53px)] p-3 gap-1 shrink-0">
        <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-text-muted">
          เมนูหลัก (Navigation)
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={cn(
                "flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left group",
                isActive
                  ? "bg-brand-primary/15 text-text-primary border border-brand-primary/40 shadow-sm font-bold"
                  : "text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary"
              )}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-brand-primary" : "text-text-muted group-hover:text-text-primary")} />
                <div className="truncate">
                  <span className="block leading-tight">{item.label}</span>
                  <span className="text-[9px] font-mono text-text-muted block opacity-75">{item.englishLabel}</span>
                </div>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "text-[9px] font-mono px-1.5 py-0.2 rounded shrink-0",
                    item.badgeColor || "bg-bg-surface-3 text-text-muted"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </aside>

      {/* Mobile Bottom Dock (<= 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-surface-1/95 backdrop-blur border-t border-border-subtle px-1 py-1.5 flex items-center justify-around">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded text-[10px] font-medium transition-colors",
                isActive ? "text-brand-primary font-bold" : "text-text-muted hover:text-text-secondary"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
