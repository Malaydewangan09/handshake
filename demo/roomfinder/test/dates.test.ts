import assert from "node:assert/strict";
import { test } from "node:test";
import { bookRoom, type Request } from "../src/hotel-client.ts";

test("a European guest's 1 night on 3 April is sent to the hotel month first", async () => {
  const sent: Request[] = [];
  await bookRoom(async (req) => (sent.push(req), { status: 201, body: { nights: 1, total: 120 } }), { ref: "RF-1", guest: "G", site: "eu", checkIn: "2026-04-03", checkOut: "2026-04-04" });
  assert.deepEqual(sent[0].body, { guest: "G", check_in: "04/03/2026", check_out: "04/04/2026", partner_ref: "RF-1" });
});
