// @ts-nocheck
import { Link } from 'react-router-dom'
import { Clock, ArrowLeft, Share2, CheckCircle, ArrowRight, Shield, Zap, Star, Award, Truck, Database, FileText, Zap } from 'lucide-react'
import SEOHead from '../components/SEOHead'

const post = {
  title: "Transport, Truck Fleet & Logistics ERP Software in Hathras (2026)",
  slug: "transport-fleet-logistics-software-hathras",
  excerpt: "Modernize your transport company in Hathras. HMorix builds custom logistics ERP software for bilty generation, truck trip expense management, driver advances, and freight billing.",
  category: "Industry-Specific Portals",
  readTime: "11 min read",
  author: "Harsh Sharma",
  authorRole: "Founder & CEO, HMorix",
  publishedAt: "2026-09-24T15:30:00.000Z",
  updatedAt: "2026-09-25T10:00:00.000Z",
  seoTitle: "Transport & Truck Logistics ERP Software in Hathras | HMorix",
  metaDescription: "Manage transport agencies and fleet logistics in Hathras with HMorix ERP. Automated LR/Bilty generation, diesel expense tracking, driver advances, and GST freight billing.",
  canonicalUrl: "https://hmorix.in/blog/transport-fleet-logistics-software-hathras",
  openGraph: {
    title: "Transport, Truck Fleet & Logistics ERP Software in Hathras (2026)",
    description: "Modernize your transport company in Hathras. HMorix builds custom logistics ERP software for bilty generation, truck trip expense management, driver advances, and freight billing.",
    type: "article"
  },
  twitterCard: {
    card: "summary_large_image",
    title: "Transport & Truck Logistics ERP Software in Hathras | HMorix",
    description: "Manage transport agencies and fleet logistics in Hathras with HMorix ERP. Automated LR/Bilty generation, diesel expense tracking, driver advances, and GST freight billing."
  },
  breadcrumbs: [
    { name: "Home", url: "https://hmorix.in" },
    { name: "Blog", url: "https://hmorix.in/blog" },
    { name: "Transport, Truck Fleet & Logistics ERP Softwa...", url: "https://hmorix.in/blog/transport-fleet-logistics-software-hathras" }
  ],
  keywords: ["transport software hathras", "fleet management software hathras", "truck logistics erp hathras", "bilty software hathras", "hathras transport agency software"],
  schemaJsonld: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "headline": "Transport, Truck Fleet & Logistics ERP Software in Hathras (2026)",
        "description": "Modernize your transport company in Hathras. HMorix builds custom logistics ERP software for bilty generation, truck trip expense management, driver advances, and freight billing.",
        "datePublished": "2026-09-24T15:30:00.000Z",
        "dateModified": "2026-09-25T10:00:00.000Z",
        "author": {
          "@type": "Person",
          "name": "Harsh Sharma",
          "url": "https://hmorix.in/harsh-sharma"
        },
        "publisher": {
          "@type": "Organization",
          "name": "HMorix",
          "url": "https://hmorix.in",
          "logo": { "@type": "ImageObject", "url": "https://hmorix.in/favicon.svg" }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "https://hmorix.in/blog/transport-fleet-logistics-software-hathras"
        }
      },
      {
        "@type": "LocalBusiness",
        "name": "HMorix - Software & AI Solutions",
        "image": "https://hmorix.in/favicon.svg",
        "url": "https://hmorix.in",
        "telephone": "+91-XXXXXXXXXX",
        "priceRange": "₹₹",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Main Market",
          "addressLocality": "Hathras",
          "addressRegion": "Uttar Pradesh",
          "postalCode": "204101",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 27.5946,
          "longitude": 78.0526
        },
        "areaServed": ["Hathras", "Sasni", "Sadabad", "Sikandra Rao", "Mursan", "Mathura", "Aligarh", "Agra"]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Can drivers upload petrol pump diesel receipts from the road?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Drivers use a simplified mobile web portal to snap photos of diesel slips and toll receipts, which automatically update the trip expense ledger in real time."
            }
          },
          {
            "@type": "Question",
            "name": "Does HMorix transport software generate GST E-Way bills?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! HMorix integrates directly with BillingFlow and the government GST E-Way bill system for automated one-click generation."
            }
          }
        ]
      }
    ]
  }
}

