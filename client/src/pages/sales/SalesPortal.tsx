import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../../components/seo/SEOHead'
import { Building2, CheckCircle2, Loader2, MapPin, Phone, Plus, Target } from 'lucide-react'
import { config } from '../../lib/config'

const serviceOptions = ['Website', 'Mobile App', 'AI Automation', 'CRM', 'BillingFlow', 'SEO', 'Digital Marketing', 'Software Development']
const placeTypes = ['Hotel', 'Restaurant', 'Factory', 'Company', 'School', 'College', 'Shop', 'Clinic', 'Other']

export default function SalesPortal() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    placeType: 'Hotel',
    businessName: '',
    ownerName: '',
    ownerEmail: '',
    phone: '',
    location: '',
    address: '',
    services: [] as string[],
    projectDetails: '',
    budget: '',
    paymentDuration: 'monthly',
    followUpDate: '',
    status: 'lead',
  })

  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiUrl}/sales/projects`, { credentials: 'include', cache: 'no-store' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Unable to load sales projects')
      setProjects(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load sales projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const toggleService = (service: string) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(service) ? prev.services.filter(item => item !== service) : [...prev.services, service],
    }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')
    const response = await fetch(`${config.apiUrl}/sales/projects`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(data.error || 'Unable to create sales project')
      return
    }
    setMessage('Lead, CRM deal, and project created')
    setForm({ placeType: 'Hotel', businessName: '', ownerName: '', ownerEmail: '', phone: '', location: '', address: '', services: [], projectDetails: '', budget: '', paymentDuration: 'monthly', followUpDate: '', status: 'lead' })
    load()
  }

  const closeDeal = async (project: any) => {
    const response = await fetch(`${config.apiUrl}/sales/projects`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: project.id || project._id, status: 'closed_won', dealStage: 'closed_won' }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(data.error || 'Unable to close deal')
      return
    }
    setMessage('Deal closed and CRM updated')
    load()
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <SEOHead title="Sales Portal" description="Sales employee portal connected to CRM for field leads, projects, and closed deals." keywords="sales portal, crm, lead capture, project sales" canonical="/sales" />
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Sales Portal</h1>
            <p className="text-cream/40 text-sm">Create field leads, projects, CRM contacts, and deals from one place.</p>
          </div>
          <Link to="/crm" className="btn-outline text-sm">Open CRM</Link>
        </div>

        {message && <div className="mb-6 p-3 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-[8px] text-sm text-[#C8FF00]">{message}</div>}
        {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-[8px] text-sm text-red-400">{error}</div>}

        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          <form onSubmit={submit} className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-3">
            <div className="flex items-center gap-2 mb-2"><Plus size={16} className="text-[#C8FF00]" /><h2 className="font-display font-semibold">New Sales Project</h2></div>
            <select value={form.placeType} onChange={e => setForm({ ...form, placeType: e.target.value })} className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm">
              {placeTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <input required value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} placeholder="Business / place name" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
            <div className="grid md:grid-cols-2 gap-3">
              <input required value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} placeholder="Owner name" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
              <input required type="email" value={form.ownerEmail} onChange={e => setForm({ ...form, ownerEmail: e.target.value })} placeholder="Owner email" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="City / area" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
            </div>
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Address" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
            <div className="grid grid-cols-2 gap-2">
              {serviceOptions.map(service => (
                <label key={service} className="flex items-center gap-2 px-3 py-2 bg-obsidian border border-glass-border rounded-[4px] text-xs">
                  <input type="checkbox" checked={form.services.includes(service)} onChange={() => toggleService(service)} />
                  {service}
                </label>
              ))}
            </div>
            <textarea required value={form.projectDetails} onChange={e => setForm({ ...form, projectDetails: e.target.value })} rows={4} placeholder="Project details, pain points, current system, requirements" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm resize-none" />
            <div className="grid md:grid-cols-3 gap-3">
              <input value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="Budget" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
              <select value={form.paymentDuration} onChange={e => setForm({ ...form, paymentDuration: e.target.value })} className="px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm">
                <option value="one-time">One-time</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
              <input type="date" value={form.followUpDate} onChange={e => setForm({ ...form, followUpDate: e.target.value })} className="px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
            </div>
            <button type="submit" className="btn-primary w-full text-sm">Create Lead + Project</button>
          </form>

          <div className="space-y-4">
            {loading ? (
              <div className="p-10 bg-obsidian-2 border border-glass-border rounded-[16px] flex justify-center"><Loader2 className="animate-spin text-[#C8FF00]" /></div>
            ) : (
              projects.map(project => (
                <div key={project.id || project._id} className="p-5 bg-obsidian-2 border border-glass-border rounded-[12px]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-cream/40 mb-1"><Building2 size={14} /> {project.placeType || 'Business'}</div>
                      <h3 className="font-display font-semibold">{project.businessName || project.name}</h3>
                      <div className="text-xs text-cream/40 mt-1">{project.ownerName} · {project.ownerEmail}</div>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-white/[0.06] text-[10px] capitalize">{String(project.status || 'lead').replace(/_/g, ' ')}</span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3 mt-4 text-xs text-cream/40">
                    <div className="flex items-center gap-2"><Phone size={13} /> {project.phone || 'No phone'}</div>
                    <div className="flex items-center gap-2"><MapPin size={13} /> {project.location || 'No location'}</div>
                    <div className="flex items-center gap-2"><Target size={13} /> ₹{Number(project.budget || 0).toLocaleString('en-IN')}</div>
                  </div>
                  <p className="text-sm text-cream/60 mt-4">{project.projectDetails}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {(project.services || []).map((service: string) => <span key={service} className="px-2 py-1 bg-[#C8FF00]/10 text-[#C8FF00] rounded-[4px] text-[10px]">{service}</span>)}
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <button onClick={() => closeDeal(project)} className="btn-outline text-xs flex items-center gap-2"><CheckCircle2 size={13} /> Close Deal</button>
                    <Link to="/crm/deals" className="text-xs text-[#C8FF00]">View in CRM</Link>
                  </div>
                </div>
              ))
            )}
            {!loading && projects.length === 0 && <div className="p-10 bg-obsidian-2 border border-glass-border rounded-[16px] text-sm text-cream/40">No sales projects yet.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
