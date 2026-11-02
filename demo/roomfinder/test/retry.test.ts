import assert from "node:assert/strict";
import { test } from "node:test";
import { bookRoom, type Request } from "../src/hotel-client.ts";

test("a retry after a timeout repeats the same Request-Id so the hotel books 1 room", async () => {
  const sent: Request[] = [];
  await bookRoom(async (req) => {
    sent.push(req);
    if (sent.length === 1) throw new Error("timed out");
    return { status: 201, body: { nights: 1, total: 120 } };
  }, { ref: "RF-1002", guest: "Guest", site: "us", checkIn: "2026-05-10", checkOut: "2026-05-11" }, "key");
  assert.equal(sent.length, 2);
  assert.equal(sent[1].headers["Request-Id"], sent[0].headers["Request-Id"]);
});
