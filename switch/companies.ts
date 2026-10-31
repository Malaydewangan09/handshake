import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(here, "..");

export type Company = {
  slug: string;
  name: string;
  agent: string;
  /** Custom agent that posts this company's pull request events into the room. */
  github: string;
  person: { name: string; email: string };
  /** The company's folder in this checkout. */
  repo: string;
  /** Its folder in the agent's own sparse worktree, where the other company's code is absent. */
  workdir: string;
};

const worktree = (slug: string, dir: string) => join(ROOT, ".worktrees", slug, "demo", dir);

export const HOTEL: Company = {
  slug: "seaside",
  name: "Seaside Inn",
  agent: "seaside-inn-agent",
  github: "seaside-inn-github",
  person: { name: "Maria Lopez", email: "maria@seaside.test" },
  repo: join(ROOT, "demo/seaside-inn"),
  workdir: worktree("seaside", "seaside-inn"),
};

export const SITE: Company = {
  slug: "roomfinder",
  name: "RoomFinder",
  agent: "roomfinder-agent",
  github: "roomfinder-github",
  person: { name: "Arjun Mehta", email: "arjun@roomfinder.test" },
  repo: join(ROOT, "demo/roomfinder"),
  workdir: worktree("roomfinder", "roomfinder"),
};

export const ROOM_NAME = "seaside-inn-roomfinder";
export const WATCHER = "seaside-inn-watcher";
/** Where the signed agreement lives once merged. The release check reads it from here. */
export const CONTRACT_FILE = "handshake.contract.json";
/** Pull requests from the agents target this branch, which the reset script rewinds. */
export const DEMO_BRANCH = "demo";

const SEALER =
  "When both test results documents show every case passing, load the latest test cases and test results from both companies, run `seal`, and save the JSON as `Signed contract`. Post one line in the main channel: everything works, and the agreement number. Then ask your own person to sign (step 7), and ask the other agent in the working thread to get its person's signature.";
const NOT_SEALER =
  "Seaside Inn's agent prepares the agreement once every case passes. When it asks for your person's signature, check that `Signed contract` matches your latest test cases and results, then do step 7.";
const AFTER_SIGNING =
  "When both signature documents exist, write `Signed contract` exactly as stored to `handshake.contract.json` in your working directory on a new branch `handshake/seaside/agreement`, and open a pull request titled \"Seaside Inn: signed agreement with RoomFinder\". Post one line in the main channel: signed by both people, and once this pull request is merged every Seaside Inn update is checked against the agreement before release, with the link.";

export function instructions(c: Company, other: Company): string {
  const template = readFileSync(join(here, "instructions/agent.md"), "utf8");
  const values: Record<string, string> = {
    agent: c.agent,
    company: c.name,
    slug: c.slug,
    counterpart: other.name,
    counterpart_agent: other.agent,
    counterpart_slug: other.slug,
    github_agent: c.github,
    sealer_rule: c === HOTEL ? SEALER : NOT_SEALER,
    after_approval_rule: c === HOTEL ? AFTER_SIGNING : "",
  };
  return template.replace(/\{(\w+)\}/g, (m, k: string) => values[k] ?? m);
}

export const roomInstructions = (): string => readFileSync(join(here, "instructions/room.md"), "utf8");
