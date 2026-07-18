const fs = require('fs/promises')
const path = require('path')
const slugify = require('slugify')
const sanitizeHtml = require('sanitize-html')

const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'iframe', 'video', 'source',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'pre', 'code', 'span',
])

const allowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  '*': ['class', 'style'],
  a: ['href', 'name', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder'],
  video: ['src', 'controls', 'poster', 'width', 'height'],
  source: ['src', 'type'],
}

function cleanHtml(html) {
  return sanitizeHtml(html || '', {
    allowedTags,
    allowedAttributes,
    allowedSchemes: ['http', 'https', 'mailto', 'tel', 'data'],
  })
}

function makeSlug(value) {
  return slugify(value || 'untitled-blog', { lower: true, strict: true, trim: true })
}

function stripHtml(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function makeExcerpt(content, provided) {
  return provided || stripHtml(content).slice(0, 180)
}

function readingTime(content) {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 220))
}

async function writeJsonBackup(blog) {
  if (blog.status !== 'published') return null
  const published = new Date(blog.publishedAt || Date.now())
  const year = String(published.getFullYear())
  const month = String(published.getMonth() + 1).padStart(2, '0')
  const root = process.env.JSON_STORAGE_PATH || path.join(process.cwd(), 'storage', 'blogs')
  const dir = path.join(root, year, month)
  await fs.mkdir(dir, { recursive: true })
  const file = path.join(dir, `${blog.slug}.json`)
  await fs.writeFile(file, JSON.stringify({
    title: blog.title || '',
    slug: blog.slug || '',
    content: blog.content || '',
    author: blog.author || '',
    publishedAt: blog.publishedAt || '',
    updatedAt: blog.updatedAt || '',
    tags: blog.tags || [],
    category: blog.category || '',
    coverImage: blog.coverImage || '',
    seo: blog.seo || {},
    status: 'published',
  }, null, 2))
  return file
}

function normalizeBlogInput(body, user, existing = {}) {
  const now = new Date()
  const content = cleanHtml(body.content ?? existing.content ?? '')
  const status = body.status || existing.status || 'draft'
  const publishedAt = status === 'published'
    ? existing.publishedAt || body.publishedAt || now
    : existing.publishedAt || null

  return {
    title: body.title ?? existing.title ?? '',
    slug: makeSlug(body.slug || body.title || existing.slug),
    content,
    author: body.author || existing.author || user?.name || user?.email || 'HMorix Team',
    tags: Array.isArray(body.tags) ? body.tags : existing.tags || [],
    category: body.category ?? existing.category ?? '',
    coverImage: body.coverImage ?? existing.coverImage ?? '',
    seo: body.seo || existing.seo || {},
    excerpt: makeExcerpt(content, body.excerpt ?? existing.excerpt),
    readingTime: body.readingTime || readingTime(content),
    status,
    featured: Boolean(body.featured ?? existing.featured),
    likes: existing.likes || 0,
    bookmarks: existing.bookmarks || 0,
    comments: existing.comments || [],
    analytics: existing.analytics || { views: 0, uniqueVisitors: 0, shares: 0 },
    publishedAt,
    updatedAt: now,
    createdAt: existing.createdAt || now,
  }
}

module.exports = { cleanHtml, makeSlug, readingTime, writeJsonBackup, normalizeBlogInput }
