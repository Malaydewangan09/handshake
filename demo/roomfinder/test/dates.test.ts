import assert from "node:assert/strict";
import { test } from "node:test";
import { bookRoom, type Request } from "../src/hotel-client.ts";

test("a European guest booking 3 to 4 April is sent month first, as 1 night", async () => {
  const sent: Request[] = [];
  await bookRoom(async (req) => (sent.push(req), { status: 201, body: { nights: 1, total: 120 } }), { ref: "RF-1001", guest: "Guest", site: "eu", checkIn: "2026-04-03", checkOut: "2026-04-04" }, "key");
  assert.deepEqual(sent[0].body, { guest: "Guest", check_in: "04/03/2026", check_out: "04/04/2026", partner_ref: "RF-1001" });
});
