/**
 * Configuration utilities for environment variables
 * Ensures all URLs and API endpoints use environment variables
 */

export const config = {
  // Application URLs
  appUrl: import.meta.env.VITE_APP_URL || 'https://orixmh.vercel.app',
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  
  // Supabase
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  
  // NVIDIA AI
  nvidiaApiKey: import.meta.env.VITE_NVIDIA_API_KEY || '',
  nvidiaModel: import.meta.env.VITE_NVIDIA_MODEL || 'nvidia/deepseek-v4-flash',
  
  // Feature Flags
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableAiAssistant: import.meta.env.VITE_ENABLE_AI_ASSISTANT === 'true',
}

// OAuth Redirect URLs (always use appUrl)
export const getOAuthRedirectUrl = (path: string = '/dashboard') => {
  return `${config.appUrl}${path}`
}

// Email Verification URL
export const getEmailVerificationUrl = (token: string) => {
  return `${config.appUrl}/verify?token=${token}`
}

// Password Reset URL
export const getPasswordResetUrl = (token: string) => {
  return `${config.appUrl}/reset-password?token=${token}`
}

// API Endpoints
export const api = {
  auth: {
    signin: `${config.apiUrl}/auth/signin`,
    signup: `${config.apiUrl}/auth/signup`,
    me: `${config.apiUrl}/auth/me`,
  },
  profile: {
    get: `${config.apiUrl}/profile`,
    update: `${config.apiUrl}/profile`,
    uploadAvatar: `${config.apiUrl}/profile/avatar`,
  },
  notifications: {
    list: `${config.apiUrl}/notifications`,
    markRead: `${config.apiUrl}/notifications/mark-read`,
    markAllRead: `${config.apiUrl}/notifications/mark-all-read`,
  },
  settings: {
    get: `${config.apiUrl}/settings`,
    update: `${config.apiUrl}/settings`,
  },
  loginHistory: {
    list: `${config.apiUrl}/login-history`,
  },
}

export default config
