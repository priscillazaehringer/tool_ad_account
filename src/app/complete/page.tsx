import { getSupabaseAdmin } from "@/lib/supabase";
import { buildSummary, type SummaryItem } from "@/lib/summary";

// Fetches the client's answers server-side (best-effort) so the confirmation
// screen can show a real per-step checklist. Falls back to a generic done state
// if the id is missing or the lookup fails.
async function loadSummary(id?: string): Promise<SummaryItem[] | null> {
  if (!id) return null;
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("meta_setup")
      .select(
        "q2_answer, q3_answer, q4_answer, q5_answer, payment_answer, q6_completed_at",
      )
      .eq("id", id)
      .maybeSingle();
    return data ? buildSummary(data) : null;
  } catch {
    return null;
  }
}

export default async function CompletePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const summary = await loadSummary(id);

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-tealdark px-6 py-12">
      <div className="w-full max-w-[460px] rounded-[20px] bg-white p-8 text-center sm:p-10">
        <p className="eyebrow mb-1.5">Done For You Funnel</p>
        <p className="font-display text-[28px] font-semibold leading-none text-teal">
          Whitney Bateson
        </p>
        <p className="mt-1 font-body text-[13px] tracking-wide text-textmid">
          Digital Strategy
        </p>
        <div className="mx-auto my-7 h-0.5 w-10 rounded-full bg-coral" />

        <h1 className="font-display text-[22px] font-semibold leading-snug text-teal">
          That&apos;s everything on your end.
        </h1>
        <p className="mt-3 font-body text-sm leading-relaxed text-textmid">
          Nice work. Our team now has partner access to your Business Portfolio,
          so we can take it from here. We&apos;ll be in touch with next steps.
        </p>

        {summary && (
          <ul className="mx-auto mt-6 max-w-[300px] space-y-2 text-left">
            {summary.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-cream/40 px-3.5 py-2.5"
              >
                <span className="flex items-center gap-2.5 font-body text-sm text-ink">
                  <span
                    aria-hidden
                    className={
                      item.done ? "text-coral" : "text-textlight"
                    }
                  >
                    {item.done ? "✓" : "—"}
                  </span>
                  {item.label}
                </span>
                <span className="font-body text-xs text-textmid">
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-7 font-body text-xs text-textlight">
          You can close this tab whenever you&apos;re ready.
        </p>
      </div>
    </main>
  );
}
