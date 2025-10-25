
const CACHE_NAME = 'prinout-manager-v3';
const OFFLINE_URL = '/offline.html'; // Optional: a fallback page

const ASSETS_TO_CACHE = [
  '/',
  '/index.php',
  '/offline.html',
  '/style.css',      
  '/script.js',      
];

// Install service worker and cache essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate service worker and clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// Fetch: network first, cache fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request)
        .then(cachedResponse => cachedResponse || caches.match('/offline.html'))
      )
  );
});
