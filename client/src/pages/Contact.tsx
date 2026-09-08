import { useState, useEffect, useRef } from 'react'
import { Mail, MapPin, Phone, Navigation } from 'lucide-react'
import { config } from '../lib/config'
import SEOHead from '../components/seo/SEOHead'

// HMorix Hathras HQ — from Google Business Profile CID: 6647719562825355400
const HMORIX_LOCATION = { lat: 27.5785936, lng: 78.05318559999999 }
const HMORIX_CID_LINK = 'https://www.google.com/maps?cid=6647719562825355400'

declare global {
  interface Window {
    google: any
    initHmorixMap: () => void
  }
}

function GoogleMapsWidget() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const [apiKey] = useState(() => import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '')

  useEffect(() => {
    if (!apiKey) return
    if (window.google?.maps) { setMapsLoaded(true); return }

    window.initHmorixMap = () => setMapsLoaded(true)

    const existing = document.querySelector('script[data-gmaps]')
    if (existing) return

    const script = document.createElement('script')
    script.setAttribute('data-gmaps', 'true')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initHmorixMap&libraries=places,geometry&solution_channel=GMP_QB_commutes_v3_c`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  }, [apiKey])

  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || !window.google?.maps) return

    const map = new window.google.maps.Map(mapRef.current, {
      center: HMORIX_LOCATION,
      zoom: 16,
      maxZoom: 20,
      fullscreenControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      zoomControl: true,
    })

    // Origin marker for HMorix HQ
    new window.google.maps.Marker({
      position: HMORIX_LOCATION,
      map,
      title: 'HMorix – Hathras HQ',
      label: {
        text: '●',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
      },
      icon: {
        path: 'M10 27c-.2 0-.2 0-.5-1-.3-.8-.7-2-1.6-3.5-1-1.5-2-2.7-3-3.8-2.2-2.8-3.9-5-3.9-8.8C1 4.9 5 1 10 1s9 4 9 8.9c0 3.9-1.8 6-4 8.8-1 1.2-1.9 2.4-2.8 3.8-1 1.5-1.4 2.7-1.6 3.5-.3 1-.4 1-.6 1Z',
        fillColor: '#EA4335',
        fillOpacity: 1,
        strokeColor: '#C5221F',
        strokeWeight: 1,
        anchor: new window.google.maps.Point(15, 29),
        scale: 1.2,
        labelOrigin: new window.google.maps.Point(10, 9),
      },
    })

    // Info window on load
    const infoWindow = new window.google.maps.InfoWindow({
      content: `<div style="font-family:Arial,sans-serif;color:#202124;padding:4px 2px;max-width:220px">
        <strong style="font-size:14px">HMorix</strong><br/>
        <span style="font-size:12px;color:#5f6368">Enterprise AI Software & Digital Solutions</span><br/>
        <span style="font-size:12px;color:#5f6368">Agra Road, Hathras, UP – 204101</span><br/>
        <a href="${HMORIX_CID_LINK}" target="_blank" style="color:#1a73e8;font-size:12px;text-decoration:none">View on Google Maps ↗</a>
      </div>`,
    })
    infoWindow.setPosition(HMORIX_LOCATION)
    infoWindow.open(map)
  }, [mapsLoaded])

  if (!apiKey) {
    // Fallback: OpenStreetMap embed — no API key, no "blocked" errors, free forever
    const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${HMORIX_LOCATION.lng - 0.01}%2C${HMORIX_LOCATION.lat - 0.01}%2C${HMORIX_LOCATION.lng + 0.01}%2C${HMORIX_LOCATION.lat + 0.01}&layer=mapnik&marker=${HMORIX_LOCATION.lat}%2C${HMORIX_LOCATION.lng}`
    return (
      <div className="w-full rounded-2xl overflow-hidden border border-glass-border" style={{ height: 380 }}>
        <iframe
          title="HMorix Location – Hathras HQ"
          src={osmUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div style={{ textAlign: 'center', fontSize: 11, padding: '2px 0' }}>
          <a href={HMORIX_CID_LINK} target="_blank" rel="noopener noreferrer" style={{ color: '#1a73e8' }}>
            View on Google Maps ↗
          </a>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className="w-full rounded-2xl overflow-hidden border border-glass-border"
      style={{ height: 380 }}
      aria-label="HMorix Hathras HQ location map"
    />
  )
}

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', service: 'Web Development', message: '' })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    const response = await fetch(`${config.apiUrl}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(data.error || 'Unable to send message')
      return
    }
    setSubmitted(true)
  }

  return (
    <div className="pt-32 pb-20">
      <SEOHead
        title="Contact HMorix – AI Software & Digital Solutions"
        description="Contact HMorix for AI software, web development, mobile apps, automation, SEO, cybersecurity, smart home, and digital transformation projects. Visit us at Hathras, Uttar Pradesh."
        keywords="contact HMorix, AI software company contact, web development agency India, digital solutions, HMorix support, project inquiry, Hathras technology company"
        canonical="/contact"
      />
      <div className="max-w-[1280px] mx-auto px-8">
        <span className="label-mono">Contact</span>
        <h1 className="section-title mt-3 mb-16">Let's talk</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left: Contact Info */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold mb-4">Get in touch</h2>
            <p className="text-cream/60 mb-8">Ready to start your project? Have questions? We'd love to hear from you.</p>
            <div className="space-y-4">
              {[
                { icon: Mail, title: 'General Inquiries', value: 'info@hmorix.in', hidden: false },
                { icon: Mail, title: 'Official & Legal', value: 'official@hmorix.in', hidden: false },
                // Retained in code but hidden from display on Contact page as requested:
                { icon: Mail, title: 'Technical Support', value: 'support@hmorix.in', hidden: true },
                { icon: Mail, title: 'Executive / Founder', value: 'harsh@hmorix.in', hidden: true },
                { icon: Mail, title: 'Careers & Hiring', value: 'career@hmorix.in', hidden: true },
                { icon: Mail, title: 'Human Resources', value: 'hr@hmorix.in', hidden: true },
                { icon: Mail, title: 'Direct Backup Inbox', value: 'hmorix.in@gmail.com', hidden: true },
                { icon: Phone, title: 'Phone', value: '+91 93681 53189', hidden: false },
                { icon: MapPin, title: 'Office (Hathras HQ)', value: 'Agra Road, Hathras, Uttar Pradesh - 204101, India', hidden: false },
                { icon: MapPin, title: 'Office (Kanpur)', value: 'Gujani J Block Kanpur, Uttar Pradesh - 208022, India', hidden: false },
              ].filter(item => !item.hidden).map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#C8FF00]/10 border border-[rgba(200,255,0,0.2)] rounded-[4px] flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-[#C8FF00]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className="text-sm text-cream/50">
                      {item.value.includes('@') ? (
                        <a href={`mailto:${item.value}`} className="hover:text-[#C8FF00] transition-colors">{item.value}</a>
                      ) : (
                        item.value
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-3 p-8 bg-obsidian-2 border border-glass-border rounded-[24px]">
            {!submitted ? (
              <form onSubmit={submit} className="space-y-4">
                {message && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-[8px] text-sm text-red-400">{message}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-cream/60 mb-1.5">First Name</label>
                    <input type="text" required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cream/60 mb-1.5">Last Name</label>
                    <input type="text" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-cream/60 mb-1.5">Email</label>
                  <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-cream/60 mb-1.5">Service Needed</label>
                  <select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00]">
                    <option>Web Development</option>
                    <option>AI Solutions</option>
                    <option>Cyber Security</option>
                    <option>Smart Home</option>
                    <option>Software Development</option>
                    <option>SEO Optimation</option>
                    <option>HMorix Implantation</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-cream/60 mb-1.5">Message</label>
                  <textarea rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00] resize-none" />
                </div>
                <button type="submit" className="w-full py-3 bg-[#C8FF00] text-obsidian font-display font-semibold rounded-[4px] hover:opacity-90 transition-all">Send Message</button>
              </form>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">✓</div>
                <h3 className="font-display text-xl font-bold mb-2">Message Sent!</h3>
                <p className="text-sm text-cream/50">We'll be in touch within 24 hours.</p>
              </div>
            )}
          </div>
        </div>

        {/* Google Maps Directions Widget */}
        <div className="mt-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="label-mono">Find Us</span>
              <h2 className="font-display text-2xl font-bold mt-2">Visit HMorix – Hathras HQ</h2>
              <p className="text-cream/60 mt-1 text-sm">Agra Road, Hathras, Uttar Pradesh – 204101, India</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <a
                href={HMORIX_CID_LINK}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 border border-glass-border rounded-[8px] text-sm text-cream/70 hover:border-[#C8FF00] hover:text-[#C8FF00] transition-all"
              >
                <MapPin size={16} />
                View on Google Maps
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${HMORIX_LOCATION.lat},${HMORIX_LOCATION.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-[#C8FF00] text-obsidian font-semibold rounded-[8px] text-sm hover:opacity-90 transition-all"
              >
                <Navigation size={16} />
                Get Directions
              </a>
            </div>
          </div>

          <GoogleMapsWidget />

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: '🚗 By Car', detail: 'From Aligarh: 35 min · From Agra: 55 min · From Delhi: 3 h' },
              { label: '🚌 By Train', detail: 'Hathras Jn (HRS) – Express trains from Delhi, Agra, Mathura' },
              { label: '🏨 Nearby', detail: 'Mathura: 40 km · Aligarh: 35 km · Agra: 65 km' },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-obsidian-2 border border-glass-border rounded-[12px]">
                <div className="font-semibold text-sm mb-1">{item.label}</div>
                <div className="text-xs text-cream/50">{item.detail}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-[#C8FF00]/5 border border-[rgba(200,255,0,0.15)] rounded-[12px] flex items-start gap-3">
            <Navigation size={16} className="text-[#C8FF00] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-cream/60">
              <span className="text-cream/80 font-medium">Plan your commute: </span>
              Click <strong className="text-cream/80">Get Directions</strong> above to open Google Maps with turn-by-turn navigation to HMorix HQ. You can also scan our{' '}
              <a href={HMORIX_CID_LINK} target="_blank" rel="noreferrer" className="text-[#C8FF00] hover:underline">Google Business Profile</a>
              {' '}for reviews, hours, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

