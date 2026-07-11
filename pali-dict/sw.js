/* Service worker — ทำให้แอพเปิดได้แบบ offline หลังโหลดครั้งแรก */
const CACHE = 'pali-dict-v26';
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

// cache-first: เปิดเร็วและทำงาน offline; ถ้าไม่มีใน cache ค่อยไปเน็ต
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return resp;
    }).catch(() => caches.match('index.html')))
  );
});
