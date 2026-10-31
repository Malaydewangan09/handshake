// Post into the Handshake channel in Mattermost as one of the demo people, or read it.
//   node switch/say.ts maria "@seaside-inn-agent start the handshake"
//   node switch/say.ts read [limit]
//   node switch/say.ts press maria Sign      (presses the newest button with that label, as that person)
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOM_NAME, ROOT } from "./companies.ts";

const HERE = join(ROOT, "switch");
const state = JSON.parse(readFileSync(join(HERE, ".state/state.json"), "utf8"));
const port = /^MATTERMOST_HOST_PORT=(\d+)/m.exec(readFileSync(join(HERE, ".env"), "utf8"))?.[1] ?? "8065";
const MM = `http://localhost:${port}/api/v4`;
const PEOPLE: Record<string, string> = { maria: "seaside", arjun: "roomfinder" };

async function login(who: string): Promise<string> {
  const u = state.chat.users[PEOPLE[who]];
  const res = await fetch(`${MM}/users/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ login_id: u.username, password: u.password }),
  });
  if (!res.ok) throw new Error(`login ${who}: ${res.status}`);
  return res.headers.get("token")!;
}

const api = async (token: string, path: string, init: RequestInit = {}) => {
  const res = await fetch(`${MM}${path}`, { ...init, headers: { authorization: `Bearer ${token}`, "content-type": "application/json" } });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res.json();
};

/** The newest Handshake channel this person is in. */
async function channel(token: string): Promise<{ id: string; display_name: string }> {
  const chans: any[] = await api(token, `/users/me/teams/${state.chat.teamId}/channels`);
  const ours = chans.filter((c) => c.name.startsWith(ROOM_NAME) || c.display_name.startsWith(ROOM_NAME)).sort((a, b) => b.create_at - a.create_at);
  if (!ours[0]) throw new Error("no Handshake channel yet: run node switch/provision.ts");
  return ours[0];
}

const [who, ...rest] = process.argv.slice(2);

if (who === "read") {
  const token = await login("maria");
  const ch = await channel(token);
  const { order, posts } = await api(token, `/channels/${ch.id}/posts?per_page=${rest[0] ?? 100}`);
  const ids = [...new Set(order.map((id: string) => posts[id].user_id))];
  const users: any[] = await api(token, "/users/ids", { method: "POST", body: JSON.stringify(ids) });
  const name = new Map(users.map((u) => [u.id, u.is_bot ? u.username : `${u.first_name} ${u.last_name}`.trim() || u.username]));
  for (const id of [...order].reverse()) {
    const p = posts[id];
    if (p.type) continue; // system posts: joins, header changes
    console.log(`\n[${p.props?.override_username ?? name.get(p.user_id)}] ${p.message}`);
  }
} else if (who === "press" && rest[0] in PEOPLE && rest[1]) {
  const [person, label] = rest;
  const token = await login(person);
  const ch = await channel(token);
  const { order, posts } = await api(token, `/channels/${ch.id}/posts?per_page=60`);
  // Newest first: the latest card that still offers this button.
  for (const id of order) {
    for (const att of posts[id].props?.attachments ?? []) {
      const action = (att.actions ?? []).find((a: { name: string }) => a.name === label);
      if (!action) continue;
      const res = await fetch(`${MM}/posts/${id}/actions/${action.id}`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: "{}",
      });
      const text = await res.text();
      console.log(`pressed "${label}" on "${att.title ?? att.text ?? id}" as ${person}: ${res.status} ${text.slice(0, 200)}`);
      process.exit(res.ok ? 0 : 1);
    }
  }
  console.error(`no "${label}" button in ~${ch.display_name}`);
  process.exit(1);
} else if (who in PEOPLE) {
  const token = await login(who);
  const ch = await channel(token);
  await api(token, "/posts", { method: "POST", body: JSON.stringify({ channel_id: ch.id, message: rest.join(" ") }) });
  console.log(`posted to ~${ch.display_name} as ${who}`);
} else {
  console.error("usage: say.ts maria|arjun <message> | say.ts read [limit] | say.ts press maria|arjun <button>");
  process.exit(2);
}
