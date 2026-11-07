# Map hub: what changes together

Read this before editing anything that touches more than one file, then open the one map it points to.
Each map entry: what it is → where it lives → what else must change → which check enforces it.

| If you are changing… | Map | Enforced by `map-check` |
|---|---|---|
| a script, asset, `index.html` tags, `sw.js`, the APK bundle, manifest, icons | [MAP-FILES-CACHE.md](MAP-FILES-CACHE.md) | scripts-sw, load-order, sw-version, sw-reload, jekyll-liquid |
| a storage key, backup export/import, "delete all data", settings, AI key slots | [MAP-DATA.md](MAP-DATA.md) | storage-keys, backup-fields |
| a cross-module call, translations, AI model/SDK, nav tabs, CI workflow | [MAP-MODULES.md](MAP-MODULES.md) | module-api, i18n, ai-ids, nav, ci-manual, baseline |

`node tools/map-check.js` prints PASS/FAIL per check id. A FAIL message says which file to fix.
If you change what a check asserts, change the map text in the same commit (and the reverse).
