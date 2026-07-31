const APP_VERSION = 'hmorix-2026-07-31-1'
const APP_SHELL_CACHE = `${APP_VERSION}-shell`
const API_CACHE = `${APP_VERSION}-api`
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/site.webmanifest',
  '/favicon.svg',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('hmorix-') && !key.startsWith(APP_VERSION))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
      .then(() => notifyClients({ type: 'HMORIX_SW_READY', version: APP_VERSION }))
  )
})

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE))
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone()
          caches.open(APP_SHELL_CACHE).then(cache => cache.put('/index.html', copy))
          return response
        })
        .catch(() => caches.match('/index.html'))
    )
    return
  }

  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, APP_SHELL_CACHE))
  }
})

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok) await cache.put(request, response.clone())
    return response
  } catch (error) {
    const cached = await cache.match(request)
    if (cached) return cached
    return new Response(JSON.stringify({
      success: false,
      offline: true,
      message: 'Waiting for internet connection.',
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const refresh = fetch(request)
    .then(response => {
      if (response.ok) cache.put(request, response.clone())
      return response
    })
    .catch(() => cached)
  return cached || refresh
}

async function notifyClients(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
  clients.forEach(client => client.postMessage(message))
}
