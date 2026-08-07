/**
 * Service worker de Cocon.
 *
 * Objectif : l'app s'ouvre et reste utilisable sans reseau. Les donnees du
 * couple vivent dans localStorage, donc une fois la coquille en cache, les
 * mots doux, les Polaroid deja charges et les mini-jeux fonctionnent hors-ligne.
 *
 * Trois strategies :
 *  - navigations   : reseau d'abord, repli sur la coquille mise en cache ;
 *  - assets bundles : cache d'abord (leur nom contient un hash, donc immuables) ;
 *  - polices Google : cache d'abord, rafraichi en arriere-plan.
 */

const VERSION = 'cocon-v1';
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;
const FONTS = `${VERSION}-fonts`;

const SHELL_URLS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/memories/memory-rain.jpg',
  '/memories/memory-bench.jpg',
  '/memories/memory-tea.jpg',
  '/memories/trip-cover.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      // `addAll` echoue en bloc : on tolere qu'une ressource manque.
      .then((cache) => Promise.allSettled(SHELL_URLS.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(SHELL);
    cache.put('/', response.clone());
    return response;
  } catch {
    const cached = await caches.match('/', { ignoreSearch: true });
    return cached ?? new Response('Hors-ligne', { status: 503, statusText: 'Hors-ligne' });
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok || response.type === 'opaque') {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // L'app est une SPA : toute navigation retombe sur la coquille.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, ASSETS));
    return;
  }

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, FONTS));
  }
});

/** Ouvre (ou remet au premier plan) l'app au clic sur une notification. */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow('/');
    })
  );
});
