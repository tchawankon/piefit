// PieFit service worker: caches the app shell so it works offline.
// Serves from cache first, refreshes the cache in the background (bump VERSION to force an update).
const VERSION = 'piefit-v23';
const FILES = ['./', './index.html', './app.js', './data.js', './i18n.js', './i18n-trainer.js', './sound.js', './native.js', './coach.js', './body.js', './form.js', './yoga.js', './videos.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  // cache:'reload' skips the browser HTTP cache, so a new version never installs stale files
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, {cache:'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== 'piefit-ext').map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// large third-party files used by the form check and the AI coach: cache them after the first download
const EXT = /^https:\/\/(cdn\.jsdelivr\.net\/npm\/@(mediapipe|anthropic-ai)\/|storage\.googleapis\.com\/mediapipe-models\/)/;
self.addEventListener('fetch', e => {
  if(e.request.method === 'GET' && EXT.test(e.request.url)){
    e.respondWith(caches.open('piefit-ext').then(async c => {
      const hit = await c.match(e.request); if(hit) return hit;
      const res = await fetch(e.request); if(res.ok) c.put(e.request, res.clone()); return res;
    }));
    return;
  }
  if(e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(e.request, {ignoreSearch:true});
    const net = fetch(e.request, {cache:'no-cache'}).then(res => { if(res.ok) cache.put(e.request, res.clone()); return res; }).catch(() => null);
    return hit || (await net) || cache.match('./index.html');
  }));
});
