import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api } from './config'
import { supabase } from './supabase'

interface ThemeContextType {
  theme: 'dark' | 'light' | 'system'
  accentColor: string
  setTheme: (theme: 'dark' | 'light' | 'system') => Promise<void>
  setAccentColor: (color: string) => Promise<void>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<'dark' | 'light' | 'system'>('dark')
  const [accentColor, setAccentColorState] = useState('#C8FF00')
  const [loading, setLoading] = useState(true)

  // Load theme from settings on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const session = await supabase.auth.getSession()
        if (!session.data.session) {
          // Use localStorage for anonymous users
          const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | 'system' | null
          const savedColor = localStorage.getItem('accentColor') || '#C8FF00'
          if (savedTheme) setThemeState(savedTheme)
          setAccentColorState(savedColor)
          setLoading(false)
          return
        }

        // Fetch from API for authenticated users
        const response = await fetch(api.settings.get, {
          headers: {
            'Authorization': `Bearer ${session.data.session.access_token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.data?.theme) setThemeState(data.data.theme)
          if (data.data?.accent_color) setAccentColorState(data.data.accent_color)
        }
      } catch (error) {
        console.error('Failed to load theme:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTheme()
  }, [])

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
      root.classList.toggle('light', !prefersDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
      root.classList.toggle('light', theme === 'light')
    }

    // Apply accent color
    root.style.setProperty('--accent-color', accentColor)
  }, [theme, accentColor])

  const setTheme = async (newTheme: 'dark' | 'light' | 'system') => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)

    try {
      const session = await supabase.auth.getSession()
      if (session.data.session) {
        await fetch(api.settings.update, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.data.session.access_token}`,
          },
          body: JSON.stringify({ theme: newTheme }),
        })
      }
    } catch (error) {
      console.error('Failed to save theme:', error)
    }
  }

  const setAccentColor = async (color: string) => {
    setAccentColorState(color)
    localStorage.setItem('accentColor', color)

    try {
      const session = await supabase.auth.getSession()
      if (session.data.session) {
        await fetch(api.settings.update, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.data.session.access_token}`,
          },
          body: JSON.stringify({ accent_color: color }),
        })
      }
    } catch (error) {
      console.error('Failed to save accent color:', error)
    }
  }

  if (loading) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, accentColor, setTheme, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext
