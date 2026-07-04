const CACHE_NAME = "me-vs-benamor-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/style.css",
    "./js/app.js",
    "./js/engine.js",
    "./images/icon-192.png",
    "./images/icon-512.png",
    "./images/benamor-logo.png",
    "./courses/benamor/course.json",
    "./courses/benamor/holes.json",
    "./courses/benamor/slopes.json"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
});