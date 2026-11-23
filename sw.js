const C = 'mlp-v38';
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(['./', 'index.html', 'styles.css?v=38', 'app.js?v=38', 'store.js?v=38', 'logo.png', 'mark.png']))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request, { cache: 'no-store' }).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
});
