import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserProfile, updateUserProfile, createUserProfile, addActivityLog } from './mongodb'

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
    return { id: user.id, email: user.email || '', name: user.user_metadata?.name }
  } catch {
    return null
  }
}

export async function handleProfileGet(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const user = await getAuthUser(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })

  try {
    const profile = await getUserProfile(user.id)
    if (!profile) {
      return res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: null,
          bio: null,
          country: null,
          avatar_url: null,
          social_links: {},
        },
      })
    }
    return res.json({ success: true, data: profile })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return res.status(500).json({ error: 'Failed to fetch profile' })
  }
}

export async function handleProfileUpdate(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' })

  const user = await getAuthUser(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })

  const { name, username, bio, country, avatar_url, social_links } = req.body || {}

  try {
    // Check if profile exists
    const existing = await getUserProfile(user.id)

    let result
    if (!existing) {
      result = await createUserProfile({
        user_id: user.id,
        email: user.email,
        name,
        username,
        bio,
        country,
        avatar_url,
        social_links,
      })
    } else {
      result = await updateUserProfile(user.id, {
        name,
        username,
        bio,
        country,
        avatar_url,
        social_links,
      })
    }

    // Log activity
    await addActivityLog({
      user_id: user.id,
      action: 'profile_updated',
      entity_type: 'profile',
      details: { name, username, bio, country },
    })

    return res.json({ success: true, message: 'Profile updated', data: result.value || result })
  } catch (error) {
    console.error('Profile update error:', error)
    return res.status(500).json({ error: 'Failed to update profile' })
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
    return handleProfileGet(req, res)
  } else if (req.method === 'PUT') {
    return handleProfileUpdate(req, res)
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
