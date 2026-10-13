# PieFit

Personal workout tracker for gymnastic rings, TRX, ab wheel and the gym. Works offline as an installable web app (PWA).

Open: https://tchawankon.github.io/piefit/

- Calibration test to find your starting level
- Suggested reps and weights each session (double progression)
- Swap any exercise for another one that trains the same muscles
- Ring progression paths with unlockable steps
- Weekly sets per muscle against adjustable targets
- Thai / English, export / import backup

All workout data stays in the browser on your device. Nothing is sent to a server.

Plain HTML/JS, no build step: `index.html`, `app.js` (logic), `data.js` (exercises and animations), `i18n.js` (translations), `sw.js` (offline cache, bump `VERSION` after changes).
