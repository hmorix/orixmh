import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AppIntroAnimationProps {
  onComplete?: () => void
}

export default function AppIntroAnimation({ onComplete }: AppIntroAnimationProps) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false
    // Show only once per browser session
    const hasSeenIntro = sessionStorage.getItem('hm_intro_seen')
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion || hasSeenIntro) {
      return false
    }
    return true
  })

  const [phase, setPhase] = useState<'drawing' | 'revealing' | 'ready' | 'exit'>('drawing')

  useEffect(() => {
    if (!visible) {
      onComplete?.()
      return
    }

    const timer1 = setTimeout(() => setPhase('revealing'), 700)
    const timer2 = setTimeout(() => setPhase('ready'), 1400)
    const timer3 = setTimeout(() => {
      setPhase('exit')
      setTimeout(() => {
        setVisible(false)
        sessionStorage.setItem('hm_intro_seen', 'true')
        onComplete?.()
      }, 600)
    }, 2100)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        skipIntro()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [visible, onComplete])

  const skipIntro = () => {
    setPhase('exit')
    setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem('hm_intro_seen', 'true')
      onComplete?.()
    }, 200)
  }

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        key="app-intro-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === 'exit' ? 0 : 1, scale: phase === 'exit' ? 1.05 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[99999] bg-[#0A0A0B] flex flex-col items-center justify-center overflow-hidden select-none"
        style={{ pointerEvents: phase === 'exit' ? 'none' : 'auto' }}
      >
        {/* Subtle Cyber Grid Background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#C8FF00 1px, transparent 1px), linear-gradient(90deg, #C8FF00 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Ambient Radial Glowing Aura */}
        <motion.div
          animate={{
            scale: phase === 'revealing' || phase === 'ready' ? [1, 1.25, 1.1] : 1,
            opacity: phase === 'revealing' || phase === 'ready' ? [0.15, 0.28, 0.2] : 0.1,
          }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          className="absolute w-[460px] h-[460px] rounded-full bg-[#C8FF00] blur-[110px] pointer-events-none -z-10"
        />

        {/* Central Core Emblem & Brand Reveal */}
        <div className="relative flex flex-col items-center justify-center">
          {/* Animated SVG Shield Logo */}
          <div className="relative w-28 h-28 flex items-center justify-center mb-6">
            <svg
              viewBox="0 0 48 48"
              className="w-full h-full drop-shadow-[0_0_24px_rgba(200,255,0,0.35)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="intro-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Outer Cyber Chamfered Polygon */}
              <motion.polygon
                points="4,4 36,4 44,12 44,44 12,44 4,36"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: 1,
                  fill: phase !== 'drawing' ? '#0D0D0D' : 'rgba(13,13,13,0)',
                }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                stroke="#C8FF00"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {/* Chamfer Notch in Lime */}
              <motion.polygon
                points="36,4 44,12 36,12"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: phase !== 'drawing' ? 1 : 0,
                  opacity: phase !== 'drawing' ? 1 : 0,
                }}
                transition={{ duration: 0.35, delay: 0.4 }}
                fill="#C8FF00"
              />

              {/* Inner Gloss */}
              {phase !== 'drawing' && (
                <polygon
                  points="5,5 35,5 43,13 43,43 13,43 5,35"
                  fill="url(#intro-sheen)"
                />
              )}

              {/* Monogram 'HM' Paths with stroke and fill animation */}
              <motion.path
                d="M12 14H16V34H12V14Z"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: phase !== 'drawing' ? 1 : 0.4, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                fill="#EAE8E3"
              />
              <motion.path
                d="M16 22H24V26H16V22Z"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: phase !== 'drawing' ? 1 : 0.4, scaleX: 1 }}
                transition={{ duration: 0.35, delay: 0.3 }}
                fill="#EAE8E3"
              />
              <motion.path
                d="M20 14H24V34H20V14Z"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: phase !== 'drawing' ? 1 : 0.4, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                fill="#EAE8E3"
              />
              <motion.path
                d="M24 14L30 24L36 14H40V34H36V21L30 31L24 21V14Z"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: phase !== 'drawing' ? 1 : 0.4, scale: 1 }}
                transition={{ duration: 0.45, delay: 0.35 }}
                fill="#EAE8E3"
              />

              {/* Cyber Power Accent Node */}
              <motion.rect
                x="18"
                y="23"
                width="4"
                height="2"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase !== 'drawing' ? 1 : 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                fill="#C8FF00"
              />
              <motion.rect
                x="4"
                y="36"
                width="2"
                height="2"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase !== 'drawing' ? 1 : 0 }}
                transition={{ duration: 0.3, delay: 0.65 }}
                fill="#C8FF00"
              />
            </svg>
          </div>

          {/* Typography Brand Reveal */}
          <motion.div
            initial={{ opacity: 0, y: 12, letterSpacing: '0.3em' }}
            animate={{
              opacity: phase !== 'drawing' ? 1 : 0,
              y: phase !== 'drawing' ? 0 : 12,
              letterSpacing: '0.08em',
            }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-1.5"
          >
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wider text-cream">
              HMORIX
            </h1>
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              className="w-2 h-2 rounded-full bg-[#C8FF00] ml-1 shadow-[0_0_12px_#C8FF00]"
            />
          </motion.div>

          {/* Subtitle / Telemetry Line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'ready' ? 0.75 : phase === 'revealing' ? 0.4 : 0 }}
            transition={{ duration: 0.5 }}
            className="text-[11px] font-mono text-[#C8FF00] tracking-[0.24em] uppercase mt-2.5 font-medium"
          >
            Enterprise AI Architecture
          </motion.p>

          {/* Progress Bar & Telemetry */}
          <div className="w-56 h-[2px] bg-white/[0.08] rounded-full overflow-hidden mt-6 relative">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: phase === 'ready' || phase === 'exit' ? '100%' : '60%' }}
              transition={{ duration: 1.6, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-[#C8FF00] to-[#EAE8E3] shadow-[0_0_8px_#C8FF00]"
            />
          </div>

          {/* Status Text */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="text-[10px] font-mono text-cream/40 mt-3"
          >
            {phase === 'drawing' && 'INITIALIZING SYSTEM...'}
            {phase === 'revealing' && 'LOADING NEURAL INTERFACES...'}
            {(phase === 'ready' || phase === 'exit') && 'SYSTEMS READY'}
          </motion.span>
        </div>

        {/* Interactive Skip Button */}
        <button
          onClick={skipIntro}
          className="absolute bottom-8 right-8 text-[11px] font-mono text-cream/30 hover:text-[#C8FF00] tracking-wider transition-colors px-3 py-1.5 rounded-[4px] border border-white/[0.05] hover:border-[#C8FF00]/30 backdrop-blur-sm"
        >
          SKIP [ESC]
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
