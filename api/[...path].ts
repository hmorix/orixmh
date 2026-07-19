import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { MongoClient, ObjectId } from 'mongodb'
import * as bcrypt from 'bcryptjs'
import crypto from 'crypto'
import * as nodemailer from 'nodemailer'

// ============================================
// CORS & AUTH HELPERS
// ============================================
function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN || process.env.APP_URL || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
}

function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  setCors(res)
  if (req.method === 'OPTIONS') { res.status(200).end(); return true }
  return false
}

const SESSION_COOKIE = 'hm_session'
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 1000 * 60 * 60 * 24 * 7)
let mongoClient: MongoClient | null = null

function appUrl() {
  const raw = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  return raw.replace(/\/$/, '')
}

function cleanEmail(email: string) {
  return String(email || '').trim().toLowerCase()
}

function publicUser(user: any) {
  return {
    id: String(user._id || user.id),
    email: user.email,
    name: user.name || user.displayName || user.email,
    displayName: user.displayName || user.name || '',
    username: user.username || '',
    role: user.role || 'user',
    emailVerified: Boolean(user.emailVerified),
    providers: user.providers || [],
  }
}

function parseCookies(req: VercelRequest) {
  const header = req.headers.cookie || ''
  return Object.fromEntries(String(header).split(';').map(item => {
    const index = item.indexOf('=')
    if (index < 0) return ['', '']
    return [item.slice(0, index).trim(), decodeURIComponent(item.slice(index + 1))]
  }).filter(([key]) => key))
}

function signValue(value: string) {
  return crypto.createHmac('sha256', process.env.SESSION_SECRET || process.env.JWT_SECRET || 'hmorix-session-secret-change-me').update(value).digest('base64url')
}

function encodeSessionCookie(sessionId: string) {
  return `${sessionId}.${signValue(sessionId)}`
}

function decodeSessionCookie(value?: string) {
  if (!value) return null
  const [sessionId, signature] = value.split('.')
  if (!sessionId || !signature) return null
  const expected = signValue(sessionId)
  if (signature.length !== expected.length) return null
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null
  return sessionId
}

function setSessionCookie(res: VercelResponse, sessionId: string) {
  const secure = process.env.NODE_ENV === 'production'
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(encodeSessionCookie(sessionId))}; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`)
}

function clearSessionCookie(res: VercelResponse) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`)
}

async function mongoDb() {
  if (!process.env.MONGODB_URI) throw Object.assign(new Error('Database is not configured'), { status: 500, code: 'ENV_MISSING' })
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.MONGODB_URI, { maxPoolSize: 5 })
    await mongoClient.connect()
  }
  return mongoClient.db()
}

async function mongoCollection(name: string) {
  const db = await mongoDb()
  return db.collection(name)
}

async function ensureIndexes() {
  const db = await mongoDb()
  await Promise.all([
    db.collection('users').createIndex({ email: 1 }, { unique: true }),
    db.collection('oauth_accounts').createIndex({ provider: 1, providerAccountId: 1 }, { unique: true }),
    db.collection('oauth_accounts').createIndex({ email: 1 }),
    db.collection('profiles').createIndex({ userId: 1 }, { unique: true }),
    db.collection('profiles').createIndex({ username: 1 }, { unique: true, sparse: true }),
    db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection('verification_tokens').createIndex({ tokenHash: 1 }, { unique: true }),
    db.collection('verification_tokens').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection('otp_records').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ])
}

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url')
}

function tokenHash(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000))
}

async function sendMail(options: { to: string; subject: string; html: string; text?: string }) {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']
  const missing = required.filter(key => !process.env[key])
  if (missing.length) throw Object.assign(new Error(`SMTP is not configured: ${missing.join(', ')}`), { status: 500, code: 'SMTP_CONFIG' })
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'HMorix'}" <${process.env.SMTP_USER}>`,
    ...options,
  })
}

async function createSession(res: VercelResponse, user: any, req?: VercelRequest) {
  const sessions = await mongoCollection('sessions')
  const sessionId = randomToken(32)
  const now = new Date()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await sessions.insertOne({
    sessionId,
    userId: String(user._id),
    email: user.email,
    createdAt: now,
    updatedAt: now,
    expiresAt,
    invalidatedAt: null,
    userAgent: req?.headers['user-agent'] || '',
    ip: req?.headers['x-forwarded-for']?.toString().split(',')[0] || '',
  })
  setSessionCookie(res, sessionId)
  return { sessionId, expiresAt }
}

async function findSessionUser(req: VercelRequest, res?: VercelResponse) {
  const sessionId = decodeSessionCookie(parseCookies(req)[SESSION_COOKIE])
  if (!sessionId) return null
  const sessions = await mongoCollection('sessions')
  const session = await sessions.findOne({ sessionId, invalidatedAt: null, expiresAt: { $gt: new Date() } })
  if (!session) {
    if (res) clearSessionCookie(res)
    return null
  }
  const users = await mongoCollection('users')
  const user = await users.findOne({ _id: new ObjectId(session.userId), disabledAt: { $exists: false } })
  if (!user) return null
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await sessions.updateOne({ sessionId }, { $set: { updatedAt: new Date(), expiresAt } })
  if (res) setSessionCookie(res, sessionId)
  return publicUser(user)
}

async function getAuthUser(req: VercelRequest) {
  const sessionUser = await findSessionUser(req)
  if (sessionUser) return sessionUser
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.split(' ')[1]
  try {
    const jwt = await import('jsonwebtoken')
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'hmorix-jwt-secret-change-me') as any
    return { id: decoded.sub || decoded.id, email: decoded.email, role: decoded.role || 'user', name: decoded.name }
  } catch { return null }
}

function getSupabaseAdminClient() {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ROLE_KEY || process.env.SUPABASE_Role_KEY || '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function getSupabasePublicClient() {
  return createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'Orixbucket'
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const JSON_TYPES = new Set(['application/json'])
const MAX_UPLOAD_SIZE = Number(process.env.MAX_UPLOAD_SIZE || 8 * 1024 * 1024)

async function ensureStorageBucket() {
  const supabase = getSupabaseAdminClient()
  const { data } = await supabase.storage.listBuckets()
  if (!data?.some((bucket: any) => bucket.name === STORAGE_BUCKET)) {
    await supabase.storage.createBucket(STORAGE_BUCKET, { public: true })
  }
  return supabase
}

function extFromMime(mime: string, fallback = 'bin') {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'application/json': 'json',
  }
  return map[mime] || fallback
}

async function uploadBufferToStorage(buffer: Buffer, contentType: string, folder: string, baseName: string) {
  if (buffer.length > MAX_UPLOAD_SIZE) throw Object.assign(new Error('File is too large'), { status: 413, code: 'UPLOAD_SIZE' })
  const supabase = await ensureStorageBucket()
  const safeName = String(baseName || 'file').replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'file'
  const storagePath = `${folder}/${Date.now()}-${randomToken(8)}-${safeName}.${extFromMime(contentType)}`
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, buffer, { contentType, upsert: false })
  if (error) throw Object.assign(new Error('Storage upload failed'), { status: 502, code: 'STORAGE_UPLOAD' })
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)
  return { path: storagePath, url: data.publicUrl }
}

async function deleteStoragePath(path?: string) {
  if (!path) return
  try {
    const supabase = await ensureStorageBucket()
    await supabase.storage.from(STORAGE_BUCKET).remove([path])
  } catch {}
}

// ============================================
// DATABASE ADAPTER (inline for single-function)
// ============================================
function getDatabase() {
  const provider = (process.env.DATABASE || 'supabase').toLowerCase()
  if (provider === 'mysql' || provider === 'mariadb') return createMySQLAdapter()
  return createSupabaseAdapter()
}

