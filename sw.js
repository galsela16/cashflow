// CashflowHQ Service Worker — network-first navigation, fast static fallback
const CACHE = 'cashflowhq-v255-payment-edit';

const CORE = [
  '/',
  '/styles.css',
  '/app.js',
  '/pricing.js',
  '/pdf-font.js',
  '/pwa.js',
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

  // קבצי האפליקציה הקריטיים הם network-first כדי שרענון אחרי Deploy
  // לא ימשיך להריץ JavaScript ישן מתוך ה-PWA cache.
  const critical = ['/app.js', '/pricing.js', '/styles.css', '/pwa.js'];
  if (critical.includes(url.pathname)) {
    e.respondWith(
      fetch(req, { cache: 'no-store' })
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
          return res;
        })
        .catch(() => caches.match(req))
    );
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
