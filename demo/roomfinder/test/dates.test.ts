import assert from "node:assert/strict";
import { test } from "node:test";
import { toHotelDate } from "../src/dates.ts";

test("sends 3 April month first so the hotel books 1 night, not 31", () => {
  assert.equal(toHotelDate("2026-04-03"), "04/03/2026");
  assert.equal(toHotelDate("2026-04-04"), "04/04/2026");
});
