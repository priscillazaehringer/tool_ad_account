"use client";

import { useState } from "react";

// Copy-to-clipboard button showing the value (e.g. the Business Manager ID)
// with a brief "Copied" confirmation.
export function CopyButton({
  value,
  label = "Copy ID",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback for browsers/contexts without the async clipboard API.
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* ignore */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="group flex w-full items-center justify-between gap-4 rounded-lg border-[1.5px] border-line bg-white px-5 py-4 text-left transition-colors hover:border-teal"
    >
      <span className="font-mono text-xl tracking-wide text-teal">{value}</span>
      <span className="eyebrow shrink-0 group-hover:text-coraldark">
        {copied ? "Copied ✓" : label}
      </span>
    </button>
  );
}
