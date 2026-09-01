import SEOHead from '../components/seo/SEOHead'

export default function HarshSharma() {
  const orgAlternateNames = [
    'HMorix', 'Hmorix', 'H Morix', 'Orixmh',
    'Orix MH', 'HM Orix', 'Morix', 'Orix'
  ]

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://hmorix.in/harsh-sharma#person',
    name: 'Harsh Sharma',
    alternateName: ['Harsh Sharma HMorix', 'Harsh Sharma Hathras'],
    jobTitle: 'Founder & CEO',
    worksFor: { '@id': 'https://hmorix.in/#organization' },
    founder: { '@id': 'https://hmorix.in/#organization' },
    image: 'https://hmorix.in/harsh-sharma.jpg',
    url: 'https://hmorix.in/harsh-sharma',
    nationality: 'Indian',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Hathras',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN'
    },
    homeLocation: {
      '@type': 'Place',
      name: 'Hathras, Uttar Pradesh, India',
      geo: { '@type': 'GeoCoordinates', latitude: 27.5946, longitude: 78.0526 }
    },
    knowsAbout: [
      'Full-Stack Web Development', 'AI Agent & LLM Systems', 'Business Automation',
      'Billing Systems & Invoicing', 'Cloud Infrastructure', 'Local SEO Domination', 'Product Strategy'
    ],
    sameAs: [
      'https://github.com/HMorix',
      'https://x.com/hm_orix',
      'https://instagram.com/hm_orix',
      'https://linkedin.com/company/hmorix'
    ],
    description:
      'Harsh Sharma is an Indian full-stack software engineer and the Founder & CEO of HMorix, based in Hathras, Uttar Pradesh, India, leading the development of enterprise AI software, BillingFlow, and custom web applications.'
  }

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://hmorix.in/#organization',
    name: 'HMorix',
    alternateName: orgAlternateNames,
    url: 'https://hmorix.in',
    logo: 'https://hmorix.in/favicon.svg',
    founder: { '@id': 'https://hmorix.in/harsh-sharma#person' },
    foundingLocation: { '@type': 'Place', name: 'Hathras, Uttar Pradesh, India' },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Hathras',
      addressRegion: 'Uttar Pradesh',
      postalCode: '204101',
      addressCountry: 'IN'
    },
    sameAs: [
      'https://github.com/HMorix',
      'https://x.com/hm_orix',
      'https://instagram.com/hm_orix',
      'https://linkedin.com/company/hmorix'
    ]
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hmorix.in' },
      { '@type': 'ListItem', position: 2, name: 'Harsh Sharma', item: 'https://hmorix.in/harsh-sharma' }
    ]
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Who is the founder of HMorix?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Harsh Sharma is the Founder and CEO of HMorix, a technology company based in Hathras, Uttar Pradesh, India, focused on AI software, automation, and digital products.'
        }
      },
      {
        '@type': 'Question',
        name: 'What does Harsh Sharma do at HMorix?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'As Founder and CEO, Harsh Sharma leads product strategy, engineering direction, and customer delivery at HMorix, building AI-powered automation, billing systems, and web platforms.'
        }
      },
      {
        '@type': 'Question',
        name: 'Where is HMorix based?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'HMorix is based in Hathras, Uttar Pradesh, India, and operates as a technology company serving clients with AI software and automation solutions.'
        }
      }
    ]
  }

  return (
    <div className="pt-32 pb-20">
      <SEOHead
        title="Harsh Sharma - Founder & CEO of HMorix | Hathras"
        description="Harsh Sharma is the Founder and CEO of HMorix, based in Hathras, Uttar Pradesh. He leads the company's work in AI software, automation, billing systems, web development, and digital products."
        keywords="Harsh Sharma, Harsh Sharma Hathras, Harsh Sharma HMorix, HMorix CEO, HMorix Founder, CEO of HMorix, Founder of HMorix"
        canonical="/harsh-sharma"
        ogImage="/harsh-sharma.jpg"
        type="profile"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-[960px] mx-auto px-8">
        <div className="grid md:grid-cols-[280px_1fr] gap-10 items-start">
          <div className="aspect-square bg-obsidian-2 border border-glass-border rounded-[8px] overflow-hidden flex items-center justify-center">
            <img
              src="/harsh-sharma.jpg"
              alt="Harsh Sharma, Founder and CEO of HMorix, Hathras, Uttar Pradesh"
              className="w-full h-full object-cover"
              onError={event => { event.currentTarget.style.display = 'none' }}
            />
            <span className="font-display text-5xl font-bold text-[#C8FF00]">HS</span>
          </div>

          <div>
            <div className="text-[#C8FF00] font-mono text-sm mb-3">Founder & CEO · HMorix</div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-5">Harsh Sharma</h1>

            <p className="text-cream/60 leading-7 mb-6">
              Harsh Sharma is the Founder and CEO of HMorix, based in Hathras, Uttar Pradesh, India.
              HMorix is a technology company focused on AI software, web development, automation,
              billing platforms, cloud systems, and digital products for businesses.
            </p>

            <h2 className="font-display text-2xl font-semibold mb-3 mt-8">What Harsh Sharma Does</h2>
            <p className="text-cream/50 leading-7 mb-6">
              His work at HMorix covers product strategy, engineering direction, customer delivery,
              and building software systems that help companies launch faster and operate more efficiently.
            </p>

            <h2 className="font-display text-2xl font-semibold mb-3 mt-8">Background</h2>
            <p className="text-cream/50 leading-7 mb-6">
              Since founding HMorix, Harsh has built the company's technical stack from the ground up —
              from AI-powered content and automation pipelines to billing infrastructure — while
              operating independently out of Hathras, Uttar Pradesh.
            </p>

            <h2 className="font-display text-2xl font-semibold mb-3 mt-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-cream/80 mb-1">Who is the founder of HMorix?</h3>
                <p className="text-cream/50 leading-7">
                  Harsh Sharma is the Founder and CEO of HMorix, based in Hathras, Uttar Pradesh, India.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-cream/80 mb-1">What does Harsh Sharma do at HMorix?</h3>
                <p className="text-cream/50 leading-7">
                  He leads product strategy, engineering, and delivery — building AI automation,
                  billing systems, and web platforms.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-cream/80 mb-1">Where is HMorix based?</h3>
                <p className="text-cream/50 leading-7">
                  HMorix is based in Hathras, Uttar Pradesh, India.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-cream/80 mb-1">Other Branches</h3>
                <p className="text-cream/50 leading-7">
                  Hathras, Kanpur, Uttar Pradesh, India.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}