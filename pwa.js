// רישום Service Worker — מאפשר התקנה כאפליקציה (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').then(function (reg) {
      // בדוק אם יש גרסה חדשה בכל טעינה
      reg.update();
      // כשגרסה חדשה נכנסת לתוקף — רענן פעם אחת כדי לטעון אותה
      var refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }).catch(function (e) {
      console.warn('SW registration failed:', e);
    });
  });
}
