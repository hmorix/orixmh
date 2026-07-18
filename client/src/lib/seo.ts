/**
 * SEO Utilities for HMorix Platform
 * Handles meta tags, structured data, and SEO optimization
 */

export interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  author?: string
  publishedDate?: string
  modifiedDate?: string
  canonicalUrl?: string
}

export const defaultSEO: SEOConfig = {
  title: 'HMorix - Enterprise AI Software, Web Design & Development',
  description: 'HMorix provides enterprise AI solutions, web design, mobile apps, digital marketing, and smart home solutions for businesses in Delhi, Bengaluru, Mumbai, and across India.',
  keywords: [
    'HMorix',
    'AI development',
    'AI integration',
    'web design',
    'web development',
    'mobile app development',
    'digital marketing',
    'SEO services',
    'BillingFlow',
    'AI Agent',
    'PDF automation',
    'smart home solutions',
    'Delhi',
    'Bengaluru',
    'Mumbai',
    'Mathura',
    'Agra',
    'Aligarh',
  ],
  image: 'https://orix-pink.vercel.app/og-image.png',
  url: 'https://orix-pink.vercel.app',
  type: 'website',
}

export function setMetaTags(config: SEOConfig) {
  const finalConfig = { ...defaultSEO, ...config }

  // Title
  document.title = finalConfig.title

  // Meta tags
  updateMetaTag('description', finalConfig.description)
  updateMetaTag('keywords', finalConfig.keywords?.join(', ') || '')
  updateMetaTag('author', finalConfig.author || 'HMorix')

  // Open Graph
  updateMetaTag('og:title', finalConfig.title, 'property')
  updateMetaTag('og:description', finalConfig.description, 'property')
  updateMetaTag('og:image', finalConfig.image || '', 'property')
  updateMetaTag('og:url', finalConfig.url || '', 'property')
  updateMetaTag('og:type', finalConfig.type || 'website', 'property')

  // Twitter Card
  updateMetaTag('twitter:card', 'summary_large_image', 'name')
  updateMetaTag('twitter:title', finalConfig.title, 'name')
  updateMetaTag('twitter:description', finalConfig.description, 'name')
  updateMetaTag('twitter:image', finalConfig.image || '', 'name')
  updateMetaTag('twitter:site', '@hmorix', 'name')

  // Canonical URL
  if (finalConfig.canonicalUrl) {
    updateCanonicalUrl(finalConfig.canonicalUrl)
  }

  // Article-specific tags
  if (finalConfig.type === 'article') {
    if (finalConfig.publishedDate) {
      updateMetaTag('article:published_time', finalConfig.publishedDate, 'property')
    }
    if (finalConfig.modifiedDate) {
      updateMetaTag('article:modified_time', finalConfig.modifiedDate, 'property')
    }
    updateMetaTag('article:author', finalConfig.author || 'HMorix', 'property')
  }
}

function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  if (!content) return

  let tag = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, name)
    document.head.appendChild(tag)
  }
  tag.content = content
}

function updateCanonicalUrl(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = url
}

// Structured Data (JSON-LD)
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'HMorix',
    url: 'https://orix-pink.vercel.app',
    logo: 'https://orix-pink.vercel.app/logo.png',
    description: 'Enterprise AI software, web design, mobile apps, digital marketing & smart home solutions',
    sameAs: [
      'https://twitter.com/hmorix',
      'https://linkedin.com/company/hmorix',
      'https://github.com/hmorix',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'HMorix Headquarters',
      addressLocality: 'Delhi',
      addressRegion: 'Delhi',
      postalCode: '110001',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@hmorix.com',
      telephone: '+91-XXXXXXXXXX',
    },
  }
}

export function getSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'HMorix Platform',
    description: 'Enterprise AI platform for business automation',
    url: 'https://orix-pink.vercel.app',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
  }
}

export function getProductSchema(product: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: 'HMorix',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: product.rating && {
      '@type': 'AggregateRating',
      ratingValue: product.rating.value,
      ratingCount: product.rating.count,
    },
  }
}

export function getLocalBusinessSchema(location: string) {
  const locations: Record<string, any> = {
    delhi: {
      name: 'HMorix Delhi',
      city: 'Delhi',
      region: 'Delhi',
      postalCode: '110001',
    },
    bengaluru: {
      name: 'HMorix Bengaluru',
      city: 'Bengaluru',
      region: 'Karnataka',
      postalCode: '560001',
    },
    mumbai: {
      name: 'HMorix Mumbai',
      city: 'Mumbai',
      region: 'Maharashtra',
      postalCode: '400001',
    },
    mathura: {
      name: 'HMorix Mathura',
      city: 'Mathura',
      region: 'Uttar Pradesh',
      postalCode: '281001',
    },
    agra: {
      name: 'HMorix Agra',
      city: 'Agra',
      region: 'Uttar Pradesh',
      postalCode: '282001',
    },
    aligarh: {
      name: 'HMorix Aligarh',
      city: 'Aligarh',
      region: 'Uttar Pradesh',
      postalCode: '202001',
    },
  }

  const loc = locations[location.toLowerCase()] || locations.delhi

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: loc.name,
    image: 'https://orix-pink.vercel.app/logo.png',
    description: `HMorix office in ${loc.city} - AI development, web design, and digital solutions`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `HMorix ${loc.city}`,
      addressLocality: loc.city,
      addressRegion: loc.region,
      postalCode: loc.postalCode,
      addressCountry: 'IN',
    },
    url: 'https://orix-pink.vercel.app',
    telephone: '+91-XXXXXXXXXX',
    priceRange: '₹₹₹',
  }
}

export function addStructuredData(schema: any) {
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(schema)
  document.head.appendChild(script)
}

export default {
  setMetaTags,
  getOrganizationSchema,
  getSoftwareApplicationSchema,
  getProductSchema,
  getLocalBusinessSchema,
  addStructuredData,
}
