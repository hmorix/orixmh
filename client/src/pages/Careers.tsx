import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { config } from '../lib/config'

type Job = {
  _id: string
  role?: string
  title?: string
  department: string
  location: string
  type?: string
  salary?: string
  openings?: number
}

export default function Careers() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${config.apiUrl}/careers`, { cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}))
        if (response.ok) setJobs(data.data || [])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-[1280px] mx-auto px-8">
        <span className="label-mono">Careers</span>
        <h1 className="section-title mt-3 mb-6">Build the future with us</h1>
        <p className="text-lg text-cream/60 max-w-[600px] mb-16">Open roles below are pulled directly from the HR recruitment pipeline.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {[{ num: String(jobs.length), label: 'Open Roles' }, { num: 'Remote', label: 'Flexible Work' }, { num: 'Real', label: 'Hiring Pipeline' }].map((s, i) => (
            <div key={i} className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] text-center">
              <div className="font-display text-3xl font-bold text-[#C8FF00]">{s.num}</div>
              <div className="text-sm text-cream/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="font-display text-2xl font-bold mb-6">Open Positions</h2>
        <div className="space-y-3">
          {loading && <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[12px] text-cream/40">Loading roles...</div>}
          {!loading && jobs.length === 0 && <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[12px] text-cream/40">No open roles right now.</div>}
          {jobs.map(job => (
            <Link key={job._id} to={`/careers/apply/${job._id}`} className="flex items-center justify-between gap-4 p-6 bg-obsidian-2 border border-glass-border rounded-[16px] hover:border-[rgba(200,255,0,0.2)] transition-all">
              <div>
                <h3 className="font-display font-semibold">{job.role || job.title}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-cream/40">
                  <span>{job.department}</span><span>·</span><span>{job.location}</span><span>·</span><span>{job.type || 'Full-time'}</span>
                  {job.salary && <><span>·</span><span>{job.salary}</span></>}
                </div>
              </div>
              <span className="text-[#C8FF00] text-sm whitespace-nowrap">Apply -></span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
