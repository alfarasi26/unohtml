// Nama cache unik untuk game Anda
const CACHE_NAME = 'uno-game-cache-v2.82';

// Daftar file yang perlu disimpan agar game bisa berjalan offline
// Ganti 'index.html' jika nama file utama Anda berbeda
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap'
];

// Event 'install': Menyimpan semua file penting ke dalam cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Event 'activate': Membersihkan cache lama jika ada versi baru
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// (GANTI BLOK FETCH LAMA DENGAN INI)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') { return; }

  // STRATEGI 1: Network-First untuk halaman utama
  if (event.request.mode === 'navigate') {
    event.respondWith(
      // Selalu coba ambil dari INTERNET DULU
      fetch(event.request).catch(() => {
        // Jika internet gagal, baru ambil dari CACHE
        return caches.match(event.request);
      })
    );
    return;
  }

  // STRATEGI 2: Cache-First untuk aset lain
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});

// (TAMBAHKAN INI DI AKHIR FILE sw.js)
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
