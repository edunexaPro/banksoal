const CACHE_NAME = 'edunexa-store-v1'; // <-- Ubah v1 menjadi v2 jika Anda membuat update besar di masa depan
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. Event Install: Mengunduh aset awal di latar belakang
self.addEventListener('install', (e) => {
  self.skipWaiting(); // 🔥 Langsung aktifkan service worker baru
  
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Mengunduh aset ke dalam cache...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Event Activate: Membersihkan sampah cache versi lama
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
    }).then(() => self.clients.claim()) // 🔥 Memaksa semua tab langsung memakai logika baru
  );
});

// 3. Event Fetch: STRATEGI NETWORK-FIRST (Cocok untuk Generator Soal)
// Mencoba ambil dari internet dulu agar update selalu instan, jika offline baru pakai cache.
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Jika sukses mengambil data terbaru dari internet/GitHub, simpan salinannya ke cache
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, response.clone());
          return response;
        });
      })
      .catch(() => {
        // JIKA INTERNET MATI/OFFLINE, baru ambil file dari cache HP
        return caches.match(e.request);
      })
  );
});
