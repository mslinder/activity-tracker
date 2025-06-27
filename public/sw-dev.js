// Development service worker - does absolutely nothing
console.log('Development Service Worker: Loaded but inactive');

// Immediately unregister itself
self.addEventListener('install', (event) => {
  console.log('Development Service Worker: Installing and immediately skipping waiting');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Development Service Worker: Activating and claiming clients');
  self.clients.claim();
  
  // Unregister this service worker
  self.registration.unregister().then(() => {
    console.log('Development Service Worker: Unregistered itself');
  });
});

// No fetch event listener - let all requests pass through normally