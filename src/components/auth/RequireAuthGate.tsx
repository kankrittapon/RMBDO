'use client';

import React, { useState } from 'react';
import { Lock, LogIn } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { LoginModal } from './LoginModal';

interface RequireAuthGateProps {
  session: Session | null;
  authConfigured: boolean;
  featureName: string;
  children: React.ReactNode;
}

/** Blocks a page behind login - used for Olvia Academy and the Hyperboost
 * Goal overview per explicit request (these track progression the user
 * wants tied to a real account, unlike reference-only pages like Market or
 * Class Guides which stay open to everyone). Fails OPEN (shows children
 * anyway) if auth isn't configured on this deployment at all - a
 * misconfigured NEXT_PUBLIC_SUPABASE_* env var should never be able to
 * lock the user out of their own app with no way back in. */
export const RequireAuthGate: React.FC<RequireAuthGateProps> = ({
  session,
  authConfigured,
  featureName,
  children,
}) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  if (session || !authConfigured) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-md mx-auto mt-16 text-center space-y-4 bg-bg-surface-1 border border-border-subtle rounded-xl p-8">
      <div className="w-12 h-12 rounded-full bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center mx-auto">
        <Lock className="w-5 h-5 text-brand-primary" />
      </div>
      <h2 className="text-sm font-bold text-text-primary">ต้องเข้าสู่ระบบก่อน</h2>
      <p className="text-xs text-text-secondary leading-relaxed">
        {featureName} ต้องมีบัญชีเพื่อติดตามความคืบหน้าและซิงค์ข้อมูลข้ามเครื่อง
      </p>
      <button
        onClick={() => setIsLoginOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-bold hover:opacity-90"
      >
        <LogIn className="w-4 h-4" />
        เข้าสู่ระบบ / สมัครสมาชิก
      </button>
      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} />}
    </div>
  );
};
