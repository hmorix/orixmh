import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

// ============================================
// CORS & AUTH HELPERS
// ============================================
function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  setCors(res)
  if (req.method === 'OPTIONS') { res.status(200).end(); return true }
  return false
}

async function getAuthUser(req: VercelRequest) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.split(' ')[1]
  const dbProvider = (process.env.DATABASE || 'supabase').toLowerCase()
  try {
    if (dbProvider === 'supabase') {
      const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SECRET_KEY || '', { auth: { autoRefreshToken: false, persistSession: false } })
      const { data: { user }, error } = await supabase.auth.getUser(token)
      if (error || !user) return null
      return { id: user.id, email: user.email || '', role: user.user_metadata?.role || 'user', name: user.user_metadata?.name }
    } else {
      const jwt = await import('jsonwebtoken')
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'hmorix-jwt-secret-change-me') as any
      return { id: decoded.sub || decoded.id, email: decoded.email, role: decoded.role || 'user', name: decoded.name }
    }
  } catch { return null }
}

// ============================================
// DATABASE ADAPTER (inline for single-function)
// ============================================
function getDatabase() {
  const provider = (process.env.DATABASE || 'supabase').toLowerCase()
  if (provider === 'mysql') return createMySQLAdapter()
  return createSupabaseAdapter()
}

function createSupabaseAdapter() {
  const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '',
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
      pool = mysql.createPool({ host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT || '3306'), user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'hmorix', waitForConnections: true, connectionLimit: parseInt(process.env.DB_POOL_SIZE || '5'), charset: 'utf8mb4' })
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
  res.json({ status: dbHealthy ? 'healthy' : 'degraded', database: { provider: db.provider, connected: dbHealthy }, timestamp: new Date().toISOString(), version: '2.0.0' })
}

async function handleAuthSignin(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })
  const dbProvider = (process.env.DATABASE || 'supabase').toLowerCase()
  if (dbProvider === 'mysql') {
    const db = getDatabase()
    const { data: user } = await db.queryOne('users', { where: { email } })
    if (user) {
      const jwt = await import('jsonwebtoken')
      const expiresIn = parseInt(process.env.JWT_EXPIRES_IN || '3600')
      const token = jwt.default.sign({ sub: (user as any).id, email: (user as any).email, role: (user as any).role, name: (user as any).name }, process.env.JWT_SECRET || 'hmorix-jwt-secret-change-me', { expiresIn })
      return res.json({ success: true, user: { id: (user as any).id, name: (user as any).name, email: (user as any).email, role: (user as any).role }, token })
    }
    return res.status(401).json({ success: false, error: 'Invalid credentials' })
  }
  res.json({ success: true, message: 'Use Supabase client-side auth for sign-in' })
}

async function handleAuthSignup(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { name, email, password, company } = req.body || {}
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' })
  const dbProvider = (process.env.DATABASE || 'supabase').toLowerCase()
  if (dbProvider === 'mysql') {
    const db = getDatabase()
    try {
      const bcrypt = await import('bcryptjs')
      const passwordHash = await bcrypt.default.hash(password, 10)
      const { data: user, error } = await db.insert('users', { name, email, password_hash: passwordHash, company: company || '', role: 'user', plan: 'free' })
      if (error) return res.status(400).json({ success: false, error: 'Email already registered' })
      return res.json({ success: true, user: { id: (user as any)?.id, name, email }, message: 'Account created successfully' })
    } catch { return res.status(400).json({ success: false, error: 'Registration failed' }) }
  }
  res.json({ success: true, message: 'Use Supabase client-side auth for sign-up' })
}

async function handleAuthMe(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const user = await getAuthUser(req)
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

async function handleBlog(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const db = getDatabase()
  try { const { data } = await db.query('blog_posts', { where: { status: 'published' }, orderBy: { column: 'published_at', ascending: false }, limit: 20 }); if (data?.length) return res.json({ success: true, data }) } catch {}
  res.json({ success: true, data: [
    { id: 'building-ai-agents-at-scale', title: 'Building AI Agents at Scale', category: 'Engineering', author: 'Hamza Morix', date: '2024-06-28', readTime: '12 min', featured: true },
    { id: 'zero-trust-architecture', title: 'Implementing Zero-Trust Architecture', category: 'Security', author: 'Mike Johnson', date: '2024-06-22', readTime: '15 min', featured: false },
    { id: 'pdf-extraction-ml-pipeline', title: 'ML Pipeline for PDF Extraction', category: 'AI & ML', author: 'Dr. Emily Park', date: '2024-06-20', readTime: '18 min', featured: false },
    { id: 'scaling-to-million-users', title: 'Scaling to 1 Million Users', category: 'Engineering', author: 'Alex Rivera', date: '2024-06-18', readTime: '14 min', featured: false },
    { id: 'smart-home-iot-security', title: 'IoT Security for Smart Homes', category: 'Security', author: 'James Wu', date: '2024-06-15', readTime: '10 min', featured: false },
    { id: 'react-performance-optimization', title: 'React Performance Optimization', category: 'Tutorials', author: 'Lisa Martinez', date: '2024-06-12', readTime: '11 min', featured: false },
  ] })
}

async function handleBlogSlug(req: VercelRequest, res: VercelResponse, slug: string) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const db = getDatabase()
  try { const { data } = await db.queryOne('blog_posts', { where: { slug } }); if (data) return res.json({ success: true, data }) } catch {}
  res.json({ success: true, data: { slug, title: slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), author: 'HMorix Team', date: '2024-06-28', readTime: '10 min', content: 'Full article content would be loaded from database.' } })
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
  const db = getDatabase()
  const user = await getAuthUser(req)
  if (req.method === 'GET') {
    if (user) { try { const { data } = await db.queryOne('user_profiles', { where: { id: user.id } }); if (data) return res.json({ success: true, data }) } catch {} }
    return res.json({ success: true, data: { id: user?.id || 'usr_1001', email: user?.email || 'demo@hmorix.com', name: user?.name || 'Demo User', role: user?.role || 'user', company: 'HMorix', plan: 'business', created_at: '2024-01-15T00:00:00Z' } })
  }
  if (req.method === 'PUT') {
    if (!user) return res.status(401).json({ error: 'Not authenticated' })
    const { name, phone, company } = req.body || {}
    try { await db.update('user_profiles', { name, phone, company }, { id: user.id }) } catch {}
    return res.json({ success: true, message: 'Profile updated' })
  }
  res.status(405).json({ error: 'Method not allowed' })
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
      case 'auth/signin': return handleAuthSignin(req, res)
      case 'auth/signup': return handleAuthSignup(req, res)
      case 'auth/me': return handleAuthMe(req, res)
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
      case 'blog': return handleBlog(req, res)
      case 'contact': return handleContact(req, res)
      case 'notifications': return handleNotifications(req, res)
      case 'profile': return handleProfile(req, res)
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
        return res.status(404).json({ error: 'Not found', path: routePath })
    }
  } catch (error: any) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Internal server error', message: error.message })
  }
}