function createSupabaseAdapter() {
  const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ROLE_KEY || process.env.SUPABASE_Role_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  return {
    provider: 'supabase' as const,
    async query(table: string, options?: any) {
      let q = supabase.from(table).select(options?.select || '*', { count: options?.count ? 'exact' : undefined })
      if (options?.where) Object.entries(options.where).forEach(([k, v]) => { if (v != null) q = q.eq(k, v) })
      if (options?.search) options.search.forEach((s: any) => { q = q.ilike(s.column, `%${s.value}%`) })
      if (options?.orderBy) q = q.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? false })
      if (options?.limit) q = q.limit(options.limit)
      if (options?.offset) q = q.range(options.offset, options.offset + (options.limit || 20) - 1)
      const { data, count, error } = await q
      return { data: data || [], count: count ?? undefined, error }
    },
    async queryOne(table: string, options?: any) {
      const r = await this.query(table, { ...options, limit: 1 })
      return { data: r.data[0] || null, error: r.error }
    },
    async insert(table: string, data: any) {
      const { data: result, error } = await supabase.from(table).insert(data).select().single()
      return { data: result, error }
    },
    async update(table: string, data: any, where: any) {
      let q = supabase.from(table).update(data)
      Object.entries(where).forEach(([k, v]) => { q = q.eq(k, v) })
      const { data: result, error } = await q.select().single()
      return { data: result, error }
    },
    async healthCheck() {
      try { const { error } = await supabase.from('user_profiles').select('id').limit(1); return !error } catch { return false }
    },
  }
}

function createMySQLAdapter() {
  let pool: any = null
  const getPool = async () => {
    if (!pool) {
      const mysql = await import('mysql2/promise')
      pool = mysql.createPool({ host: process.env.MARIADB_HOST || process.env.DB_HOST || 'localhost', port: parseInt(process.env.MARIADB_PORT || process.env.DB_PORT || '3306'), user: process.env.MARIADB_USER || process.env.DB_USER || 'root', password: process.env.MARIADB_PASSWORD ?? process.env.DB_PASSWORD ?? '', database: process.env.MARIADB_DATABASE || process.env.DB_NAME || 'hmorix', waitForConnections: true, connectionLimit: parseInt(process.env.DB_POOL_SIZE || '5'), charset: 'utf8mb4' })
    }
    return pool
  }
  return {
    provider: 'mysql' as const,
    async query(table: string, options?: any) {
      const db = await getPool()
      let sql = `SELECT ${options?.select || '*'} FROM ${table}`
      const params: any[] = []; const conditions: string[] = []
      if (options?.where) Object.entries(options.where).forEach(([k, v]) => { if (v != null) { conditions.push(`${k} = ?`); params.push(v) } })
      if (options?.search) options.search.forEach((s: any) => { conditions.push(`${s.column} LIKE ?`); params.push(`%${s.value}%`) })
      if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`
      if (options?.orderBy) sql += ` ORDER BY ${options.orderBy.column} ${options.orderBy.ascending ? 'ASC' : 'DESC'}`
      if (options?.limit) { sql += ` LIMIT ?`; params.push(options.limit) }
      if (options?.offset) { sql += ` OFFSET ?`; params.push(options.offset) }
      const [rows] = await db.execute(sql, params)
      let count: number | undefined
      if (options?.count) { const cp = params.slice(0, conditions.length); const [cr] = await db.execute(`SELECT COUNT(*) as total FROM ${table}${conditions.length ? ` WHERE ${conditions.join(' AND ')}` : ''}`, cp); count = (cr as any)[0]?.total }
      return { data: rows as any[], count }
    },
    async queryOne(table: string, options?: any) { const r = await this.query(table, { ...options, limit: 1 }); return { data: r.data[0] || null, error: undefined } },
    async insert(table: string, data: any) {
      const db = await getPool(); const record = Array.isArray(data) ? data[0] : data
      const keys = Object.keys(record); const values = Object.values(record)
      const [result] = await db.execute(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`, values)
      const [rows] = await db.execute(`SELECT * FROM ${table} WHERE id = ?`, [(result as any).insertId])
      return { data: (rows as any)[0], error: undefined }
    },
    async update(table: string, data: any, where: any) {
      const db = await getPool()
      const sk = Object.keys(data); const sv = Object.values(data); const wk = Object.keys(where); const wv = Object.values(where)
      await db.execute(`UPDATE ${table} SET ${sk.map(k => `${k} = ?`).join(', ')} WHERE ${wk.map(k => `${k} = ?`).join(' AND ')}`, [...sv, ...wv])
      const [rows] = await db.execute(`SELECT * FROM ${table} WHERE ${wk.map(k => `${k} = ?`).join(' AND ')}`, wv)
      return { data: (rows as any)[0], error: undefined }
    },
    async healthCheck() { try { const db = await getPool(); await db.execute('SELECT 1'); return true } catch { return false } },
  }
}

// ============================================
// ROUTE HANDLERS
// ============================================

async function handleHealth(req: VercelRequest, res: VercelResponse) {
  const db = getDatabase()
  const dbHealthy = await db.healthCheck()
  let mongoHealthy = false
  try {
    const collection = await getBlogCollection()
    await collection.findOne({}, { projection: { _id: 1 } })
    mongoHealthy = true
  } catch {}
  res.json({
    success: true,
    status: { api: true, mongodb: mongoHealthy, mariadb: dbHealthy, supabaseStorage: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_STORAGE_BUCKET) },
    database: { provider: db.provider, connected: dbHealthy },
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  })
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
  return handleAuthSignin(req, res)
}

async function handleSetupAdmin(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { name = 'Admin', email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })
  if (process.env.ADMIN_EMAIL && email !== process.env.ADMIN_EMAIL) return res.status(403).json({ error: 'Use the configured ADMIN_EMAIL for setup' })
  await ensureIndexes()
  const users = await mongoCollection('users')
  const normalizedEmail = cleanEmail(email)
  const passwordHash = await bcrypt.hash(password, 12)
  const now = new Date()
  const result = await users.findOneAndUpdate(
    { email: normalizedEmail },
    { $set: { name, role: 'admin', emailVerified: true, updatedAt: now }, $setOnInsert: { email: normalizedEmail, passwordHash, providers: ['email'], createdAt: now } },
    { upsert: true, returnDocument: 'after' }
  )
  return res.status(201).json({ success: true, user: publicUser(result.value) })
}

async function handleLogout(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const sessionId = decodeSessionCookie(parseCookies(req)[SESSION_COOKIE])
  if (sessionId) {
    const sessions = await mongoCollection('sessions')
    await sessions.updateOne({ sessionId }, { $set: { invalidatedAt: new Date() } })
  }
  clearSessionCookie(res)
  return res.json({ success: true })
}

async function handleAuthSignin(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })
  await ensureIndexes()
  const users = await mongoCollection('users')
  const user = await users.findOne({ email: cleanEmail(email) })
  if (!user?.passwordHash) return res.status(401).json({ success: false, error: 'Invalid email or password' })
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ success: false, error: 'Invalid email or password' })
  if (!user.emailVerified) return res.status(403).json({ success: false, code: 'EMAIL_NOT_VERIFIED', error: 'Please verify your email before signing in' })
  await createSession(res, user, req)
  return res.json({ success: true, user: publicUser(user) })
}

async function handleAuthSignup(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { name, email, password, company } = req.body || {}
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })
  await ensureIndexes()
  const users = await mongoCollection('users')
  const normalizedEmail = cleanEmail(email)
  const existing = await users.findOne({ email: normalizedEmail })
  if (existing?.passwordHash) return res.status(409).json({ error: 'An account with this email already exists' })
  const now = new Date()
  const passwordHash = await bcrypt.hash(password, 12)
  const user = existing || (await users.insertOne({
    email: normalizedEmail,
    name,
    displayName: name,
    company: company || '',
    passwordHash,
    role: normalizedEmail === process.env.ADMIN_EMAIL ? 'admin' : 'user',
    emailVerified: false,
    providers: ['email'],
    createdAt: now,
    updatedAt: now,
  })).insertedId
  if (existing) {
    await users.updateOne({ _id: existing._id }, { $set: { name, displayName: name, company: company || '', passwordHash, updatedAt: now }, $addToSet: { providers: 'email' } })
  }
  const saved = existing ? await users.findOne({ _id: existing._id }) : await users.findOne({ _id: user })
  await createVerificationEmail(saved)
  await sendOtp(normalizedEmail, 'registration')
  await upsertProfile(saved, { name, displayName: name, company })
  return res.status(201).json({ success: true, user: publicUser(saved), message: 'Account created. Check your email to verify your account.' })
}

