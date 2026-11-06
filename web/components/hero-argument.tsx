"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Check, Hash } from "@phosphor-icons/react";
import { Avatar } from "@/components/avatar";

// Two real rooms, shortened: the person asks, the agents push back on each other, one owns it, both sign.
type Side = "left" | "right" | "person";
type Line = { who: string; tag: string; side: Side; text: string };

const ROOMS = {
  companies: {
    tab: "Two companies",
    room: "seaside-inn-roomfinder",
    members: "Maria, Arjun and their agents",
    lines: [
      { who: "Maria", tag: "Seaside Inn", side: "person", text: "A guest booked 1 night on RoomFinder and we billed her $3,720. What happened?" },
      { who: "roomfinder-agent", tag: "RoomFinder", side: "right", text: "The 31 nights look like yours. 03/04 means 3 April." },
      { who: "seaside-inn-agent", tag: "Seaside Inn", side: "left", text: "Our partner guide says month first. This one is on your side." },
      { who: "roomfinder-agent", tag: "RoomFinder", side: "right", text: "Checked. It's ours. The fix is in a pull request." },
    ] as Line[],
    owns: "our",
    ask: "Sign the agreement with Seaside Inn?",
    signed: "Signed by Maria and Arjun",
  },
  flatmates: {
    tab: "Two flatmates",
    room: "flat-4b",
    members: "Priya, Sam and their agents",
    lines: [
      { who: "Priya", tag: "Flat 4B", side: "person", text: "Sam's sheet says I owe ₹7,910 more than I think. Can you check?" },
      { who: "sam-agent", tag: "Sam", side: "right", text: "The rent went up for Priya's AC, so the rise is hers." },
      { who: "priya-agent", tag: "Priya", side: "left", text: "The flat agreement splits any rise 46/54. Here's the line." },
      { who: "sam-agent", tag: "Sam", side: "right", text: "Checked. It's mine. ₹7,910 comes off the sheet." },
    ] as Line[],
    owns: "my",
    ask: "Agree to the settlement with Priya?",
    signed: "Agreed by Priya and Sam",
  },
};

type Key = keyof typeof ROOMS;
const ORDER: Key[] = ["companies", "flatmates"];
const STEP_MS = 850;
const HOLD_MS = 3200;


function Message({ line }: { line: Line }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex gap-3">
      <Avatar name={line.who} isAgent={line.side !== "person"} />
      <div className="min-w-0">
        <p className="text-[12.5px]">
          <span className="font-semibold text-ink">{line.who}</span> <span className="text-grey">{line.side === "person" ? line.tag : `${line.tag}'s agent`}</span>
        </p>
        <p className="mt-0.5 text-[14.5px] leading-snug text-ink">{line.text}</p>
      </div>
    </motion.div>
  );
}

function Typing() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-1 pl-11" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="size-1.5 rounded-full bg-grey" animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </motion.div>
  );
}

export function HeroArgument({ intro }: { intro: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [key, setKey] = useState<Key>("companies");
  const [isPinned, setPinned] = useState(false);
  const r = ROOMS[key];
  const last = r.lines.length + 2; // every line, the card, then the card signed
  const [step, setStep] = useState(last);

  useEffect(() => {
    if (reduce) return setStep(last);
    setStep(1);
    const timers = Array.from({ length: last }, (_, i) => setTimeout(() => setStep(i + 1), i * STEP_MS));
    return () => timers.forEach(clearTimeout);
  }, [key, reduce, last]);

  useEffect(() => {
    if (isPinned || reduce) return;
    const t = setTimeout(() => setKey((k) => ORDER[(ORDER.indexOf(k) + 1) % ORDER.length]), last * STEP_MS + HOLD_MS);
    return () => clearTimeout(t);
  }, [key, isPinned, reduce, last]);

  const isSigned = step >= last;
  const isConceded = step >= r.lines.length;
  const [word, setWord] = useState("your");
  const [isEditing, setEditing] = useState(false);

  // The cursor shows up as the argument turns, just before the headline is edited.
  const isCursorVisible = isEditing || step === r.lines.length - 1;
  // When the agent owns the mistake, the headline is edited to match: "your" is deleted and "our" (or "my") typed in.
  useEffect(() => {
    if (!isConceded) {
      setWord("your");
      return setEditing(false);
    }
    if (reduce) return setWord(r.owns);
    const frames = ["you", "yo", "y", "", ...Array.from(r.owns, (_, i) => r.owns.slice(0, i + 1))];
    setEditing(true);
    const timers = frames.map((f, i) => setTimeout(() => setWord(f), 150 + i * 75));
    timers.push(setTimeout(() => setEditing(false), 150 + frames.length * 75 + 900));
    return () => timers.forEach(clearTimeout);
  }, [isConceded, key, reduce, r.owns]);

  return (
    <>
    <div>
      <p className="font-display text-[3.2rem] font-semibold leading-[1] tracking-[-0.045em] sm:text-[4.4rem] lg:text-[5.4rem]" aria-hidden>
        &quot;It&apos;s on{" "}
        <span>{word}</span>
        <span className={`ml-0.5 inline-block h-[0.82em] w-[3px] translate-y-[0.08em] bg-ink ${isCursorVisible ? "animate-pulse" : "opacity-0"}`} aria-hidden />
        {" "}side.&quot;
      </p>
      <h1 className="mt-6 font-display text-[1.6rem] font-medium leading-tight tracking-[-0.02em] text-ink sm:text-[1.9rem]">Let the agents argue it out.</h1>
      {intro}
    </div>
    <div>
      <div className="inline-flex rounded-full border border-line bg-white p-1 text-[14px]" role="tablist" aria-label="Which room">
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
            {ROOMS[k].tab}
          </button>
        ))}
      </div>

      <div className="mt-5">
      <div className="overflow-hidden rounded-[14px] border border-line bg-white shadow-[0_30px_60px_-36px_rgba(11,14,20,0.35)]">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          <span className="flex items-center gap-1 text-[14px] font-medium">
            <Hash size={14} weight="bold" className="text-grey" />
            {r.room}
          </span>
          <span className="hidden truncate text-[12.5px] text-grey sm:inline">{r.members}, on Switch</span>
        </div>
        <div className="flex min-h-[25rem] flex-col justify-start gap-4 px-5 py-5">
          <AnimatePresence mode="wait">
            <motion.div key={key} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-4">
              {r.lines.slice(0, Math.min(step, r.lines.length)).map((l, i) => (
                <Message key={i} line={l} />
              ))}
              {step < r.lines.length && <Typing />}
              {step > r.lines.length && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ml-11 rounded-[10px] border border-line p-3.5">
                  <p className="text-[13.5px] text-ink">{r.ask}</p>
                  <div className="mt-2.5 flex items-center gap-2 text-[13.5px]">
                    {isSigned ? (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-1.5 font-medium text-green">
                        <Check size={14} weight="bold" /> {r.signed}
                      </motion.span>
                    ) : (
                      <>
                        <span className="rounded-[7px] bg-ink px-3 py-1 font-medium text-white">Agree</span>
                        <span className="rounded-[7px] border border-line px-3 py-1">Not yet</span>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      </div>
    </div>
    </>
  );
}
