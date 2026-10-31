# Handshake

When something breaks between two companies' systems, Handshake puts one AI agent from each company in a shared [Switch](https://github.com/sandbox-quantum/switch) room. Each agent checks its own side, they work out whose bug it is, the owner fixes it in a normal pull request, both sides sign an agreement, and a watcher checks every later release against it. Neither company sees the other's code.

Built for the Flip the Switch hackathon (Track 1, Best Business Workflow), November 2026. An experiment, not production software.

## The demo story

Seaside Inn is a small hotel. RoomFinder is the website that sells its rooms. Both companies are made up, the bugs are real kinds of bugs.

- RoomFinder sends `03/04/2026` meaning 3 April. Seaside Inn reads it as March 4. A 1-night stay is booked as 31 nights, at $3,720.
- RoomFinder's app retries a slow booking with a new booking id. The guest gets two rooms.
- RoomFinder cancels with its own booking number. Seaside Inn ignores it, and the guest is still charged.

## How it works

1. Maria at Seaside Inn asks her agent to check bookings with RoomFinder.
2. Each agent turns its own code's behaviour into test cases with `handshake extract` and shares them as a room document.
3. Each agent runs the other company's cases against its own real code (`handshake verify`) and shares the results. Only results cross over, never code.
4. The agents argue out whose bug each failure is, from their own results and docs.
5. The owner's agent opens a pull request in its own company's folder. That company's engineer reviews and merges it on GitHub.
6. `github-sync` tells the room when it is merged. The other company's agent runs the cases again on its side and confirms.
7. Both people sign with Switch buttons only their own company can press. The signed agreement is committed with Seaside Inn's code.
8. From then on, every Seaside Inn pull request runs the agreement as a GitHub check. A change that would break it fails, and the watcher tells the room why.

### What Switch does here

- Two owners, one room: each agent takes instructions only from its own company's people.
- Buttons only the right company can press, for signing.
- Room documents only their author can edit: test cases, results, fixes, signatures.
- Custom agents on Switch's agent protocol: the release watcher and each company's GitHub notices.

## Layout

```
src/          the Handshake CLI: extract, verify, seal, gate (zero dependencies, Node 24)
demo/         the two made-up companies
  seaside-inn/  the hotel's booking system
  roomfinder/   the booking site's hotel client
switch/       local Switch server, provisioning, agent instructions, watcher, github-sync
web/          landing page (Next.js)
```

In real use each company keeps its own repo. Here both companies live in one repo for an easy demo. Each agent works in a sparse git worktree that holds only its own company's folder, and its instructions forbid looking further. The worktrees share one git history, so this is a demo boundary, not a security one. Separate repos are.

## Run it

Needs Docker, Node 24, the Claude Code CLI, and `gh` logged in.

```sh
npm test                                   # CLI and both companies' tests
npm run demo                               # the whole check without Switch, in the terminal

cd switch && ./init-env.sh && docker compose up -d && cd ..
node switch/provision.ts                   # people, agents, the room
node switch/github-sync.ts                 # keep running: pull request events into the room
```

Open http://localhost:8065, log in as `maria.lopez` and as `arjun.mehta` in two browser windows, and post `@seaside-inn-agent please check our bookings with RoomFinder`.

- `scripts/bad-release.sh` opens a Seaside Inn pull request that breaks the agreement.
- `scripts/reset-demo.sh` closes the demo pull requests, rewinds the `demo` branch and opens a fresh room.

## Isn't this just Pact?

Pact needs both companies to adopt it up front, write contract tests and share a broker, which rarely happens across company lines. Handshake starts from a bug report between two companies that never agreed on anything, builds the cases from each side's own code, finds whose bug it is, and writes the agreement at the end.

## Limits

- The CLI needs a small adapter per company (`handshake.config.ts`) that maps its code to test cases.
- Tested on the demo companies only.
- The idea was prototyped before the hackathon.
