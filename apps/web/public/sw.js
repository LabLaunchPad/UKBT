/* UKBT service worker (PWA-lite, additive cache layer).
 *
 * Layer order is deliberate: browser HTTP cache first, Cloudflare edge
 * second, this worker third, network last. The worker never replaces
 * either cache — it only adds repeat-visit acceleration + offline
 * resilience for public static assets.
 *
 * Scope is same-origin GET only: cross-origin traffic (analytics
 * beacons, Sentry ingest) and every non-GET request fall through to
 * the network untouched, so no credential, private, or analytics
 * response can ever enter these caches.
 *
 * __UKBT_BUILD_ID__ is replaced with the release commit hash by
 * scripts/build-sw.mjs during `pnpm build`. A new deployment therefore
 * mints new cache namespaces; activate() retires every older ukbt-*
 * namespace only after the new worker is installed — never before —
 * so there is no broken intermediate state and no indefinite stale
 * lock-in. Rollback redeploys the older commit, which re-mints its
 * own namespaces the same way.
 */
const BUILD_ID = '__UKBT_BUILD_ID__';
const STATIC_CACHE = `ukbt-static-${BUILD_ID}`;
const PAGES_CACHE = `ukbt-pages-${BUILD_ID}`;
/* Upper bound for the navigation cache: the site has ~16 routes, so 30
   leaves headroom without unbounded growth. The static cache needs no
   cap — it holds only the precached shell plus same-origin assets the
   visitor actually loads (~100 small files, single-digit MB). */
const MAX_PAGES = 30;
const OFFLINE_URL = '/offline/';
const STATIC_PREFIXES = ['/_astro/', '/media/', '/fonts/', '/brand/'];
const STATIC_FILES = [
  '/offline/',
  '/favicon.svg',
  '/icon-32.png',
  '/icon-180.png',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_FILES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (k) =>
                k.startsWith('ukbt-') &&
                k !== STATIC_CACHE &&
                k !== PAGES_CACHE,
            )
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Document navigations: network first for freshness; persist only
  // successful responses; fall back to the cached page, then the
  // offline shell. Error responses are never cached.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(PAGES_CACHE).then((cache) => {
              cache.put(request, copy).then(() => trim(cache));
            });
          }
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then((hit) => hit || caches.match(OFFLINE_URL)),
        ),
    );
    return;
  }

  // Versioned/hashed and long-lived public assets: cache first.
  if (
    STATIC_PREFIXES.some((p) => url.pathname.startsWith(p)) ||
    STATIC_FILES.includes(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches
                .open(STATIC_CACHE)
                .then((cache) => cache.put(request, copy));
            }
            return res;
          }),
      ),
    );
  }
  // Everything else: untouched browser default. No interference.
});

function trim(cache) {
  cache.keys().then((keys) => {
    if (keys.length > MAX_PAGES) cache.delete(keys[0]);
  });
}
