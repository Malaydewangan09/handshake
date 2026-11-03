// Sets up both companies on a local Switch server: users, one controller and one Claude Code agent
// per company, the shared room, addressing rules and Seaside Inn's watcher. Safe to run again.
import { execFileSync, spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { type Company, DEMO_BRANCH, instructions, HOTEL, ROOM_NAME, ROOT, roomInstructions, SITE, WATCHER } from "./companies.ts";

const HERE = join(ROOT, "switch");
const STATE_DIR = join(HERE, ".state");
const STATE_FILE = join(STATE_DIR, "state.json");
const TOOLS = join(HERE, ".tools");
const CONTROLLER = join(TOOLS, "node_modules/.bin/switch-agent-controller");
const CONTROLLER_URL = "https://github.com/sandbox-quantum/switch/releases/download/switch-agent-controller-v0.31.0/switch-agent-controller-0.31.0.tgz";
const CONTROLLER_SHA256 = "ee62d4331c741cd6e56580b00bab44dc2b67de801d05d444bbbbb03c6dde6e47";

const env = Object.fromEntries(
  readFileSync(join(HERE, ".env"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const API = `http://localhost:${env.API_HOST_PORT ?? 8000}`;

type CompanyState = { password: string; controllerId?: string; agentId?: string };
type ChatUser = { id: string; username: string; password: string };
type State = {
  companies: Record<string, CompanyState>;
  roomId?: string;
  watcher?: { id: string; apiKey: string };
  github?: Record<string, { id: string; apiKey: string }>;
  chat?: { bridgeId: string; teamId: string; users: Record<string, ChatUser> };
};

mkdirSync(STATE_DIR, { recursive: true });
const state: State = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, "utf8")) : { companies: {} };
const save = () => writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), { mode: 0o600 });

class Gateway {
  #cookie = "";
  readonly who: string;
  constructor(who: string) {
    this.who = who;
  }

