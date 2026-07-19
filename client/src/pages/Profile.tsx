import { useEffect, useMemo, useState } from 'react'
import { Camera, Clock, CreditCard, Download, Globe, Key, Link as LinkIcon, Mail, MapPin, Phone, Plus, Shield } from 'lucide-react'
import { api, config } from '../lib/config'
import SEOHead from '../components/seo/SEOHead'

type ProfileData = {
  name: string
  displayName: string
  username: string
  email: string
  phone: string
  location: string
  website: string
  bio: string
  company: string
  theme: string
  avatarUrl: string
  coverImageUrl: string
  socialLinks: { twitter?: string; linkedin?: string; github?: string; website?: string }
}

const emptyProfile: ProfileData = {
  name: '',
  displayName: '',
  username: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  bio: '',
  company: '',
  theme: 'dark',
  avatarUrl: '',
  coverImageUrl: '',
  socialLinks: {},
}

function timeAgo(value: string) {
  if (!value) return ''
  const diff = Date.now() - new Date(value).getTime()
  const mins = Math.max(1, Math.floor(diff / 60000))
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState<ProfileData>(emptyProfile)
  const [summary, setSummary] = useState<any>({ sessions: [], activities: [], accounts: [], billing: { account: { plan: 'Free', paymentMethods: [] }, invoices: [] }, apiKeys: [] })
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [payment, setPayment] = useState({ method: 'card', last4: '4242', upi: '', bank: '' })
  const [apiKeyName, setApiKeyName] = useState('Terminal key')
  const [newApiKey, setNewApiKey] = useState('')

  const emailLogin = useMemo(() => summary.accounts?.some((item: any) => item.provider === 'email' && item.connected), [summary])

  async function request(path: string, options: RequestInit = {}) {
    const response = await fetch(path, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options })
    const payload = await response.json().catch(() => ({}))
    if (response.status === 401) {
      window.location.href = '/retry'
      return null
    }
    if (!response.ok) throw new Error(payload.error || 'Request failed')
    return payload
  }

  async function loadAll() {
    try {
      const [profilePayload, summaryPayload] = await Promise.all([
        request(api.profile.get),
        request(`${config.apiUrl}/account/summary`),
      ])
      const data = profilePayload?.data || {}
      setProfile({ ...emptyProfile, ...data, avatarUrl: data.avatarUrl || data.avatar_url || '', coverImageUrl: data.coverImageUrl || data.cover_image_url || '', socialLinks: data.socialLinks || data.social_links || {} })
      setSummary(summaryPayload?.data || summary)
    } catch (error: any) {
      setMessage(error.message || 'Unable to load account')
    }
  }

  useEffect(() => { loadAll() }, [])

  const initials = (profile.displayName || profile.name || profile.email || 'HM').split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()

  async function saveProfile() {
    setSaving(true)
    setMessage('')
    try {
      const payload = await request(api.profile.update, { method: 'PUT', body: JSON.stringify(profile) })
      setProfile(current => ({ ...current, ...payload.data }))
      setMessage('Profile saved.')
      await loadAll()
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function uploadAvatar(file?: File) {
    if (!file) return
    const form = new FormData()
    form.append('image', file)
    form.append('kind', 'avatar')
    const response = await fetch(`${config.apiUrl}/upload`, { method: 'POST', credentials: 'include', body: form })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(payload.error || 'Profile picture upload failed')
      return
    }
    setProfile(current => ({ ...current, avatarUrl: payload.url }))
    setMessage('Profile picture updated.')
    await loadAll()
  }

  async function changePassword() {
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage('New passwords do not match.')
      return
    }
    try {
      await request(`${config.apiUrl}/account/change-password`, { method: 'POST', body: JSON.stringify(passwords) })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setMessage('Password updated.')
      await loadAll()
    } catch (error: any) {
      setMessage(error.message)
    }
  }

  async function addPaymentMethod() {
    try {
      const payload = await request(`${config.apiUrl}/account/billing`, { method: 'POST', body: JSON.stringify(payment) })
      setSummary((current: any) => ({ ...current, billing: payload.data }))
      setMessage('Payment method added.')
    } catch (error: any) {
      setMessage(error.message)
    }
  }

  async function createApiKey() {
    try {
      const payload = await request(`${config.apiUrl}/account/api-keys`, { method: 'POST', body: JSON.stringify({ name: apiKeyName }) })
      setNewApiKey(payload.data.key)
      await loadAll()
    } catch (error: any) {
      setMessage(error.message)
    }
  }

  return (
    <div className="pt-32 pb-20">
      <SEOHead title="Account Profile" description="Manage HMorix profile, connected accounts, sessions, billing, API keys, and account security." keywords="HMorix profile, account settings, billing, API key, sessions" canonical="/profile" />
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
          <div className="relative">
            <div className="w-28 h-28 bg-obsidian-3 border-2 border-glass-border rounded-full flex items-center justify-center text-3xl font-display font-bold text-[#C8FF00] overflow-hidden">
              {profile.avatarUrl ? <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" /> : initials}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#C8FF00] rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
              <Camera size={14} className="text-obsidian" />
              <input type="file" accept="image/*" className="hidden" onChange={event => uploadAvatar(event.target.files?.[0])} />
            </label>
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold">{profile.displayName || profile.name || 'Your Profile'}</h1>
            <p className="text-cream/50 mt-1">{profile.company || summary.billing?.account?.plan || 'Free'} Account</p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-cream/40">
              <span className="flex items-center gap-1.5"><Mail size={14} /> {profile.email}</span>
              <span className="flex items-center gap-1.5"><Phone size={14} /> {profile.phone || 'No phone'}</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} /> {profile.location || 'No location'}</span>
              <span className="flex items-center gap-1.5"><Globe size={14} /> {profile.website || 'No website'}</span>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <span className="px-3 py-1 bg-[#C8FF00]/10 text-[#C8FF00] text-xs rounded-full font-medium">{summary.billing?.account?.plan || 'Free'} Plan</span>
              <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs rounded-full font-medium">Verified</span>
              {emailLogin && <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full font-medium">Email Login</span>}
            </div>
          </div>
          <button onClick={() => setActiveTab('overview')} className="btn-primary">Edit Profile</button>
        </div>

        <div className="flex items-center gap-1 border-b border-glass-border mb-8 overflow-x-auto">
          {['overview', 'activity', 'security', 'billing', 'api-keys'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 text-sm font-medium capitalize whitespace-nowrap transition-all border-b-2 ${activeTab === tab ? 'text-[#C8FF00] border-[#C8FF00]' : 'text-cream/40 border-transparent hover:text-cream'}`}>
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {message && <div className="mb-6 p-3 bg-white/[0.04] border border-glass-border rounded-[8px] text-sm text-cream/60">{message}</div>}

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                <h3 className="font-display font-semibold mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Display Name" value={profile.displayName} onChange={value => setProfile({ ...profile, displayName: value })} />
                  <Field label="Username" value={profile.username} onChange={value => setProfile({ ...profile, username: value })} />
                  <Field label="Phone" value={profile.phone} onChange={value => setProfile({ ...profile, phone: value })} />
                  <Field label="Location" value={profile.location} onChange={value => setProfile({ ...profile, location: value })} />
                  <Field label="Website" value={profile.website} onChange={value => setProfile({ ...profile, website: value })} />
                  <Field label="Company" value={profile.company} onChange={value => setProfile({ ...profile, company: value })} />
                  <div className="md:col-span-2"><label className="block text-xs text-cream/40 mb-1">Bio</label><textarea rows={3} value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00] resize-none" /></div>
                </div>
                <button onClick={saveProfile} disabled={saving} className="mt-4 btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>

              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                <h3 className="font-display font-semibold mb-4">Connected Accounts</h3>
                <div className="space-y-3">
                  {summary.accounts?.map((account: any) => (
                    <div key={account.provider} className="flex items-center justify-between p-3 bg-white/[0.02] border border-glass-border rounded-[8px]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/[0.06] rounded-[4px] flex items-center justify-center text-xs font-bold uppercase">{account.provider[0]}</div>
                        <div><span className="text-sm font-medium capitalize">{account.provider}</span>{account.connected && <span className="text-xs text-cream/30 ml-2">{account.email || account.name || 'Connected'}</span>}</div>
                      </div>
                      {account.connected ? <span className="text-xs px-3 py-1.5 rounded-[4px] bg-green-500/10 text-green-400">Connected</span> : (
                        <a href={account.provider === 'google' || account.provider === 'github' ? `${config.apiUrl}/auth/${account.provider}` : '/signup'} className="text-xs px-3 py-1.5 rounded-[4px] bg-[#C8FF00]/10 text-[#C8FF00] hover:bg-[#C8FF00]/20 transition-all"><LinkIcon size={12} className="inline mr-1" />Connect</a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Sessions sessions={summary.sessions || []} />
            </div>
          </div>
        )}

        {activeTab === 'activity' && <ActivityList activities={summary.activities || []} />}

        {activeTab === 'security' && (
          <div className="space-y-6">
            {emailLogin ? (
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                <div className="flex items-center gap-3 mb-4"><Key size={20} className="text-[#C8FF00]" /><h3 className="font-display font-semibold">Change Password</h3></div>
                <div className="space-y-3 max-w-md">
                  <PasswordField label="Current Password" value={passwords.currentPassword} onChange={value => setPasswords({ ...passwords, currentPassword: value })} />
                  <PasswordField label="New Password" value={passwords.newPassword} onChange={value => setPasswords({ ...passwords, newPassword: value })} />
                  <PasswordField label="Confirm New Password" value={passwords.confirmPassword} onChange={value => setPasswords({ ...passwords, confirmPassword: value })} />
                  <button onClick={changePassword} className="btn-primary">Update Password</button>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] text-sm text-cream/50">Password and email 2FA settings are available only for email/password accounts. Google and GitHub accounts are secured by their provider.</div>
            )}
            <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
              <div className="flex items-center gap-3 mb-2"><Shield size={20} className="text-[#C8FF00]" /><h3 className="font-display font-semibold">Email OTP</h3></div>
              <p className="text-sm text-cream/50">Sensitive profile changes use email OTP verification when required.</p>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
              <h3 className="font-display font-semibold mb-4">Current Plan</h3>
              <div className="flex items-center justify-between"><div><div className="text-2xl font-display font-bold">{summary.billing?.account?.plan || 'Free'}</div><div className="text-sm text-cream/40 mt-1">Default account plan</div></div><button className="btn-outline text-sm">Upgrade Plan</button></div>
            </div>
            <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
              <h3 className="font-display font-semibold mb-4">Payment Method</h3>
              <div className="grid md:grid-cols-[160px_1fr_auto] gap-3">
                <select value={payment.method} onChange={e => setPayment({ ...payment, method: e.target.value })} className="px-3 py-2.5 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none"><option value="card">Card</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option></select>
                <input value={payment.method === 'upi' ? payment.upi : payment.method === 'card' ? payment.last4 : payment.bank} onChange={e => payment.method === 'upi' ? setPayment({ ...payment, upi: e.target.value }) : payment.method === 'card' ? setPayment({ ...payment, last4: e.target.value }) : setPayment({ ...payment, bank: e.target.value })} placeholder="Demo payment details" className="px-4 py-2.5 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00]" />
                <button onClick={addPaymentMethod} className="btn-primary text-sm"><CreditCard size={14} className="inline mr-1" />Add</button>
              </div>
              <div className="mt-4 space-y-2">{summary.billing?.account?.paymentMethods?.map((method: any, i: number) => <div key={i} className="p-3 bg-white/[0.02] rounded-[8px] text-sm text-cream/60">{method.label}</div>)}</div>
            </div>
            <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
              <h3 className="font-display font-semibold mb-4">Billing History</h3>
              <div className="space-y-2">{(summary.billing?.invoices || []).map((inv: any) => <div key={inv._id} className="flex items-center justify-between gap-3 p-3 bg-white/[0.02] rounded-[8px]"><span className="text-sm">{inv.number}</span><span className="text-sm font-mono">{inv.currency} {inv.amount}</span><span className="text-xs text-cream/40">{inv.status}</span><a href={`${config.apiUrl}/account/billing/invoices/${inv._id}/pdf`} className="text-xs text-[#C8FF00]"><Download size={12} className="inline mr-1" />PDF</a></div>)}</div>
            </div>
          </div>
        )}

        {activeTab === 'api-keys' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3"><h3 className="font-display text-xl font-bold">API Keys</h3><div className="flex gap-2"><input value={apiKeyName} onChange={e => setApiKeyName(e.target.value)} className="px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[4px] text-sm text-cream outline-none" /><button onClick={createApiKey} className="btn-primary text-sm"><Plus size={14} className="inline mr-1" />Generate</button></div></div>
            {newApiKey && <div className="p-4 bg-[#C8FF00]/10 border border-[#C8FF00]/30 rounded-[8px] text-sm"><div className="text-[#C8FF00] mb-1">Copy this key now. It will not be shown again.</div><code className="text-cream break-all">{newApiKey}</code></div>}
            <div className="space-y-3">{summary.apiKeys?.map((k: any) => <div key={k.id} className="p-4 bg-obsidian-2 border border-glass-border rounded-[12px]"><div className="flex items-center justify-between mb-2"><span className="font-medium text-sm">{k.name}</span><span className="text-xs text-cream/30">{timeAgo(k.createdAt)}</span></div><div className="font-mono text-xs text-cream/40 bg-white/[0.02] px-3 py-1.5 rounded-[4px] inline-block">{k.prefix}</div></div>)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div><label className="block text-xs text-cream/40 mb-1">{label}</label><input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00]" /></div>
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div><label className="block text-xs text-cream/40 mb-1">{label}</label><input type="password" value={value} onChange={e => onChange(e.target.value)} className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00]" /></div>
}

function Sessions({ sessions }: { sessions: any[] }) {
  return <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]"><h3 className="font-display font-semibold mb-4">Recent Sessions</h3><div className="space-y-3">{sessions.map((s, i) => <div key={s.id || i} className="flex items-start gap-3 p-3 bg-white/[0.02] rounded-[8px]"><Clock size={14} className="text-cream/30 mt-0.5" /><div><div className="text-sm">{s.device} · {s.browser}</div><div className="text-[10px] text-cream/30">{s.ip} · {timeAgo(s.updatedAt)} · {s.active ? 'Active' : 'Expired'}</div></div></div>)}</div></div>
}

function ActivityList({ activities }: { activities: any[] }) {
  return <div className="space-y-3">{activities.length === 0 && <div className="p-4 bg-obsidian-2 border border-glass-border rounded-[12px] text-sm text-cream/40">No account activity yet.</div>}{activities.map((item, i) => <div key={item._id || i} className="flex items-center gap-4 p-4 bg-obsidian-2 border border-glass-border rounded-[12px]"><div className="w-2 h-2 rounded-full bg-[#C8FF00]" /><span className="flex-1 text-sm capitalize">{String(item.action || '').replace(/_/g, ' ')}</span><span className="text-xs text-cream/30">{timeAgo(item.createdAt)}</span></div>)}</div>
}
