import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { config } from '../lib/config'

export default function ApplyJob() {
  const { id } = useParams()
  const [job, setJob] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', location: '', resumeUrl: '', portfolio: '', resumeText: '', coverLetter: '' })

  useEffect(() => {
    fetch(`${config.apiUrl}/careers`, { cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}))
        if (response.ok) setJob((data.data || []).find((item: any) => String(item._id) === String(id)))
      })
  }, [id])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    try {
      const response = await fetch(`${config.apiUrl}/careers/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, jobId: id }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Unable to submit application')
      setMessage('Application submitted. Our HR team can now review it in Recruitment.')
      setForm({ name: '', email: '', phone: '', location: '', resumeUrl: '', portfolio: '', resumeText: '', coverLetter: '' })
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-[900px] mx-auto px-8">
        <Link to="/careers" className="text-sm text-cream/40 hover:text-[#C8FF00]">Back to careers</Link>
        <h1 className="font-display text-3xl font-bold mt-4">{job?.role || job?.title || 'Apply for role'}</h1>
        <p className="text-sm text-cream/50 mt-2 mb-8">{job ? `${job.department} · ${job.location} · ${job.type || 'Full-time'}` : 'Submit your application details.'}</p>

        {message && <div className="mb-6 p-3 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-[8px] text-sm text-[#C8FF00]">{message}</div>}

        <form onSubmit={submit} className="grid md:grid-cols-2 gap-3 p-6 bg-obsidian-2 border border-glass-border rounded-[12px]">
          <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
          <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
          <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Current location" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
          <input value={form.resumeUrl} onChange={e => setForm({ ...form, resumeUrl: e.target.value })} placeholder="Resume link (Drive/LinkedIn/file URL)" className="md:col-span-2 px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
          <input value={form.portfolio} onChange={e => setForm({ ...form, portfolio: e.target.value })} placeholder="Portfolio / GitHub / LinkedIn" className="md:col-span-2 px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
          <textarea value={form.resumeText} onChange={e => setForm({ ...form, resumeText: e.target.value })} placeholder="Resume summary / skills / experience" className="md:col-span-2 min-h-28 px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
          <textarea value={form.coverLetter} onChange={e => setForm({ ...form, coverLetter: e.target.value })} placeholder="Why do you want this role?" className="md:col-span-2 min-h-28 px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
          <button disabled={submitting} className="md:col-span-2 btn-primary text-sm disabled:opacity-60">{submitting ? 'Submitting...' : 'Submit Application'}</button>
        </form>
      </div>
    </div>
  )
}
