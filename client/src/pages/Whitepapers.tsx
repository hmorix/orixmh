import { Link } from 'react-router-dom'
import { FileText, Download, Clock } from 'lucide-react'
import generatedWhitepapers from '../generated/whitepapersIndex.json'
import SEOHead from '../components/seo/SEOHead'

export default function Whitepapers() {
  const papers = generatedWhitepapers
    .filter(isPublishable)
    .map((item) => ({
      title: item.title,
      desc: item.excerpt,
      pages: Math.max(1, Math.ceil((item.wordCount || 0) / 450)),
      readTime: `${Math.max(1, Math.ceil((item.wordCount || 0) / 220))} min`,
      category: item.topic || 'Whitepaper',
      date: formatMonth(item.publishedAt),
      slug: item.slug,
      pdfGenerated: Boolean(item.pdfGenerated),
    }))

  return (
    <div className="pt-32 pb-20">
      <SEOHead
        title="HMorix Whitepapers & Research PDFs"
        description="Download HMorix whitepapers and research-backed PDF guides on AI automation, document processing, security, software architecture, and enterprise growth."
        keywords="HMorix whitepapers, AI automation whitepaper, research PDF, enterprise AI report, PDF automation guide, software architecture whitepaper"
        canonical="/whitepapers"
      />
      <div className="max-w-[1280px] mx-auto px-8">
        <span className="label-mono">Whitepapers</span>
        <h1 className="section-title mt-3 mb-6">Technical deep dives</h1>
        <p className="text-lg text-cream/60 max-w-[600px] mb-16">In-depth research and technical guides from our engineering team. Free to download.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {papers.map((p, i) => (
            <Link key={`${p.slug || p.title}-${i}`} to={`/whitepapers/${p.slug}`} className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] hover:border-[rgba(200,255,0,0.2)] transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-14 bg-[#C8FF00]/10 rounded-[4px] flex items-center justify-center flex-shrink-0">
                  <FileText size={20} className="text-[#C8FF00]" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-[#C8FF00] font-mono uppercase">{p.category}</span>
                  <h3 className="font-display font-semibold mt-1 mb-2 group-hover:text-[#C8FF00] transition-colors">{p.title}</h3>
                  <p className="text-sm text-cream/40 mb-4">{p.desc}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] text-cream/30">
                      <span>{p.pages} pages</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {p.readTime}</span>
                      <span>{p.date}</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-[#C8FF00] hover:underline">
                      <Download size={12} /> {p.pdfGenerated ? 'Open PDF page' : 'View'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {papers.length === 0 && (
          <div className="py-16 text-center text-cream/35 border border-glass-border rounded-[8px] bg-obsidian-2">
            No published whitepapers yet.
          </div>
        )}
      </div>
    </div>
  )
}

function isPublishable(item: any) {
  if (!item.slug) return false
  const text = `${item.title || ''} ${item.excerpt || ''}`.toLowerCase()
  return !['sample', 'demo', 'placeholder', '['].some((token) => text.includes(token))
}

function formatMonth(value?: string) {
  if (!value) return 'Recent'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recent'
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
