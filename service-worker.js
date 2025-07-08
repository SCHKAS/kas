const CACHE_NAME = 'kas-app-cache-v1';
const urlsToCache = [
    '/kas/', // De root van je GitHub Pages project
    '/kas/index.html',
    '/kas/input.html',
    '/kas/overview.html',
    '/kas/manifest.json',
    '/kas/icons/icon-192x192.png',
    '/kas/icons/icon-512x512.png',
    '/kas/icons/icon-maskable-192x192.png',
    '/kas/icons/icon-maskable-512x512.png',
    'https://cdn.tailwindcss.com', // Tailwind CSS CDN
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js'
];

// Installatie van de Service Worker en caching van app-bestanden
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activeren van de Service Worker en opschonen van oude caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Ophalen van bronnen: probeer eerst de cache, dan het netwerk
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // Geen cache hit - ga naar netwerk
                return fetch(event.request).then(
                    response => {
                        // Controleer of we een geldige response hebben
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Belangrijk: kloon de response omdat deze een stream is
                        // en kan maar één keer worden geconsumeerd.
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});
