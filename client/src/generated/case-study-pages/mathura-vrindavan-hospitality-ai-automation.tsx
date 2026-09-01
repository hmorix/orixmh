// @ts-nocheck
import { Link } from 'react-router-dom'
import { Clock, ArrowLeft, Share2, Building2, MapPin, Layers, Award, CheckCircle2 } from 'lucide-react'
import SEOHead from '../components/SEOHead'

const cs = {
  title: "Automating Hotel Bookings & 24/7 Guest Support in Mathura & Vrindavan with HMorix AI Agents & BillingFlow",
  slug: "mathura-vrindavan-hospitality-ai-automation",
  excerpt: "How Braj Heritage Hospitality Group in Mathura & Vrindavan used HMorix AI Agents and BillingFlow to automate 94% of guest reservations and increase direct bookings by 4.2x.",
  category: "Case Study",
  clientName: "Braj Heritage Hospitality Group",
  industry: "Hospitality & Tourism",
  location: "Mathura & Vrindavan, Uttar Pradesh",
  readTime: "7 min read",
  publishedAt: "2026-08-22T10:00:00.000Z",
  seoTitle: "Mathura Vrindavan Hotel AI Automation Case Study | HMorix",
  metaDescription: "Learn how HMorix deployed custom AI Agents and BillingFlow for a leading hotel chain in Mathura and Vrindavan, cutting OTA commissions by 60%.",
  canonicalUrl: "https://hmorix.in/case-studies/mathura-vrindavan-hospitality-ai-automation",
  openGraph: {
    title: "Mathura & Vrindavan Hotel AI Automation Case Study | HMorix",
    description: "Autonomous guest booking bots, WhatsApp integration, and dynamic billing.",
    type: "article"
  },
  twitterCard: {
    card: "summary_large_image",
    title: "Hotel AI Automation in Mathura & Vrindavan by HMorix",
    description: "4.2x Direct bookings and 94% autonomous guest resolution."
  },
  schemaJsonld: {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Automating Hotel Bookings & 24/7 Guest Support in Mathura & Vrindavan with HMorix AI Agents & BillingFlow",
    "description": "Case study of hotel booking automation in Mathura and Vrindavan with HMorix AI.",
    "author": { "@type": "Person", "name": "Harsh Sharma", "url": "https://hmorix.in/harsh-sharma" },
    "publisher": { "@type": "Organization", "name": "HMorix", "url": "https://hmorix.in" }
  }
}

