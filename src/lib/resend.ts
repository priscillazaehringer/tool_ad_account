import { Resend } from "resend";

// Same lazy pattern as the Supabase client: never instantiate at module load,
// or `next build` fails when RESEND_API_KEY isn't configured yet.

let cached: Resend | null = null;

/**
 * Returns a cached Resend client. Throws (at call time, not import time) if
 * RESEND_API_KEY is missing.
 */
export function getResend(): Resend {
  if (cached) return cached;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Resend is not configured. Set RESEND_API_KEY.");
  }

  cached = new Resend(apiKey);
  return cached;
}
