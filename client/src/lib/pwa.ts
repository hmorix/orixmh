import { persistAppVersion } from './offlineStore'

export type PwaUpdateHandler = (state: {
  version?: string
  waiting?: ServiceWorker
}) => void

export function registerPwa(onUpdate?: PwaUpdateHandler) {
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing
        if (!worker) return
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            onUpdate?.({ waiting: worker })
          }
        })
      })

      if (registration.waiting) onUpdate?.({ waiting: registration.waiting })
    }).catch(() => null)
  })

  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'HMORIX_SW_READY') {
      persistAppVersion(event.data.version)
      onUpdate?.({ version: event.data.version })
    }
  })
}

export function applyPwaUpdate(worker?: ServiceWorker) {
  worker?.postMessage({ type: 'SKIP_WAITING' })
  window.location.reload()
}
