import { useEffect, useMemo, useState } from 'react'
import SEOHead from '../../components/seo/SEOHead'
import { Search, Filter, Plus, Mail, Building, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react'
import { config } from '../../lib/config'

type Contact = {
  _id?: string
  id?: string
  name: string
  email: string
  phone?: string
  company?: string
  role?: string
  status: string
  lastContact?: string
  deals?: number
  totalValue?: number
  tags?: string[]
  notes?: string
}

const blankForm = { id: '', name: '', email: '', phone: '', company: '', role: '', tags: '', notes: '' }

export default function Contacts() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Contact | null>(null)
  const [form, setForm] = useState(blankForm)
  const [message, setMessage] = useState('')

  const loadContacts = async () => {
    const params = new URLSearchParams({ page: String(page), limit: '20', status: statusFilter })
    if (search) params.set('search', search)
    const response = await fetch(`${config.apiUrl}/crm/contacts?${params}`, { credentials: 'include', cache: 'no-store' })
    const data = await response.json().catch(() => ({}))
    if (response.ok) {
      setContacts(data.contacts || [])
      setPages(data.pages || 1)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [page, statusFilter])

  const filtered = useMemo(() => contacts, [contacts])

  const openAdd = () => {
    setForm(blankForm)
    setShowForm(true)
    setSelected(null)
  }

  const openEdit = (contact: Contact) => {
    setSelected(contact)
    setForm({ id: String(contact._id || contact.id || ''), name: contact.name || '', email: contact.email || '', phone: contact.phone || '', company: contact.company || '', role: contact.role || '', tags: (contact.tags || []).join(', '), notes: contact.notes || '' })
    setShowForm(true)
  }

  const saveContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    const payload = { ...form, tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean) }
    const response = await fetch(`${config.apiUrl}/crm/contacts`, {
      method: form.id ? 'PUT' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(data.error || 'Unable to save contact')
      return
    }
    setShowForm(false)
    setMessage(form.id ? 'Lead updated' : 'Lead added')
    loadContacts()
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <SEOHead title="CRM Contacts" description="Manage all your business contacts, leads, and customer relationships in one place." keywords="CRM contacts, contact management, lead management, customer database, sales contacts" canonical="/crm/contacts" />
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Contacts</h1>
            <p className="text-cream/50 text-sm mt-1">{contacts.length} loaded contacts</p>
          </div>
          <button onClick={openAdd} className="btn-primary text-sm flex items-center gap-2"><Plus size={14} /> Add Contact</button>
        </div>

        {message && <div className="mb-6 p-3 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-[8px] text-sm text-[#C8FF00]">{message}</div>}

        {showForm && (
          <form onSubmit={saveContact} className="grid md:grid-cols-3 gap-3 mb-6 p-5 bg-obsidian-2 border border-glass-border rounded-[12px]">
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Company" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Role / service" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Tags, comma separated" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="md:col-span-3 px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <button type="submit" className="btn-primary text-sm">{form.id ? 'Update Lead' : 'Save Lead'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm">Cancel</button>
          </form>
        )}

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadContacts()} placeholder="Search contacts, companies, emails..." className="w-full pl-10 pr-4 py-2.5 bg-obsidian-2 border border-glass-border rounded-[8px] text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-[#C8FF00]/50" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 bg-obsidian-2 border border-glass-border rounded-[8px] text-sm text-cream/70">
            <option value="all">All Status</option>
            <option value="lead">Lead</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button onClick={loadContacts} className="px-3 py-2.5 bg-obsidian-2 border border-glass-border rounded-[8px] text-sm text-cream/70 flex items-center gap-2"><Filter size={14} /> Apply</button>
        </div>

        <div className="bg-obsidian-2 border border-glass-border rounded-[12px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-cream/30 text-xs border-b border-glass-border bg-white/[0.02]">
                  <th className="p-4 font-medium"><input type="checkbox" className="rounded" /></th>
                  <th className="p-4 font-medium">Contact</th>
                  <th className="p-4 font-medium">Company</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Deals</th>
                  <th className="p-4 font-medium">Value</th>
                  <th className="p-4 font-medium">Last Contact</th>
                  <th className="p-4 font-medium">Tags</th>
                  <th className="p-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(contact => (
                  <tr key={contact._id || contact.id} onClick={() => setSelected(contact)} className="border-b border-glass-border/50 hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <td className="p-4"><input type="checkbox" className="rounded" /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-obsidian-3 rounded-full flex items-center justify-center text-xs font-bold">{contact.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</div>
                        <div>
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-[10px] text-cream/30 flex items-center gap-2"><span className="flex items-center gap-1"><Mail size={8} /> {contact.email}</span></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Building size={12} className="text-cream/30" />
                        <div><div className="text-sm">{contact.company || 'No company'}</div><div className="text-[10px] text-cream/30">{contact.role || 'Lead'}</div></div>
                      </div>
                    </td>
                    <td className="p-4"><span className={`px-2 py-0.5 rounded text-[10px] font-medium ${contact.status === 'active' ? 'bg-green-500/20 text-green-400' : contact.status === 'lead' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>{contact.status}</span></td>
                    <td className="p-4">{contact.deals || 0}</td>
                    <td className="p-4 text-[#C8FF00]">₹{Number(contact.totalValue || 0).toLocaleString('en-IN')}</td>
                    <td className="p-4 text-cream/50">{contact.lastContact ? new Date(contact.lastContact).toLocaleDateString() : '-'}</td>
                    <td className="p-4"><div className="flex gap-1 flex-wrap">{(contact.tags || []).map((tag, i) => <span key={i} className="px-1.5 py-0.5 bg-white/[0.06] text-cream/40 text-[9px] rounded">{tag}</span>)}</div></td>
                    <td className="p-4"><button onClick={e => { e.stopPropagation(); openEdit(contact) }} className="text-cream/30 hover:text-cream"><MoreVertical size={14} /></button></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-cream/40">No leads yet. Contact form submissions will appear here.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-glass-border">
            <span className="text-xs text-cream/30">Showing {filtered.length} contacts</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} className="p-1.5 border border-glass-border rounded hover:border-cream/30"><ChevronLeft size={14} /></button>
              <span className="text-xs text-cream/50">Page {page} of {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} className="p-1.5 border border-glass-border rounded hover:border-cream/30"><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>

        {selected && !showForm && (
          <div className="mt-6 p-5 bg-obsidian-2 border border-glass-border rounded-[12px]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold">{selected.name}</h2>
                <p className="text-sm text-cream/50">{selected.email} · {selected.phone || 'No phone'}</p>
                <p className="text-sm text-cream/40 mt-2">{selected.notes || 'No notes yet.'}</p>
              </div>
              <button onClick={() => openEdit(selected)} className="btn-outline text-sm">Edit Lead</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
