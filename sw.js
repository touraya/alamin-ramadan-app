const CACHE_NAME = "alamin-ramadan-app-v4";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js",
  "./icon-moon-192.png",
  "./icon-moon-512.png",
  "./icon-at-192.png",
  "./icon-at-512.png"
];

// Install: cache static files so the app opens offline
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - Static: cache-first
// - API calls: network-first, fallback to cache (so you can use last data offline)
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  const isApi =
    url.hostname.includes("api.aladhan.com") ||
    url.hostname.includes("nominatim.openstreetmap.org");

  if (isApi) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Static files
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
