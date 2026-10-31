// Brings GitHub into the Handshake room. Polls the demo branch's pull requests and:
// - tells each company's agent, as that company's own GitHub agent, when its pull request is merged or closed
// - when Seaside Inn's release check fails on a pull request, runs the watcher on that code so the room hears why
//   node switch/github-sync.ts [--once]
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { type Company, DEMO_BRANCH, HOTEL, ROOT, SITE } from "./companies.ts";

const HERE = join(ROOT, "switch");
const SEEN_FILE = join(HERE, ".state/github-sync.json");
const CHECK_NAME = "Agreement with RoomFinder";
const POLL_MS = 10_000;

// Re-read on every use: a reset opens a new room while this keeps running.
const currentState = () => JSON.parse(readFileSync(join(HERE, ".state/state.json"), "utf8"));
const port = /^API_HOST_PORT=(\d+)/m.exec(readFileSync(join(HERE, ".env"), "utf8"))?.[1] ?? "8000";
const { values } = parseArgs({ options: { once: { type: "boolean" } } });

type Pr = { number: number; title: string; state: "OPEN" | "MERGED" | "CLOSED"; headRefName: string; headRefOid: string; url: string; files: { path: string }[] };
type Seen = { states: Record<number, string>; held: Record<number, string> };
const seen: Seen = existsSync(SEEN_FILE) ? JSON.parse(readFileSync(SEEN_FILE, "utf8")) : { states: {}, held: {} };
const save = () => writeFileSync(SEEN_FILE, JSON.stringify(seen, null, 2));

const sh = (cmd: string, args: string[]) => execFileSync(cmd, args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const log = (msg: string) => console.log(`${new Date().toISOString().slice(11, 19)} ${msg}`);

async function post(agent: { id: string; apiKey: string }, content: string) {
  const state = currentState();
  const res = await fetch(`http://localhost:${port}/agents/${agent.id}/message`, {
    method: "POST",
    headers: { authorization: `Bearer ${agent.apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({ room_id: state.roomId, content }),
  });
  if (!res.ok) throw new Error(`post to room: ${res.status} ${await res.text()}`);
}

/** The company that owns an agent's branch, or none for a person's own pull request. */
const owner = (pr: Pr): Company | undefined => [HOTEL, SITE].find((c) => pr.headRefName.startsWith(`handshake/${c.slug}/`));

async function onStateChange(pr: Pr, c: Company) {
  const agent = currentState().github?.[c.slug];
  if (!agent) throw new Error(`no GitHub agent for ${c.name}, run provision.ts`);
  if (pr.state === "MERGED") await post(agent, `Pull request #${pr.number} is merged and live: ${pr.title}\n\n@${c.agent} run the bookings again.`);
  if (pr.state === "CLOSED") await post(agent, `Pull request #${pr.number} was closed without merging: ${pr.title}\n\n@${c.agent}`);
}

/** Runs the watcher against the pull request's own code, in a throwaway worktree. */
function holdRelease(pr: Pr) {
  const ref = `refs/handshake/pr-${pr.number}`;
  sh("git", ["fetch", "--quiet", "origin", `+pull/${pr.number}/head:${ref}`]);
  const dir = mkdtempSync(join(tmpdir(), "handshake-pr-"));
  try {
    sh("git", ["worktree", "add", "--quiet", "--detach", dir, ref]);
    try {
      sh("node", [join(HERE, "watcher.ts"), "--repo", join(dir, "demo/seaside-inn"), "--change", `pull request #${pr.number}, ${pr.title}`]);
    } catch {
      // The watcher exits 1 when it holds a release, after it has posted.
    }
  } finally {
    sh("git", ["worktree", "remove", "--force", dir]);
  }
}

function checkFailed(pr: Pr): boolean {
  const checks = JSON.parse(sh("gh", ["pr", "checks", String(pr.number), "--json", "name,bucket"]) || "[]") as { name: string; bucket: string }[];
  return checks.some((c) => c.name === CHECK_NAME && c.bucket === "fail");
}

async function tick() {
  const prs = JSON.parse(
    sh("gh", ["pr", "list", "--base", DEMO_BRANCH, "--state", "all", "--limit", "30", "--json", "number,title,state,headRefName,headRefOid,url,files"]),
  ) as Pr[];
  for (const pr of prs) {
    const c = owner(pr);
    const before = seen.states[pr.number];
    if (before === undefined) {
      // First sight of an already finished pull request: remember it, but don't announce old news.
      seen.states[pr.number] = pr.state;
      if (pr.state !== "OPEN") continue;
    }
    if (c && before !== undefined && before !== pr.state) {
      log(`#${pr.number} ${before} -> ${pr.state}`);
      await onStateChange(pr, c);
    }
    seen.states[pr.number] = pr.state;

    const touchesHotel = pr.files.some((f) => f.path.startsWith("demo/seaside-inn/"));
    if (pr.state === "OPEN" && touchesHotel && seen.held[pr.number] !== pr.headRefOid && checkFailed(pr)) {
      log(`#${pr.number} breaks the agreement, holding`);
      holdRelease(pr);
      seen.held[pr.number] = pr.headRefOid;
    }
  }
  save();
}

let stopping = false;
for (const sig of ["SIGINT", "SIGTERM"] as const) process.on(sig, () => (stopping = true));

log(`watching pull requests into ${DEMO_BRANCH}`);
do {
  try {
    await tick();
  } catch (err) {
    log(`poll failed, will retry: ${err instanceof Error ? err.message.split("\n")[0] : err}`);
  }
  for (let waited = 0; !values.once && !stopping && waited < POLL_MS; waited += 500) await new Promise((r) => setTimeout(r, 500));
} while (!values.once && !stopping);
