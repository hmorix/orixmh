import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import generatedCaseStudies from '../generated/caseStudiesIndex.json'
import SEOHead from '../components/seo/SEOHead'

export default function CaseStudies() {
  const cases = generatedCaseStudies
    .filter(isPublishable)
    .map((item) => ({
      title: item.title,
      client: item.clientName || 'HMorix',
      industry: item.industry || 'Technology',
      product: 'Case Study',
      result: `${item.wordCount || 0} words`,
      image: 'linear-gradient(135deg, #10231f 0%, #C8FF0020 100%)',
      slug: item.slug,
    }))

  return (
    <div className="pt-32 pb-20">
      <SEOHead
        title="HMorix Case Studies & Client Results"
        description="Explore HMorix case studies showing AI automation, web development, e-commerce, PDF automation, and enterprise software results."
        keywords="HMorix case studies, client results, AI automation case study, software development case study, ecommerce case study, business automation results"
        canonical="/case-studies"
      />
      <div className="max-w-[1280px] mx-auto px-8">
        <span className="label-mono">Case Studies</span>
        <h1 className="section-title mt-3 mb-6">Real results from real companies</h1>
        <p className="text-lg text-cream/60 max-w-[600px] mb-16">See how enterprise companies use HMorix to transform their operations, reduce costs, and accelerate growth.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <Link key={`${c.slug || c.title}-${i}`} to={`/case-studies/${c.slug}`} className="group bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden hover:border-[rgba(200,255,0,0.2)] transition-all">
              <div className="h-40 relative" style={{background: c.image}}>
                <div className="absolute top-4 left-4">
                  <span className="px-2 py-1 bg-black/40 backdrop-blur-sm text-[10px] text-cream/80 rounded-full">{c.product}</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-cream/40">{c.client}</span>
                  <span className="text-cream/20">·</span>
                  <span className="text-xs text-cream/40">{c.industry}</span>
                </div>
                <h3 className="font-display font-semibold text-sm mb-3 group-hover:text-[#C8FF00] transition-colors">{c.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#C8FF00]">{c.result}</span>
                  <ArrowRight size={14} className="text-cream/30 group-hover:text-[#C8FF00] transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {cases.length === 0 && (
          <div className="py-16 text-center text-cream/35 border border-glass-border rounded-[8px] bg-obsidian-2">
            No published case studies yet.
          </div>
        )}

        <div className="mt-16 p-8 bg-obsidian-2 border border-glass-border rounded-[16px] text-center">
          <h3 className="font-display text-xl font-bold mb-3">Want to be our next success story?</h3>
          <p className="text-sm text-cream/50 mb-6">Join 120+ enterprise companies already using HMorix.</p>
          <Link to="/contact" className="btn-primary inline-flex">Start Your Journey</Link>
        </div>
      </div>
    </div>
  )
}

function isPublishable(item: any) {
  if (!item.slug || item.isDemo) return false
  const text = `${item.title || ''} ${item.excerpt || ''} ${item.clientName || ''}`.toLowerCase()
  return !['sample', 'demo', 'placeholder', '['].some((token) => text.includes(token))
}
