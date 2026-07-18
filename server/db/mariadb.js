const mysql = require('mysql2/promise')

let pool

function getPool() {
  if (pool) return pool
  pool = mysql.createPool({
    host: process.env.MARIADB_HOST || process.env.DB_HOST || 'localhost',
    port: Number(process.env.MARIADB_PORT || process.env.DB_PORT || 3306),
    user: process.env.MARIADB_USER || process.env.DB_USER || 'root',
    password: process.env.MARIADB_PASSWORD ?? process.env.DB_PASSWORD ?? '',
    database: process.env.MARIADB_DATABASE || process.env.DB_NAME || 'hmorix',
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_SIZE || 5),
    charset: 'utf8mb4',
  })
  return pool
}

async function ensureAuthTables() {
  const db = getPool()
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin','user','editor') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      token VARCHAR(700) NOT NULL,
      ip_address VARCHAR(64),
      user_agent TEXT,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_token (token(255))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
}

async function findUserByEmail(email) {
  const [rows] = await getPool().execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email])
  return rows[0] || null
}

async function createUser({ name, email, passwordHash, role = 'admin' }) {
  const [result] = await getPool().execute(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, role]
  )
  return { id: result.insertId, name, email, role }
}

async function saveSession({ userId, token, ipAddress, userAgent, expiresAt }) {
  await getPool().execute(
    'INSERT INTO sessions (user_id, token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)',
    [userId, token, ipAddress || '', userAgent || '', expiresAt]
  )
}

async function deleteSession(token) {
  await getPool().execute('DELETE FROM sessions WHERE token = ?', [token])
}

async function healthMaria() {
  await getPool().execute('SELECT 1')
}

module.exports = { getPool, ensureAuthTables, findUserByEmail, createUser, saveSession, deleteSession, healthMaria }
