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
  /** Its own booking records, relative to its folder. */
  records: string;
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
  records: "data/reservations.json",
};

export const SITE: Company = {
  slug: "roomfinder",
  name: "RoomFinder",
  agent: "roomfinder-agent",
  github: "roomfinder-github",
  person: { name: "Arjun Mehta", email: "arjun@roomfinder.test" },
  repo: join(ROOT, "demo/roomfinder"),
  workdir: worktree("roomfinder", "roomfinder"),
  records: "data/bookings.json",
};

export const ROOM_NAME = "seaside-inn-roomfinder";
export const WATCHER = "seaside-inn-watcher";
/** Where the signed agreement lives once merged. The release check reads it from here. */
export const CONTRACT_FILE = "handshake.contract.json";
/** Pull requests from the agents target this branch, which the reset script rewinds. */
export const DEMO_BRANCH = "demo";

const SEALER =
  "When both test results documents show every case passing, load the latest test cases and test results from both companies, run `seal`, and save the JSON as `Signed contract`. Post one line in the main channel: everything works, and the agreement number. Then ask your own person to sign (step 8), and ask the other agent in the working thread to get its person's signature.";
const NOT_SEALER =
  "Seaside Inn's agent prepares the agreement once every case passes. When it asks for your person's signature, check that `Signed contract` matches your latest test cases and results, then do step 8.";
const AFTER_SIGNING =
  "When both signature documents exist, write `Signed contract` exactly as stored to `handshake.contract.json` in your working directory on a new branch `handshake/seaside/agreement`, and commit it as `chore(seaside): add the signed agreement with RoomFinder`, and open a pull request with that title. Post one line in the main channel: signed by both people, and once this pull request is merged every Seaside Inn update is checked against the agreement before release, with the link.";

const IMPACT_COUNTER =
  "When `RoomFinder amounts` exists too, load it, write it to `.handshake/roomfinder.amounts.json` exactly as stored, run `impact`, and post the markdown report in the main channel unchanged. Add one line on how much of it each company's problems caused, from `.handshake/impact.json` and who owns each problem. Then tell RoomFinder's agent in the working thread that the report is posted.";
const IMPACT_CHECKER =
  "Seaside Inn's agent compares both and posts who was hit. When it has, load `Seaside Inn amounts`, write it to `.handshake/seaside.amounts.json` exactly as stored, run `impact` yourself, and say in one line in the working thread whether you get the same guests and total.";
const REFUND_QUESTION =
  "header `Refunds`, question \"Refund <n> guests <total> for RoomFinder bookings we billed wrong?\", options `Refund` and `Not yet`. On Refund, write `.handshake/refunds.csv` from your records and `.handshake/impact.json`: one row per guest with our reservation number, the guest's name and the refund (for a guest billed twice, the extra reservation). Post one line in the main channel: how many refunds, the total, and that the list is with accounts.";
const APOLOGY_QUESTION =
  "header `Guests`, question \"Email the <n> guests an apology, with what Seaside Inn is refunding each?\", options `Send` and `Not yet`. On Send, write `.handshake/guest-emails.csv` from your records and `.handshake/impact.json`: one row per guest with their email, the booking number and the refund. Post one line in the main channel: how many emails are ready to go out.";

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
    records: c.records,
    impact_rule: c === HOTEL ? IMPACT_COUNTER : IMPACT_CHECKER,
    impact_question: c === HOTEL ? REFUND_QUESTION : APOLOGY_QUESTION,
    sealer_rule: c === HOTEL ? SEALER : NOT_SEALER,
    after_approval_rule: c === HOTEL ? AFTER_SIGNING : "",
  };
  return template.replace(/\{(\w+)\}/g, (m, k: string) => values[k] ?? m);
}

export const roomInstructions = (): string => readFileSync(join(here, "instructions/room.md"), "utf8");
