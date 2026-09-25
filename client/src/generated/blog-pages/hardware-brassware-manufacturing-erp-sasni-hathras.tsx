// @ts-nocheck
import { Link } from 'react-router-dom'
import { Clock, ArrowLeft, Share2, CheckCircle, ArrowRight, Shield, Zap, Star, Award, Factory, Database, Layers, Shield } from 'lucide-react'
import SEOHead from '../components/SEOHead'

const post = {
  title: "Hardware & Brassware Manufacturing ERP in Sasni & Hathras: Shop Floor to Dispatch",
  slug: "hardware-brassware-manufacturing-erp-sasni-hathras",
  excerpt: "Streamline hardware casting and brassware manufacturing in Sasni and Hathras. HMorix engineers custom ERP software for metal weight reconciliation, mold tracking, and BillingFlow dispatch.",
  category: "Industry-Specific Portals",
  readTime: "11 min read",
  author: "Harsh Sharma",
  authorRole: "Founder & CEO, HMorix",
  publishedAt: "2026-09-24T14:00:00.000Z",
  updatedAt: "2026-09-25T10:00:00.000Z",
  seoTitle: "Hardware & Brassware Manufacturing ERP in Sasni | HMorix",
  metaDescription: "Looking for hardware or brassware manufacturing ERP in Sasni or Hathras? HMorix engineers tailored shop floor software for metal inventory, casting, and GST billing.",
  canonicalUrl: "https://hmorix.in/blog/hardware-brassware-manufacturing-erp-sasni-hathras",
  openGraph: {
    title: "Hardware & Brassware Manufacturing ERP in Sasni & Hathras: Shop Floor to Dispatch",
    description: "Streamline hardware casting and brassware manufacturing in Sasni and Hathras. HMorix engineers custom ERP software for metal weight reconciliation, mold tracking, and BillingFlow dispatch.",
    type: "article"
  },
  twitterCard: {
    card: "summary_large_image",
    title: "Hardware & Brassware Manufacturing ERP in Sasni | HMorix",
    description: "Looking for hardware or brassware manufacturing ERP in Sasni or Hathras? HMorix engineers tailored shop floor software for metal inventory, casting, and GST billing."
  },
  breadcrumbs: [
    { name: "Home", url: "https://hmorix.in" },
    { name: "Blog", url: "https://hmorix.in/blog" },
    { name: "Hardware & Brassware Manufacturing ERP in Sas...", url: "https://hmorix.in/blog/hardware-brassware-manufacturing-erp-sasni-hathras" }
  ],
  keywords: ["hardware manufacturing erp hathras", "brassware software sasni", "metal casting erp hathras", "factory inventory software sasni", "sasni hardware manufacturing software"],
  schemaJsonld: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "headline": "Hardware & Brassware Manufacturing ERP in Sasni & Hathras: Shop Floor to Dispatch",
        "description": "Streamline hardware casting and brassware manufacturing in Sasni and Hathras. HMorix engineers custom ERP software for metal weight reconciliation, mold tracking, and BillingFlow dispatch.",
        "datePublished": "2026-09-24T14:00:00.000Z",
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
          "@id": "https://hmorix.in/blog/hardware-brassware-manufacturing-erp-sasni-hathras"
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
            "name": "How does HMorix software prevent raw metal theft on the shop floor?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our ERP performs automated daily mass-balance reconciliation: Input Ingot Weight = Finished Goods Weight + Recorded Scrap + Acceptable Melting Loss. Any variance triggers a direct alert to the factory director."
            }
          },
          {
            "@type": "Question",
            "name": "Can the software manage electroplating and job-worker subcontracting?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! HMorix ERP tracks job-work delivery challans sent to external plating or polishing units, recording returns, rejections, and processing fees seamlessly."
            }
          }
        ]
      }
    ]
  }
}

export default function HardwareBrasswareERPPost() {
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
              The metal casting, brassware, and builder hardware industry across **Sasni and Hathras** supplies hinges, tower bolts, handles, and electrical fittings to construction projects across India.
            </p>
            <p>
              Yet unrecorded raw ingot wastage, unaccounted foundry scrap, and paper dispatch gate passes cost factory owners thousands of rupees every day. HMorix custom manufacturing ERP puts full operational control back into your hands.
            </p>

            <h2 className="font-display text-2xl font-bold text-cream mt-10 mb-4">1. Metal Weight Reconciliation from Ingot to Finished Goods</h2>
            <p>
              Every kilogram of copper, zinc, or brass ingot issued to the foundry is tracked through melting, die-casting, polishing, electroplating, and packing. HMorix ERP flags unexpected scrap discrepancies immediately.
            </p>

            <h2 className="font-display text-2xl font-bold text-cream mt-10 mb-4">2. Factory Floor ERP Modules</h2>
            <div className="grid md:grid-cols-2 gap-4 my-6">
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <Factory className="text-[#C8FF00] mb-3" size={24} />
                <h3 className="font-display font-bold text-cream mb-2">Die & Mold Maintenance Tracking</h3>
                <p className="text-xs text-cream/50 leading-relaxed">Monitor shot counts on casting dies to schedule preventive maintenance before quality defects occur.</p>
              </div>
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <Database className="text-[#C8FF00] mb-3" size={24} />
                <h3 className="font-display font-bold text-cream mb-2">Worker Piece-Rate & Wages</h3>
                <p className="text-xs text-cream/50 leading-relaxed">Track worker daily output and calculate piece-rate wages automatically with biometric integration.</p>
              </div>
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <Layers className="text-[#C8FF00] mb-3" size={24} />
                <h3 className="font-display font-bold text-cream mb-2">Box Barcoding & Carton Packing</h3>
                <p className="text-xs text-cream/50 leading-relaxed">Generate serialized barcode labels to eliminate packing errors and speed up truck loading.</p>
              </div>
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <Shield className="text-[#C8FF00] mb-3" size={24} />
                <h3 className="font-display font-bold text-cream mb-2">BillingFlow GST & E-Way Bills</h3>
                <p className="text-xs text-cream/50 leading-relaxed">Generate GST tax invoices, E-Way bills, and transport bilties with 1 click upon dispatch.</p>
              </div>
            </div>

            <h2 className="font-display text-2xl font-bold text-cream mt-10 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <h3 className="font-semibold text-cream mb-2">How does HMorix software prevent raw metal theft on the shop floor?</h3>
                <p className="text-sm text-cream/50">Our ERP performs automated daily mass-balance reconciliation: Input Ingot Weight = Finished Goods Weight + Recorded Scrap + Acceptable Melting Loss. Any variance triggers a direct alert to the factory director.</p>
              </div>
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <h3 className="font-semibold text-cream mb-2">Can the software manage electroplating and job-worker subcontracting?</h3>
                <p className="text-sm text-cream/50">Yes! HMorix ERP tracks job-work delivery challans sent to external plating or polishing units, recording returns, rejections, and processing fees seamlessly.</p>
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
