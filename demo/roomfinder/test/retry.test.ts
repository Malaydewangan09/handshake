import assert from "node:assert/strict";
import { test } from "node:test";
import { bookRoom, type Request } from "../src/hotel-client.ts";

test("a retry after a slow first try reuses the booking number, so the guest is booked once", async () => {
  const sent: Request[] = [];
  const result = await bookRoom(async (req) => {
    sent.push(req);
    if (sent.length === 1) throw new Error("timed out");
    return { status: 201, body: { nights: 1, total: 120 } };
  }, { ref: "RF-1", guest: "Ana Silva", checkIn: "2026-05-10", checkOut: "2026-05-11" }, "key");

  assert.equal(sent.length, 2);
  assert.equal(sent[0].headers["Request-Id"], sent[1].headers["Request-Id"]);
  assert.deepEqual(result, { kind: "confirmed", nights: 1, total: 120 });
});
