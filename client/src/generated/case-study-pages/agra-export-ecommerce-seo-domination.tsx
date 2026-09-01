// @ts-nocheck
import { Link } from 'react-router-dom'
import { Clock, ArrowLeft, Share2, Building2, MapPin, Layers, Award, CheckCircle2 } from 'lucide-react'
import SEOHead from '../components/SEOHead'

const cs = {
  title: "Ranking #1 on Google: How an Agra Export Brand Reached Global Buyers with HMorix SEO & Web Engineering",
  slug: "agra-export-ecommerce-seo-domination",
  excerpt: "How Taj Crafts Global in Agra partnered with HMorix and Harsh Sharma to dominate Google search, rank #1 for international export keywords, and generate 350% more B2B inquiries.",
  category: "Case Study",
  clientName: "Taj Crafts Global Exports",
  industry: "Handicrafts & International Exports",
  location: "Agra, Uttar Pradesh",
  readTime: "8 min read",
  publishedAt: "2026-08-25T10:00:00.000Z",
  seoTitle: "Agra Export Brand Global SEO Case Study | HMorix #1",
  metaDescription: "Learn how HMorix engineered a high-speed React export catalog and dominated Google rankings for an Agra handicraft exporter, resulting in 350% more international orders.",
  canonicalUrl: "https://hmorix.in/case-studies/agra-export-ecommerce-seo-domination",
  openGraph: {
    title: "Agra Global SEO & Web App Case Study | HMorix",
    description: "Google #1 ranking and 350% international growth for Agra exporter.",
    type: "article"
  },
  twitterCard: {
    card: "summary_large_image",
    title: "Agra Global Export SEO Domination by HMorix",
    description: "#1 Google rankings on 42 export keywords engineered by Harsh Sharma."
  },
  schemaJsonld: {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Ranking #1 on Google: How an Agra Export Brand Reached Global Buyers with HMorix SEO & Web Engineering",
    "description": "Case study of Agra handicraft exporter reaching global buyers with HMorix SEO and React web application.",
    "author": { "@type": "Person", "name": "Harsh Sharma", "url": "https://hmorix.in/harsh-sharma" },
    "publisher": { "@type": "Organization", "name": "HMorix", "url": "https://hmorix.in" }
  }
}

export default function AgraExportCaseStudy() {
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
              <div className="font-display text-3xl font-bold text-[#C8FF00] mb-1">#1 Rank</div>
              <div className="text-xs text-cream/50">On 42 Commercial Keywords</div>
            </div>
            <div className="text-center sm:text-left border-b sm:border-b-0 sm:border-r border-glass-border pb-4 sm:pb-0 sm:pr-4">
              <div className="font-display text-3xl font-bold text-[#C8FF00] mb-1">+350%</div>
              <div className="text-xs text-cream/50">International B2B Inquiries</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="font-display text-3xl font-bold text-[#C8FF00] mb-1">&lt;0.8s</div>
              <div className="text-xs text-cream/50">Global Page Load Speed</div>
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
              <div className="font-bold text-cream">SEO + React Web App</div>
            </div>
            <div>
              <div className="text-cream/40 mb-1 flex items-center gap-1"><Award size={12} /> Architect</div>
              <div className="font-bold text-cream">Harsh Sharma</div>
            </div>
          </div>

          <article className="prose prose-invert max-w-none space-y-6 text-cream/70 leading-relaxed">
            <h2 className="font-display text-2xl font-bold text-cream">Executive Summary</h2>
            <p>
              Taj Crafts Global Exports in Agra is a premier exporter of marble inlay art, leather goods, and Indian handicrafts. Despite offering museum-quality craftsmanship, their slow legacy website was invisible on Google search engines in the US, UK, and UAE.
            </p>
            <p>
              **Harsh Sharma** and **HMorix** re-engineered the platform using React 18, edge caching via Vercel, and deep Schema.org / AEO structured data optimization. The company rapidly achieved #1 rankings across 42 high-intent export terms, driving a 350% surge in qualified international bulk wholesale inquiries.
            </p>

            <h2 className="font-display text-2xl font-bold text-cream mt-8">Engineering & SEO Execution</h2>
            <div className="space-y-4">
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <h3 className="font-bold text-cream mb-2">1. Sub-Second Global Load Time</h3>
                <p className="text-sm text-cream/60">Built with modern client-side React + edge caching, scoring 100/100 on Google PageSpeed Insights.</p>
              </div>
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <h3 className="font-bold text-cream mb-2">2. Technical & Local/Global SEO</h3>
                <p className="text-sm text-cream/60">Implemented Product, Organization, and LocalBusiness JSON-LD schemas targeting both Agra regional signals and international B2B buyers.</p>
              </div>
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <h3 className="font-bold text-cream mb-2">3. Automated RFQ & Lead Capture</h3>
                <p className="text-sm text-cream/60">Instant quotation generation and automated multi-currency currency conversion for international wholesale buyers.</p>
              </div>
            </div>

            <div className="mt-12 p-8 bg-gradient-to-r from-obsidian-2 via-[#C8FF00]/5 to-obsidian-2 border border-[#C8FF00]/20 rounded-[12px] text-center">
              <h3 className="font-display text-2xl font-bold mb-3 text-cream">Ready to dominate search rankings?</h3>
              <p className="text-sm text-cream/60 mb-6">Launch an SEO and web engineering sprint with HMorix today.</p>
              <Link to="/contact" className="btn-primary inline-flex">Schedule Your SEO Audit</Link>
            </div>
          </article>
        </div>
      </div>
    </>
  )
}
