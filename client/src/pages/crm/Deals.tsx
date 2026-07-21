import { useEffect, useMemo, useState } from 'react'
import SEOHead from '../../components/seo/SEOHead'
import { Plus, DollarSign } from 'lucide-react'
import { config } from '../../lib/config'

const stageDefs = [
  { key: 'lead', name: 'Lead', color: 'border-blue-500' },
  { key: 'qualification', name: 'Qualification', color: 'border-purple-500' },
  { key: 'discovery', name: 'Discovery', color: 'border-yellow-500' },
  { key: 'proposal', name: 'Proposal', color: 'border-orange-500' },
  { key: 'negotiation', name: 'Negotiation', color: 'border-pink-500' },
  { key: 'closed_won', name: 'Closed Won', color: 'border-green-500' },
]

const blankDeal = { id: '', name: '', company: '', contact: '', value: '', owner: 'HMorix Sales', stage: 'lead', probability: '20', expectedClose: '' }

export default function Deals() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [deals, setDeals] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blankDeal)
  const [message, setMessage] = useState('')

  const loadDeals = async () => {
    const response = await fetch(`${config.apiUrl}/crm/deals`, { credentials: 'include', cache: 'no-store' })
    const data = await response.json().catch(() => ({}))
    if (response.ok) setDeals(data.deals || [])
  }

  useEffect(() => {
    loadDeals()
  }, [])

  const totalValue = deals.reduce((sum, deal) => sum + Number(deal.value || 0), 0)
  const grouped = useMemo(() => stageDefs.map(stage => ({ ...stage, deals: deals.filter(deal => (deal.stage || 'lead') === stage.key) })), [deals])

  const saveDeal = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    const response = await fetch(`${config.apiUrl}/crm/deals`, {
      method: form.id ? 'PUT' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, value: Number(form.value || 0), probability: Number(form.probability || 0) }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(data.error || 'Unable to save deal')
      return
    }
    setShowForm(false)
    setForm(blankDeal)
    setMessage(form.id ? 'Deal updated' : 'Deal added')
    loadDeals()
  }

  const updateStage = async (deal: any, stage: string) => {
    await fetch(`${config.apiUrl}/crm/deals`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: String(deal._id || deal.id), stage }),
    })
    loadDeals()
  }

  const openEdit = (deal: any) => {
    setForm({ id: String(deal._id || deal.id || ''), name: deal.name || '', company: deal.company || '', contact: deal.contact || '', value: String(deal.value || ''), owner: deal.owner || 'HMorix Sales', stage: deal.stage || 'lead', probability: String(deal.probability || 20), expectedClose: deal.expectedClose || '' })
    setShowForm(true)
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <SEOHead title="CRM Deals & Pipeline" description="Visual sales pipeline with Kanban board view. Track deals through stages from lead to close." keywords="sales pipeline, deal tracking, Kanban CRM, sales stages, deal management, revenue pipeline" canonical="/crm/deals" />
      <div className="max-w-[1600px] mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Deals Pipeline</h1>
            <p className="text-cream/50 text-sm mt-1">Total pipeline value: <span className="text-[#C8FF00] font-semibold">₹{(totalValue / 100000).toFixed(1)}L</span></p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex border border-glass-border rounded-[6px] overflow-hidden">
              <button onClick={() => setView('kanban')} className={`px-3 py-1.5 text-xs ${view === 'kanban' ? 'bg-[#C8FF00] text-obsidian' : 'text-cream/50'}`}>Kanban</button>
              <button onClick={() => setView('list')} className={`px-3 py-1.5 text-xs ${view === 'list' ? 'bg-[#C8FF00] text-obsidian' : 'text-cream/50'}`}>List</button>
            </div>
            <button onClick={() => { setForm(blankDeal); setShowForm(v => !v) }} className="btn-primary text-sm flex items-center gap-2"><Plus size={14} /> New Deal</button>
          </div>
        </div>

        {message && <div className="mb-6 p-3 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-[8px] text-sm text-[#C8FF00]">{message}</div>}

        {showForm && (
          <form onSubmit={saveDeal} className="grid md:grid-cols-4 gap-3 mb-6 p-5 bg-obsidian-2 border border-glass-border rounded-[12px]">
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Deal name" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Company" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="Contact" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="Value" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })} className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]">{stageDefs.map(stage => <option key={stage.key} value={stage.key}>{stage.name}</option>)}</select>
            <input type="number" value={form.probability} onChange={e => setForm({ ...form, probability: e.target.value })} placeholder="Probability" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <input value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} placeholder="Owner" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <input type="date" value={form.expectedClose} onChange={e => setForm({ ...form, expectedClose: e.target.value })} className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <button type="submit" className="btn-primary text-sm">{form.id ? 'Update Deal' : 'Save Deal'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm">Cancel</button>
          </form>
        )}

        {view === 'kanban' ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {grouped.map(stage => (
              <div key={stage.key} className="min-w-[280px] flex-shrink-0">
                <div className={`border-t-2 ${stage.color} bg-obsidian-2 border border-glass-border rounded-[12px] p-4`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2"><span className="text-sm font-semibold">{stage.name}</span><span className="w-5 h-5 bg-white/[0.06] rounded-full text-[10px] flex items-center justify-center">{stage.deals.length}</span></div>
                    <span className="text-[10px] text-cream/30">₹{stage.deals.reduce((s, d) => s + Number(d.value || 0), 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="space-y-3">
                    {stage.deals.map(deal => (
                      <div key={deal._id || deal.id} onClick={() => openEdit(deal)} className="p-3 bg-obsidian border border-glass-border rounded-[8px] hover:border-[#C8FF00]/30 transition-all cursor-pointer">
                        <div className="text-sm font-medium mb-1">{deal.name}</div>
                        <div className="text-[10px] text-cream/30 mb-2">{deal.company || deal.contact || 'No company'}</div>
                        <div className="flex items-center justify-between"><span className="flex items-center gap-1 text-xs text-[#C8FF00]"><DollarSign size={10} />₹{Number(deal.value || 0).toLocaleString('en-IN')}</span><span className="text-[10px] text-cream/30">{Math.max(0, Math.ceil((Date.now() - new Date(deal.createdAt || Date.now()).getTime()) / 86400000))}d</span></div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="w-6 h-6 bg-obsidian-3 rounded-full flex items-center justify-center text-[8px] font-bold">{String(deal.owner || 'H')[0]}</div>
                          <div className="flex items-center gap-1"><div className="w-16 h-1.5 bg-obsidian-3 rounded-full overflow-hidden"><div className="h-full bg-[#C8FF00] rounded-full" style={{ width: `${Number(deal.probability || 0)}%` }} /></div><span className="text-[9px] text-cream/30">{deal.probability || 0}%</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { setForm({ ...blankDeal, stage: stage.key }); setShowForm(true) }} className="w-full mt-3 py-2 border border-dashed border-glass-border rounded-[6px] text-xs text-cream/30 hover:text-cream hover:border-cream/30 transition-all">+ Add Deal</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-obsidian-2 border border-glass-border rounded-[12px] overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-cream/30 text-xs border-b border-glass-border bg-white/[0.02]"><th className="p-4">Deal</th><th className="p-4">Company</th><th className="p-4">Value</th><th className="p-4">Stage</th><th className="p-4">Owner</th><th className="p-4">Probability</th></tr></thead>
              <tbody>
                {deals.map(deal => (
                  <tr key={deal._id || deal.id} onClick={() => openEdit(deal)} className="border-b border-glass-border/50 hover:bg-white/[0.02] cursor-pointer">
                    <td className="p-4 font-medium">{deal.name}</td>
                    <td className="p-4 text-cream/50">{deal.company || '-'}</td>
                    <td className="p-4 text-[#C8FF00]">₹{Number(deal.value || 0).toLocaleString('en-IN')}</td>
                    <td className="p-4"><select value={deal.stage || 'lead'} onClick={e => e.stopPropagation()} onChange={e => updateStage(deal, e.target.value)} className="bg-obsidian border border-glass-border rounded px-2 py-1 text-xs">{stageDefs.map(stage => <option key={stage.key} value={stage.key}>{stage.name}</option>)}</select></td>
                    <td className="p-4">{deal.owner || '-'}</td>
                    <td className="p-4">{deal.probability || 0}%</td>
                  </tr>
                ))}
                {deals.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-cream/40">No deals yet. Add your first live deal.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
