import { Link } from 'react-router-dom'
import SEOHead from '../../components/seo/SEOHead'

export default function Privacy() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': 'https://hmorix.in/privacy#webpage',
        url: 'https://hmorix.in/privacy',
        name: 'HMorix Privacy Policy & Data Protection',
        description: 'Learn how HMorix protects your personal data, complies with the DPDP Act & GDPR, and secures enterprise cloud assets.',
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
        '@id': 'https://hmorix.in/privacy#breadcrumbs',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hmorix.in' },
          { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: 'https://hmorix.in/privacy' }
        ]
      }
    ]
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <SEOHead
        title="Privacy Policy & Data Security | HMorix"
        description="HMorix Privacy Policy — learn how we protect your personal and business data. Compliant with India DPDP Act 2023, GDPR, and ISO/IEC 27001 standards."
        keywords="HMorix privacy policy, data security, DPDP Act 2023, GDPR compliance, enterprise data privacy, Harsh Sharma HMorix, Hathras cloud security"
        canonical="/privacy"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="max-w-[800px] mx-auto px-8">
        <nav className="flex items-center gap-2 text-[11px] text-cream/40 font-mono mb-6">
          <Link to="/" className="hover:text-[#C8FF00]">Home</Link>
          <span>/</span>
          <span className="text-[#C8FF00]">Privacy Policy</span>
        </nav>

        <h1 className="font-display text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-xs text-cream/40 font-mono mb-8">Effective Date: January 1, 2026 · HMorix Data Protection Office, Hathras UP</p>

        <div className="prose prose-invert max-w-none space-y-6 text-cream/60 text-sm leading-relaxed">
          <h2 className="font-display text-xl font-semibold text-cream !mt-8">1. Commitment to Data Privacy</h2>
          <p>HMorix ("we", "our", or "us"), founded by Harsh Sharma and headquartered in Hathras, Uttar Pradesh, is committed to safeguarding the privacy and confidentiality of our clients, developers, and platform users worldwide.</p>
          
          <h2 className="font-display text-xl font-semibold text-cream !mt-8">2. Information We Collect</h2>
          <p>We collect information necessary to deliver high-performance enterprise services: (a) account registration data (name, email, organization), (b) transaction details processed securely via BillingFlow, (c) telemetry data (IP address, browser type, API request logs), and (d) AI Agent query context strictly for real-time task execution.</p>
          
          <h2 className="font-display text-xl font-semibold text-cream !mt-8">3. AI Data Retention & Zero-Training Policy</h2>
          <p>We enforce a strict Zero Data Retention policy for LLM training. Customer queries processed through HMorix AI Agent and BillingFlow are never used to train external commercial AI foundation models.</p>
          
          <h2 className="font-display text-xl font-semibold text-cream !mt-8">4. Data Protection Standards & Encryption</h2>
          <p>All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. We utilize signed HTTP-only session cookies and role-based access control (RBAC) to ensure total data isolation between client organizations.</p>
          
          <h2 className="font-display text-xl font-semibold text-cream !mt-8">5. Compliance with DPDP Act & GDPR</h2>
          <p>Under the Digital Personal Data Protection Act 2023 (India) and GDPR (EU), you have the right to access, rectify, port, or request permanent deletion of your personal data at any time via your Client Portal or by contacting our Data Protection Officer.</p>
          
          <h2 className="font-display text-xl font-semibold text-cream !mt-8">6. Cookies & Tracking Technologies</h2>
          <p>We use essential cookies strictly for secure session management and authentication. No intrusive third-party cross-site tracking scripts are loaded on authenticated user dashboards.</p>
          
          <h2 className="font-display text-xl font-semibold text-cream !mt-8">7. Contact the Data Protection Officer</h2>
          <p>For data access requests, deletion requests, or privacy compliance questions, contact our Data Protection Officer at privacy@hmorix.com or visit HMorix Headquarters in Hathras, Uttar Pradesh.</p>
        </div>
      </div>
    </div>
  )
}

