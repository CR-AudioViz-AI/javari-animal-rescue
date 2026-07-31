// lib/supabase.ts
// This app had no Supabase client at all - meaning there was genuinely no
// way for a user to sign in or for the browser to obtain a real access
// token, despite lib/credits-check.ts and lib/central-services.ts existing
// and appearing ready to use one. Module-level singleton, matching the
// proven-correct pattern used across the rest of the platform.
// CR AudioViz AI · EIN 39-3646201 · July 31, 2026
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[lib/supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
