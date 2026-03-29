// HariBasket Service Worker — Auto Update + Push Notifications
const CACHE_NAME = 'haribasket-v5';
const CACHE_ENABLED = false; // Cache band karo
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// ── INSTALL ──────────────────────────────────────
self.addEventListener('install', event => {
  // Turant activate karo — wait mat karo
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    }).catch(() => {})
  );
});

// ── ACTIVATE ─────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Purane caches delete karo
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      ),
      // Sab clients pe turant control lo
      clients.claim()
    ])
  );
});

// ── FETCH ─────────────────────────────────────────
self.addEventListener('fetch', event => {
  // Cache completely bypass — always network
  if (event.request.method !== 'GET') return;
  // Sirf navigate requests handle karo
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
  }
});

// ── PUSH NOTIFICATIONS ────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'HariBasket se naya update!',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: { url: data.url || '/' },
      actions: [
        { action: 'open', title: 'Dekho' },
        { action: 'close', title: 'Baad mein' }
      ]
    };
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'HariBasket',
        options
      )
    );
  } catch(e) {}
});

// ── NOTIFICATION CLICK ────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'close') return;
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const client of list) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(
          event.notification.data.url || '/'
        );
      }
    })
  );
});

// ── AUTO UPDATE MESSAGE ───────────────────────────
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
