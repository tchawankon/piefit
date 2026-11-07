# Current sprint

Short-term memory. Read on demand: `grep -n -A8 "^### <words>" CURRENT-SPRINT.md`. Validated by `node tools/sprint-check.js`.

Rules:
- One `###` entry per task, under `## Entries`.
- Status lives only on the `STATUS:` line: `STATUS: <planned|in-progress|code-complete|staging|live|parked> · <YYYY-MM-DD> · <evidence>`. The separator is ` · `. Never restate status in prose, and never infer status from prose.
  - `code-complete` means on a branch, not shipped.
  - `staging` is unused (there is no staging environment).
  - `live` means it is on `origin/main` and in `SHIP-LOG.txt`.
- `OPEN:` is the one thing that actually remains, or `nothing`.
- `VERIFY:` holds probes that must be true right now, as evidence for the STATUS: `exists <path>` · `missing <path>` · `contains <path> :: <literal>` · `lacks <path> :: <literal>`. Join several with ` ; `. For a `planned` bug, the probe proves the bug is still there. When you fix it, flip the probe.
- `DETAILS:` points to the `ARCHIVE-LOG.md` section once the write-up has moved there.
- `live` + `OPEN: nothing` means archive it in the same session (sprint-check fails otherwise). Live and parked entries are stubs.

## Entries

### Project brain (docs, maps, checks, ship script)
STATUS: code-complete · 2026-11-07 · branch chore/project-brain, preflight green
OPEN: owner review, then merge to main and ship (docs only, no app change)
VERIFY: exists tools/map-check.js ; exists tools/whats-next.js ; exists docs/CORE-CONTEXT.md ; contains CLAUDE.md :: @docs/CORE-CONTEXT.md

### Backup misses yoga feel ratings (yfeel)
STATUS: planned · 2026-11-07 · found by audit; yoga.js exportState omits yfeel
OPEN: export and import `yfeel` in Yoga.exportState/importState, then update the MAP-DATA row
VERIFY: contains yoga.js :: return {yoga:YLOG, ylvl:YLVL}

### Delete all data leaves habits, challenge, nutrition, goal weight
STATUS: planned · 2026-11-07 · #wipe in app.js clears only the strength, coach, body, yoga and activity data
OPEN: ask the owner whether AI keys should also be cleared; add clear() APIs on Habits, Challenge and Nutrition and call them from #wipe
VERIFY: lacks app.js :: Habits.clear( ; lacks app.js :: Nutrition.clear(

### Import of an old backup clears the goal weight
STATUS: planned · 2026-11-07 · importData sets Body.goal to null when the backup has no bodyGoal
OPEN: keep the current goal when the field is absent
VERIFY: contains app.js :: Body.goal = typeof d.bodyGoal === 'number' ? d.bodyGoal : null

### Import writes habits and challenge data unchecked, bypassing the modules
STATUS: planned · 2026-11-07 · importData calls store.set on habits_cfg, habits_logs, habits_inbody and challenge_state_v4 with no type checks
OPEN: move them to Habits.importState / Challenge.importState that validate types (Iron Rule 13)
VERIFY: contains app.js :: if(d.habits) store.set('habits_cfg', d.habits)

### Food tab "key removed" while the coach key still works
STATUS: planned · 2026-11-07 · km_clear clears nutri_key and gemini_key, but getStoredKey falls back to aikey
OPEN: decide with the owner: change the message to say the coach key is still used, or offer to stop the fallback
VERIFY: contains nutrition.js :: store.set('nutri_key', '');

### Replace legacy prompt/alert/confirm with sheets
STATUS: planned · 2026-11-07 · baseline in tools/map-check.baseline.json (app, body, coach, challenge, yoga)
OPEN: convert one file at a time to .modal + .sheet, then run map-check --write-baseline
VERIFY: contains app.js :: prompt(label, cur)

### Remove typeof guards for own modules in app.js
STATUS: planned · 2026-11-07 · exportData/importData guard Habits, Challenge and Nutrition with typeof (Iron Rule 19)
OPEN: drop the guards (all modules load before app.js)
VERIFY: contains app.js :: typeof Habits !== "undefined"

### Public README is stale
STATUS: planned · 2026-11-07 · README lists only rings features and says nothing is sent to a server (AI calls do)
OPEN: rewrite the feature list and privacy line; keep it short
VERIFY: contains README.md :: Nothing is sent to a server
