import { canonical } from "./canonical.ts";
import type { HarmKind, Impact, SealedContract, Verdict, VerdictSet } from "./contract.ts";
import type { GateResult } from "./engine.ts";

// Chat reports are read by people who are not engineers: titles and plain words, no ids, JSON or hashes,
// unless an adapter gave no plain-language description, in which case the raw values are the honest fallback.
function line(v: Verdict, would = "would"): string {
  if (v.pass) return `✅ ${v.title}${v.expectedText ? `: ${v.expectedText}, correct.` : "."}`;
  if (v.expectedText && v.gotText) return `❌ ${v.title}: should **${v.expectedText}**, but ${would} **${v.gotText}**.`;
  return `❌ ${v.title}: expected \`${canonical(v.intent)}\`, got \`${canonical(v.actual)}\`.`;
}

export function verdictReport(set: VerdictSet): string {
  const failed = set.verdicts.filter((v) => !v.pass);
  const head =
    failed.length === 0
      ? `**${set.checkedBy} ran ${set.verdicts.length === 2 ? "both" : `all ${set.verdicts.length}`} of ${set.casesFrom}'s cases on its own system: every one works.**`
      : `**${set.checkedBy} ran ${set.verdicts.length} of ${set.casesFrom}'s cases on its own system: ${failed.length} would go wrong.**`;
  const rows = [...failed, ...set.verdicts.filter((v) => v.pass)].map((v) => line(v));
  return [head, "", ...rows, "", "No source code was shared."].join("\n");
}

export function contractReport(c: SealedContract): string {
  const parts = c.verdicts.map((v) => {
    const failed = v.verdicts.filter((x) => !x.pass).length;
    return `${v.checkedBy} checked ${v.verdicts.length} of ${v.casesFrom}'s cases: ${failed === 0 ? "all work" : `${failed} ${failed === 1 ? "goes" : "go"} wrong`}`;
  });
  return [`**Contract ${c.id}**`, ...parts.map((p) => `- ${p}`), "", "It counts once one person from each company approves it."].join("\n");
}

export function gateReport(company: string, g: GateResult): string {
  if (g.ok) return `✅ **${company}'s change keeps contract ${g.contractId}.** Safe to release.`;
  const lines = [`🛑 **Hold the release: this ${company} change breaks contract ${g.contractId}.**`, ""];
  for (const r of g.regressions) lines.push(line(r, "now would"));
  const changed = g.changedCases.length;
  if (changed) lines.push("", `${company} also behaves differently in ${changed} of its own test case${changed === 1 ? "" : "s"}, so the other company needs to check ${changed === 1 ? "it" : "them"} again.`);
  return lines.join("\n");
}

const HARM: Record<HarmKind, string> = {
  "wrong-amount": "billed the wrong amount",
  "billed-twice": "billed twice",
  "owed-nothing": "billed though they owed nothing",
};

export function impactReport(i: Impact): string {
  const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: i.currency, maximumFractionDigits: 0 });
  if (i.harmed.length === 0) return `✅ **All ${i.checked} ${i.agreedBy} bookings were billed right by ${i.billedBy}.**`;
  const head = `**${i.harmed.length} of ${i.checked} ${i.agreedBy} bookings were billed wrong by ${i.billedBy}: ${money(i.overbilled)} too much.**`;
  const lines = (Object.keys(HARM) as HarmKind[]).flatMap((k) => {
    const group = i.harmed.filter((h) => h.kind === k);
    return group.length ? [`- ${group.length} ${HARM[k]}: ${money(group.reduce((s, h) => s + Math.max(0, h.billed - h.agreed), 0))}`] : [];
  });
  return [head, "", ...lines, "", "Compared by booking number and amount only. No names, emails or card details left either company."].join("\n");
}
