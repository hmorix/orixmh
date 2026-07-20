import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { User, Bell, Shield, Palette, Globe, Keyboard, Database, Plug } from 'lucide-react'
import { config } from '../../lib/config'
import SEOHead from '../../components/seo/SEOHead'

const sections = [
  { id: 'general', label: 'General', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security & Privacy', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'language', label: 'Language & Region', icon: Globe },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'data', label: 'Data & Storage', icon: Database },
  { id: 'integrations', label: 'Integrations', icon: Plug },
]

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
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  currency: 'INR',
  integrations: {},
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general')
  const [settings, setSettings] = useState(defaults)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`${config.apiUrl}/settings`, { credentials: 'include' })
      .then(async response => {
        if (response.status === 401) {
          window.location.href = '/retry'
          return null
        }
        return response.json()
      })
      .then(payload => payload?.data && setSettings({ ...defaults, ...payload.data }))
      .catch(() => setMessage('Unable to load settings'))
  }, [])

  async function save(next = settings) {
    setSaving(true)
    setMessage('')
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
      setSettings({ ...defaults, ...payload.data })
      setMessage('Settings saved.')
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
    save(next)
  }

  return (
    <div className="pt-32 pb-20">
      <SEOHead title="Settings" description="Manage HMorix account, notification, appearance, security, region, storage, and integration preferences." keywords="HMorix settings, account settings, notification settings, appearance settings" canonical="/settings" />
      <div className="max-w-[1280px] mx-auto px-8">
        <h1 className="section-title mb-2">Settings</h1>
        <p className="text-cream/50 mb-8">Manage your account preferences and platform configuration.</p>
        {message && <div className="mb-6 p-3 bg-white/[0.04] border border-glass-border rounded-[8px] text-sm text-cream/60">{message}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          <div className="space-y-1">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-[8px] transition-all ${activeSection === s.id ? 'bg-[#C8FF00]/10 text-[#C8FF00]' : 'text-cream/50 hover:text-cream hover:bg-white/[0.04]'}`}>
                <s.icon size={16} />{s.label}
              </button>
            ))}
          </div>

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
                  {[
                    ['emailNotifications', 'Email notifications', 'Receive email updates for important events'],
                    ['pushNotifications', 'Push notifications', 'Browser push notifications for real-time alerts'],
                    ['securityAlerts', 'Security alerts', 'Suspicious login and account security notices'],
                    ['productUpdates', 'Product updates', 'New features and product announcements'],
                    ['marketingEmails', 'Marketing emails', 'Tips, offers, and promotional content'],
                    ['weeklyDigest', 'Weekly digest', 'Summary of your account activity'],
                    ['ticketUpdates', 'Ticket updates', 'Status changes on support tickets'],
                    ['invoiceReminders', 'Invoice reminders', 'Upcoming payment due dates'],
                  ].map(([key, label, desc]) => <Toggle key={key} label={label} desc={desc} enabled={settings[key]} onClick={() => toggle(key)} />)}
                </div>
              </Panel>
            )}

            {activeSection === 'security' && (
              <Panel title="Security & Privacy">
                <div className="space-y-3 text-sm text-cream/50">
                  <Toggle label="Security alerts" desc="Email security notices for sensitive changes" enabled={settings.securityAlerts} onClick={() => toggle('securityAlerts')} />
                  <Toggle label="Login activity emails" desc="Send an email when a new session is created" enabled={settings.emailNotifications} onClick={() => toggle('emailNotifications')} />
                  <p className="pt-2">Password changes are managed from Profile &gt; Security for email/password accounts.</p>
                </div>
              </Panel>
            )}

            {activeSection === 'appearance' && (
              <Panel title="Theme & Appearance">
                <div className="space-y-6">
                  <Select label="Theme" value={settings.theme} options={['dark', 'light', 'system']} onChange={value => update('theme', value)} />
                  <div>
                    <label className="block text-sm font-medium mb-3">Accent Color</label>
                    <div className="flex gap-3">{['#C8FF00','#00D4FF','#FF6B6B','#A855F7','#F59E0B','#10B981'].map(c => <button key={c} onClick={() => update('accentColor', c)} className={`w-8 h-8 rounded-full border-2 ${settings.accentColor === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}</div>
                  </div>
                  <div><label className="block text-sm font-medium mb-3">Font Size: {settings.fontSize}px</label><input type="range" min="12" max="18" value={settings.fontSize} onChange={e => update('fontSize', Number(e.target.value))} className="w-full" /></div>
                  <Toggle label="Expanded sidebar" desc="Keep workspace navigation expanded by default" enabled={settings.sidebarExpanded} onClick={() => toggle('sidebarExpanded')} />
                  <button onClick={() => save()} className="btn-primary">Save Appearance</button>
                </div>
              </Panel>
            )}

            {activeSection === 'language' && (
              <Panel title="Language & Region">
                <div className="space-y-4 max-w-md">
                  <Select label="Language" value={settings.language} options={['en-US', 'en-GB', 'hi-IN']} onChange={value => update('language', value)} />
                  <Select label="Timezone" value={settings.timezone} options={['Asia/Kolkata', 'America/Los_Angeles', 'America/New_York', 'Europe/London']} onChange={value => update('timezone', value)} />
                  <Select label="Date Format" value={settings.dateFormat} options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']} onChange={value => update('dateFormat', value)} />
                  <Select label="Currency" value={settings.currency} options={['INR', 'USD', 'EUR', 'GBP']} onChange={value => update('currency', value)} />
                  <button onClick={() => save()} className="btn-primary">Save Preferences</button>
                </div>
              </Panel>
            )}

            {activeSection === 'shortcuts' && (
              <Panel title="Keyboard Shortcuts">
                <div className="space-y-2">{[['Open Command Palette','Ctrl / Cmd + K'],['Go to Dashboard','Ctrl / Cmd + D'],['Toggle Theme','Ctrl / Cmd + Shift + T'],['Open Settings','Ctrl / Cmd + ,']].map(([action, keys]) => <div key={action} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-[8px]"><span className="text-sm">{action}</span><kbd className="px-2 py-1 bg-white/[0.06] border border-glass-border rounded text-xs font-mono text-cream/60">{keys}</kbd></div>)}</div>
              </Panel>
            )}

            {activeSection === 'data' && (
              <Panel title="Data & Storage">
                <div className="mb-4"><div className="flex justify-between text-sm mb-2"><span>Storage limit</span><span className="text-cream/40">{settings.storageLimitGb || 10} GB</span></div><div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden"><div className="h-full bg-[#C8FF00] rounded-full" style={{ width: '8%' }} /></div></div>
                <button className="btn-outline text-sm">Request Data Export</button>
              </Panel>
            )}

            {activeSection === 'integrations' && (
              <Panel title="Connected Integrations">
                <div className="grid md:grid-cols-2 gap-4">{['Slack', 'GitHub', 'Jira', 'Zapier', 'Stripe', 'AWS', 'Google Workspace', 'Datadog'].map(name => {
                  const key = name.toLowerCase().replace(/\s+/g, '_')
                  return <div key={name} className="p-4 bg-white/[0.02] border border-glass-border rounded-[12px]"><div className="flex items-center justify-between mb-2"><span className="font-medium text-sm">{name}</span><span className={`text-[10px] px-2 py-0.5 rounded-full ${settings.integrations?.[key] ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-cream/30'}`}>{settings.integrations?.[key] ? 'Connected' : 'Not connected'}</span></div><button onClick={() => { const next = { ...settings, integrations: { ...settings.integrations, [key]: !settings.integrations?.[key] } }; setSettings(next); save(next) }} className={`text-xs ${settings.integrations?.[key] ? 'text-red-400' : 'text-[#C8FF00]'}`}>{settings.integrations?.[key] ? 'Disconnect' : 'Connect'}</button></div>
                })}</div>
              </Panel>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]"><h3 className="font-display font-semibold mb-4">{title}</h3>{children}</div>
}

function Field({ label, value, onChange, disabled }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return <div><label className="block text-xs text-cream/40 mb-1">{label}</label><input type="text" value={value || ''} disabled={disabled} onChange={e => onChange(e.target.value)} className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00] disabled:text-cream/40" /></div>
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <div><label className="block text-xs text-cream/40 mb-1">{label}</label><select value={value} onChange={e => onChange(e.target.value)} className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00]">{options.map(option => <option key={option} value={option}>{option}</option>)}</select></div>
}

function Toggle({ label, desc, enabled, onClick }: { label: string; desc: string; enabled: boolean; onClick: () => void }) {
  return <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-[8px]"><div><div className="text-sm font-medium">{label}</div><div className="text-[10px] text-cream/30">{desc}</div></div><button onClick={onClick} className={`w-10 h-5 rounded-full transition-all ${enabled ? 'bg-[#C8FF00]' : 'bg-white/10'} relative`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-obsidian transition-all ${enabled ? 'right-0.5' : 'left-0.5'}`} /></button></div>
}
