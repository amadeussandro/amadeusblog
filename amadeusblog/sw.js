const CACHE_NAME = "amadeus-v1";

/* =========================
   INSTALL (cache static assets)
========================= */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/",
        "/pages/home/index.html",
        "/pages/baca/blog1.html",
        "/styles/base.css",
        "/styles/layout.css",
        "/styles/components.css",
        "/styles/utilities.css",
      ]);
    }),
  );
});

/* =========================
   ACTIVATE (cleanup old cache)
========================= */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        }),
      ),
    ),
  );
});

/* =========================
   FETCH (safe strategy)
========================= */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 🔥 IMPORTANT: skip external request
  if (url.origin !== location.origin) {
    return;
  }

  // Strategy: Cache First, then Network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // optional: cache new request
          const resClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
          });

          return response;
        })
        .catch(() => {
          // fallback (optional)
          return caches.match("/pages/home/index.html");
        });
    }),
  );
});
