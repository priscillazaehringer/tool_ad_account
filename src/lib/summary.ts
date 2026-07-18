// Builds the per-step summary used by both the completion email and the
// confirmation screen, so they always agree.

export interface MetaSetupRow {
  first_name?: string | null;
  last_name?: string | null;
  q1_answer?: string | null; // Facebook account
  q2_answer?: string | null; // Business Page
  q3_answer?: string | null; // Instagram
  q4_answer?: string | null; // Ad account
  q5_answer?: string | null; // Business Portfolio
  payment_answer?: string | null; // Payment method
  q6_completed_at?: string | null; // Invited our team
  completed_at?: string | null;
}

export interface SummaryItem {
  label: string;
  status: string;
  done: boolean;
}

export function clientName(row: MetaSetupRow): string {
  return [row.first_name, row.last_name].filter(Boolean).join(" ") || "Client";
}

export function buildSummary(row: MetaSetupRow): SummaryItem[] {
  const ig = row.q3_answer;
  const pay = row.payment_answer;
  const invited = Boolean(row.q6_completed_at);

  return [
    {
      label: "Business Portfolio",
      status: row.q5_answer === "no" ? "Created" : "Existing",
      done: true,
    },
    {
      label: "Facebook Page",
      status: row.q2_answer === "yes" ? "Existing" : "Created",
      done: true,
    },
    {
      label: "Instagram",
      status:
        ig === "yes" ? "Connected" : ig === "no" ? "Set up" : "Skipped",
      done: ig !== "no_instagram",
    },
    {
      label: "Ad account",
      status: row.q4_answer === "yes" ? "Existing" : "Created",
      done: true,
    },
    {
      label: "Payment method",
      status: pay === "yes" ? "Added" : "To confirm",
      done: pay === "yes",
    },
    {
      label: "Whitney has access",
      status: invited ? "Complete" : "Pending",
      done: invited,
    },
  ];
}

/** Plain-text version for the notification email. */
export function summaryText(row: MetaSetupRow): string {
  const lines = buildSummary(row).map(
    (i) => `${i.done ? "✓" : "•"} ${i.label}: ${i.status}`,
  );
  return lines.join("\n");
}
