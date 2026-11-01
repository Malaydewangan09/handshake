// RoomFinder's side of Handshake. Runs RoomFinder's real booking code. Nothing here leaves RoomFinder's repo.
import { readFileSync } from "node:fs";
import type { Adapter, Case, Json } from "../../src/contract.ts";
import { unsupported } from "../../src/contract.ts";
import { type Booking, bookRoom, cancelBooking, type Request, type Response, toResult } from "./src/hotel-client.ts";

const OK: Response = { status: 201, body: { reservation_id: "r_recorded", nights: 1, total: 120, currency: "USD" } };

/** Runs our booking code and records every request it sends. `slowFirst` makes the first try time out. */
async function record(steps: (send: (r: Request) => Promise<Response>) => Promise<unknown>, slowFirst = false): Promise<Request[]> {
  const sent: Request[] = [];
  await steps(async (req) => {
    sent.push(req);
    if (slowFirst && sent.length === 1) throw new Error("timed out after 10s");
    return req.path.endsWith("/cancel") ? { status: 200, body: { status: "cancelled" } } : OK;
  });
  return sent;
}

const stay = (ref: string, site: Booking["site"], checkIn: string, checkOut: string): Booking => ({ ref, guest: "Ana Silva", site, checkIn, checkOut });

const adapter: Adapter = {
  company: "RoomFinder",

  async extract(): Promise<Case[]> {
    const april = stay("RF-1001", "eu", "2026-04-03", "2026-04-04");
    const may = stay("RF-1002", "us", "2026-05-10", "2026-05-11");
    const june = stay("RF-1003", "us", "2026-06-01", "2026-06-02");
    return [
      {
        id: "book-1-night",
        title: "Guest books 1 night on the European site, April 3 to 4",
        kind: "booking",
        input: { requests: (await record((send) => bookRoom(send, april))) as unknown as Json },
        intent: { stays: [{ nights: 1, charge: 120 }] },
      },
      {
        id: "book-slow-network",
        title: "Guest books 1 night, the app is slow and tries again",
        kind: "booking-retry",
        input: { requests: (await record((send) => bookRoom(send, may), true)) as unknown as Json },
        intent: { roomsBooked: 1 },
      },
      {
        id: "book-then-cancel",
        title: "Guest books 1 night, then cancels",
        kind: "booking-then-cancel",
        input: { requests: (await record(async (send) => (await bookRoom(send, june), cancelBooking(send, june)))) as unknown as Json },
        intent: { guestCharged: 0 },
      },
    ];
  },

  async apply(c) {
    if (c.kind === "booking-reply") return toResult(c.input as Response) as unknown as Json;
    return unsupported(c.kind);
  },

  async amounts() {
    type Row = Booking & { nights: number; price: number; status: "booked" | "cancelled" | "failed" };
    const records: Row[] = JSON.parse(readFileSync(new URL("./data/bookings.json", import.meta.url), "utf8"));
    // A failed booking never reached the guest's card, so there is nothing to compare.
    const entries = records
      .filter((b) => b.status !== "failed")
      .map((b) => (b.status === "cancelled" ? { ref: b.ref, amount: 0, note: "cancelled" } : { ref: b.ref, amount: b.price, note: `${b.nights} night${b.nights === 1 ? "" : "s"} from ${b.checkIn}` }));
    return { kind: "agreed" as const, currency: "USD", entries };
  },

  describe(kind, value) {
    if (kind !== "booking-reply") return undefined;
    const v = (value ?? {}) as Record<string, any>;
    if (v.kind === "confirmed") return `tell the guest "Booked: ${v.nights} night${v.nights === 1 ? "" : "s"}, $${v.total} total"`;
    if (v.kind === "sold_out") return `tell the guest "Sorry, no rooms left"`;
    return "show the guest an error";
  },
};

export default adapter;
