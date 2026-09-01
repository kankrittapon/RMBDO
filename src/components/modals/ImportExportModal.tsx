'use client';

import React, { useState } from 'react';
import { Download, Upload, X, Copy, Check, FileCode } from 'lucide-react';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: ReturnType<typeof useRoadmapStore>;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({ isOpen, onClose, store }) => {
  const { exportProfileJson, importProfileJson } = store;
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const jsonString = exportProfileJson();

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rmbdo_profile_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) {
      setStatusMessage({ type: 'error', text: 'กรุณาวางโค้ด JSON ก่อนกดยืนยัน' });
      return;
    }
    const res = importProfileJson(importText);
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      setTimeout(() => {
        onClose();
        setStatusMessage(null);
        setImportText('');
      }, 1500);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-brand-primary" />
            <h3 className="font-heading font-bold text-sm text-text-primary">
              สำรองและกู้คืนข้อมูลโปรไฟล์ (Backup & Restore JSON)
            </h3>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`p-2.5 rounded-lg text-xs font-mono ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Export Box */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
            ส่งออกข้อมูล (Export Current Profile JSON):
          </label>
          <textarea
            readOnly
            value={jsonString}
            rows={5}
            className="w-full p-2.5 bg-bg-surface-3 border border-border-subtle rounded-lg text-[10px] font-mono text-text-secondary select-all outline-none resize-none"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-bg-surface-2 hover:bg-bg-surface-3 border border-border-subtle text-xs font-mono text-text-primary transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกเรียบร้อย' : 'คัดลอก JSON'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-brand-primary hover:bg-purple-600 text-xs font-mono font-bold text-white shadow-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลดไฟล์ .json</span>
            </button>
          </div>
        </div>

        {/* Import Box */}
        <div className="space-y-2 pt-3 border-t border-border-subtle">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
            นำเข้าข้อมูล (Import Profile JSON):
          </label>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="วางโค้ด JSON ที่ต้องการกู้คืนที่นี่..."
            rows={3}
            className="w-full p-2.5 bg-bg-surface-3 border border-border-subtle rounded-lg text-[10px] font-mono text-text-primary outline-none focus:border-brand-primary resize-none"
          />
          <button
            onClick={handleImport}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>ยืนยันการนำเข้าข้อมูล (Apply Import)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
