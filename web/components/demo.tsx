"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AppWindow, type Stage } from "./app-window";

// The story as chapters, each held long enough to read. Stages 3 and 5 include the cursor pressing a button.
const CHAPTERS: { label: string; stage: Stage; ms: number }[] = [
  { label: "Complaint", stage: 0, ms: 3400 },
  { label: "Found", stage: 1, ms: 5600 },
  { label: "Review", stage: 2, ms: 3000 },
  { label: "Refunds", stage: 3, ms: 6400 },
  { label: "Fixed", stage: 4, ms: 2800 },
  { label: "Signed", stage: 5, ms: 3200 },
  { label: "Guarded", stage: 6, ms: 4200 },
];

/** Plays the whole Handshake in the app window, like a muted product video. Pauses off screen. */
export function Demo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [i, setI] = useState(reduce ? 5 : 0);

  useEffect(() => {
    if (reduce || !inView) return;
    const t = setTimeout(() => setI((x) => (x + 1) % CHAPTERS.length), CHAPTERS[i].ms);
    return () => clearTimeout(t);
  }, [i, inView, reduce]);

  const ch = CHAPTERS[i];
  return (
    <div ref={ref}>
      <AppWindow key={i === 0 ? "start" : "run"} stage={ch.stage} clicking={!reduce} />
      <div className="mx-auto mt-6 flex max-w-3xl gap-2 px-2" role="tablist" aria-label="Demo chapters">
        {CHAPTERS.map((c, n) => (
          <button
            key={c.label}
            role="tab"
            aria-selected={n === i}
            onClick={() => setI(n)}
            className="group flex-1 text-left"
          >
            <span className="block h-[3px] overflow-hidden rounded-full bg-ink/10">
              <span
                key={n === i ? `on-${i}` : `off-${n}`}
                className="block h-full rounded-full bg-ink"
                style={
                  n === i && !reduce
                    ? { animation: `chapter-fill ${c.ms}ms linear forwards` }
                    : { width: n < i || (reduce && n === i) ? "100%" : "0%" }
                }
              />
            </span>
            <span className={`mt-2 block text-[10px] font-medium sm:text-[11.5px] ${n === i ? "text-ink" : "text-grey group-hover:text-soft"}`}>{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
