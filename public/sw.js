
// Service Worker for Zim Market Trader - Optimized for low data usage
const CACHE_NAME = 'zim-market-trader-v3';
const DYNAMIC_CACHE = 'zim-market-trader-dynamic-v3';

// Essential assets to cache - minimal for low data
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  // Skip waiting forces the waiting service worker to become the active service worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  // Claim clients immediately to control all pages
  event.waitUntil(self.clients.claim());
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - Optimized for low-data environments
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Check if it's a navigation request (HTML document)
  const isNavigationRequest = event.request.mode === 'navigate';
  
  // For HTML documents, use cache-first with network fallback (better for low data)
  if (isNavigationRequest) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Return cached version immediately, then update cache in background
            event.waitUntil(
              fetch(event.request)
                .then(response => {
                  if (response && response.status === 200) {
                    caches.open(CACHE_NAME).then(cache => {
                      cache.put(event.request, response);
                    });
                  }
                })
                .catch(() => {}) // Silently fail background update
            );
            return cachedResponse;
          }
          // No cache, fetch from network
          return fetch(event.request)
            .then(response => {
              if (response && response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, responseClone);
                });
              }
              return response;
            });
        })
    );
    return;
  }
  
  // For API requests and other assets - cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request).then(
          (response) => {
            // Only cache successful responses
            if (!response || response.status !== 200) {
              return response;
            }
            
            // Don't cache API responses or large files
            const contentType = response.headers.get('content-type');
            if (contentType && (
              contentType.includes('application/json') ||
              contentType.includes('text/html')
            )) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
              
            return response;
          }
        ).catch(() => {
          // Return offline page for failed navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Handle service worker updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
