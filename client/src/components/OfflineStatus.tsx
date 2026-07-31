import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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

  const meta = getOfflineMeta()

  return (
    <AnimatePresence>
      {(!online || waitingWorker || versionReady) && (
        <motion.div
          className="fixed bottom-4 left-4 right-4 z-[70] md:left-auto md:right-6 md:w-[380px]"
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.28 }}
        >
          <div className="border border-glass-border bg-obsidian-2/95 backdrop-blur-[20px] rounded-[8px] p-3 shadow-2xl overflow-hidden relative">
            <motion.div
              className="absolute inset-x-0 top-0 h-px bg-[#C8FF00]"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            {!online ? (
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ rotate: [-6, 6, -6], scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <WifiOff size={18} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                </motion.div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-cream">Waiting for internet</div>
                  <div className="text-xs text-cream/45">Cached pages and saved data remain available offline.</div>
                  <Link to="/offline" className="mt-2 inline-flex text-xs text-[#C8FF00] hover:underline">Open animated offline page</Link>
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}
