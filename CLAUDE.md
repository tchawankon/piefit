# PieFit: instructions for Claude

This file is the single source of AI instructions. It imports the long-term memory:

@docs/CORE-CONTEXT.md

## Start of every session (mandatory, nothing else)

1. This file + `docs/CORE-CONTEXT.md` (both loaded automatically).
2. The `whats-next` output. The SessionStart hook runs it; if it is not in context, run `node tools/whats-next.js`.
3. Reconcile: trust `whats-next` (git, ship log, checks) over any prose. Never infer status from prose; status lives only on `STATUS:` lines in `CURRENT-SPRINT.md`.

Before answering "what next", run `node tools/whats-next.js` first. Always. Do not propose work whose STATUS is already `live`. Priority is the owner's call.

## Read on demand only

| Need | Read |
|---|---|
| One task | `grep -n -A8 "^### <words>" CURRENT-SPRINT.md` (never the whole file if it is long) |
| Editing anything that touches several files | `docs/reference/MAP-HUB.md`, then the one map it points to |
| Any other doc | `docs/README.md` (index) first, then that one doc |
| History, decisions, incidents | `grep -n "<words>" ARCHIVE-LOG.md`, then a line range. Never read it whole |
| Full rule text | `docs/reference/IRON-RULES-DETAIL.md` (grep the rule number) |

Token rules: prefer grep and line ranges over full reads of big files (`nutrition.js`, `app.js`, `challenge.js`, `habits.js` are 800-1,300 lines). Notes are written in English; questions to the owner are in Thai.

## Commands

| Command | What |
|---|---|
| `node tools/whats-next.js` | reconcile report, always exits 0 |
| `npm run preflight` | `node --check` every `.js` + `map-check` + `sprint-check`. Must be green before commit or ship |
| `node tools/map-check.js` | multi-touchpoint facts (see MAP-HUB) |
| `node tools/sprint-check.js` | CURRENT-SPRINT format and VERIFY probes |
| `node tools/ship.js` | preflight, push `main`, wait until Pages serves the new `sw.js` VERSION, log to `SHIP-LOG.txt`. Owner approval required |

## Working rules

- Feature branch per task; merge to `main` (= deploy) only when the owner says so. Commits end with the Co-Authored-By line given by the session.
- Always ask first: push, merge into `main`, `gh workflow run`, branch deletion, any edit in an ask-first zone (CORE-CONTEXT).
- Code is the source of truth; when a doc disagrees, fix the doc in the same change.
- New docs go into `docs/plans|guides|reference/` and get a line in `docs/README.md` (no orphan docs).

## Maintenance (part of every task, not optional)

- End of task: update the entry's `STATUS` / `OPEN` / `VERIFY` in `CURRENT-SPRINT.md`. `live` + `OPEN: nothing` means move the write-up to `ARCHIVE-LOG.md` and delete the entry in the same session.
- Touched a multi-touchpoint area: update the map and its `map-check` check in the same change. Write intent freely in maps; write counts or lists only if a script checks them.
- A mistake happened: add an Iron Rule (next unused number) with its WHY to CORE-CONTEXT. The same rule forgotten twice: turn it into a `map-check` check or a hook.
- Lowered a baseline count (removed a legacy `confirm()` etc.): run `node tools/map-check.js --write-baseline`.