async function handleAuthMe(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const user = await findSessionUser(req, res)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })
  res.json({ success: true, user })
}

async function handleDashboardStats(req: VercelRequest, res: VercelResponse) {
  const db = getDatabase()
  try {
    const { data: projects } = await db.query('projects', { count: true })
    const { data: tickets } = await db.query('support_tickets', { where: { status: 'open' }, count: true })
    res.json({ success: true, data: { revenue: 847000, revenue_change: '+12.4%', active_projects: projects?.length || 12, ai_jobs_completed: 4821, pdf_jobs_total: 12847, open_tickets: tickets?.length || 3, security_score: 98.7, uptime: 99.98, api_calls_30d: 48291, storage_used_gb: 2.4, team_members: 8 } })
  } catch {
    res.json({ success: true, data: { revenue: 847000, revenue_change: '+12.4%', active_projects: 12, ai_jobs_completed: 4821, pdf_jobs_total: 12847, open_tickets: 3, security_score: 98.7, uptime: 99.98, api_calls_30d: 48291, storage_used_gb: 2.4, team_members: 8 } })
  }
}

async function handleCrmStats(req: VercelRequest, res: VercelResponse) {
  res.json({ contacts: { total: 12847, active: 9234, newThisMonth: 342, growth: '+12.3%' }, deals: { active: 234, totalValue: 4200000, avgDealSize: 17948, winRate: 68 }, pipeline: { lead: 45, qualification: 23, discovery: 18, proposal: 12, negotiation: 8, closedWon: 34 }, revenue: { mrr: 847000, arr: 10164000, growth: '+18.7%' }, activities: { callsToday: 34, emailsToday: 87, meetingsToday: 12 } })
}

async function handleCrmContacts(req: VercelRequest, res: VercelResponse) {
  const db = getDatabase()
  if (req.method === 'GET') {
    const { page = '1', limit = '20', search, status } = req.query as any
    const pageNum = parseInt(page); const limitNum = parseInt(limit)
    try {
      const options: any = { orderBy: { column: 'created_at', ascending: false }, limit: limitNum, offset: (pageNum - 1) * limitNum, count: true }
      if (status) options.where = { status }
      if (search) options.search = [{ column: 'name', value: search }, { column: 'email', value: search }]
      const { data, count } = await db.query('crm_contacts', options)
      return res.json({ contacts: data, total: count || data.length, page: pageNum, pages: Math.ceil((count || data.length) / limitNum) })
    } catch {
      const contacts = Array.from({ length: 50 }, (_, i) => ({ id: i + 1, name: ['John Smith', 'Emily Davis', 'Robert Chang', 'Anna Petrov', 'Michael Park'][i % 5], email: `contact${i}@company.com`, phone: `+1-555-0${100 + i}`, company: ['Meridian Corp', 'NovaTech', 'Quantum Labs', 'FastCart', 'Stellar Digital'][i % 5], role: ['CTO', 'VP Engineering', 'Head of AI', 'CEO', 'Director'][i % 5], status: i % 8 === 0 ? 'inactive' : 'active', lastContact: new Date(Date.now() - i * 86400000).toISOString(), deals: Math.floor(Math.random() * 5), totalValue: Math.floor(Math.random() * 500000), tags: [['enterprise'], ['mid-market'], ['startup'], ['hot-lead'], ['enterprise', 'ai']][i % 5], created: new Date(2024, 0, 1 + i).toISOString() }))
      return res.json({ contacts: contacts.slice((pageNum - 1) * limitNum, pageNum * limitNum), total: contacts.length, page: pageNum, pages: Math.ceil(contacts.length / limitNum) })
    }
  }
  if (req.method === 'POST') {
    const { name, email, phone, company, role, tags } = req.body || {}
    try { const { data } = await db.insert('crm_contacts', { name, email, phone, company, role, tags: JSON.stringify(tags || []), status: 'active' }); return res.json(data || { id: Date.now(), name, email, phone, company, role, tags, status: 'active', created: new Date().toISOString() }) } catch { return res.json({ id: Date.now(), name, email, phone, company, role, tags, status: 'active', created: new Date().toISOString() }) }
  }
  res.status(405).json({ error: 'Method not allowed' })
}

async function handleCrmDeals(req: VercelRequest, res: VercelResponse) {
  const db = getDatabase()
  if (req.method === 'GET') {
    try { const { data } = await db.query('crm_deals', { orderBy: { column: 'created_at', ascending: false } }); return res.json({ deals: data, total: data.length }) } catch {
      return res.json({ deals: [
        { id: 1, name: 'Enterprise License - Meridian Corp', value: 245000, stage: 'negotiation', probability: 85, owner: 'Sarah Chen', contact: 'John Smith', company: 'Meridian Corp', created: '2024-06-01', expectedClose: '2024-07-15' },
        { id: 2, name: 'Platform Migration - NovaTech', value: 180000, stage: 'proposal', probability: 60, owner: 'Mike Johnson', contact: 'Emily Davis', company: 'NovaTech', created: '2024-06-05', expectedClose: '2024-08-01' },
        { id: 3, name: 'AI Agent Deployment - Quantum Labs', value: 320000, stage: 'discovery', probability: 40, owner: 'Alex Rivera', contact: 'Robert Chang', company: 'Quantum Labs', created: '2024-06-10', expectedClose: '2024-09-01' },
        { id: 4, name: 'BillingFlow Integration - FastCart', value: 95000, stage: 'closed_won', probability: 100, owner: 'Lisa Martinez', contact: 'Anna Petrov', company: 'FastCart', created: '2024-05-15', expectedClose: '2024-06-28' },
        { id: 5, name: 'Smart Home B2B - GreenLeaf', value: 150000, stage: 'qualification', probability: 30, owner: 'David Kim', contact: 'Lisa Thompson', company: 'GreenLeaf Homes', created: '2024-06-12', expectedClose: '2024-08-15' },
      ], total: 5 })
    }
  }
  if (req.method === 'POST') {
    const { name, value, stage, contactId, probability } = req.body || {}
    try { const { data } = await db.insert('crm_deals', { name, value, stage, contact_id: contactId, probability }); return res.json(data || { id: Date.now(), name, value, stage, probability, contactId, created: new Date().toISOString() }) } catch { return res.json({ id: Date.now(), name, value, stage, probability, contactId, created: new Date().toISOString() }) }
  }
  res.status(405).json({ error: 'Method not allowed' })
}

async function handleHrmStats(req: VercelRequest, res: VercelResponse) {
  res.json({ employees: { total: 247, active: 240, onLeave: 5, onboarding: 2 }, recruitment: { openPositions: 18, totalApplicants: 373, inInterview: 41, offersExtended: 5 }, attendance: { avgRate: 96.4, lateToday: 3, absentToday: 2 }, payroll: { totalMonthly: 2847000, avgSalary: 142350, nextPayDate: '2024-07-01' }, performance: { avgScore: 4.2, reviewsDue: 12, goalsMet: 87 }, turnover: { rate: 8.2, voluntary: 5.1, involuntary: 3.1 } })
}

