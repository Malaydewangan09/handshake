"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Hash } from "@phosphor-icons/react";
import { Avatar } from "@/components/avatar";
import { WindowChrome } from "@/components/photo-stage";

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

  const viewAs = (
    <span className="flex items-center gap-1 text-[12px]">
      <span className="mr-1 hidden text-grey sm:inline">You are</span>
      {(["Sam", "Priya"] as Who[]).map((w) => (
        <button
          key={w}
          onClick={() => setWho(w)}
          aria-pressed={who === w}
          className={`rounded-full px-2.5 py-0.5 transition ${who === w ? "bg-ink text-white" : "text-soft hover:text-ink"}`}
        >
          {w}
        </button>
      ))}
    </span>
  );

  return (
    <WindowChrome
      title={
        <span className="flex items-center gap-1">
          <Hash size={13} weight="bold" className="text-grey" />
          flat-4b
        </span>
      }
      right={viewAs}
    >
      <div className="space-y-4 px-5 py-5">
        <div className="flex gap-3">
          <Avatar name="sam-agent" isAgent />
          <div>
            <p className="text-[12.5px]">
              <span className="font-semibold">sam-agent</span> <span className="text-grey">Sam&apos;s agent</span>
            </p>
            <p className="mt-0.5 text-[14px] leading-snug">Fair. The rise is split 46/54. ₹7,910 comes off the sheet.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Avatar name="priya-agent" isAgent />
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px]">
              <span className="font-semibold">priya-agent</span> <span className="text-grey">asks Priya</span>
            </p>
            <motion.div
              key={shakes}
              animate={reduce || shakes === 0 ? undefined : { x: [0, -9, 8, -5, 3, 0] }}
              transition={{ duration: 0.4 }}
              className="mt-1.5 rounded-[10px] border border-line p-3.5"
            >
              <p className="text-[12px] font-semibold text-grey">Settle up</p>
              <p className="mt-1 text-[14px] leading-snug">Agree to the settlement with Sam? ₹7,910 off what Priya owed.</p>
              {state.kind === "signed" ? (
                <p className="mt-3 text-[13.5px] font-medium text-green">
                  {state.answer === "Agree" ? "Agreed by Priya. Her signature is in the room." : "Not yet. Nothing was agreed."}
                </p>
              ) : (
                <div className="mt-3 flex gap-2">
                  {["Agree", "Not yet"].map((a, i) => (
                    <button
                      key={a}
                      onClick={() => press(a)}
                      className={`rounded-[7px] px-3.5 py-1.5 text-[13.5px] font-medium transition active:scale-[0.97] ${i === 0 ? "bg-ink text-white hover:bg-ink/85" : "border border-line hover:border-ink/30"}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              )}
              {state.kind === "refused" && (
                <p className="mt-2.5 text-[12.5px] text-red">Switch turned Sam&apos;s press away. Only Priya can answer her own card.</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="flex h-10 items-center border-t border-line bg-[#fbfbfc] px-5 text-[12.5px] text-grey">
        {state.kind === "open" && `You are ${who}. Try pressing Agree.`}
        {state.kind === "refused" && who === "Sam" && "Now switch to Priya, top right, and try again."}
        {state.kind === "refused" && who === "Priya" && "Now press it as Priya."}
        {state.kind === "signed" && (
          <button onClick={() => { setState({ kind: "open" }); setWho("Sam"); }} className="underline underline-offset-4 hover:text-ink">
            Start over
          </button>
        )}
      </div>
    </WindowChrome>
  );
}
