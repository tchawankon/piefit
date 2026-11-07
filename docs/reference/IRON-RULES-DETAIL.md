# Iron Rules: full detail

The short forms in `docs/CORE-CONTEXT.md` are binding, and so is this file. Grep a rule by its number, e.g. `grep -n "^## Rule 1 " …`.

## Rule 1: shipping

`main` is production: GitHub Pages serves `origin/main` with no build and no staging. How a release goes out:

1. The work is finished on a feature branch and `npm run preflight` is green.
2. For a UI change, check it in the local preview at 360px.
3. The owner says to ship. Merge the branch into `main` locally (`git switch main && git merge --no-ff <branch>`).
4. Run `node tools/ship.js`, which does the following:
   - runs preflight
   - checks you are on `main` with a clean tree
   - pushes `origin main`
   - waits until the GitHub "pages build and deployment" run for that exact commit succeeds, AND a file changed in this ship (prefer `sw.js`) is served byte-identical by production. VERSION alone is not enough, because a docs-only ship keeps it (incident 2026-11-07)
   - appends `OK` to `SHIP-LOG.txt` and commits only that file
   - if Pages does not update in time it logs `PENDING` and exits 1. Do not mark the work `live` then.
5. Set the sprint entry to `live` with the ship-log line as evidence, then archive it.

Pages builds with Jekyll: `.md` becomes `.html` and `_`/`.` files are hidden. A Liquid error (`{{`, `{%`) in any `.md` fails the whole site build.

A push made outside `ship.js` leaves no log line. `whats-next` flags this ("origin/main not in ship log").

## Rule 2: offline cache

- The SW is cache first with a background refresh, and an old `VERSION` keeps the old cache.
- Bump `VERSION` once per ship when any cached file changed. `map-check sw-version` compares against `origin/main`, so it goes red on a branch until you bump, which is the reminder.

## Rule 7: Android

- APKs were built on every push (`efeba2d`). That was changed to manual (`46a3b00`) because the owner tests on the web first.
- A new `appId` or a lost or replaced keystore means existing installs cannot update and their data is stranded.
- Build only when the owner asks: `gh workflow run android.yml` (ask first).

## Rule 17: outside prototypes

The owner may prototype elsewhere (another AI tool, a quick page) and bring it here:

1. Treat it as a spec and a look-and-feel reference, not as code to paste.
2. Get four things: the goal in a few sentences, the data to store, what the user does on each screen, and what the owner liked or disliked.
3. Rewrite it following CORE-CONTEXT. Do not review and patch a large foreign file; that misses the integration points (backup, storage keys, offline cache, shared keys).
4. If it calls an external API, get a real sample request and response first.

## Ask-first zones

| Zone | What breaks |
|---|---|
| `native/` | Patches the generated Android project. Breaks the APK build or the plugins (keep-awake, notifications), and only shows up when CI runs |
| `.github/workflows/android.yml` | Signing secrets, the manual trigger, release publishing |
| `capacitor.config.json` | `appId` is the Android identity; `webDir` must match `native/bundle.js` |
| `manifest.webmanifest` | `start_url` / `scope` / icons: installed PWAs lose their identity |
| `app.js` `KEY = 'ringfit.'` and every storage key | All user data disappears |
| `exportData` / `importData` field names | Old backups can no longer be restored |
| signing files (`*.p12`, `*.keystore`, git-ignored) | Phones refuse updates |
