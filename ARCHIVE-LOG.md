# Archive log

APPEND-ONLY. Never read whole: `grep -n "^## " ARCHIVE-LOG.md`, then read one section by line range.
New sections go at the bottom. Heading format: `## YYYY-MM-DD · <kind> · <title>`, where kind is one of done, decision, incident or sprint-detail.

## 2026-11-07 · done · Features live before the project brain existed
Reconstructed from git history on 2026-11-07. Everything here is on `origin/main`.
- APK `apk-6` (2026-11-05 15:54Z) was built after `9fc0c8a`, so the Android build includes it too.
- `422e1c8`: base app (rings, TRX, gym tracker, offline PWA).
- `02833ee`, `1c05c6a`, `8918707`: sounds, bodyweight mode, keep-awake.
- `efeba2d`, `46a3b00`: Android Capacitor build, made manual-only.
- `b3ec72f`: personal-trainer features (readiness, plan, AI coach, body log, form check).
- `d5892a1`, `fbfcf7f`, `aac72e0`: yoga, stretching, spoken guidance.
- `9c762be`, `2cb30cc`, `0eae24d`, `24889c5`: tutorial clips, follow-along yoga and video classes.
- `7684964`, `80ba8a1`: habits, 30-day challenge, nutrition (Food tab), adjust sheet.
- `7d1e184`: monthly calendar.
- `df04b43`: weight tracking and goal weight.
- `6b66ef2`: exercise library moved under More.
- `1f8c81e`: the APK bundle derives its file list from index.html.
- `9fc0c8a`: other activities (pilates, swimming, sports, outside classes).

## 2026-11-07 · incident · Lessons recovered from history
None of these was logged at the time. They were found in diffs and became Iron Rules:
- `1f8c81e` (rule 3): the APK bundle missed the new modules because of a hand-written list.
- `aac72e0` (rule 2): a new SW version could install stale files, so it now uses `cache:'reload'`.
- `7684964` (rules 5, 6): ad-hoc backup wiring, and the Food and coach key slots got confused.
- `46a3b00` (rule 7): APKs built on every push and were made manual.
- `9ceb4ed` / `7684964` (rule 16): Thai push/pull day names flip-flopped.

## 2026-11-07 · decision · Project brain set up
- Owner's answers: deploy = push to main (GitHub Pages) only; use a ship script with a log; Claude Code only; notes in English and questions in Thai; no direct deletes (`_to_delete/`); SessionStart hook approved; merged branches may be deleted.
- CLAUDE.md is the single instruction file (Claude Code loads it automatically) and imports `docs/CORE-CONTEXT.md`. No AGENTS.md or .cursorrules, because no other tool is used.
- Deleted the merged branches `feature/other-activities` and `claude/piefit-code-review-architecture-de6c03` (and its worktree), with the owner's OK.
- The CLAUDE.md storage-key table was missing 14 keys. It moved to `docs/reference/MAP-DATA.md`, which `map-check` now checks.

## 2026-11-07 · done · Project brain shipped
Merged `chore/project-brain` (`e583a19`) into main as `6ea518b` and shipped (SHIP-LOG 2026-11-07T02:15Z). Pages deploy of `17c3d3a` succeeded. The files: CLAUDE.md + docs/CORE-CONTEXT.md, maps, CURRENT-SPRINT/ARCHIVE-LOG, and tools (whats-next, preflight, map-check, sprint-check, ship). No app code changed.

## 2026-11-07 · incident · ship.js logged OK before Pages deployed
- First real ship. The goal check compared only the live `sw.js` VERSION. A docs-only ship keeps the same VERSION, so the check passed instantly and logged OK while Pages was still building.
- The immediate log-commit push then cancelled the deploy of `6ea518b`. The later deploy of `17c3d3a` succeeded, so nothing was lost.
- Fix: ship.js now waits for the "pages build and deployment" run of the exact commit to succeed, AND compares a changed servable file byte for byte with production. Only then does it log and push the log commit.
- Lesson: a goal check must observe something that this ship changes.
- Also learned: Pages uses Jekyll (legacy build from main /), which turns `.md` into `.html` and hides `_`/`.` files. A Liquid syntax error in any `.md` can fail the whole site build. ship.js now reports that as `PENDING (deploy=completed failure)`.

## 2026-11-07 · incident · Pages build failed on a Liquid token in a doc
- The second ship (`159bae2`) failed the Pages build. The new IRON-RULES-DETAIL text quoted the Liquid tokens literally while warning about them.
- The fixed ship.js caught it and logged PENDING, not OK. Production stayed on the `17c3d3a` build, so the app was unaffected.
- Fix: the text now describes the tokens in words, there is a new `map-check` jekyll-liquid check, and Iron Rule 21 was added.

## 2026-11-07 · incident · ship.js compared a trimmed file
- The `f0156e0` ship logged PENDING although the deploy succeeded and production matched.
- Cause: the `git()` helper trims output, so the expected file lost its final newline.
- Fix: compare with trailing whitespace trimmed on both sides. A corrected OK line was appended by hand after re-checking the deploy and the content.

## 2026-11-07 · incident · CSS variable --warn was never defined
- About 20 places used `var(--warn)`, and CLAUDE.md listed it, but `index.html` never defined it. Warning text rendered in the default colour, and a danger button background was transparent (invisible).
- Found while testing the new delete-all sheet at 360px.
- Fix: defined `--warn` in the light and both dark theme blocks.
- Lesson: the docs listed a token that the code didn't have. Code is the source of truth.

## 2026-11-07 · done · Data safety and cleanup batch (8 audit items)
Branch `fix/data-and-cleanup` (`d9a57dc`), merged as `9a83fc7`, shipped OK with sw `piefit-v34` (SHIP-LOG 2026-11-07T03:08Z). The owner's decisions are in brackets.
1. `yfeel` is now exported and imported.
2. Importing an old backup without `bodyGoal` keeps the current goal.
3. Delete all data now clears every module, with an "also remove AI keys" checkbox. [owner: let the user choose]
4. Habits and Challenge imports go through type-checked `importState`; Nutrition import filters bad entries.
5. Removing a key in Food or the coach clears every AI key slot via `clearAiKeys()`. [owner: keys are shared; removed means all removed]
6. All `prompt`/`alert`/`confirm` calls are replaced by `confirmSheet`/`numSheet`/`noticeSheet`. The baseline is now 0.
7. Removed the 14 own-module typeof guards in app.js.
8. Rewrote README; the privacy text now mentions the AI providers.
Also: defined the missing `--warn` CSS variable (see the incident above).
Tested at 360px: import of an old and a broken backup, delete-all with and without the key option, Food key removal, the edit-set sheet, the delete-set sheet. Not tested: a real user backup file.
