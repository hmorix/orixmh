import { Link, useParams } from 'react-router-dom'
import { Shield, Zap, Award, CheckCircle2, ArrowRight } from 'lucide-react'
import SEOHead from '../components/seo/SEOHead'

const cities: Record<string, { name: string; region: string; postal: string; lat: number; lng: number }> = {
  hathras: { name: 'Hathras', region: 'Uttar Pradesh', postal: '204101', lat: 27.5946, lng: 78.0526 },
  mathura: { name: 'Mathura', region: 'Uttar Pradesh', postal: '281001', lat: 27.4924, lng: 77.6737 },
  vrindavan: { name: 'Vrindavan', region: 'Uttar Pradesh', postal: '281121', lat: 27.5806, lng: 77.7006 },
  aligarh: { name: 'Aligarh', region: 'Uttar Pradesh', postal: '202001', lat: 27.8974, lng: 78.0880 },
  agra: { name: 'Agra', region: 'Uttar Pradesh', postal: '282001', lat: 27.1767, lng: 78.0081 },
  delhi: { name: 'Delhi', region: 'Delhi', postal: '110001', lat: 28.6139, lng: 77.2090 },
  noida: { name: 'Noida', region: 'Uttar Pradesh', postal: '201301', lat: 28.5355, lng: 77.3910 },
  mumbai: { name: 'Mumbai', region: 'Maharashtra', postal: '400001', lat: 19.0760, lng: 72.8777 },
  bengaluru: { name: 'Bengaluru', region: 'Karnataka', postal: '560001', lat: 12.9716, lng: 77.5946 },
}

