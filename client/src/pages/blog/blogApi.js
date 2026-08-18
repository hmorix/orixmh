import generatedPosts from '../../generated/postsIndex.json'
import { cachedJson } from '../../lib/offlineStore'

export const fallbackPosts = mergePosts(
  generatedPosts.map((post, index) => ({ ...post, author: 'HMorix AI', readTime: post.readTime || '5 min', featured: index === 0 })),
)

export const fallbackPostsContent = {}

export function normalizePost(post) {
  const slug = post.slug || post.id
  const publishedAt = post.publishedAt || post.published_at || post.date
  return {
    ...post,
    id: post.id || slug,
    slug,
    excerpt: post.excerpt || stripHtml(post.content || '').slice(0, 160),
    author: typeof post.author === 'object' ? post.author.name : post.author,
    date: formatDate(publishedAt),
    readTime: post.readTime || post.read_time || `${post.readingTime || post.reading_time || 1} min`,
    tags: Array.isArray(post.tags) ? post.tags : [],
    featured: Boolean(post.featured),
  }
}

export async function fetchBlogList() {
  if (!shouldUseLegacyBlogApi()) return fallbackPosts
  const payload = await cachedJson('blog:list', '/api/blog')
  const data = Array.isArray(payload) ? payload : payload.data || payload.blogs || []
  return mergePosts(generatedPosts, data.filter((post) => !isSeededOrDemo(post)))
}

export async function fetchBlogPost(slug) {
  if (!shouldUseLegacyBlogApi()) throw new Error('Legacy blog API disabled')
  const payload = await cachedJson(`blog:post:${slug}`, `/api/blog/${encodeURIComponent(slug)}`)
  return normalizePostContent(payload.data || payload.blog || payload)
}

export function normalizePostContent(post) {
  const normalized = normalizePost(post)
  return {
    ...normalized,
    role: post.role || post.authorRole || post.author_role || 'HMorix Team',
    updatedDate: formatDate(post.updatedAt || post.updated_at),
    content: normalizeContent(post.content),
    seo: post.seo || {},
  }
}

function normalizeContent(content) {
  if (Array.isArray(content)) return content
  if (!content) return []
  return [{ type: 'html', text: content }]
}

function formatDate(value) {
  if (!value) return ''
  if (/^[A-Z][a-z]{2}\s/.test(String(value))) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function stripHtml(value) {
  return String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function mergePosts(...groups) {
  const seen = new Set()
  return groups.flat().map(normalizePost).filter((post) => {
    if (!post.slug || seen.has(post.slug)) return false
    seen.add(post.slug)
    return true
  }).sort((a, b) => new Date(b.publishedAt || b.date || 0) - new Date(a.publishedAt || a.date || 0))
}

function isSeededOrDemo(post) {
  const text = `${post.title || ''} ${post.excerpt || ''}`.toLowerCase()
  return text.includes('sample') || text.includes('demo') || text.includes('placeholder')
}

function shouldUseLegacyBlogApi() {
  return import.meta.env.VITE_ENABLE_LEGACY_BLOG_API === 'true'
}