export default function MathuraVrindavanHospitalityCaseStudy() {
  const canonicalUrl = cs.canonicalUrl

  return (
    <>
      <SEOHead
        title={cs.seoTitle}
        description={cs.metaDescription}
        canonicalUrl={canonicalUrl}
        openGraph={cs.openGraph}
        twitterCard={cs.twitterCard}
        jsonLd={cs.schemaJsonld}
      />
      <div className="pt-32 pb-20 min-h-screen">
        <div className="max-w-[880px] mx-auto px-8">
          <Link to="/case-studies" className="inline-flex items-center gap-2 text-sm text-cream/40 hover:text-[#C8FF00] mb-6 transition-colors">
            <ArrowLeft size={14} /> Back to Case Studies
          </Link>

          <div className="flex items-center gap-3 text-xs font-mono text-[#C8FF00] mb-4">
            <span className="px-2 py-0.5 bg-[#C8FF00]/10 rounded">CASE STUDY</span>
            <span>·</span>
            <span>{cs.industry}</span>
          </div>

          <h1 className="font-display text-3xl md:text-5xl font-bold mb-8 leading-tight">{cs.title}</h1>

          {/* Key Metrics Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-obsidian-2 border border-glass-border rounded-[12px] mb-12">
            <div className="text-center sm:text-left border-b sm:border-b-0 sm:border-r border-glass-border pb-4 sm:pb-0 sm:pr-4">
              <div className="font-display text-3xl font-bold text-[#C8FF00] mb-1">94%</div>
              <div className="text-xs text-cream/50">Inquiries Handled by AI</div>
            </div>
            <div className="text-center sm:text-left border-b sm:border-b-0 sm:border-r border-glass-border pb-4 sm:pb-0 sm:pr-4">
              <div className="font-display text-3xl font-bold text-[#C8FF00] mb-1">4.2x Growth</div>
              <div className="text-xs text-cream/50">Direct Website Bookings</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="font-display text-3xl font-bold text-[#C8FF00] mb-1">-60%</div>
              <div className="text-xs text-cream/50">OTA Commission Costs</div>
            </div>
          </div>

          {/* Client Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white/[0.02] border border-glass-border rounded-[8px] mb-12 text-xs">
            <div>
              <div className="text-cream/40 mb-1 flex items-center gap-1"><Building2 size={12} /> Client</div>
              <div className="font-bold text-cream">{cs.clientName}</div>
            </div>
            <div>
              <div className="text-cream/40 mb-1 flex items-center gap-1"><MapPin size={12} /> Location</div>
              <div className="font-bold text-cream">{cs.location}</div>
            </div>
            <div>
              <div className="text-cream/40 mb-1 flex items-center gap-1"><Layers size={12} /> Solutions</div>
              <div className="font-bold text-cream">AI Agent + Web Engine</div>
            </div>
            <div>
              <div className="text-cream/40 mb-1 flex items-center gap-1"><Award size={12} /> Architect</div>
              <div className="font-bold text-cream">Harsh Sharma</div>
            </div>
          </div>

          <article className="prose prose-invert max-w-none space-y-6 text-cream/70 leading-relaxed">
            <h2 className="font-display text-2xl font-bold text-cream">Executive Summary</h2>
            <p>
              Braj Heritage Hospitality Group operates 4 boutique hotels and pilgrim resorts across Mathura and Vrindavan. During festival peaks (Janmashtami, Holi, Radhashtami), the front desk received hundreds of simultaneous WhatsApp and phone inquiries, causing lost bookings and high reliance on high-commission third-party booking portals.
            </p>
            <p>
              **Harsh Sharma** and the **HMorix** engineering team designed a 24/7 multilingual WhatsApp AI Booking Agent linked directly to their room inventory and **BillingFlow** payment system. The AI agent answers guest questions, verifies room availability, and sends instant UPI/Card payment links.
            </p>

            <h2 className="font-display text-2xl font-bold text-cream mt-8">The Solution Delivered</h2>
            <div className="space-y-4">
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <h3 className="font-bold text-cream mb-2">1. Multilingual AI Reservation Agent</h3>
                <p className="text-sm text-cream/60">Trained on temple visiting hours, check-in policies, room amenities, and parking availability in Hindi and English.</p>
              </div>
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <h3 className="font-bold text-cream mb-2">2. Instant WhatsApp BillingFlow Invoicing</h3>
                <p className="text-sm text-cream/60">Auto-generates booking confirmation vouchers and GST invoices in PDF format within 5 seconds of payment.</p>
              </div>
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <h3 className="font-bold text-cream mb-2">3. Local SEO & Google Maps Sprint</h3>
                <p className="text-sm text-cream/60">Positioned all 4 properties in the top 3 Google Map pack results for 'hotel near Banke Bihari Temple' and 'best stay in Mathura'.</p>
              </div>
            </div>

            <h2 className="font-display text-2xl font-bold text-cream mt-8">The Results</h2>
            <div className="grid sm:grid-cols-2 gap-4 my-4">
              <div className="p-4 bg-obsidian-2 border border-glass-border rounded-[8px] flex items-center gap-3">
                <CheckCircle2 className="text-[#C8FF00]" size={24} />
                <span className="text-sm text-cream font-medium">94% of guest inquiries resolved without front-desk staff</span>
              </div>
              <div className="p-4 bg-obsidian-2 border border-glass-border rounded-[8px] flex items-center gap-3">
                <CheckCircle2 className="text-[#C8FF00]" size={24} />
                <span className="text-sm text-cream font-medium">4.2x Increase in direct commission-free bookings</span>
              </div>
              <div className="p-4 bg-obsidian-2 border border-glass-border rounded-[8px] flex items-center gap-3">
                <CheckCircle2 className="text-[#C8FF00]" size={24} />
                <span className="text-sm text-cream font-medium">Zero missed leads during peak festival traffic surges</span>
              </div>
            </div>

            <div className="mt-12 p-8 bg-gradient-to-r from-obsidian-2 via-[#C8FF00]/5 to-obsidian-2 border border-[#C8FF00]/20 rounded-[12px] text-center">
              <h3 className="font-display text-2xl font-bold mb-3 text-cream">Ready to automate your hotel or customer inquiries?</h3>
              <p className="text-sm text-cream/60 mb-6">Deploy HMorix AI Agents for your business today.</p>
              <Link to="/contact" className="btn-primary inline-flex">Schedule a Demo</Link>
            </div>
          </article>
        </div>
      </div>
    </>
  )
}
