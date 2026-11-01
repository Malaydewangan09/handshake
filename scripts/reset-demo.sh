#!/usr/bin/env bash
# Puts both demo companies back to their buggy starting code and opens a fresh Handshake room.
# Closes the agents' open pull requests and rewinds the demo branch on GitHub to main.
set -euo pipefail
cd "$(dirname "$0")/.."
# A branch checked out in an agent's worktree can't be deleted, so detach them first.
for wt in .worktrees/*/; do git -C "$wt" checkout --quiet --detach; done
for n in $(gh pr list --base demo --state open --json number,headRefName --jq '.[] | select(.headRefName | startswith("handshake/") or startswith("release/")) | .number'); do
  gh pr close "$n" --delete-branch >/dev/null && echo "- closed pull request #$n"
done
git push --quiet --force origin main:demo
echo "- demo branch reset to main"
rm -rf .worktrees/*/demo/*/.handshake .handshake
# Forget pull requests github-sync already saw, so their closing is not announced in the new room. Restart github-sync after this.
rm -f switch/.state/github-sync.json
node switch/provision.ts --new-room
