'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isAuthConfigured } from '@/lib/supabase/client';

interface AuthState {
  session: Session | null;
  isAuthLoading: boolean;
  authConfigured: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

/** Thin wrapper over Supabase Auth (email/password - no magic-link/OAuth
 * setup needed, works out of the box). Session state drives whether
 * useRoadmapStore syncs the profile to user_profiles or stays
 * localStorage-only, same as before login existed. */
export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsAuthLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'ยังไม่ได้ตั้งค่า Supabase Auth (ขาด NEXT_PUBLIC_SUPABASE_URL/ANON_KEY)' };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'ยังไม่ได้ตั้งค่า Supabase Auth' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  return { session, isAuthLoading, authConfigured: isAuthConfigured, signUp, signIn, signOut };
}
