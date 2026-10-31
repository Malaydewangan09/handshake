import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { aliasRandomIds, equal, hash } from "./canonical.ts";
import type { Adapter, Bundle, Case, Json, SealedContract, Verdict, VerdictSet } from "./contract.ts";

const SECRET_HEADERS = new Set(["authorization", "cookie", "x-api-key", "proxy-authorization"]);

export async function loadAdapter(path: string): Promise<Adapter> {
  const mod = await import(pathToFileURL(resolve(path)).href);
  const adapter = mod.default as Adapter | undefined;
  if (!adapter || typeof adapter.extract !== "function" || typeof adapter.apply !== "function" || !adapter.company) {
    throw new Error(`${path} must default-export an adapter with company, extract() and apply()`);
  }
  return adapter;
}

/** Credentials never belong in a shared bundle, whatever the adapter captured. */
function redact(value: Json): Json {
  if (Array.isArray(value)) return value.map(redact);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) =>
        k === "headers" && v !== null && typeof v === "object" && !Array.isArray(v)
          ? [k, Object.fromEntries(Object.entries(v).map(([h, hv]) => [h, SECRET_HEADERS.has(h.toLowerCase()) ? "[redacted]" : hv]))]
          : [k, redact(v)],
      ),
    );
  }
  return value;
}

export async function extract(adapter: Adapter): Promise<Bundle> {
  const cases = await adapter.extract();
  const ids = new Set<string>();
  for (const c of cases) {
    if (ids.has(c.id)) throw new Error(`duplicate case id: ${c.id}`);
    ids.add(c.id);
  }
  return {
    version: 1,
    company: adapter.company,
    cases: cases.map((c) => ({ ...c, input: redact(aliasRandomIds(c.input)), intent: aliasRandomIds(c.intent) })),
  };
}

export async function verify(adapter: Adapter, theirs: Bundle): Promise<VerdictSet> {
  if (theirs.company === adapter.company) throw new Error(`refusing to verify ${adapter.company} against its own bundle`);
  const verdicts: Verdict[] = [];
  for (const c of theirs.cases) verdicts.push(await check(adapter, c));
  return { version: 1, checkedBy: adapter.company, casesFrom: theirs.company, bundleHash: hash(theirs as unknown as Json), verdicts };
}

async function check(adapter: Adapter, c: Case): Promise<Verdict> {
  const base = { id: c.id, title: c.title, kind: c.kind, intent: c.intent };
  const say = (v: Json): string | undefined => {
    try {
      return adapter.describe?.(c.kind, v);
    } catch {
      return undefined; // a description is a nicety, never a reason to lose the verdict
    }
  };
  const texts = (actual: Json) => {
    const expectedText = say(c.intent);
    const gotText = say(actual);
    return { ...(expectedText && { expectedText }), ...(gotText && { gotText }) };
  };
  try {
    const actual = await adapter.apply(c);
    const note = actual !== null && typeof actual === "object" && "unsupported" in actual ? `${adapter.company} has no handler for "${c.kind}"` : undefined;
    return { ...base, pass: equal(c.intent, actual), actual, ...(note && { note }), ...texts(actual) };
  } catch (err) {
    // A crash in our own code is a verdict, not a tool failure: the other side needs to hear about it.
    const actual = { error: err instanceof Error ? err.message : String(err) };
    return { ...base, pass: false, actual, ...texts(actual) };
  }
}

export function seal(bundles: Bundle[], verdicts: VerdictSet[]): SealedContract {
  if (bundles.length !== 2) throw new Error("a contract needs exactly two bundles, one per company");
  const [a, b] = bundles.toSorted((x, y) => x.company.localeCompare(y.company));
  const sets = verdicts.toSorted((x, y) => x.checkedBy.localeCompare(y.checkedBy));
  for (const v of sets) {
    const source = [a, b].find((x) => x.company === v.casesFrom);
    if (!source) throw new Error(`verdicts from ${v.checkedBy} refer to unknown company ${v.casesFrom}`);
    if (hash(source as unknown as Json) !== v.bundleHash) {
      throw new Error(`verdicts from ${v.checkedBy} were made against an older ${v.casesFrom} bundle, verify again`);
    }
  }
  const body = { version: 1 as const, bundles: [a, b], verdicts: sets };
  return { ...body, id: hash(body as unknown as Json) };
}

export type GateResult = {
  ok: boolean;
  contractId: string;
  /** Cases from the other company that passed when the contract was sealed and fail now. */
  regressions: Verdict[];
  /** Our own cases that changed since sealing, so the other company must verify again. */
  changedCases: { id: string; title: string }[];
};

/** Run before deploy: does our current code still honour the sealed contract? */
export async function gate(adapter: Adapter, contract: SealedContract): Promise<GateResult> {
  const ours = contract.bundles.find((b) => b.company === adapter.company);
  const theirs = contract.bundles.find((b) => b.company !== adapter.company);
  if (!ours || !theirs) throw new Error(`${adapter.company} is not a party to contract ${contract.id}`);

  const sealed = contract.verdicts.find((v) => v.checkedBy === adapter.company);
  const passedBefore = new Set(sealed?.verdicts.filter((v) => v.pass).map((v) => v.id));
  const now = await verify(adapter, theirs);
  const regressions = now.verdicts.filter((v) => !v.pass && passedBefore.has(v.id));

  const current = await extract(adapter);
  const before = new Map(ours.cases.map((c) => [c.id, hash(c as unknown as Json)]));
  const changedCases = [
    ...current.cases.filter((c) => before.get(c.id) !== hash(c as unknown as Json)),
    ...ours.cases.filter((c) => !current.cases.some((x) => x.id === c.id)),
  ].map((c) => ({ id: c.id, title: c.title }));

  return { ok: regressions.length === 0 && changedCases.length === 0, contractId: contract.id, regressions, changedCases };
}
