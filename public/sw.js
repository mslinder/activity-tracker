// Empty service worker for development - does nothing
console.log('Empty Service Worker: Loaded');

self.addEventListener('install', () => {
  console.log('Empty Service Worker: Install');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('Empty Service Worker: Activate');
  self.clients.claim();
});

// No fetch listener - all requests pass through normally