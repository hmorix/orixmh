import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getLoginHistory, addLoginHistory } from './mongodb'

async function getAuthUser(req: VercelRequest) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.split(' ')[1]
  try {
    const supabase = require('@supabase/supabase-js').createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SECRET_KEY || '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return null
    return { id: user.id, email: user.email || '' }
  } catch {
    return null
  }
}

function parseUserAgent(userAgent: string) {
  // Simple user agent parsing
  let browser = 'Unknown'
  let os = 'Unknown'
  let device = 'Desktop'

  if (userAgent.includes('Chrome')) browser = 'Chrome'
  else if (userAgent.includes('Firefox')) browser = 'Firefox'
  else if (userAgent.includes('Safari')) browser = 'Safari'
  else if (userAgent.includes('Edge')) browser = 'Edge'

  if (userAgent.includes('Windows')) os = 'Windows'
  else if (userAgent.includes('Mac')) os = 'macOS'
  else if (userAgent.includes('Linux')) os = 'Linux'
  else if (userAgent.includes('iPhone')) {
    os = 'iOS'
    device = 'iPhone'
  } else if (userAgent.includes('Android')) {
    os = 'Android'
    device = 'Android'
  }

  return { browser, os, device }
}

export async function handleLoginHistoryGet(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const user = await getAuthUser(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })

  try {
    const { limit = '4' } = req.query as any
    const history = await getLoginHistory(user.id, parseInt(limit))
    return res.json({ success: true, data: history })
  } catch (error) {
    console.error('Login history fetch error:', error)
    return res.status(500).json({ error: 'Failed to fetch login history' })
  }
}

export async function handleLoginHistoryCreate(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const user = await getAuthUser(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })

  const userAgent = req.headers['user-agent'] || ''
  const ipAddress = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || 'Unknown'
  const { provider = 'email' } = req.body || {}

  const { browser, os, device } = parseUserAgent(userAgent)

  try {
    const result = await addLoginHistory({
      user_id: user.id,
      device,
      browser,
      os,
      ip_address: ipAddress,
      provider,
    })

    return res.json({
      success: true,
      message: 'Login recorded',
      data: result,
    })
  } catch (error) {
    console.error('Login history create error:', error)
    return res.status(500).json({ error: 'Failed to record login' })
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'GET') {
    return handleLoginHistoryGet(req, res)
  } else if (req.method === 'POST') {
    return handleLoginHistoryCreate(req, res)
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
