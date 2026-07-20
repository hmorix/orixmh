import { useEffect, useMemo, useState } from 'react'
import { Loader2, Mail, MapPin, Plus, Search } from 'lucide-react'
import { config } from '../../lib/config'

type Employee = {
  _id?: string
  name: string
  role: string
  department?: string
  dept?: string
  location: string
  email: string
  status: string
  salary?: number
  performanceScore?: number
}

const fallbackEmployees: Employee[] = [
  { name: 'Harsh Sharma', role: 'CEO', department: 'Leadership', location: 'Hathras', email: 'harsh@hmorix.com', status: 'active', performanceScore: 4.9 },
]

export default function Directory() {
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('All')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: '', department: 'Engineering', location: 'Hathras', salary: '' })

  const loadEmployees = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiUrl}/hrm/people`, { credentials: 'include', cache: 'no-store' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Unable to load employees')
      setEmployees(data.data || fallbackEmployees)
    } catch (err) {
      setEmployees(fallbackEmployees)
      setMessage(err instanceof Error ? err.message : 'Unable to load employees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const departments = useMemo(() => ['All', ...Array.from(new Set(employees.map(e => e.department || e.dept || 'General')))], [employees])

  const filtered = employees.filter(e => {
    const department = e.department || e.dept || 'General'
    const matchDept = dept === 'All' || department === dept
    const matchSearch = `${e.name} ${e.role} ${e.email}`.toLowerCase().includes(search.toLowerCase())
    return matchDept && matchSearch
  })

  const addEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    const response = await fetch(`${config.apiUrl}/hrm/people`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, salary: Number(form.salary || 0) }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(data.error || 'Unable to add employee')
      return
    }
    setEmployees(prev => [...prev, data.data])
    setForm({ name: '', email: '', role: '', department: 'Engineering', location: 'Hathras', salary: '' })
    setShowForm(false)
    setMessage('Employee added successfully')
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Employee Directory</h1>
            <p className="text-cream/40 text-sm">Find, add, and connect with team members across the organization.</p>
          </div>
          <button onClick={() => setShowForm(v => !v)} className="btn-primary text-sm flex items-center gap-2"><Plus size={14} />Add Employee</button>
        </div>

        {message && <div className="mb-6 p-3 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-[8px] text-sm text-[#C8FF00]">{message}</div>}

        {showForm && (
          <form onSubmit={addEmployee} className="grid md:grid-cols-3 gap-3 mb-8 p-5 bg-obsidian-2 border border-glass-border rounded-[12px]">
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <input required value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Role" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="Department" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="Annual salary" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <button type="submit" className="btn-primary text-sm md:col-span-3">Save Employee</button>
          </form>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, role, or email..." className="w-full pl-10 pr-4 py-3 bg-obsidian-2 border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {departments.map(d => (
              <button key={d} onClick={() => setDept(d)} className={`px-3 py-2 text-xs rounded-full whitespace-nowrap transition-all ${dept === d ? 'bg-[#C8FF00] text-obsidian' : 'bg-white/[0.04] text-cream/50 hover:text-cream'}`}>{d}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#C8FF00]" /></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((emp, i) => {
              const department = emp.department || emp.dept || 'General'
              const initials = emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)
              return (
                <div key={emp._id || i} className="p-5 bg-obsidian-2 border border-glass-border rounded-[12px] hover:border-[#C8FF00]/20 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-obsidian-3 rounded-full flex items-center justify-center text-sm font-bold">{initials}</div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-obsidian-2 ${emp.status === 'active' || emp.status === 'online' ? 'bg-green-400' : emp.status === 'busy' ? 'bg-yellow-400' : 'bg-gray-500'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{emp.name}</h4>
                      <p className="text-xs text-cream/40">{emp.role}</p>
                      <p className="text-[10px] text-cream/20 mt-1">{department} · {emp.performanceScore || 0}/5</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-glass-border/50 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-cream/30"><MapPin size={10} />{emp.location}</div>
                    <div className="flex items-center gap-2 text-xs text-cream/30"><Mail size={10} />{emp.email}</div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <a href={`mailto:${emp.email}`} className="flex-1 py-1.5 text-center text-[10px] bg-white/[0.04] border border-glass-border rounded-[4px] text-cream/50 hover:text-cream hover:border-cream transition-all">Message</a>
                    <button className="flex-1 py-1.5 text-[10px] bg-white/[0.04] border border-glass-border rounded-[4px] text-cream/50 hover:text-cream hover:border-cream transition-all">Schedule</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
