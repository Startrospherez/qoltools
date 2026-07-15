/* Service worker — ทำให้แอพเปิดได้แบบ offline หลังโหลดครั้งแรก */
const CACHE = 'pali-dict-v28';
const ASSETS = [
  './',
  'index.html',
  'notebook.js',
  'notebook.css',
  'tags-data.js',
  'glossary.js',
  'glossary.css',
  'hub.js',
  'hub.css',
  'feedback.js',
  'feedback.css',
  'sql-wasm.js',
  'sql-wasm.wasm',
  'dict.sqlite.gz',
  'pali-font.ttf',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'icon-512-maskable.png',
  'favicon-32.png',
  'LICENSE',
  'NOTICE'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function fromNetworkThenCache(request) {
  return fetch(request).then(resp => {
    const copy = resp.clone();
    caches.open(CACHE).then(c => c.put(request, copy)).catch(() => {});
    return resp;
  });
}

// หน้า HTML ใช้ network-first เพื่อไม่เปิดหน้ารุ่นเก่าจาก cache เมื่อออนไลน์
// asset หนักอย่างฐานข้อมูล/ฟอนต์ยัง cache-first เพื่อเปิดเร็วและใช้งาน offline ได้
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const acceptsHTML = e.request.headers.get('accept')?.includes('text/html');
  if (e.request.mode === 'navigate' || acceptsHTML) {
    e.respondWith(
      fromNetworkThenCache(e.request).catch(() =>
        caches.match(e.request).then(hit => hit || caches.match('index.html'))
      )
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => hit || fromNetworkThenCache(e.request))
  );
});