  async login(email: string, password: string) {
    const res = await fetch(`${API}/gateway/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(`login ${email}: ${res.status} ${await res.text()}`);
    this.#cookie = res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
    return this;
  }

  async call<T = any>(method: string, path: string, body?: unknown, okStatuses: number[] = []): Promise<T> {
    const res = await fetch(`${API}/gateway${path}`, {
      method,
      headers: { cookie: this.#cookie, ...(body !== undefined && { "content-type": "application/json" }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok && !okStatuses.includes(res.status)) throw new Error(`${this.who} ${method} ${path}: ${res.status} ${text}`);
    return (text ? JSON.parse(text) : null) as T;
  }
}

const log = (msg: string) => console.log(`- ${msg}`);
const list = <T>(v: any, key: string): T[] => (Array.isArray(v) ? v : (v?.[key] ?? v?.items ?? []));

async function ensureUser(admin: Gateway, c: Company): Promise<Gateway> {
  const s = (state.companies[c.slug] ??= { password: randomBytes(12).toString("hex") });
  const users = list<{ email: string }>(await admin.call("GET", "/users"), "users");
  if (!users.some((u) => u.email === c.person.email)) {
    await admin.call("POST", "/users", { name: c.person.name, email: c.person.email, password: s.password });
    log(`created user ${c.person.name} <${c.person.email}>`);
  }
  save();
  return new Gateway(c.person.name).login(c.person.email, s.password);
}

async function ensureControllerInstalled() {
  if (existsSync(CONTROLLER)) return;
  const res = await fetch(CONTROLLER_URL);
  if (!res.ok) throw new Error(`download ${CONTROLLER_URL}: ${res.status}`);
  const tgz = Buffer.from(await res.arrayBuffer());
  const sha = createHash("sha256").update(tgz).digest("hex");
  if (sha !== CONTROLLER_SHA256) throw new Error(`controller download has sha256 ${sha}, expected ${CONTROLLER_SHA256}. Not installing it.`);
  mkdirSync(TOOLS, { recursive: true });
  writeFileSync(join(TOOLS, "controller.tgz"), tgz);
  execFileSync("npm", ["install", "--prefix", TOOLS, "--ignore-scripts", "--no-audit", "--no-fund", "./controller.tgz"], { cwd: TOOLS, stdio: "inherit" });
  log("installed switch-agent-controller 0.31.0");
}

async function ensureController(g: Gateway, c: Company): Promise<string> {
  const s = state.companies[c.slug];
  const dataDir = join(STATE_DIR, "controllers", c.slug);
  const name = `${c.slug}-machine`;
  if (!existsSync(join(dataDir, "identity.json")) && !s.controllerId) {
    const { code } = await g.call<{ code: string }>("POST", "/management/enrollment-codes");
    execFileSync(CONTROLLER, ["enroll", "--server", API, "--code", code, "--name", name, "--data-dir", dataDir, "--secret-store", "file"], { stdio: "inherit" });
    log(`enrolled controller ${name}`);
  }
  startController(c, dataDir);
  // An agent can only be placed on a controller that has connected at least once.
  let online = false;
  for (let i = 0; i < 30 && !online; i++) {
    const found = list<{ id: string; name: string; state: string }>(await g.call("GET", "/management/controllers"), "controllers").find((x) => x.name === name);
    if (found) s.controllerId = found.id;
    online = found?.state === "online";
    if (!online) await new Promise((r) => setTimeout(r, 1000));
  }
  if (!online || !s.controllerId) throw new Error(`controller ${name} did not come online for ${c.person.name}, see .state/${c.slug}-controller.log`);
  save();
  return s.controllerId;
}

function startController(c: Company, dataDir: string) {
  const pidFile = join(STATE_DIR, `${c.slug}-controller.pid`);
  if (existsSync(pidFile)) {
    try {
      process.kill(Number(readFileSync(pidFile, "utf8")), 0);
      return; // already running
    } catch {}
  }
  const out = openSync(join(STATE_DIR, `${c.slug}-controller.log`), "a");
  const child = spawn(CONTROLLER, ["run", "--data-dir", dataDir], { detached: true, stdio: ["ignore", out, out] });
  child.unref();
  writeFileSync(pidFile, String(child.pid));
  log(`started ${c.slug} controller (pid ${child.pid}, log .state/${c.slug}-controller.log)`);
}

async function ensureAgent(g: Gateway, c: Company, other: Company): Promise<string> {
  const s = state.companies[c.slug];
  const definition = { provider: "claude", instructions: instructions(c, other), directory: c.workdir, auto_mode: true };
  const existing = list<{ agent_id: string; name: string }>(await g.call("GET", "/management/agents"), "agents").find((a) => a.name === c.agent);
  if (existing) {
    await g.call("PUT", `/management/agents/${existing.agent_id}`, { controller_id: s.controllerId, desired_state: "running", definition });
    s.agentId = existing.agent_id;
    log(`updated ${c.agent}`);
  } else {
    const body = {
      name: c.agent,
      description: `Handshake agent for ${c.name}. Works only for ${c.name}.`,
      controller_id: s.controllerId,
      desired_state: "running",
      definition,
    };
    // A fresh controller reports which provider CLIs it has a few seconds after it comes online.
    let created: { agent_id: string } | undefined;
    for (let i = 0; !created; i++) {
      try {
        created = await g.call<{ agent_id: string }>("POST", "/management/agents", body);
      } catch (err) {
        if (i >= 30 || !String(err).includes("provider_not_installed")) throw err;
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    s.agentId = created.agent_id;
    log(`created ${c.agent} on ${c.slug}-machine`);
  }
  save();
  return s.agentId!;
}

async function ensureRoom(admin: Gateway, host: Gateway): Promise<string> {
  const payId = state.companies.seaside.agentId!;
  const storeId = state.companies.roomfinder.agentId!;
  if (!state.roomId) {
    // A private Mattermost channel with both people in it. Switch creates the channel.
    const room = await host.call<{ id?: string; room_id?: string }>("POST", "/rooms", {
      name: `${ROOM_NAME}-${Date.now().toString(36)}`,
      description: "Seaside Inn and RoomFinder check their integration against each other's real code.",
      instructions: roomInstructions(),
      bridge_id: state.chat!.bridgeId,
      channel_type: "channel_private",
      agent_ids: [payId],
      user_names: [HOTEL, SITE].map(chatUsername),
    });
    state.roomId = room.id ?? room.room_id;
    save();
    log("created room and its private Mattermost channel");
  }
  // Seaside Inn hosts the room and brings RoomFinder's agent in. Adding an agent that is already there is a no-op.
  await host.call("POST", `/rooms/${state.roomId}/agents`, { agent_ids: [payId, storeId] }, [409]);
  void admin;
  return state.roomId!;
}

const MM = `http://localhost:${env.MATTERMOST_HOST_PORT ?? 8065}`;
// first.last: unique per person, and easy to type at the login screen.
const chatUsername = (c: Company) => c.person.name.toLowerCase().replace(/ /g, ".");

async function mm<T = any>(token: string, method: string, path: string, body?: unknown, okStatuses: number[] = []): Promise<T> {
  const res = await fetch(`${MM}/api/v4${path}`, {
    method,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok && !okStatuses.includes(res.status)) throw new Error(`mattermost ${method} ${path}: ${res.status} ${text}`);
  return (text ? JSON.parse(text) : null) as T;
}

/** Each person gets a Mattermost account, linked to their Switch user so their own agent knows them. */
async function ensureChatAccounts(admin: Gateway, people: Map<Company, Gateway>) {
  const login = await fetch(`${MM}/api/v4/users/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ login_id: env.MATTERMOST_ADMIN_USER, password: env.MATTERMOST_ADMIN_PASSWORD }),
  });
  if (!login.ok) throw new Error(`mattermost admin login: ${login.status}`);
  const token = login.headers.get("token")!;
  const team = await mm<{ id: string }>(token, "GET", `/teams/name/${env.MATTERMOST_TEAM_NAME}`);
  const bridges = list<{ bridge_id: string; bridge_type: string }>(await admin.call("GET", "/collaborations"), "collaborations");
  const bridge = bridges.find((b) => b.bridge_type === "mattermost");
  if (!bridge) throw new Error("no Mattermost connection on the Switch server; run `docker compose up -d` in switch/");
  state.chat = { bridgeId: bridge.bridge_id, teamId: team.id, users: state.chat?.users ?? {} };

  for (const [c, g] of people) {
    const username = chatUsername(c);
    // Short, typeable passwords: these are local demo accounts on this machine only.
    const password = state.chat.users[c.slug]?.password ?? `${c.person.name.split(" ")[0].toLowerCase()}-demo-1`;
    // A 404 body also has an `id` (the error id), so match on the username instead.
    let user = await mm<{ id: string; username?: string }>(token, "GET", `/users/username/${username}`, undefined, [404]);
    if (user.username !== username) {
      const [first, last] = c.person.name.split(" ");
      user = await mm<{ id: string }>(token, "POST", "/users", { username, email: c.person.email, password, first_name: first, last_name: last });
      log(`created Mattermost account @${username}`);
    }
    await mm(token, "POST", `/teams/${team.id}/members`, { team_id: team.id, user_id: user.id });
    state.chat.users[c.slug] = { id: user.id, username, password };
    save();
    // Switch only accepts a claim for an account its bridge has seen, so retry while the directory catches up.
    for (let i = 0; ; i++) {
      try {
        await g.call("POST", `/collaborations/${bridge.bridge_id}/identities`, { external_user_id: user.id, username }, [409]);
        break;
      } catch (err) {
        if (i >= 20) throw err;
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }
  log("linked @maria and @arjun to their Switch users");
}

/** Owner and owner's agents everywhere, plus the other company's agent in this room only. Not its people. */
async function allowCounterpart(g: Gateway, agentId: string, counterpartAgentId: string, roomId: string) {
  await g.call("PUT", `/agents/${agentId}/addressing-policy`, {
    policy: {
      rules: [
        { rooms: "*", room_groups: "*", users: [], agents: [], owner: true, owner_agents: true },
        { rooms: [roomId], room_groups: "*", users: [], agents: [counterpartAgentId] },
      ],
    },
  });
}

async function ensureWatcher(host: Gateway, roomId: string) {
  if (!state.watcher) {
    const res = await host.call<{ id?: string; agent_id?: string; api_key: string }>("POST", "/agents/register-other", {
      name: WATCHER,
      description: "Runs Seaside Inn's pre-deploy gate against the sealed Handshake contract and posts the result.",
      overwrite: true,
    });
    state.watcher = { id: (res.id ?? res.agent_id)!, apiKey: res.api_key };
    save();
    log(`registered ${WATCHER}`);
  }
  await host.call("POST", `/rooms/${roomId}/agents`, { agent_ids: [state.watcher.id] }, [409]);
}

/** The agent's own checkout of the demo branch, holding only its company's folder and the shared CLI. */
function ensureWorktree(c: Company) {
  const dir = join(ROOT, ".worktrees", c.slug);
  const git = (...args: string[]) => execFileSync("git", args, { cwd: ROOT, stdio: ["ignore", "pipe", "inherit"] });
  git("fetch", "--quiet", "origin", DEMO_BRANCH);
  if (!existsSync(dir)) {
    git("worktree", "add", "--quiet", "--no-checkout", "--detach", dir, `origin/${DEMO_BRANCH}`);
    log(`created ${c.name}'s worktree`);
  }
  // Cone mode keeps top-level files plus these folders. The other company's folder is never written to disk.
  execFileSync("git", ["sparse-checkout", "set", "src", c.repo.slice(ROOT.length + 1)], { cwd: dir });
  execFileSync("git", ["checkout", "--quiet", "--detach", `origin/${DEMO_BRANCH}`], { cwd: dir });
}

/** Posts this company's pull request events. Owned by the company, so its own agent takes them as instructions. */
async function ensureGithubAgent(g: Gateway, c: Company, roomId: string) {
  state.github ??= {};
  if (!state.github[c.slug]) {
    const res = await g.call<{ id?: string; agent_id?: string; api_key: string }>("POST", "/agents/register-other", {
      name: c.github,
      description: `Posts ${c.name}'s pull request events from GitHub into the Handshake room.`,
      overwrite: true,
    });
    state.github[c.slug] = { id: (res.id ?? res.agent_id)!, apiKey: res.api_key };
    save();
    log(`registered ${c.github}`);
  }
  await g.call("POST", `/rooms/${roomId}/agents`, { agent_ids: [state.github[c.slug].id] }, [409]);
}

async function main() {
  const { values } = parseArgs({ options: { "new-room": { type: "boolean" } } });
  if (values["new-room"]) delete state.roomId;
  await ensureControllerInstalled();
  const admin = await new Gateway("admin").login(env.GATEWAY_ADMIN_EMAIL, env.GATEWAY_ADMIN_PASSWORD);
  const pay = await ensureUser(admin, HOTEL);
  const store = await ensureUser(admin, SITE);

  ensureWorktree(HOTEL);
  ensureWorktree(SITE);
  await ensureController(pay, HOTEL);
  await ensureController(store, SITE);
  const payAgent = await ensureAgent(pay, HOTEL, SITE);
  const storeAgent = await ensureAgent(store, SITE, HOTEL);

  await ensureChatAccounts(admin, new Map([[HOTEL, pay], [SITE, store]]));
  const roomId = await ensureRoom(admin, pay);
  await allowCounterpart(pay, payAgent, storeAgent, roomId);
  await allowCounterpart(store, storeAgent, payAgent, roomId);
  log("addressing: each agent answers its own company, plus the other company's agent in this room");
  await ensureWatcher(pay, roomId);
  await ensureGithubAgent(pay, HOTEL, roomId);
  await ensureGithubAgent(store, SITE, roomId);

  console.log(`\nReady. Room ${ROOM_NAME} (${roomId}).`);
  console.log(`Chat: ${MM}  (log in as one person per browser window)`);
  for (const c of [HOTEL, SITE]) {
    const u = state.chat!.users[c.slug];
    console.log(`  ${c.person.name} (${c.name}): ${u.username} / ${u.password}`);
  }
}

main().catch((err) => {
  console.error(`provision: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
