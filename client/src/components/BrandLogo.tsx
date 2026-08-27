import React from 'react'

export interface BrandIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  variant?: 'default' | 'lime' | 'light' | 'dark' | 'monochrome' | 'outline'
  className?: string
  animated?: boolean
}

/**
 * High-precision vector Brand Icon for HMorix
 * Chamfered geometric shield with futuristic HM monogram and electric lime accent
 */
export function BrandIcon({
  size = 36,
  variant = 'default',
  className = '',
  animated = false,
  ...props
}: BrandIconProps) {
  const dimension = typeof size === 'number' ? `${size}px` : size

  // Color schemes based on variant
  let bgFill = '#0D0D0D'
  let borderStroke = 'rgba(255, 255, 255, 0.12)'
  let hColor = '#EAE8E3'
  let mColor = '#EAE8E3'
  let limeAccent = '#C8FF00'

  if (variant === 'light') {
    bgFill = '#F5F3EF'
    borderStroke = 'rgba(13, 13, 13, 0.12)'
    hColor = '#0D0D0D'
    mColor = '#0D0D0D'
    limeAccent = '#98D600'
  } else if (variant === 'lime') {
    bgFill = '#C8FF00'
    borderStroke = 'rgba(200, 255, 0, 0.4)'
    hColor = '#0D0D0D'
    mColor = '#0D0D0D'
    limeAccent = '#0D0D0D'
  } else if (variant === 'monochrome') {
    bgFill = '#FFFFFF'
    borderStroke = '#FFFFFF'
    hColor = '#000000'
    mColor = '#000000'
    limeAccent = '#000000'
  } else if (variant === 'dark') {
    bgFill = '#141414'
    borderStroke = 'rgba(200, 255, 0, 0.3)'
    hColor = '#EAE8E3'
    mColor = '#EAE8E3'
    limeAccent = '#C8FF00'
  } else if (variant === 'outline') {
    bgFill = 'transparent'
    borderStroke = '#C8FF00'
    hColor = '#C8FF00'
    mColor = '#EAE8E3'
    limeAccent = '#C8FF00'
  }

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 transition-transform duration-300 ${animated ? 'hover:scale-105' : ''} ${className}`}
      aria-label="HMorix Brand Icon"
      {...props}
    >
      <defs>
        <linearGradient id="hm-sheen-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Cyber chamfered outer badge */}
      <polygon
        points="4,4 36,4 44,12 44,44 12,44 4,36"
        fill={bgFill}
        stroke={borderStroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Futuristic top-right chamfer accent notch */}
      <polygon
        points="36,4 44,12 36,12"
        fill={limeAccent}
      />

      {/* Subtle inner sheen */}
      <polygon
        points="5,5 35,5 43,13 43,43 13,43 5,35"
        fill="url(#hm-sheen-grad)"
      />

      {/* Integrated Monogram HM Vector Paths */}
      {/* Letter 'H' - Left Pillar */}
      <path
        d="M12 14H16V34H12V14Z"
        fill={hColor}
      />
      {/* Letter 'H' - Crossbar */}
      <path
        d="M16 22H24V26H16V22Z"
        fill={hColor}
      />
      {/* Letter 'H' / 'M' shared center & right pillar structure */}
      <path
        d="M20 14H24V34H20V14Z"
        fill={hColor}
      />

      {/* Letter 'M' - High-tech angular diagonal chevron & right pillar */}
      <path
        d="M24 14L30 24L36 14H40V34H36V21L30 31L24 21V14Z"
        fill={mColor}
      />

      {/* Neon Cyber Node on H crossbeam */}
      <rect
        x="18"
        y="23"
        width="4"
        height="2"
        fill={limeAccent}
      />

      {/* Micro tech corner node bottom-left */}
      <rect
        x="4"
        y="36"
        width="2"
        height="2"
        fill={limeAccent}
      />
    </svg>
  )
}

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number
  variant?: 'default' | 'dark' | 'light' | 'lime' | 'white'
  showWordmark?: boolean
  className?: string
  iconClassName?: string
  textClassName?: string
}

/**
 * Complete Brand Logo with Icon + High-definition Wordmark
 */
export function BrandLogo({
  size = 'md',
  variant = 'default',
  showWordmark = true,
  className = '',
  iconClassName = '',
  textClassName = '',
}: BrandLogoProps) {
  let iconSize = 36
  let textSizeClass = 'text-xl tracking-tight'

  if (typeof size === 'number') {
    iconSize = size
  } else {
    switch (size) {
      case 'sm':
        iconSize = 28
        textSizeClass = 'text-base tracking-tight'
        break
      case 'md':
        iconSize = 36
        textSizeClass = 'text-xl tracking-tight'
        break
      case 'lg':
        iconSize = 44
        textSizeClass = 'text-2xl tracking-tight'
        break
      case 'xl':
        iconSize = 56
        textSizeClass = 'text-3xl tracking-tight'
        break
    }
  }

  const isLight = variant === 'light'
  const isLime = variant === 'lime'
  const textColor = isLight
    ? 'text-obsidian'
    : isLime
    ? 'text-[#C8FF00]'
    : 'text-cream'

  const iconVariant = variant === 'light' ? 'light' : variant === 'lime' ? 'lime' : 'default'

  return (
    <div className={`inline-flex items-center gap-3 font-display font-bold select-none group ${className}`}>
      <BrandIcon
        size={iconSize}
        variant={iconVariant}
        className={`transition-transform duration-300 group-hover:scale-105 ${iconClassName}`}
      />
      {showWordmark && (
        <div className={`flex items-baseline ${textSizeClass} ${textColor} ${textClassName}`}>
          <span className="font-bold tracking-tight">HMorix</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C8FF00] ml-1 mb-0.5 animate-pulse" />
        </div>
      )}
    </div>
  )
}

/**
 * Raw Standalone SVG string generators for Media Kit downloads & exports
 */
export function getStandaloneBrandIconSVG(variant: 'dark' | 'light' | 'lime' = 'dark'): string {
  const bg = variant === 'light' ? '#F5F3EF' : variant === 'lime' ? '#C8FF00' : '#0D0D0D'
  const border = variant === 'light' ? 'rgba(13,13,13,0.12)' : variant === 'lime' ? '#98D600' : 'rgba(255,255,255,0.12)'
  const hColor = variant === 'light' || variant === 'lime' ? '#0D0D0D' : '#EAE8E3'
  const mColor = variant === 'light' || variant === 'lime' ? '#0D0D0D' : '#EAE8E3'
  const lime = variant === 'lime' ? '#0D0D0D' : '#C8FF00'

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none">
  <defs>
    <linearGradient id="hm-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <polygon points="4,4 36,4 44,12 44,44 12,44 4,36" fill="${bg}" stroke="${border}" stroke-width="2" stroke-linejoin="round"/>
  <polygon points="36,4 44,12 36,12" fill="${lime}"/>
  <polygon points="5,5 35,5 43,13 43,43 13,43 5,35" fill="url(#hm-sheen)"/>
  <path d="M12 14H16V34H12V14Z" fill="${hColor}"/>
  <path d="M16 22H24V26H16V22Z" fill="${hColor}"/>
  <path d="M20 14H24V34H20V14Z" fill="${hColor}"/>
  <path d="M24 14L30 24L36 14H40V34H36V21L30 31L24 21V14Z" fill="${mColor}"/>
  <rect x="18" y="23" width="4" height="2" fill="${lime}"/>
  <rect x="4" y="36" width="2" height="2" fill="${lime}"/>
</svg>`
}

export function getStandaloneBrandLogoSVG(variant: 'dark' | 'light' = 'dark'): string {
  const textColor = variant === 'light' ? '#0D0D0D' : '#EAE8E3'
  const iconSVG = getStandaloneBrandIconSVG(variant)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 48" width="200" height="48" fill="none">
  <g transform="translate(0, 0)">
    ${iconSVG}
  </g>
  <text x="60" y="32" font-family="'Space Grotesk', 'Inter', -apple-system, sans-serif" font-size="24" font-weight="700" fill="${textColor}" letter-spacing="-0.03em">HMorix</text>
  <circle cx="152" cy="22" r="3" fill="#C8FF00"/>
</svg>`
}

export default BrandLogo
