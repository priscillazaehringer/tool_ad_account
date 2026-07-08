import { EntryForm } from "@/components/EntryForm";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-16">
      <p className="eyebrow mb-6">Done-for-You Funnel · Meta setup</p>

      <h1 className="font-display text-4xl font-medium leading-[1.05] text-ink sm:text-5xl">
        Let&apos;s get your Meta setup done.
      </h1>

      <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-ink/75">
        This walks you through everything Facebook and Instagram need on your
        end so we can run ads for you. Plan for 30 to 45 minutes and try to do
        it in one sitting. You can come back if you need to, but it&apos;s
        smoother start to finish.
      </p>

      <div className="mt-10">
        <EntryForm />
      </div>

      <p className="mt-6 max-w-xl font-body text-sm leading-relaxed text-ink/55">
        Already started? Enter the same email and last name to pick up where you
        left off.
      </p>
    </main>
  );
}
