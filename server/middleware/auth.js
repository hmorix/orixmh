const jwt = require('jsonwebtoken')

function tokenFromRequest(req) {
  const header = req.headers.authorization || ''
  if (header.startsWith('Bearer ')) return header.slice(7)
  return req.cookies?.token || null
}

function requireAdmin(req, res, next) {
  const token = tokenFromRequest(req)
  if (!token) return res.status(401).json({ error: 'Admin login required' })

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'hmorix-dev-secret-change-me')
    if (user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = { requireAdmin, tokenFromRequest }
