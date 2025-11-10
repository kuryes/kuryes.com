// JetlaApp Ödeme Uygulaması Service Worker
// Sadece odeme.html için bağımsız PWA

const CACHE_NAME = 'jetlaapp-odeme-v1.0.0';
const STATIC_CACHE = 'jetlaapp-static-v1.0.0';

// Cache edilecek dosyalar
const STATIC_FILES = [
    './odeme.html',
    './manifest.json',
    './favicon-16x16.png',
    './favicon-32x32.png',
    './favicon-64x64.png',
    './icon-192.png',
    './icon-512.png'
];

// Install event
self.addEventListener('install', (event) => {
    console.log('JetlaApp Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('JetlaApp Service Worker: Caching files');
                return cache.addAll(STATIC_FILES.map(url => new Request(url, {cache: 'reload'})));
            })
            .then(() => {
                console.log('JetlaApp Service Worker: Installed');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('JetlaApp Service Worker: Install error', error);
            })
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('JetlaApp Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Sadece kendi cache'lerimizi tut, diğerlerini sil
                        if (cacheName.startsWith('jetlaapp-') && cacheName !== STATIC_CACHE) {
                            console.log('JetlaApp Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('JetlaApp Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Sadece aynı klasördeki dosyaları handle et
    // Service worker odeme klasöründe olduğu için sadece bu klasördeki dosyaları işle
    const pathname = url.pathname;
    if (!pathname.includes('odeme.html') && !pathname.includes('manifest.json') && 
        !pathname.includes('icon-') && !pathname.includes('favicon-') && 
        pathname !== url.origin + '/odeme/') {
        return; // Diğer istekleri ignore et
    }
    
    // Sadece GET istekleri
    if (request.method !== 'GET') {
        return;
    }
    
    // Sadece aynı origin
    if (url.origin !== location.origin) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    console.log('JetlaApp Service Worker: Serving from cache', request.url);
                    return cachedResponse;
                }
                
                console.log('JetlaApp Service Worker: Fetching from network', request.url);
                return fetch(request)
                    .then((response) => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        const responseToCache = response.clone();
                        
                        caches.open(STATIC_CACHE)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch((error) => {
                        console.error('JetlaApp Service Worker: Fetch failed', error);
                        
                        if (request.mode === 'navigate') {
                            return caches.match('./odeme.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

console.log('JetlaApp Service Worker: Loaded');

