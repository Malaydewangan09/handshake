# Handshake

When something breaks between two companies' systems, Handshake puts one AI agent from each company in a shared [Switch](https://github.com/sandbox-quantum/switch) room. Each agent checks its own side, they work out whose bug it is, they find every customer it already hit, the owner fixes it in a normal pull request, both sides sign an agreement, and a watcher checks every later release against it. Neither company sees the other's code or customer data.

Built for the Flip the Switch hackathon (Track 1, Best Business Workflow), November 2026. An experiment, not production software.

## The demo story

Seaside Inn is a small hotel. RoomFinder is the website that sells its rooms. Both companies are made up, the bugs are real kinds of bugs.

- RoomFinder's European site sends `03/04/2026` meaning 3 April. Seaside Inn reads it as March 4. A 1-night stay is booked as 31 nights, at $3,720.
- RoomFinder's app retries a slow booking with a new booking id. The guest gets two rooms.
- RoomFinder cancels with its own booking number. Seaside Inn ignores it, and the guest is still charged.

Both companies have eight months of booking records in `demo/*/data/`, made by running their real code against each other (`scripts/seed-records.ts`). 26 of 227 bookings were billed wrong, $61,680 in all.

## How it works

1. A guest complains to Seaside Inn. Maria posts it, and her agent finds the booking in the hotel's own records.
2. Each agent turns its own code's behaviour into test cases with `handshake extract` and shares them as a room document.
3. Each agent runs the other company's cases against its own real code (`handshake verify`) and shares the results. Only results cross over, never code.
4. The agents argue out whose bug each failure is, from their own results and docs.
5. The owner's agent opens a pull request in its own company's folder. That company's engineer reviews and merges it on GitHub.
6. While it waits for review, each agent runs `handshake amounts` on its own records: booking numbers and amounts, nothing else. `handshake impact` compares the two and lists every guest billed wrong. Both agents run it and must get the same list. Maria refunds the hotel's guests and Arjun emails RoomFinder's, each with a button only their own company can press.
7. `github-sync` tells the room when it is merged. The other company's agent runs the cases again on its side and confirms.
8. Both people sign with Switch buttons only their own company can press. The signed agreement is committed with Seaside Inn's code.
9. From then on, every Seaside Inn pull request runs the agreement as a GitHub check. A change that would break it fails, and the watcher tells the room why.

### What Switch does here

- Two owners, one room: each agent takes instructions only from its own company's people.
- Buttons only the right company can press, for refunds, guest emails and signing.
- Room documents only their author can edit: test cases, results, amounts, fixes, signatures.
- Custom agents on Switch's agent protocol: the release watcher and each company's GitHub notices.

## Layout

```
src/          the Handshake CLI: extract, verify, seal, gate, amounts, impact (zero dependencies, Node 24)
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

Open http://localhost:8065, log in as `maria.lopez` and as `arjun.mehta` in two browser windows, and post as Maria: `@seaside-inn-agent A guest emailed us: she booked 1 night on RoomFinder for 3 April, and we billed her $3,720. Can you find out what happened, with RoomFinder?`

- `scripts/bad-release.sh` opens a Seaside Inn pull request that breaks the agreement.
- `scripts/reset-demo.sh` closes the demo pull requests, rewinds the `demo` branch and opens a fresh room. Restart `github-sync` after it.

## Isn't this just Pact?

Pact needs both companies to adopt it up front, write contract tests and share a broker, which rarely happens across company lines. Handshake starts from a bug report between two companies that never agreed on anything, builds the cases from each side's own code, finds whose bug it is, and writes the agreement at the end.

## Limits

- The CLI needs a small adapter per company (`handshake.config.ts`) that maps its code to test cases and its records to amounts.
- Refunds and guest emails end as files for each company's own accounts and email tools. Nothing is charged or sent.
- Tested on the demo companies only.
- The idea was prototyped before the hackathon.
