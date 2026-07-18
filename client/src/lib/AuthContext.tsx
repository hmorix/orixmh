import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, auth } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: { name?: string; company?: string }) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data }: { data: { session: Session | null } }) => {
        const session = data?.session ?? null
        const expiresAt = session?.expires_at ? session.expires_at * 1000 : 0
        if (expiresAt && expiresAt <= Date.now()) {
          supabase.auth.signOut()
          setSession(null)
          setUser(null)
          return
        }
        setSession(session)
        setUser(session?.user ?? null)
      })
      .catch((error: any) => {
        console.warn('Supabase session check failed:', error?.message || error)
        Object.keys(localStorage).filter(key => key.startsWith('sb-')).forEach(key => localStorage.removeItem(key))
        setSession(null)
        setUser(null)
      })
      .finally(() => setLoading(false))

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange?.((_event: string, session: Session | null) => {
      if (_event === 'TOKEN_REFRESHED' && !session) {
        setSession(null)
        setUser(null)
        setLoading(false)
        return
      }
      if (_event === 'SIGNED_OUT') {
        setSession(null)
        setUser(null)
        setLoading(false)
        return
      }
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }) || { data: { subscription: { unsubscribe: () => {} } } }

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, metadata?: { name?: string; company?: string }) => {
    const { error } = await auth.signUp(email, password, metadata)
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await auth.signIn(email, password)
    return { error }
  }

  const signOut = async () => {
    await auth.signOut()
    setUser(null)
    setSession(null)
  }

  const resetPassword = async (email: string) => {
    const { error } = await auth.resetPassword(email)
    return { error }
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
