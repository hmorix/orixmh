import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserSettings, updateUserSettings } from './mongodb'

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

const DEFAULT_SETTINGS = {
  theme: 'dark',
  accent_color: '#C8FF00',
  language: 'en-US',
  timezone: 'UTC',
  date_format: 'MM/DD/YYYY',
  currency: 'USD',
  email_notifications: true,
  push_notifications: true,
  security_alerts: true,
  product_updates: false,
  marketing_emails: false,
  weekly_digest: true,
  sidebar_expanded: true,
  font_size: 14,
}

export async function handleSettingsGet(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const user = await getAuthUser(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })

  try {
    const settings = await getUserSettings(user.id)
    return res.json({
      success: true,
      data: settings || { user_id: user.id, ...DEFAULT_SETTINGS },
    })
  } catch (error) {
    console.error('Settings fetch error:', error)
    return res.json({ success: true, data: { user_id: user.id, ...DEFAULT_SETTINGS } })
  }
}

export async function handleSettingsUpdate(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' })

  const user = await getAuthUser(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })

  const settings = req.body || {}

  try {
    const result = await updateUserSettings(user.id, settings)
    return res.json({
      success: true,
      message: 'Settings updated',
      data: result.value || result,
    })
  } catch (error) {
    console.error('Settings update error:', error)
    return res.status(500).json({ error: 'Failed to update settings' })
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'GET') {
    return handleSettingsGet(req, res)
  } else if (req.method === 'PUT') {
    return handleSettingsUpdate(req, res)
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
