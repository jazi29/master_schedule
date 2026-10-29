const C = 'raspisanie-v2';
const FILES = ['./', './index.html'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
// Open instantly from cache, refresh the cache in the background
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached => {
      const net = fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(C).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => cached || caches.match('./index.html'));
      return cached || net;
    })
  );
});
