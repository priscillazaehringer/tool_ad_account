import { EntryForm } from "@/components/EntryForm";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-tealdark px-6 py-12">
      <div className="w-full max-w-[460px] rounded-[20px] bg-white p-8 sm:p-10">
        {/* Brand lockup */}
        <p className="eyebrow mb-1.5">Done For You Funnel</p>
        <p className="font-display text-[28px] font-semibold leading-none text-teal">
          Whitney Bateson
        </p>
        <p className="mt-1 font-body text-[13px] tracking-wide text-textmid">
          Digital Strategy
        </p>
        <div className="my-7 h-0.5 w-10 rounded-full bg-coral" />

        <h1 className="font-display text-[22px] font-semibold leading-snug text-teal">
          Let&apos;s get your Meta setup done.
        </h1>
        <p className="mt-3 font-body text-sm leading-relaxed text-textmid">
          This walks you through everything Facebook and Instagram need on your
          end so we can run ads for you. Plan for 30 to 45 minutes and try to do
          it in one sitting. You can come back if you need to, but it&apos;s
          smoother start to finish.
        </p>

        <div className="mt-7">
          <EntryForm />
        </div>

        <p className="mt-5 font-body text-xs leading-relaxed text-textlight">
          Already started? Enter the same email to pick up where you left off.
        </p>
      </div>
    </main>
  );
}
