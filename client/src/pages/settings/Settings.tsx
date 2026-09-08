import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Bell, Check, Cloud, Database, Globe, HardDrive, Keyboard, Palette, RefreshCw, User, ShieldCheck, Laptop, Smartphone, AlertTriangle, Key, Trash2, Copy, CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { config } from '../../lib/config'
import { useTheme } from '../../lib/ThemeContext'
import { useAuth } from '../../lib/AuthContext'
import SEOHead from '../../components/seo/SEOHead'

type DriveStorage = {
  connected: boolean
  email?: string
  usedBytes?: number
  limitBytes?: number
  remainingBytes?: number
  updatedAt?: string
  error?: string
}

const defaults: any = {
  displayName: '',
  username: '',
  email: '',
  company: '',
  emailNotifications: true,
  pushNotifications: true,
  securityAlerts: true,
  productUpdates: false,
  marketingEmails: false,
  weeklyDigest: true,
  ticketUpdates: true,
  invoiceReminders: true,
  theme: 'dark',
  accentColor: '#C8FF00',
  fontSize: 14,
  sidebarExpanded: true,
  language: 'en-US',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  currency: 'INR',
  storageLimitGb: 10,
  keyboardShortcuts: true,
}

const sections = [
  { id: 'general', label: 'General', icon: User },
  { id: 'security', label: 'Security & 2FA', icon: ShieldCheck },
  { id: 'sessions', label: 'Active Sessions', icon: Laptop },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'language', label: 'Language & Region', icon: Globe },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'data', label: 'Data & Storage', icon: Database },
]

