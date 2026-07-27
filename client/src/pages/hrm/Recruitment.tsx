import { useEffect, useMemo, useState } from 'react'
import SEOHead from '../../components/seo/SEOHead'
import { Briefcase, Clock, Loader2, MapPin, Trash2, Users } from 'lucide-react'
import { config } from '../../lib/config'

type Job = {
  _id?: string
  id?: number
  role?: string
  title?: string
  department: string
  location: string
  type?: string
  salary?: string
  applicants: number
  openings?: number
  status: string
  posted?: string
  createdAt?: string
  pipeline?: Record<string, number>
}

export default function Recruitment() {
  const [deptFilter, setDeptFilter] = useState('all')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [stageFilter, setStageFilter] = useState('all')
  const [scheduleDates, setScheduleDates] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ role: '', department: 'Engineering', location: 'Hathras', type: 'Full-time', salary: '', openings: '1' })

  const loadJobs = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiUrl}/hrm/recruitment`, { credentials: 'include', cache: 'no-store' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Unable to load recruitment')
      setJobs(data.data || [])
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to load recruitment')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  const departments = useMemo(() => ['all', ...Array.from(new Set(jobs.map(job => job.department)))], [jobs])
  const filtered = deptFilter === 'all' ? jobs : jobs.filter(j => j.department === deptFilter)
  const totalApplicants = jobs.reduce((s, j) => s + Number(j.applicants || 0), 0)
  const interviewCount = jobs.reduce((s, j) => s + Number(j.pipeline?.interview || 0), 0)
  const offerCount = jobs.reduce((s, j) => s + Number(j.pipeline?.offer || 0), 0)

  const postJob = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch(`${config.apiUrl}/hrm/recruitment`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, openings: Number(form.openings || 1) }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(data.error || 'Unable to post job')
      return
    }
    setJobs(prev => [data.data, ...prev])
    setForm({ role: '', department: 'Engineering', location: 'Hathras', type: 'Full-time', salary: '', openings: '1' })
    setShowForm(false)
    setMessage('Job posted successfully')
  }

  const deleteJob = async (id: string) => {
    const response = await fetch(`${config.apiUrl}/hrm/recruitment?id=${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(data.error || 'Unable to delete job')
      return
    }
    setJobs(prev => prev.filter(job => String(job._id) !== id))
    setMessage('Job closed and removed from careers')
  }

  const loadApplicants = async (jobId?: string | null) => {
    const url = jobId ? `${config.apiUrl}/careers/applications?jobId=${encodeURIComponent(jobId)}` : `${config.apiUrl}/careers/applications`
    const response = await fetch(url, { credentials: 'include', cache: 'no-store' })
    const data = await response.json().catch(() => ({}))
    setApplications(response.ok ? data.data || [] : [])
  }

  const viewApplicants = async (job: Job) => {
    setSelectedJob(job)
    setStageFilter('all')
    await loadApplicants(String(job._id))
  }

  const viewAllApplicants = async () => {
    setSelectedJob(null)
    setStageFilter('all')
    await loadApplicants(null)
  }

  const updateApplication = async (id: string, status: string, options: { createEmployee?: boolean; generateOfferLetter?: boolean; generateJoiningLetter?: boolean; nextInterviewDate?: string } = {}) => {
    const response = await fetch(`${config.apiUrl}/careers/applications`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, ...options }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(data.error || 'Unable to update applicant')
      return
    }
    setApplications(prev => prev.map(app => String(app._id) === id ? data.data : app))
    setMessage(options.createEmployee ? 'Applicant selected and employee access was generated' : 'Applicant updated')
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <SEOHead title="HRM Recruitment" description="Recruitment pipeline management - track job openings, applicants, interviews, and hiring progress." keywords="recruitment, hiring, job openings, applicant tracking, ATS, talent acquisition, HR recruitment, interview pipeline" canonical="/hrm/recruitment" />
      <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
            <h1 className="font-display text-3xl font-bold">Recruitment</h1>
            <p className="text-cream/50 text-sm mt-1">{jobs.length} open positions · {totalApplicants} total applicants</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={viewAllApplicants} className="btn-outline text-sm">All Applicants</button>
            <button onClick={() => setShowForm(v => !v)} className="btn-primary text-sm">+ Post New Job</button>
          </div>
          </div>

        {message && <div className="mb-6 p-3 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-[8px] text-sm text-[#C8FF00]">{message}</div>}

        {showForm && (
          <form onSubmit={postJob} className="grid md:grid-cols-3 gap-3 mb-8 p-5 bg-obsidian-2 border border-glass-border rounded-[12px]">
            <input required value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Role title" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="Department" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="Type" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <input value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="Salary" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <input type="number" value={form.openings} onChange={e => setForm({ ...form, openings: e.target.value })} placeholder="Openings" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <button type="submit" className="btn-primary text-sm md:col-span-3">Save Opening</button>
          </form>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-obsidian-2 border border-glass-border rounded-[12px] text-center"><div className="text-2xl font-bold text-[#C8FF00]">{jobs.length}</div><div className="text-xs text-cream/30">Open Positions</div></div>
          <div className="p-4 bg-obsidian-2 border border-glass-border rounded-[12px] text-center"><div className="text-2xl font-bold">{totalApplicants}</div><div className="text-xs text-cream/30">Total Applicants</div></div>
          <div className="p-4 bg-obsidian-2 border border-glass-border rounded-[12px] text-center"><div className="text-2xl font-bold">{interviewCount}</div><div className="text-xs text-cream/30">In Interview</div></div>
          <div className="p-4 bg-obsidian-2 border border-glass-border rounded-[12px] text-center"><div className="text-2xl font-bold text-green-400">{offerCount}</div><div className="text-xs text-cream/30">Offers Extended</div></div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[6px] text-sm text-cream/70">
            {departments.map(dept => <option key={dept} value={dept}>{dept === 'all' ? 'All Departments' : dept}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#C8FF00]" /></div>
        ) : (
          <div className="space-y-4">
            {filtered.map(job => {
              const title = job.role || job.title || 'Open Role'
              const pipeline = job.pipeline || { applied: job.applicants || 0, screening: 0, interview: 0, offer: 0 }
              return (
                <div key={job._id || job.id || title} className="p-6 bg-obsidian-2 border border-glass-border rounded-[12px] hover:border-[#C8FF00]/20 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-display text-lg font-semibold">{title}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-cream/40">
                        <span className="flex items-center gap-1"><Briefcase size={12} /> {job.department}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {job.type || 'Full-time'}</span>
                        <span className="text-[#C8FF00]">{job.salary || 'As per experience'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"><Users size={12} /> {job.applicants || 0}</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">{job.status}</span>
                      {job._id && <button onClick={() => deleteJob(String(job._id))} className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20"><Trash2 size={14} /></button>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {Object.entries(pipeline).map(([stage, count]) => (
                      <div key={stage} className="flex-1 p-2 bg-obsidian border border-glass-border rounded-[6px] text-center">
                        <div className="text-sm font-bold">{count}</div>
                        <div className="text-[9px] text-cream/30 capitalize">{stage}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => viewApplicants(job)} className="mt-3 px-3 py-2 bg-white/[0.04] border border-glass-border rounded-[6px] text-xs text-cream/60 hover:text-[#C8FF00] hover:border-[#C8FF00]/40">View applicants</button>
                </div>
              )
            })}
          </div>
        )}

        {applications.length > 0 && (
          <div className="mt-8 p-6 bg-obsidian-2 border border-glass-border rounded-[12px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">Applicants - {selectedJob ? (selectedJob.role || selectedJob.title) : 'All applicants'}</h2>
              <button onClick={() => { setSelectedJob(null); setApplications([]) }} className="text-xs text-cream/40 hover:text-cream">Close</button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {['all', 'applied', 'screening', 'interview_scheduled', 'interview', 'second_interview', 'final_offer', 'joining_letter', 'hired', 'rejected'].map(stage => (
                <button key={stage} onClick={() => setStageFilter(stage)} className={`px-3 py-1.5 text-xs rounded-full capitalize transition-all ${stageFilter === stage ? 'bg-[#C8FF00] text-obsidian' : 'bg-white/[0.04] text-cream/50 hover:text-cream'}`}>{stage.replace(/_/g, ' ')}</button>
              ))}
            </div>
            <div className="space-y-3">
              {applications.filter(app => stageFilter === 'all' || String(app.status) === stageFilter).length === 0 && <div className="text-sm text-cream/40">No applications yet.</div>}
              {applications.filter(app => stageFilter === 'all' || String(app.status) === stageFilter).map(app => (
                <div key={app._id} className="p-4 bg-obsidian border border-glass-border rounded-[8px]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{app.name}</div>
                      <div className="text-xs text-cream/40">{app.email} · {app.phone || 'No phone'} · {app.location || 'No location'}</div>
                      {app.resumeUrl && <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-[#C8FF00]">Open resume</a>}
                      {app.resumeText && <p className="mt-2 text-xs text-cream/50 line-clamp-2">{app.resumeText}</p>}
                      {app.offerLetter && <div className="mt-2 p-2 bg-white/[0.03] rounded text-[10px] text-cream/50 whitespace-pre-wrap">{app.offerLetter}</div>}
                      {app.joiningLetter && <div className="mt-2 p-2 bg-white/[0.03] rounded text-[10px] text-cream/50 whitespace-pre-wrap">{app.joiningLetter}</div>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs capitalize">{String(app.status).replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-2">
                        <input type="date" value={scheduleDates[String(app._id)] || ''} onChange={e => setScheduleDates(prev => ({ ...prev, [String(app._id)]: e.target.value }))} className="px-2 py-1 bg-obsidian-2 border border-glass-border rounded text-xs text-cream/70" />
                        <button onClick={() => updateApplication(String(app._id), 'interview_scheduled', { nextInterviewDate: scheduleDates[String(app._id)] })} className="px-2 py-1 bg-white/[0.04] border border-glass-border rounded text-xs">Schedule</button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 justify-end">
                        <button onClick={() => updateApplication(String(app._id), 'screening')} className="px-2 py-1 bg-white/[0.04] border border-glass-border rounded text-xs">Screen</button>
                        <button onClick={() => updateApplication(String(app._id), 'interview')} className="px-2 py-1 bg-white/[0.04] border border-glass-border rounded text-xs">Interview</button>
                        <button onClick={() => updateApplication(String(app._id), 'second_interview')} className="px-2 py-1 bg-white/[0.04] border border-glass-border rounded text-xs">Next interview</button>
                        <button onClick={() => updateApplication(String(app._id), 'final_offer', { generateOfferLetter: true })} className="px-2 py-1 bg-white/[0.04] border border-glass-border rounded text-xs">Offer letter</button>
                        <button onClick={() => updateApplication(String(app._id), 'joining_letter', { generateJoiningLetter: true })} className="px-2 py-1 bg-white/[0.04] border border-glass-border rounded text-xs">Joining letter</button>
                        <button onClick={() => updateApplication(String(app._id), 'selected', { createEmployee: true })} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Accept</button>
                        <button onClick={() => updateApplication(String(app._id), 'rejected')} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Reject</button>
                      </div>
                    </div>
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
