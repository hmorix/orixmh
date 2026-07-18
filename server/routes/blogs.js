const express = require('express')
const { ObjectId, blogCollection } = require('../db/mongo')
const { requireAdmin } = require('../middleware/auth')
const { normalizeBlogInput, writeJsonBackup } = require('../utils/blog')

const router = express.Router()

async function listBlogs(req, res) {
  const { search = '', category = '', tag = '', page = '1', limit = '12', status = 'published' } = req.query
  const pageNum = Math.max(1, Number(page))
  const limitNum = Math.max(1, Number(limit))
  const query = {}
  if (status !== 'all') query.status = status
  if (category) query.category = category
  if (tag) query.tags = tag
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ]
  }

  const collection = await blogCollection()
  const [blogs, total] = await Promise.all([
    collection.find(query).sort({ publishedAt: -1, createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).toArray(),
    collection.countDocuments(query),
  ])
  res.json({ success: true, data: blogs, total, page: pageNum, pages: Math.ceil(total / limitNum) })
}

router.get('/blogs', listBlogs)
router.get('/blog', listBlogs)

router.get('/blog/:slug', async (req, res) => {
  const collection = await blogCollection()
  const blog = await collection.findOne({ slug: req.params.slug })
  if (!blog) return res.status(404).json({ error: 'Blog not found' })
  await collection.updateOne({ slug: req.params.slug }, { $inc: { 'analytics.views': 1 } })
  res.json({ success: true, data: blog })
})

router.post('/blog', requireAdmin, async (req, res) => {
  const collection = await blogCollection()
  const blog = normalizeBlogInput(req.body, req.user)
  const result = await collection.insertOne(blog)
  const saved = { ...blog, _id: result.insertedId }
  const backupPath = await writeJsonBackup(saved)
  res.status(201).json({ success: true, data: saved, backupPath })
})

router.put('/blog/:id', requireAdmin, async (req, res) => {
  const collection = await blogCollection()
  const filter = ObjectId.isValid(req.params.id) ? { _id: new ObjectId(req.params.id) } : { slug: req.params.id }
  const existing = await collection.findOne(filter)
  if (!existing) return res.status(404).json({ error: 'Blog not found' })
  const blog = normalizeBlogInput(req.body, req.user, existing)
  await collection.updateOne(filter, { $set: blog })
  const saved = await collection.findOne({ slug: blog.slug })
  const backupPath = await writeJsonBackup(saved)
  res.json({ success: true, data: saved, backupPath })
})

router.delete('/blog/:id', requireAdmin, async (req, res) => {
  const collection = await blogCollection()
  const filter = ObjectId.isValid(req.params.id) ? { _id: new ObjectId(req.params.id) } : { slug: req.params.id }
  await collection.deleteOne(filter)
  res.json({ success: true })
})

router.get('/categories', async (_req, res) => {
  const collection = await blogCollection()
  const data = await collection.distinct('category', { status: 'published' })
  res.json({ success: true, data: data.filter(Boolean).sort() })
})

router.get('/tags', async (_req, res) => {
  const collection = await blogCollection()
  const data = await collection.distinct('tags', { status: 'published' })
  res.json({ success: true, data: data.flat().filter(Boolean).sort() })
})

module.exports = router
