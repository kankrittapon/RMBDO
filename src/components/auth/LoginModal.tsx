'use client';

import React, { useState } from 'react';
import { X, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LoginModalProps {
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const { authConfigured, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSent, setSignupSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = mode === 'signin' ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (mode === 'signup') {
      setSignupSent(true);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-bg-surface-1 border border-border-subtle rounded-xl shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
            {mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {mode === 'signin' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-bg-surface-2 text-text-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!authConfigured && (
          <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5">
            ยังไม่ได้ตั้งค่า Login บนเซิร์ฟเวอร์นี้ (ขาด NEXT_PUBLIC_SUPABASE_URL/ANON_KEY) - ข้อมูลยังคงเก็บใน
            เครื่องนี้อย่างเดียวเหมือนเดิม
          </p>
        )}

        {signupSent ? (
          <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
            สมัครสำเร็จ - เช็คอีเมล {email} เพื่อยืนยันบัญชี แล้วกลับมาเข้าสู่ระบบอีกครั้ง
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <input
              type="email"
              required
              placeholder="อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!authConfigured}
              className="w-full px-3 py-2 bg-bg-surface-2 border border-border-subtle rounded-lg text-sm text-text-primary disabled:opacity-50"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="รหัสผ่าน (อย่างน้อย 6 ตัว)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!authConfigured}
              className="w-full px-3 py-2 bg-bg-surface-2 border border-border-subtle rounded-lg text-sm text-text-primary disabled:opacity-50"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading || !authConfigured}
              className="w-full py-2 rounded-lg bg-brand-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {mode === 'signin' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
                setError(null);
              }}
              className="w-full text-center text-xs text-text-muted hover:text-brand-primary"
            >
              {mode === 'signin' ? 'ยังไม่มีบัญชี? สมัครสมาชิก' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}
            </button>
          </form>
        )}

        <p className="text-[10px] text-text-muted leading-relaxed border-t border-border-subtle pt-2.5">
          Login ไว้เพื่อให้ความคืบหน้า (Gear, Checkpoint, Hyperboost ฯลฯ) ซิงค์ข้ามเครื่อง/browser
          ได้ - ถ้าไม่ login ข้อมูลจะยังเก็บในเครื่องนี้อย่างเดียวเหมือนเดิม ไม่มีอะไรเสียหาย
        </p>
      </div>
    </div>
  );
};
