import { useEffect, useMemo, useState } from 'react'
import { Bell, CheckCircle2, Search, Send, Shield, Users, UserCheck, BriefcaseBusiness, UserRoundCheck } from 'lucide-react'
import { config } from '../../lib/config'
import { saveLocalNotification, type AppNotification, type NotificationAudience, type NotificationPriority } from '../../lib/notificationStore'

type Recipient = {
  id: string
  name: string
  email: string
  role: string
  department?: string
}

const audienceOptions: { id: NotificationAudience; label: string; description: string; icon: any }[] = [
  { id: 'all', label: 'All', description: 'Every signed-in user', icon: Users },
  { id: 'users', label: 'Users', description: 'Client and platform users', icon: UserRoundCheck },
  { id: 'employees', label: 'Employees', description: 'Internal employee portal', icon: UserCheck },
  { id: 'team', label: 'Team', description: 'Managers and teams', icon: Shield },
  { id: 'sales', label: 'Sales', description: 'Sales and CRM users', icon: BriefcaseBusiness },
  { id: 'selected', label: 'Selected', description: 'Only chosen people', icon: Search },
]

const fallbackRecipients: Recipient[] = [
  { id: 'emp_harsh', name: 'Harsh Sharma', email: 'harsh@hmorix.com', role: 'admin', department: 'Leadership' },
  { id: 'emp_aarav', name: 'Aarav Singh', email: 'aarav@hmorix.com', role: 'employee', department: 'Engineering' },
  { id: 'emp_neha', name: 'Neha Sharma', email: 'neha@hmorix.com', role: 'hr', department: 'HR' },
  { id: 'emp_sales', name: 'Sales Team', email: 'sales@hmorix.com', role: 'crm', department: 'Sales' },
]

