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

