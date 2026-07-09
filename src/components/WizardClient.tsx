"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  STEPS,
  RAIL_LABELS,
  TOTAL_STEPS,
  BUSINESS_PORTFOLIO_ID,
  VIDEOS,
  type ActionStep,
  type Interstitial,
  type QuestionOption,
  type QuestionStep,
} from "@/lib/steps";
import { ProgressRail } from "./ProgressRail";
import { VideoEmbed } from "./VideoEmbed";
import { CopyButton } from "./CopyButton";
import { HelpWidget } from "./HelpWidget";

type Status = "loading" | "ready" | "error";

const SAVE_ERROR =
  "Something went wrong saving your progress. Please try again.";

export function WizardClient({ id }: { id: string | null }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [step, setStep] = useState(1); // 1-based current step
  const [interstitial, setInterstitial] = useState<Interstitial | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loaded = useRef(false);

  // Load current progress on mount.
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    if (!id) {
      router.replace("/");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/progress?id=${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.completedAt) {
          router.replace("/complete");
          return;
        }
        const next = Math.min(Math.max(data.currentStep ?? 1, 1), TOTAL_STEPS);
        setStep(next);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    })();
  }, [id, router]);

  const saveProgress = useCallback(
    async (patch: Record<string, unknown>) => {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      if (!res.ok) throw new Error("save failed");
      return res.json();
    },
    [id],
  );

  // Advance to the next step, or finish if we're past the last one.
  const goTo = useCallback(
    async (next: number) => {
      if (next > TOTAL_STEPS) {
        const res = await fetch("/api/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error("complete failed");
        router.push("/complete");
        return;
      }
      await saveProgress({ currentStep: next });
      setInterstitial(null);
      setStep(next);
      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    },
    [id, router, saveProgress],
  );

  async function handleAnswer(current: QuestionStep, option: QuestionOption) {
    setBusy(true);
    setError(null);
    try {
      await saveProgress({
        answerColumn: current.answerColumn,
        answerValue: option.value,
      });
      if (option.interstitial) {
        setInterstitial(option.interstitial);
        if (typeof window !== "undefined") window.scrollTo({ top: 0 });
      } else {
        await goTo(current.index + 1);
      }
    } catch {
      setError(SAVE_ERROR);
    } finally {
      setBusy(false);
    }
  }

  async function handleActionDone(current: ActionStep) {
    setBusy(true);
    setError(null);
    try {
      await saveProgress({ completedColumn: current.completedColumn });
      await goTo(current.index + 1);
    } catch {
      setError(SAVE_ERROR);
    } finally {
      setBusy(false);
    }
  }

  async function handleInterstitialContinue() {
    setBusy(true);
    setError(null);
    try {
      await goTo(step + 1);
    } catch {
      setError(SAVE_ERROR);
    } finally {
      setBusy(false);
    }
  }

  async function handleBack() {
    setError(null);
    // From an interstitial, "back" returns to the question, not the prior step.
    if (interstitial) {
      setInterstitial(null);
      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
      return;
    }
    // On the first step there's nothing before it — return to the landing page.
    if (step <= 1) {
      router.push("/");
      return;
    }
    setBusy(true);
    try {
      const prev = step - 1;
      await saveProgress({ currentStep: prev });
      setStep(prev);
      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    } catch {
      setError(SAVE_ERROR);
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="font-body text-sm text-textlight">Loading your setup…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6">
        <div className="max-w-md text-center">
          <p className="mb-4 font-display text-2xl font-semibold text-teal">
            We couldn&apos;t load your setup.
          </p>
          <p className="mb-6 font-body text-sm text-textmid">
            The link may be incomplete. Head back and enter your email and last
            name to pick up where you left off.
          </p>
          <a href="/" className="btn-teal">
            Back to start
          </a>
        </div>
      </div>
    );
  }

  const current = STEPS[step - 1];

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-tealdark">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-display text-lg font-semibold leading-none text-white">
              Whitney Bateson
            </p>
            <p className="mt-1 font-body text-[11px] uppercase tracking-label text-sky">
              Meta Setup
            </p>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 font-body text-xs text-skylight">
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-6 py-10 sm:py-14">
        <div className="grid gap-10 md:grid-cols-[220px_1fr] md:gap-14">
          <aside className="md:sticky md:top-10 md:self-start">
            <ProgressRail labels={RAIL_LABELS} current={step} />
          </aside>

          <main className="min-w-0">
            <button
              type="button"
              onClick={handleBack}
              disabled={busy}
              className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 font-body text-[13px] text-textmid transition-colors hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span aria-hidden>←</span>
              {step > 1 || interstitial ? "Back" : "Start over"}
            </button>

            {interstitial ? (
            <InterstitialView
              interstitial={interstitial}
              busy={busy}
              onContinue={handleInterstitialContinue}
            />
          ) : current.kind === "question" ? (
            <QuestionView
              step={current}
              busy={busy}
              onSelect={(option) => handleAnswer(current, option)}
            />
          ) : (
            <ActionView
              step={current}
              busy={busy}
              onDone={() => handleActionDone(current)}
            />
          )}

            {error && (
              <p className="mt-6 font-body text-sm text-alert" role="alert">
                {error}
              </p>
            )}
          </main>
        </div>
      </div>

      {id && (
        <HelpWidget
          setupId={id}
          stepIndex={step}
          stepLabel={RAIL_LABELS[step - 1] ?? `Step ${step}`}
        />
      )}
    </div>
  );
}

