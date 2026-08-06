// Shared SEO head component for generated static pages (blog posts and
// case studies). Sets document title, meta description, canonical link,
// Open Graph + Twitter Card tags, and injects JSON-LD — all client-side
// after React mounts.
//
// KNOWN LIMITATION (documented in README.md): this is fine for Googlebot
// (executes JS before indexing) but NOT for bots that only fetch raw HTML
// (Twitter/Facebook/LinkedIn/Slack preview crawlers). For real social
// preview cards, these tags need to be in server-rendered HTML instead —
// that's what scripts/render_page.py / scripts/case_study_render.py
// produce as a fallback static-HTML alternative.
import { useEffect } from 'react'

type OpenGraph = { title?: string; description?: string; type?: string; image?: string }
type TwitterCard = { card?: string; title?: string; description?: string; image?: string }

interface SEOHeadProps {
  title?: string
  description?: string
  canonicalUrl?: string
  openGraph?: OpenGraph
  twitterCard?: TwitterCard
  jsonLd?: unknown
}

function upsertMeta(attr: 'name' | 'property', key: string, content?: string) {
  if (!content) return
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export default function SEOHead({ title, description, canonicalUrl, openGraph, twitterCard, jsonLd }: SEOHeadProps) {
  useEffect(() => {
    if (title) document.title = title

    upsertMeta('name', 'description', description)

    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'canonical')
        document.head.appendChild(link)
      }
      link.setAttribute('href', canonicalUrl)
    }

    upsertMeta('property', 'og:type', openGraph?.type || 'article')
    upsertMeta('property', 'og:title', openGraph?.title || title)
    upsertMeta('property', 'og:description', openGraph?.description || description)
    upsertMeta('property', 'og:url', canonicalUrl)
    if (openGraph?.image) upsertMeta('property', 'og:image', openGraph.image)

    upsertMeta('name', 'twitter:card', twitterCard?.card || 'summary_large_image')
    upsertMeta('name', 'twitter:title', twitterCard?.title || title)
    upsertMeta('name', 'twitter:description', twitterCard?.description || description)
    if (twitterCard?.image) upsertMeta('name', 'twitter:image', twitterCard.image)

    const scriptId = 'seo-head-jsonld'
    document.getElementById(scriptId)?.remove()
    if (jsonLd) {
      const script = document.createElement('script')
      script.id = scriptId
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }
  }, [title, description, canonicalUrl, openGraph, twitterCard, jsonLd])

  return null
}
