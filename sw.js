const CACHE_NAME = "sadhi-sikotar-app-v36";
const APP_FILES = ["./", "./index.html", "./styles.css?v=20261103d", "./script.js?v=20261103a", "./manifest.json", "./icon.svg", "./1.png", "./covers/bhajan-cover.jpg?v=20261028j", "./covers/stories-cover.jpg?v=20261028j", "./covers/gallery-cover.jpg?v=20261028k", "./covers/festivals-cover.jpg?v=20261028j", "./covers/video-cover.jpg?v=20261028k", "./covers/history-cover.jpg?v=20261028j", "./covers/contact-cover.jpg?v=20261028j", "./2.png", "./copilot_20250729_095554.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  // Keep images fast from cache; refresh other app files so new releases appear promptly.
  if (request.destination === "image") {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      }))
    );
    return;
  }

  event.respondWith(
    fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        if (request.mode === "navigate") {
          const pageCopy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html", pageCopy));
        }
      }
      return response;
    }).catch(() => caches.match(request).then(cached => cached || caches.match("./index.html")))
  );
});
