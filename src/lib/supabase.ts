import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// IMPORTANT: the client is created lazily and cached — never at module load.
// Instantiating at import time would run during `next build` page-data
// collection and fail the build when env vars aren't set yet (e.g. before
// Vercel env is configured). getSupabaseAdmin() only throws when *called*
// without env vars, not when this module is imported.

let cached: SupabaseClient | null = null;

/**
 * Returns a cached Supabase client authenticated with the service role key.
 * Server-side only — the service role key bypasses RLS and must never reach
 * the browser. Throws (at call time, not import time) if env vars are missing.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}
