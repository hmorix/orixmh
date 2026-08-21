import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Bell, Check, Cloud, Database, Globe, HardDrive, Keyboard, Palette, RefreshCw, User } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { config } from '../../lib/config'
import { useTheme } from '../../lib/ThemeContext'
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

  const shortcutModifier = useMemo(() => (/Mac|iPhone|iPad/.test(navigator.platform) ? 'Cmd' : 'Ctrl'), [])

  useEffect(() => {
    loadSettings()
    loadBrowserStorage()
    loadDriveStorage()
  }, [])

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
