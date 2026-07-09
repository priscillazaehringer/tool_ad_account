// Vertical progress rail with a dot marker for each step. `current` is 1-based.
export function ProgressRail({
  labels,
  current,
}: {
  labels: string[];
  current: number;
}) {
  return (
    <nav aria-label="Setup progress" className="w-full">
      <p className="eyebrow mb-6">Your setup</p>
      <ol className="relative">
        {/* connecting line */}
        <span
          aria-hidden
          className="absolute left-[7px] top-2 bottom-2 w-px bg-line"
        />
        {labels.map((label, i) => {
          const n = i + 1;
          const state =
            n < current ? "done" : n === current ? "active" : "todo";
          return (
            <li key={label} className="relative flex items-start gap-4 pb-6 last:pb-0">
              <span
                aria-hidden
                className={[
                  "relative z-10 mt-1 block h-[15px] w-[15px] shrink-0 rounded-full border-2",
                  state === "done"
                    ? "border-coral bg-coral"
                    : state === "active"
                      ? "border-coral bg-white"
                      : "border-line bg-white",
                ].join(" ")}
              />
              <span
                className={[
                  "font-body text-sm leading-tight",
                  state === "active"
                    ? "font-semibold text-teal"
                    : state === "done"
                      ? "text-textmid"
                      : "text-textlight",
                ].join(" ")}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
