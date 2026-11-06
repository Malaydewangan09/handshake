"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

// The headline edits itself the way each argument ends: a company owns it ("our"), then a flatmate ("my").
const TARGETS = [
  { word: "our", hold: 2600 },
  { word: "your", hold: 1300 },
  { word: "my", hold: 2600 },
  { word: "your", hold: 1300 },
];
const KEY_MS = 75;

export function HeroHeadline() {
  const reduce = useReducedMotion();
  const [word, setWord] = useState("your");
  const [isTyping, setTyping] = useState(false);

  useEffect(() => {
    if (reduce) return;
    let current = "your";
    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const edit = (delay: number) => {
      timers.push(
        setTimeout(() => {
          const target = TARGETS[i % TARGETS.length];
          const frames = [...Array.from(current, (_, k) => current.slice(0, current.length - k - 1)), ...Array.from(target.word, (_, k) => target.word.slice(0, k + 1))];
          setTyping(true);
          frames.forEach((f, k) => timers.push(setTimeout(() => setWord(f), (k + 1) * KEY_MS)));
          timers.push(setTimeout(() => setTyping(false), (frames.length + 1) * KEY_MS + 500));
          current = target.word;
          i += 1;
          edit((frames.length + 1) * KEY_MS + target.hold);
        }, delay),
      );
    };
    edit(1200);
    return () => timers.forEach(clearTimeout);
  }, [reduce]);

  return (
    <h1 className="mx-auto max-w-[22ch] font-display text-[2.6rem] font-medium leading-[1.08] tracking-[-0.03em] sm:text-[3.6rem] lg:text-[4.4rem]">
      <span className="block whitespace-nowrap">
        &quot;It&apos;s on <span>{word}</span>
        <span className={`ml-0.5 inline-block h-[0.78em] w-[3px] translate-y-[0.1em] bg-ink ${isTyping ? "" : "animate-pulse"}`} aria-hidden />{" "}
        side.&quot;
      </span>
      <span className="block text-grey">Let the agents argue it out.</span>
    </h1>
  );
}