export default function AdminNotifications() {
  const [audience, setAudience] = useState<NotificationAudience>('all')
  const [priority, setPriority] = useState<NotificationPriority>('important')
  const [channel, setChannel] = useState('in-app')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [recipients, setRecipients] = useState<Recipient[]>(fallbackRecipients)
  const [history, setHistory] = useState<AppNotification[]>([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetch(`${config.apiUrl}/admin/users`, { credentials: 'include', cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || 'Unable to load recipients')
        const users = (data.data?.users || []).map((item: any) => ({ id: item.id, name: item.name || item.email, email: item.email, role: item.role || 'user', department: item.company }))
        const employees = (data.data?.employees || []).map((item: any) => ({ id: item.userId || item.id, name: item.name, email: item.email, role: item.accessRole || item.role || 'employee', department: item.department }))
        const merged = [...users, ...employees].filter((item, index, list) => item.id && list.findIndex(row => row.id === item.id) === index)
        if (merged.length) setRecipients(merged)
      })
      .catch(() => null)

    fetch(`${config.apiUrl}/notifications`, { credentials: 'include', cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}))
        if (response.ok) setHistory(data.data || [])
      })
      .catch(() => null)
  }, [])

  const filteredRecipients = useMemo(() => {
    const value = search.trim().toLowerCase()
    if (!value) return recipients
    return recipients.filter(item => [item.name, item.email, item.role, item.department].some(field => String(field || '').toLowerCase().includes(value)))
  }, [recipients, search])

  const recipientCount = audience === 'selected' ? selectedIds.length : audience === 'all' ? recipients.length : recipients.filter(item => {
    if (audience === 'users') return item.role === 'user'
    if (audience === 'employees') return ['employee', 'hr', 'manager', 'crm'].includes(item.role)
    if (audience === 'team') return ['employee', 'manager', 'hr'].includes(item.role)
    if (audience === 'sales') return item.role === 'crm' || item.department?.toLowerCase() === 'sales'
    return true
  }).length

  const toggleRecipient = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])
  }

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('')
    setError('')
    if (!title.trim() || !message.trim()) {
      setError('Title and message are required.')
      return
    }
    if (audience === 'selected' && selectedIds.length === 0) {
      setError('Select at least one recipient.')
      return
    }

    setSending(true)
    const payload = { title: title.trim(), message: message.trim(), audience, priority, channel, selectedIds }
    try {
      const response = await fetch(`${config.apiUrl}/notifications`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Unable to send notification')
      setHistory(prev => [...(data.data || []), ...prev].slice(0, 20))
      setStatus(`Notification sent to ${audience === 'selected' ? selectedIds.length : recipientCount || 'the selected audience'} recipient${recipientCount === 1 ? '' : 's'}.`)
    } catch (err) {
      const local = saveLocalNotification(payload)
      setHistory(prev => [local, ...prev].slice(0, 20))
      setStatus('Notification saved locally and is visible in the portal inbox.')
    } finally {
      setSending(false)
      setTitle('')
      setMessage('')
      setSelectedIds([])
    }
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs text-[#C8FF00] font-mono"><Bell size={15} /> ADMIN NOTIFICATIONS</div>
            <h1 className="font-display text-3xl font-bold">Send Notification</h1>
            <p className="text-cream/40 text-sm">Broadcast in-app updates to users, employees, teams, sales, or selected people.</p>
          </div>
          <div className="hidden md:flex items-center gap-3 px-4 py-3 bg-obsidian-2 border border-glass-border rounded-[8px]">
            <span className="text-xs text-cream/40">Ready recipients</span>
            <span className="font-display text-xl font-bold text-[#C8FF00]">{recipientCount}</span>
          </div>
        </div>

        {status && <div className="mb-6 p-3 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-[8px] text-sm text-[#C8FF00] flex items-center gap-2"><CheckCircle2 size={16} />{status}</div>}
        {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-[8px] text-sm text-red-400">{error}</div>}

        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
          <form onSubmit={sendNotification} className="space-y-6">
            <div className="bg-obsidian-2 border border-glass-border rounded-[16px] p-6">
              <h2 className="font-display font-semibold mb-4">Audience</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {audienceOptions.map(option => (
                  <button type="button" key={option.id} onClick={() => setAudience(option.id)} className={`text-left p-4 border rounded-[8px] transition-all ${audience === option.id ? 'border-[#C8FF00] bg-[#C8FF00]/10' : 'border-glass-border bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                    <option.icon size={18} className={audience === option.id ? 'text-[#C8FF00]' : 'text-cream/40'} />
                    <div className="mt-3 text-sm font-semibold">{option.label}</div>
                    <div className="text-[10px] text-cream/35">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {audience === 'selected' && (
              <div className="bg-obsidian-2 border border-glass-border rounded-[16px] p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="font-display font-semibold">Select Recipients</h2>
                  <span className="text-xs text-[#C8FF00]">{selectedIds.length} selected</span>
                </div>
                <div className="relative mb-4">
                  <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, role, or department" className="w-full pl-10 pr-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm outline-none focus:border-[#C8FF00]" />
                </div>
                <div className="grid md:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto">
                  {filteredRecipients.map(recipient => (
                    <label key={recipient.id} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-glass-border rounded-[8px] hover:bg-white/[0.04]">
                      <input type="checkbox" checked={selectedIds.includes(recipient.id)} onChange={() => toggleRecipient(recipient.id)} />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{recipient.name}</div>
                        <div className="text-[10px] text-cream/30 truncate">{recipient.email} · {recipient.role} · {recipient.department || 'General'}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-obsidian-2 border border-glass-border rounded-[16px] p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <select value={priority} onChange={e => setPriority(e.target.value as NotificationPriority)} className="px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm outline-none">
                  <option value="normal">Normal priority</option>
                  <option value="important">Important priority</option>
                  <option value="urgent">Urgent priority</option>
                </select>
                <select value={channel} onChange={e => setChannel(e.target.value)} className="px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm outline-none">
                  <option value="in-app">In-app notification</option>
                  <option value="in-app-email">In-app + email</option>
                  <option value="in-app-push">In-app + push</option>
                </select>
              </div>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification title" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm outline-none focus:border-[#C8FF00]" />
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={6} placeholder="Write the message employees, users, or sales should receive" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm resize-none outline-none focus:border-[#C8FF00]" />
              <button disabled={sending} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"><Send size={15} />{sending ? 'Sending...' : 'Send Notification'}</button>
            </div>
          </form>

          <aside className="space-y-6">
            <div className="bg-obsidian-2 border border-glass-border rounded-[16px] p-5">
              <h2 className="font-display font-semibold mb-4">Live Preview</h2>
              <div className="p-4 bg-obsidian border border-glass-border rounded-[8px]">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-[#C8FF00]/10 rounded-[4px] flex items-center justify-center text-[#C8FF00]"><Bell size={17} /></div>
                  <div>
                    <div className="text-sm font-semibold">{title || 'Notification title'}</div>
                    <p className="text-xs text-cream/45 mt-1">{message || 'Your message preview will appear here.'}</p>
                    <div className="flex gap-2 mt-3">
                      <span className="px-2 py-1 bg-white/[0.04] rounded-[4px] text-[10px] capitalize">{audience}</span>
                      <span className="px-2 py-1 bg-white/[0.04] rounded-[4px] text-[10px] capitalize">{priority}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-obsidian-2 border border-glass-border rounded-[16px] p-5">
              <h2 className="font-display font-semibold mb-4">Recent Sends</h2>
              <div className="space-y-3">
                {history.length === 0 && <div className="text-sm text-cream/40">No notifications sent yet.</div>}
                {history.slice(0, 8).map((item, index) => (
                  <div key={item._id || item.id || index} className="p-3 bg-white/[0.02] rounded-[8px]">
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-[10px] text-cream/30 mt-1">{item.message}</div>
                    <div className="text-[10px] text-[#C8FF00] mt-2 capitalize">{item.audience || 'all'} · {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'just now'}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
