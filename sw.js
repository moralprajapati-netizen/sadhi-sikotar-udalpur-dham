const CACHE_NAME = "sadhi-sikotar-app-v101";
const APP_FILES = ["./", "./index.html", "./styles.css?v=20261110k", "./app-redesign.css?v=20261111k", "./script.js?v=20261110j", "./manifest.json", "./icon.svg", "./1.png", "./covers/contact-cover.jpg?v=20261107b", "./2.png", "./copilot_20250729_095554.png", "./covers/history-cover.jpg", "./covers/temple-cover.svg", "./covers/bhajan-cover.jpg", "./covers/video-cover.jpg", "./covers/festivals-cover.jpg", "./covers/stories-cover.jpg"];

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
