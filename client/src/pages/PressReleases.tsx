import { Link } from 'react-router-dom'
import { Calendar, ExternalLink } from 'lucide-react'
import generatedPress from '../generated/pressIndex.json'
import SEOHead from '../components/seo/SEOHead'

export default function PressReleases() {
  const releases = generatedPress
    .filter(isPublishable)
    .map((item) => ({
      title: item.headline,
      date: formatDate(item.publishedAt),
      category: item.category || 'Press',
      excerpt: item.excerpt,
      slug: item.slug,
    }))

  return (
    <div className="pt-32 pb-20">
      <SEOHead
        title="HMorix Press Releases & Company News"
        description="Official HMorix press releases, company announcements, product updates, media resources, and downloadable press PDFs."
        keywords="HMorix press release, HMorix news, company announcements, AI product launch, press PDF, media kit"
        canonical="/press"
        type="article"
      />
      <div className="max-w-[1280px] mx-auto px-8">
        <span className="label-mono">Press Releases</span>
        <h1 className="section-title mt-3 mb-6">Latest News</h1>
        <p className="text-lg text-cream/60 max-w-[600px] mb-16">Official announcements and press releases from HMorix.</p>

        <div className="space-y-6">
          {releases.map((r, i) => (
            <Link key={`${r.slug || r.title}-${i}`} to={`/press/${r.slug}`} className="block p-6 bg-obsidian-2 border border-glass-border rounded-[16px] hover:border-[rgba(200,255,0,0.2)] transition-all group">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-0.5 bg-[#C8FF00]/10 text-[#C8FF00] text-[10px] rounded-full font-medium">{r.category}</span>
                    <span className="flex items-center gap-1 text-xs text-cream/30"><Calendar size={12} /> {r.date}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-[#C8FF00] transition-colors">{r.title}</h3>
                  <p className="text-sm text-cream/50">{r.excerpt}</p>
                </div>
                <ExternalLink size={16} className="text-cream/20 group-hover:text-[#C8FF00] transition-colors flex-shrink-0 mt-2" />
              </div>
            </Link>
          ))}
        </div>

        {releases.length === 0 && (
          <div className="py-16 text-center text-cream/35 border border-glass-border rounded-[8px] bg-obsidian-2">
            No published press releases yet.
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-sm text-cream/40 mb-4">For media inquiries, please contact:</p>
          <a href="mailto:press@hmorix.com" className="text-[#C8FF00] hover:underline">press@hmorix.com</a>
        </div>
      </div>
    </div>
  )
}

function isPublishable(item: any) {
  if (!item.slug) return false
  const text = `${item.headline || ''} ${item.excerpt || ''}`.toLowerCase()
  return !['sample', 'demo', 'placeholder', '['].some((token) => text.includes(token))
}

function formatDate(value?: string) {
  if (!value) return 'Recent'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recent'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
