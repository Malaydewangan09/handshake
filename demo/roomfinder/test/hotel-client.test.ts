import assert from "node:assert/strict";
import { test } from "node:test";
import { toResult } from "../src/hotel-client.ts";

test("shows a confirmed booking with the hotel's nights and total", () => {
  assert.deepEqual(toResult({ status: 201, body: { nights: 2, total: 240 } }), { kind: "confirmed", nights: 2, total: 240 });
});

test("shows sold out when the hotel is full", () => {
  assert.deepEqual(toResult({ status: 409, body: { error: "sold_out" } }), { kind: "sold_out" });
});

test("anything else is an error", () => {
  assert.deepEqual(toResult({ status: 500, body: {} }), { kind: "error" });
});
