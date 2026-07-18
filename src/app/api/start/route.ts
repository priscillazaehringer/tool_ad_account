import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// POST /api/start
// Creates or looks up a meta_setup row by email + last name (case-insensitive).
// Returns the row id so the wizard can save progress and resume.
export async function POST(req: NextRequest) {
  let body: { firstName?: string; lastName?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();
  const email = body.email?.trim().toLowerCase();

  if (!firstName || !lastName || !email) {
    return NextResponse.json(
      { error: "First name, last name and email are all required." },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    // Look for an existing entry to resume — keyed off email only. (Last name
    // is stored for the record but not used for matching: it's too easy to
    // mistype or change and it would silently break resume.)
    const { data: existing, error: lookupError } = await supabase
      .from("meta_setup")
      .select("id, current_step, completed_at")
      .ilike("email", email)
      .order("created_at", { ascending: true })
      .limit(1);

    if (lookupError) throw lookupError;

    if (existing && existing.length > 0) {
      const row = existing[0];
      return NextResponse.json({
        id: row.id,
        currentStep: row.current_step,
        completedAt: row.completed_at,
        resumed: true,
      });
    }

    // No match — create a new entry. Email is stored normalised to lowercase.
    const { data: created, error: insertError } = await supabase
      .from("meta_setup")
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        current_step: 1,
      })
      .select("id, current_step, completed_at")
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      id: created.id,
      currentStep: created.current_step,
      completedAt: created.completed_at,
      resumed: false,
    });
  } catch (err) {
    console.error("[/api/start]", err);
    return NextResponse.json(
      { error: "Could not start setup. Please try again." },
      { status: 500 },
    );
  }
}
