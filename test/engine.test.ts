import assert from "node:assert/strict";
import { test } from "node:test";
import { aliasRandomIds, canonical, hash } from "../src/canonical.ts";
import type { Adapter, Case, Json } from "../src/contract.ts";
import { extract, gate, seal, verify } from "../src/engine.ts";

const doubler = (company: string, factor = 2, cases: Case[] = []): Adapter => ({
  company,
  extract: async () => cases,
  apply: async (c) => ({ out: (c.input as { n: number }).n * factor }),
});

const caseOf = (id: string, n: number, out: number): Case => ({ id, title: id, kind: "math", input: { n }, intent: { out } });

test("canonical ignores key order", () => {
  assert.equal(canonical({ b: 1, a: [{ d: 2, c: 3 }] }), canonical({ a: [{ c: 3, d: 2 }], b: 1 }));
  assert.equal(hash({ x: 1, y: 2 }), hash({ y: 2, x: 1 }));
});

test("aliasRandomIds keeps equality between ids but drops the random values", () => {
  const a = "0b6f7c4e-1d2a-4f3b-9c8d-7e6f5a4b3c2d";
  const b = "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d";
  assert.deepEqual(aliasRandomIds([a, a, b, "plain"]), ["uuid-1", "uuid-1", "uuid-2", "plain"]);
});

test("extract redacts credentials and rejects duplicate ids", async () => {
  const req: Json = { requests: [{ headers: { Authorization: "Bearer sk_live_123", "X-Trace": "t1" } }] };
  const bundle = await extract({ company: "A", extract: async () => [{ id: "c", title: "c", kind: "k", input: req, intent: null }], apply: async () => null });
  assert.equal(JSON.stringify(bundle).includes("sk_live_123"), false);
  assert.match(JSON.stringify(bundle), /X-Trace/);

  const dup = doubler("A", 2, [caseOf("x", 1, 2), caseOf("x", 2, 4)]);
  await assert.rejects(extract(dup), /duplicate case id: x/);
});

test("verify passes matching intent, fails mismatches, and turns crashes into verdicts", async () => {
  const theirs = await extract(doubler("B", 2, [caseOf("ok", 2, 4), caseOf("bad", 2, 5)]));
  const set = await verify(doubler("A"), theirs);
  assert.deepEqual(set.verdicts.map((v) => [v.id, v.pass]), [["ok", true], ["bad", false]]);

  const crashing: Adapter = { company: "A", extract: async () => [], apply: async () => { throw new Error("boom"); } };
  const crashed = await verify(crashing, theirs);
  assert.deepEqual(crashed.verdicts[0].actual, { error: "boom" });
  assert.equal(crashed.verdicts[0].pass, false);
});

test("verify refuses a company's own bundle", async () => {
  await assert.rejects(verify(doubler("A"), await extract(doubler("A"))), /own bundle/);
});

test("seal rejects verdicts made against a stale bundle", async () => {
  const a = await extract(doubler("A", 2, [caseOf("a1", 1, 2)]));
  const b = await extract(doubler("B", 2, [caseOf("b1", 1, 2)]));
  const vA = await verify(doubler("A"), b);
  const vB = await verify(doubler("B"), a);
  const contract = seal([a, b], [vA, vB]);
  assert.equal(contract.id, seal([b, a], [vB, vA]).id, "order of arguments does not change the id");

  const bChanged = await extract(doubler("B", 2, [caseOf("b1", 1, 2), caseOf("b2", 2, 4)]));
  assert.throws(() => seal([a, bChanged], [vA, vB]), /older B bundle/);
});

test("gate catches a regression and a changed case", async () => {
  const ours = [caseOf("a1", 1, 2)];
  const a = await extract(doubler("A", 2, ours));
  const b = await extract(doubler("B", 2, [caseOf("b1", 3, 6)]));
  const contract = seal([a, b], [await verify(doubler("A", 2, ours), b), await verify(doubler("B"), a)]);

  assert.equal((await gate(doubler("A", 2, ours), contract)).ok, true);

  const broken = await gate(doubler("A", 3, ours), contract);
  assert.equal(broken.ok, false);
  assert.deepEqual(broken.regressions.map((r) => r.id), ["b1"]);

  const changed = await gate(doubler("A", 2, [caseOf("a1", 1, 3)]), contract);
  assert.deepEqual(changed.changedCases.map((c) => c.id), ["a1"]);
});
