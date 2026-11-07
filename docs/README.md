# Docs index

Read this before looking for a doc or writing a new one. Every doc has exactly one line here.

## Root
- `CLAUDE.md`: AI instructions: session routine, on-demand reads, commands, maintenance. Loaded automatically.
- `CURRENT-SPRINT.md`: short-term memory: one entry per task with STATUS / OPEN / VERIFY. Grep one heading.
- `ARCHIVE-LOG.md`: append-only history: finished entries, decisions, incidents. Grep only.
- `SHIP-LOG.txt`: one line per production ship, written by `tools/ship.js`.
- `README.md`: public description of the app (GitHub page).

## docs/
- `docs/CORE-CONTEXT.md`: overview, environments, ask-first zones, Iron Rules. Loaded automatically.

## docs/reference/
- `MAP-HUB.md`: which map to read for which change.
- `MAP-FILES-CACHE.md`: scripts, `sw.js` FILES/VERSION, APK bundle, manifest.
- `MAP-DATA.md`: storage keys, backup fields, delete-all, AI key slots.
- `MAP-MODULES.md`: cross-module APIs, i18n, AI model/SDK, nav, CI.
- `IRON-RULES-DETAIL.md`: long form of rules (ship sequence, Android, prototypes, ask-first zones).

## docs/plans/, docs/guides/, docs/archive/
(empty: create a folder when its first doc is needed, and add the doc here)

## tools/
- `whats-next.js`: session reconcile report. `map-check.js` (+ `map-check.baseline.json`): touchpoint checks. `sprint-check.js`: sprint format and probes. `preflight.js`: all dev checks. `ship.js`: push to production and log it.
