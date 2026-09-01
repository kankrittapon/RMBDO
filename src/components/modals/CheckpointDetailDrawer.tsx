'use client';

import React from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Gift,
  ArrowRight,
  Info,
  ShieldAlert,
  Sparkles,
  Layers
} from 'lucide-react';
import { masterCheckpointsList } from '@/data/progression/checkpoints';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { CheckpointStatus } from '@/types/profile';
import { cn } from '@/lib/utils';

interface CheckpointDetailDrawerProps {
  nodeId: string | null;
  onClose: () => void;
  store: ReturnType<typeof useRoadmapStore>;
}

export const CheckpointDetailDrawer: React.FC<CheckpointDetailDrawerProps> = ({ nodeId, onClose, store }) => {
  if (!nodeId) return null;

  const node = masterCheckpointsList.find((n) => n.id === nodeId);
  if (!node) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-lg bg-bg-surface-1 border-l border-border-subtle h-full overflow-y-auto p-5 shadow-2xl flex flex-col justify-between space-y-4 animate-in slide-in-from-right duration-200"
      >
        <div className="space-y-4">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border-subtle pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">
                {node.category}
              </span>
              <h2 className="text-base font-heading font-bold text-text-primary mt-1">
                {node.title}
              </h2>
              <span className="text-[11px] font-mono text-text-muted">{node.englishTitle}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded bg-bg-surface-3 text-text-muted hover:text-text-primary border border-border-subtle"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Safety Tag if exists */}
          {node.safetyNote && (
            <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/30 text-xs text-red-200/90 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-red-400 block mb-0.5">คำเตือนความปลอดภัย (Item Safety Note):</span>
                <span>{node.safetyNote}</span>
              </div>
            </div>
          )}

          {/* What to do */}
          <div className="p-3 rounded-lg bg-bg-surface-2 border border-border-subtle space-y-1.5 text-xs">
            <h4 className="font-bold text-text-primary flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <Info className="w-3.5 h-3.5 text-brand-accent" /> สิ่งที่ต้องทำ (Required Action)
            </h4>
            <p className="text-text-secondary leading-relaxed">{node.requiredAction}</p>
          </div>

          {/* Requirements */}
          <div className="space-y-1.5 text-xs">
            <h4 className="font-bold text-text-primary text-[11px] uppercase tracking-wider">
              เงื่อนไขที่จำเป็น (Requirements):
            </h4>
            <div className="space-y-1">
              {node.requirements.map((req, idx) => (
                <div key={idx} className="p-2 rounded bg-bg-surface-3/80 border border-border-subtle/60 font-mono text-[11px] text-text-secondary flex items-center gap-2">
                  <span className="text-brand-primary">•</span>
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rewards */}
          <div className="space-y-1.5 text-xs">
            <h4 className="font-bold text-text-primary text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-amber-400" /> ของรางวัลที่จะได้รับ (Rewards):
            </h4>
            <div className="space-y-1">
              {node.rewards.map((rew, idx) => (
                <div key={idx} className="p-2 rounded bg-bg-surface-3/80 border border-border-subtle/60 font-mono text-[11px] text-amber-300 flex items-center gap-2">
                  <span>★</span>
                  <span>{rew}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Why Important & Unlocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-bg-surface-2 border border-border-subtle">
              <span className="text-text-muted text-[10px] block mb-0.5">สำคัญเพราะ:</span>
              <span className="text-text-secondary text-[11px] leading-tight block">{node.whyImportant}</span>
            </div>
            <div className="p-2.5 rounded bg-bg-surface-2 border border-border-subtle">
              <span className="text-text-muted text-[10px] block mb-0.5">ปลดล็อก:</span>
              <span className="text-emerald-400 text-[11px] font-bold block">{node.unlocksWhat}</span>
            </div>
          </div>

          {/* Next Recommended Step */}
          <div className="p-3 rounded-lg bg-bg-surface-3 border border-border-subtle text-xs space-y-1">
            <span className="text-text-muted text-[10px] font-mono block">เป้าหมายที่ควรทำต่อไป:</span>
            <p className="text-text-primary font-medium flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              <span>{node.nextRecommendedStep}</span>
            </p>
          </div>

          {/* Metadata Footer */}
          <div className="pt-2 border-t border-border-subtle/80 flex items-center justify-between text-[10px] font-mono text-text-muted">
            <span>แหล่งข้อมูล: {node.dataSource}</span>
            <span>ตรวจสอบล่าสุด: {node.lastVerified}</span>
          </div>

        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-border-subtle">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg bg-bg-surface-3 hover:bg-bg-surface-2 border border-border-subtle text-xs font-mono text-text-primary transition-colors"
          >
            ปิดหน้าต่างข้อมูล (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
