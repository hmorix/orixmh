const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs/promises')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } })

router.post('/upload', requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Image file is required' })
  const kind = req.body.kind === 'content' ? 'content' : 'cover'
  const root = process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads')
  const dir = path.join(root, 'blog', kind)
  await fs.mkdir(dir, { recursive: true })
  const baseName = req.file.originalname.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  let compressed = true
  let name = `${Date.now()}-${baseName}.webp`
  const file = path.join(dir, name)
  try {
    const sharp = require('sharp')
    await sharp(req.file.buffer).resize({ width: kind === 'cover' ? 1600 : 1200, withoutEnlargement: true }).webp({ quality: 82 }).toFile(file)
  } catch {
    compressed = false
    const ext = path.extname(req.file.originalname) || '.jpg'
    name = `${Date.now()}-${baseName}${ext}`
    await fs.writeFile(path.join(dir, name), req.file.buffer)
  }
  res.json({ success: true, url: `/uploads/blog/${kind}/${name}`, compressed })
})

module.exports = router