function QuestionView({
  step,
  busy,
  onSelect,
}: {
  step: QuestionStep;
  busy: boolean;
  onSelect: (option: QuestionOption) => void;
}) {
  return (
    <div>
      <p className="eyebrow mb-4">{step.eyebrow}</p>
      <h1 className="font-display text-3xl font-semibold leading-tight text-teal sm:text-[34px]">
        {step.title}
      </h1>
      {step.helper && <p className="callout-info mt-5">{step.helper}</p>}
      <div className="mt-8 space-y-3">
        {step.options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={busy}
            onClick={() => onSelect(option)}
            className="w-full rounded-xl border-[1.5px] border-line bg-white px-5 py-4 text-left font-body text-[15px] text-ink transition-colors hover:border-teal disabled:cursor-not-allowed disabled:opacity-50"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ActionView({
  step,
  busy,
  onDone,
}: {
  step: ActionStep;
  busy: boolean;
  onDone: () => void;
}) {
  return (
    <div>
      <p className="eyebrow mb-4">{step.eyebrow}</p>
      <h1 className="font-display text-3xl font-semibold leading-tight text-teal sm:text-[34px]">
        {step.title}
      </h1>
      <div className="mt-5 space-y-3">
        {step.body.map((para, i) => (
          <p
            key={i}
            className="font-body text-base leading-relaxed text-textmid"
          >
            {para}
          </p>
        ))}
      </div>

      {step.videoNote && (
        <div className="callout-warn mt-6">
          <p className="mb-1 font-medium">One correction to the video</p>
          {step.videoNote}
        </div>
      )}

      <div className="mt-6">
        <VideoEmbed url={VIDEOS[step.video]} />
      </div>

      {step.showPortfolioId && (
        <div className="mt-6">
          <p className="eyebrow mb-2">Our Business Portfolio ID</p>
          <CopyButton value={BUSINESS_PORTFOLIO_ID} />
        </div>
      )}

      {step.checklist && step.checklist.length > 0 && (
        <div className="mt-6">
          <p className="eyebrow mb-3">Grant us access to</p>
          <ul className="space-y-2">
            {step.checklist.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-3 font-body text-base text-ink"
              >
                <span aria-hidden className="shrink-0 text-lg text-coral">
                  ☑
                </span>
                <span>
                  {item.label}
                  {item.note && (
                    <span className="text-textlight"> — {item.note}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {step.warning && <p className="callout-warn mt-6">{step.warning}</p>}

      <div className="mt-8">
        <button
          type="button"
          disabled={busy}
          onClick={onDone}
          className="btn-primary w-full sm:w-auto"
        >
          {busy ? "Saving…" : step.confirmLabel}
        </button>
      </div>
    </div>
  );
}

function InterstitialView({
  interstitial,
  busy,
  onContinue,
}: {
  interstitial: Interstitial;
  busy: boolean;
  onContinue: () => void;
}) {
  return (
    <div>
      {interstitial.heading && (
        <>
          <p className="eyebrow mb-4">Before you continue</p>
          <h1 className="font-display text-3xl font-semibold leading-tight text-teal sm:text-[34px]">
            {interstitial.heading}
          </h1>
        </>
      )}

      {interstitial.type === "text" && (
        <div className="mt-5 space-y-3">
          {interstitial.body.map((para, i) => (
            <p
              key={i}
              className="font-body text-base leading-relaxed text-textmid"
            >
              {para}
            </p>
          ))}
        </div>
      )}

      {interstitial.type === "video" && (
        <>
          {interstitial.body && (
            <div className="mt-5 space-y-3">
              {interstitial.body.map((para, i) => (
                <p
                  key={i}
                  className="font-body text-base leading-relaxed text-textmid"
                >
                  {para}
                </p>
              ))}
            </div>
          )}
          <div className="mt-6">
            <VideoEmbed url={VIDEOS[interstitial.video]} />
          </div>
        </>
      )}

      <div className="mt-8">
        <button
          type="button"
          disabled={busy}
          onClick={onContinue}
          className="btn-primary w-full sm:w-auto"
        >
          {busy ? "Saving…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