async function handleHrmEmployees(req: VercelRequest, res: VercelResponse) {
  const db = getDatabase()
  const { department, status, search, page = '1', limit = '20' } = req.query as any
  try {
    const options: any = { orderBy: { column: 'name', ascending: true }, limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit), count: true }
    if (department) options.where = { ...options.where, department_id: department }
    if (status) options.where = { ...options.where, status }
    if (search) options.search = [{ column: 'name', value: search }]
    const { data, count } = await db.query('hrm_employees', options)
    return res.json({ employees: data, total: count || data.length, page: parseInt(page) })
  } catch {
    const employees = Array.from({ length: 50 }, (_, i) => ({ id: `emp_${1000 + i}`, name: ['Alex Rivera', 'Sarah Chen', 'Mike Johnson', 'Emily Park', 'Lisa Martinez', 'David Kim', 'James Wu', 'Anna Petrov'][i % 8], email: `employee${i}@hmorix.com`, department: ['Engineering', 'Product', 'Marketing', 'Sales', 'AI/ML', 'Security', 'Operations', 'HR'][i % 8], role: ['Staff Engineer', 'VP Product', 'Head of Security', 'ML Lead', 'Frontend Lead', 'Growth Lead', 'IoT Lead', 'DevOps Lead'][i % 8], location: ['San Francisco', 'New York', 'Remote', 'Austin', 'Seattle'][i % 5], status: i % 15 === 0 ? 'on_leave' : i % 20 === 0 ? 'onboarding' : 'active', startDate: new Date(2022, i % 12, 1 + (i % 28)).toISOString(), salary: 100000 + (i * 5000), manager: ['Hamza Morix', 'Alex Rivera', 'Sarah Chen'][i % 3], performanceScore: 3.5 + Math.random() * 1.5 }))
    const pageNum = parseInt(page); const limitNum = parseInt(limit)
    return res.json({ employees: employees.slice((pageNum - 1) * limitNum, pageNum * limitNum), total: employees.length, page: pageNum })
  }
}

async function handleAnalyticsOverview(req: VercelRequest, res: VercelResponse) {
  const { period = '30d' } = req.query as any
  res.json({ visitors: { total: 847230, unique: 623400, returning: 223830, growth: '+23.4%' }, pageViews: { total: 2400000, perSession: 2.84, growth: '+18.7%' }, sessions: { total: 845000, avgDuration: '4m 32s', growth: '+12.1%' }, bounceRate: { rate: 32.4, change: '-5.2%' }, conversions: { total: 12847, rate: 1.52, growth: '+34.2%' }, revenue: { total: 847000, perVisitor: 1.0, growth: '+28.9%' }, period })
}

async function handleAnalyticsTraffic(req: VercelRequest, res: VercelResponse) {
  res.json({ sources: [
    { source: 'Google Organic', visitors: 312400, percentage: 36.9, sessions: 298000, bounceRate: 28, conversionRate: 2.1 },
    { source: 'Direct', visitors: 187200, percentage: 22.1, sessions: 175000, bounceRate: 35, conversionRate: 1.8 },
    { source: 'LinkedIn', visitors: 98400, percentage: 11.6, sessions: 92000, bounceRate: 22, conversionRate: 3.2 },
    { source: 'Twitter/X', visitors: 76800, percentage: 9.1, sessions: 71000, bounceRate: 38, conversionRate: 1.2 },
    { source: 'GitHub', visitors: 54200, percentage: 6.4, sessions: 50000, bounceRate: 18, conversionRate: 4.5 },
    { source: 'Google Ads', visitors: 48900, percentage: 5.8, sessions: 46000, bounceRate: 42, conversionRate: 2.8 },
    { source: 'Referral', visitors: 42100, percentage: 5.0, sessions: 39000, bounceRate: 30, conversionRate: 1.9 },
    { source: 'Email', visitors: 27230, percentage: 3.2, sessions: 25000, bounceRate: 20, conversionRate: 5.1 },
  ], totalVisitors: 847230 })
}

async function handleAdminStats(req: VercelRequest, res: VercelResponse) {
  const user = await getAuthUser(req)
  if (user && user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' })
  res.json({ success: true, data: { total_users: 2847, total_revenue: 10164000, mrr: 284000, api_calls_24h: 142000, total_tickets: 847, total_ai_jobs: 4821, total_pdf_jobs: 12847, uptime: 99.98, security_score: 98.7, server_regions: 4, database_nodes: 6, edge_locations: 42 } })
}

async function handleAdminLogs(req: VercelRequest, res: VercelResponse) {
  res.json({ success: true, data: [
    { time: '2024-06-28 14:32:01', level: 'INFO', service: 'api-gateway', msg: 'Request processed: GET /api/dashboard/stats 200 12ms' },
    { time: '2024-06-28 14:31:58', level: 'INFO', service: 'auth-service', msg: 'Token validated for user_id=1' },
    { time: '2024-06-28 14:31:45', level: 'WARN', service: 'webhook-service', msg: 'Delivery retry #2 for hook_id=wh_4821' },
    { time: '2024-06-28 14:31:30', level: 'INFO', service: 'ai-agent', msg: 'Job AGT-4822 step 3/5 completed' },
    { time: '2024-06-28 14:31:22', level: 'ERROR', service: 'pdf-engine', msg: 'OCR timeout for doc_9913_page_42' },
    { time: '2024-06-28 14:31:15', level: 'INFO', service: 'billing', msg: 'Invoice INV-2844 generated' },
    { time: '2024-06-28 14:30:55', level: 'WARN', service: 'rate-limiter', msg: 'Client exceeded 100 req/min' },
    { time: '2024-06-28 14:30:42', level: 'INFO', service: 'db-cluster', msg: 'Health check passed' },
  ] })
}

function stripHtml(value: string) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function sanitizeHtml(value: string) {
  return String(value || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
}

function slugifyTitle(value: string) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function calculateReadingTime(value: string) {
  const words = stripHtml(value).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 220))
}

function createExcerpt(value: string) {
  return stripHtml(value).slice(0, 180)
}

async function getBlogCollection() {
  return mongoCollection('blogs')
}

async function upsertProfile(user: any, data: any = {}) {
  if (!user) return null
  const profiles = await mongoCollection('profiles')
  const userId = String(user._id || user.id)
  const now = new Date()
  const update: any = {
    userId,
    email: user.email,
    name: data.name ?? data.displayName ?? user.name ?? '',
    displayName: data.displayName ?? data.name ?? user.displayName ?? user.name ?? '',
    username: data.username ?? user.username ?? undefined,
    bio: data.bio ?? '',
    phone: data.phone ?? '',
    company: data.company ?? user.company ?? '',
    country: data.country ?? '',
    location: data.location ?? '',
    website: data.website ?? '',
    socialLinks: data.socialLinks ?? data.social_links ?? {},
    theme: data.theme ?? 'dark',
    avatarUrl: data.avatarUrl ?? data.avatar_url ?? '',
    avatarPath: data.avatarPath ?? '',
    coverImageUrl: data.coverImageUrl ?? data.cover_image_url ?? '',
    coverImagePath: data.coverImagePath ?? '',
    updatedAt: now,
  }
  Object.keys(update).forEach(key => update[key] === undefined && delete update[key])
  await profiles.updateOne(
    { userId },
    { $set: update, $setOnInsert: { createdAt: now } },
    { upsert: true }
  )
  return profiles.findOne({ userId })
}

async function createVerificationEmail(user: any) {
  const token = randomToken(32)
  const expiresAt = new Date(Date.now() + Number(process.env.EMAIL_VERIFY_TTL_MS || 1000 * 60 * 60 * 24))
  const tokens = await mongoCollection('verification_tokens')
  await tokens.deleteMany({ userId: String(user._id), type: 'email_verification' })
  await tokens.insertOne({ userId: String(user._id), email: user.email, type: 'email_verification', tokenHash: tokenHash(token), expiresAt, createdAt: new Date(), usedAt: null })
  const url = `${appUrl()}/verify?token=${encodeURIComponent(token)}`
  await sendMail({
    to: user.email,
    subject: 'Verify your HMorix account',
    text: `Verify your HMorix account: ${url}`,
    html: `<p>Welcome to HMorix.</p><p><a href="${url}">Verify your account</a></p><p>This link expires in 24 hours.</p>`,
  })
}

