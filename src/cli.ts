#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import type { Bundle, SealedContract, VerdictSet } from "./contract.ts";
import { extract, gate, loadAdapter, seal, verify } from "./engine.ts";
import { contractReport, gateReport, verdictReport } from "./report.ts";

const USAGE = `handshake: verify an integration against both companies' real code, without sharing source.

  handshake extract <adapter.ts> [-o bundle.json]
      Run your own code, record what it sends or emits. Prints the bundle you share.
  handshake verify <adapter.ts> <their-bundle.json> [-o verdicts.json] [--md]
      Run the other company's cases against your own code.
  handshake seal <bundle.json> <bundle.json> <verdicts.json> <verdicts.json> [-o contract.json] [--md]
      Combine both bundles and both verdict sets into one contract with a stable id.
  handshake gate <adapter.ts> <contract.json> [--md]
      Check your current code still honours a sealed contract. Exits 1 if not.
  handshake report <verdicts.json> | <contract.json>
      Print a chat-sized markdown summary.`;

const readJson = async <T>(path: string): Promise<T> => JSON.parse(await readFile(path, "utf8")) as T;

async function emit(value: unknown, out: string | undefined) {
  const text = JSON.stringify(value, null, 2) + "\n";
  if (out) await writeFile(out, text);
  else process.stdout.write(text);
}

async function main(argv: string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: { out: { type: "string", short: "o" }, md: { type: "boolean" }, help: { type: "boolean", short: "h" } },
  });
  const [cmd, ...args] = positionals;
  if (!cmd || values.help) {
    process.stdout.write(USAGE + "\n");
    return 0;
  }
  const need = (n: number) => {
    if (args.length !== n) throw new UsageError(`${cmd} takes ${n} argument${n === 1 ? "" : "s"}`);
  };

  switch (cmd) {
    case "extract": {
      need(1);
      await emit(await extract(await loadAdapter(args[0])), values.out);
      return 0;
    }
    case "verify": {
      need(2);
      const set = await verify(await loadAdapter(args[0]), await readJson<Bundle>(args[1]));
      if (values.out) await emit(set, values.out);
      if (values.md || !values.out) process.stdout.write(values.md ? verdictReport(set) + "\n" : JSON.stringify(set, null, 2) + "\n");
      return 0;
    }
    case "seal": {
      need(4);
      const [b1, b2, v1, v2] = await Promise.all(args.map((p) => readJson<Bundle & VerdictSet>(p)));
      const contract = seal([b1, b2], [v1, v2]);
      if (values.out) await emit(contract, values.out);
      if (values.md || !values.out) process.stdout.write(values.md ? contractReport(contract) + "\n" : JSON.stringify(contract, null, 2) + "\n");
      return 0;
    }
    case "gate": {
      need(2);
      const adapter = await loadAdapter(args[0]);
      const result = await gate(adapter, await readJson<SealedContract>(args[1]));
      process.stdout.write((values.md ? gateReport(adapter.company, result) : JSON.stringify(result, null, 2)) + "\n");
      return result.ok ? 0 : 1;
    }
    case "report": {
      need(1);
      const doc = await readJson<VerdictSet & SealedContract>(args[0]);
      process.stdout.write(("bundles" in doc ? contractReport(doc) : verdictReport(doc)) + "\n");
      return 0;
    }
    default:
      throw new UsageError(`unknown command: ${cmd}`);
  }
}

class UsageError extends Error {}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (err) => {
    process.stderr.write(`handshake: ${err instanceof Error ? err.message : String(err)}\n`);
    if (err instanceof UsageError) process.stderr.write(`\n${USAGE}\n`);
    process.exit(2);
  },
);
