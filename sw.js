// PieFit service worker: caches the app shell so it works offline.
// Serves from cache first, refreshes the cache in the background (bump VERSION to force an update).
const VERSION = 'piefit-v4';
const FILES = ['./', './index.html', './app.js', './data.js', './i18n.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(e.request, {ignoreSearch:true});
    const net = fetch(e.request).then(res => { if(res.ok) cache.put(e.request, res.clone()); return res; }).catch(() => null);
    return hit || (await net) || cache.match('./index.html');
  }));
});