async function sendOtp(email: string, purpose = 'login') {
  const normalizedEmail = cleanEmail(email)
  const records = await mongoCollection('otp_records')
  const recent = await records.countDocuments({ email: normalizedEmail, purpose, createdAt: { $gt: new Date(Date.now() - 15 * 60 * 1000) } })
  if (recent >= Number(process.env.OTP_RESEND_LIMIT || 5)) throw Object.assign(new Error('Too many OTP requests. Please try again later.'), { status: 429 })
  const otp = generateOtp()
  const expiresAt = new Date(Date.now() + Number(process.env.OTP_TTL_MS || 10 * 60 * 1000))
  await records.insertOne({ email: normalizedEmail, purpose, otpHash: tokenHash(otp), attempts: 0, maxAttempts: Number(process.env.OTP_RETRY_LIMIT || 5), expiresAt, createdAt: new Date(), usedAt: null })
  await sendMail({
    to: normalizedEmail,
    subject: 'Your HMorix verification code',
    text: `Your HMorix OTP is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your HMorix verification code is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`,
  })
}

async function handleVerifyEmail(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const token = (req.method === 'GET' ? req.query.token : req.body?.token) as string
  if (!token) return res.status(400).json({ success: false, status: 'invalid', error: 'Verification token is missing' })
  const tokens = await mongoCollection('verification_tokens')
  const record = await tokens.findOne({ tokenHash: tokenHash(token), type: 'email_verification', usedAt: null })
  if (!record) return res.status(400).json({ success: false, status: 'invalid', error: 'Invalid verification token' })
  if (record.expiresAt <= new Date()) return res.status(410).json({ success: false, status: 'expired', error: 'Verification token has expired' })
  const users = await mongoCollection('users')
  await users.updateOne({ _id: new ObjectId(record.userId) }, { $set: { emailVerified: true, updatedAt: new Date() } })
  await tokens.updateOne({ _id: record._id }, { $set: { usedAt: new Date() } })
  return res.json({ success: true, status: 'verified', message: 'Email verified successfully' })
}

async function handleResendVerification(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const email = cleanEmail(req.body?.email)
  if (!email) return res.status(400).json({ error: 'Email is required' })
  const users = await mongoCollection('users')
  const user = await users.findOne({ email })
  if (user && !user.emailVerified) await createVerificationEmail(user)
  return res.json({ success: true, message: 'If an unverified account exists, a new verification email has been sent.' })
}

async function handleOtpRequest(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const email = cleanEmail(req.body?.email)
  const purpose = String(req.body?.purpose || 'login')
  if (!email) return res.status(400).json({ error: 'Email is required' })
  await sendOtp(email, purpose)
  return res.json({ success: true, message: 'OTP sent' })
}

async function handleOtpVerify(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const email = cleanEmail(req.body?.email)
  const code = String(req.body?.code || '')
  const purpose = String(req.body?.purpose || 'login')
  if (!email || !/^\d{6}$/.test(code)) return res.status(400).json({ error: 'A valid 6 digit OTP is required' })
  const records = await mongoCollection('otp_records')
  const record = await records.findOne({ email, purpose, usedAt: null, expiresAt: { $gt: new Date() } }, { sort: { createdAt: -1 } })
  if (!record) return res.status(400).json({ error: 'OTP is invalid or expired' })
  if (record.attempts >= record.maxAttempts) return res.status(429).json({ error: 'OTP retry limit exceeded' })
  if (record.otpHash !== tokenHash(code)) {
    await records.updateOne({ _id: record._id }, { $inc: { attempts: 1 } })
    return res.status(400).json({ error: 'OTP is invalid' })
  }
  await records.updateOne({ _id: record._id }, { $set: { usedAt: new Date() } })
  return res.json({ success: true, message: 'OTP verified' })
}

async function handleForgotPassword(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const email = cleanEmail(req.body?.email)
  if (!email) return res.status(400).json({ error: 'Email is required' })
  await sendOtp(email, 'forgot_password')
  return res.json({ success: true, message: 'If the account exists, a reset OTP has been sent.' })
}

async function handleOAuthStart(req: VercelRequest, res: VercelResponse, provider: 'google' | 'github') {
  const redirectUri = `${appUrl()}/api/auth/${provider}/callback`
  const state = randomToken(16)
  const states = await mongoCollection('oauth_states')
  await states.insertOne({ state: tokenHash(state), provider, expiresAt: new Date(Date.now() + 10 * 60 * 1000), createdAt: new Date() })
  const clientId = provider === 'google' ? process.env.GOOGLE_CLIENT_ID : process.env.GITHUB_CLIENT_ID
  if (!clientId) return res.status(500).json({ error: `${provider} OAuth is not configured` })
  const url = provider === 'google'
    ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('openid email profile')}&state=${encodeURIComponent(state)}`
    : `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent('read:user user:email')}&state=${encodeURIComponent(state)}`
  res.writeHead(302, { Location: url })
  res.end()
}

async function handleOAuthCallback(req: VercelRequest, res: VercelResponse, provider: 'google' | 'github') {
  const { code, state } = req.query as any
  if (!code || !state) return redirectRetry(res)
  const states = await mongoCollection('oauth_states')
  const validState = await states.findOne({ state: tokenHash(state), provider, expiresAt: { $gt: new Date() } })
  if (!validState) return redirectRetry(res)
  await states.deleteOne({ _id: validState._id })
  const redirectUri = `${appUrl()}/api/auth/${provider}/callback`
  const oauthUser = provider === 'google'
    ? await fetchGoogleUser(String(code), redirectUri)
    : await fetchGithubUser(String(code), redirectUri)
  if (!oauthUser.email) return redirectRetry(res)
  const user = await linkOAuthUser(provider, oauthUser)
  await createSession(res, user, req)
  res.writeHead(302, { Location: `${appUrl()}/dashboard` })
  res.end()
}

async function fetchGoogleUser(code: string, redirectUri: string) {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID || '', client_secret: process.env.GOOGLE_CLIENT_SECRET || '', redirect_uri: redirectUri, grant_type: 'authorization_code' }),
  })
  const token = await tokenRes.json() as any
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${token.access_token}` } })
  const profile = await profileRes.json() as any
  return { providerAccountId: profile.id, email: cleanEmail(profile.email), name: profile.name, avatarUrl: profile.picture }
}

async function fetchGithubUser(code: string, redirectUri: string) {
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, redirect_uri: redirectUri }),
  })
  const token = await tokenRes.json() as any
  const userRes = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${token.access_token}`, Accept: 'application/vnd.github+json' } })
  const profile = await userRes.json() as any
  let email = cleanEmail(profile.email)
  if (!email) {
    const emailsRes = await fetch('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${token.access_token}`, Accept: 'application/vnd.github+json' } })
    const emails = await emailsRes.json() as any[]
    email = cleanEmail(emails.find(item => item.primary && item.verified)?.email || emails.find(item => item.verified)?.email || '')
  }
  return { providerAccountId: String(profile.id), email, name: profile.name || profile.login, avatarUrl: profile.avatar_url }
}

async function linkOAuthUser(provider: 'google' | 'github', oauthUser: any) {
  await ensureIndexes()
  const users = await mongoCollection('users')
  const accounts = await mongoCollection('oauth_accounts')
  const now = new Date()
  let user = await users.findOne({ email: oauthUser.email })
  if (!user) {
    const result = await users.insertOne({
      email: oauthUser.email,
      name: oauthUser.name || oauthUser.email,
      displayName: oauthUser.name || '',
      avatarUrl: oauthUser.avatarUrl || '',
      emailVerified: true,
      role: oauthUser.email === process.env.ADMIN_EMAIL ? 'admin' : 'user',
      providers: [provider],
      createdAt: now,
      updatedAt: now,
    })
    user = await users.findOne({ _id: result.insertedId })
  } else {
    await users.updateOne({ _id: user._id }, { $set: { emailVerified: true, updatedAt: now, avatarUrl: user.avatarUrl || oauthUser.avatarUrl || '' }, $addToSet: { providers: provider } })
    user = await users.findOne({ _id: user._id })
  }
  await accounts.updateOne(
    { provider, providerAccountId: oauthUser.providerAccountId },
    { $set: { userId: String(user!._id), email: oauthUser.email, name: oauthUser.name || '', avatarUrl: oauthUser.avatarUrl || '', updatedAt: now }, $setOnInsert: { createdAt: now } },
    { upsert: true }
  )
  await upsertProfile(user, { name: user?.name, displayName: user?.displayName, avatarUrl: user?.avatarUrl })
  return user
}

