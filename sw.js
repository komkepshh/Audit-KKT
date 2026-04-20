// ============================================================
// SERVICE WORKER — APD Monitor
// Versi ini: HAPUS semua cache lama saat aktif
// ============================================================
const CACHE_NAME = 'apd-v' + Date.now(); // nama unik tiap deploy

// Install: skip waiting langsung
self.addEventListener('install', e => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

// Activate: hapus SEMUA cache lama tanpa terkecuali
self.addEventListener('activate', e => {
  console.log('[SW] Activating, clearing ALL old caches...');
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => {
        console.log('[SW] Deleted cache:', k);
        return caches.delete(k);
      })))
      .then(() => self.clients.claim())
      .then(() => console.log('[SW] All caches cleared ✅'))
  );
});

// Fetch: network only — tidak cache apapun
// Biarkan browser handle seperti biasa
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => {
    // Kalau offline, return halaman offline minimal
    if(e.request.mode === 'navigate'){
      return new Response(
        `<!DOCTYPE html><html><head><meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>APD Monitor - Offline</title>
        <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f0f4f8}
        .box{text-align:center;padding:40px;background:#fff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,.1)}
        h2{color:#1565a0;margin-bottom:8px}p{color:#64748b}
        button{margin-top:20px;padding:10px 24px;background:#1565a0;color:#fff;border:none;border-radius:8px;font-size:1rem;cursor:pointer}
        </style></head>
        <body><div class="box">
          <div style="font-size:48px">📡</div>
          <h2>Tidak Ada Koneksi</h2>
          <p>Periksa koneksi internet Anda,<br>lalu coba lagi.</p>
          <button onclick="location.reload()">🔄 Coba Lagi</button>
        </div></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    return new Response('Offline', { status: 503 });
  }));
});
