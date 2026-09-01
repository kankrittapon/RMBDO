'use client';

import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: ReturnType<typeof useRoadmapStore>;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({ isOpen, onClose, store }) => {
  const { resetCategory } = store;
  const [selectedScope, setSelectedScope] = useState<'ALL' | 'SEASON' | 'HYPERBOOST' | 'OLVIA_COMBAT' | 'OLVIA_LIFE' | 'GEAR' | 'TREASURES'>('ALL');

  if (!isOpen) return null;

  const handleConfirm = () => {
    resetCategory(selectedScope);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="font-heading font-bold text-sm text-text-primary">
              ยืนยันการรีเซ็ตข้อมูล (Reset Progress)
            </h3>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-text-secondary space-y-3">
          <p>
            เลือกหมวดหมู่ที่ต้องการล้างสถานะและรีเซ็ตกลับเป็นค่าเริ่มต้น (ไม่แน่ใจ / ยังไม่ได้ทำ):
          </p>

          <div className="space-y-1.5 font-mono text-xs">
            {[
              { id: 'ALL', label: 'รีเซ็ตทั้งหมด (Reset All Data to Zero)' },
              { id: 'SEASON', label: 'รีเซ็ตเฉพาะ ซีซั่น (Season Tasks)' },
              { id: 'HYPERBOOST', label: 'รีเซ็ตเฉพาะ ไฮเปอร์บูสต์ & Blackstar' },
              { id: 'OLVIA_COMBAT', label: 'รีเซ็ตเฉพาะ Olvia Academy สายต่อสู้' },
              { id: 'OLVIA_LIFE', label: 'รีเซ็ตเฉพาะ Olvia Academy สาย Life' },
              { id: 'GEAR', label: 'รีเซ็ตเฉพาะ อุปกรณ์สวมใส่ (Gear)' },
              { id: 'TREASURES', label: 'รีเซ็ตเฉพาะ ชิ้นส่วนสมบัติ (Treasures)' }
            ].map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2 p-2 rounded bg-bg-surface-2 border border-border-subtle cursor-pointer hover:border-border-active transition-colors"
              >
                <input
                  type="radio"
                  name="reset_scope"
                  checked={selectedScope === opt.id}
                  onChange={() => setSelectedScope(opt.id as any)}
                  className="text-brand-primary"
                />
                <span className={selectedScope === opt.id ? "text-text-primary font-bold" : "text-text-secondary"}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>

          <div className="p-2.5 rounded bg-red-950/20 border border-red-500/30 text-[11px] text-red-200">
            ⚠️ การรีเซ็ตจะเขียนทับข้อมูลใน LocalStorage ทันที แนะนำให้ Export ข้อมูลสำรองไว้ก่อน
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-bg-surface-3 hover:bg-bg-surface-2 border border-border-subtle text-xs font-mono text-text-secondary transition-colors"
          >
            ยกเลิก (Cancel)
          </button>
          <button
            onClick={handleConfirm}
            className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-mono font-bold text-white shadow-md transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ยืนยันการรีเซ็ต</span>
          </button>
        </div>

      </div>
    </div>
  );
};
