# PieFit: project rules for Claude

PieFit is an offline-first PWA for rings, TRX, bodyweight and gym training, plus yoga, habits, a 30-day challenge and nutrition.
Vanilla JS (ES6+), no framework, no build step, no runtime dependencies. Keep it that way.

## Architecture

- Classic `<script>` tags in `index.html`, loaded in this order: native, data, i18n, i18n-trainer, sound, coach, body, form, videos, yoga, habits, challenge, nutrition-data, nutrition-ai, nutrition, calendar, app.
  A module that another one needs must load before it.
- Each feature is an IIFE exposing one global (`Habits`, `Challenge`, `Nutrition`, `Coach`, `Body`, `Yoga`). `app.js` wires them in.
- Globals available to every module: `store`, `t(key, ...args)`, `esc`, `EX`, `LOG`, `LADDERS`, `MASTERED`, `SET`, `TG`, `CAL`, `go(tab, view)`, `render()`, `persist()`, `toast`, `app`.
- Routing: `go(tab, view)` then `render()`. The bottom nav has 5 tabs (home, food, lib, prog, more). Yoga lives under More; keep the nav at 5 or fewer so it fits a 360px screen.
- Storage: `store.get(k, default)` / `store.set(k, value)` (localStorage). Never touch `localStorage` directly in feature code.
- CSS: variables and classes already in `index.html` (`--bg --card --ink --mute --line --accent --ok --warn --soft`; `.card .row .seg .chip .btn .tag .num .inp .track .modal .sheet`). Reuse them before adding styles.
- Service worker `sw.js`: every new file must be added to `FILES`, and `VERSION` bumped, or the offline cache goes stale.

## Storage keys (do not rename without a migration)

| Module | Keys |
|---|---|
| Habits | `habits_cfg`, `habits_logs`, `habits_inbody` |
| Body | `body` (weigh-ins), `body_goal` (target weight, kg) |
| Challenge | `challenge_state_v4` |
| Nutrition | `nutrition_days_v1`, `nutrition_my_foods_v1`, `nutrition_custom_targets_v1` |
| AI keys | `aikey` (Claude key, shared with the coach), `nutri_key` (Food tab), `gemini_key` (legacy) |

Anything new that stores user data must also be added to `exportData()` / `importData()` in `app.js`, and the export and import field names must match.

## Rules every change must follow

1. **No `prompt()`, `alert()` or new `confirm()`.** Use a `.modal` + `.sheet` with buttons. Show copyable text in a textarea sheet.
2. **Escape before `innerHTML`.** Anything the user typed, or an AI returned, goes through `esc()` (inside `nutrition*.js` use `escH`).
3. **Both languages.** Every visible string needs Thai and English (`t()` for shared strings, `isTh ? '…' : '…'` inline in a module).
4. **Phone first.** Check at 360px wide: no horizontal scroll, tap targets at least 40px, rows that can overflow get `flex-wrap:wrap`.
5. **Offline first.** Nothing may be required from the network except optional AI calls, and those must fail with a clear message.
6. **No duplicated rules.** One function decides "is this habit done" or "what is the target"; the UI, the streak and any sync call it. Do not copy a data schema into another module; add a small API on the owning module instead (example: `Habits.syncProtein`).
7. **Rebinding is fine, leaking is not.** Handlers are set with `onclick =` on freshly rendered nodes. Do not add `addEventListener` on `document` / `window` from inside a view without removing it.
8. **Validate before shipping:** `node --check` on every changed `.js`, then open the page at 360px and exercise the change. Do not report a UI change as working without doing the second step.

## AI calls

- Claude: model `claude-haiku-5-5`, SDK `https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.133.0/+esm` with `dangerouslyAllowBrowser: true`. Same as `coach.js`; keep them in step.
- Gemini: key goes in the `x-goog-api-key` header, never in the URL. Use model ids that exist (`gemini-2.5-flash` and similar); do not invent ids.
- A key saved in one feature must never overwrite or clear a key owned by another.
- Check any model id or API field against the existing working code or current docs before using it.

## Working with outside prototypes

The owner may prototype ideas elsewhere (another AI tool, a quick page) and bring them here. The workflow:

1. Treat the prototype as a **spec and a look-and-feel reference**, not code to paste in.
2. Ask for (or extract) four things: the goal in a few sentences, the data to store, what the user does on each screen, and what they liked or disliked in the prototype.
3. Rewrite it here following the rules above. Do not review-and-patch a large foreign file; it costs more and misses the integration bugs (backup, storage keys, offline cache, shared keys).
4. If something in the prototype calls an external API, get a real sample request and response first.

## Git

- Work on a feature branch, merge to `main` only when the owner says so.
- Commits end with the Co-Authored-By line given by the session.
