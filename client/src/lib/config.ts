/**
 * Configuration utilities for environment variables
 * Ensures all URLs and API endpoints use environment variables
 */

export const config = {
  // Application URLs
  appUrl: import.meta.env.VITE_APP_URL || 'https://hmorix.in',
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  billingFlowUrl: import.meta.env.VITE_BILLINGFLOW_URL || 'https://billingflow.hmorix.in',
  
  // Supabase
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  
  // Google Maps Platform
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  
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
    setup2fa: `${config.apiUrl}/auth/2fa/setup`,
    verifyEnable2fa: `${config.apiUrl}/auth/2fa/verify-enable`,
    disable2fa: `${config.apiUrl}/auth/2fa/disable`,
    authenticate2fa: `${config.apiUrl}/auth/2fa/authenticate`,
  },
  sessions: {
    list: `${config.apiUrl}/account/sessions`,
    revoke: `${config.apiUrl}/account/sessions`,
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
