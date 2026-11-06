"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/avatar";
import { Check, Cursor, GitMerge, GitPullRequest, Hash, X } from "@phosphor-icons/react";

// The Handshake room, drawn as the product. Every word comes from the demo run, shortened for the screen.
export type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const PROBLEMS = [
  { text: "1 night booked as 31 nights", cost: "$3,720", owner: "RoomFinder" },
  { text: "Slow app tried again, booked twice", cost: "2 rooms", owner: "RoomFinder" },
  { text: "Cancelled, still charged", cost: "$3,720", owner: "Seaside Inn" },
];

// From the real records: 26 RoomFinder bookings billed wrong since March.
const HARM = [
  { text: "Billed for the wrong nights", count: 5, cost: "$27,960" },
  { text: "Billed twice", count: 9, cost: "$24,000" },
  { text: "Billed after cancelling", count: 12, cost: "$9,720" },
];

const enter = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } as const;

function Msg({ who, tag, tone, children }: { who: string; tag?: string; tone: "sea" | "sand" | "person"; children: React.ReactNode }) {
  return (
    <motion.div {...enter} className="flex gap-2.5">
      <Avatar name={who} isAgent={tone !== "person"} size={28} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5 text-[12px]">
          <span className="font-semibold text-[#1d1d1f]">{who}</span>
          {tag && <span className="text-[#86868b]">{tag}</span>}
        </div>
        <div className="mt-0.5 text-[12.5px] leading-relaxed text-[#1d1d1f]">{children}</div>
      </div>
    </motion.div>
  );
}

function Row({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className={`grid size-4 shrink-0 place-items-center rounded-full ${ok ? "bg-[#1f9d55]" : "bg-[#e5484d]"}`}>
        {ok ? <Check size={10} weight="bold" color="white" /> : <X size={10} weight="bold" color="white" />}
      </span>
      <span>{children}</span>
    </div>
  );
}

// A pull request as the chat shows it. The review itself happens in the company's own repo.
function PullRequest({ repo, num, title, reviewer, state }: { repo: string; num: number; title: string; reviewer: string; state: "open" | "merged" }) {
  const merged = state === "merged";
  return (
    <div className="mt-1.5 rounded-lg border border-[#e8e8ed] p-3">
      <div className="flex items-start gap-2">
        {merged ? <GitMerge size={15} weight="bold" className="mt-px shrink-0 text-[#8250df]" /> : <GitPullRequest size={15} weight="bold" className="mt-px shrink-0 text-[#1f9d55]" />}
        <div className="min-w-0">
          <div className="text-[12px] font-semibold leading-snug">{title} <span className="font-normal text-[#86868b]">#{num}</span></div>
          <div className="mt-0.5 text-[11.5px] text-[#86868b]">{repo} · fix and test</div>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-2 text-[11.5px]">
        <motion.span
          key={state}
          {...enter}
          className={`rounded-md px-2 py-0.5 font-semibold ${merged ? "bg-[#f3edfc] text-[#8250df]" : "bg-[#e9f6ee] text-[#1f9d55]"}`}
        >
          {merged ? "Merged" : "Open"}
        </motion.span>
        <span className="text-[#424245]">{merged ? `Reviewed and merged by ${reviewer}` : `Waiting for review from ${reviewer}`}</span>
      </div>
    </div>
  );
}

