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

/** Written by each company, next to its own code. */
export type Adapter = {
  company: string;
  /** Run our own code and record what it sends or emits, with what it is meant to cause. */
  extract(): Promise<Case[]>;
  /** Run the other side's case against our own code and report what actually happens. */
  apply(c: Case): Promise<Json>;
  /** Optional: say what a result means in plain words, e.g. "charge ¥500,000". Used in chat reports. */
  describe?(kind: string, value: Json): string | undefined;
};

export const unsupported = (kind: string): Json => ({ unsupported: kind });