export default function TransportLogisticsERPPost() {
  const canonicalUrl = post.canonicalUrl

  return (
    <>
      <SEOHead
        title={post.seoTitle}
        description={post.metaDescription}
        canonicalUrl={canonicalUrl}
        openGraph={post.openGraph}
        twitterCard={post.twitterCard}
        jsonLd={post.schemaJsonld}
      />
      <div className="pt-32 pb-20 min-h-screen">
        <div className="max-w-[840px] mx-auto px-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-cream/40 hover:text-[#C8FF00] mb-6 transition-colors">
            <ArrowLeft size={14} /> Back to Blog
          </Link>

          <nav className="flex items-center gap-2 text-[11px] text-cream/30 font-mono mb-8 flex-wrap">
            {post.breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span>/</span>}
                {i === post.breadcrumbs.length - 1
                  ? <span className="text-cream/50">{b.name}</span>
                  : <Link to={b.url} className="hover:text-[#C8FF00]">{b.name}</Link>}
              </span>
            ))}
          </nav>

          <span className="inline-block px-3 py-1 bg-[#C8FF00]/10 text-[#C8FF00] text-xs font-mono rounded-full mb-4">
            {post.category}
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>

          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-glass-border flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-obsidian-3 rounded-full flex items-center justify-center text-xs font-bold text-[#C8FF00] border border-[#C8FF00]/20">
                HS
              </div>
              <div>
                <div className="text-sm font-medium">{post.author}</div>
                <div className="text-xs text-cream/40">{post.authorRole}</div>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs text-cream/40"><Clock size={12} />{post.readTime}</span>
            <span className="text-xs text-cream/40">Updated Sept 2026</span>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => navigator.share ? navigator.share({ title: post.title, url: canonicalUrl }) : navigator.clipboard.writeText(canonicalUrl)}
                className="w-8 h-8 border border-glass-border rounded-[4px] flex items-center justify-center text-cream/40 hover:text-[#C8FF00] hover:border-[#C8FF00] transition-all"
                title="Share article"
              ><Share2 size={14} /></button>
            </div>
          </div>

          <article className="prose prose-invert max-w-none space-y-6 text-cream/70 leading-relaxed text-base">
            <p className="text-lg text-cream/90 font-medium leading-relaxed">
              Hathras is a strategic logistics crossroad connecting Western UP freight to Delhi NCR, Haryana, Rajasthan, and Eastern India. Hundreds of transport agencies operate daily fleets moving agricultural produce, factory glassware, and wholesale goods.
            </p>
            <p>
              Yet tracking driver diesel advances, toll receipts, tyre changes, and pending party payments on paper bilties results in heavy profit leaks. HMorix logistics software brings complete transparency to your fleet operations.
            </p>

            <h2 className="font-display text-2xl font-bold text-cream mt-10 mb-4">1. End-to-End Fleet & Bilty Management</h2>
            <p>
              Generate professional Lorry Receipts (LR/Bilty) in seconds, calculate freight charges, deduct TDS, and track trip expenses from loading in Hathras to delivery at destination.
            </p>

            <h2 className="font-display text-2xl font-bold text-cream mt-10 mb-4">2. Logistics Software Capabilities</h2>
            <div className="grid md:grid-cols-2 gap-4 my-6">
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <Truck className="text-[#C8FF00] mb-3" size={24} />
                <h3 className="font-display font-bold text-cream mb-2">Instant Digital Bilty Generation</h3>
                <p className="text-xs text-cream/50 leading-relaxed">Create standardized GST consignment notes and send PDF copies to consignors and consignees via WhatsApp.</p>
              </div>
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <Database className="text-[#C8FF00] mb-3" size={24} />
                <h3 className="font-display font-bold text-cream mb-2">Trip Profitability Analytics</h3>
                <p className="text-xs text-cream/50 leading-relaxed">Track freight revenue minus diesel, toll, driver advance, and police expenses for every single trip.</p>
              </div>
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <FileText className="text-[#C8FF00] mb-3" size={24} />
                <h3 className="font-display font-bold text-cream mb-2">Tyre & Maintenance Log</h3>
                <p className="text-xs text-cream/50 leading-relaxed">Monitor tyre mileage by serial number and receive automated alerts for insurance and fitness renewals.</p>
              </div>
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <Zap className="text-[#C8FF00] mb-3" size={24} />
                <h3 className="font-display font-bold text-cream mb-2">Market Truck Brokerage Module</h3>
                <p className="text-xs text-cream/50 leading-relaxed">Manage hired market trucks, commission calculation, and supplier payment balances seamlessly.</p>
              </div>
            </div>

            <h2 className="font-display text-2xl font-bold text-cream mt-10 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <h3 className="font-semibold text-cream mb-2">Can drivers upload petrol pump diesel receipts from the road?</h3>
                <p className="text-sm text-cream/50">Yes! Drivers use a simplified mobile web portal to snap photos of diesel slips and toll receipts, which automatically update the trip expense ledger in real time.</p>
              </div>
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <h3 className="font-semibold text-cream mb-2">Does HMorix transport software generate GST E-Way bills?</h3>
                <p className="text-sm text-cream/50">Yes! HMorix integrates directly with BillingFlow and the government GST E-Way bill system for automated one-click generation.</p>
              </div>
            </div>

            <div className="mt-12 p-8 bg-gradient-to-r from-obsidian-2 via-[#C8FF00]/5 to-obsidian-2 border border-[#C8FF00]/20 rounded-[12px] text-center">
              <h3 className="font-display text-2xl font-bold mb-3 text-cream">Partner with Hathras's Premier Tech Company</h3>
              <p className="text-sm text-cream/60 mb-6 max-w-[550px] mx-auto">Discuss your project directly with Harsh Sharma and the HMorix engineering team.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
                  Get In Touch <ArrowRight size={16} />
                </Link>
                <Link to="/services" className="btn-outline inline-flex">
                  Explore All Services
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  )
}
