// @ts-nocheck
import { Link } from 'react-router-dom'
import { Clock, ArrowLeft, Share2, Building2, MapPin, Layers, Award, CheckCircle2, TrendingUp } from 'lucide-react'
import SEOHead from '../components/SEOHead'

const cs = {
  title: "How a Hathras Manufacturing Enterprise Scaled Operations with HMorix Custom ERP, BillingFlow & Web Platform",
  slug: "hathras-manufacturing-digital-transformation",
  excerpt: "Discover how Shree Ganesh Agro & Brassware in Hathras transformed inventory, streamlined GST invoicing via BillingFlow, and increased wholesale revenue by 320% with HMorix engineering.",
  category: "Case Study",
  clientName: "Shree Ganesh Agro & Brassware",
  industry: "Industrial Manufacturing",
  location: "Hathras, Uttar Pradesh",
  readTime: "8 min read",
  publishedAt: "2026-08-20T10:00:00.000Z",
  seoTitle: "Hathras Manufacturing Digital Transformation Case Study | HMorix",
  metaDescription: "Read how HMorix architected a custom ERP and automated BillingFlow pipeline for a leading Hathras manufacturing enterprise, unlocking 320% revenue growth.",
  canonicalUrl: "https://hmorix.in/case-studies/hathras-manufacturing-digital-transformation",
  openGraph: {
    title: "Hathras Manufacturing Scale Case Study | HMorix",
    description: "Custom ERP, BillingFlow integration, and digital marketing transformation in Hathras, UP.",
    type: "article"
  },
  twitterCard: {
    card: "summary_large_image",
    title: "Hathras Manufacturing Transformation by HMorix",
    description: "+320% Revenue growth and automated invoicing for Hathras industrial enterprise."
  },
  schemaJsonld: {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How a Hathras Manufacturing Enterprise Scaled Operations with HMorix Custom ERP, BillingFlow & Web Platform",
    "description": "Case study of Shree Ganesh Agro & Brassware in Hathras, UP achieving 320% revenue growth with HMorix.",
    "author": { "@type": "Person", "name": "Harsh Sharma", "url": "https://hmorix.in/harsh-sharma" },
    "publisher": { "@type": "Organization", "name": "HMorix", "url": "https://hmorix.in" }
  }
}

export default function HathrasManufacturingCaseStudy() {
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
              <div className="font-display text-3xl font-bold text-[#C8FF00] mb-1">+320%</div>
              <div className="text-xs text-cream/50">Wholesale Revenue Growth</div>
            </div>
            <div className="text-center sm:text-left border-b sm:border-b-0 sm:border-r border-glass-border pb-4 sm:pb-0 sm:pr-4">
              <div className="font-display text-3xl font-bold text-[#C8FF00] mb-1">85% Faster</div>
              <div className="text-xs text-cream/50">GST Invoicing & Billing</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="font-display text-3xl font-bold text-[#C8FF00] mb-1">99.9%</div>
              <div className="text-xs text-cream/50">Inventory Tracking Accuracy</div>
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
              <div className="font-bold text-cream">ERP + BillingFlow</div>
            </div>
            <div>
              <div className="text-cream/40 mb-1 flex items-center gap-1"><Award size={12} /> Architect</div>
              <div className="font-bold text-cream">Harsh Sharma</div>
            </div>
          </div>

          <article className="prose prose-invert max-w-none space-y-6 text-cream/70 leading-relaxed">
            <h2 className="font-display text-2xl font-bold text-cream">Executive Summary</h2>
            <p>
              Shree Ganesh Agro & Brassware Industries, a prominent Hathras manufacturer producing precision brass components and agricultural fittings, faced severe operational bottlenecks due to manual paper ledgers, untracked warehouse inventory, and slow payment cycles.
            </p>
            <p>
              Partnering with **Harsh Sharma** and the **HMorix** engineering team, the client deployed a custom React/Node.js manufacturing ERP, automated GST invoicing powered by **BillingFlow**, and a B2B ordering portal. Within 6 months, the business expanded into interstate wholesale markets and boosted revenue by 320%.
            </p>

            <h2 className="font-display text-2xl font-bold text-cream mt-8">The Challenge</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><span className="text-[#C8FF00] font-bold">✕</span> Delayed billing: Generating multi-line wholesale GST invoices manually took 45+ minutes per order.</li>
              <li className="flex items-start gap-2"><span className="text-[#C8FF00] font-bold">✕</span> Stock discrepancies between the Hathras foundry and central warehouse led to backorders.</li>
              <li className="flex items-start gap-2"><span className="text-[#C8FF00] font-bold">✕</span> Zero digital footprint on Google Search for buyers in Delhi, Mumbai, and Punjab searching for Hathras brassware.</li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-cream mt-8">The HMorix Solution</h2>
            <div className="space-y-4">
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <h3 className="font-bold text-cream mb-2">1. Custom Manufacturing ERP & Inventory Engine</h3>
                <p className="text-sm text-cream/60">Built on React 18, TypeScript, and MongoDB with real-time barcode scanning and automated raw material reordering triggers.</p>
              </div>
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <h3 className="font-bold text-cream mb-2">2. BillingFlow Invoicing Pipeline</h3>
                <p className="text-sm text-cream/60">Integrated PDF invoice generation with WhatsApp dispatch and automated payment reconciliation, reducing billing time to under 10 seconds.</p>
              </div>
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <h3 className="font-bold text-cream mb-2">3. B2B Catalog & Local SEO Sprint</h3>
                <p className="text-sm text-cream/60">Optimized public product catalogs for Google B2B buyer search queries, achieving #1 Google rankings for Hathras manufacturing keywords.</p>
              </div>
            </div>

            <h2 className="font-display text-2xl font-bold text-cream mt-8">The Results</h2>
            <div className="grid sm:grid-cols-2 gap-4 my-4">
              <div className="p-4 bg-obsidian-2 border border-glass-border rounded-[8px] flex items-center gap-3">
                <CheckCircle2 className="text-[#C8FF00]" size={24} />
                <span className="text-sm text-cream font-medium">320% increase in monthly B2B sales inquiries</span>
              </div>
              <div className="p-4 bg-obsidian-2 border border-glass-border rounded-[8px] flex items-center gap-3">
                <CheckCircle2 className="text-[#C8FF00]" size={24} />
                <span className="text-sm text-cream font-medium">85% reduction in administrative billing hours</span>
              </div>
              <div className="p-4 bg-obsidian-2 border border-glass-border rounded-[8px] flex items-center gap-3">
                <CheckCircle2 className="text-[#C8FF00]" size={24} />
                <span className="text-sm text-cream font-medium">Zero duplicate invoices or stock calculation errors</span>
              </div>
              <div className="p-4 bg-obsidian-2 border border-glass-border rounded-[8px] flex items-center gap-3">
                <CheckCircle2 className="text-[#C8FF00]" size={24} />
                <span className="text-sm text-cream font-medium">Rank #1 on Google for regional Hathras brass manufacturing</span>
              </div>
            </div>

            <div className="mt-12 p-8 bg-gradient-to-r from-obsidian-2 via-[#C8FF00]/5 to-obsidian-2 border border-[#C8FF00]/20 rounded-[12px] text-center">
              <h3 className="font-display text-2xl font-bold mb-3 text-cream">Want similar results for your business?</h3>
              <p className="text-sm text-cream/60 mb-6">Talk directly with Harsh Sharma about custom ERP, web development, or BillingFlow integration.</p>
              <Link to="/contact" className="btn-primary inline-flex">Book Your Consultation</Link>
            </div>
          </article>
        </div>
      </div>
    </>
  )
}
