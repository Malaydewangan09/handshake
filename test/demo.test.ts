import assert from "node:assert/strict";
import { test } from "node:test";
import { extract, loadAdapter, verify } from "../src/engine.ts";

const hotel = await loadAdapter("demo/seaside-inn/handshake.config.ts");
const site = await loadAdapter("demo/roomfinder/handshake.config.ts");

const failing = async (checker: typeof hotel, author: typeof hotel) =>
  (await verify(checker, await extract(author))).verdicts.filter((v) => !v.pass).map((v) => v.id).sort();

test("Seaside Inn finds the date mix-up, the double booking and the charged cancellation", async () => {
  assert.deepEqual(await failing(hotel, site), ["book-1-night", "book-slow-network", "book-then-cancel"]);
});

test("a 1-night stay is booked as 31 nights", async () => {
  const set = await verify(hotel, await extract(site));
  const v = set.verdicts.find((x) => x.id === "book-1-night")!;
  assert.deepEqual(v.actual, { stays: [{ nights: 31, charge: 3720 }] });
  assert.equal(v.gotText, "book 31 nights for $3,720");
});

test("RoomFinder shows the hotel's replies correctly", async () => {
  assert.deepEqual(await failing(site, hotel), []);
});

test("bundles are deterministic and carry no credentials", async () => {
  const a = JSON.stringify(await extract(site));
  assert.equal(a, JSON.stringify(await extract(site)));
  assert.equal(/Bearer /.test(a), false);
});
