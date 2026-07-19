import SEOHead from '../components/seo/SEOHead'

export default function HarshSharma() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Harsh Sharma',
    jobTitle: 'CEO',
    worksFor: { '@type': 'Organization', name: 'HMorix' },
    image: 'https://orixmh.vercel.app/harsh-sharma.jpg',
    url: 'https://orixmh.vercel.app/harsh-sharma',
    description: 'Harsh Sharma is the CEO of HMorix, leading the company in AI software, web development, automation, billing systems, and digital products.',
  }

  return (
    <div className="pt-32 pb-20">
      <SEOHead title="Harsh Sharma - CEO of HMorix" description="Harsh Sharma is the CEO of HMorix, leading AI software, automation, billing systems, web development, and digital product initiatives." keywords="Harsh Sharma, HMorix CEO, CEO of HMorix, Harsh Sharma HMorix, AI software company founder" canonical="/harsh-sharma" ogImage="/harsh-sharma.jpg" type="profile" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="max-w-[960px] mx-auto px-8">
        <div className="grid md:grid-cols-[280px_1fr] gap-10 items-start">
          <div className="aspect-square bg-obsidian-2 border border-glass-border rounded-[8px] overflow-hidden flex items-center justify-center">
            <img src="/harsh-sharma.jpg" alt="Harsh Sharma, CEO of HMorix" className="w-full h-full object-cover" onError={event => { event.currentTarget.style.display = 'none' }} />
            <span className="font-display text-5xl font-bold text-[#C8FF00]">HS</span>
          </div>
          <div>
            <div className="text-[#C8FF00] font-mono text-sm mb-3">CEO · HMorix</div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-5">Harsh Sharma</h1>
            <p className="text-cream/60 leading-7 mb-6">Harsh Sharma is the CEO of HMorix, a technology company focused on AI software, web development, automation, billing platforms, cloud systems, and digital products for businesses.</p>
            <p className="text-cream/50 leading-7">His work at HMorix covers product strategy, engineering direction, customer delivery, and building software systems that help companies launch faster and operate more efficiently.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
