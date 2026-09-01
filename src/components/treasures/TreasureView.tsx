'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  HelpCircle,
  MapPin,
  Flame,
  ExternalLink,
  ChevronRight,
  Shield,
  RotateCcw
} from 'lucide-react';
import { treasureList, TreasureItem } from '@/data/treasures/treasureList';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { cn } from '@/lib/utils';

interface TreasureViewProps {
  store: ReturnType<typeof useRoadmapStore>;
  onNavigateToSpot?: (spotId: string) => void;
  onNavigateToClass?: (classId: string) => void;
}

export const TreasureView: React.FC<TreasureViewProps> = ({
  store,
  onNavigateToSpot,
  onNavigateToClass
}) => {
  const { profile, toggleTreasurePiece, resetCategory } = store;
  const [selectedTreasureId, setSelectedTreasureId] = useState<string>('ornette');

  const selectedTreasure = treasureList.find((t) => t.id === selectedTreasureId) || treasureList[0];

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 md:pb-6">
      
      {/* Header Banner */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
          <div>
            <div className="flex items-center gap-2 text-brand-gold font-mono text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span>สมบัติโบราณประจำตระกูล (Ancient Treasures & Relics)</span>
            </div>
            <h1 className="text-lg md:text-xl font-heading font-bold text-text-primary">
              ระบบตรวจสอบชิ้นส่วนสมบัติ & น้ำยาฟื้นฟูไร้ขีดจำกัด
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              ติ๊กเลือกชิ้นส่วนสมบัติที่คุณได้รับแล้วจริงเพื่อคำนวณอัตราความสำเร็จและดูจุดฟาร์มแนะนำ
            </p>
          </div>

          <button
            onClick={() => resetCategory('TREASURES')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bg-surface-3 hover:bg-bg-surface-2 text-xs font-mono text-text-muted hover:text-red-400 border border-border-subtle transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ตชิ้นส่วนสมบัติ</span>
          </button>
        </div>

        {/* Treasure Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
          {treasureList.map((tr) => {
            const obtainedCount = tr.pieces.filter((p) => Boolean(profile.treasurePieces[p.id])).length;
            const isCompleted = obtainedCount === tr.pieces.length;

            return (
              <button
                key={tr.id}
                onClick={() => setSelectedTreasureId(tr.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg shrink-0 transition-colors border",
                  selectedTreasureId === tr.id
                    ? "bg-brand-primary text-white border-brand-primary font-bold shadow-sm"
                    : "bg-bg-surface-2 text-text-secondary border-border-subtle hover:text-text-primary"
                )}
              >
                <span>{tr.name.split('(')[0]}</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded font-bold",
                  isCompleted ? "bg-emerald-500/20 text-emerald-300" : "bg-bg-surface-3 text-text-muted"
                )}>
                  {obtainedCount}/{tr.pieces.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Treasure Detail Card */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-4 md:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
          <div>
            <h2 className="text-base md:text-lg font-heading font-bold text-text-primary">
              {selectedTreasure.name}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">{selectedTreasure.description}</p>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-text-muted">ผลประโยชน์: </span>
            <span className="text-emerald-400 font-bold">{selectedTreasure.utilityBenefit}</span>
          </div>
        </div>

        {/* Piece Checklist */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
            ชิ้นส่วนที่จำเป็น (Piece Checklist):
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {selectedTreasure.pieces.map((piece) => {
              const isObtained = Boolean(profile.treasurePieces[piece.id]);

              return (
                <div
                  key={piece.id}
                  onClick={() => toggleTreasurePiece(piece.id)}
                  className={cn(
                    "p-3.5 rounded-lg border transition-all cursor-pointer space-y-2 flex flex-col justify-between",
                    isObtained
                      ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm"
                      : "bg-bg-surface-2 border-border-subtle hover:border-border-active"
                  )}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-text-primary">{piece.name}</h4>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold",
                        isObtained ? "bg-emerald-500/20 text-emerald-400" : "bg-bg-surface-3 text-text-muted"
                      )}>
                        {isObtained ? "ครอบครองแล้ว" : "ยังไม่ได้รับ"}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-text-muted space-y-0.5">
                      <div>จุดดรอป: <span className="text-text-secondary">{piece.dropSpot}</span></div>
                      <div>มอนสเตอร์: <span className="text-text-secondary">{piece.monsterName}</span></div>
                      {piece.pityItemName && (
                        <div className="text-amber-400 font-bold">
                          ระบบสะสมแต้ม (Pity): {piece.pityItemName} (100 ชิ้น)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border-subtle/60 flex items-center justify-between text-[10px] font-mono text-text-muted">
                    <span>คลิกเพื่อเปลี่ยนสถานะ</span>
                    <span className={isObtained ? "text-emerald-400 font-bold" : "text-amber-400"}>
                      {isObtained ? "☑ มีแล้ว" : "□ ติ๊กเมื่อได้"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};
