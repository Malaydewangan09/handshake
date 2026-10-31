# Handshake

When something breaks between two companies, each company's agent checks its own side in one shared Switch room. They work out whose bug it is, the owner fixes it in a pull request, both sides sign an agreement, and a watcher holds any later release that breaks it. Neither company sees the other's code.

Track 1 (Best Business Workflow), Flip the Switch, Nov 4 12:01 AM IST to Nov 7 11:59 PM IST. Submit by Nov 7 noon.

## Rule that shapes the schedule

FAQ: "The Switch setup and the workflow your agents run need to be built during the hackathon." Everything built before Nov 4 is a prototype. On Nov 4 the submission is rebuilt in a fresh repo with real commits. The README says the idea was prototyped before the event.

## Scoring targets

| Criterion | Weight | How Handshake earns it |
| - | - | - |
| Use of Switch | 30% | Two owners in one room, buttons only one company can press, author-locked room documents, custom agents (watcher, GitHub sync) |
| Technical execution | 25% | Tested CLI, real GitHub PRs, the watcher as a required check, one-command setup |
| Creativity and impact | 25% | Settles "whose bug is it" across companies without sharing code. The watcher is the ongoing value. |
| Presentation | 20% | 3 minute video of a real run, landing page, README first screen shows the room |

## Repo

One public repo, `handshake`. The two made-up companies live in it as folders that stand in for their own codebases:

| Folder | Plays |
| - | - |
| `src/`, `switch/`, `web/` | Handshake itself: CLI, Switch setup, landing page |
| `demo/seaside-inn/` | The hotel's booking system |
| `demo/roomfinder/` | The booking site's hotel client |

Keeping the companies apart inside one repo:
- Each agent's working directory is its own company's folder, and its Claude Code settings deny reading the other folder.
- `CODEOWNERS` gives each folder its own reviewer, so each company reviews only its own PRs.
- Each agent's PR touches only its own folder. The PR title starts with the company name.
- The README and video say plainly that in real use each company keeps its own repo.

## Flow

1. Maria (Seaside Inn) asks her agent to check bookings with RoomFinder.
2. Each agent runs `handshake extract` on its own repo and shares its test cases as a room document.
3. Each agent runs the other's cases on its own code (`verify`) and shares the results.
4. The agents work out whose bug each failure is, in the working thread. They may disagree, and each argues from its own results and docs.
5. The owning agent opens a PR that touches only its own folder, with the fix and a test. CODEOWNERS requests review from that company's engineer.
6. The GitHub sync agent posts "merged" and "released" into the room. The other company's agent runs the cases again on its own side and confirms.
7. When every case passes, Seaside Inn's agent seals the agreement. Each person signs with a Switch button only they can press.
8. The signed contract is committed to `demo/seaside-inn/`. From then on, the watcher runs `handshake gate` as a required check on every PR that touches that folder. A breaking PR gets a red check, can't be merged, and the room is told.

## Open decisions

- GitHub sync identity. Preferred: one custom agent per company (`seaside-inn-github`, `roomfinder-github`), each owned by its company, so a merge notice only reaches that company's own agent. This matches the ownership model and avoids the hotel's bot instructing RoomFinder's agent.
- Chat app for the video: Mattermost works today. Slack looks more familiar to judges. Try Slack on Nov 4 and keep Mattermost as the fallback.

## Rebuild checklist

### Nov 4: core
- [ ] Create the public `handshake` repo, CODEOWNERS for the two company folders
- [ ] CLI: `canonical`, `contract`, `engine`, `report`, `cli` with tests (`extract`, `verify`, `seal`, `gate`)
- [ ] Demo apps with the three bugs: 03/04 read as March (RoomFinder), retry books twice (RoomFinder), cancel by partner ref ignored (Seaside Inn)
- [ ] Switch server via docker compose, `init-env.sh`
- [ ] `provision.ts`: people, controllers, one Claude Code agent per company, the room, addressing rules

### Nov 5: agents
- [ ] Agent and room instructions: share cases, run theirs, settle whose bug, open a PR, wait for merge, check again, seal, sign
- [ ] GitHub sync agents: poll each company's open Handshake PRs, post merged and released into the working thread
- [ ] Sign buttons through `AskUserQuestion`, only the company's own person can press
- [ ] Claude Code settings per agent: deny reads outside its own company folder
- [ ] Full run end to end, twice, from `reset-demo.sh`

### Nov 6: watcher and polish
- [ ] Watcher as a GitHub Actions workflow on PRs touching `demo/seaside-inn/`: runs `gate` on GitHub's own runners and fails the check. The local GitHub sync agent sees the failed check and posts into the room.
- [ ] Branch protection: the watcher check is required
- [ ] `bad-release` as a real PR that renames two fields
- [ ] One-command setup and reset. README with the room screenshot first.
- [ ] Landing page in `handshake/web`, deployed to Vercel, real repo links

### Nov 7: ship
- [ ] Record the real run, edit to 3 minutes
- [ ] Replace the landing page video
- [ ] Submit by noon. Then the side tracks: blog, #HowISwitch, Wispr.

## Video script (3:00)

| Time | Shot | Words on screen or voice |
| - | - | - |
| 0:00 | Ana's booking: 1 night becomes 31, $3,720 | "Ana booked one night. The hotel booked her for 31." |
| 0:12 | Two support inboxes blaming each other | "The booking site blamed the hotel. The hotel blamed the booking site." |
| 0:22 | The room: Maria, Arjun, two agents | "Handshake puts one agent from each company in a shared room. Neither sees the other's code." |
| 0:35 | Maria asks. Test cases appear as room documents. | |
| 0:55 | Results: 3 bookings would go wrong | |
| 1:10 | The agents disagree on the 31 nights, then settle it | "First, whose bug is it." |
| 1:35 | Real PRs open, each touching only its company's folder. Arjun reviews and merges on GitHub. | "The owner fixes it, in a normal pull request." |
| 1:55 | The room shows merged, released, confirmed by the other side | "Fixed means the other company saw it work." |
| 2:10 | Sign buttons. Arjun tries to press Maria's, Switch refuses. Both sign. | "Only your own people can sign for you." |
| 2:25 | A hotel engineer opens a PR renaming two fields. Red check, merge blocked, the room is told. | "From now on, every release is checked." |
| 2:50 | Logo, the URL, "Built on Switch" | "Any two systems that talk to each other." |

## Risks

- Agents wander off script on camera: keep instructions strict, record several runs, use the cleanest.
- GitHub or network down during recording: record early on Nov 7, keep the Nov 6 run as backup.
- A judge says "both companies share one repo": the README answers it up front. The folders stand in for two repos, and the agents are blocked from reading each other's folder.
- Demo PRs and resets leave noise in the public repo: demo PRs go to a `demo-run-<n>` branch, and the reset script closes them.
