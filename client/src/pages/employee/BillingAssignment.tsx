import { useState } from 'react'
import { FileText, Send } from 'lucide-react'
import { config } from '../../lib/config'

export default function BillingAssignment() {
  const [form, setForm] = useState({ email: '', title: 'Service bill', amount: '', currency: 'INR', dueDate: '' })
  const [message, setMessage] = useState('')

  async function assignBill() {
    setMessage('')
    const response = await fetch(`${config.apiUrl}/employee/assign-bill`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const payload = await response.json().catch(() => ({}))
    setMessage(response.ok ? `Bill assigned: ${payload.data.number}` : payload.error || 'Unable to assign bill')
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-[840px] mx-auto px-8">
        <div className="flex items-center gap-2 mb-2 text-[#C8FF00] text-xs font-mono"><FileText size={14} /> BILLING OPS</div>
        <h1 className="font-display text-3xl font-bold mb-2">Assign User Bill</h1>
        <p className="text-sm text-cream/40 mb-8">Create a bill for a customer account. It appears in their profile billing history with PDF download.</p>
        {message && <div className="mb-6 p-3 bg-white/[0.04] border border-glass-border rounded-[8px] text-sm text-cream/60">{message}</div>}
        <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] grid gap-4">
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="User email" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00]" />
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Bill title" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00]" />
          <div className="grid md:grid-cols-3 gap-4">
            <input value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="Amount" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00]" />
            <input value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} placeholder="Currency" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00]" />
            <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00]" />
          </div>
          <button onClick={assignBill} className="btn-primary justify-self-start flex items-center gap-2"><Send size={14} />Assign Bill</button>
        </div>
      </div>
    </div>
  )
}
