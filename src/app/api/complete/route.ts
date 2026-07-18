import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendNotification } from "@/lib/mailer";
import { clientName, summaryText } from "@/lib/summary";

export const runtime = "nodejs";

// POST /api/complete
// Marks a row complete and fires the notification email via Resend. The email
// send is best-effort: if Resend isn't configured or fails, completion still
// succeeds and we report emailed:false rather than erroring the whole request.
export async function POST(req: NextRequest) {
  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  let row: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    q2_answer: string | null;
    q3_answer: string | null;
    q4_answer: string | null;
    q5_answer: string | null;
    payment_answer: string | null;
    q6_completed_at: string | null;
    completed_at: string | null;
  };

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("meta_setup")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", id)
      .select(
        "first_name, last_name, email, q2_answer, q3_answer, q4_answer, q5_answer, payment_answer, q6_completed_at, completed_at",
      )
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    row = data;
  } catch (err) {
    console.error("[/api/complete] db", err);
    return NextResponse.json(
      { error: "Could not complete setup." },
      { status: 500 },
    );
  }

  // Best-effort notification email.
  let emailed = false;
  try {
    const name = clientName(row);

    await sendNotification({
      subject: `Meta setup complete — ${name}`,
      text: [
        `${name} has finished the Meta setup wizard.`,
        "",
        `Client: ${name}`,
        `Email:  ${row.email ?? "—"}`,
        "",
        "Summary",
        "-------",
        summaryText(row),
        "",
        `Record ID: ${id}`,
      ].join("\n"),
    });
    emailed = true;
  } catch (err) {
    // Don't fail completion just because the email didn't go out.
    console.error("[/api/complete] email", err);
  }

  return NextResponse.json({ ok: true, emailed });
}
