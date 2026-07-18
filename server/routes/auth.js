const express = require('express')
const jwt = require('jsonwebtoken')
const { tokenFromRequest } = require('../middleware/auth')
const { getSupabase } = require('../db/supabase')

const router = express.Router()

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) return res.status(401).json({ error: error?.message || 'Invalid credentials' })

  const role = data.user.user_metadata?.role || data.user.app_metadata?.role || (email === process.env.ADMIN_EMAIL ? 'admin' : 'user')
  if (role !== 'admin') return res.status(403).json({ error: 'Admin access required' })

  const payload = issueToken({
    id: data.user.id,
    email: data.user.email,
    name: data.user.user_metadata?.name || data.user.email,
    role,
  })
  return res.json({ success: true, token: payload.token, user: payload.user, storage: 'supabase' })
})

router.post('/logout', async (req, res) => {
  tokenFromRequest(req)
  res.json({ success: true })
})

router.post('/setup-admin', async (req, res) => {
  const { name = 'Admin', email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })
  const supabase = getSupabase({ admin: true })
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: 'admin' },
    app_metadata: { role: 'admin' },
  })
  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json({ success: true, user: { id: data.user.id, email: data.user.email, name, role: 'admin' } })
})

module.exports = router

function issueToken(user) {
  const expiresIn = Number(process.env.JWT_EXPIRES_IN || 86400)
  const token = jwt.sign(
    { id: user.id, sub: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET || 'hmorix-dev-secret-change-me',
    { expiresIn }
  )
  return {
    token,
    expiresAt: new Date(Date.now() + expiresIn * 1000),
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  }
}
