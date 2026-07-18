import type { VercelRequest, VercelResponse } from '@vercel/node'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://orix-pink.vercel.app'

const staticPages = [
  { path: '', priority: 1.0, changefreq: 'weekly' },
  { path: '/about', priority: 0.8, changefreq: 'monthly' },
  { path: '/services', priority: 0.9, changefreq: 'monthly' },
  { path: '/pricing', priority: 0.9, changefreq: 'weekly' },
  { path: '/contact', priority: 0.8, changefreq: 'monthly' },
  { path: '/blog', priority: 0.8, changefreq: 'daily' },
  { path: '/case-studies', priority: 0.7, changefreq: 'monthly' },
  { path: '/whitepapers', priority: 0.7, changefreq: 'monthly' },
  { path: '/security', priority: 0.7, changefreq: 'monthly' },
  { path: '/status', priority: 0.6, changefreq: 'daily' },
  { path: '/trust', priority: 0.7, changefreq: 'monthly' },
  { path: '/compliance', priority: 0.7, changefreq: 'monthly' },
  { path: '/certifications', priority: 0.6, changefreq: 'monthly' },
  { path: '/support', priority: 0.8, changefreq: 'weekly' },
  { path: '/knowledge-base', priority: 0.8, changefreq: 'weekly' },
  { path: '/faq', priority: 0.7, changefreq: 'monthly' },
  { path: '/testimonials', priority: 0.6, changefreq: 'monthly' },
  { path: '/careers', priority: 0.7, changefreq: 'weekly' },
  { path: '/investors', priority: 0.6, changefreq: 'monthly' },
  { path: '/partners', priority: 0.6, changefreq: 'monthly' },
  { path: '/roadmap', priority: 0.7, changefreq: 'monthly' },
  { path: '/press', priority: 0.6, changefreq: 'weekly' },
  { path: '/media-kit', priority: 0.5, changefreq: 'monthly' },
  { path: '/developers', priority: 0.8, changefreq: 'monthly' },
  { path: '/architecture', priority: 0.7, changefreq: 'monthly' },
  { path: '/playground', priority: 0.8, changefreq: 'weekly' },
  { path: '/smart-home', priority: 0.7, changefreq: 'monthly' },
  
  // Products
  { path: '/billingflow', priority: 0.9, changefreq: 'weekly' },
  { path: '/billingflow/features', priority: 0.8, changefreq: 'monthly' },
  { path: '/billingflow/pricing', priority: 0.8, changefreq: 'weekly' },
  { path: '/billingflow/docs', priority: 0.8, changefreq: 'weekly' },
  { path: '/billingflow/api', priority: 0.8, changefreq: 'weekly' },
  { path: '/billingflow/demo', priority: 0.7, changefreq: 'monthly' },
  { path: '/billingflow/changelog', priority: 0.7, changefreq: 'weekly' },
  
  { path: '/agent', priority: 0.9, changefreq: 'weekly' },
  { path: '/agent/playground', priority: 0.8, changefreq: 'weekly' },
  { path: '/agent/docs', priority: 0.8, changefreq: 'weekly' },
  { path: '/agent/templates', priority: 0.7, changefreq: 'monthly' },
  { path: '/agent/workflows', priority: 0.7, changefreq: 'monthly' },
  { path: '/agent/examples', priority: 0.7, changefreq: 'monthly' },
  
  { path: '/pdf-automation', priority: 0.8, changefreq: 'monthly' },
  { path: '/pdf-automation/docs', priority: 0.8, changefreq: 'weekly' },
  { path: '/pdf-automation/demo', priority: 0.7, changefreq: 'monthly' },
  { path: '/pdf-automation/templates', priority: 0.7, changefreq: 'monthly' },
  
  // Services
  { path: '/services/web-design', priority: 0.8, changefreq: 'monthly' },
  { path: '/services/mobile-apps', priority: 0.8, changefreq: 'monthly' },
  { path: '/services/ai-solutions', priority: 0.8, changefreq: 'monthly' },
  { path: '/services/software-development', priority: 0.8, changefreq: 'monthly' },
  { path: '/services/digital-marketing', priority: 0.8, changefreq: 'monthly' },
  { path: '/services/advertising', priority: 0.7, changefreq: 'monthly' },
  { path: '/services/ecommerce', priority: 0.8, changefreq: 'monthly' },
  
  // Legal
  { path: '/privacy', priority: 0.5, changefreq: 'yearly' },
  { path: '/terms', priority: 0.5, changefreq: 'yearly' },
  { path: '/sitemap', priority: 0.5, changefreq: 'weekly' },
]

function generateSitemap(): string {
  const urls = staticPages
    .map(
      (page) => `
  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  
  const sitemap = generateSitemap()
  res.write(sitemap)
  res.end()
}
