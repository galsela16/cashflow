// CashflowHQ Service Worker — network-first navigation, fast static fallback
const CACHE = 'cashflowhq-v257-loading';

const CORE = [
  '/',
  '/styles.css?v=2.5.7',
  '/app.js?v=2.5.7',
  '/pricing.js?v=2.5.7',
  '/pdf-font.js',
  '/pwa.js?v=2.5.7',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Never cache writes, cross-origin data, or partial-content requests.
  if (req.method !== 'GET' || url.origin !== self.location.origin || req.headers.has('range')) return;

  const isHTML = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    e.respondWith(
      fetch(req, { cache: 'no-store' })
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put('/', res.clone()));
          return res;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Versioned assets are immutable within a release. Navigation stays network-first
  // so a new deployment discovers its new versioned URLs and service worker.
  const critical = ['/app.js', '/pricing.js', '/styles.css', '/pwa.js'];
  if (critical.includes(url.pathname)) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      if (url.searchParams.get('v') === '2.5.7') {
        const cached = await cache.match(req);
        if (cached) return cached;
      }
      try {
        const res = await fetch(req, { cache: 'no-store' });
        if (res.ok) await cache.put(req, res.clone());
        return res;
      } catch (error) {
        const cached = await cache.match(req);
        if (cached) return cached;
        throw error;
      }
    })());
    return;
  }

  // שאר הנכסים המקומיים: cache-first עם רענון ברקע.
  e.respondWith(
    caches.match(req).then((cached) => {
      const fresh = fetch(req).then((res) => {
        if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      });
      return cached || fresh;
    })
  );
});
