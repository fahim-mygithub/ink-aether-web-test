// Pages test host only (not part of an itch.io upload). GitHub Pages cannot send response headers, so this worker, scoped to the
// whole site, adds the cross-origin isolation headers that itch.io sends itself when "SharedArrayBuffer support" is on.
// The game's own sw.js (scope play/, isolate=1) does the same for the game page and its Workers inside the iframe.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.cache === 'only-if-cached' && r.mode !== 'same-origin') return;
  e.respondWith(fetch(r).then((res) => {
    if (res.status === 0 || res.type === 'opaque') return res;
    const h = new Headers(res.headers);
    h.set('Cross-Origin-Opener-Policy', 'same-origin');
    h.set('Cross-Origin-Embedder-Policy', 'require-corp');
    h.set('Cross-Origin-Resource-Policy', 'same-origin');
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
  }).catch((err) => { console.error('coi-sw', err); throw err; }));
});
