// Kuryes.com Service Worker
// Basic caching for PWA functionality

const CACHE_NAME = 'kuryes-v1.0.0';
const STATIC_CACHE = 'kuryes-static-v1.0.0';
const DYNAMIC_CACHE = 'kuryes-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/kurye-tabani.html',
    '/freelance.html',
    '/kurye-rehberi.html',
    '/ilanlar.html',
    '/forum.html',
    '/kazanc.html',
    '/isletme-kayit.html',
    '/kullanici-kayit.html',
    '/css/styles.css',
    '/js/app.js',
    '/manifest.json',
    // Add favicon files
    '/public/favicon/kuryesfavicon.png',
    '/public/favicon/kuryespwaicons.png',
    // Add logo files
    '/public/img/kuryes.svg',
    '/public/img/kuryes.png',
    '/public/img/og-image.png'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Error caching static files', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external requests
    if (url.origin !== location.origin) {
        return;
    }
    
    // Skip Formspree requests
    if (url.hostname.includes('formspree.io')) {
        return;
    }
    
    // Skip Telegram requests
    if (url.hostname.includes('t.me')) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('Service Worker: Serving from cache', request.url);
                    return cachedResponse;
                }
                
                // Otherwise fetch from network
                console.log('Service Worker: Fetching from network', request.url);
                return fetch(request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response for caching
                        const responseToCache = response.clone();
                        
                        // Cache dynamic content
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch((error) => {
                        console.error('Service Worker: Fetch failed', error);
                        
                        // Return offline page for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

// Background sync for form submissions (if supported)
self.addEventListener('sync', (event) => {
    if (event.tag === 'form-submission') {
        console.log('Service Worker: Background sync for form submission');
        event.waitUntil(
            // Handle offline form submissions here
            handleOfflineFormSubmissions()
        );
    }
});

// Handle offline form submissions
async function handleOfflineFormSubmissions() {
    try {
        // Get stored form data from IndexedDB or localStorage
        const formData = await getStoredFormData();
        
        if (formData && formData.length > 0) {
            console.log('Service Worker: Processing offline form submissions');
            
            for (const data of formData) {
                try {
                    await fetch(data.url, {
                        method: 'POST',
                        body: data.formData
                    });
                    
                    // Remove successfully submitted form data
                    await removeStoredFormData(data.id);
                } catch (error) {
                    console.error('Service Worker: Error submitting form', error);
                }
            }
        }
    } catch (error) {
        console.error('Service Worker: Error handling offline forms', error);
    }
}

// Store form data for offline submission
async function storeFormData(formData) {
    try {
        // Store in localStorage for simplicity
        const stored = JSON.parse(localStorage.getItem('offlineForms') || '[]');
        stored.push({
            id: Date.now(),
            url: formData.url,
            formData: formData.formData,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('offlineForms', JSON.stringify(stored));
    } catch (error) {
        console.error('Service Worker: Error storing form data', error);
    }
}

// Get stored form data
async function getStoredFormData() {
    try {
        return JSON.parse(localStorage.getItem('offlineForms') || '[]');
    } catch (error) {
        console.error('Service Worker: Error getting stored form data', error);
        return [];
    }
}

// Remove stored form data
async function removeStoredFormData(id) {
    try {
        const stored = JSON.parse(localStorage.getItem('offlineForms') || '[]');
        const filtered = stored.filter(item => item.id !== id);
        localStorage.setItem('offlineForms', JSON.stringify(filtered));
    } catch (error) {
        console.error('Service Worker: Error removing stored form data', error);
    }
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        const urlsToCache = event.data.urls;
        event.waitUntil(
            caches.open(STATIC_CACHE)
                .then((cache) => cache.addAll(urlsToCache))
        );
    }
});

// Push notification handling (for future implementation)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/favicon/favicon-64x64-red.png',
            badge: '/favicon/favicon-32x32-red.png',
            tag: 'kuryes-notification',
            requireInteraction: true,
            actions: [
                {
                    action: 'open',
                    title: 'Aç'
                },
                {
                    action: 'close',
                    title: 'Kapat'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('Service Worker: Loaded successfully');
