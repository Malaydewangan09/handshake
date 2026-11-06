"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { WindowChrome } from "@/components/photo-stage";

// Sam's real sheet from the demo, Priya's share. The rows the agents agreed were wrong get corrected one by one.
type Row = { bill: string; month: string; was: number; now?: number; isDuplicate?: boolean; note?: string };

const ROWS: Row[] = [
  { bill: "Rent", month: "May", was: 21160 },
  { bill: "Rent", month: "June", was: 21160 },
  { bill: "Rent", month: "July", was: 23160, now: 22080, note: "Rise split 46/54, as agreed" },
  { bill: "Rent", month: "August", was: 23160, now: 22080 },
  { bill: "Rent", month: "September", was: 23160, now: 22080 },
  { bill: "Rent", month: "October", was: 23160, now: 22080 },
  { bill: "Internet", month: "August", was: 590 },
  { bill: "Internet", month: "August", was: 590, isDuplicate: true, note: "Same bill, pasted twice" },
  { bill: "Maid", month: "October", was: 3000, now: 0, note: "Priya paid her half herself" },
];

const fixes = ROWS.map((r, i) => (r.now !== undefined || r.isDuplicate ? i : -1)).filter((i) => i >= 0);
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const before = ROWS.reduce((s, r) => s + r.was, 0);
const after = ROWS.reduce((s, r) => s + (r.isDuplicate ? 0 : (r.now ?? r.was)), 0);

export function BillsSheet() {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    if (reduce) return setDone(fixes.length + 1);
    const timers = Array.from({ length: fixes.length + 1 }, (_, i) => setTimeout(() => setDone(i + 1), 700 + i * 650));
    return () => timers.forEach(clearTimeout);
  }, [isVisible, reduce]);

  const isFixed = (i: number) => fixes.indexOf(i) > -1 && fixes.indexOf(i) < done;
  const isTotalFixed = done > fixes.length;

  return (
    <div ref={ref}>
      <WindowChrome title="Flat 4B bills" right={<span className="hidden text-[12px] text-grey sm:inline">Priya&apos;s share, May to October</span>}>
        <table className="w-full text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-line bg-[#fbfbfc] text-[12px] text-grey">
              <th className="hidden w-10 py-2 pl-4 font-normal sm:table-cell">#</th>
              <th className="py-2 pl-4 font-normal sm:pl-0">Bill</th>
              <th className="py-2 font-normal">Month</th>
              <th className="py-2 pr-4 text-right font-normal">Priya owes</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => {
              const fixed = isFixed(i);
              return (
                <tr key={i} className={`border-b border-line transition-colors duration-500 ${fixed ? "bg-[#f3f8f4]" : ""}`}>
                  <td className="hidden py-2 pl-4 text-grey sm:table-cell">{i + 1}</td>
                  <td className="py-2 pl-4 sm:pl-0">
                    <span className={fixed && r.isDuplicate ? "text-grey line-through" : ""}>{r.bill}</span>
                    {fixed && r.note && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="block text-[12px] text-green">
                        {r.note}
                      </motion.span>
                    )}
                  </td>
                  <td className={`py-2 ${fixed && r.isDuplicate ? "text-grey line-through" : ""}`}>{r.month}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">
                    {fixed ? (
                      <>
                        <s className="mr-2 text-grey">{inr(r.was)}</s>
                        <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="font-medium text-ink">
                          {r.isDuplicate ? "removed" : inr(r.now!)}
                        </motion.span>
                      </>
                    ) : (
                      inr(r.was)
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td className="hidden sm:table-cell" />
              <td colSpan={2} className="py-3 pl-4 font-medium sm:pl-0">
                Total
              </td>
              <td className="py-3 pr-4 text-right font-semibold tabular-nums">
                {isTotalFixed ? (
                  <>
                    <s className="mr-2 font-normal text-grey">{inr(before)}</s>
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{inr(after)}</motion.span>
                  </>
                ) : (
                  inr(before)
                )}
              </td>
            </tr>
          </tfoot>
        </table>
        <div className="flex items-center justify-between border-t border-line bg-[#fbfbfc] px-4 py-2.5 text-[12.5px]">
          <span className="text-grey">{isTotalFixed ? "Fixed by Sam, after both agents agreed" : "Checking against Priya's records"}</span>
          <span className={`font-medium ${isTotalFixed ? "text-green" : "text-grey"}`}>{isTotalFixed ? `${inr(before - after)} off` : "..."}</span>
        </div>
      </WindowChrome>
    </div>
  );
}
