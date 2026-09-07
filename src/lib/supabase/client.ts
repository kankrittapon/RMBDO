import { createClient } from '@supabase/supabase-js';

// Browser-side Supabase client for auth + the user_profiles sync table
// only (everything else in this app reads reference data through
// src/app/api/* routes backed by the pg pool, not this client). Uses the
// anon key, which is meant to be public - Row Level Security on
// user_profiles (see schema/schema.sql) is what actually restricts a
// signed-in user to their own row, not secrecy of this key.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const isAuthConfigured = supabase !== null;
