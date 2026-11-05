// Priya's side: what she owes Sam for each shared bill, from the bills he posted and the flat agreement. Her bank details stay with her.
import { readFileSync } from "node:fs";
import type { Adapter } from "../../../src/contract.ts";
import { unsupported } from "../../../src/contract.ts";

// From data/agreement.md.
const RENT_SHARE = 0.46;
const OTHER_SHARE = 0.5;

const csv = (file: string) => {
  const [head, ...rows] = readFileSync(new URL(`./data/${file}`, import.meta.url), "utf8").trim().split("\n").map((l) => l.split(","));
  return rows.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
};

const adapter: Adapter = {
  company: "Priya",
  // Flatmates only compare amounts. There is no code to test.
  extract: async () => [],
  apply: async (c) => unsupported(c.kind),

  async amounts() {
    const paidMyself = new Set(csv("paid-myself.csv").map((p) => p.number));
    const entries = csv("bills.csv").map((b) => {
      const share = Math.round(Number(b.total) * (b.bill === "Rent" ? RENT_SHARE : OTHER_SHARE));
      return { ref: b.number, amount: paidMyself.has(b.number) ? 0 : share, note: `${b.bill}, ${b.month}` };
    });
    return { kind: "agreed" as const, currency: "INR", entries, wording: { items: "shared bills", ref: "bill number", verb: "charged" } };
  },
};

export default adapter;
