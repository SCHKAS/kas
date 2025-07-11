const CACHE_NAME = 'kas-app-cache-v2'; // Cache naam bijgewerkt
const urlsToCache = [
    '/kas/', // De root van je GitHub Pages project
    '/kas/index.html',
    '/kas/input.html',
    '/kas/overview.html',
    '/kas/export.html', // Zorg ervoor dat export.html ook gecached wordt
    '/kas/invoices.html', // Nieuwe factuurpagina toevoegen aan cache
    '/kas/auth.html', // Authenticatiepagina toevoegen aan cache
    '/kas/manifest.json',
    '/kas/Black logo - no background.png', // Logo toevoegen aan cache
    '/kas/icons/icon-192x192.png',
    '/kas/icons/icon-512x512.png',
    '/kas/icons/icon-maskable-192x192.png',
    '/kas/icons/icon-maskable-512x512.png',
    'https://cdn.tailwindcss.com', // Tailwind CSS CDN
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js',
    'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js', // Tone.js toevoegen
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js' // SheetJS toevoegen
];

// Installatie van de Service Worker en caching van app-bestanden
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Failed to cache all URLs:', error);
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
                ).catch(error => {
                    console.error('Fetch failed:', error);
                    // Hier kun je een fallback response teruggeven voor offline situaties
                    // Bijvoorbeeld een offline pagina
                    // return caches.match('/kas/offline.html'); // Als je een offline pagina hebt
                });
            })
    );
});
