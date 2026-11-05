// Sam's side: what his settle-up sheet charges Priya for each shared bill. The sheet itself stays with him.
import { readFileSync } from "node:fs";
import type { Adapter } from "../../../src/contract.ts";
import { unsupported } from "../../../src/contract.ts";

const adapter: Adapter = {
  company: "Sam",
  // Flatmates only compare amounts. There is no code to test.
  extract: async () => [],
  apply: async (c) => unsupported(c.kind),

  async amounts() {
    const [head, ...rows] = readFileSync(new URL("./data/settle-up.csv", import.meta.url), "utf8").trim().split("\n").map((l) => l.split(","));
    const entries = rows
      .map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])))
      .map((r) => ({ ref: r.number, amount: Number(r.priya_share), note: `${r.bill}, ${r.month}` }));
    return { kind: "billed" as const, currency: "INR", entries, wording: { items: "shared bills", ref: "bill number", verb: "charged" } };
  },
};

export default adapter;
