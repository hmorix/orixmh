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
  title: 'HMorix - Enterprise AI Software, Web Design, Mobile Apps & Digital Marketing',
  description: 'HMorix (founded by Harsh Sharma) is the leading enterprise AI software, custom web development, mobile app development, and digital marketing company in Hathras, Mathura, Vrindavan, Aligarh, Agra, and across India.',
  keywords: [
    'HMorix',
    'hmorix',
    'orix',
    'orixmh',
    'Morix',
    'HM orix',
    'Harsh Sharma',
    'Harsh Sharma Hathras',
    'best digital marketing company in hathras',
    'hathras best digital marketing company',
    'hathras web development company',
    'hathras best app development company',
    'hathras ai agent company',
    'AI development',
    'web design',
    'web development',
    'mobile app development',
    'digital marketing',
    'SEO services',
    'BillingFlow',
    'AI Agent',
    'PDF automation',
    'Hathras',
    'Mathura',
    'Vrindavan',
    'Aligarh',
    'Agra',
    'Delhi',
    'Noida',
    'Mumbai',
    'Bengaluru',
  ],
  image: 'https://hmorix.in/og-image.png',
  url: 'https://hmorix.in',
  type: 'website',
}

export function setMetaTags(config: SEOConfig) {
  const finalConfig = { ...defaultSEO, ...config }

  // Title
  document.title = finalConfig.title

  // Meta tags
  updateMetaTag('description', finalConfig.description)
  updateMetaTag('keywords', finalConfig.keywords?.join(', ') || '')
  updateMetaTag('author', finalConfig.author || 'Harsh Sharma - HMorix')

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
    updateMetaTag('article:author', finalConfig.author || 'Harsh Sharma', 'property')
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
    alternateName: ['hmorix', 'orix', 'orixmh', 'Morix', 'HM orix', 'HM Orix', 'H Morix'],
    url: 'https://hmorix.in',
    logo: 'https://hmorix.in/favicon.svg',
    description: 'Enterprise AI software, web design, mobile apps, digital marketing & smart home solutions headquartered in Hathras, Uttar Pradesh.',
    founder: {
      '@type': 'Person',
      name: 'Harsh Sharma',
      jobTitle: 'Founder & CEO',
      url: 'https://hmorix.in/harsh-sharma',
    },
    sameAs: [
      'https://github.com/HMorix',
      'https://x.com/hm_orix',
      'https://linkedin.com/company/hmorix',
      'https://instagram.com/hm_orix',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'HMorix Headquarters',
      addressLocality: 'Hathras',
      addressRegion: 'Uttar Pradesh',
      postalCode: '204101',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@hmorix.com',
      availableLanguage: ['English', 'Hindi'],
    },
  }
}

export function getSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'HMorix Cloud Platform',
    description: 'Enterprise AI platform for business automation, CRM, HRM, and BillingFlow',
    url: 'https://hmorix.in',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Android, iOS',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '2847',
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
      priceCurrency: 'INR',
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
    hathras: {
      name: 'HMorix Headquarters Hathras',
      city: 'Hathras',
      region: 'Uttar Pradesh',
      postalCode: '204101',
      latitude: 27.5946,
      longitude: 78.0526,
    },
    mathura: {
      name: 'HMorix Mathura',
      city: 'Mathura',
      region: 'Uttar Pradesh',
      postalCode: '281001',
      latitude: 27.4924,
      longitude: 77.6737,
    },
    vrindavan: {
      name: 'HMorix Vrindavan',
      city: 'Vrindavan',
      region: 'Uttar Pradesh',
      postalCode: '281121',
      latitude: 27.5806,
      longitude: 77.7006,
    },
    aligarh: {
      name: 'HMorix Aligarh',
      city: 'Aligarh',
      region: 'Uttar Pradesh',
      postalCode: '202001',
      latitude: 27.8974,
      longitude: 78.0880,
    },
    agra: {
      name: 'HMorix Agra',
      city: 'Agra',
      region: 'Uttar Pradesh',
      postalCode: '282001',
      latitude: 27.1767,
      longitude: 78.0081,
    },
    delhi: {
      name: 'HMorix Delhi NCR',
      city: 'Delhi',
      region: 'Delhi',
      postalCode: '110001',
      latitude: 28.6139,
      longitude: 77.2090,
    },
    bengaluru: {
      name: 'HMorix Bengaluru',
      city: 'Bengaluru',
      region: 'Karnataka',
      postalCode: '560001',
      latitude: 12.9716,
      longitude: 77.5946,
    },
    mumbai: {
      name: 'HMorix Mumbai',
      city: 'Mumbai',
      region: 'Maharashtra',
      postalCode: '400001',
      latitude: 19.0760,
      longitude: 72.8777,
    },
  }

  const loc = locations[location.toLowerCase()] || locations.hathras

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: loc.name,
    image: 'https://hmorix.in/og-image.png',
    description: `HMorix office in ${loc.city} - #1 AI development, custom web design, mobile apps, and digital marketing company.`,
    founder: {
      '@type': 'Person',
      name: 'Harsh Sharma',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: `HMorix ${loc.city}`,
      addressLocality: loc.city,
      addressRegion: loc.region,
      postalCode: loc.postalCode,
      addressCountry: 'IN',
    },
    geo: loc.latitude && loc.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: loc.latitude,
      longitude: loc.longitude,
    } : undefined,
    url: 'https://hmorix.in',
    telephone: '+91-XXXXXXXXXX',
    priceRange: '₹₹',
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
