// CashflowHQ Service Worker
// גרסה — שנה את המספר בכל פריסה כדי לאלץ עדכון אצל המשתמשים
const CACHE = 'cashflowhq-v2';

// נכסים סטטיים בלבד (לא ה-HTML — הוא תמיד מהרשת)
const CORE = [
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE).catch(() => {})));
  self.skipWaiting(); // הגרסה החדשה נכנסת מיד לתוקף
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

  // בקשות שאינן GET או למקורות חיצוניים (Supabase/Google) — לא נוגעים
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // ניווט / HTML — תמיד מהרשת, תוך עקיפת מטמון הדפדפן.
  const isHTML = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    e.respondWith(
      fetch(req, { cache: 'no-store' }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // נכסים סטטיים — מהרשת עם גיבוי לקאש
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req))
  );
});
