import { useEffect, useState } from 'react'
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react'
import { applyPwaUpdate, registerPwa } from '../lib/pwa'
import { getOfflineMeta } from '../lib/offlineStore'

export default function OfflineStatus() {
  const [online, setOnline] = useState(() => navigator.onLine)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | undefined>()
  const [versionReady, setVersionReady] = useState(false)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    registerPwa(({ waiting, version }) => {
      if (waiting) setWaitingWorker(waiting)
      if (version) setVersionReady(true)
    })
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (online && !waitingWorker && !versionReady) return null

  const meta = getOfflineMeta()

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[70] md:left-auto md:right-6 md:w-[360px]">
      <div className="border border-glass-border bg-obsidian-2/95 backdrop-blur-[20px] rounded-[8px] p-3 shadow-2xl">
        {!online ? (
          <div className="flex items-start gap-3">
            <WifiOff size={18} className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-cream">Waiting for internet</div>
              <div className="text-xs text-cream/45">Cached pages and saved data remain available offline.</div>
              {meta.lastSync && <div className="text-[10px] text-cream/30 mt-1">Last sync: {new Date(meta.lastSync).toLocaleString()}</div>}
            </div>
          </div>
        ) : waitingWorker ? (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-cream">Website update ready</div>
              <div className="text-xs text-cream/45">Refresh to use the latest cached version.</div>
            </div>
            <button onClick={() => applyPwaUpdate(waitingWorker)} className="w-9 h-9 border border-glass-border rounded-[4px] flex items-center justify-center text-[#C8FF00] hover:border-[#C8FF00]" aria-label="Apply update">
              <RefreshCw size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-[#C8FF00] flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-cream">Offline cache updated</div>
              {meta.version && <div className="text-xs text-cream/45 truncate">{meta.version}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
