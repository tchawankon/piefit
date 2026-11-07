# MAP: files, offline cache, APK bundle

## Adding, renaming or removing a script

- **What:** every module is a classic `<script src>` in `index.html`.
- **Where:** `index.html` (script tags near the end of the body); `sw.js` `FILES` + `VERSION`; the load-order line in `docs/CORE-CONTEXT.md`.
- **Also change:**
  1. Put the tag in load order. A module loads after everything it calls at load time, and `app.js` stays last.
  2. Add it to `sw.js` FILES. If it is missing, offline users never get the file, and if a FILES entry does not exist on disk the SW install fails completely.
  3. Bump `VERSION`.
  4. Update the load-order line in CORE-CONTEXT.
  5. If it exposes a global that others call, see MAP-MODULES.
- **Not needed:** `native/bundle.js` derives its list from `index.html` (on purpose, since `1f8c81e`). Never give it its own list again.
- **Checks:** `scripts-sw`, `load-order`.

## Changing any cached file (any `.js`, `index.html`, manifest, icons)

- **Why:** the SW serves cache first and refreshes in the background. Without a new `VERSION`, installed copies can keep old code.
- **Rule:** if any FILES entry differs from `origin/main`, `VERSION` must differ from `origin/main`'s. Bump once per ship, not once per commit; any increasing number is fine.
- **Keep:** `cache:'reload'` in the install step. It stops a new version from installing stale files from the HTTP cache (`aac72e0`).
- **Checks:** `sw-version`, `sw-reload`.

## Docs on the public site

GitHub Pages (legacy build from `main` /) runs Jekyll over the repo:
- `.md` files are served as `.html`.
- Files starting with `_` or `.` are hidden.
- A Liquid token in any `.md` or `.html` fails the whole build, and production then stops updating. Check: `jekyll-liquid`.
- Adding a `.nojekyll` file at the root would switch Jekyll off. That changes how the site is served, so ask the owner first.

## External files

The `EXT` regex in `sw.js` caches the MediaPipe and Anthropic SDK CDN files after the first download, in cache `piefit-ext`, which is never deleted on activate. If you bump the SDK version (MAP-MODULES › AI), old copies stay in that cache harmlessly.

## Manifest, icons, Android

- `manifest.webmanifest`: changing `start_url`, `scope` or `id` breaks installed PWAs. Ask first.
- `capacitor.config.json`: `appId` `com.tchawankon.piefit` is the Android identity. `webDir` `www` must match `native/bundle.js`. Ask first.
- `native/customize.sh`, `MainActivity.java`, `KeepAwakePlugin.java` patch the generated Android project. Errors only show up in a CI build. Ask first.
- `www/`, `android/` and `node_modules/` are generated and git-ignored. Never edit them.