export default function Settings() {
  const [params] = useSearchParams()
  const [activeSection, setActiveSection] = useState(params.get('section') || 'general')
  const [settings, setSettings] = useState(defaults)
  const [message, setMessage] = useState(params.get('drive') === 'connected' ? 'Google Drive connected.' : '')
  const [saving, setSaving] = useState(false)
  const [browserStorage, setBrowserStorage] = useState<{ used: number; limit: number } | null>(null)
  const [drive, setDrive] = useState<DriveStorage>({ connected: false })
  const [driveLoading, setDriveLoading] = useState(false)
  const { setTheme, setAccentColor } = useTheme()
  const { user, refreshUser } = useAuth()

  // Active Sessions state
  const [sessionsList, setSessionsList] = useState<any[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)

  // Two-Factor Authentication state
  const [twoFactorSetup, setTwoFactorSetup] = useState<{
    secret: string
    otpauthUrl: string
    qrCodeUrl: string
    recoveryCodes: string[]
  } | null>(null)
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [twoFactorDisablePassword, setTwoFactorDisablePassword] = useState('')
  const [twoFactorDisableCode, setTwoFactorDisableCode] = useState('')
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState(false)

  const shortcutModifier = useMemo(() => (/Mac|iPhone|iPad/.test(navigator.platform) ? 'Cmd' : 'Ctrl'), [])

  useEffect(() => {
    loadSettings()
    loadBrowserStorage()
    loadDriveStorage()
    loadSessions()
  }, [])

  useEffect(() => {
    if (activeSection === 'sessions') {
      loadSessions()
    }
  }, [activeSection])

  useEffect(() => {
    document.documentElement.lang = settings.language || 'en-US'
    document.documentElement.style.fontSize = `${settings.fontSize || 14}px`
  }, [settings.language, settings.fontSize])

  async function loadSettings() {
    try {
      const response = await fetch(`${config.apiUrl}/settings`, { credentials: 'include', cache: 'no-store' })
      const payload = await response.json().catch(() => ({}))
      if (response.status === 401) {
        window.location.href = '/retry'
        return
      }
      if (!response.ok) throw new Error(payload.error || 'Unable to load settings')
      const next = { ...defaults, ...(payload.data || {}) }
      setSettings(next)
      await setTheme(next.theme)
      await setAccentColor(next.accentColor)
    } catch (error: any) {
      setMessage(error.message || 'Unable to load settings')
    }
  }

  async function loadBrowserStorage() {
    if (!navigator.storage?.estimate) return
    const estimate = await navigator.storage.estimate()
    setBrowserStorage({ used: estimate.usage || 0, limit: estimate.quota || 0 })
  }

  async function loadDriveStorage() {
    setDriveLoading(true)
    try {
      const response = await fetch(`${config.apiUrl}/settings/google-drive/status`, { credentials: 'include', cache: 'no-store' })
      const payload = await response.json().catch(() => ({}))
      if (response.status !== 401) setDrive(payload.data || { connected: false })
    } catch {
      setDrive({ connected: false, error: 'Google Drive status is unavailable' })
    } finally {
      setDriveLoading(false)
    }
  }

  async function save(next = settings, quiet = false) {
    setSaving(true)
    if (!quiet) setMessage('')
    try {
      const response = await fetch(`${config.apiUrl}/settings`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
      const payload = await response.json().catch(() => ({}))
      if (response.status === 401) {
        window.location.href = '/retry'
        return
      }
      if (!response.ok) throw new Error(payload.error || 'Failed to save settings')
      const saved = { ...defaults, ...payload.data }
      setSettings(saved)
      localStorage.setItem('keyboardShortcuts', String(saved.keyboardShortcuts))
      window.dispatchEvent(new CustomEvent('hm-settings-change', { detail: { keyboardShortcuts: saved.keyboardShortcuts } }))
      await setTheme(saved.theme)
      await setAccentColor(saved.accentColor)
      if (!quiet) setMessage('Settings saved.')
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  function update(key: string, value: any) {
    setSettings((current: any) => ({ ...current, [key]: value }))
  }

  function toggle(key: string) {
    const next = { ...settings, [key]: !settings[key] }
    setSettings(next)
    if (key === 'keyboardShortcuts') {
      localStorage.setItem('keyboardShortcuts', String(next.keyboardShortcuts))
      window.dispatchEvent(new CustomEvent('hm-settings-change', { detail: { keyboardShortcuts: next.keyboardShortcuts } }))
    }
    save(next, true)
  }

  async function requestPushPermission() {
    if (!('Notification' in window)) {
      setMessage('Browser notifications are not supported on this device.')
      return
    }
    const permission = await Notification.requestPermission()
    const next = { ...settings, pushNotifications: permission === 'granted' }
    setSettings(next)
    await save(next)
    setMessage(permission === 'granted' ? 'Browser notifications enabled.' : 'Browser notifications are blocked.')
  }

  async function connectGoogleDrive() {
    setDriveLoading(true)
    setMessage('')
    try {
      const response = await fetch(`${config.apiUrl}/settings/google-drive/connect`, { credentials: 'include' })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Google Drive is not configured')
      window.location.href = payload.authUrl
    } catch (error: any) {
      setMessage(error.message)
      setDriveLoading(false)
    }
  }

  async function disconnectGoogleDrive() {
    setDriveLoading(true)
    const response = await fetch(`${config.apiUrl}/settings/google-drive`, { method: 'DELETE', credentials: 'include' })
    if (response.ok) setDrive({ connected: false })
    setDriveLoading(false)
  }

  async function loadSessions() {
    setSessionsLoading(true)
    try {
      const response = await fetch(`${config.apiUrl}/account/sessions`, { credentials: 'include', cache: 'no-store' })
      const payload = await response.json().catch(() => ({}))
      if (response.status === 401) {
        window.location.href = '/retry'
        return
      }
      if (payload.success && Array.isArray(payload.data)) {
        setSessionsList(payload.data)
      }
    } catch {
      // ignore
    } finally {
      setSessionsLoading(false)
    }
  }

  async function revokeSession(id: string) {
    try {
      const response = await fetch(`${config.apiUrl}/account/sessions`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Failed to revoke session')
      setMessage('Session successfully revoked.')
      await loadSessions()
    } catch (err: any) {
      setMessage(err.message || 'Failed to revoke session')
    }
  }

  async function revokeOtherSessions() {
    try {
      const response = await fetch(`${config.apiUrl}/account/sessions`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke_others' }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Failed to revoke sessions')
      setMessage(payload.message || 'All other sessions have been revoked.')
      await loadSessions()
    } catch (err: any) {
      setMessage(err.message || 'Failed to revoke other sessions')
    }
  }

  async function initiate2faSetup() {
    setTwoFactorLoading(true)
    setMessage('')
    try {
      const response = await fetch(`${config.apiUrl}/auth/2fa/setup`, {
        method: 'POST',
        credentials: 'include',
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Failed to initiate 2FA setup')
      setTwoFactorSetup({
        secret: payload.secret,
        otpauthUrl: payload.otpauthUrl,
        qrCodeUrl: payload.qrCodeUrl,
        recoveryCodes: payload.recoveryCodes || [],
      })
      setTwoFactorCode('')
    } catch (err: any) {
      setMessage(err.message || 'Failed to initiate 2FA setup')
    } finally {
      setTwoFactorLoading(false)
    }
  }

  async function verifyAndEnable2fa() {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setMessage('Please enter a valid 6-digit code')
      return
    }
    setTwoFactorLoading(true)
    setMessage('')
    try {
      const response = await fetch(`${config.apiUrl}/auth/2fa/verify-enable`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: twoFactorCode }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Failed to verify 2FA code')
      setMessage('Two-factor authentication successfully enabled!')
      setTwoFactorSetup(null)
      setTwoFactorCode('')
      await refreshUser()
    } catch (err: any) {
      setMessage(err.message || 'Failed to verify 2FA code')
    } finally {
      setTwoFactorLoading(false)
    }
  }

  async function disable2fa() {
    if (!twoFactorDisablePassword || !twoFactorDisableCode) {
      setMessage('Password and current 2FA code are required to disable 2FA')
      return
    }
    setTwoFactorLoading(true)
    setMessage('')
    try {
      const response = await fetch(`${config.apiUrl}/auth/2fa/disable`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: twoFactorDisablePassword, code: twoFactorDisableCode }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Failed to disable 2FA')
      setMessage('Two-factor authentication disabled.')
      setShowDisableConfirm(false)
      setTwoFactorDisablePassword('')
      setTwoFactorDisableCode('')
      await refreshUser()
    } catch (err: any) {
      setMessage(err.message || 'Failed to disable 2FA')
    } finally {
      setTwoFactorLoading(false)
    }
  }

  return (
    <div className="pt-32 pb-20">
      <SEOHead title="Settings" description="Manage HMorix account, notification, appearance, region, shortcut, storage, and Google Drive preferences." keywords="HMorix settings, Google Drive storage, account settings" canonical="/settings" />
      <div className="max-w-[1280px] mx-auto px-8">
        <h1 className="section-title mb-2">Settings</h1>
        <p className="text-cream/50 mb-8">Manage account behavior, interface preferences, regional formats, shortcuts, and storage connections.</p>
        {message && <div className="mb-6 p-3 bg-white/[0.04] border border-glass-border rounded-[8px] text-sm text-cream/70">{message}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          <nav className="space-y-1">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-[8px] transition-all ${activeSection === s.id ? 'bg-[#C8FF00]/10 text-[#C8FF00]' : 'text-cream/50 hover:text-cream hover:bg-white/[0.04]'}`}>
                <s.icon size={16} />{s.label}
              </button>
            ))}
          </nav>

          <div className="space-y-6">
            {activeSection === 'general' && (
              <Panel title="Account Information">
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Display Name" value={settings.displayName} onChange={value => update('displayName', value)} />
                  <Field label="Username" value={settings.username} onChange={value => update('username', value)} />
                  <Field label="Email" value={settings.email} disabled onChange={() => null} />
                  <Field label="Company" value={settings.company} onChange={value => update('company', value)} />
                </div>
                <button onClick={() => save()} disabled={saving} className="mt-4 btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
              </Panel>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <Panel title="Two-Factor Authentication (2FA)">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white/[0.02] border border-glass-border rounded-[8px]">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-[8px] ${user?.twoFactorEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm text-cream">Google Authenticator (RFC 6238 TOTP)</h4>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${user?.twoFactorEnabled ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'}`}>
                            {user?.twoFactorEnabled ? 'Active' : 'Not Configured'}
                          </span>
                        </div>
                        <p className="text-xs text-cream/50 mt-1 max-w-xl">
                          Require a 6-digit verification code from Google Authenticator, Authy, or 1Password when signing in to your account.
                        </p>
                      </div>
                    </div>
                    <div>
                      {user?.twoFactorEnabled ? (
                        <button
                          onClick={() => setShowDisableConfirm(!showDisableConfirm)}
                          className="px-4 py-2 text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded-[6px] transition-colors"
                        >
                          {showDisableConfirm ? 'Cancel' : 'Disable 2FA'}
                        </button>
                      ) : (
                        <button
                          onClick={initiate2faSetup}
                          disabled={twoFactorLoading}
                          className="btn-primary text-xs px-4 py-2 disabled:opacity-50"
                        >
                          {twoFactorLoading ? 'Initiating...' : 'Setup Two-Factor Auth'}
                        </button>
                      )}
                    </div>
                  </div>

                  {showDisableConfirm && (
                    <div className="mt-4 p-4 bg-red-500/[0.04] border border-red-500/20 rounded-[8px] space-y-3">
                      <h5 className="text-sm font-medium text-red-400">Confirm 2FA Deactivation</h5>
                      <p className="text-xs text-cream/60">
                        To disable two-factor authentication, verify your account password and the current 6-digit code from your authenticator app.
                      </p>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-cream/40 mb-1">Account Password</label>
                          <input
                            type="password"
                            value={twoFactorDisablePassword}
                            onChange={e => setTwoFactorDisablePassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded text-xs text-cream outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-cream/40 mb-1">Current 6-digit 2FA Code</label>
                          <input
                            type="text"
                            maxLength={6}
                            value={twoFactorDisableCode}
                            onChange={e => setTwoFactorDisableCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="123456"
                            className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded text-xs font-mono tracking-wider text-cream outline-none focus:border-red-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          onClick={() => setShowDisableConfirm(false)}
                          className="px-3 py-1.5 text-xs text-cream/60 hover:text-cream rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={disable2fa}
                          disabled={twoFactorLoading || !twoFactorDisablePassword || twoFactorDisableCode.length !== 6}
                          className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-medium disabled:opacity-40"
                        >
                          {twoFactorLoading ? 'Disabling...' : 'Confirm & Disable'}
                        </button>
                      </div>
                    </div>
                  )}

                  {twoFactorSetup && (
                    <div className="mt-6 p-6 bg-white/[0.02] border border-[#C8FF00]/30 rounded-[8px] space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-cream flex items-center gap-2">
                          <Key size={16} className="text-[#C8FF00]" /> Step-by-Step 2FA Setup
                        </h4>
                        <button
                          onClick={() => setTwoFactorSetup(null)}
                          className="text-xs text-cream/40 hover:text-cream"
                        >
                          Cancel Setup
                        </button>
                      </div>

                      <div className="grid md:grid-cols-[220px_1fr] gap-6 items-center">
                        <div className="flex flex-col items-center p-3 bg-white rounded-[8px] border border-glass-border shadow-md">
                          <img
                            src={twoFactorSetup.qrCodeUrl}
                            alt="2FA QR Code"
                            className="w-[180px] h-[180px] object-contain"
                          />
                          <span className="text-[10px] text-zinc-600 font-mono mt-1">Scan with Google Authenticator</span>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-cream/70 mb-2">
                              1. Scan the QR code with <strong>Google Authenticator</strong>, <strong>Authy</strong>, or any TOTP client.
                            </p>
                            <p className="text-xs text-cream/50 mb-1">
                              Or manually enter this secret key if your camera is unavailable:
                            </p>
                            <div className="flex items-center gap-2">
                              <code className="px-3 py-1.5 bg-obsidian border border-glass-border rounded font-mono text-xs text-[#C8FF00] tracking-wider select-all">
                                {twoFactorSetup.secret}
                              </code>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(twoFactorSetup.secret)
                                  setCopiedSecret(true)
                                  setTimeout(() => setCopiedSecret(false), 2000)
                                }}
                                className="p-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-cream/70 rounded border border-glass-border text-xs flex items-center gap-1"
                              >
                                {copiedSecret ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                <span className="text-[11px]">{copiedSecret ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-cream/70 mb-2">
                              2. Enter the 6-digit code currently shown in your authenticator app to confirm activation:
                            </p>
                            <div className="flex items-center gap-3">
                              <input
                                type="text"
                                maxLength={6}
                                placeholder="000000"
                                value={twoFactorCode}
                                onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                                className="w-32 px-4 py-2 bg-obsidian border border-glass-border rounded-[4px] font-mono text-center text-base tracking-[0.25em] text-cream outline-none focus:border-[#C8FF00]"
                              />
                              <button
                                onClick={verifyAndEnable2fa}
                                disabled={twoFactorLoading || twoFactorCode.length !== 6}
                                className="btn-primary text-xs px-5 py-2 disabled:opacity-40"
                              >
                                {twoFactorLoading ? 'Verifying...' : 'Verify & Enable'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-glass-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
                            <AlertTriangle size={14} /> Emergency Recovery Backup Codes
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(twoFactorSetup.recoveryCodes.join('\n'))
                              setCopiedCodes(true)
                              setTimeout(() => setCopiedCodes(false), 2000)
                            }}
                            className="text-xs text-cream/50 hover:text-cream flex items-center gap-1"
                          >
                            {copiedCodes ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            {copiedCodes ? 'Copied to clipboard' : 'Copy all codes'}
                          </button>
                        </div>
                        <p className="text-[11px] text-cream/40 mb-3">
                          Store these single-use codes safely. If you lose access to your authenticator device, any of these codes can be used in place of your 6-digit code during sign-in.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {twoFactorSetup.recoveryCodes.map((code, idx) => (
                            <div key={idx} className="p-2 bg-obsidian/70 border border-glass-border rounded text-center font-mono text-xs text-cream/80 select-all">
                              {code}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Panel>

                <Panel title="Security Best Practices">
                  <div className="space-y-3 text-xs text-cream/60">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-[#C8FF00] shrink-0 mt-0.5" />
                      <span><strong>RFC 6238 Standard:</strong> HMorix uses standard time-based one-time passwords compatible with any standard authenticator app.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-[#C8FF00] shrink-0 mt-0.5" />
                      <span><strong>Cryptographic Hash Storage:</strong> Emergency recovery codes are salted and hashed using SHA-256 before being stored in the database.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-[#C8FF00] shrink-0 mt-0.5" />
                      <span><strong>Brute Force & Clock Drift:</strong> 2FA verifications include strict rate limiting and an 80-second clock-drift window to guarantee resilience.</span>
                    </div>
                  </div>
                </Panel>
              </div>
            )}

            {activeSection === 'sessions' && (
              <Panel title="Active Sessions & Devices">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <p className="text-xs text-cream/50 max-w-lg">
                    Active browser and device logins associated with your account. Revoke any unfamiliar session to force sign-out.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={loadSessions}
                      disabled={sessionsLoading}
                      className="p-2 rounded-[6px] bg-white/[0.04] text-cream/60 hover:text-cream border border-glass-border disabled:opacity-50"
                      title="Refresh active sessions"
                    >
                      <RefreshCw size={14} className={sessionsLoading ? 'animate-spin' : ''} />
                    </button>
                    <button
                      onClick={revokeOtherSessions}
                      disabled={sessionsLoading || sessionsList.filter(s => !s.isCurrent).length === 0}
                      className="btn-outline text-xs px-3 py-2 text-red-400 hover:text-red-300 hover:border-red-500/50 disabled:opacity-40"
                    >
                      Log Out All Other Devices
                    </button>
                  </div>
                </div>

                {sessionsLoading && sessionsList.length === 0 ? (
                  <div className="p-8 text-center text-sm text-cream/40">Loading active sessions...</div>
                ) : sessionsList.length === 0 ? (
                  <div className="p-8 text-center text-sm text-cream/40">No active sessions found.</div>
                ) : (
                  <div className="space-y-3">
                    {sessionsList.map(session => {
                      const isMobile = session.device === 'Android' || session.device === 'iPhone' || session.device === 'iPad'
                      const DeviceIcon = isMobile ? Smartphone : Laptop

                      return (
                        <div
                          key={session.id}
                          className={`p-4 rounded-[8px] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                            session.isCurrent
                              ? 'bg-[#C8FF00]/[0.03] border-[#C8FF00]/20'
                              : 'bg-white/[0.02] border-glass-border hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            <div className={`p-2.5 rounded-[8px] mt-0.5 ${session.isCurrent ? 'bg-[#C8FF00]/10 text-[#C8FF00]' : 'bg-white/[0.04] text-cream/60'}`}>
                              <DeviceIcon size={20} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-cream">
                                  {session.browser} on {session.os}
                                </span>
                                {session.isCurrent && (
                                  <span className="px-2 py-0.5 text-[10px] rounded-full font-medium bg-[#C8FF00]/15 text-[#C8FF00] border border-[#C8FF00]/30">
                                    Current Device
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cream/40 mt-1">
                                <span>IP: {session.ip}</span>
                                <span>•</span>
                                <span>Device: {session.device}</span>
                                <span>•</span>
                                <span>Last active: {new Date(session.lastActive).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            {!session.isCurrent ? (
                              <button
                                onClick={() => revokeSession(session.id)}
                                className="p-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-[6px] border border-red-500/20 flex items-center gap-1.5 transition-colors"
                                title="Revoke session"
                              >
                                <Trash2 size={14} />
                                <span>Revoke</span>
                              </button>
                            ) : (
                              <span className="text-xs text-cream/30 italic">Active Now</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Panel>
            )}

            {activeSection === 'notifications' && (
              <Panel title="Notification Preferences">
                <div className="space-y-3">
                  <Toggle label="Email notifications" desc="Important account, workflow, support, and billing emails" enabled={settings.emailNotifications} onClick={() => toggle('emailNotifications')} />
                  <Toggle label="Browser push notifications" desc={notificationStatus()} enabled={settings.pushNotifications} onClick={requestPushPermission} />
                  <Toggle label="Security alerts" desc="Sensitive account activity and sign-in warnings" enabled={settings.securityAlerts} onClick={() => toggle('securityAlerts')} />
                  <Toggle label="Product updates" desc="New features and platform release notes" enabled={settings.productUpdates} onClick={() => toggle('productUpdates')} />
                  <Toggle label="Marketing emails" desc="Promotions and growth tips" enabled={settings.marketingEmails} onClick={() => toggle('marketingEmails')} />
                  <Toggle label="Weekly digest" desc="A weekly summary of activity and pending work" enabled={settings.weeklyDigest} onClick={() => toggle('weeklyDigest')} />
                  <Toggle label="Ticket updates" desc="Support ticket replies and status changes" enabled={settings.ticketUpdates} onClick={() => toggle('ticketUpdates')} />
                  <Toggle label="Invoice reminders" desc="Upcoming and overdue invoice alerts" enabled={settings.invoiceReminders} onClick={() => toggle('invoiceReminders')} />
                </div>
              </Panel>
            )}

            {activeSection === 'appearance' && (
              <Panel title="Appearance">
                <div className="space-y-6">
                  <Select label="Theme" value={settings.theme} options={['dark', 'light', 'system']} onChange={value => update('theme', value)} />
                  <div>
                    <label className="block text-sm font-medium mb-3">Accent Color</label>
                    <div className="flex flex-wrap gap-3">{['#C8FF00','#00D4FF','#FF6B6B','#A855F7','#F59E0B','#10B981'].map(c => <button key={c} title={c} onClick={() => update('accentColor', c)} className={`w-8 h-8 rounded-full border-2 ${settings.accentColor === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}</div>
                  </div>
                  <div><label className="block text-sm font-medium mb-3">Font Size: {settings.fontSize}px</label><input type="range" min="12" max="18" value={settings.fontSize} onChange={e => update('fontSize', Number(e.target.value))} className="w-full" /></div>
                  <Toggle label="Expanded sidebar" desc="Keep workspace navigation expanded by default" enabled={settings.sidebarExpanded} onClick={() => toggle('sidebarExpanded')} />
                  <button onClick={() => save()} disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save Appearance'}</button>
                </div>
              </Panel>
            )}

            {activeSection === 'language' && (
              <Panel title="Language & Region">
                <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
                  <Select label="Language" value={settings.language} options={['en-US', 'en-GB', 'hi-IN']} onChange={value => update('language', value)} />
                  <Select label="Timezone" value={settings.timezone} options={['Asia/Kolkata', 'America/Los_Angeles', 'America/New_York', 'Europe/London']} onChange={value => update('timezone', value)} />
                  <Select label="Date Format" value={settings.dateFormat} options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']} onChange={value => update('dateFormat', value)} />
                  <Select label="Currency" value={settings.currency} options={['INR', 'USD', 'EUR', 'GBP']} onChange={value => update('currency', value)} />
                </div>
                <p className="mt-4 text-sm text-cream/40">Preview: {formatPreview(settings)}</p>
                <button onClick={() => save()} disabled={saving} className="mt-4 btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save Region'}</button>
              </Panel>
            )}

            {activeSection === 'shortcuts' && (
              <Panel title="Keyboard Shortcuts">
                <Toggle label="Keyboard shortcuts" desc="Enable global app navigation shortcuts" enabled={settings.keyboardShortcuts} onClick={() => toggle('keyboardShortcuts')} />
                <div className="mt-4 space-y-2">
                  {[
                    ['Open command palette', `${shortcutModifier} + K`],
                    ['Go to dashboard', `${shortcutModifier} + D`],
                    ['Toggle theme', `${shortcutModifier} + Shift + T`],
                    ['Open settings', `${shortcutModifier} + ,`],
                  ].map(([action, keys]) => <div key={action} className="flex items-center justify-between gap-4 p-3 bg-white/[0.02] rounded-[8px]"><span className="text-sm">{action}</span><kbd className="px-2 py-1 bg-white/[0.06] border border-glass-border rounded text-xs font-mono text-cream/60 whitespace-nowrap">{keys}</kbd></div>)}
                </div>
              </Panel>
            )}

            {activeSection === 'data' && (
              <Panel title="Data & Storage">
                <div className="grid lg:grid-cols-2 gap-4">
                  <StorageCard icon={<HardDrive size={18} />} title="Browser App Storage" used={browserStorage?.used || 0} limit={browserStorage?.limit || 0} />
                  <div className="p-4 bg-white/[0.02] border border-glass-border rounded-[8px]">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-2"><Cloud size={18} /><span className="font-medium text-sm">Google Drive Storage</span></div>
                      <button onClick={loadDriveStorage} disabled={driveLoading} className="p-2 rounded-[6px] bg-white/[0.04] text-cream/60 hover:text-cream disabled:opacity-50" title="Refresh Google Drive storage"><RefreshCw size={14} /></button>
                    </div>
                    {drive.connected ? (
                      <>
                        <div className="text-xs text-cream/40 mb-3">{drive.email || 'Connected account'}</div>
                        <StorageMeter used={drive.usedBytes || 0} limit={drive.limitBytes || 0} />
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button onClick={loadDriveStorage} disabled={driveLoading} className="btn-outline text-sm disabled:opacity-50">Refresh Storage</button>
                          <button onClick={disconnectGoogleDrive} disabled={driveLoading} className="text-sm text-red-400 disabled:opacity-50">Disconnect</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-cream/45 mb-4">{drive.error || 'Connect Google Drive to show your real Drive storage used, limit, and remaining space.'}</p>
                        <button onClick={connectGoogleDrive} disabled={driveLoading} className="btn-primary disabled:opacity-50">{driveLoading ? 'Connecting...' : 'Connect Google Drive'}</button>
                      </>
                    )}
                  </div>
                </div>
                <button className="mt-4 btn-outline text-sm">Request Data Export</button>
              </Panel>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="p-6 bg-obsidian-2 border border-glass-border rounded-[8px]"><h3 className="font-display font-semibold mb-4">{title}</h3>{children}</section>
}

function Field({ label, value, onChange, disabled }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return <div><label className="block text-xs text-cream/40 mb-1">{label}</label><input type="text" value={value || ''} disabled={disabled} onChange={e => onChange(e.target.value)} className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00] disabled:text-cream/40" /></div>
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <div><label className="block text-xs text-cream/40 mb-1">{label}</label><select value={value} onChange={e => onChange(e.target.value)} className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00]">{options.map(option => <option key={option} value={option}>{option}</option>)}</select></div>
}

function Toggle({ label, desc, enabled, onClick }: { label: string; desc: string; enabled: boolean; onClick: () => void }) {
  return <div className="flex items-center justify-between gap-4 p-3 bg-white/[0.02] rounded-[8px]"><div><div className="text-sm font-medium">{label}</div><div className="text-[11px] text-cream/35">{desc}</div></div><button onClick={onClick} className={`w-10 h-5 rounded-full transition-all ${enabled ? 'bg-[#C8FF00]' : 'bg-white/10'} relative`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-obsidian transition-all ${enabled ? 'right-0.5' : 'left-0.5'}`} /></button></div>
}

function StorageCard({ icon, title, used, limit }: { icon: ReactNode; title: string; used: number; limit: number }) {
  return <div className="p-4 bg-white/[0.02] border border-glass-border rounded-[8px]"><div className="flex items-center gap-2 mb-4">{icon}<span className="font-medium text-sm">{title}</span></div><StorageMeter used={used} limit={limit} /></div>
}

function StorageMeter({ used, limit }: { used: number; limit: number }) {
  const remaining = Math.max(0, limit - used)
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0
  return <div><div className="flex justify-between text-sm mb-2"><span>{formatBytes(remaining)} left</span><span className="text-cream/40">{formatBytes(used)} of {limit ? formatBytes(limit) : 'unknown'}</span></div><div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden"><div className="h-full bg-[#C8FF00] rounded-full" style={{ width: `${percent}%` }} /></div><div className="mt-2 text-xs text-cream/35">{percent}% used</div></div>
}

function formatBytes(value: number) {
  if (!value) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1)
  return `${(value / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

function notificationStatus() {
  if (!('Notification' in window)) return 'Not supported by this browser'
  if (Notification.permission === 'granted') return 'Allowed by browser'
  if (Notification.permission === 'denied') return 'Blocked in browser site settings'
  return 'Ask browser permission before enabling'
}

function formatPreview(settings: any) {
  const locale = settings.language || 'en-US'
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: settings.timezone }).format(new Date())
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: settings.currency || 'USD' }).format(1250)
  return `${date} - ${money}`
}
