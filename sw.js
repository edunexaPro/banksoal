const CACHE_NAME = 'edunexa-store-v1'; // <-- Beri versi agar mudah diupdate nanti
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. Event Install: Terjadi saat ada kode baru
self.addEventListener('install', (e) => {
  self.skipWaiting(); // 🔥 Memaksa Service Worker baru langsung aktif!
  
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Mengunduh aset ke dalam cache...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Event Activate: Membersihkan cache lama jika Anda mengganti versi (misal ke v2)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Menghapus cache usang:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // 🔥 Memaksa seluruh tab langsung memakai kode baru
  );
});

// 3. Event Fetch: Mengambil data dari cache dulu, jika tidak ada baru ambil dari internet
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
