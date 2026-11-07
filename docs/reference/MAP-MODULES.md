# MAP: modules, translations, AI, nav, CI

## Cross-module APIs

- **What:** modules call each other only through the members in each IIFE's final `return {…}`.
- **Known callers (intent; `module-api` checks the actual members):**
  - `calendar.js` reads Yoga, Nutrition, Body, Habits and Activity to draw each day.
  - `habits.js` uses Body for weight (latest weigh-in, add entry, goal, weigh-in sheet) and Activity for the day mode.
  - `nutrition.js` uses `Habits.cfg` and `Habits.syncProtein`, plus `Activity.dayKcal`.
  - `app.js` wires every module in and owns backup (MAP-DATA).
- **Change a member's name or meaning:**
  1. grep `Mod.member` across `*.js` and update every caller.
  2. Keep one owner for each rule (Iron Rule 13).
- **Add a cross-module call:** expose a small API on the owning module. Never read another module's storage key or copy its schema.
- **Load order:** the caller's script must load after the callee if the call runs at load time (CORE-CONTEXT load order).
- **Check:** `module-api`. A referenced member must exist in the module's returned object.

## Translations

- `STR.en` / `STR.th` in `i18n.js`. The personal-trainer strings are merged in by `i18n-trainer.js` (`Object.assign(STR.en|th, …)`).
- `EXTH` and `LADTH` hold the Thai exercise instructions and path titles.
- Module-local strings use `isTh ? '…' : '…'` inline. No script can check those, so review them by hand.
- Add every key to both languages. Dynamic `t('m_' + x)` calls need the whole key family in both languages.
- **Check:** `i18n` (en/th parity, every literal `t('key')` exists, every prefix family exists).

## AI model and SDK

- The Claude model and SDK URL are written in `coach.js` (constants `MODEL`, `SDK`) and inline in `nutrition-ai.js`, and stated in CORE-CONTEXT. All must stay identical. Change them all together, after checking current docs.
- Gemini: the key goes only in the `x-goog-api-key` header. The model fallback list is in `nutrition-ai.js`.
- **Check:** `ai-ids` (one Claude id and one SDK version everywhere, matching CORE-CONTEXT; no `key=` in a Gemini URL).

## Bottom nav

- `TABS` in `app.js`. At most 5 tabs fit a 360px screen.
- The More tab is highlighted for the sub-views `yoga` and `lib` (the condition sits next to `nav.innerHTML`).
- Moving a screen under More: update that condition and add an entry row in More, in the same commit.
- **Check:** `nav` (count only; the highlight condition is reviewed by hand).

## CI (Android)

- `.github/workflows/android.yml` triggers only on `workflow_dispatch`.
- It signs with secrets `ANDROID_KEYSTORE_B64` and `ANDROID_KEYSTORE_PASSWORD`, alias `piefit`.
- Never print the secrets. Never add push or schedule triggers (`46a3b00`).
- **Check:** `ci-manual`.

## Legacy UI calls

`prompt` / `alert` / `confirm` and `document`/`window` listeners are frozen at the counts in `tools/map-check.baseline.json`. The count may only go down.
**Check:** `baseline`.
