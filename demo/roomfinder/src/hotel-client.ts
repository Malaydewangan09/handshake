import { randomUUID } from "node:crypto";
import { type Site, toHotelDate } from "./dates.ts";

export type Request = { method: string; path: string; headers: Record<string, string>; body: unknown };
export type Response = { status: number; body: unknown };
/** fetch in production, a recorder in tests. Rejects on network errors and timeouts. */
export type Transport = (req: Request) => Promise<Response>;

/** `site` is the RoomFinder site the guest booked on. */
export type Booking = { ref: string; guest: string; site: Site; checkIn: string; checkOut: string };

export type BookingResult =
  | { kind: "confirmed"; nights: number; total: number }
  | { kind: "sold_out" }
  | { kind: "error" };

/** What we show the guest after the hotel replies. */
export function toResult(res: Response): BookingResult {
  const body = (res.body ?? {}) as { nights?: number; total?: number; error?: string };
  if (res.status === 201 && body.nights !== undefined && body.total !== undefined) return { kind: "confirmed", nights: body.nights, total: body.total };
  if (res.status === 409 && body.error === "sold_out") return { kind: "sold_out" };
  return { kind: "error" };
}

const headers = (apiKey: string, requestId = randomUUID()) => ({ "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "Request-Id": requestId });
const ATTEMPTS = 2;

export async function bookRoom(send: Transport, b: Booking, apiKey = process.env.SEASIDE_KEY ?? ""): Promise<BookingResult> {
  let lastError: unknown;
  // Seaside Inn only skips a repeat booking when a retry carries the same Request-Id.
  const requestId = randomUUID();
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const res = await send({
        method: "POST",
        path: "/reservations",
        headers: headers(apiKey, requestId),
        body: { guest: b.guest, check_in: toHotelDate(b.checkIn), check_out: toHotelDate(b.checkOut), partner_ref: b.ref },
      });
      return toResult(res);
    } catch (err) {
      lastError = err; // slow network: try once more
    }
  }
  throw lastError;
}

export async function cancelBooking(send: Transport, b: Booking, apiKey = process.env.SEASIDE_KEY ?? ""): Promise<boolean> {
  const res = await send({ method: "POST", path: "/reservations/cancel", headers: headers(apiKey), body: { partner_ref: b.ref } });
  return res.status === 200;
}