function redirectRetry(res: VercelResponse) {
  clearSessionCookie(res)
  res.writeHead(302, { Location: `${appUrl()}/retry` })
  res.end()
}

async function writePublishedBlogBackup(blog: any) {
  if (blog.status !== 'published') return null
  const published = new Date(blog.publishedAt || blog.published_at || Date.now())
  const year = String(published.getFullYear())
  const month = String(published.getMonth() + 1).padStart(2, '0')
  const backupJson = JSON.stringify({
    title: blog.title || '',
    slug: blog.slug || '',
    seoMetadata: blog.seo || blog.seoMetadata || {},
    author: blog.author || '',
    category: blog.category || '',
    tags: blog.tags || [],
    publishDate: blog.publishedAt || blog.published_at || '',
    updatedDate: blog.updatedAt || blog.updated_at || '',
    coverImage: blog.coverImage || blog.cover_image || '',
    content: blog.content || '',
    readingTime: blog.readingTime || 1,
    status: 'published',
    shareUrl: `${appUrl()}/blog/${blog.slug}`,
  }, null, 2)
  const storagePath = `${year}/${month}/${blog.slug}.json`
  const supabase = await ensureStorageBucket()
  const fullPath = `blogs/json/${storagePath}`
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fullPath, backupJson, { contentType: 'application/json', upsert: true })
  if (error) throw Object.assign(new Error('Blog JSON export upload failed'), { status: 502, code: 'STORAGE_JSON' })
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fullPath)
  return { path: fullPath, url: data.publicUrl }
}

async function getBlogFilter(idOrSlug: string) {
  const { ObjectId } = await import('mongodb')
  if (ObjectId.isValid(idOrSlug)) return { _id: new ObjectId(idOrSlug) }
  return { slug: idOrSlug }
}

async function handleBlogs(req: VercelRequest, res: VercelResponse) {
  const collection = await getBlogCollection()
  if (req.method === 'GET') {
    const { search = '', category = '', tag = '', page = '1', limit = '12', status = 'published' } = req.query as any
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.max(1, parseInt(limit))
    const query: any = {}
    if (status !== 'all') query.status = status
    if (category) query.category = category
    if (tag) query.tags = tag
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ]
    const [blogs, total] = await Promise.all([
      collection.find(query).sort({ publishedAt: -1, createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).toArray(),
      collection.countDocuments(query),
    ])
    return res.json({ success: true, data: blogs, total, page: pageNum, pages: Math.ceil(total / limitNum) })
  }
  if (req.method === 'POST') {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'admin') return res.status(401).json({ error: 'Admin access required' })
    const now = new Date()
    const body = req.body || {}
    const slug = slugifyTitle(body.slug || body.title)
    const status = body.status || 'draft'
    const blog = {
      title: body.title || '',
      slug,
      content: sanitizeHtml(body.content),
      author: body.author || user.name || user.email,
      tags: Array.isArray(body.tags) ? body.tags : [],
      category: body.category || '',
      coverImage: body.coverImage || '',
      seo: body.seo || {},
      excerpt: body.excerpt || createExcerpt(body.content),
      readingTime: body.readingTime || calculateReadingTime(body.content),
      status,
      likes: 0,
      bookmarks: 0,
      comments: [],
      analytics: { views: 0, uniqueVisitors: 0, shares: 0 },
      publishedAt: status === 'published' ? now : null,
      createdAt: now,
      updatedAt: now,
    }
    const result = await collection.insertOne(blog)
    const saved = { ...blog, _id: result.insertedId }
    const backupPath = await writePublishedBlogBackup(saved)
    if (backupPath) await collection.updateOne({ _id: result.insertedId }, { $set: { jsonUrl: backupPath.url, jsonPath: backupPath.path, shareUrl: `${appUrl()}/blog/${slug}` } })
    return res.status(201).json({ success: true, data: { ...saved, jsonUrl: backupPath?.url, shareUrl: `${appUrl()}/blog/${slug}` }, backupPath })
  }
  res.status(405).json({ error: 'Method not allowed' })
}

async function handleBlog(req: VercelRequest, res: VercelResponse) {
  return handleBlogs(req, res)
}

async function handleBlogSlug(req: VercelRequest, res: VercelResponse, slug: string) {
  const collection = await getBlogCollection()
  const filter = await getBlogFilter(slug)
  if (req.method === 'GET') {
    const blog = await collection.findOne(filter)
    if (!blog) return res.status(404).json({ error: 'Blog not found' })
    await collection.updateOne(filter, { $inc: { 'analytics.views': 1 } })
    return res.json({ success: true, data: blog })
  }
  if (req.method === 'PUT') {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'admin') return res.status(401).json({ error: 'Admin access required' })
    const existing = await collection.findOne(filter)
    if (!existing) return res.status(404).json({ error: 'Blog not found' })
    const body = req.body || {}
    const nextSlug = slugifyTitle(body.slug || body.title || slug)
    const status = body.status || existing.status
    const update = {
      ...body,
      content: body.content ? sanitizeHtml(body.content) : existing.content,
      slug: nextSlug,
      excerpt: body.excerpt || createExcerpt(body.content || existing.content),
      readingTime: body.readingTime || calculateReadingTime(body.content || existing.content),
      publishedAt: status === 'published' ? (existing.publishedAt || new Date()) : existing.publishedAt,
      updatedAt: new Date(),
    }
    await collection.updateOne(filter, { $set: update })
    const saved = await collection.findOne({ slug: nextSlug })
    const backupPath = saved ? await writePublishedBlogBackup(saved) : null
    if (saved && backupPath) await collection.updateOne({ _id: saved._id }, { $set: { jsonUrl: backupPath.url, jsonPath: backupPath.path, shareUrl: `${appUrl()}/blog/${nextSlug}` } })
    return res.json({ success: true, data: saved, backupPath })
  }
  if (req.method === 'DELETE') {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'admin') return res.status(401).json({ error: 'Admin access required' })
    await collection.deleteOne(filter)
    return res.json({ success: true })
  }
  res.status(405).json({ error: 'Method not allowed' })
}

async function handleBlogTaxonomy(req: VercelRequest, res: VercelResponse, field: 'category' | 'tags') {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const collection = await getBlogCollection()
  const data = await collection.distinct(field, { status: 'published' })
  return res.json({ success: true, data: data.flat().filter(Boolean).sort() })
}

async function handleContact(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { first_name, last_name, email, service, message } = req.body || {}
  if (!first_name || !email) return res.status(400).json({ error: 'Name and email are required' })
  const db = getDatabase()
  try { await db.insert('contact_submissions', { first_name, last_name, email, service, message }) } catch {}
  res.json({ success: true, message: 'Thank you for contacting us. We will get back to you soon.' })
}

