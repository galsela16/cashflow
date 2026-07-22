// CashflowHQ Service Worker
// גרסה — שנה את המספר בכל פריסה כדי לאלץ עדכון אצל המשתמשים
const CACHE = 'cashflowhq-v1';

// קבצים בסיסיים לקאש (מעטפת האפליקציה)
const CORE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png'
];

// התקנה — שומר את מעטפת האפליקציה
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE).catch(() => {}))
  );
  self.skipWaiting();
});

// הפעלה — מנקה גרסאות ישנות של הקאש
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// אסטרטגיה: Network-first.
// חשוב: לא נוגעים בבקשות ל-Supabase / Google — הן חייבות להיות תמיד רשת חיה.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // דלג על כל מה שאינו GET ועל בקשות למקורות חיצוניים (API, אימות, וכו')
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) {
    return; // נותן לדפדפן לטפל כרגיל — ללא מעורבות ה-SW
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // עדכן קאש ברקע רק לקבצים מקומיים תקינים
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('/index.html')))
  );
});
