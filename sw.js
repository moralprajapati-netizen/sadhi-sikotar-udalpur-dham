const CACHE_NAME = "sadhi-sikotar-app-v39";
const APP_FILES = ["./", "./index.html", "./styles.css?v=20261103d", "./script.js?v=20261105b", "./manifest.json", "./icon.svg", "./1.png", "./covers/bhajan-cover.jpg?v=20261028j", "./covers/stories-cover.jpg?v=20261028j", "./covers/gallery-cover.jpg?v=20261028k", "./covers/festivals-cover.jpg?v=20261028j", "./covers/video-cover.jpg?v=20261028k", "./covers/history-cover.jpg?v=20261028j", "./covers/contact-cover.jpg?v=20261028j", "./2.png", "./copilot_20250729_095554.png"];

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
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  const isImage = request.destination === "image";

  // Cache images from the site AND external image hosts (Firebase/GitHub).
  // This lets images already viewed online remain available offline.
  if (isImage) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok || response.type === "opaque") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  if (requestUrl.origin !== self.location.origin) return;

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
