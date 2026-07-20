import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api, config } from './config'
import { supabase } from './supabase'

type AppUser = {
  id: string
  email: string
  name?: string
  displayName?: string
  username?: string
  role?: string
  emailVerified?: boolean
  providers?: string[]
  user_metadata?: { name?: string }
}

type AppSession = {
  user: AppUser
  access_token?: string
  expiresAt?: string
}

interface AuthContextType {
  user: AppUser | null
  session: AppSession | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: { name?: string; company?: string }) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', ...(options.headers || {}) },
    ...options,
  })
  const data = await response.json().catch(() => ({}))
  if (response.status === 401) {
    localStorage.removeItem('hm_token')
    Object.keys(localStorage).filter(key => key.startsWith('sb-')).forEach(key => localStorage.removeItem(key))
  }
  if (!response.ok) throw new Error(data.error || data.message || 'Request failed')
  return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [session, setSession] = useState<AppSession | null>(null)
  const [loading] = useState(false)

  useEffect(() => {
    apiRequest(api.auth.me)
      .then(data => {
        if (!data.user) {
          setUser(null)
          setSession(null)
          return
        }
        const nextUser = { ...data.user, user_metadata: { name: data.user.name || data.user.displayName } }
        setUser(nextUser)
        setSession({ user: nextUser, access_token: 'cookie-session' })
      })
      .catch(() => {
        setUser(null)
        setSession(null)
      })
  }, [])

  const signUp = async (email: string, password: string, metadata?: { name?: string; company?: string }) => {
    try {
      await apiRequest(api.auth.signup, {
        method: 'POST',
        body: JSON.stringify({ email, password, name: metadata?.name, company: metadata?.company }),
      })
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const data = await apiRequest(api.auth.signin, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      const nextUser = { ...data.user, user_metadata: { name: data.user.name || data.user.displayName } }
      setUser(nextUser)
      setSession({ user: nextUser, access_token: 'cookie-session' })
      return { error: null }
    } catch (error: any) {
      setUser(null)
      setSession(null)
      return { error }
    }
  }

  const signOut = async () => {
    await fetch(`${config.apiUrl}/logout`, { method: 'POST', credentials: 'include' }).catch(() => null)
    await supabase.auth.signOut().catch(() => null)
    localStorage.removeItem('hm_token')
    setUser(null)
    setSession(null)
  }

  const resetPassword = async (email: string) => {
    try {
      await apiRequest(`${config.apiUrl}/auth/forgot-password`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
