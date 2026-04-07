const CACHE = "japn1200-kanji-v1.0.7-lesson44to47";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./data/kanji.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./sw.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k === CACHE ? null : caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (e) => {
  if (e.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }
  if (e.data?.type === "FORCE_REFRESH") {
    e.waitUntil(
      caches.keys()
        .then(keys => Promise.all(keys.map(k => caches.delete(k))))
        .then(() => self.clients.matchAll({ includeUncontrolled: true, type: "window" }))
        .then(clients => Promise.all(clients.map(client => client.navigate(client.url))))
    );
  }
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put("./index.html", copy)).catch(()=>{});
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(hit => {
      const networkFetch = fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
        return res;
      });
      return hit || networkFetch;
    }).catch(() => caches.match("./index.html"))
  );
});