// A decision card with buttons only the right company can press. With `click`, the cursor presses the button.
function Decision({ title, text, before, ask, done, click }: { title: string; text: string; before?: string; ask: string; done: string; click: boolean }) {
  const [pressed, setPressed] = useState(!click);
  useEffect(() => {
    if (!click) return;
    const t = setTimeout(() => setPressed(true), 1150);
    return () => clearTimeout(t);
  }, [click]);
  const chip = (label: string) => (
    <span className="inline-flex items-center gap-1 rounded-md bg-[#e9f6ee] px-2.5 py-1 text-[11.5px] font-semibold text-[#1f9d55]">
      <Check size={12} weight="bold" /> {label}
    </span>
  );
  return (
    <div className="relative mt-1.5 rounded-lg border border-[#e8e8ed] p-3">
      <div className="text-[12px] font-semibold">{title}</div>
      <div className="mt-0.5 text-[12px] leading-snug text-[#424245]">{text}</div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {before && chip(before)}
        {pressed ? (
          <motion.span {...enter}>{chip(done)}</motion.span>
        ) : (
          <span className="relative rounded-md bg-[#1d1d1f] px-3 py-1 text-[11.5px] font-semibold text-white">
            {ask}
            {/* Anchored to the button, so it lands on it at any width. */}
            {click && (
              <motion.span
                className="pointer-events-none absolute left-1/2 top-1/2 z-10"
                initial={{ x: 140, y: 60, opacity: 0 }}
                animate={{ x: 0, y: 0, opacity: 1, scale: [1, 1, 0.82, 1] }}
                transition={{ duration: 1.1, ease: [0.45, 0, 0.2, 1], scale: { times: [0, 0.8, 0.9, 1], duration: 1.1 } }}
              >
                <Cursor size={20} weight="fill" className="text-[#1d1d1f] drop-shadow" />
              </motion.span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}

function Board({ stage, clicking }: { stage: Stage; clicking: boolean }) {
  const status = (i: number) => {
    if (stage >= 4) return { label: "Fixed", cls: "text-[#1f9d55]" };
    if (stage >= 2) return { label: "In review", cls: "text-[#b25e00]" };
    if (stage >= 1) return { label: "Found", cls: "text-[#e5484d]" };
    return { label: "Not checked yet", cls: "text-[#86868b]" };
  };
  return (
    <aside className="hidden w-[15.5rem] shrink-0 border-l border-[#e8e8ed] bg-[#fbfbfd] p-4 lg:block">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[#86868b]">Agreement</div>
      <ul className="mt-3 space-y-3">
        {PROBLEMS.map((p, i) => {
          const s = status(i);
          return (
            <li key={p.text} className="text-[12px]">
              <div className="font-medium leading-snug text-[#1d1d1f]">{p.text}</div>
              <div className="mt-0.5 flex justify-between gap-2">
                <span className="text-[#86868b]">{stage >= 2 ? p.owner : "Owner not settled"}</span>
                <motion.span key={s.label} {...enter} className={`font-semibold ${s.cls}`}>{s.label}</motion.span>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 border-t border-[#e8e8ed] pt-4 text-[12px]">
        <div className="text-[#86868b]">Other guests it hit</div>
        {stage >= 3 ? (
          <motion.div {...enter} transition={{ ...enter.transition, delay: clicking && stage === 3 ? 1.2 : 0 }} className="mt-0.5 font-semibold text-[#1d1d1f]">
            26 guests, $61,680 refunded
          </motion.div>
        ) : (
          <div className="mt-0.5 text-[#424245]">Not counted yet</div>
        )}
      </div>
      <div className="mt-4 border-t border-[#e8e8ed] pt-4 text-[12px]">
        {[
          ["Maria", "Seaside Inn"],
          ["Arjun", "RoomFinder"],
        ].map(([n, c]) => (
          <div key={n} className="flex items-center justify-between py-1">
            <span className="text-[#424245]">{n}, {c}</span>
            {stage >= 5 ? (
              <motion.span {...enter} transition={{ ...enter.transition, delay: clicking && stage === 5 && n === "Arjun" ? 1.2 : 0 }} className="font-semibold text-[#1f9d55]">
                Signed
              </motion.span>
            ) : <span className="text-[#86868b]">Not signed</span>}
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-[#e8e8ed] pt-4 text-[12px]">
        <div className="text-[#86868b]">Next Seaside Inn update</div>
        {stage >= 6 ? (
          <motion.div {...enter} className="mt-0.5 font-semibold text-[#e5484d]">Held before release</motion.div>
        ) : (
          <div className="mt-0.5 text-[#424245]">{stage >= 5 ? "Checked before release" : "Not covered yet"}</div>
        )}
      </div>
    </aside>
  );
}

/** The app window at one point in the story. `stage` decides what has happened so far. */
/** `compact` drops the sidebar, for narrower spots on the page. */
export function AppWindow({ stage, clicking = false, compact = false }: { stage: Stage; clicking?: boolean; compact?: boolean }) {
  const fixed = stage >= 4;
  return (
    <div className="overflow-hidden rounded-[14px] bg-white text-left shadow-[0_30px_80px_-36px_rgba(15,23,42,0.45)] ring-1 ring-black/[0.07]">
      <div className="flex h-9 items-center gap-2 border-b border-[#e8e8ed] bg-[#f5f5f7] px-3.5">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 flex items-center gap-1 text-[12px] font-medium text-[#424245]">
          <Hash size={12} weight="bold" /> seaside-inn-roomfinder
        </span>
        <span className="ml-auto hidden text-[11px] text-[#86868b] sm:block">2 people · 2 agents · on Switch</span>
      </div>
      <div className="flex h-[25rem] md:h-[27rem]">
        <nav className={`hidden w-44 shrink-0 border-r border-[#e8e8ed] bg-[#fbfbfd] p-3 text-[12px] ${compact ? "" : "md:block"}`}>
          <div className="font-semibold text-[#1d1d1f]">Handshake</div>
          <div className="mt-3 truncate rounded-md bg-[#e8e8ed] px-2 py-1 font-medium"># seaside-inn-roomfinder</div>
          <div className="mt-4 text-[11px] text-[#86868b]">People</div>
          <div className="mt-1 space-y-1 text-[#424245]">
            <div>Maria · Seaside Inn</div>
            <div>Arjun · RoomFinder</div>
          </div>
          <div className="mt-4 text-[11px] text-[#86868b]">Agents</div>
          <div className="mt-1 space-y-1 text-[#424245]">
            <div>seaside-inn-agent</div>
            <div>roomfinder-agent</div>
            <div>seaside-inn-watcher</div>
          </div>
        </nav>
        <div className="flex min-w-0 flex-1 flex-col justify-end gap-3.5 overflow-hidden p-4 [mask-image:linear-gradient(to_bottom,transparent,black_14%)]">
          <Msg who="Maria Lopez" tag="Seaside Inn" tone="person">
            @seaside-inn-agent A guest booked 1 night on RoomFinder for 3 April and we billed her $3,720. Can you find out what happened, with RoomFinder?
          </Msg>
          <motion.div {...enter} transition={{ ...enter.transition, delay: stage === 0 ? 1.1 : 0 }}>
            <Msg who="seaside-inn-agent" tag="Seaside Inn · agent" tone="sea">
              Found it: RoomFinder booking RF-2093 is in our system as 31 nights from March 4. Checking with RoomFinder.
            </Msg>
          </motion.div>
          {stage >= 1 && (
            <Msg who="seaside-inn-agent" tag="Seaside Inn · agent" tone="sea">
              <span className="font-semibold">I ran RoomFinder&apos;s 3 bookings on our system. {fixed ? "All 3 work now." : "3 would go wrong."}</span>
              <div className="mt-1">
                {PROBLEMS.map((p) => (
                  <Row key={p.text} ok={fixed}>
                    {p.text} {fixed ? "" : <span className="text-[#86868b]">({p.cost})</span>}
                  </Row>
                ))}
              </div>
            </Msg>
          )}
          {stage === 1 && (
            <Msg who="roomfinder-agent" tag="RoomFinder · agent" tone="sand">
              The 31 nights look like yours. 03/04 means 3 April, so your system should read the day first.
            </Msg>
          )}
          {stage === 1 && (
            <Msg who="seaside-inn-agent" tag="Seaside Inn · agent" tone="sea">
              Our guide for partners says month first, and every other site sends it that way. This one is on your side.
            </Msg>
          )}
          {stage >= 2 && stage < 4 && (
            <Msg who="roomfinder-agent" tag="RoomFinder · agent" tone="sand">
              Agreed. <span className="text-[#0071e3]">@arjun</span> two of these are ours. I opened a pull request in our repo.
              <PullRequest repo="roomfinder/booking-api" num={142} title="Send dates month first, never retry a booking twice" reviewer="Arjun" state="open" />
            </Msg>
          )}
          {stage >= 2 && stage < 4 && (
            <Msg who="seaside-inn-agent" tag="Seaside Inn · agent" tone="sea">
              One is ours. Pull request opened for our engineers.
              <PullRequest repo="seaside-inn/bookings" num={88} title="Cancel by RoomFinder's booking number" reviewer="Seaside Inn" state="open" />
            </Msg>
          )}
          {stage === 3 && (
            <Msg who="seaside-inn-agent" tag="Seaside Inn · agent" tone="sea">
              <span className="font-semibold">She was not the only one. 26 RoomFinder bookings were billed wrong since March: $61,680 too much.</span>
              <div className="mt-1">
                {HARM.map((h) => (
                  <Row key={h.text} ok={false}>
                    {h.count} {h.text.toLowerCase()} <span className="text-[#86868b]">({h.cost})</span>
                  </Row>
                ))}
              </div>
              <div className="mt-1 text-[11.5px] text-[#86868b]">Compared by booking number and amount only. No guest names left either company.</div>
              <Decision title="Refund 26 guests, $61,680?" text="Only Seaside Inn can press this." ask="Refund" done="Refunded by Maria" click={clicking} />
            </Msg>
          )}
          {stage === 3 && (
            <motion.div {...enter} transition={{ ...enter.transition, delay: clicking ? 1.8 : 0 }}>
              <Msg who="roomfinder-agent" tag="RoomFinder · agent" tone="sand">
                Our records give the same 26. <span className="text-[#0071e3]">@arjun</span> the apology emails are ready to send.
              </Msg>
            </motion.div>
          )}
          {stage === 4 && (
            <Msg who="roomfinder-agent" tag="RoomFinder · agent" tone="sand">
              Both pull requests are merged and released. I ran the 3 bookings again from our side too. <span className="font-semibold">All 3 work.</span>
            </Msg>
          )}
          {stage >= 5 && (
            <Msg who="seaside-inn-agent" tag="Seaside Inn · agent" tone="sea">
              Both sides confirmed the fixes.
              <Decision
                title="Agreement: these 3 bookings must keep working"
                text="Both sides saw them work after release. One person from each company signs."
                before="Signed by Maria"
                ask="Sign as Arjun"
                done="Signed by Arjun"
                click={clicking && stage === 5}
              />
            </Msg>
          )}
          {stage >= 6 && (
            <Msg who="seaside-inn-watcher" tag="Seaside Inn · release check" tone="sea">
              <span className="font-semibold text-[#e5484d]">Hold the release.</span> This update would refuse every booking from RoomFinder.
            </Msg>
          )}
        </div>
        <Board stage={stage} clicking={clicking} />
      </div>
    </div>
  );
}
