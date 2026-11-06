"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

// The same argument, said by two companies and by two flatmates. In both real runs the right-hand side owned the mistake.
const CASES = {
  companies: {
    tab: "Two companies",
    left: { who: "Seaside Inn", about: "about a guest billed $3,720 for one night" },
    right: { who: "RoomFinder", about: "the booking site that sent the booking" },
    agent: { who: "RoomFinder's agent", about: "after each side ran the other's test bookings", says: "Checked. It's ours." },
    href: "#demo",
  },
  flatmates: {
    tab: "Two flatmates",
    left: { who: "Priya", about: "about ₹7,910 extra on the bills sheet" },
    right: { who: "Sam", about: "who keeps the sheet" },
    agent: { who: "Sam's agent", about: "after Priya's agent quoted the flat agreement", says: "Checked. It's mine." },
    href: "#flatmates",
  },
} as const;

type Key = keyof typeof CASES;
const ORDER: Key[] = ["companies", "flatmates"];

function Speaker({ who, about, align }: { who: string; about: string; align: "left" | "right" }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.p
        key={who}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25 }}
        className={`mt-3 max-w-[30rem] text-[14.5px] text-soft ${align === "right" ? "ml-auto text-right" : ""}`}
      >
        <span className="font-semibold text-ink">{who}</span>, {about}
      </motion.p>
    </AnimatePresence>
  );
}

export function HeroArgument() {
  const [key, setKey] = useState<Key>("companies");
  const [isPinned, setPinned] = useState(false);
  const reduce = useReducedMotion();
  const c = CASES[key];

  useEffect(() => {
    if (isPinned || reduce) return;
    const t = setInterval(() => setKey((k) => ORDER[(ORDER.indexOf(k) + 1) % ORDER.length]), 6500);
    return () => clearInterval(t);
  }, [isPinned, reduce]);

  const enter = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as const } };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px]" role="tablist" aria-label="Whose argument">
        {ORDER.map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={k === key}
            onClick={() => {
              setKey(k);
              setPinned(true);
            }}
            className={`relative pb-1.5 transition-colors ${k === key ? "text-ink" : "text-grey hover:text-soft"}`}
          >
            {CASES[k].tab}
            {k === key && (
              // A pen stroke, not a tab indicator.
              <motion.svg layoutId="tab-stroke" viewBox="0 0 100 8" preserveAspectRatio="none" className="absolute inset-x-0 -bottom-0.5 h-2 w-full" aria-hidden>
                <path d="M2 5.5 C 22 2.5, 48 6.5, 70 3.8 S 92 3, 98 4.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </motion.svg>
            )}
          </button>
        ))}
      </div>

      <div className="mt-10 md:mt-14">
        <motion.div {...enter(0.05)} className="w-fit max-w-full">
          <h1 className="-rotate-[0.8deg] font-display font-medium tracking-[-0.035em] rounded-[34px_34px_34px_8px] bg-sea-tint px-7 py-5 text-[2.6rem] leading-[1.02] sm:text-[3.6rem] lg:text-[4.4rem] md:px-9 md:py-6">
            &quot;It&apos;s on your side.&quot;
          </h1>
          <Speaker who={c.left.who} about={c.left.about} align="left" />
        </motion.div>

        <motion.div {...enter(0.55)} className="ml-auto mt-8 w-fit max-w-full md:-mt-4">
          <p className="rotate-[0.6deg] font-display font-medium tracking-[-0.035em] rounded-[34px_34px_8px_34px] bg-amber-tint px-7 py-5 text-[2.6rem] leading-[1.02] sm:text-[3.6rem] lg:text-[4.4rem] md:px-9 md:py-6">
            &quot;No, it&apos;s on yours.&quot;
          </p>
          <Speaker who={c.right.who} about={c.right.about} align="right" />
        </motion.div>

        <motion.div {...enter(1.4)} className="ml-auto mt-8 w-fit max-w-full md:mr-[12%]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={c.agent.says}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="-rotate-[1.2deg] font-display font-medium tracking-[-0.03em] rounded-[26px_26px_8px_26px] bg-ink px-6 py-4 text-[1.7rem] leading-tight text-white sm:text-[2.1rem]"
            >
              {c.agent.says}
            </motion.p>
          </AnimatePresence>
          <Speaker who={c.agent.who} about={c.agent.about} align="right" />
        </motion.div>
      </div>
    </div>
  );
}
