"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EntryForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong.");
      }
      const data = await res.json();
      // Navigate to the wizard; it will resume from wherever this person left off.
      router.push(`/wizard?id=${encodeURIComponent(data.id)}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't start your setup. Please try again.",
      );
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="field-label">
            First name
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="field-input"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="field-label">
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="field-input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="field-label">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-input"
        />
      </div>

      {error && (
        <p className="font-body text-sm text-alert" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "Starting…" : "Begin setup →"}
      </button>
    </form>
  );
}
