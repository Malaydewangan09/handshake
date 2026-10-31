import assert from "node:assert/strict";
import { test } from "node:test";
import { book, cancel, Ledger } from "../src/reservations.ts";

const request = (body: unknown, id = "req-1") => ({ method: "POST", path: "/reservations", headers: { "request-id": id }, body });

test("books 2 nights at the nightly rate", () => {
  const res = book(request({ guest: "Ana", check_in: "04/03/2026", check_out: "04/05/2026", partner_ref: "RF-1" }), new Ledger());
  assert.equal(res.status, 201);
  assert.deepEqual(res.body, { reservation_id: "r_0001", nights: 2, total: 240, currency: "USD" });
});

test("the same Request-Id books only once", () => {
  const ledger = new Ledger();
  const body = { guest: "Ana", check_in: "04/03/2026", check_out: "04/04/2026", partner_ref: "RF-1" };
  book(request(body), ledger);
  book(request(body), ledger);
  assert.equal(ledger.booked().length, 1);
});

test("cancels by our reservation id", () => {
  const ledger = new Ledger();
  book(request({ guest: "Ana", check_in: "04/03/2026", check_out: "04/04/2026", partner_ref: "RF-1" }), ledger);
  const res = cancel({ method: "POST", path: "/reservations/cancel", headers: {}, body: { reservation_id: "r_0001" } }, ledger);
  assert.equal(res.status, 200);
  assert.equal(ledger.booked().length, 0);
});

test("cancels by the booking site's own reference, so the guest is not charged", () => {
  const ledger = new Ledger();
  book(request({ guest: "Ana", check_in: "06/01/2026", check_out: "06/02/2026", partner_ref: "RF-1003" }), ledger);
  const res = cancel({ method: "POST", path: "/reservations/cancel", headers: {}, body: { partner_ref: "RF-1003" } }, ledger);
  assert.equal(res.status, 200);
  assert.equal(ledger.booked().length, 0);
});
