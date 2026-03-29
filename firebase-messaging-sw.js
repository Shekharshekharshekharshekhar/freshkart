// HariBasket Service Worker — Auto Update + Push Notifications
const CACHE_NAME = 'haribasket-v4';
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
  // Sirf GET requests handle karo
  if (event.request.method !== 'GET') return;

  // Firebase aur API requests bypass karo
  const url = event.request.url;
  if (
    url.includes('firestore.googleapis.com') ||
    url.includes('firebase') ||
    url.includes('netlify/functions') ||
    url.includes('emailjs') ||
    url.includes('razorpay')
  ) {
    return;
  }

  // Network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Fresh response cache mein save karo
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline — cache se serve karo
        return caches.match(event.request);
      })
  );
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
