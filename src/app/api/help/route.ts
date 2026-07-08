import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// POST /api/help
// Records a question a client asked from the "Need help?" widget, along with
// the step they were on. Name/email are copied from their meta_setup row so the
// help_requests table reads on its own.
export async function POST(req: NextRequest) {
  let body: {
    id?: string;
    stepIndex?: number;
    stepLabel?: string;
    question?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const question = body.question?.trim();
  if (!question) {
    return NextResponse.json(
      { error: "Please type a question." },
      { status: 400 },
    );
  }
  if (question.length > 2000) {
    return NextResponse.json(
      { error: "That question is too long." },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    // Best-effort lookup of the client's name/email for easier review.
    let first_name: string | null = null;
    let last_name: string | null = null;
    let email: string | null = null;
    if (body.id) {
      const { data } = await supabase
        .from("meta_setup")
        .select("first_name, last_name, email")
        .eq("id", body.id)
        .maybeSingle();
      if (data) {
        first_name = data.first_name;
        last_name = data.last_name;
        email = data.email;
      }
    }

    const { error } = await supabase.from("help_requests").insert({
      setup_id: body.id ?? null,
      first_name,
      last_name,
      email,
      step_index:
        typeof body.stepIndex === "number" ? body.stepIndex : null,
      step_label: body.stepLabel ?? null,
      question,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/help]", err);
    return NextResponse.json(
      { error: "Could not send your question. Please try again." },
      { status: 500 },
    );
  }
}
