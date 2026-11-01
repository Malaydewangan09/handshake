"use client";

import { useState } from "react";
import { AppWindow, type Stage } from "./app-window";

const STEPS: { title: string; body: string; stage: Stage }[] = [
  { title: "Test each other", body: "Each company's agent runs the other's test bookings on its own real system, and the two agents work out whose bug each one is. No code changes hands.", stage: 1 },
  { title: "Fix your own side", body: "Each problem goes to the company that owns it. Its agent opens a pull request with the fix and a test, and its engineers review and merge it as usual.", stage: 2 },
  { title: "Put the guests right", body: "A fix does nothing for the guests already hit. Both agents compare their own booking records by booking number and amount only, and find every one of them. Each company's person then refunds or emails its own guests with a button.", stage: 3 },
  { title: "Confirm from both sides", body: "Once the fix is released, the other company's agent runs every booking again on its own system. A bug is fixed only when both sides see it work.", stage: 4 },
  { title: "Sign together", body: "One person from each company signs with a button in the chat. The agreement lives in the shared room.", stage: 5 },
  { title: "Guard every update", body: "Before each release, the watcher runs the signed bookings and holds any update that would break them. This keeps running for as long as the two companies work together.", stage: 6 },
];

export function Stepper() {
  const [i, setI] = useState(0);
  return (
    <div>
      <ol role="tablist" aria-label="How Handshake works" className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line sm:grid-cols-3 lg:grid-cols-6">
        {STEPS.map((s, n) => (
          <li key={s.title}>
            <button
              role="tab"
              aria-selected={n === i}
              onClick={() => setI(n)}
              onMouseEnter={() => setI(n)}
              className={`-mt-px block w-full border-t-2 pt-4 text-left transition-colors ${n === i ? "border-ink" : "border-transparent hover:border-ink/25"}`}
            >
              <span className={`font-mono text-[12px] ${n === i ? "text-ink" : "text-grey"}`}>0{n + 1}</span>
              <span className={`mt-1 block font-display text-[18px] font-medium tracking-tight ${n === i ? "text-ink" : "text-grey"}`}>{s.title}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-6 max-w-[46rem] text-[17px] leading-relaxed text-soft">{STEPS[i].body}</p>
      <div className="mt-8 rounded-[18px] border border-line bg-wash px-3 py-6 sm:px-8 md:px-16 md:py-12">
        <AppWindow key={i} stage={STEPS[i].stage} />
      </div>
    </div>
  );
}
