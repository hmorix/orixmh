import { Link } from 'react-router-dom'
import SEOHead from '../../components/seo/SEOHead'

export default function Terms() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': 'https://hmorix.in/terms#webpage',
        url: 'https://hmorix.in/terms',
        name: 'HMorix Terms of Service & User Agreement',
        description: 'Read the official terms and conditions for using HMorix cloud software, AI agents, BillingFlow, and custom web development services.',
        publisher: {
          '@type': 'Organization',
          name: 'HMorix',
          url: 'https://hmorix.in',
          founder: {
            '@type': 'Person',
            name: 'Harsh Sharma',
            url: 'https://hmorix.in/harsh-sharma'
          },
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Hathras',
            addressRegion: 'Uttar Pradesh',
            postalCode: '204101',
            addressCountry: 'IN'
          }
        }
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://hmorix.in/terms#breadcrumbs',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hmorix.in' },
          { '@type': 'ListItem', position: 2, name: 'Terms of Service', item: 'https://hmorix.in/terms' }
        ]
      }
    ]
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <SEOHead
        title="Terms of Service & User Agreement | HMorix"
        description="Official HMorix Terms of Service — read our legal terms and conditions for using HMorix enterprise software, AI agents, web development, and digital marketing services."
        keywords="HMorix terms of service, HMorix terms, Harsh Sharma HMorix, Hathras enterprise software terms, legal agreement, user terms, SLA terms"
        canonical="/terms"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="max-w-[800px] mx-auto px-8">
        <nav className="flex items-center gap-2 text-[11px] text-cream/40 font-mono mb-6">
          <Link to="/" className="hover:text-[#C8FF00]">Home</Link>
          <span>/</span>
          <span className="text-[#C8FF00]">Terms of Service</span>
        </nav>

        <h1 className="font-display text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-xs text-cream/40 font-mono mb-8">Effective Date: January 1, 2026 · Governing Law: Hathras, Uttar Pradesh, India</p>

        <div className="prose prose-invert max-w-none space-y-6 text-cream/60 text-sm leading-relaxed">
          <h2 className="font-display text-xl font-semibold text-cream !mt-8">1. Acceptance of Terms</h2>
          <p>By accessing or using HMorix services, website (https://hmorix.in), APIs, BillingFlow, AI Agent platform, or engaging our digital marketing and web development services, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.</p>
          
          <h2 className="font-display text-xl font-semibold text-cream !mt-8">2. Scope of Services</h2>
          <p>HMorix, founded by Harsh Sharma and headquartered in Hathras, Uttar Pradesh, provides enterprise B2B SaaS software, autonomous AI agent workflows, custom full-stack web and mobile application engineering, digital marketing, local SEO optimization, PDF automation, and smart technology solutions.</p>
          
          <h2 className="font-display text-xl font-semibold text-cream !mt-8">3. User Accounts and Security</h2>
          <p>Users must provide accurate registration details. You are responsible for safeguarding your credentials and any API tokens issued by the HMorix Client Portal. Notify support@hmorix.com immediately upon noticing unauthorized account activity.</p>
          
          <h2 className="font-display text-xl font-semibold text-cream !mt-8">4. Acceptable Use Policy</h2>
          <p>You agree not to use HMorix infrastructure for malicious scraping, unlawful spam campaigns, reverse engineering proprietary LLM or BillingFlow pipelines, or interfering with system integrity.</p>
          
          <h2 className="font-display text-xl font-semibold text-cream !mt-8">5. Intellectual Property</h2>
          <p>Clients retain full ownership of their proprietary business data and content. HMorix retains all intellectual property rights to its proprietary platforms, software architectures, algorithms, and brand assets.</p>
          
          <h2 className="font-display text-xl font-semibold text-cream !mt-8">6. Payment Terms & Milestone Deliverables</h2>
          <p>Services and SaaS subscriptions are billed as specified in client contracts and invoices generated via BillingFlow. Transparent milestone billing applies to custom engineering engagements.</p>
          
          <h2 className="font-display text-xl font-semibold text-cream !mt-8">7. Service Level Agreement (SLA)</h2>
          <p>HMorix guarantees 99.99% cloud platform uptime for enterprise tier plans, backed by continuous multi-region health monitoring and automated failover.</p>
          
          <h2 className="font-display text-xl font-semibold text-cream !mt-8">8. Governing Law & Jurisdiction</h2>
          <p>These terms are governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the competent courts in Hathras, Uttar Pradesh, India.</p>
          
          <h2 className="font-display text-xl font-semibold text-cream !mt-8">9. Contact Information</h2>
          <p>For legal inquiries, contract clarification, or compliance questions, reach our legal team at legal@hmorix.com or contact our headquarters in Hathras, UP.</p>
        </div>
      </div>
    </div>
  )
}

