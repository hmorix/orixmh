import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  getNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from './mongodb'

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

export async function handleNotificationsGet(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const user = await getAuthUser(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })

  try {
    const { limit = '20' } = req.query as any
    const notifications = await getNotifications(user.id, parseInt(limit))
    return res.json({ success: true, data: notifications })
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return res.status(500).json({ error: 'Failed to fetch notifications' })
  }
}

export async function handleNotificationsMarkRead(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' })

  const user = await getAuthUser(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })

  const { notification_id } = req.body || {}

  if (!notification_id) {
    return res.status(400).json({ error: 'notification_id is required' })
  }

  try {
    const result = await markNotificationAsRead(notification_id)
    return res.json({ success: true, message: 'Notification marked as read', data: result.value })
  } catch (error) {
    console.error('Mark notification error:', error)
    return res.status(500).json({ error: 'Failed to mark notification as read' })
  }
}

export async function handleNotificationsMarkAllRead(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' })

  const user = await getAuthUser(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })

  try {
    const result = await markAllNotificationsAsRead(user.id)
    return res.json({
      success: true,
      message: 'All notifications marked as read',
      modified: result.modifiedCount,
    })
  } catch (error) {
    console.error('Mark all notifications error:', error)
    return res.status(500).json({ error: 'Failed to mark all notifications as read' })
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

  // Route to different handlers based on path
  const path = req.url?.split('?')[0] || ''

  if (path.endsWith('/mark-all-read')) {
    return handleNotificationsMarkAllRead(req, res)
  } else if (path.endsWith('/mark-read')) {
    return handleNotificationsMarkRead(req, res)
  } else if (req.method === 'GET') {
    return handleNotificationsGet(req, res)
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
