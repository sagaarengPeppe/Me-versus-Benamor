const CACHE_NAME = "me-vs-benamor-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./css/style.css",
    "./js/app.js",
    "./js/engine.js",
    "./manifest.json",
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
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});