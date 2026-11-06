"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

// Mirrors the real run: Sam pressed Agree on Priya's card, Switch refused it and the card stayed open.
type Who = "Sam" | "Priya";
type State = { kind: "open" } | { kind: "refused" } | { kind: "signed"; answer: string };

export function TryTheCard() {
  const [who, setWho] = useState<Who>("Sam");
  const [state, setState] = useState<State>({ kind: "open" });
  const [shakes, setShakes] = useState(0);
  const reduce = useReducedMotion();

  const press = (answer: string) => {
    if (state.kind === "signed") return;
    if (who === "Sam") {
      setState({ kind: "refused" });
      setShakes((n) => n + 1);
    } else setState({ kind: "signed", answer });
  };

  return (
    <div className="mt-10">
      <div className="flex items-center gap-3 text-[14.5px]">
        <span className="text-soft">Press it as</span>
        {(["Sam", "Priya"] as Who[]).map((w) => (
          <button
            key={w}
            onClick={() => setWho(w)}
            aria-pressed={who === w}
            className={`rounded-full border px-3.5 py-1 transition ${who === w ? "border-ink bg-ink text-white" : "border-line bg-white text-soft hover:text-ink"}`}
          >
            {w}
          </button>
        ))}
      </div>

      <motion.div
        key={shakes}
        animate={reduce || shakes === 0 ? undefined : { x: [0, -9, 8, -5, 3, 0] }}
        transition={{ duration: 0.4 }}
        className="mt-4 max-w-[26rem] -rotate-[0.5deg] rounded-[14px] bg-white p-5 shadow-[0_18px_40px_-24px_rgba(11,14,20,0.35)]"
      >
        <p className="text-[12.5px] text-grey">
          <span className="font-semibold text-ink">priya-agent</span> asks Priya
        </p>
        <p className="mt-2 text-[15.5px] leading-snug">Agree to the settlement with Sam? ₹7,910 off what Priya owed.</p>
        {state.kind === "signed" ? (
          <p className="mt-4 text-[14.5px] font-medium text-green">{state.answer === "Agree" ? "Agreed by Priya. Her signature is in the room." : "Not yet. Nothing was agreed."}</p>
        ) : (
          <div className="mt-4 flex gap-2">
            {["Agree", "Not yet"].map((a) => (
              <button
                key={a}
                onClick={() => press(a)}
                className="rounded-[8px] border border-line px-4 py-2 text-[14.5px] font-medium transition hover:border-ink/30 active:scale-[0.97]"
              >
                {a}
              </button>
            ))}
          </div>
        )}
        {state.kind === "refused" && (
          <p className="mt-3 text-[13.5px] text-red">Switch turned Sam&apos;s press away. Only Priya can answer her own card.</p>
        )}
      </motion.div>

      <p className="mt-3 h-5 text-[13.5px] text-grey">
        {state.kind === "refused" && who === "Sam" && "Now switch to Priya and try again."}
        {state.kind === "signed" && (
          <button onClick={() => { setState({ kind: "open" }); setWho("Sam"); }} className="underline underline-offset-4 hover:text-ink">
            Start over
          </button>
        )}
      </p>
    </div>
  );
}