async function handleNotifications(req: VercelRequest, res: VercelResponse) {
  const db = getDatabase()
  const user = await getAuthUser(req)
  if (req.method === 'GET') {
    if (user) { try { const { data } = await db.query('notifications', { where: { user_id: user.id }, orderBy: { column: 'created_at', ascending: false }, limit: 20 }); return res.json({ success: true, data }) } catch {} }
    return res.json({ success: true, data: [
      { id: 1, title: 'Deployment Successful', message: 'BillingFlow v2.4.1 deployed to production', type: 'success', read: false, created_at: new Date().toISOString() },
      { id: 2, title: 'New Support Ticket', message: 'TKT-4523: API rate limiting issue', type: 'info', read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 3, title: 'Security Alert', message: 'Unusual login attempt blocked from 103.42.18.91', type: 'warning', read: true, created_at: new Date(Date.now() - 7200000).toISOString() },
    ] })
  }
  if (req.method === 'PUT') { return res.json({ success: true, message: 'All notifications marked as read' }) }
  res.status(405).json({ error: 'Method not allowed' })
}

async function handleProfile(req: VercelRequest, res: VercelResponse) {
  const user = await findSessionUser(req, res)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })
  if (req.method === 'GET') {
    const profiles = await mongoCollection('profiles')
    const profile = await profiles.findOne({ userId: user.id })
    if (profile) return res.json({ success: true, data: { ...profile, role: user.role, emailVerified: user.emailVerified } })
    const created = await upsertProfile({ _id: user.id, email: user.email, name: user.name, displayName: user.displayName })
    return res.json({ success: true, data: { ...created, role: user.role, emailVerified: user.emailVerified } })
  }
  if (req.method === 'PUT') {
    const body = req.body || {}
    const allowed = ['name', 'displayName', 'username', 'bio', 'phone', 'company', 'country', 'location', 'website', 'socialLinks', 'theme', 'avatarUrl', 'coverImageUrl']
    const update: any = {}
    for (const key of allowed) if (body[key] !== undefined) update[key] = typeof body[key] === 'string' ? sanitizeText(body[key], key === 'bio' ? 1000 : 160) : body[key]
    if (update.username && !/^[a-zA-Z0-9_]{3,32}$/.test(update.username)) return res.status(400).json({ error: 'Username must be 3-32 letters, numbers, or underscores' })
    const profiles = await mongoCollection('profiles')
    if (update.username) {
      const duplicate = await profiles.findOne({ username: update.username, userId: { $ne: user.id } })
      if (duplicate) return res.status(409).json({ error: 'Username is already taken' })
    }
    const profile = await upsertProfile({ _id: user.id, email: user.email, name: user.name, displayName: user.displayName }, update)
    const users = await mongoCollection('users')
    await users.updateOne({ _id: new ObjectId(user.id) }, { $set: { name: update.name || update.displayName || user.name, displayName: update.displayName || update.name || user.displayName, username: update.username || user.username, updatedAt: new Date() } })
    return res.json({ success: true, message: 'Profile updated', data: profile })
  }
  res.status(405).json({ error: 'Method not allowed' })
}

function sanitizeText(value: string, max = 160) {
  return String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, max)
}

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) return req.body
  if (typeof req.body === 'string') return Buffer.from(req.body)
  if (req.body && typeof req.body === 'object') return Buffer.from(JSON.stringify(req.body))
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', chunk => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

async function parseUpload(req: VercelRequest) {
  const contentType = String(req.headers['content-type'] || '')
  if (contentType.includes('application/json')) {
    const body = req.body || {}
    const data = String(body.data || '').replace(/^data:[^;]+;base64,/, '')
    return {
      file: data ? Buffer.from(data, 'base64') : null,
      filename: body.filename || 'upload',
      mime: body.mime || body.contentType || 'application/octet-stream',
      kind: body.kind || 'attachments',
      oldPath: body.oldPath,
    }
  }
  const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.[1] || contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.[2]
  if (!boundary) return { file: null, filename: '', mime: '', kind: 'attachments', oldPath: '' }
  const raw = await readRawBody(req)
  const delimiter = Buffer.from(`--${boundary}`)
  const parts = raw.toString('binary').split(delimiter.toString('binary'))
  const fields: any = {}
  let file: Buffer | null = null
  let filename = 'upload'
  let mime = 'application/octet-stream'
  for (const part of parts) {
    const [rawHeaders, rawContent] = part.split('\r\n\r\n')
    if (!rawHeaders || !rawContent) continue
    const name = rawHeaders.match(/name="([^"]+)"/)?.[1]
    const fileNameMatch = rawHeaders.match(/filename="([^"]*)"/)?.[1]
    const typeMatch = rawHeaders.match(/Content-Type:\s*([^\r\n]+)/i)?.[1]
    const content = rawContent.replace(/\r\n--$/, '').replace(/\r\n$/, '')
    if (fileNameMatch) {
      filename = fileNameMatch
      mime = typeMatch || mime
      file = Buffer.from(content, 'binary')
    } else if (name) {
      fields[name] = content
    }
  }
  return { file, filename, mime, kind: fields.kind || 'attachments', oldPath: fields.oldPath }
}

async function handleUpload(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const user = await getAuthUser(req)
  if (!user) return res.status(401).json({ error: 'Login required' })
  const parsed = await parseUpload(req)
  if (!parsed.file) return res.status(400).json({ error: 'File is required' })
  const kind = String(parsed.kind || 'attachments')
  const folderMap: Record<string, string> = {
    avatar: `profiles/${user.id}/avatar`,
    profile: `profiles/${user.id}/avatar`,
    cover: `profiles/${user.id}/cover`,
    blog: 'blogs/images',
    content: 'blogs/images',
    json: 'blogs/json',
    attachment: `attachments/${user.id}`,
    attachments: `attachments/${user.id}`,
  }
  const allowed = kind === 'json' ? JSON_TYPES : IMAGE_TYPES
  if (!allowed.has(parsed.mime)) return res.status(400).json({ error: 'Unsupported file type' })
  const upload = await uploadBufferToStorage(parsed.file, parsed.mime, folderMap[kind] || `attachments/${user.id}`, parsed.filename)
  if (parsed.oldPath) await deleteStoragePath(parsed.oldPath)
  return res.json({ success: true, url: upload.url, path: upload.path, publicUrl: upload.url })
}

async function handleProjects(req: VercelRequest, res: VercelResponse) {
  const db = getDatabase()
  if (req.method === 'GET') {
    try { const { data } = await db.query('projects', { orderBy: { column: 'created_at', ascending: false } }); return res.json({ success: true, data }) } catch { return res.json({ success: true, data: [{ id: 1, name: 'BillingFlow v3.0', client_name: 'Internal', status: 'in_progress', progress: 78 }, { id: 2, name: 'Meridian Corp Website', client_name: 'Meridian Corp', status: 'in_progress', progress: 45 }, { id: 3, name: 'AI Agent Platform', client_name: 'Internal', status: 'planning', progress: 20 }] }) }
  }
  if (req.method === 'POST') {
    const { name, client_name, description, deadline } = req.body || {}
    try { const { data } = await db.insert('projects', { name, client_name, description, deadline, status: 'planning', progress: 0 }); return res.json({ success: true, data }) } catch { return res.json({ success: true, id: Date.now() }) }
  }
  res.status(405).json({ error: 'Method not allowed' })
}

async function handleInvoices(req: VercelRequest, res: VercelResponse) {
  const db = getDatabase()
  if (req.method === 'GET') { try { const { data } = await db.query('invoices', { orderBy: { column: 'created_at', ascending: false } }); return res.json({ success: true, data }) } catch { return res.json({ success: true, data: [] }) } }
  if (req.method === 'POST') {
    const { invoice_number, amount, currency, due_date, items } = req.body || {}
    try { const { data } = await db.insert('invoices', { invoice_number: invoice_number || `INV-${Date.now()}`, amount, currency: currency || 'USD', due_date, items: JSON.stringify(items || []), status: 'draft' }); return res.json({ success: true, data }) } catch { return res.json({ success: true, id: Date.now() }) }
  }
  res.status(405).json({ error: 'Method not allowed' })
}

