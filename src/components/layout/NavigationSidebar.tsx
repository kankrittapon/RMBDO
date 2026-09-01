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
}

const navItems: Array<{ id: NavTabId; label: string; icon: React.ElementType; badge?: string; badgeColor?: string }> = [
  { id: 'dashboard', label: 'Tactical HUD', icon: LayoutDashboard },
  { id: 'roadmap', label: 'Progression Timeline', icon: Milestone, badge: '11 Phases' },
  { id: 'gear', label: 'Gear Planner', icon: Shield },
  { id: 'sovereign', label: 'Sovereign Forge', icon: Zap, badge: 'CRITICAL', badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30' },
  { id: 'safety', label: 'Item Safety Lock', icon: ShieldAlert, badge: 'Anti-Trap' },
  { id: 'treasures', label: 'Treasures', icon: Sparkles, badge: '3/4' },
  { id: 'spots', label: 'Grind Optimizer', icon: MapPin },
  { id: 'classes', label: 'Class Guides', icon: BookOpen },
  { id: 'lifeskills', label: 'Life Skill & Olvia', icon: Wheat },
  { id: 'war', label: 'War Readiness', icon: Swords, badge: '68%' }
];

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({ activeTab, onSelectTab }) => {
  return (
    <>
      {/* Desktop Vertical Sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r border-border-subtle bg-bg-surface-1 min-h-[calc(100vh-53px)] p-3 gap-1 shrink-0">
        <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-text-muted">
          Core Systems
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={cn(
                "flex items-center justify-between w-full px-2.5 py-2 rounded-md text-xs font-medium transition-all text-left",
                isActive
                  ? "bg-brand-primary/15 text-text-primary border border-brand-primary/40 shadow-sm"
                  : "text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary"
              )}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-brand-primary" : "text-text-muted")} />
                <span className="truncate">{item.label}</span>
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
              <span className="text-[9px] tracking-tight">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
