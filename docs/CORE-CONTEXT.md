# PieFit core context

Long-term memory. OVERWRITE-ONLY: edit facts in place, no changelog here (history goes to `ARCHIVE-LOG.md`).
Loaded every session through `CLAUDE.md`, so keep it short. Code wins when this file disagrees: fix the file.

## Overview

- **What:** offline-first PWA for rings, TRX, bodyweight and gym training, plus yoga, habits, a 30-day challenge, nutrition, weight and other activities. Thai and English. Single user, data stays on the device.
- **Stack:** vanilla JS (ES6+), no framework, no build step, no runtime dependencies. Keep it that way. `package.json` exists only for the Capacitor Android build.
- **Load order:** classic `<script>` tags in `index.html`, loaded in this order: native, data, i18n, i18n-trainer, sound, coach, body, form, videos, yoga, activity, habits, challenge, nutrition-data, nutrition-ai, nutrition, calendar, app.
  A module that another one needs must load before it.
- **Modules:** each feature is an IIFE exposing one global (`Habits`, `Challenge`, `Nutrition`, `Coach`, `Body`, `Yoga`, `Activity`, `Calendar`). `app.js` wires them in. Cross-module calls are listed in `docs/reference/MAP-MODULES.md`.
- **Globals for every module:** `store`, `t(key, ...args)`, `esc`, `EX`, `LOG`, `LADDERS`, `MASTERED`, `SET`, `TG`, `CAL`, `go(tab, view)`, `render()`, `persist()`, `toast`, `app`.
- **Routing:** `go(tab, view)` then `render()`. Bottom nav `TABS` in `app.js` (home, food, prog, more). Yoga and the exercise library (`lib`) live under More.
- **Storage:** `store.get(k, default)` / `store.set(k, v)` over localStorage with prefix `ringfit.`; progress photos in IndexedDB `piefit`. Every key and its backup field: `docs/reference/MAP-DATA.md`.
- **CSS:** variables and classes in `index.html` (`--bg --card --ink --mute --line --accent --ok --warn --soft`; `.card .row .seg .chip .btn .tag .num .inp .track .modal .sheet`). Reuse before adding.
- **AI (optional, online only):** Claude model `claude-haiku-5-5`, SDK `https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.133.0/+esm` with `dangerouslyAllowBrowser: true` (coach.js and nutrition-ai.js, kept identical). Gemini (`gemini-2.5-flash` family) key in the `x-goog-api-key` header. nutrition-ai.js also has an OpenAI path.

## Environments and shipping

| Where | What | How it updates |
|---|---|---|
| Local | `python -m http.server 8137` (`.claude/launch.json`, preview name `piefit`) | edit files |
| **Production web** | GitHub Pages `https://tchawankon.github.io/piefit/`, served straight from `origin/main` | push to `main` (= deploy). Use `node tools/ship.js` |
| Android APK | GitHub Actions `android.yml`, manual `workflow_dispatch`, signed with repo secrets, published as release `apk-N` | owner asks; `gh workflow run android.yml` (always ask first) |

No staging. Work on a feature branch; `main` only when the owner says so.
The repo root is the public site, so `docs/`, `tools/` and `SHIP-LOG.txt` are publicly readable: never put secrets in them.

## Ask-first zones

`native/`, `.github/workflows/`, `capacitor.config.json` (appId), `manifest.webmanifest`, signing files, the `ringfit.` prefix and storage keys, the export/import field names. Why each is risky: `docs/reference/IRON-RULES-DETAIL.md#ask-first-zones`.

## Iron Rules

Each rule is binding. Numbers are never reused; a retired rule keeps its number with "(retired)". Long form: `docs/reference/IRON-RULES-DETAIL.md`.

1. **Push or merge to `main` only when the owner says so, and ship with `node tools/ship.js`.**
   Why: `main` is production (GitHub Pages) and there is no staging.
2. **Every file the page loads is in `sw.js` FILES, and `VERSION` is bumped whenever a cached file changes.**
   Why: the SW serves cache first; a missing file breaks offline install, an unbumped version leaves phones on old code (`aac72e0`). Check: `map-check` scripts-sw, sw-version.
3. **Never keep a hand-written second list of app files; derive it from `index.html`.**
   Why: the APK shipped without the new modules because `native/bundle.js` had its own list (`1f8c81e`).
4. **Never rename the `ringfit.` prefix, a storage key or a backup field name without a migration.**
   Why: user data exists only on the device under those names; old backups use the field names.
5. **A new user-data key gets a row in MAP-DATA plus export and import with the same field name, in the same commit.**
   Why: wiring was ad hoc in `7684964` and `yfeel` is still not backed up. Check: `map-check` storage-keys, backup-fields.
6. **A feature writes only its own AI key slot, never another feature's.**
   Why: Food tab and coach keys got mixed up (`7684964`).
7. **APK builds stay manual; never change the workflow trigger, signing, `appId` or keystore.**
   Why: automatic builds were removed on purpose (`46a3b00`); a new appId or key means phones refuse the update. Check: `map-check` ci-manual.
8. **No new `prompt()`, `alert()` or `confirm()`; use a `.modal` + `.sheet` (copyable text in a textarea sheet).**
   Why: owner's UI rule; legacy calls are frozen by a baseline. Check: `map-check` baseline.
9. **Escape before `innerHTML`: `esc()` (in `nutrition*.js` use `escH`) for anything a user typed or an AI returned.**
   Why: AI and user text is rendered as HTML.
10. **Every visible string exists in Thai and English** (`t()` for shared strings, `isTh ? '…' : '…'` inline in a module).
    Why: the app is bilingual. Check: `map-check` i18n.
11. **Phone first: at 360px no horizontal scroll, tap targets ≥ 40px, overflowing rows get `flex-wrap:wrap`.**
    Why: the owner uses it on a phone.
12. **Offline first: only optional AI calls may use the network, and they fail with a clear message.**
    Why: it is used in gyms with poor signal.
13. **One function decides each rule ("is this habit done", "what is the target"); others call a small API on the owning module.**
    Why: copied rules drift (e.g. `Habits.syncProtein`, `autoWorkout()` in `9fc0c8a`). Check: `map-check` module-api.
14. **Set handlers with `onclick =` on freshly rendered nodes; never add `document`/`window` listeners from a view without removing them.**
    Why: re-render leaks. Check: `map-check` baseline.
15. **Before reporting a change: `npm run preflight`, and for UI, open the page at 360px and exercise it.**
    Why: there are no tests; a syntax check does not prove the UI works.
16. **Do not rewrite existing user-facing strings in a feature commit unless the owner asked.**
    Why: Thai day names flip-flopped between `9ceb4ed` and `7684964`.
17. **Treat an outside prototype as a spec and rewrite it here; never paste or patch a large foreign file.**
    Why: `7684964` brought 2,000+ lines that needed an immediate rewrite (`80ba8a1`). Workflow: IRON-RULES-DETAIL.
18. **Take model ids and API fields only from the working code or current docs.**
    Why: invented ids fail silently for the user. Check: `map-check` ai-ids.
19. **Do not add `typeof Mod !== 'undefined'` guards for our own modules; fix the load order instead.**
    Why: the guard hides a missing script and the feature just disappears.
20. **Never delete files; move them to `_to_delete/` (git-ignored). Delete branches only when the owner agrees.**
    Why: owner's rule (2026-11-07).
21. **Never write Liquid tokens (double curly braces, curly brace + percent) in any `.md` or `.html`; describe them in words.**
    Why: Pages runs Jekyll; one such token in a doc failed the whole site build (2026-11-07). Check: `map-check` jekyll-liquid.
