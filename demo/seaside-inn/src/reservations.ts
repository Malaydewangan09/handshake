export const NIGHTLY_RATE = 120;

export type Reservation = {
  id: string;
  guest: string;
  partnerRef: string;
  checkIn: string;
  nights: number;
  total: number;
  status: "booked" | "cancelled";
};

export type Request = { method: string; path: string; headers: Record<string, string>; body: unknown };
export type Response = { status: number; body: unknown };

/** In-memory bookings. Production swaps this for the hotel's database behind the same interface. */
export class Ledger {
  #reservations: Reservation[] = [];
  #byRequest = new Map<string, Response>();
  #next = 1;
  readonly rooms: number;

  constructor(rooms = 12) {
    this.rooms = rooms;
  }
  nextId(): string {
    return `r_${String(this.#next++).padStart(4, "0")}`;
  }
  replay(requestId: string): Response | undefined {
    return this.#byRequest.get(requestId);
  }
  remember(requestId: string, res: Response): void {
    this.#byRequest.set(requestId, res);
  }
  add(r: Reservation): void {
    this.#reservations.push(r);
  }
  booked(): Reservation[] {
    return this.#reservations.filter((r) => r.status === "booked");
  }
  byId(id: string): Reservation | undefined {
    return this.#reservations.find((r) => r.id === id);
  }
}

const error = (status: number, code: string): Response => ({ status, body: { error: code } });

/** MM/DD/YYYY, as our booking guide says. Returns a UTC date, or undefined when it is not a real date. */
export function parseDate(text: unknown): Date | undefined {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(text));
  if (!m) return undefined;
  const [month, day, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : undefined;
}

/** POST /reservations */
export function book(req: Request, ledger: Ledger): Response {
  const requestId = req.headers["request-id"];
  if (!requestId) return error(400, "request_id_required");
  const previous = ledger.replay(requestId);
  if (previous) return previous;

  const { guest, check_in, check_out, partner_ref } = (req.body ?? {}) as Record<string, unknown>;
  const from = parseDate(check_in);
  const to = parseDate(check_out);
  if (!from || !to || to <= from) return error(400, "invalid_dates");
  if (typeof partner_ref !== "string") return error(400, "partner_ref_required");
  if (ledger.booked().length >= ledger.rooms) return error(409, "sold_out");

  const nights = Math.round((to.getTime() - from.getTime()) / 86_400_000);
  const r: Reservation = {
    id: ledger.nextId(),
    guest: String(guest ?? ""),
    partnerRef: partner_ref,
    checkIn: from.toISOString().slice(0, 10),
    nights,
    total: nights * NIGHTLY_RATE,
    status: "booked",
  };
  ledger.add(r);
  const res: Response = { status: 201, body: { reservation_id: r.id, nights, total: r.total, currency: "USD" } };
  ledger.remember(requestId, res);
  return res;
}

/** POST /reservations/cancel */
export function cancel(req: Request, ledger: Ledger): Response {
  const { reservation_id } = (req.body ?? {}) as Record<string, unknown>;
  const r = typeof reservation_id === "string" ? ledger.byId(reservation_id) : undefined;
  if (!r) return error(404, "reservation_not_found");
  r.status = "cancelled";
  return { status: 200, body: { reservation_id: r.id, status: "cancelled" } };
}
