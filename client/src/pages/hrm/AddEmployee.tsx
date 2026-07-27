import { useState } from 'react'
import SEOHead from '../../components/seo/SEOHead'
import { Copy, UserPlus } from 'lucide-react'
import { config } from '../../lib/config'

export default function AddEmployee() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    department: 'Engineering',
    role: '',
    location: 'Hathras',
    salary: '',
    startDate: new Date().toISOString().slice(0, 10),
    status: 'active',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [created, setCreated] = useState<any>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setCreated(null)
    try {
      const response = await fetch(`${config.apiUrl}/hrm/people`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          salary: Number(form.salary || 0),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Unable to add employee')
      setCreated(data.data)
      setMessage('Employee created and employee access was generated.')
      setForm({
        name: '',
        email: '',
        username: '',
        password: '',
        department: 'Engineering',
        role: '',
        location: 'Hathras',
        salary: '',
        startDate: new Date().toISOString().slice(0, 10),
        status: 'active',
      })
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to add employee')
    } finally {
      setLoading(false)
    }
  }

  const copyValue = (value: string) => navigator.clipboard.writeText(value).catch(() => null)

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <SEOHead title="Add Employee" description="Create a new employee record and generate login credentials." keywords="add employee, employee onboarding, employee login, HRM" canonical="/hrm/employees/new" />
      <div className="max-w-[1100px] mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Add Employee</h1>
            <p className="text-cream/50 text-sm mt-1">Create the employee record, login credentials, and onboarding profile.</p>
          </div>
          <UserPlus size={20} className="text-[#C8FF00]" />
        </div>

        {message && <div className="mb-6 p-3 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-[8px] text-sm text-[#C8FF00]">{message}</div>}

        <form onSubmit={submit} className="grid md:grid-cols-3 gap-3 p-6 bg-obsidian-2 border border-glass-border rounded-[12px]">
          <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email (optional)" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
          <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Username (optional)" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
          <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password (optional)" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
          <input required value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Role" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
          <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="Department" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
          <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
          <input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="Annual salary" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
          <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]">
            <option value="active">Active</option>
            <option value="onboarding">Onboarding</option>
          </select>
          <button type="submit" disabled={loading} className="btn-primary text-sm md:col-span-3 disabled:opacity-60">
            {loading ? 'Creating...' : 'Create Employee'}
          </button>
        </form>

        {created?.credentials && (
          <div className="mt-8 p-6 bg-obsidian-2 border border-[#C8FF00]/20 rounded-[12px]">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-display text-lg font-semibold">Generated Access</h2>
                <p className="text-xs text-cream/40">Use these credentials to sign in at the employee login page.</p>
              </div>
              <a href={created.credentials.loginUrl} className="text-xs text-[#C8FF00] hover:underline">Open employee login</a>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { label: 'Email', value: created.credentials.email },
                { label: 'Username', value: created.credentials.username },
                { label: 'Password', value: created.credentials.password },
              ].map(field => (
                <div key={field.label} className="p-4 bg-obsidian border border-glass-border rounded-[8px]">
                  <div className="text-[10px] text-cream/30 mb-2">{field.label}</div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium break-all">{field.value}</div>
                    <button type="button" onClick={() => copyValue(field.value)} className="p-2 bg-white/[0.04] border border-glass-border rounded-[6px] text-cream/60 hover:text-[#C8FF00]">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
