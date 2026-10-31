#!/usr/bin/env bash
# A Seaside Inn engineer's update that renames two booking fields, opened as a real pull request into demo.
# The Handshake check fails on it, and github-sync has the watcher tell the room why.
set -euo pipefail
cd "$(dirname "$0")/.."
BRANCH=release/rename-date-fields
DIR=$(mktemp -d)
trap 'git worktree remove --force "$DIR" >/dev/null 2>&1 || true' EXIT
git fetch --quiet origin demo
git worktree add --quiet -B "$BRANCH" "$DIR" origin/demo
FILE="$DIR/demo/seaside-inn/src/reservations.ts"
perl -pi -e 's/const \{ guest, check_in, check_out, partner_ref \} =/const { guest, arrival: check_in, departure: check_out, partner_ref } =/' "$FILE"
grep -q "arrival: check_in" "$FILE" || { echo "bad-release: could not apply the change" >&2; exit 2; }
git -C "$DIR" commit --quiet -am "Seaside Inn: call the dates arrival and departure"
git -C "$DIR" push --quiet --force -u origin "$BRANCH"
gh pr create --base demo --head "$BRANCH" --title "Seaside Inn: call the dates arrival and departure" \
  --body "Renames check_in and check_out to arrival and departure in the booking request."
