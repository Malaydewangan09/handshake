import assert from "node:assert/strict";
import { test } from "node:test";
import { amounts, extract, impact, loadAdapter, verify } from "../src/engine.ts";
import { impactReport } from "../src/report.ts";

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

test("Sam's sheet charges Priya for the rent rise, the August internet twice and her half of October's maid", async () => {
  const sides = await Promise.all(["priya", "sam"].map(async (who) => amounts(await loadAdapter(`demo/flatmates/${who}/handshake.config.ts`))));
  const result = impact(sides);
  assert.deepEqual(
    result.harmed.map((h) => [h.ref, h.kind]),
    [["ACT-0826", "billed-twice"], ["MAID-1026", "owed-nothing"], ["RENT-0726", "wrong-amount"], ["RENT-0826", "wrong-amount"], ["RENT-0926", "wrong-amount"], ["RENT-1026", "wrong-amount"]],
  );
  assert.equal(result.overbilled, 7910);
  assert.match(impactReport(result), /^\*\*6 of 27 shared bills were charged wrong by Sam: ₹7,910 too much\.\*\*/);
  assert.match(impactReport(result), /Compared by bill number and amount only\./);
});
