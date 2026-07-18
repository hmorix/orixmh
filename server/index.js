require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const path = require('path')
const { connectMongo } = require('./db/mongo')
const { healthSupabase } = require('./db/supabase')
const authRoutes = require('./routes/auth')
const blogRoutes = require('./routes/blogs')
const uploadRoutes = require('./routes/upload')

const app = express()
const port = Number(process.env.PORT || 5000)

app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }))
app.use(morgan('dev'))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }))
app.use('/uploads', express.static(process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads')))

function withTimeout(promise, label, ms = 5000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)),
  ])
}

app.get('/api/health', async (_req, res) => {
  const status = { api: true, mongodb: false, supabase: false }
  try { await withTimeout(connectMongo(), 'MongoDB'); status.mongodb = true } catch (error) { status.mongodbError = error.message }
  try { await withTimeout(healthSupabase(), 'Supabase'); status.supabase = true } catch (error) { status.supabaseError = error.message }
  res.json({ success: true, status, timestamp: new Date().toISOString() })
})

app.use('/api', authRoutes)
app.use('/api', blogRoutes)
app.use('/api', uploadRoutes)

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(error.status || 500).json({ error: error.message || 'Internal server error' })
})

app.listen(port, () => {
  console.log(`HMorix blog backend running on http://localhost:${port}`)
})
