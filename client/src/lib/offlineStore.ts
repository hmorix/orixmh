const DB_NAME = 'hmorix-offline'
const DB_VERSION = 1
const STORE_NAME = 'snapshots'
const VERSION_KEY = 'hmorix_app_version'
const LAST_SYNC_KEY = 'hmorix_last_sync'

type Snapshot<T> = {
  key: string
  value: T
  updatedAt: string
}

function openOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveSnapshot<T>(key: string, value: T) {
  if (!('indexedDB' in window)) return
  const db = await openOfflineDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put({ key, value, updatedAt: new Date().toISOString() })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
  localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString())
}

export async function readSnapshot<T>(key: string): Promise<Snapshot<T> | null> {
  if (!('indexedDB' in window)) return null
  const db = await openOfflineDb()
  const result = await new Promise<Snapshot<T> | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(key)
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
  db.close()
  return result
}

export async function cachedJson<T>(key: string, request: RequestInfo | URL, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(request, init)
    if (!response.ok) throw new Error('Network request failed')
    const data = await response.json()
    await saveSnapshot(key, data)
    return data
  } catch (error) {
    const snapshot = await readSnapshot<T>(key)
    if (snapshot) return snapshot.value
    throw error
  }
}

export function persistAppVersion(version: string) {
  localStorage.setItem(VERSION_KEY, version)
}

export function getOfflineMeta() {
  return {
    version: localStorage.getItem(VERSION_KEY) || '',
    lastSync: localStorage.getItem(LAST_SYNC_KEY) || '',
  }
}