const services: Record<string, { title: string; category: string; desc: string; terms: string[]; faqs: { q: string; a: string }[] }> = {
  'digital-marketing': {
    title: 'Best Digital Marketing Company',
    category: 'Digital Marketing & Growth',
    desc: 'award-winning digital marketing, Google Ads / PPC management, Meta Ads, social media growth, conversion rate optimization, and local SEO services to dominate search rankings and generate high-paying client leads.',
    terms: ['Google Ads PPC', 'Social Media Marketing', 'Local SEO Growth', 'Lead Generation Funnels', 'Brand Authority Building'],
    faqs: [
      { q: 'Why is HMorix the best digital marketing company in {city}?', a: 'HMorix combines data-backed PPC advertising, AI-powered audience targeting, and local SEO authority to deliver 3x-5x ROI compared to generic marketing agencies.' },
      { q: 'How fast can my business in {city} rank on Google?', a: 'With our local SEO sprint and Google Business Profile optimization, local businesses in {city} typically see top 3 map pack rankings within 30 to 60 days.' }
    ]
  },
  'web-development': {
    title: 'Web Development Company',
    category: 'Full-Stack Web Engineering',
    desc: 'high-performance custom website design, responsive web applications, React / Next.js portals, fast loading SaaS platforms, and secure eCommerce systems built to convert visitors into loyal customers.',
    terms: ['Custom Website Design', 'React & Next.js Web Apps', 'eCommerce Store Development', 'Fast WordPress to React Migration', 'Landing Page Optimization'],
    faqs: [
      { q: 'What web development technologies does HMorix use in {city}?', a: 'We build modern web applications using React 18, TypeScript, Tailwind CSS, Node.js, Next.js, and scalable cloud databases for maximum speed and security.' },
      { q: 'Can HMorix redesign my existing website in {city}?', a: 'Yes! We rebuild slow, legacy websites into high-speed, mobile-optimized, SEO-ready platforms that rank #1 on Google.' }
    ]
  },
  'web-app-development': {
    title: 'Web App Development',
    category: 'Enterprise Web Applications',
    desc: 'custom React, Node.js, admin dashboards, customer portals, SaaS platforms, booking engines, eCommerce, CRM, ERP, and business workflow software built for high scalability.',
    terms: ['React Web Apps', 'Node.js Backend APIs', 'Admin Dashboards', 'Customer Portals', 'Cloud SaaS Platforms'],
    faqs: [
      { q: 'How much does custom web app development cost in {city}?', a: 'HMorix offers transparent milestone-based pricing tailored to SME and enterprise scopes with zero hidden fees.' },
      { q: 'Do you provide maintenance and updates after launch?', a: 'Yes, we provide SLA-backed maintenance, cloud monitoring, security patches, and feature upgrades.' }
    ]
  },
  'app-development': {
    title: 'Best App Development Company',
    category: 'Mobile App Engineering',
    desc: 'native Android (Kotlin / APK), iOS (Swift), and cross-platform (React Native / Flutter) mobile applications with offline sync, biometric security, real-time push notifications, and payment gateways.',
    terms: ['Android APK Development', 'iOS App Development', 'Cross-Platform React Native', 'Offline-First Mobile Apps', 'Mobile UI/UX Design'],
    faqs: [
      { q: 'Can HMorix build Android APKs and iOS apps for businesses in {city}?', a: 'Yes, we build enterprise-grade mobile applications for retail, healthcare, logistics, hotels, and education with full Play Store and App Store deployment.' },
      { q: 'How does HMorix ensure fast app performance?', a: 'We use native architectures, optimized offline IndexedDB/SQLite caching, and microservices backends.' }
    ]
  },
  'mobile-apps': {
    title: 'Mobile App Development',
    category: 'Mobile App Engineering',
    desc: 'native Android APK, iOS, and hybrid mobile application engineering with seamless API integration and high security.',
    terms: ['Android Apps', 'iOS Apps', 'React Native', 'Flutter', 'Mobile Backend APIs'],
    faqs: [
      { q: 'Who leads mobile app development at HMorix in {city}?', a: 'Harsh Sharma and our engineering team oversee mobile application architecture and security audits directly.' }
    ]
  },
  'ai-agents': {
    title: 'AI Agent & Automation Company',
    category: 'Autonomous AI Systems',
    desc: 'bespoke autonomous AI agents, NVIDIA NIM powered workflows, customer support chatbots, document extraction AI, and end-to-end intelligent business automation pipelines.',
    terms: ['Autonomous AI Agents', 'Customer Support Chatbots', 'NVIDIA NIM Llama Integrations', 'Document Intelligence', 'CRM Auto-Sync Bots'],
    faqs: [
      { q: 'What can an AI Agent do for my business in {city}?', a: 'AI agents handle customer inquiries 24/7, qualify sales leads, generate invoices, extract PDF data, and automate repetitive back-office operations.' },
      { q: 'Is my business data secure with HMorix AI?', a: 'Yes. We implement private enterprise LLM instances with zero data training retention and end-to-end encryption.' }
    ]
  },
  'ai-integration': {
    title: 'AI Integration Services',
    category: 'Artificial Intelligence & ML',
    desc: 'seamless LLM integration, AI workflow automation, predictive business intelligence, and intelligent document processing for growing enterprises.',
    terms: ['LLM API Integration', 'OpenAI & Claude Pipelines', 'Predictive Analytics', 'Automated Content Engines', 'Voice & Chat Interfaces'],
    faqs: [
      { q: 'How can small businesses in {city} adopt AI affordably?', a: 'HMorix provides modular AI integration starting with high-impact areas like customer support and billing automation.' }
    ]
  },
  software: {
    title: 'Custom Software Development',
    category: 'Enterprise Software Engineering',
    desc: 'tailored business software, billing management systems, employee attendance portals, CRM, HRM, inventory tracking, and custom backend systems built from the ground up.',
    terms: ['Custom ERP Software', 'Billing & Invoicing Systems', 'HRM & Attendance Portals', 'CRM Pipelines', 'Inventory Management'],
    faqs: [
      { q: 'Why choose custom software over off-the-shelf subscriptions?', a: 'Custom software gives you 100% ownership, zero recurring per-user license fees, and exact feature alignment with your workflow.' }
    ]
  },
  seo: {
    title: 'Local SEO & Google Ranking Services',
    category: 'Search Engine Optimization',
    desc: 'technical SEO, Google Business Profile (GBP) ranking, Schema.org structured data, AEO (Answer Engine Optimization), GEO (Generative Engine Optimization), and local citation domination.',
    terms: ['Local Map Pack Domination', 'Technical SEO Audits', 'AEO / AI Search Optimization', 'Keyword Strategy', 'High-Authority Backlinks'],
    faqs: [
      { q: 'How does HMorix optimize for AI search like ChatGPT and Claude?', a: 'We implement advanced GEO (Generative Engine Optimization), structured entity knowledge graphs, and semantic Markdown authority signals.' }
    ]
  },
  billingflow: {
    title: 'BillingFlow Invoicing Software',
    category: 'Fintech & Automation',
    desc: 'automated GST billing, recurring invoice generation, PDF streaming, multi-currency payment tracking, and proactive WhatsApp/SMS payment reminders.',
    terms: ['Automated GST Invoices', 'PDF Invoice Stream', 'Subscription Management', 'Payment Gateway Sync', 'Tax Reports'],
    faqs: [
      { q: 'Can BillingFlow integrate with my existing accounts software?', a: 'Yes, BillingFlow provides RESTful APIs and webhooks for seamless synchronization with any database or ERP.' }
    ]
  },
  automation: {
    title: 'Business Process Automation',
    category: 'Operations Automation',
    desc: 'workflow automation, invoice workflows, CRM pipelines, sales lead routing, document processing, and internal operational tools.',
    terms: ['Workflow Automation', 'Lead Routing Bots', 'Email & SMS Triggers', 'Invoice Dispatching', 'Operational Dashboards'],
    faqs: [
      { q: 'What business processes can HMorix automate in {city}?', a: 'We automate lead capture, client onboarding, invoicing, payroll calculation, employee leaves, and client support tickets.' }
    ]
  },
  hosting: {
    title: 'Hosting and Cloud Deployment',
    category: 'Cloud Infrastructure',
    desc: 'high-speed website hosting, Vercel & AWS deployment, cloud architecture, SSL setup, 99.99% uptime monitoring, and enterprise production support.',
    terms: ['Cloud Hosting', 'Vercel Deployment', 'SSL Security Setup', 'Domain Configuration', '24/7 Cloud Monitoring'],
    faqs: [
      { q: 'What is the uptime guarantee for HMorix cloud hosting?', a: 'We guarantee 99.99% uptime with automated global CDN edge caching and instant DDoS protection.' }
    ]
  },
  products: {
    title: 'HMorix Enterprise Products',
    category: 'Enterprise Ecosystem',
    desc: 'BillingFlow, AI Agent Platform, PDF Automation, HRM Suite, and CRM solutions for growing businesses in India and worldwide.',
    terms: ['BillingFlow', 'AI Agent Platform', 'PDF Automation', 'Enterprise HRM', 'Integrated CRM'],
    faqs: [
      { q: 'Can I trial HMorix products before deployment?', a: 'Yes, schedule a live interactive demo with our engineering team today.' }
    ]
  },
}