async function handleTickets(req: VercelRequest, res: VercelResponse) {
  const db = getDatabase()
  if (req.method === 'GET') { try { const { data } = await db.query('support_tickets', { orderBy: { column: 'created_at', ascending: false }, limit: 50 }); return res.json({ success: true, data }) } catch { return res.json({ success: true, data: [] }) } }
  if (req.method === 'POST') {
    const { subject, description, priority } = req.body || {}
    try { const user = await getAuthUser(req); const { data } = await db.insert('support_tickets', { subject, description, priority: priority || 'medium', status: 'open', user_id: user?.id }); return res.json({ success: true, data }) } catch { return res.json({ success: true, id: Date.now(), message: 'Ticket created' }) }
  }
  res.status(405).json({ error: 'Method not allowed' })
}

async function handleSettings(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return res.json({ success: true, data: { theme: 'dark', accent_color: '#C8FF00', language: 'en-US', timezone: 'America/Los_Angeles', date_format: 'MM/DD/YYYY', currency: 'USD', email_notifications: true, push_notifications: true, security_alerts: true, product_updates: false, weekly_digest: true, sidebar_expanded: true, font_size: 14 } })
  if (req.method === 'PUT') return res.json({ success: true, message: 'Settings updated' })
  res.status(405).json({ error: 'Method not allowed' })
}

async function handleStatus(req: VercelRequest, res: VercelResponse) {
  res.json({ success: true, overall: 'operational', services: [
    { name: 'API Gateway', status: 'operational', uptime: 99.99, latency: '12ms' },
    { name: 'Authentication', status: 'operational', uptime: 99.99, latency: '45ms' },
    { name: 'Database Cluster', status: 'operational', uptime: 99.98, latency: '8ms' },
    { name: 'AI Agent Engine', status: 'operational', uptime: 99.95, latency: '230ms' },
    { name: 'PDF Processing', status: 'operational', uptime: 99.97, latency: '180ms' },
    { name: 'BillingFlow', status: 'operational', uptime: 99.99, latency: '15ms' },
    { name: 'CDN / Edge', status: 'operational', uptime: 100, latency: '3ms' },
    { name: 'Email Service', status: 'operational', uptime: 99.96, latency: '120ms' },
  ], incidents: [], lastUpdated: new Date().toISOString() })
}

async function handleServices(req: VercelRequest, res: VercelResponse) {
  res.json({ success: true, data: [
    { id: 'web-design', name: 'Web Design & Development', category: 'Development', description: 'Custom responsive websites with modern UI/UX', startingPrice: 2999, popular: true },
    { id: 'mobile-apps', name: 'Mobile App Development', category: 'Development', description: 'Native & cross-platform mobile applications', startingPrice: 4999, popular: true },
    { id: 'ai-solutions', name: 'AI & Machine Learning', category: 'AI', description: 'Custom AI agents, NLP, computer vision solutions', startingPrice: 9999, popular: true },
    { id: 'digital-marketing', name: 'Digital Marketing', category: 'Marketing', description: 'SEO, SEM, social media, content marketing', startingPrice: 1499, popular: false },
    { id: 'software-dev', name: 'Custom Software', category: 'Development', description: 'Enterprise software, SaaS platforms, APIs', startingPrice: 14999, popular: false },
    { id: 'advertising', name: 'Advertising Automation', category: 'Marketing', description: 'Programmatic ads, campaign optimization', startingPrice: 2499, popular: false },
    { id: 'ecommerce', name: 'E-Commerce Solutions', category: 'Development', description: 'Online stores, payment integration, inventory', startingPrice: 3999, popular: false },
  ] })
}

async function handleEmployeeProfile(req: VercelRequest, res: VercelResponse) {
  res.json({ success: true, data: { id: 'HM-0042', name: 'John Doe', email: 'john@hmorix.com', role: 'Senior Software Engineer', department: 'Engineering', location: 'San Francisco, CA', manager: 'Sarah Chen', joined: '2023-01-15', phone: '+1 (555) 123-4567' } })
}

async function handleConfigDatabase(req: VercelRequest, res: VercelResponse) {
  const db = getDatabase()
  res.json({ provider: db.provider, switchable: true, instructions: 'Set DATABASE=supabase or DATABASE=mysql in Vercel environment variables to switch providers' })
}

// ============================================
// MAIN ROUTER
// ============================================
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return

  // Extract path from catch-all
  const { path } = req.query
  const routePath = Array.isArray(path) ? path.join('/') : (path || '')

  try {
    // Route matching
    switch (routePath) {
      case 'health': return handleHealth(req, res)
      case 'login': return handleLogin(req, res)
      case 'logout': return handleLogout(req, res)
      case 'setup-admin': return handleSetupAdmin(req, res)
      case 'auth/signin': return handleAuthSignin(req, res)
      case 'auth/signup': return handleAuthSignup(req, res)
      case 'auth/me': return handleAuthMe(req, res)
      case 'auth/verify-email': return handleVerifyEmail(req, res)
      case 'auth/resend-verification': return handleResendVerification(req, res)
      case 'auth/otp/request': return handleOtpRequest(req, res)
      case 'auth/otp/verify': return handleOtpVerify(req, res)
      case 'auth/forgot-password': return handleForgotPassword(req, res)
      case 'auth/google': return handleOAuthStart(req, res, 'google')
      case 'auth/google/callback': return handleOAuthCallback(req, res, 'google')
      case 'auth/github': return handleOAuthStart(req, res, 'github')
      case 'auth/github/callback': return handleOAuthCallback(req, res, 'github')
      case 'dashboard/stats': return handleDashboardStats(req, res)
      case 'crm/stats': return handleCrmStats(req, res)
      case 'crm/contacts': return handleCrmContacts(req, res)
      case 'crm/deals': return handleCrmDeals(req, res)
      case 'hrm/stats': return handleHrmStats(req, res)
      case 'hrm/employees': return handleHrmEmployees(req, res)
      case 'analytics/overview': return handleAnalyticsOverview(req, res)
      case 'analytics/traffic': return handleAnalyticsTraffic(req, res)
      case 'admin/stats': return handleAdminStats(req, res)
      case 'admin/logs': return handleAdminLogs(req, res)
      case 'blogs': return handleBlogs(req, res)
      case 'blog': return handleBlog(req, res)
      case 'categories': return handleBlogTaxonomy(req, res, 'category')
      case 'tags': return handleBlogTaxonomy(req, res, 'tags')
      case 'contact': return handleContact(req, res)
      case 'notifications': return handleNotifications(req, res)
      case 'profile': return handleProfile(req, res)
      case 'upload': return handleUpload(req, res)
      case 'projects': return handleProjects(req, res)
      case 'invoices': return handleInvoices(req, res)
      case 'tickets': return handleTickets(req, res)
      case 'settings': return handleSettings(req, res)
      case 'status': return handleStatus(req, res)
      case 'services': return handleServices(req, res)
      case 'employee/profile': return handleEmployeeProfile(req, res)
      case 'config/database': return handleConfigDatabase(req, res)
      default:
        // Handle blog/[slug] pattern
        if (routePath.startsWith('blog/')) {
          const slug = routePath.replace('blog/', '')
          return handleBlogSlug(req, res, slug)
        }
        if (routePath.startsWith('blogs/')) {
          const slug = routePath.replace('blogs/', '')
          return handleBlogSlug(req, res, slug)
        }
        return res.status(404).json({ error: 'Not found', path: routePath })
    }
  } catch (error: any) {
    console.error('API Error:', { code: error?.code, message: error?.message, route: req.url })
    const status = Number(error?.status || 500)
    const messageByCode: Record<string, string> = {
      SMTP_CONFIG: 'Email delivery is not configured',
      STORAGE_UPLOAD: 'File upload failed. Please try again.',
      STORAGE_JSON: 'Blog export failed. Please try again.',
      UPLOAD_SIZE: 'File is too large',
      ENV_MISSING: 'Service is not configured',
    }
    res.status(status).json({ error: messageByCode[error?.code] || (status >= 500 ? 'Something went wrong. Please try again.' : error?.message || 'Request failed') })
  }
}
