const CACHE_NAME = 'slv-pwa-v22';
const APP_SHELL = [
    './',
    './index.html',
    './frontend/styles/app.css',
    './frontend/styles/dashboard.css',
    './frontend/components/energy-panel.js',
    './frontend/components/sleep-panel.js',
    './frontend/components/water-tank.js',
    './frontend/components/air-panel.js',
    './frontend/components/nutrition-panel.js',
    './frontend/components/sport-panel.js',
    './frontend/components/fizz-wheel.js',
    './frontend/assets/ui/fizz-wheel/wheel-bg-panel.png',
    './frontend/assets/ui/fizz-wheel/wheel-button-frame.png',
    './frontend/assets/ui/fizz-wheel/wheel-core.png',
    './frontend/assets/ui/fizz-wheel/wheel-frame.png',
    './frontend/assets/ui/fizz-wheel/wheel-pointer.png',
    './frontend/assets/ui/water-tank/water-button-frame.png',
    './frontend/assets/ui/water-tank/water-display-frame.png',
    './frontend/assets/ui/water-tank/water-left-cap.png',
    './frontend/assets/ui/water-tank/water-liquid.png',
    './frontend/assets/ui/water-tank/water-panel-bg.png',
    './frontend/assets/ui/water-tank/water-right-cap.png',
    './frontend/assets/ui/water-tank/water-tube-frame.png',
    './frontend/assets/ui/air-street/air-bottom-badge.png',
    './frontend/assets/ui/air-street/air-panel-bg.png',
    './frontend/assets/ui/air-street/air-scene.png',
    './frontend/assets/ui/air-street/air-scene-full.png',
    './frontend/assets/ui/air-street/air-side-button-minus.png',
    './frontend/assets/ui/air-street/air-side-button-plus.png',
    './frontend/assets/ui/sleep-dial/sleep-dial-day-face.png',
    './frontend/assets/ui/sleep-dial/sleep-dial-marks.png',
    './frontend/assets/ui/sleep-dial/sleep-dial-night-face.png',
    './frontend/assets/ui/sleep-dial/sleep-dial-ring.png',
    './frontend/assets/ui/sleep-dial/sleep-end-handle.png',
    './frontend/assets/ui/sleep-dial/sleep-start-handle.png',
    './src/firebase/firebase-client.js',
    './manifest.webmanifest',
    './icons/icon-192.svg',
    './icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') return;

    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;

            return fetch(request)
                .then((response) => {
                    const isHttp = request.url.startsWith('http');
                    const isSameOrigin = new URL(request.url).origin === self.location.origin;
                    if (isHttp && isSameOrigin && response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                    }
                    return response;
                })
                .catch(() => {
                    if (request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                    return new Response('Offline', { status: 503, statusText: 'Offline' });
                });
        })
    );
});
