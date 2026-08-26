import SEOHead from '../components/seo/SEOHead'

const NAME = 'Harsh Sharma'
const TITLE = 'Harsh Sharma - Full-Stack Developer & Founder, HMorix'
const DESCRIPTION =
  'Harsh Sharma is a self-taught full-stack developer and the Founder & CEO of HMorix, building enterprise software, AI agents, automation, web apps, and digital systems from Hathras, Uttar Pradesh.'

const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/HMorix' },
  { label: 'Twitter / X', href: 'https://x.com/hm_orix' },
  { label: 'Instagram', href: 'https://instagram.com/hm_orix' },
  { label: 'Portfolio', href: '/harsh-sharma' },
]

const CITIES = ['Hathras', 'Mathura', 'Agra', 'Aligarh', 'Vrindavan', 'Delhi', 'Bengaluru']

const SKILLS = [
  'Full-Stack Development',
  'AI Agent & Automation Engineering',
  'Web & Mobile App Development',
  'Cybersecurity Monitoring',
  'SEO & Technical Marketing',
  'E-commerce Systems',
]

const FAQS = [
  {
    q: 'Who is Harsh Sharma?',
    a: 'Harsh Sharma is a self-taught full-stack developer from Hathras, Uttar Pradesh, and the Founder & CEO of HMorix.',
  },
  {
    q: 'Is Harsh Sharma a developer?',
    a: 'Yes. Harsh Sharma builds full-stack web and mobile applications, AI-driven automation tools, SEO systems, and product infrastructure at HMorix.',
  },
  {
    q: 'Where is Harsh Sharma based?',
    a: 'Harsh Sharma is based in Hathras, Uttar Pradesh, India, and works with clients across nearby cities and major Indian business hubs.',
  },
  {
    q: 'What company does Harsh Sharma run?',
    a: 'Harsh Sharma founded and leads HMorix, a technology company focused on custom software, AI agents, automation, and digital transformation.',
  },
]

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: NAME,
  alternateName: ['Harsh', 'hm_orix', 'Harsha Sharma'],
  jobTitle: 'Full-Stack Developer & Founder',
  description: DESCRIPTION,
  url: 'https://hmorix.in/harsh-sharma-developer',
  image: 'https://hmorix.in/harsh-sharma.jpg',
  worksFor: {
    '@type': 'Organization',
    name: 'HMorix',
    url: 'https://hmorix.in',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Hathras',
    addressRegion: 'Uttar Pradesh',
    addressCountry: 'IN',
  },
  knowsAbout: SKILLS,
  knowsLanguage: ['Hindi', 'English'],
  sameAs: SOCIAL_LINKS.filter((link) => link.href.startsWith('https://')).map((link) => link.href),
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

export default function HarshSharmaDeveloper() {
  return (
    <>
      <SEOHead
        title={TITLE}
        description={DESCRIPTION}
        keywords="Harsh Sharma developer, HMorix founder, full-stack developer Hathras, Harsh Sharma HMorix"
        canonical="/harsh-sharma-developer"
        type="profile"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="pt-32 pb-20 min-h-screen">
        <div className="max-w-[900px] mx-auto px-8">
          <section className="pb-14">
            <p className="text-xs tracking-[0.2em] uppercase text-[#C8FF00] mb-4">
              Full-Stack Developer - Founder, HMorix
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">{NAME}</h1>
            <p className="text-lg text-cream/60 leading-relaxed max-w-[720px]">{DESCRIPTION}</p>

            <div className="flex flex-wrap gap-3 mt-8">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  rel={link.href.startsWith('https://') ? 'me noopener noreferrer' : undefined}
                  target={link.href.startsWith('https://') ? '_blank' : undefined}
                  className="text-sm border border-glass-border rounded-[4px] px-4 py-2 text-cream/60 hover:border-[#C8FF00] hover:text-[#C8FF00] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </section>

          <div className="h-px bg-glass-border" />

          <section className="py-14">
            <h2 className="font-display text-2xl font-bold mb-6">What Harsh Sharma builds</h2>
            <ul className="grid sm:grid-cols-2 gap-4">
              {SKILLS.map((skill) => (
                <li key={skill} className="border border-glass-border rounded-[8px] px-4 py-3 text-sm text-cream/70 bg-obsidian-2">
                  {skill}
                </li>
              ))}
            </ul>
          </section>

          <div className="h-px bg-glass-border" />

          <section className="py-14">
            <h2 className="font-display text-2xl font-bold mb-4">Based in Hathras, serving the wider region</h2>
            <p className="text-cream/50 leading-relaxed mb-6">
              HMorix is headquartered in Hathras, Uttar Pradesh, with services for nearby cities and larger business markets.
            </p>
            <div className="flex flex-wrap gap-2">
              {CITIES.map((city) => (
                <span key={city} className="text-xs uppercase tracking-wide text-[#C8FF00] border border-glass-border rounded-[4px] px-3 py-1">
                  {city}
                </span>
              ))}
            </div>
          </section>

          <div className="h-px bg-glass-border" />

          <section className="py-14">
            <h2 className="font-display text-2xl font-bold mb-8">Frequently asked</h2>
            <div className="space-y-8">
              {FAQS.map((item) => (
                <div key={item.q}>
                  <h3 className="text-base font-medium mb-2">{item.q}</h3>
                  <p className="text-sm text-cream/50 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="pt-4">
            <div className="h-px bg-glass-border mb-10" />
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="/harsh-sharma" className="text-[#C8FF00] hover:underline">About Harsh Sharma</a>
              <a href="/about" className="text-[#C8FF00] hover:underline">About HMorix</a>
              <a href="/services" className="text-[#C8FF00] hover:underline">HMorix Services</a>
              <a href="/contact" className="text-[#C8FF00] hover:underline">Contact</a>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
