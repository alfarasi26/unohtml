// Nama cache unik untuk game Anda
const CACHE_NAME = 'uno-game-cache-v2.01';

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

// Event 'fetch': Menyajikan file dari cache jika tersedia (untuk offline)
self.addEventListener('fetch', (event) => {
  // Hanya proses request GET
  if (event.request.method !== 'GET') {
      return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        // Jika ada di cache, langsung berikan dari cache
        return cachedResponse;
      }
      
      // Jika tidak ada di cache, ambil dari internet, lalu simpan ke cache
      try {
        const networkResponse = await fetch(event.request);
        // Pastikan response valid sebelum di-cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        // Gagal mengambil dari internet (offline)
        console.error('[ServiceWorker] Fetch failed; returning offline page instead.', error);
        // Anda bisa mengembalikan halaman offline custom di sini jika mau
      }
    })
  );
});
