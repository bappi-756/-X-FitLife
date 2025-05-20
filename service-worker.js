const CACHE_NAME = 'xfit-v1';
const DYNAMIC_CACHE = 'xfit-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/settings.html',
  '/ask.html',
  '/tips.html',
  '/styles.css',
  '/settings.css',
  '/script.js',
  '/settings.js',
  '/icons/x-fit.ico',
  '/icons/x-fit.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(name => {
            return name !== CACHE_NAME && name !== DYNAMIC_CACHE;
          }).map(name => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
        );
      })
  );
  self.clients.claim();
});

// Fetch event - serve from cache or network with improved strategies
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests except for CDN resources
  if (!event.request.url.startsWith(self.location.origin) &&
      !event.request.url.startsWith('https://cdnjs.cloudflare.com')) {
    return;
  }
  
  // For API requests (if any), use network first, then cache
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For HTML files, use network first strategy to ensure freshness
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => {
              cache.put(event.request, responseClone);
            });
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If no cached version of the HTML, return the offline fallback
              return caches.match('/index.html');
            });
        })
    );
    return;
  }
  
  // For other assets (CSS, JS, images), use cache first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return cached response immediately
          
          // Update cache in the background (cache then network)
          fetch(event.request)
            .then(response => {
              // Don't cache non-successful responses
              if (!response || response.status !== 200) {
                return response;
              }
              
              // Clone the response for caching
              const responseToCache = response.clone();
              
              caches.open(DYNAMIC_CACHE)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            })
            .catch(() => {
              // Ignore network errors for background updates
            });
          
          return cachedResponse;
        }
        
        // If not in cache, get from network and cache
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200) {
              return response;
            }
            
            // Clone the response for caching
            const responseToCache = response.clone();
            
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            
            // Return a fallback for images
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg|ico)$/)) {
              return new Response('', { 
                status: 200, 
                statusText: 'OK',
                headers: new Headers({
                  'Content-Type': 'image/svg+xml',
                  'Cache-Control': 'no-store'
                })
              });
            }
          });
      })
  );
});

// Handle sync event for background data synchronization
self.addEventListener('sync', event => {
  if (event.tag === 'sync-tips-data') {
    event.waitUntil(syncTipsData());
  }
});

// Function to sync tips data
function syncTipsData() {
  return new Promise((resolve, reject) => {
    // This could be implemented to sync offline changes with a server
    // For now, just acknowledge the sync happened
    console.log('Background sync for tips data occurred');
    resolve();
  });
}

// This event is triggered when a push notification is received
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body || 'New fitness tips are available!',
    icon: '/icons/x-fit.png',
    badge: '/icons/x-fit.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/tips.html'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'X-fitLife Update', options)
  );
});

// Click event on the notification
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then(windowClients => {
        // Check if there is already a window open with the target URL
        const url = event.notification.data.url;
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
}); 