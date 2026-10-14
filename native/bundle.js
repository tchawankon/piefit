// Copies the web app into www/ for Capacitor (the repo root is also the GitHub Pages site).
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), out = path.join(root, 'www');
const files = ['index.html', 'app.js', 'data.js', 'i18n.js', 'i18n-trainer.js', 'sound.js', 'native.js', 'coach.js', 'body.js', 'form.js', 'yoga.js', 'videos.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
fs.rmSync(out, {recursive: true, force: true});
fs.mkdirSync(out);
files.forEach(f => fs.copyFileSync(path.join(root, f), path.join(out, f)));
console.log('bundled', files.length, 'files into www/');
