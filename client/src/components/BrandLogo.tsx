import React from 'react'

export interface BrandIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  variant?: 'default' | 'lime' | 'light' | 'dark' | 'monochrome' | 'outline'
  className?: string
  animated?: boolean
}

/**
 * High-precision vector Brand Icon for HMorix
 * Hexagonal cyber-monogram shield emblem with electric lime precision geometry
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
  let strokeColor = '#C8FF00'

  if (variant === 'light') {
    bgFill = '#F5F3EF'
    strokeColor = '#0D0D0D'
  } else if (variant === 'lime') {
    bgFill = '#C8FF00'
    strokeColor = '#0D0D0D'
  } else if (variant === 'monochrome') {
    bgFill = '#000000'
    strokeColor = '#FFFFFF'
  } else if (variant === 'dark') {
    bgFill = '#141414'
    strokeColor = '#C8FF00'
  } else if (variant === 'outline') {
    bgFill = 'transparent'
    strokeColor = '#C8FF00'
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
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Hexagonal Shield Outer Polygon */}
      <polygon
        points="24,3.06 42.14,13.53 42.14,34.47 24,44.94 5.86,34.47 5.86,13.53"
        fill={bgFill}
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinejoin="miter"
        strokeMiterlimit="4"
      />

      {/* Subtle inner sheen */}
      {bgFill !== 'transparent' && bgFill !== 'none' && (
        <polygon
          points="24,4.5 40.8,14.2 40.8,33.8 24,43.5 7.2,33.8 7.2,14.2"
          fill="url(#hm-sheen-grad)"
        />
      )}

      {/* Center Stem Top & Bottom */}
      <line
        x1="24"
        y1="3.06"
        x2="24"
        y2="17.7"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="square"
      />
      <line
        x1="24"
        y1="29.46"
        x2="24"
        y2="44.94"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="square"
      />

      {/* Main Horizontal Crossbar */}
      <line
        x1="10.78"
        y1="23.72"
        x2="37.22"
        y2="23.72"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="square"
      />

      {/* Left Crown Roof & Upper Arch */}
      <path
        d="M 10.78 23.72 L 10.78 16.3 L 18.06 12.1 L 18.06 20.11 L 20.3 20.11 C 22.32 20.11 23.86 19.38 24 17.7"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinejoin="miter"
        strokeLinecap="square"
        fill="none"
      />

      {/* Right Crown Roof & Upper Arch */}
      <path
        d="M 37.22 23.72 L 37.22 16.3 L 29.94 12.1 L 29.94 20.11 L 27.7 20.11 C 25.68 20.11 24.14 19.38 24 17.7"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinejoin="miter"
        strokeLinecap="square"
        fill="none"
      />

      {/* Left Spire & Bottom Hook & Lower Arch */}
      <path
        d="M 15.18 18.46 L 15.18 35.06 L 18.06 36.74 L 18.06 28.06 L 20.3 28.06 C 22.32 28.06 23.86 28.48 24 29.46"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinejoin="miter"
        strokeLinecap="square"
        fill="none"
      />

      {/* Right Spire & Bottom Hook & Lower Arch */}
      <path
        d="M 32.82 18.46 L 32.82 35.06 L 29.94 36.74 L 29.94 28.06 L 27.7 28.06 C 25.68 28.06 24.14 28.48 24 29.46"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinejoin="miter"
        strokeLinecap="square"
        fill="none"
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
  const isLight = variant === 'light'
  const isLime = variant === 'lime'
  const bg = isLight ? '#F5F3EF' : isLime ? '#C8FF00' : '#0D0D0D'
  const stroke = isLight || isLime ? '#0D0D0D' : '#C8FF00'

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none">
  <defs>
    <linearGradient id="hm-sheen-${variant}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <polygon points="24,3.06 42.14,13.53 42.14,34.47 24,44.94 5.86,34.47 5.86,13.53" fill="${bg}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="miter" stroke-miterlimit="4"/>
  <polygon points="24,4.5 40.8,14.2 40.8,33.8 24,43.5 7.2,33.8 7.2,14.2" fill="url(#hm-sheen-${variant})"/>
  <line x1="24" y1="3.06" x2="24" y2="17.7" stroke="${stroke}" stroke-width="1.5" stroke-linecap="square"/>
  <line x1="24" y1="29.46" x2="24" y2="44.94" stroke="${stroke}" stroke-width="1.5" stroke-linecap="square"/>
  <line x1="10.78" y1="23.72" x2="37.22" y2="23.72" stroke="${stroke}" stroke-width="1.5" stroke-linecap="square"/>
  <path d="M 10.78 23.72 L 10.78 16.3 L 18.06 12.1 L 18.06 20.11 L 20.3 20.11 C 22.32 20.11 23.86 19.38 24 17.7" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="miter" stroke-linecap="square" fill="none"/>
  <path d="M 37.22 23.72 L 37.22 16.3 L 29.94 12.1 L 29.94 20.11 L 27.7 20.11 C 25.68 20.11 24.14 19.38 24 17.7" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="miter" stroke-linecap="square" fill="none"/>
  <path d="M 15.18 18.46 L 15.18 35.06 L 18.06 36.74 L 18.06 28.06 L 20.3 28.06 C 22.32 28.06 23.86 28.48 24 29.46" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="miter" stroke-linecap="square" fill="none"/>
  <path d="M 32.82 18.46 L 32.82 35.06 L 29.94 36.74 L 29.94 28.06 L 27.7 28.06 C 25.68 28.06 24.14 28.48 24 29.46" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="miter" stroke-linecap="square" fill="none"/>
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
