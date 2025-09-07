const CACHE_NAME = 'gestor-pro-cache-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/bundle.js',
  'icon-192x192.png',
  'icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // AddAll can fail if one of the resources fails. For robustness,
        // you might want to add them individually and catch errors.
        return cache.addAll(urlsToCache).catch(error => {
            console.error('Failed to cache one or more resources:', error);
        });
      })
  );
});

self.addEventListener('fetch', (event) => {
    // Let the browser handle requests for external scripts and identity
    if (event.request.url.includes('aistudiocdn.com') || event.request.url.includes('cdn.tailwindcss.com') || event.request.url.includes('identity.netlify.com')) {
        return;
    }

    // For the main app (HTML and JS), use Network-First to ensure updates.
    if (event.request.mode === 'navigate' || event.request.url.endsWith('/bundle.js')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                // If network fails, serve from cache.
                // For navigation, fallback to the root cache.
                return caches.match(event.request.mode === 'navigate' ? '/' : event.request);
            })
        );
        return;
    }

    // For other assets (icons, manifest), use Cache-First for speed.
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});