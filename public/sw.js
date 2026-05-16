// ═══════════════════════════════════════════════════════
//  Grand Palace Hotel POS — Service Worker
//  Strategy: Cache First for assets, Network First for HTML
// ═══════════════════════════════════════════════════════

const CACHE_NAME = 'gp-pos-v3';
const OFFLINE_URL = '/';

// Files to cache on install (app shell)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Google Fonts — cache for offline use
  'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Mono:wght@400;500&display=swap',
];

// ── INSTALL: precache app shell ──────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing v3...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Precaching app shell');
      // Add what we can, ignore failures (e.g. font CDN offline)
      return Promise.allSettled(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Could not cache:', url, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: clean old caches ───────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating v3...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: smart caching strategy ────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // For Google Fonts — cache first, then network
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // For same-origin HTML (the app) — network first, fallback to cache
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // For everything else — stale while revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// ── STRATEGIES ───────────────────────────────────────────

// Cache first — great for fonts, icons, static assets
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network first — great for the main HTML app
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline — try cache
    const cached = await caches.match(request);
    if (cached) return cached;
    // Ultimate fallback — serve index.html for navigation
    if (request.mode === 'navigate') {
      const fallback = await caches.match(OFFLINE_URL);
      if (fallback) return fallback;
    }
    return offlinePage();
  }
}

// Stale while revalidate — serve cache immediately, update in background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || fetchPromise || offlinePage();
}

function offlinePage() {
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline — GP POS</title>
    <style>body{font-family:sans-serif;background:#111827;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:16px;text-align:center;padding:24px}
    h1{font-size:24px;font-weight:700}.sub{color:rgba(255,255,255,.6);font-size:14px}
    .icon{font-size:64px}.btn{margin-top:8px;padding:12px 28px;background:#E94560;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit}
    </style></head><body>
    <div class="icon">🏨</div>
    <h1>You're Offline</h1>
    <p class="sub">Grand Palace Hotel POS needs a connection to load.<br>Please check your internet and try again.</p>
    <button class="btn" onclick="location.reload()">Try Again</button>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}

// ── BACKGROUND SYNC (future: sync bills when back online) ─
self.addEventListener('sync', event => {
  if (event.tag === 'sync-bills') {
    console.log('[SW] Background sync: syncing pending bills...');
    // Future: POST pending bills to server
  }
});

// ── PUSH NOTIFICATIONS (future: new online orders) ────────
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'GP Hotel POS', {
    body: data.body || 'New notification',
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/icon-192.png',
    tag: data.tag || 'gp-pos',
    data: data,
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});

console.log('[SW] Grand Palace Hotel POS Service Worker v3 loaded');
