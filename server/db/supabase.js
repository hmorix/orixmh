const { createClient } = require('@supabase/supabase-js')

function getSupabaseKey({ admin = false } = {}) {
  if (admin) {
    return process.env.SUPABASE_ROLE_KEY
      || process.env.SUPABASE_Role_KEY
      || process.env.SUPABASE_SECRET_KEY
      || process.env.SUPABASE_SERVICE_ROLE_KEY
      || process.env.SUPABASE_PUBLISHABLE_KEY
  }
  return process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
}

function getSupabase({ admin = false } = {}) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = getSupabaseKey({ admin })
  if (!url || !key) throw new Error('Supabase URL or key is not set')
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

async function healthSupabase() {
  const supabase = getSupabase()
  const { error } = await supabase.auth.getSession()
  if (error) throw error
}

module.exports = { getSupabase, healthSupabase }
