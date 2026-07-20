import { Link, useParams } from 'react-router-dom'
import SEOHead from '../components/seo/SEOHead'

const cities: Record<string, string> = {
  hathras: 'Hathras',
  mathura: 'Mathura',
  aligarh: 'Aligarh',
  agra: 'Agra',
  vrindavan: 'Vrindavan',
  delhi: 'Delhi',
  noida: 'Noida',
  mumbai: 'Mumbai',
  bengaluru: 'Bengaluru',
}

const services: Record<string, { title: string; desc: string; terms: string[] }> = {
  'web-app-development': {
    title: 'Web App Development',
    desc: 'custom React, Node.js, dashboard, SaaS, booking, ecommerce, CRM, ERP, and business web application development',
    terms: ['React web apps', 'Node.js APIs', 'admin dashboards', 'customer portals', 'SaaS platforms'],
  },
  hosting: {
    title: 'Hosting and Deployment',
    desc: 'fast website hosting, Vercel deployment, cloud setup, domain configuration, SSL, monitoring, and production support',
    terms: ['Vercel hosting', 'cloud hosting', 'SSL setup', 'domain setup', 'deployment support'],
  },
  automation: {
    title: 'Business Automation',
    desc: 'workflow automation, invoice automation, CRM automation, lead automation, email automation, and internal tool automation',
    terms: ['workflow automation', 'invoice automation', 'CRM automation', 'lead automation', 'operations tools'],
  },
  'ai-integration': {
    title: 'AI Integration',
    desc: 'AI chatbot, AI assistant, document automation, API integration, content automation, analytics, and intelligent business workflows',
    terms: ['AI chatbot', 'AI assistant', 'LLM integration', 'document AI', 'AI automation'],
  },
  software: {
    title: 'Custom Software Development',
    desc: 'business software, billing software, employee portals, CRM, HRM, inventory, reporting, analytics, and custom backend systems',
    terms: ['custom software', 'billing software', 'CRM software', 'HRM software', 'business dashboard'],
  },
  seo: {
    title: 'SEO Services',
    desc: 'technical SEO, local SEO, service page SEO, analytics setup, sitemap optimization, metadata, structured data, and content planning',
    terms: ['local SEO', 'technical SEO', 'Google ranking', 'sitemap setup', 'search optimization'],
  },
  products: {
    title: 'HMorix Products',
    desc: 'BillingFlow, AI Agent, PDF Automation, developer tools, analytics, CRM, HRM, and automation products for growing businesses',
    terms: ['BillingFlow', 'AI Agent', 'PDF Automation', 'CRM', 'HRM'],
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
  const city = cities[citySlug] || toTitle(citySlug)
  const service = services[serviceSlug] || services['web-app-development']
  const canonical = `/locations/${citySlug}/${serviceSlug}`
  const title = `${service.title} in ${city}`
  const description = `HMorix provides ${service.desc} in ${city}. Hire HMorix for reliable ${service.title.toLowerCase()} services, SEO-ready builds, secure deployment, and support.`
  const keywords = [
    `HMorix ${city}`,
    `${service.title} ${city}`,
    `${service.title.toLowerCase()} company in ${city}`,
    `best ${service.title.toLowerCase()} in ${city}`,
    `web app development ${city}`,
    `AI integration ${city}`,
    `automation services ${city}`,
    `SEO services ${city}`,
    `hosting services ${city}`,
    'Harsh Sharma HMorix',
  ].join(', ')

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: `HMorix ${service.title} in ${city}`,
    url: `https://orixmh.vercel.app${canonical}`,
    areaServed: city,
    brand: { '@type': 'Brand', name: 'HMorix' },
    founder: { '@type': 'Person', name: 'Harsh Sharma' },
    serviceType: service.title,
    description,
    address: { '@type': 'PostalAddress', addressLocality: city, addressCountry: 'IN' },
    makesOffer: service.terms.map(term => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: term } })),
  }

  return (
    <div className="pt-32 pb-20">
      <SEOHead title={title} description={description} keywords={keywords} canonical={canonical} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="max-w-[1120px] mx-auto px-8">
        <div className="max-w-[760px] mb-14">
          <span className="label-mono">HMorix Local Services</span>
          <h1 className="section-title mt-3 mb-6">{service.title} in {city}</h1>
          <p className="text-lg text-cream/60 leading-8">{description}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-14">
          {service.terms.map(term => (
            <div key={term} className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
              <h2 className="font-display text-lg font-bold mb-3">{term} in {city}</h2>
              <p className="text-sm text-cream/50 leading-6">Planning, design, development, deployment, analytics, and support for businesses that need practical technology delivery.</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-14">
          <div className="p-8 bg-obsidian-2 border border-glass-border rounded-[8px]">
            <h2 className="font-display text-2xl font-bold mb-4">Services available in {city}</h2>
            <ul className="space-y-3 text-sm text-cream/60">
              <li>Web app development, dashboards, portals, and SaaS products</li>
              <li>Hosting, deployment, performance, analytics, and SEO setup</li>
              <li>AI integration, automation, billing systems, CRM, and HRM tools</li>
              <li>Technical support for startups, shops, agencies, schools, and service businesses</li>
            </ul>
          </div>
          <div className="p-8 bg-obsidian-2 border border-glass-border rounded-[8px]">
            <h2 className="font-display text-2xl font-bold mb-4">Nearby service coverage</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(cities).map(([slug, label]) => (
                <Link key={slug} to={`/locations/${slug}/${serviceSlug}`} className="px-3 py-2 text-xs font-mono bg-[#C8FF00]/5 border border-[rgba(200,255,0,0.2)] rounded text-[#C8FF00] hover:bg-[#C8FF00]/10">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/contact" className="btn-primary">Discuss Your Project</Link>
          <Link to="/services" className="btn-secondary">View All Services</Link>
        </div>
      </div>
    </div>
  )
}
