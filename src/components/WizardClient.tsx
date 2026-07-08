"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  STEPS,
  RAIL_LABELS,
  TOTAL_STEPS,
  BUSINESS_MANAGER_ID,
  VIDEOS,
  type ActionStep,
  type Interstitial,
  type QuestionOption,
  type QuestionStep,
} from "@/lib/steps";
import { ProgressRail } from "./ProgressRail";
import { VideoEmbed } from "./VideoEmbed";
import { CopyButton } from "./CopyButton";

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

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="eyebrow text-ink/40">Loading your setup…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="mb-4 font-display text-2xl text-ink">
            We couldn&apos;t load your setup.
          </p>
          <p className="mb-6 font-body text-sm text-ink/60">
            The link may be incomplete. Head back and enter your email and last
            name to pick up where you left off.
          </p>
          <a href="/" className="btn-outline">
            Back to start
          </a>
        </div>
      </div>
    );
  }

  const current = STEPS[step - 1];

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12 sm:py-16">
      <div className="grid gap-10 md:grid-cols-[220px_1fr] md:gap-14">
        <aside className="md:sticky md:top-16 md:self-start">
          <ProgressRail labels={RAIL_LABELS} current={step} />
        </aside>

        <main className="min-w-0">
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
            <p className="mt-6 font-body text-sm text-clay" role="alert">
              {error}
            </p>
          )}
        </main>
      </div>
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
      <h1 className="font-display text-3xl font-medium leading-tight text-ink sm:text-4xl">
        {step.title}
      </h1>
      {step.helper && (
        <p className="mt-5 border-l-2 border-moss/40 pl-4 font-body text-sm leading-relaxed text-ink/70">
          {step.helper}
        </p>
      )}
      <div className="mt-8 space-y-3">
        {step.options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={busy}
            onClick={() => onSelect(option)}
            className="btn-outline w-full justify-start text-left"
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
      <h1 className="font-display text-3xl font-medium leading-tight text-ink sm:text-4xl">
        {step.title}
      </h1>
      <div className="mt-5 space-y-3">
        {step.body.map((para, i) => (
          <p key={i} className="font-body text-base leading-relaxed text-ink/75">
            {para}
          </p>
        ))}
      </div>

      <div className="mt-6">
        <VideoEmbed url={VIDEOS[step.video]} />
      </div>

      {step.showManagerId && (
        <div className="mt-6">
          <p className="eyebrow mb-2">Our Business Manager ID</p>
          <CopyButton value={BUSINESS_MANAGER_ID} />
        </div>
      )}

      {step.warning && (
        <p className="mt-6 border-l-2 border-clay pl-4 font-body text-sm leading-relaxed text-clay">
          {step.warning}
        </p>
      )}

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
          <h1 className="font-display text-3xl font-medium leading-tight text-ink sm:text-4xl">
            {interstitial.heading}
          </h1>
        </>
      )}

      {interstitial.type === "text" && (
        <div className="mt-5 space-y-3">
          {interstitial.body.map((para, i) => (
            <p
              key={i}
              className="font-body text-base leading-relaxed text-ink/75"
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
                  className="font-body text-base leading-relaxed text-ink/75"
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
