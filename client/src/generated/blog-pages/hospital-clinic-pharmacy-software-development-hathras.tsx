// @ts-nocheck
import { Link } from 'react-router-dom'
import { Clock, ArrowLeft, Share2, CheckCircle, HeartPulse, Stethoscope, Pill, ArrowRight, Shield, Calendar } from 'lucide-react'
import SEOHead from '../components/SEOHead'

const post = {
  title: "Hospital, Clinic & Pharmacy Management Software in Hathras (2026): OPD, E-Prescriptions & Billing",
  slug: "hospital-clinic-pharmacy-software-development-hathras",
  excerpt: "Modernize healthcare facilities in Hathras. HMorix engineers custom Hospital Management Systems (HMS), doctor OPD prescription apps, lab reports, and pharmacy GST billing software.",
  category: "HealthTech & Hospital ERP",
  readTime: "11 min read",
  author: "Harsh Sharma",
  authorRole: "Founder & CEO, HMorix",
  publishedAt: "2026-09-22T12:30:00.000Z",
  updatedAt: "2026-09-23T10:30:00.000Z",
  seoTitle: "Hospital & Clinic Management Software in Hathras | HMorix",
  metaDescription: "Looking for hospital or clinic software in Hathras? HMorix builds tailored healthcare software for OPD tokens, doctor e-prescriptions, lab tests, and pharmacy billing.",
  canonicalUrl: "https://hmorix.in/blog/hospital-clinic-pharmacy-software-development-hathras",
  openGraph: {
    title: "Hospital & Clinic Management Software in Hathras | HMorix",
    description: "Streamline patient appointments, digital prescriptions, and pharmacy billing for Hathras healthcare providers.",
    type: "article"
  },
  twitterCard: {
    card: "summary_large_image",
    title: "Healthcare Software in Hathras | HMorix",
    description: "Enterprise hospital management and clinic software in Hathras engineered by Harsh Sharma."
  },
  breadcrumbs: [
    { name: "Home", url: "https://hmorix.in" },
    { name: "Blog", url: "https://hmorix.in/blog" },
    { name: "Hospital Software Hathras", url: "https://hmorix.in/blog/hospital-clinic-pharmacy-software-development-hathras" }
  ],
  keywords: [
    "hospital management software hathras",
    "clinic software hathras",
    "pharmacy billing software hathras",
    "doctor appointment app hathras",
    "opd software hathras",
    "hathras healthcare tech",
    "Harsh Sharma hospital software",
    "hospital software mathura aligarh"
  ],
  schemaJsonld: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "headline": "Hospital, Clinic & Pharmacy Management Software in Hathras (2026): OPD, E-Prescriptions & Billing",
        "description": "Modernize healthcare facilities in Hathras. HMorix engineers custom Hospital Management Systems (HMS), doctor OPD prescription apps, lab reports, and pharmacy GST billing software.",
        "datePublished": "2026-09-22T12:30:00.000Z",
        "dateModified": "2026-09-23T10:30:00.000Z",
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
          "@id": "https://hmorix.in/blog/hospital-clinic-pharmacy-software-development-hathras"
        }
      },
      {
        "@type": "LocalBusiness",
        "name": "HMorix - Healthcare Tech Solutions",
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
            "name": "What are the core modules of HMorix Hospital Management Software?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "HMorix HMS includes OPD queue tokens, digital doctor e-prescriptions, diagnostic lab reporting, IPD bed management, pharmacy inventory batch expiry tracking, and BillingFlow GST invoice generation."
            }
          }
        ]
      }
    ]
  }
}

export default function HospitalSoftwareHathrasPost() {
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
              Medical facilities across <strong>Hathras, Sasni, Sadabad, and Sikandra Rao</strong> serve thousands of patients every day. Yet paper OPD files, handwritten doctor prescriptions that pharmacists struggle to decipher, and untracked medicine expiry dates create immense friction.
            </p>
            <p>
              In 2026, leading multi-specialty hospitals, private clinics, and retail pharmacies in Hathras are adopting <strong>HMorix Hospital & Clinic ERP Software</strong>, custom-architected by <strong>Harsh Sharma</strong>.
            </p>

            <h2 className="font-display text-2xl font-bold text-cream mt-10 mb-4">1. Key Modules of HMorix Healthcare Software</h2>
            <div className="grid md:grid-cols-2 gap-4 my-6">
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <Calendar className="text-[#C8FF00] mb-3" size={24} />
                <h3 className="font-display font-bold text-cream mb-2">Smart OPD Queue Management</h3>
                <p className="text-xs text-cream/50 leading-relaxed">Issue automated token numbers on touchscreen kiosks. Display live queue waiting times on clinic waiting room monitors.</p>
              </div>
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <Stethoscope className="text-[#C8FF00] mb-3" size={24} />
                <h3 className="font-display font-bold text-cream mb-2">Digital Doctor E-Prescriptions</h3>
                <p className="text-xs text-cream/50 leading-relaxed">Doctors tap to generate clean printed prescriptions with dosage instructions in Hindi and English in under 30 seconds.</p>
              </div>
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <Pill className="text-[#C8FF00] mb-3" size={24} />
                <h3 className="font-display font-bold text-cream mb-2">Pharmacy Batch & Expiry ERP</h3>
                <p className="text-xs text-cream/50 leading-relaxed">Barcode-scan medicine boxes, track near-expiry stocks automatically, and generate compliant GST bills with BillingFlow.</p>
              </div>
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <HeartPulse className="text-[#C8FF00] mb-3" size={24} />
                <h3 className="font-display font-bold text-cream mb-2">WhatsApp Lab Reports</h3>
                <p className="text-xs text-cream/50 leading-relaxed">When blood test or X-ray reports are ready, patients receive a secure download link automatically on WhatsApp.</p>
              </div>
            </div>

            <h2 className="font-display text-2xl font-bold text-cream mt-10 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
                <h3 className="font-semibold text-cream mb-2">Can this software operate in single-doctor private clinics?</h3>
                <p className="text-sm text-cream/50">Yes! HMorix offers lightweight, streamlined packages specifically built for solo medical practitioners and dental clinics.</p>
              </div>
            </div>

            <div className="mt-12 p-8 bg-gradient-to-r from-obsidian-2 via-[#C8FF00]/5 to-obsidian-2 border border-[#C8FF00]/20 rounded-[12px] text-center">
              <h3 className="font-display text-2xl font-bold mb-3 text-cream">Modernize your Hathras clinic or hospital today</h3>
              <p className="text-sm text-cream/60 mb-6 max-w-[550px] mx-auto">Discover how HMorix healthcare software streamlines patient care while cutting administrative chaos.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
                  Request Healthcare Demo <ArrowRight size={16} />
                </Link>
                <Link to="/services/software-development" className="btn-outline inline-flex">
                  Explore Software Engineering
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  )
}
