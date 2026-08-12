import { Link } from 'react-router-dom'
import SEOHead from '../components/seo/SEOHead'
import { publicSitemapSections, type SitemapLink } from '../lib/publicSitemapLinks'

export default function Sitemap() {
  return (
    <div className="pt-32 pb-20 min-h-screen">
      <SEOHead
        title="Sitemap"
        description="Complete sitemap of HMorix.com — navigate all pages including services, products, resources, enterprise trust, company info, and account pages."
        keywords="HMorix sitemap, site map, all pages, navigation, HMorix pages"
        canonical="/sitemap"
      />
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-4">Sitemap</h1>
          <p className="text-cream/50">Complete navigation of all HMorix pages and resources.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publicSitemapSections.map((section) => (
            <div key={section.title} className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]">
              <h2 className="font-display font-semibold text-[#C8FF00] mb-4">{section.title}</h2>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.to}><SitemapAnchor link={link} /></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SitemapAnchor({ link }: { link: SitemapLink }) {
  const className = 'text-sm text-cream/50 hover:text-cream transition-colors'

  if (link.asset) {
    return <a href={link.to} className={className}>{link.label}</a>
  }

  return <Link to={link.to} className={className}>{link.label}</Link>
}
