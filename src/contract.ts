export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type HttpRequest = {
  method: string;
  path: string;
  headers: Record<string, string>;
  body: Json;
};

export type HttpResponse = { status: number; body: Json };

/** One thing one side does to the other, plus what it is meant to cause. */
export type Case = {
  id: string;
  title: string;
  /** Tells the other side's adapter how to apply `input`, e.g. "charge" or "webhooks". */
  kind: string;
  input: Json;
  intent: Json;
};

/** What a company shares about its own side. Contains no source code. */
export type Bundle = {
  version: 1;
  company: string;
  cases: Case[];
};

export type Verdict = {
  id: string;
  title: string;
  kind: string;
  pass: boolean;
  intent: Json;
  actual: Json;
  note?: string;
  /** Plain-language versions of intent and actual, from the checking company's adapter. */
  expectedText?: string;
  gotText?: string;
};

export type VerdictSet = {
  version: 1;
  /** The company whose code ran the cases. */
  checkedBy: string;
  /** The company that wrote the cases. */
  casesFrom: string;
  bundleHash: string;
  verdicts: Verdict[];
};

/** The version both companies approve. Its id is a hash of everything inside. */
export type SealedContract = {
  version: 1;
  id: string;
  bundles: Bundle[];
  verdicts: VerdictSet[];
};

/** One booking or order, by the number both companies already know it by. No names, emails or card details. */
export type AmountEntry = { ref: string; amount: number; note?: string };

/** How a report names what was compared, e.g. "shared bills", "bill number", "charged". Bookings when absent. */
export type Wording = { items: string; ref: string; verb: string };

/** What one company's records say each customer owes ("agreed") or was billed ("billed"). */
export type Amounts = {
  version: 1;
  company: string;
  kind: "agreed" | "billed";
  /** ISO 4217 code, e.g. "USD". */
  currency: string;
  entries: AmountEntry[];
  wording?: Wording;
};

export type HarmKind = "wrong-amount" | "billed-twice" | "owed-nothing";

export type Harm = {
  ref: string;
  kind: HarmKind;
  agreed: number;
  billed: number;
  agreedNote?: string;
  billedNotes: string[];
};

/** Every customer the two companies' records disagree about. */
export type Impact = {
  version: 1;
  agreedBy: string;
  billedBy: string;
  currency: string;
  checked: number;
  harmed: Harm[];
  /** Billed minus agreed, summed over customers billed too much. */
  overbilled: number;
  wording?: Wording;
};

/** Written by each company, next to its own code. */
export type Adapter = {
  company: string;
  /** Run our own code and record what it sends or emits, with what it is meant to cause. */
  extract(): Promise<Case[]>;
  /** Run the other side's case against our own code and report what actually happens. */
  apply(c: Case): Promise<Json>;
  /** Optional: say what a result means in plain words, e.g. "charge ¥500,000". Used in chat reports. */
  describe?(kind: string, value: Json): string | undefined;
  /** Optional: what the company's own records say each customer agreed to pay, or was billed. */
  amounts?(): Promise<Omit<Amounts, "version" | "company">>;
};

export const unsupported = (kind: string): Json => ({ unsupported: kind });
