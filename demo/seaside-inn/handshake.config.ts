// Seaside Inn's side of Handshake. Runs the hotel's real booking code. Nothing here leaves the hotel's repo.
import { readFileSync } from "node:fs";
import type { Adapter, Case, HttpRequest, Json } from "../../src/contract.ts";
import { unsupported } from "../../src/contract.ts";
import { book, cancel, Ledger, type Request, type Reservation } from "./src/reservations.ts";

const dollars = (n: number) => `$${n.toLocaleString("en-US")}`;
// HTTP header names are case-insensitive. Our server sees them lowercased.
const lower = (h: Record<string, string>) => Object.fromEntries(Object.entries(h).map(([k, v]) => [k.toLowerCase(), v]));

function run(requests: HttpRequest[]): { ledger: Ledger; refused: number } {
  const ledger = new Ledger();
  let refused = 0;
  for (const r of requests) {
    const req: Request = { ...r, headers: lower(r.headers) };
    const res = r.path === "/reservations/cancel" ? cancel(req, ledger) : book(req, ledger);
    if (res.status >= 400) refused++;
  }
  return { ledger, refused };
}

const sample = (ledger: Ledger) =>
  book({ method: "POST", path: "/reservations", headers: { "request-id": "sample" }, body: { guest: "Sample Guest", check_in: "04/03/2026", check_out: "04/04/2026", partner_ref: "sample" } }, ledger);

const adapter: Adapter = {
  company: "Seaside Inn",

  async extract(): Promise<Case[]> {
    return [
      {
        id: "confirmation",
        title: "Seaside Inn confirms a 1-night booking",
        kind: "booking-reply",
        input: sample(new Ledger()) as unknown as Json,
        intent: { kind: "confirmed", nights: 1, total: 120 },
      },
      {
        id: "sold-out",
        title: "Seaside Inn has no rooms left",
        kind: "booking-reply",
        input: sample(new Ledger(0)) as unknown as Json,
        intent: { kind: "sold_out" },
      },
    ];
  },

  async apply(c) {
    const requests = (c.input as { requests?: HttpRequest[] }).requests ?? [];
    const { ledger, refused } = run(requests);
    const booked = ledger.booked();
    switch (c.kind) {
      case "booking":
        return booked.length ? { stays: booked.map((r) => ({ nights: r.nights, charge: r.total })) } : { stays: [], refused };
      case "booking-retry":
        return { roomsBooked: booked.length };
      case "booking-then-cancel":
        return { guestCharged: booked.reduce((sum, r) => sum + r.total, 0) };
      default:
        return unsupported(c.kind);
    }
  },

  async amounts() {
    const records: Reservation[] = JSON.parse(readFileSync(new URL("./data/reservations.json", import.meta.url), "utf8"));
    const entries = records
      .filter((r) => r.status === "booked")
      .map((r) => ({ ref: r.partnerRef, amount: r.total, note: `${r.nights} night${r.nights === 1 ? "" : "s"} from ${r.checkIn}` }));
    return { kind: "billed" as const, currency: "USD", entries };
  },

  describe(kind, value) {
    const v = (value ?? {}) as Record<string, any>;
    if ("error" in v) return "crash";
    if (kind === "booking") {
      const stays: { nights: number; charge: number }[] = v.stays ?? [];
      if (!stays.length) return "refuse the booking";
      return stays.map((s) => `book ${s.nights} night${s.nights === 1 ? "" : "s"} for ${dollars(s.charge)}`).join(" and ");
    }
    if (kind === "booking-retry") {
      if (v.roomsBooked === 1) return "book 1 room";
      return `book ${v.roomsBooked} rooms and charge the guest ${v.roomsBooked === 2 ? "twice" : `${v.roomsBooked} times`}`;
    }
    if (kind === "booking-then-cancel") return v.guestCharged === 0 ? "charge the guest nothing" : `still charge the guest ${dollars(v.guestCharged)}`;
    return undefined;
  },
};

export default adapter;
