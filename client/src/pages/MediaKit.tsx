import { useState } from 'react'
import { Download, Image, FileText, Palette, Check, Copy, ExternalLink } from 'lucide-react'
import { BrandIcon, BrandLogo, getStandaloneBrandIconSVG, getStandaloneBrandLogoSVG } from '../components/BrandLogo'

export default function MediaKit() {
  const [copiedHex, setCopiedHex] = useState<string | null>(null)
  const [copiedSvg, setCopiedSvg] = useState<string | null>(null)
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null)

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex)
    setCopiedHex(hex)
    setTimeout(() => setCopiedHex(null), 2000)
  }

  const handleDownloadSVG = (name: string, svgContent: string) => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${name.toLowerCase().replace(/\s+/g, '-')}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setDownloadSuccess(name)
    setTimeout(() => setDownloadSuccess(null), 2500)
  }

  const handleCopySVG = (name: string, svgContent: string) => {
    navigator.clipboard.writeText(svgContent)
    setCopiedSvg(name)
    setTimeout(() => setCopiedSvg(null), 2000)
  }

  const handleDownloadPackage = (packageName: string) => {
    // Generate a comprehensive brand package markdown/manifest or trigger downloads
    const manifest = {
      brand: "HMorix",
      version: "2.0.0",
      company: "HMorix Technologies",
      website: "https://hmorix.in",
      colors: {
        obsidian: "#0D0D0D",
        obsidian2: "#141414",
        obsidian3: "#1C1C1C",
        cream: "#EAE8E3",
        cream2: "#D8D5CE",
        lime: "#C8FF00"
      },
      typography: {
        headlines: "Space Grotesk, sans-serif",
        body: "Inter, sans-serif",
        mono: "JetBrains Mono, monospace"
      },
      guidelines: [
        "Maintain clear space equal to 50% of the logo height around the mark.",
        "Do not skew, rotate, or alter the geometry of the logo.",
        "Always use approved Obsidian and Electric Lime color combinations."
      ]
    }

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${packageName.toLowerCase().replace(/\s+/g, '-')}-manifest.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    // Also download primary dark logo SVG alongside
    handleDownloadSVG('hmorix-brand-logo-dark', getStandaloneBrandLogoSVG('dark'))
  }

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-[1280px] mx-auto px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-glass-border">
          <div>
            <span className="label-mono">Official Media Kit</span>
            <h1 className="section-title mt-3 mb-4">Brand Assets & Media Resources</h1>
            <p className="text-lg text-cream/60 max-w-[640px]">
              Download official HMorix logos, icons, vector assets, and brand design guidelines for media coverage and publications.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDownloadPackage('Complete Brand Kit')}
              className="btn-primary flex items-center gap-2"
            >
              <Download size={16} />
              <span>Download Brand Kit</span>
            </button>
          </div>
        </div>

        {/* Brand Notification Alert if download triggered */}
        {downloadSuccess && (
          <div className="mb-8 p-4 bg-[#C8FF00]/10 border border-[#C8FF00]/30 rounded-[12px] flex items-center gap-3 text-sm text-[#C8FF00] animate-pulse">
            <Check size={18} />
            <span>Downloaded official asset for <strong>{downloadSuccess}</strong></span>
          </div>
        )}

        {/* Logos & Marks */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold">Logos & Monogram Marks</h2>
              <p className="text-xs text-cream/40 mt-1">Official high-precision SVG vector marks for light and dark environments.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Logo - Dark */}
            <div className="border border-glass-border rounded-[16px] overflow-hidden bg-obsidian-2">
              <div className="h-40 bg-obsidian flex items-center justify-center p-6 border-b border-glass-border relative group">
                <BrandLogo size="lg" variant="default" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium block">Primary Logo - Dark</span>
                  <span className="text-[11px] text-cream/40 font-mono">For dark backdrops</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopySVG('Logo Dark', getStandaloneBrandLogoSVG('dark'))}
                    className="p-2 text-cream/50 hover:text-[#C8FF00] hover:bg-white/[0.04] rounded-[6px] transition-colors"
                    title="Copy SVG"
                  >
                    {copiedSvg === 'Logo Dark' ? <Check size={14} className="text-[#C8FF00]" /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={() => handleDownloadSVG('hmorix-logo-dark', getStandaloneBrandLogoSVG('dark'))}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#C8FF00]/10 hover:bg-[#C8FF00]/20 text-[#C8FF00] font-medium rounded-[6px] transition-colors"
                  >
                    <Download size={13} /> SVG
                  </button>
                </div>
              </div>
            </div>

            {/* Primary Logo - Light */}
            <div className="border border-glass-border rounded-[16px] overflow-hidden bg-obsidian-2">
              <div className="h-40 bg-[#F5F3EF] flex items-center justify-center p-6 border-b border-glass-border relative group">
                <BrandLogo size="lg" variant="light" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium block">Primary Logo - Light</span>
                  <span className="text-[11px] text-cream/40 font-mono">For light surfaces</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopySVG('Logo Light', getStandaloneBrandLogoSVG('light'))}
                    className="p-2 text-cream/50 hover:text-[#C8FF00] hover:bg-white/[0.04] rounded-[6px] transition-colors"
                    title="Copy SVG"
                  >
                    {copiedSvg === 'Logo Light' ? <Check size={14} className="text-[#C8FF00]" /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={() => handleDownloadSVG('hmorix-logo-light', getStandaloneBrandLogoSVG('light'))}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#C8FF00]/10 hover:bg-[#C8FF00]/20 text-[#C8FF00] font-medium rounded-[6px] transition-colors"
                  >
                    <Download size={13} /> SVG
                  </button>
                </div>
              </div>
            </div>

            {/* Icon Only */}
            <div className="border border-glass-border rounded-[16px] overflow-hidden bg-obsidian-2">
              <div className="h-40 bg-obsidian-3 flex items-center justify-center p-6 border-b border-glass-border relative group">
                <div className="flex items-center gap-6">
                  <BrandIcon size={52} variant="default" />
                  <BrandIcon size={52} variant="lime" />
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium block">Brand Icon Marks</span>
                  <span className="text-[11px] text-cream/40 font-mono">Monogram cyber shield</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopySVG('Icon Only', getStandaloneBrandIconSVG('dark'))}
                    className="p-2 text-cream/50 hover:text-[#C8FF00] hover:bg-white/[0.04] rounded-[6px] transition-colors"
                    title="Copy SVG"
                  >
                    {copiedSvg === 'Icon Only' ? <Check size={14} className="text-[#C8FF00]" /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={() => handleDownloadSVG('hmorix-icon', getStandaloneBrandIconSVG('dark'))}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#C8FF00]/10 hover:bg-[#C8FF00]/20 text-[#C8FF00] font-medium rounded-[6px] transition-colors"
                  >
                    <Download size={13} /> SVG
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Colors */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold">Brand Color Palette</h2>
              <p className="text-xs text-cream/40 mt-1">Click any color card to copy the exact HEX code.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { name: 'Obsidian (Primary)', hex: '#0D0D0D', text: 'text-cream' },
              { name: 'Electric Lime', hex: '#C8FF00', text: 'text-obsidian' },
              { name: 'Cream Neutral', hex: '#EAE8E3', text: 'text-obsidian' },
              { name: 'Obsidian Elevate', hex: '#141414', text: 'text-cream' },
              { name: 'Obsidian Accent', hex: '#1C1C1C', text: 'text-cream' },
            ].map(c => (
              <div
                key={c.name}
                onClick={() => handleCopyHex(c.hex)}
                className="rounded-[12px] overflow-hidden border border-glass-border cursor-pointer transition-all hover:border-[rgba(200,255,0,0.4)] hover:-translate-y-1 group"
              >
                <div className={`h-24 ${c.text} flex items-end justify-between p-3 transition-opacity`} style={{ backgroundColor: c.hex }}>
                  <span className="text-xs font-mono font-bold tracking-wider">{c.hex}</span>
                  <div className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedHex === c.hex ? <Check size={14} className="text-[#C8FF00]" /> : <Copy size={14} />}
                  </div>
                </div>
                <div className="p-3 bg-obsidian-2 flex items-center justify-between">
                  <span className="text-xs font-medium">{c.name}</span>
                  {copiedHex === c.hex && (
                    <span className="text-[10px] text-[#C8FF00] font-mono">Copied!</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="mb-16">
          <h2 className="font-display text-2xl font-bold mb-6">Typography System</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Space Grotesk', usage: 'Display Headings & Hero Sections', sample: 'Aa Bb Cc 123', family: 'font-display' },
              { name: 'Inter', usage: 'UI & Body Content', sample: 'Aa Bb Cc 123', family: 'font-body' },
              { name: 'JetBrains Mono', usage: 'Code, Tags & Technical Badges', sample: 'Aa Bb Cc 123', family: 'font-mono' },
            ].map(t => (
              <div key={t.name} className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                <div className={`text-3xl ${t.family} font-bold mb-3`}>{t.sample}</div>
                <h3 className="font-display font-semibold text-sm">{t.name}</h3>
                <p className="text-xs text-cream/40 mt-1">{t.usage}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Download Packages */}
        <div className="mb-16">
          <h2 className="font-display text-2xl font-bold mb-6">Download Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Complete Brand Kit', desc: 'Official vector logos, color specifications, and typography guidelines', size: '2.4 MB', icon: Palette },
              { name: 'Logo Package', desc: 'All logo variations in SVG and scalable vector formats', size: '1.2 MB', icon: Image },
              { name: 'Press Release Template', desc: 'Brand-styled press release templates for publications', size: '850 KB', icon: FileText },
              { name: 'Product Screenshots & Media', desc: 'High-resolution enterprise product UI captures & illustrations', size: '18.4 MB', icon: Image },
            ].map(d => (
              <div
                key={d.name}
                onClick={() => handleDownloadPackage(d.name)}
                className="flex items-center gap-4 p-5 bg-obsidian-2 border border-glass-border rounded-[16px] hover:border-[rgba(200,255,0,0.3)] transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-[#C8FF00]/10 group-hover:bg-[#C8FF00]/20 rounded-[8px] flex items-center justify-center transition-colors">
                  <d.icon size={20} className="text-[#C8FF00]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-sm group-hover:text-[#C8FF00] transition-colors">{d.name}</h3>
                  <p className="text-xs text-cream/40">{d.desc}</p>
                </div>
                <div className="text-right">
                  <button className="text-xs text-[#C8FF00] font-medium flex items-center gap-1 group-hover:underline">
                    <Download size={12} /> Download
                  </button>
                  <div className="text-[10px] text-cream/30 mt-0.5">{d.size}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Usage Guidelines */}
        <div className="p-8 bg-obsidian-2 border border-glass-border rounded-[16px]">
          <h3 className="font-display text-xl font-bold mb-2">Brand Usage Guidelines</h3>
          <p className="text-xs text-cream/50 mb-6">Please adhere to these guidelines when referencing the HMorix brand in publications.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-emerald-500/[0.04] border border-emerald-500/20 rounded-[10px]">
              <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <Check size={16} /> Do
              </h4>
              <ul className="space-y-2 text-xs text-cream/70">
                <li>• Use official vector SVG files provided in this media kit</li>
                <li>• Maintain minimum clear space around the logo equal to 50% of its height</li>
                <li>• Use approved brand colors (Obsidian #0D0D0D and Electric Lime #C8FF00)</li>
                <li>• Reference the company as "HMorix" (capital H, capital M)</li>
              </ul>
            </div>
            <div className="p-4 bg-rose-500/[0.04] border border-rose-500/20 rounded-[10px]">
              <h4 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
                ✕ Don't
              </h4>
              <ul className="space-y-2 text-xs text-cream/70">
                <li>• Alter the logo geometry, font, proportions, or colors</li>
                <li>• Place the logo on low-contrast or cluttered backgrounds</li>
                <li>• Use the logo smaller than 24px height</li>
                <li>• Recombine with unapproved third-party brand marks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
