"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

// The same argument, said by two companies and by two flatmates. In both real runs the right-hand side owned the mistake.
// Behind it sit each side's own records, with the wrong line circled in pen.
type Slip = { title: string; label: string; value: string };

const CASES = {
  companies: {
    tab: "Two companies",
    left: { who: "Seaside Inn", about: "the hotel" },
    right: { who: "RoomFinder", about: "the booking site" },
    agent: { who: "RoomFinder's agent", says: "Checked. It's ours." },
    leftSlip: { title: "Seaside Inn, invoice for Ana", label: "Nights", value: "31" },
    rightSlip: { title: "RoomFinder, booking RF-2093", label: "Check-in", value: "03/04/2026" },
  },
  flatmates: {
    tab: "Two flatmates",
    left: { who: "Priya", about: "who pays her share" },
    right: { who: "Sam", about: "who keeps the bills sheet" },
    agent: { who: "Sam's agent", says: "Checked. It's mine." },
    leftSlip: { title: "Priya's bills", label: "Rent, July, her 46%", value: "₹22,080" },
    rightSlip: { title: "Sam's sheet", label: "Rent, July, Priya", value: "₹23,160" },
  },
} satisfies Record<string, { tab: string; leftSlip: Slip; rightSlip: Slip } & Record<string, unknown>>;

type Key = keyof typeof CASES;
const ORDER: Key[] = ["companies", "flatmates"];
const STEP_MS = [0, 900, 1900, 2900];
const CYCLE_MS = 8000;

function PenCircle({ delay }: { delay: number }) {
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="pointer-events-none absolute -inset-x-3 -inset-y-2 h-[calc(100%+16px)] w-[calc(100%+24px)] overflow-visible" aria-hidden>
      <motion.path
        d="M8 22 C 6 8, 40 3, 62 5 S 98 12, 95 24 S 60 39, 34 36 S 2 30, 12 14"
        fill="none"
        stroke="var(--red)"
        strokeWidth="2.2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay, duration: 0.7, ease: "easeInOut" }}
      />
    </svg>
  );
}

function SlipNote({ slip, align }: { slip: Slip; align: "left" | "right" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.4 }}
      className={`relative -mt-2 w-[15rem] rounded-[3px] bg-white px-4 py-3 text-[13px] shadow-[0_12px_28px_-18px_rgba(11,14,20,0.45)] ${align === "left" ? "ml-8 rotate-[2.5deg]" : "ml-auto mr-8 -rotate-[2deg]"}`}
      aria-hidden
    >
      <p className="text-[12px] text-grey">{slip.title}</p>
      <p className="mt-1 flex justify-between gap-3">
        <span className="text-soft">{slip.label}</span>
        <span className="relative font-medium text-ink">
          {slip.value}
          <PenCircle delay={0.6} />
        </span>
      </p>
    </motion.div>
  );
}

function Bubble({ tone, who, about, slip, children }: { tone: "left" | "right" | "agent"; who: string; about?: string; slip?: Slip; children: React.ReactNode }) {
  const shape = {
    left: "-rotate-[0.8deg] rounded-[28px_28px_28px_6px] bg-sea-tint",
    right: "rotate-[0.6deg] rounded-[28px_28px_6px_28px] bg-amber-tint",
    agent: "-rotate-[1deg] rounded-[22px_22px_6px_22px] bg-ink text-white",
  }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      className={`w-fit max-w-full ${tone === "left" ? "" : "ml-auto"}`}
    >
      <p className={`relative z-10 px-6 py-4 font-display font-medium tracking-[-0.03em] ${tone === "agent" ? "text-[1.45rem] sm:text-[1.7rem]" : "text-[1.9rem] sm:text-[2.5rem]"} leading-[1.05] ${shape}`}>
        {children}
      </p>
      {slip && tone !== "agent" && <SlipNote slip={slip} align={tone} />}
      <p className={`mt-2 text-[13.5px] text-soft ${tone === "left" ? "" : "text-right"}`}>
        <span className="font-semibold text-ink">{who}</span>
        {about && `, ${about}`}
      </p>
    </motion.div>
  );
}

function Typing() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ml-auto flex w-fit gap-1.5 rounded-full bg-ink px-4 py-3" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="size-1.5 rounded-full bg-white" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </motion.div>
  );
}

export function HeroArgument() {
  const reduce = useReducedMotion();
  const [key, setKey] = useState<Key>("companies");
  const [isPinned, setPinned] = useState(false);
  const [step, setStep] = useState(3);
  const c = CASES[key];

  useEffect(() => {
    if (reduce) return setStep(3);
    setStep(0);
    const timers = STEP_MS.map((ms, i) => setTimeout(() => setStep(i), ms));
    return () => timers.forEach(clearTimeout);
  }, [key, reduce]);

  useEffect(() => {
    if (isPinned || reduce) return;
    const t = setTimeout(() => setKey((k) => ORDER[(ORDER.indexOf(k) + 1) % ORDER.length]), CYCLE_MS);
    return () => clearTimeout(t);
  }, [key, isPinned, reduce]);

  return (
    <div>
      <div className="inline-flex rounded-full border border-line bg-white p-1 text-[14px]" role="tablist" aria-label="Whose argument">
        {ORDER.map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={k === key}
            onClick={() => {
              setKey(k);
              setPinned(true);
            }}
            className={`rounded-full px-4 py-1.5 transition ${k === key ? "bg-ink text-white" : "text-soft hover:text-ink"}`}
          >
            {CASES[k].tab}
          </button>
        ))}
      </div>

      <div className="relative mt-8 min-h-[29rem]">
        <AnimatePresence mode="wait">
          <motion.div key={key} className="flex flex-col gap-6" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {step >= 0 && (
              <Bubble tone="left" who={c.left.who} about={c.left.about} slip={c.leftSlip}>
                &quot;It&apos;s on your side.&quot;
              </Bubble>
            )}
            {step >= 1 && (
              <Bubble tone="right" who={c.right.who} about={c.right.about} slip={c.rightSlip}>
                &quot;No, it&apos;s on yours.&quot;
              </Bubble>
            )}
            <AnimatePresence mode="wait">
              {step === 2 && <Typing key="typing" />}
              {step >= 3 && (
                <Bubble key="agent" tone="agent" who={c.agent.who}>
                  {c.agent.says}
                </Bubble>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
