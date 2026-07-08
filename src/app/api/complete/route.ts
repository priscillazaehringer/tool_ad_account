import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getResend } from "@/lib/resend";

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
    completed_at: string | null;
  };

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("meta_setup")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", id)
      .select("first_name, last_name, email, completed_at")
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
    const notifyEmail = process.env.NOTIFY_EMAIL ?? "admin@whitneybateson.com";
    const fromEmail =
      process.env.FROM_EMAIL ?? "notifications@whitneybateson.com";

    const name =
      [row.first_name, row.last_name].filter(Boolean).join(" ") || "A client";

    const resend = getResend();
    await resend.emails.send({
      from: fromEmail,
      to: notifyEmail,
      subject: `Meta setup complete — ${name}`,
      text: [
        `${name} has finished the Meta ad account setup wizard.`,
        "",
        `Name:  ${name}`,
        `Email: ${row.email ?? "—"}`,
        `Record ID: ${id}`,
        "",
        "You should now have partner access to their Page and ad account.",
      ].join("\n"),
    });
    emailed = true;
  } catch (err) {
    // Don't fail completion just because the email didn't go out.
    console.error("[/api/complete] email", err);
  }

  return NextResponse.json({ ok: true, emailed });
}
