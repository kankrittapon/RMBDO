'use client';

import React from 'react';
import { AlertCircle, ArrowRight, Sparkles, X } from 'lucide-react';

interface MigrationModalProps {
  isOpen: boolean;
  onMigrate: () => void;
  onDismiss: () => void;
}

export const MigrationModal: React.FC<MigrationModalProps> = ({ isOpen, onMigrate, onDismiss }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2 text-brand-gold">
            <Sparkles className="w-5 h-5 text-brand-gold" />
            <h3 className="font-heading font-bold text-sm text-text-primary">
              พบข้อมูลโปรไฟล์จากระบบเวอร์ชันก่อน (v1)
            </h3>
          </div>
          <button onClick={onDismiss} className="text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-text-secondary space-y-2 leading-relaxed">
          <p>
            ระบบตรวจพบข้อมูลการบันทึกเดิมในเบราว์เซอร์ของคุณ คุณต้องการนำเข้าข้อมูลเดิมเข้าสู่ระบบตรวจสอบแบบใหม่ (v2) หรือเริ่มต้นเช็คความคืบหน้าใหม่ตั้งแต่ต้นจากศูนย์?
          </p>
          <div className="p-2.5 rounded bg-bg-surface-2 border border-border-subtle text-[11px] text-text-muted font-mono">
            💡 ระบบเวอร์ชันใหม่จะไม่สุ่มเดาความสำเร็จของคุณ คุณสามารถติ๊กเลือกเฉพาะสิ่งที่ทำเสร็จแล้วจริงได้ตามต้องการ
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={onDismiss}
            className="px-3 py-2 rounded-lg bg-bg-surface-3 hover:bg-bg-surface-2 border border-border-subtle text-xs font-medium text-text-secondary transition-colors"
          >
            เริ่มเช็คใหม่ตั้งแต่ต้น (ศูนย์)
          </button>
          <button
            onClick={onMigrate}
            className="px-3 py-2 rounded-lg bg-brand-primary hover:bg-purple-600 text-xs font-bold text-white shadow-md transition-colors flex items-center justify-center gap-1.5"
          >
            <span>ตรวจสอบและนำเข้า</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
