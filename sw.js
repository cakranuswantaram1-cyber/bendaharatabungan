// Service Worker untuk TabBend - Tabungan Sekolah (update otomatis)
const CACHE_PREFIX = 'tabbend-';
const CACHE_NAME = CACHE_PREFIX + 'v1'; // naikkan (v2, v3, ...) HANYA bila menambah/mengganti file di FILES_TO_CACHE

const FILES_TO_CACHE = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Hapus cache lama HANYA milik TabBend (cache aplikasi lain tidak disentuh)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys
        .filter((k) => k.indexOf(CACHE_PREFIX) === 0 && k !== CACHE_NAME)
        .map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Internet dulu supaya update otomatis terambil; bila offline pakai cache.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((m) => m || caches.match('./index.html')))
  );
});
