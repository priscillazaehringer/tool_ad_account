import nodemailer, { type Transporter } from "nodemailer";

// Gmail SMTP notifications. Same lazy pattern as the Supabase client: the
// transport is created only when a notification is actually sent, and throws
// (at call time, not import time) if the Gmail env vars are missing — so the
// build succeeds without them.
//
// Setup: GMAIL_USER is the sending Gmail/Workspace address, GMAIL_APP_PASSWORD
// is a Google App Password (requires 2-Step Verification on that account).

let cached: Transporter | null = null;

function getTransport(): Transporter {
  if (cached) return cached;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error(
      "Gmail is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD.",
    );
  }

  cached = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return cached;
}

/**
 * Sends a notification email to NOTIFY_EMAIL from the configured Gmail account.
 * Throws if Gmail isn't configured — callers should treat sending as
 * best-effort and not fail their request if this throws.
 */
export async function sendNotification(opts: {
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<void> {
  const transport = getTransport();
  const from = process.env.GMAIL_USER as string;
  const to = process.env.NOTIFY_EMAIL ?? "admin@whitneybateson.com";

  await transport.sendMail({
    from: `Meta Setup Wizard <${from}>`,
    to,
    replyTo: opts.replyTo,
    subject: opts.subject,
    text: opts.text,
  });
}
