// Copies the web app into www/ for Capacitor (the repo root is also the GitHub Pages site).
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), out = path.join(root, 'www');
// every <script src> in index.html, so a new module can never be left out of the APK
const scripts = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
const files = ['index.html', ...scripts, 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
fs.rmSync(out, {recursive: true, force: true});
fs.mkdirSync(out);
files.forEach(f => fs.copyFileSync(path.join(root, f), path.join(out, f)));
console.log('bundled', files.length, 'files into www/');
