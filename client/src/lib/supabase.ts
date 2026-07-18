import { createClient } from '@supabase/supabase-js'
import { config, getOAuthRedirectUrl } from './config'

const supabaseUrl = config.supabaseUrl
const supabaseAnonKey = config.supabaseKey

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not set. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment.')
}

if (!config.appUrl) {
  console.warn('⚠️ VITE_APP_URL not set. OAuth and email verification may not work correctly.')
}

// Create a safe client that won't crash the app if env vars are missing
const createSafeClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a proxy or a dummy object to prevent immediate crashes
    // but log a clear error for the developer
    console.error('❌ Supabase initialization failed: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY is missing.')
    return new Proxy({} as any, {
      get: (target, prop) => {
        if (prop === 'auth') return new Proxy({} as any, { get: () => () => Promise.resolve({ data: {}, error: new Error('Supabase not initialized') }) })
        if (prop === 'from') return () => ({ select: () => ({ range: () => ({ order: () => Promise.resolve({ data: [], error: new Error('Supabase not initialized') }) }) }), insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not initialized') }) }) }), update: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not initialized') }) }) }) })
        return () => Promise.resolve({ data: null, error: new Error('Supabase not initialized') })
      }
    })
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}

export const supabase = createSafeClient()

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string, metadata?: { name?: string; company?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: getOAuthRedirectUrl('/verify'),
      },
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getOAuthRedirectUrl('/reset-password'),
    })
    return { data, error }
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession()
    return { session: data.session, error }
  },

  getUser: async () => {
    const { data, error } = await supabase.auth.getUser()
    return { user: data.user, error }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },

  signInWithOAuth: async (provider: 'google' | 'github' | 'azure', redirectTo?: string) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || getOAuthRedirectUrl('/dashboard'),
      },
    })
    return { data, error }
  },
}

// Database helpers (direct Supabase client queries)
export const db = {
  // Generic CRUD
  from: (table: string) => supabase.from(table),

  // CRM
  crm: {
    getContacts: async (page = 1, limit = 20, filters?: { search?: string; status?: string }) => {
      let query = supabase.from('crm_contacts').select('*', { count: 'exact' })
      if (filters?.search) query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`)
      if (filters?.status) query = query.eq('status', filters.status)
      const { data, count, error } = await query.range((page - 1) * limit, page * limit - 1).order('created_at', { ascending: false })
      return { data, count, error }
    },
    getDeals: async (stage?: string) => {
      let query = supabase.from('crm_deals').select('*, crm_contacts(name, company)')
      if (stage) query = query.eq('stage', stage)
      const { data, error } = await query.order('created_at', { ascending: false })
      return { data, error }
    },
  },

  // HRM
  hrm: {
    getEmployees: async (department?: string) => {
      let query = supabase.from('hrm_employees').select('*, hrm_departments(name)')
      if (department) query = query.eq('department_id', department)
      const { data, error } = await query.order('name')
      return { data, error }
    },
    getLeaveRequests: async (status?: string) => {
      let query = supabase.from('hrm_leave_requests').select('*, hrm_employees(name)')
      if (status) query = query.eq('status', status)
      const { data, error } = await query.order('created_at', { ascending: false })
      return { data, error }
    },
  },

  // Analytics
  analytics: {
    getPageViews: async (period: string) => {
      const { data, error } = await supabase.from('analytics_page_views').select('*').order('created_at', { ascending: false }).limit(100)
      return { data, error }
    },
    trackEvent: async (event: { session_id: string; visitor_id: string; event_name: string; properties?: any }) => {
      const { error } = await supabase.from('analytics_events').insert(event)
      return { error }
    },
  },
}

export default supabase