function toTitle(value?: string) {
  if (!value) return ''
  return value.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}

export default function LocalServices() {
  const params = useParams()
  const citySlug = String(params.city || 'hathras').toLowerCase()
  const serviceSlug = String(params.service || 'web-app-development').toLowerCase()
  const cityData = cities[citySlug] || { name: toTitle(citySlug), region: 'Uttar Pradesh', postal: '204101', lat: 27.5946, lng: 78.0526 }
  const city = cityData.name
  const service = services[serviceSlug] || services['web-app-development']
  const canonical = `/locations/${citySlug}/${serviceSlug}`
  const title = `${service.title} in ${city} | #1 Ranked Agency - HMorix`
  const description = `Looking for the ${service.title.toLowerCase()} in ${city}? HMorix (founded by Harsh Sharma) provides ${service.desc} Serving ${city}, Mathura, Aligarh, Agra, and across India.`
  const keywords = [
    `HMorix ${city}`,
    `hmorix ${city.toLowerCase()}`,
    `orixmh ${city.toLowerCase()}`,
    `${service.title} in ${city}`,
    `${service.title.toLowerCase()} ${city}`,
    `best ${service.title.toLowerCase()} ${city}`,
    `${city.toLowerCase()} best ${service.title.toLowerCase()}`,
    `${city} web development company`,
    `${city} digital marketing company`,
    `${city} app development company`,
    `${city} ai agent company`,
    `Harsh Sharma ${city}`,
    'HMorix',
  ].join(', ')

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['LocalBusiness', 'ProfessionalService'],
        '@id': `https://hmorix.in${canonical}#business`,
        name: `HMorix - ${service.title} in ${city}`,
        alternateName: ['HMorix', 'hmorix', 'orixmh', 'HM Orix'],
        url: `https://hmorix.in${canonical}`,
        image: 'https://hmorix.in/og-image.png',
        areaServed: [
          { '@type': 'City', name: city },
          { '@type': 'City', name: 'Hathras' },
          { '@type': 'City', name: 'Mathura' },
          { '@type': 'City', name: 'Aligarh' },
          { '@type': 'City', name: 'Agra' }
        ],
        brand: { '@type': 'Brand', name: 'HMorix' },
        founder: {
          '@type': 'Person',
          name: 'Harsh Sharma',
          jobTitle: 'Founder & CEO',
          url: 'https://hmorix.in/harsh-sharma'
        },
        serviceType: service.title,
        description,
        address: {
          '@type': 'PostalAddress',
          streetAddress: `HMorix Service Center, ${city}`,
          addressLocality: city,
          addressRegion: cityData.region,
          postalCode: cityData.postal,
          addressCountry: 'IN'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: cityData.lat,
          longitude: cityData.lng
        },
        priceRange: '₹₹',
        makesOffer: service.terms.map(term => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: `${term} in ${city}` }
        }))
      },
      {
        '@type': 'FAQPage',
        '@id': `https://hmorix.in${canonical}#faq`,
        mainEntity: (service.faqs || []).map(f => ({
          '@type': 'Question',
          name: f.q.replace(/{city}/g, city),
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a.replace(/{city}/g, city)
          }
        }))
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `https://hmorix.in${canonical}#breadcrumbs`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hmorix.in' },
          { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://hmorix.in/services' },
          { '@type': 'ListItem', position: 3, name: `${service.title} in ${city}`, item: `https://hmorix.in${canonical}` }
        ]
      }
    ]
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <SEOHead title={title} description={description} keywords={keywords} canonical={canonical} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="max-w-[1120px] mx-auto px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[11px] text-cream/40 font-mono mb-6">
          <Link to="/" className="hover:text-[#C8FF00]">Home</Link>
          <span>/</span>
          <Link to="/services" className="hover:text-[#C8FF00]">Services</Link>
          <span>/</span>
          <span className="text-[#C8FF00]">{city}</span>
        </nav>

        {/* Hero Header */}
        <div className="max-w-[840px] mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-full text-[#C8FF00] text-xs font-mono mb-4">
            <Award size={14} /> #1 RANKED IN {city.toUpperCase()} & BRAJ REGION
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {service.title} in <span className="text-[#C8FF00]">{city}</span>
          </h1>
          <p className="text-lg text-cream/70 leading-8">
            {description}
          </p>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
          <div className="p-4 bg-obsidian-2 border border-glass-border rounded-[8px] flex items-center gap-3">
            <CheckCircle2 className="text-[#C8FF00] shrink-0" size={20} />
            <div className="text-xs">
              <div className="font-bold text-cream">#1 Ranked</div>
              <div className="text-cream/40">{city} Leader</div>
            </div>
          </div>
          <div className="p-4 bg-obsidian-2 border border-glass-border rounded-[8px] flex items-center gap-3">
            <Shield className="text-[#C8FF00] shrink-0" size={20} />
            <div className="text-xs">
              <div className="font-bold text-cream">Harsh Sharma</div>
              <div className="text-cream/40">Founder Direct Oversight</div>
            </div>
          </div>
          <div className="p-4 bg-obsidian-2 border border-glass-border rounded-[8px] flex items-center gap-3">
            <Zap className="text-[#C8FF00] shrink-0" size={20} />
            <div className="text-xs">
              <div className="font-bold text-cream">Fast Delivery</div>
              <div className="text-cream/40">Rapid Execution</div>
            </div>
          </div>
          <div className="p-4 bg-obsidian-2 border border-glass-border rounded-[8px] flex items-center gap-3">
            <Award className="text-[#C8FF00] shrink-0" size={20} />
            <div className="text-xs">
              <div className="font-bold text-cream">Guaranteed ROI</div>
              <div className="text-cream/40">Proven Client Results</div>
            </div>
          </div>
        </div>

        {/* Core Pillars / Service Modules */}
        <div className="mb-14">
          <h2 className="font-display text-2xl font-bold mb-6">Key Solutions & Capabilities in {city}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {service.terms.map(term => (
              <div key={term} className="p-6 bg-obsidian-2 border border-glass-border rounded-[12px] hover:border-[#C8FF00]/30 transition-all">
                <h3 className="font-display text-lg font-bold mb-3 text-cream">{term} in {city}</h3>
                <p className="text-sm text-cream/50 leading-relaxed mb-4">
                  Enterprise-grade architecture, precision execution, continuous analytics, and ongoing support designed to outcompete local competitors.
                </p>
                <div className="flex items-center text-xs text-[#C8FF00] font-mono">
                  Learn more <ArrowRight size={12} className="ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor Benchmark Matrix */}
        <div className="p-8 bg-obsidian-2 border border-glass-border rounded-[16px] mb-14">
          <h2 className="font-display text-2xl font-bold mb-4">Why HMorix Outperforms Traditional Agencies in {city}</h2>
          <p className="text-sm text-cream/60 mb-6">Compare HMorix engineering-driven approach against outdated traditional marketing agencies.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-glass-border text-left">
                  <th className="py-3 px-4 text-cream/60">Feature</th>
                  <th className="py-3 px-4 text-[#C8FF00]">HMorix (Harsh Sharma)</th>
                  <th className="py-3 px-4 text-cream/40">Generic Competitors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border text-cream/70">
                <tr>
                  <td className="py-3 px-4 font-medium">Technology Stack</td>
                  <td className="py-3 px-4 text-[#C8FF00]">React 18, TypeScript, Node.js, AI Agents</td>
                  <td className="py-3 px-4 text-cream/40">Slow WordPress / Generic templates</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">SEO & AEO Domination</td>
                  <td className="py-3 px-4 text-[#C8FF00]">Google Rank #1 + ChatGPT & Claude AEO</td>
                  <td className="py-3 px-4 text-cream/40">Basic meta tags only</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Engineering Leadership</td>
                  <td className="py-3 px-4 text-[#C8FF00]">Directly Architected by Harsh Sharma</td>
                  <td className="py-3 px-4 text-cream/40">Outsourced to junior freelancers</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Pricing & Transparency</td>
                  <td className="py-3 px-4 text-[#C8FF00]">Clear milestones, no recurring lock-ins</td>
                  <td className="py-3 px-4 text-cream/40">Hidden retainers & surprise bills</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        {service.faqs && service.faqs.length > 0 && (
          <div className="mb-14">
            <h2 className="font-display text-2xl font-bold mb-6">Frequently Asked Questions in {city}</h2>
            <div className="space-y-4">
              {service.faqs.map(f => (
                <div key={f.q} className="p-6 bg-obsidian-2 border border-glass-border rounded-[10px]">
                  <h3 className="font-display text-base font-semibold text-cream mb-2">{f.q.replace(/{city}/g, city)}</h3>
                  <p className="text-sm text-cream/60 leading-relaxed">{f.a.replace(/{city}/g, city)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Regional Coverage */}
        <div className="p-8 bg-obsidian-2 border border-glass-border rounded-[16px] mb-14">
          <h2 className="font-display text-xl font-bold mb-3">Explore HMorix in Nearby Regional Hubs</h2>
          <p className="text-xs text-cream/40 mb-6">We provide dedicated regional coverage across Western UP, NCR, and India's top metro hubs.</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(cities).map(([slug, data]) => (
              <Link
                key={slug}
                to={`/locations/${slug}/${serviceSlug}`}
                className={`px-3 py-2 text-xs font-mono rounded transition-all ${
                  slug === citySlug
                    ? 'bg-[#C8FF00] text-obsidian font-bold'
                    : 'bg-white/[0.04] text-cream/70 border border-glass-border hover:border-[#C8FF00] hover:text-[#C8FF00]'
                }`}
              >
                {data.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="p-10 bg-gradient-to-r from-obsidian-2 via-[#C8FF00]/5 to-obsidian-2 border border-[#C8FF00]/20 rounded-[16px] text-center">
          <h2 className="font-display text-3xl font-bold mb-3">Ready to Dominate Your Industry in {city}?</h2>
          <p className="text-sm text-cream/60 max-w-[600px] mx-auto mb-8">
            Get in touch with Harsh Sharma and the HMorix team to build high-performance web apps, mobile apps, AI workflows, or launch a #1 ranking SEO sprint.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn-primary">Book a Free Consultation</Link>
            <Link to="/case-studies" className="btn-secondary">View Case Studies</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

