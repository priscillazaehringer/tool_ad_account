"use client";

import { useState } from "react";

// A floating "Need help?" button. Opening it reveals a small panel where the
// client can ask a question; it's saved to Supabase with the step they're on
// and their name/email attached, for the team to follow up on.
export function HelpWidget({
  setupId,
  stepIndex,
  stepLabel,
}: {
  setupId: string;
  stepIndex: number;
  stepLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: setupId,
          stepIndex,
          stepLabel,
          question,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setQuestion("");
    } catch {
      setStatus("error");
    }
  }

  function close() {
    setOpen(false);
    // Reset back to a fresh form after the closing animation would finish.
    if (status === "sent") setStatus("idle");
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 max-w-[calc(100vw-2.5rem)] border border-ink/15 bg-paper p-5 shadow-xl">
          <div className="mb-3 flex items-start justify-between gap-4">
            <p className="eyebrow text-ink">Stuck? Ask us</p>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="-mr-1 -mt-1 p-1 text-lg leading-none text-ink/50 hover:text-ink"
            >
              ×
            </button>
          </div>

          {status === "sent" ? (
            <div>
              <p className="font-body text-sm leading-relaxed text-ink/80">
                Got it — thanks! We&apos;ll follow up by email. You can keep
                going in the meantime.
              </p>
              <button
                type="button"
                onClick={close}
                className="btn-outline mt-4 w-full"
              >
                Back to setup
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <p className="mb-3 font-body text-xs leading-relaxed text-ink/55">
                On: <span className="text-ink/80">{stepLabel}</span>. Ask
                anything and we&apos;ll get back to you.
              </p>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                required
                placeholder="What's got you stuck?"
                className="field-input resize-none text-sm"
              />
              {status === "error" && (
                <p className="mt-2 font-body text-xs text-alert" role="alert">
                  Couldn&apos;t send that — please try again.
                </p>
              )}
              <button
                type="submit"
                disabled={status === "sending" || !question.trim()}
                className="btn-primary mt-3 w-full"
              >
                {status === "sending" ? "Sending…" : "Send question"}
              </button>
            </form>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        className="btn-primary shadow-lg"
        aria-expanded={open}
      >
        {open ? "Close" : "Need help?"}
      </button>
    </div>
  );
}
