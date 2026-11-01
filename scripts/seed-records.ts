// Makes both companies' booking records by running their real code against each other: eight months of
// RoomFinder bookings from its US and European sites, with slow networks and cancellations. Same output every run.
//   node scripts/seed-records.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { bookRoom, cancelBooking, type Request as SiteRequest } from "../demo/roomfinder/src/hotel-client.ts";
import { book, cancel, Ledger, NIGHTLY_RATE } from "../demo/seaside-inn/src/reservations.ts";

const ROOT = join(import.meta.dirname, "..");
const BOOKINGS = 240;
const FIRST = Date.UTC(2026, 2, 2);
const DAY = 86_400_000;

// mulberry32, so the records are the same on every machine
let seed = 20260302;
const random = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
};
const pick = <T>(xs: T[]): T => xs[Math.floor(random() * xs.length)];
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

const FIRST_NAMES = ["Ana", "Ben", "Chloe", "Daniel", "Emma", "Farah", "George", "Hana", "Ivan", "Julia", "Kofi", "Lena", "Marco", "Nadia", "Omar", "Priya", "Quinn", "Rosa", "Sam", "Tara", "Umar", "Vera", "Will", "Yuki", "Zoe"];
const LAST_NAMES = ["Silva", "Brown", "Martin", "Novak", "Garcia", "Khan", "Rossi", "Tanaka", "Okafor", "Müller", "Dubois", "Patel", "Hughes", "Costa", "Larsen", "Mendes"];

type SiteBooking = { ref: string; guest: string; email: string; site: "us" | "eu"; checkIn: string; checkOut: string; nights: number; price: number; status: "booked" | "cancelled" | "failed" };

const hotel = new Ledger(100_000);
const bookings: SiteBooking[] = [];

for (let n = 0; n < BOOKINGS; n++) {
  const ref = `RF-${2001 + n}`;
  const isAna = ref === "RF-2093";
  const first = isAna ? "Ana" : pick(FIRST_NAMES);
  const last = isAna ? "Silva" : pick(LAST_NAMES);
  const nights = isAna ? 1 : pick([1, 1, 1, 2, 2, 3, 4]);
  const checkInMs = isAna ? Date.UTC(2026, 3, 3) : FIRST + Math.floor(random() * 235) * DAY;
  const site: SiteBooking["site"] = isAna || random() < 0.12 ? "eu" : "us";
  const booking = { ref, guest: `${first} ${last}`, site, checkIn: iso(checkInMs), checkOut: iso(checkInMs + nights * DAY) };

  // The slow network: the hotel books the room, but its reply never reaches RoomFinder.
  const isSlow = !isAna && random() < 0.03;
  let sent = 0;
  const send = async (r: SiteRequest) => {
    sent++;
    const req = { ...r, headers: Object.fromEntries(Object.entries(r.headers).map(([k, v]) => [k.toLowerCase(), v])) };
    const res = r.path === "/reservations/cancel" ? cancel(req, hotel) : book(req, hotel);
    if (isSlow && sent === 1) throw new Error("timed out after 10s");
    return res;
  };

  const result = await bookRoom(send, booking, "seed");
  const status = result.kind !== "confirmed" ? "failed" : !isAna && random() < 0.06 ? "cancelled" : "booked";
  if (status === "cancelled") await cancelBooking(send, booking, "seed");
  bookings.push({ ...booking, email: `${first}.${last}${n}@example.com`.toLowerCase(), nights, price: nights * NIGHTLY_RATE, status });
}

const write = (path: string, value: unknown) => writeFileSync(join(ROOT, path), JSON.stringify(value, null, 2) + "\n");
write("demo/roomfinder/data/bookings.json", bookings);
write("demo/seaside-inn/data/reservations.json", hotel.booked());
console.log(`${bookings.length} RoomFinder bookings, ${bookings.filter((b) => b.status === "failed").length} refused, ${hotel.booked().length} Seaside Inn reservations`);
