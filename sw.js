// Service Worker untuk TabBend - Tabungan Sekolah
// Versi cache - naikkan nomor ini setiap kali update file agar cache di-refresh
const CACHE_NAME = 'tabbend-cache-v1';

// File yang akan disimpan agar app tetap bisa dibuka walau offline
const FILES_TO_CACHE = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Saat service worker pertama kali terpasang, simpan file inti ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Bersihkan cache versi lama saat service worker baru aktif
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Strategi: coba ambil dari network dulu (biar selalu dapat versi terbaru),
// kalau gagal/offline baru ambil dari cache
self.addEventListener('fetch', (event) => {
  // Hanya tangani request GET (request lain seperti POST tidak di-cache)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Simpan salinan terbaru ke cache untuk dipakai saat offline nanti
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Kalau offline/gagal fetch, ambil dari cache
        return caches.match(event.request);
      })
  );
});
