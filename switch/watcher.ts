// Seaside Inn's pre-deploy check. Runs the Handshake gate against the approved contract and posts the
// result into the shared room as seaside-inn-watcher, a custom agent on Switch's agent protocol.
// Exit code follows the gate, so CI can block the deploy on it.
//   node switch/watcher.ts [--change "PR 212: rename amount to amount_minor"] [--repo <seaside-inn folder to check>]
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import type { SealedContract } from "../src/contract.ts";
import { gate, loadAdapter } from "../src/engine.ts";
import { gateReport } from "../src/report.ts";
import { CONTRACT_FILE, HOTEL, ROOT, SITE } from "./companies.ts";

const HERE = join(ROOT, "switch");
const state = JSON.parse(readFileSync(join(HERE, ".state/state.json"), "utf8"));
const port = /^API_HOST_PORT=(\d+)/m.exec(readFileSync(join(HERE, ".env"), "utf8"))?.[1] ?? "8000";
const { values } = parseArgs({ options: { change: { type: "string" }, quiet: { type: "boolean" }, repo: { type: "string" } } });

// The code under check, and the agreement it must honour. A pull request's checkout carries both.
const repo = values.repo ?? HOTEL.repo;
const adapter = await loadAdapter(join(repo, "handshake.config.ts"));
const contract = JSON.parse(readFileSync(join(repo, CONTRACT_FILE), "utf8")) as SealedContract;
const result = await gate(adapter, contract);

const header = values.change ? `Checked before release: ${values.change}\n\n` : "";
// Only Seaside Inn's own agent and person: RoomFinder's agent rightly refuses instructions from Seaside Inn's bot.
const owner = state.chat?.users?.[HOTEL.slug]?.username;
const footer = result.ok ? "" : `\n\n@${HOTEL.agent}${owner ? ` @${owner}` : ""} this release would break the agreement with ${SITE.name}, so it is held.`;
const content = header + gateReport(adapter.company, result) + footer;
console.log(content);

// Plain post through the agent API: needs no open connection, only the watcher's own key.
if (!(values.quiet && result.ok)) {
  const res = await fetch(`http://localhost:${port}/agents/${state.watcher.id}/message`, {
    method: "POST",
    headers: { authorization: `Bearer ${state.watcher.apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({ room_id: state.roomId, content }),
  });
  if (!res.ok) console.error(`watcher: could not post to the room: ${res.status} ${await res.text()}`);
}

process.exit(result.ok ? 0 : 1);
