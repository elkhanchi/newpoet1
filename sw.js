const STATIC_CACHE_NAME = 'sada-al-aqlam-static-v4';
const DYNAMIC_CACHE_NAME = 'sada-al-aqlam-dynamic-v4';

// Assets to pre-cache for the app shell
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn-icons-png.flaticon.com/512/2921/2921718.png',
  'https://www.transparenttextures.com/patterns/arabesque.png',
  'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Tajawal:wght@300;400;500;700&family=Reem+Kufi:wght@400;500;600;700&display=swap'
];

// Install event: pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('SW: Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event: clean up old caches for seamless updates
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

// Fetch event: serve from cache or network, and cache new assets dynamically
self.addEventListener('fetch', (event) => {
  // Never cache API requests to Google AI, always fetch from network
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    return; // Let the browser handle it, which means network only.
  }

  event.respondWith(
    caches.match(event.request).then((cacheRes) => {
      // Return cached response if found, providing offline access
      if (cacheRes) {
        return cacheRes;
      }
      
      // Otherwise, fetch from network
      return fetch(event.request).then((fetchRes) => {
        // Cache the new response for future offline use
        return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
          // Check for a valid response before caching
          if (fetchRes.status === 200) {
            cache.put(event.request.url, fetchRes.clone());
          }
          return fetchRes;
        });
      });
    }).catch(() => {
        // If both cache and network fail, the request will fail.
        // This is expected for offline scenarios where an asset hasn't been cached.
    })
  );
});