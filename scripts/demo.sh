#!/usr/bin/env bash
# Runs both companies' sides of Handshake on the demo apps, without Switch.
set -euo pipefail
cd "$(dirname "$0")/.."
H="node src/cli.ts"
OUT=.handshake
mkdir -p "$OUT"

echo "== Each company extracts its own side"
$H extract demo/roomfinder/handshake.config.ts -o "$OUT/roomfinder.bundle.json"
$H extract demo/seaside-inn/handshake.config.ts -o "$OUT/seaside.bundle.json"

echo; echo "== Seaside Inn runs RoomFinder's cases against Seaside Inn's code"
$H verify demo/seaside-inn/handshake.config.ts "$OUT/roomfinder.bundle.json" -o "$OUT/seaside.verdicts.json" --md

echo; echo "== RoomFinder runs Seaside Inn's cases against RoomFinder's code"
$H verify demo/roomfinder/handshake.config.ts "$OUT/seaside.bundle.json" -o "$OUT/roomfinder.verdicts.json" --md

echo; echo "== Seal the contract"
$H seal "$OUT/seaside.bundle.json" "$OUT/roomfinder.bundle.json" "$OUT/seaside.verdicts.json" "$OUT/roomfinder.verdicts.json" -o "$OUT/contract.json" --md

echo; echo "== Seaside Inn's pre-deploy gate"
$H gate demo/seaside-inn/handshake.config.ts "$OUT/contract.json" --md

echo; echo "== Who else did it hit? Both companies' records, by booking number and amount only"
$H amounts demo/roomfinder/handshake.config.ts -o "$OUT/roomfinder.amounts.json"
$H amounts demo/seaside-inn/handshake.config.ts -o "$OUT/seaside.amounts.json"
$H impact "$OUT/roomfinder.amounts.json" "$OUT/seaside.amounts.json" -o "$OUT/impact.json" --md

echo; echo "== The same check between two flatmates: Priya's share of each bill, and what Sam's sheet charges her"
$H amounts demo/flatmates/priya/handshake.config.ts -o "$OUT/priya.amounts.json"
$H amounts demo/flatmates/sam/handshake.config.ts -o "$OUT/sam.amounts.json"
$H impact "$OUT/priya.amounts.json" "$OUT/sam.amounts.json" -o "$OUT/flatmates.impact.json" --md
