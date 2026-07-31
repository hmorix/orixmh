import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CloudOff, Database, RefreshCw, Wifi } from 'lucide-react'
import { getOfflineMeta } from '../lib/offlineStore'

const pulseTransition = {
  duration: 2.4,
  repeat: Infinity,
  ease: 'easeInOut',
}

export default function OfflinePage() {
  const meta = getOfflineMeta()

  return (
    <div className="min-h-screen bg-obsidian text-cream overflow-hidden relative flex items-center">
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '72px 72px' }} />

      <motion.div
        className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#C8FF00]/20"
        animate={{ scale: [0.82, 1.12, 0.82], opacity: [0.16, 0.36, 0.16] }}
        transition={pulseTransition}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
        animate={{ scale: [0.78, 1.06, 0.78], opacity: [0.08, 0.2, 0.08] }}
        transition={{ ...pulseTransition, delay: 0.35 }}
      />

      <div className="page-container relative z-10 py-24">
        <div className="grid lg:grid-cols-[1fr_460px] gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-[660px]"
          >
            <div className="label-mono mb-6">Offline Mode</div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.96] tracking-tight mb-6">
              Waiting for<br /><span className="text-[#C8FF00]">internet</span>
            </h1>
            <p className="text-base sm:text-lg text-cream/60 leading-relaxed max-w-[560px] mb-8">
              HMorix is still available from the local cache. Saved pages, cached API reads, and IndexedDB snapshots can keep working until the connection returns.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => window.location.reload()} className="btn-primary inline-flex items-center justify-center gap-2">
                <RefreshCw size={16} />
                Retry connection
              </button>
              <Link to="/" className="btn-outline inline-flex items-center justify-center">Open cached home</Link>
            </div>
            {meta.lastSync && (
              <div className="mt-6 text-xs text-cream/35">
                Last local sync: {new Date(meta.lastSync).toLocaleString()}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative h-[420px] hidden sm:block"
          >
            <motion.div
              className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-[8px] border border-[#C8FF00]/40 bg-[#C8FF00]/10 flex items-center justify-center"
              animate={{ y: [-8, 8, -8] }}
              transition={pulseTransition}
            >
              <CloudOff size={54} className="text-[#C8FF00]" />
            </motion.div>

            {[
              { icon: Database, label: 'IndexedDB', className: 'left-4 top-10' },
              { icon: Wifi, label: 'Reconnect', className: 'right-8 top-24' },
              { icon: RefreshCw, label: 'Sync queue', className: 'left-16 bottom-16' },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                className={`absolute ${item.className} w-36 rounded-[8px] border border-glass-border bg-obsidian-2/85 p-4 backdrop-blur-[20px]`}
                animate={{ y: index % 2 === 0 ? [0, -12, 0] : [0, 12, 0] }}
                transition={{ ...pulseTransition, delay: index * 0.25 }}
              >
                <item.icon size={20} className="text-[#C8FF00] mb-3" />
                <div className="text-xs font-semibold">{item.label}</div>
                <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#C8FF00]"
                    animate={{ x: ['-100%', '120%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}
                  />
                </div>
              </motion.div>
            ))}

            {[0, 1, 2, 3, 4].map(index => (
              <motion.div
                key={index}
                className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-[#C8FF00]"
                animate={{
                  x: [0, Math.cos(index * 1.26) * 190],
                  y: [0, Math.sin(index * 1.26) * 150],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.22, ease: 'easeInOut' }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
