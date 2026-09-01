import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import SEOHead from "../../components/seo/SEOHead"
import {
  Briefcase,
  Clock,
  Loader2,
  MapPin,
  Trash2,
  Users,
  Printer,
  FileText,
  CheckCircle2,
  XCircle,
  Calendar,
  ExternalLink,
  ChevronRight,
  Filter,
  Plus,
  ArrowLeft,
  DollarSign
} from "lucide-react"
import { config } from "../../lib/config"
import {
  printOfferLetter,
  printJoiningLetter,
  printAppointmentLetter,
  printSalaryCertificate,
  printEmployeeIdCard,
  downloadTextDoc
} from "../../lib/hrm-documents"

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

const STAGES = [
  { id: "all", label: "All Candidates" },
  { id: "applied", label: "Applied" },
  { id: "screening", label: "Screening" },
  { id: "interview_scheduled", label: "Interview" },
  { id: "second_interview", label: "2nd Round" },
  { id: "final_offer", label: "Offer Made" },
  { id: "joining_letter", label: "Joining Issued" },
  { id: "selected", label: "Hired" },
  { id: "rejected", label: "Rejected" }
]

export default function Recruitment() {
  const [deptFilter, setDeptFilter] = useState("all")
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [stageFilter, setStageFilter] = useState("all")
  const [scheduleDates, setScheduleDates] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    role: "",
    department: "Engineering",
    location: "Hathras, UP",
    type: "Full-time",
    salary: "₹6,00,000 - ₹12,00,000 PA",
    openings: "2"
  })

  const loadJobs = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiUrl}/hrm/recruitment`, {
        credentials: "include",
        cache: "no-store"
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Unable to load recruitment")
      setJobs(data.data || [])
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Unable to load recruitment"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  const departments = useMemo(
    () => ["all", ...Array.from(new Set(jobs.map(job => job.department)))],
    [jobs]
  )
  const filtered = deptFilter === "all" ? jobs : jobs.filter(j => j.department === deptFilter)
  const totalApplicants = jobs.reduce((s, j) => s + Number(j.applicants || 0), 0)
  const interviewCount = jobs.reduce((s, j) => s + Number(j.pipeline?.interview || 0), 0)
  const offerCount = jobs.reduce((s, j) => s + Number(j.pipeline?.offer || 0), 0)

  const postJob = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch(`${config.apiUrl}/hrm/recruitment`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, openings: Number(form.openings || 1) })
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage({ type: "error", text: data.error || "Unable to post job opening" })
      return
    }
    setJobs(prev => [data.data, ...prev])
    setForm({
      role: "",
      department: "Engineering",
      location: "Hathras, UP",
      type: "Full-time",
      salary: "₹6,00,000 - ₹12,00,000 PA",
      openings: "2"
    })
    setShowForm(false)
    setMessage({ type: "success", text: "Job opening published to careers portal." })
  }

  const deleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to close this job opening?")) return
    const response = await fetch(`${config.apiUrl}/hrm/recruitment?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include"
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage({ type: "error", text: data.error || "Unable to delete job" })
      return
    }
    setJobs(prev => prev.filter(job => String(job._id) !== id))
    setMessage({ type: "success", text: "Job opening closed." })
  }

  const loadApplicants = async (jobId?: string | null) => {
    const url = jobId
      ? `${config.apiUrl}/careers/applications?jobId=${encodeURIComponent(jobId)}`
      : `${config.apiUrl}/careers/applications`
    const response = await fetch(url, { credentials: "include", cache: "no-store" })
    const data = await response.json().catch(() => ({}))
    setApplications(response.ok ? data.data || [] : [])
  }

  const viewApplicants = async (job: Job) => {
    setSelectedJob(job)
    setStageFilter("all")
    await loadApplicants(String(job._id))
  }

  const viewAllApplicants = async () => {
    setSelectedJob(null)
    setStageFilter("all")
    await loadApplicants(null)
  }

  const updateApplication = async (
    id: string,
    status: string,
    options: {
      createEmployee?: boolean
      generateOfferLetter?: boolean
      generateJoiningLetter?: boolean
      nextInterviewDate?: string
    } = {}
  ) => {
    const response = await fetch(`${config.apiUrl}/careers/applications`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, ...options })
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage({ type: "error", text: data.error || "Unable to update applicant" })
      return
    }
    setApplications(prev => prev.map(app => (String(app._id) === id ? data.data : app)))
    setMessage({
      type: "success",
      text: options.createEmployee
        ? "Candidate hired! Employee profile & portal credentials generated."
        : "Candidate stage updated successfully."
    })
  }

  // 1-Click Document Generator helpers for applicant
  const handlePrintCandidateOffer = (app: any) => {
    const role = app.role || selectedJob?.role || selectedJob?.title || "Software Engineer"
    const dept = app.department || selectedJob?.department || "Engineering"
    const parsedCtc = Number(app.salaryExpectation || selectedJob?.salary?.replace(/[^0-9]/g, "") || 700000)
    printOfferLetter({
      name: app.name,
      email: app.email,
      phone: app.phone,
      address: app.location || "India",
      role: role,
      department: dept,
      ctc: parsedCtc > 50000 ? parsedCtc : 700000,
      joiningDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      location: selectedJob?.location || app.location || "Hathras, UP"
    })
  }

  const handlePrintCandidateJoining = (app: any) => {
    const role = app.role || selectedJob?.role || selectedJob?.title || "Software Engineer"
    const dept = app.department || selectedJob?.department || "Engineering"
    printJoiningLetter({
      name: app.name,
      employeeId: app.employeeId || `HM-${Date.now().toString().slice(-6)}`,
      role: role,
      department: dept,
      joiningDate: new Date().toISOString().slice(0, 10),
      location: selectedJob?.location || app.location || "Hathras, UP",
      workEmail: app.email
    })
  }

  
  const handlePrintCandidateSalaryCert = (app: any) => {
    const role = app.role || selectedJob?.role || selectedJob?.title || "Software Engineer"
    const dept = app.department || selectedJob?.department || "Engineering"
    const parsedCtc = Number(app.salaryExpectation || selectedJob?.salary?.replace(/[^0-9]/g, "") || 700000)
    const ctc = parsedCtc > 50000 ? parsedCtc : 700000
    printSalaryCertificate({
      name: app.name,
      employeeId: app.employeeId || `HM-${Date.now().toString().slice(-6)}`,
      role: role,
      department: dept,
      joiningDate: new Date().toISOString().slice(0, 10),
      monthlyGross: Math.round(ctc / 12),
      annualCtc: ctc
    })
  }

  const handlePrintCandidateIdCard = (app: any) => {
    const role = app.role || selectedJob?.role || selectedJob?.title || "Software Engineer"
    const dept = app.department || selectedJob?.department || "Engineering"
    printEmployeeIdCard({
      name: app.name,
      employeeId: app.employeeId || `HM-${Date.now().toString().slice(-6)}`,
      role: role,
      department: dept,
      joiningDate: new Date().toISOString().slice(0, 10)
    })
  }

  const handlePrintCandidateAppointment = (app: any) => {
    const role = app.role || selectedJob?.role || selectedJob?.title || "Software Engineer"
    const dept = app.department || selectedJob?.department || "Engineering"
    const parsedCtc = Number(app.salaryExpectation || 700000)
    printAppointmentLetter({
      name: app.name,
      employeeId: app.employeeId || `HM-${Date.now().toString().slice(-6)}`,
      role: role,
      department: dept,
      joiningDate: new Date().toISOString().slice(0, 10),
      location: selectedJob?.location || app.location || "Hathras, UP",
      ctc: parsedCtc > 50000 ? parsedCtc : 700000
    })
  }

  return (
    <div className="pt-28 pb-20 min-h-screen bg-obsidian text-cream">
      <SEOHead
        title="Recruitment & ATS Pipeline | Enterprise HRM"
        description="Manage job postings, applicant tracking pipelines, schedule interviews, and issue 1-click offer letters."
        keywords="recruitment pipeline, ATS, talent acquisition, offer letters, hiring workflow, HR recruitment"
        canonical="/hrm/recruitment"
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/hrm"
            className="inline-flex items-center gap-2 text-xs text-cream/50 hover:text-[#C8FF00] transition-colors"
          >
            <ArrowLeft size={14} /> Back to HRM Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={viewAllApplicants}
              className="btn-outline text-xs flex items-center gap-1.5 py-1.5 px-3"
            >
              <Users size={13} /> View All Candidates ({totalApplicants})
            </button>
            <button
              onClick={() => setShowForm(v => !v)}
              className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3"
            >
              <Plus size={13} /> Post Opening
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
              Talent Acquisition & ATS
            </h1>
            <p className="text-cream/50 text-sm mt-1">
              {jobs.length} active job listings &bull; {totalApplicants} candidate applications in pipeline
            </p>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-[12px] border text-sm ${
              message.type === "success"
                ? "bg-[#C8FF00]/10 border-[#C8FF00]/30 text-[#C8FF00]"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[
            { label: "Active Openings", val: jobs.length, icon: Briefcase, color: "text-[#C8FF00]" },
            { label: "Total Candidates", val: totalApplicants, icon: Users, color: "text-cream" },
            { label: "In Interviews", val: interviewCount, icon: Clock, color: "text-blue-400" },
            { label: "Offers Issued", val: offerCount, icon: CheckCircle2, color: "text-green-400" }
          ].map((stat, i) => (
            <div key={i} className="p-4 sm:p-5 bg-obsidian-2 border border-glass-border rounded-[14px]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-cream/40">{stat.label}</span>
                <stat.icon size={16} className={stat.color} />
              </div>
              <div className={`font-display text-2xl sm:text-3xl font-bold mt-2 ${stat.color}`}>
                {stat.val}
              </div>
            </div>
          ))}
        </div>

        {/* Post Job Drawer/Form */}
        {showForm && (
          <form
            onSubmit={postJob}
            className="p-6 bg-obsidian-2 border border-[#C8FF00]/30 rounded-[16px] mb-8 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-glass-border">
              <h2 className="font-display font-semibold text-base flex items-center gap-2">
                <Briefcase size={16} className="text-[#C8FF00]" /> Publish New Job Requirement
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-xs text-cream/40 hover:text-cream"
              >
                Cancel
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-cream/70">Role Title *</label>
                <input
                  required
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. Lead Fullstack Engineer (Next.js / Node)"
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-cream/70">Department *</label>
                <select
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00]"
                >
                  {["Engineering", "Product & Design", "Marketing", "Sales", "Human Resources", "Finance"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-cream/70">Work Location</label>
                <input
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Hathras / Remote / Delhi NCR"
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-cream/70">Employment Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00]"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-cream/70">Compensation Range (Annual)</label>
                <input
                  value={form.salary}
                  onChange={e => setForm({ ...form, salary: e.target.value })}
                  placeholder="e.g. ₹8,00,000 - ₹14,00,000 PA"
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-cream/70">No. of Openings</label>
                <input
                  type="number"
                  value={form.openings}
                  onChange={e => setForm({ ...form, openings: e.target.value })}
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button type="submit" className="btn-primary text-sm px-6 py-2">
                Publish Opening &rarr;
              </button>
            </div>
          </form>
        )}

        {/* Filter Bar */}
        <div className="flex items-center gap-3 mb-6">
          <Filter size={14} className="text-cream/40" />
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream/80 outline-none focus:border-[#C8FF00]"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === "all" ? "All Departments" : dept}
              </option>
            ))}
          </select>
        </div>

        {/* Job Listings Grid */}
        {loading ? (
          <div className="p-16 flex justify-center">
            <Loader2 className="animate-spin text-[#C8FF00]" size={32} />
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(job => {
              const title = job.role || job.title || "Open Role"
              const pipeline = job.pipeline || { applied: job.applicants || 0, screening: 0, interview: 0, offer: 0 }
              const isSelected = selectedJob?._id === job._id

              return (
                <div
                  key={job._id || job.id || title}
                  className={`p-5 sm:p-6 bg-obsidian-2 border rounded-[14px] transition-all ${
                    isSelected
                      ? "border-[#C8FF00] shadow-[0_0_20px_rgba(200,255,0,0.1)]"
                      : "border-glass-border hover:border-glass-border/80"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-semibold text-cream">{title}</h3>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-[10px] uppercase font-bold">
                          {job.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-cream/50">
                        <span className="flex items-center gap-1.5"><Briefcase size={12} /> {job.department}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={12} /> {job.location}</span>
                        <span className="flex items-center gap-1.5"><Clock size={12} /> {job.type || "Full-time"}</span>
                        <span className="text-[#C8FF00] font-semibold">{job.salary || "Competitive"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewApplicants(job)}
                        className={`text-xs px-3.5 py-1.5 rounded-[8px] flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? "bg-[#C8FF00] text-obsidian font-bold"
                            : "btn-primary"
                        }`}
                      >
                        <Users size={13} /> {isSelected ? "Viewing Candidates" : "Manage Pipeline"}
                      </button>
                      {job._id && (
                        <button
                          onClick={() => deleteJob(String(job._id))}
                          className="p-2 bg-red-500/10 text-red-400 rounded-[8px] hover:bg-red-500/20 transition-colors"
                          title="Close Opening"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stage Metrics Ribbon */}
                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-glass-border/50">
                    {Object.entries(pipeline).map(([stage, count]) => (
                      <div key={stage} className="p-2 bg-obsidian border border-glass-border rounded-[8px] text-center">
                        <div className="text-sm font-bold text-cream">{count}</div>
                        <div className="text-[10px] text-cream/40 uppercase tracking-wider capitalize mt-0.5">{stage}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ================= CANDIDATE ATS PIPELINE DRAWER ================= */}
        {applications.length > 0 && (
          <div className="mt-10 p-6 sm:p-8 bg-obsidian-2 border border-glass-border rounded-[18px] shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-glass-border mb-6">
              <div>
                <span className="text-xs px-2.5 py-1 bg-[#C8FF00]/10 border border-[#C8FF00]/30 rounded-full text-[#C8FF00] font-semibold">
                  ATS Candidate Tracker
                </span>
                <h2 className="font-display text-xl font-bold mt-2">
                  Applicants: {selectedJob ? (selectedJob.role || selectedJob.title) : "All Openings"}
                </h2>
              </div>
              <button
                onClick={() => { setSelectedJob(null); setApplications([]) }}
                className="btn-outline text-xs py-1.5 px-3 w-fit"
              >
                Close ATS View
              </button>
            </div>

            {/* Stage Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {STAGES.map(s => {
                const count = applications.filter(a => s.id === "all" || String(a.status) === s.id).length
                return (
                  <button
                    key={s.id}
                    onClick={() => setStageFilter(s.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                      stageFilter === s.id
                        ? "bg-[#C8FF00] text-obsidian font-bold shadow-[0_0_10px_rgba(200,255,0,0.3)]"
                        : "bg-obsidian border border-glass-border text-cream/60 hover:text-cream"
                    }`}
                  >
                    {s.label}
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      stageFilter === s.id ? "bg-obsidian/20 text-obsidian" : "bg-white/[0.08] text-cream/50"
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Applicant Cards */}
            <div className="space-y-4">
              {applications.filter(a => stageFilter === "all" || String(a.status) === stageFilter).length === 0 ? (
                <div className="p-12 text-center text-cream/40 bg-obsidian rounded-[12px] border border-glass-border">
                  No applicants currently in this stage.
                </div>
              ) : (
                applications
                  .filter(a => stageFilter === "all" || String(a.status) === stageFilter)
                  .map(app => (
                    <div
                      key={app._id}
                      className="p-5 sm:p-6 bg-obsidian border border-glass-border rounded-[14px] hover:border-glass-border/80 transition-all space-y-4"
                    >
                      {/* Candidate Top Row */}
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="w-11 h-11 rounded-full bg-[#C8FF00] text-obsidian flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {String(app.name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-display font-semibold text-base text-cream">{app.name}</h4>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize ${
                                app.status === 'selected' || app.status === 'hired'
                                  ? 'bg-green-500/20 text-green-400'
                                  : app.status === 'rejected'
                                  ? 'bg-red-500/20 text-red-400'
                                  : app.status === 'final_offer'
                                  ? 'bg-[#C8FF00]/20 text-[#C8FF00]'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {String(app.status).replace(/_/g, " ")}
                              </span>
                              {app.experience && <span className="text-[10px] px-2 py-0.5 bg-white/[0.04] border border-glass-border rounded text-cream/50">{app.experience} yrs exp</span>}
                              {app.noticePeriod && <span className="text-[10px] px-2 py-0.5 bg-white/[0.04] border border-glass-border rounded text-cream/50">Notice: {app.noticePeriod}d</span>}
                            </div>
                            <div className="text-xs text-cream/50 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span>{app.email}</span>
                              {app.phone && <><span>&bull;</span><span>{app.phone}</span></>}
                              {app.location && <><span>&bull;</span><span>{app.location}</span></>}
                              {app.salaryExpectation && (
                                <>
                                  <span>&bull;</span>
                                  <span className="text-[#C8FF00]">Expected: ₹{Number(app.salaryExpectation).toLocaleString("en-IN")}</span>
                                </>
                              )}
                            </div>
                            {app.nextInterviewDate && (
                              <div className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 font-medium">
                                <Calendar size={10} /> Interview: {new Date(app.nextInterviewDate).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Resume & Portfolio Links */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {app.resumeUrl && !app.resumeUrl.startsWith('pending:') && (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-outline text-xs flex items-center gap-1 py-1.5 px-3"
                            >
                              <ExternalLink size={12} /> Resume
                            </a>
                          )}
                          {app.resumeUrl && app.resumeUrl.startsWith('pending:') && (
                            <span className="text-[10px] text-yellow-400 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded">Resume Pending</span>
                          )}
                          {app.portfolio && (
                            <a
                              href={app.portfolio}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-outline text-xs flex items-center gap-1 py-1.5 px-3"
                            >
                              <ExternalLink size={12} /> Portfolio
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Resume Text Preview */}
                      {app.resumeText && (
                        <div className="p-3 bg-white/[0.02] border border-glass-border rounded-[8px] text-xs text-cream/70 line-clamp-2">
                          {app.resumeText}
                        </div>
                      )}

                      {/* Cover Letter Preview */}
                      {app.coverLetter && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-cream/40 hover:text-cream transition-colors">Show Cover Letter</summary>
                          <div className="mt-2 p-3 bg-white/[0.02] border border-glass-border rounded-[8px] text-cream/70">
                            {app.coverLetter}
                          </div>
                        </details>
                      )}

                      {/* Interview Scheduler */}
                      <div className="p-3 bg-white/[0.02] border border-glass-border/50 rounded-[10px] flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Calendar size={13} className="text-blue-400" />
                          <span className="text-xs text-cream/60 font-medium">Schedule Interview:</span>
                        </div>
                        <input
                          type="datetime-local"
                          value={scheduleDates[String(app._id)] || ""}
                          onChange={e => setScheduleDates(prev => ({ ...prev, [String(app._id)]: e.target.value }))}
                          className="flex-1 px-2.5 py-1.5 bg-obsidian border border-glass-border rounded-[6px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                        />
                        <button
                          onClick={() => {
                            const dt = scheduleDates[String(app._id)]
                            if (!dt) return
                            updateApplication(String(app._id), "interview_scheduled", { nextInterviewDate: dt })
                          }}
                          disabled={!scheduleDates[String(app._id)]}
                          className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-[6px] text-xs font-semibold hover:bg-blue-500/30 disabled:opacity-40"
                        >
                          Schedule &amp; Notify
                        </button>
                      </div>

                      {/* Action Ribbons */}
                      <div className="pt-3 border-t border-glass-border/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        {/* 1-Click Document Generator Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] text-cream/40 font-medium">1-Click Docs:</span>
                          <button
                            onClick={() => handlePrintCandidateOffer(app)}
                            className="px-2.5 py-1.5 bg-[#C8FF00]/10 border border-[#C8FF00]/30 hover:bg-[#C8FF00]/20 rounded-[6px] text-xs text-[#C8FF00] font-medium flex items-center gap-1.5 transition-colors"
                          >
                            <Printer size={12} /> Offer Letter
                          </button>
                          <button
                            onClick={() => handlePrintCandidateJoining(app)}
                            className="px-2.5 py-1.5 bg-white/[0.04] border border-glass-border hover:border-glass-border/80 rounded-[6px] text-xs text-cream/80 flex items-center gap-1.5 transition-colors"
                          >
                            <FileText size={12} /> Joining
                          </button>
                          <button
                            onClick={() => handlePrintCandidateAppointment(app)}
                            className="px-2.5 py-1.5 bg-white/[0.04] border border-glass-border hover:border-glass-border/80 rounded-[6px] text-xs text-cream/80 flex items-center gap-1.5 transition-colors"
                          >
                            <FileText size={12} /> Appointment
                          </button>
                          <button
                            onClick={() => handlePrintCandidateSalaryCert(app)}
                            className="px-2.5 py-1.5 bg-white/[0.04] border border-glass-border hover:border-glass-border/80 rounded-[6px] text-xs text-cream/80 flex items-center gap-1.5 transition-colors"
                          >
                            <FileText size={12} /> Salary Cert
                          </button>
                          <button
                            onClick={() => handlePrintCandidateIdCard(app)}
                            className="px-2.5 py-1.5 bg-white/[0.04] border border-glass-border hover:border-glass-border/80 rounded-[6px] text-xs text-cream/80 flex items-center gap-1.5 transition-colors"
                          >
                            <FileText size={12} /> ID Card
                          </button>
                        </div>

                        {/* Pipeline Stage Transitions */}
                        <div className="flex flex-wrap items-center gap-1.5 justify-end">
                          <button
                            onClick={() => updateApplication(String(app._id), "screening")}
                            className="px-2.5 py-1 bg-white/[0.04] border border-glass-border rounded text-xs text-cream/60 hover:text-cream"
                          >
                            Screen
                          </button>
                          <button
                            onClick={() => updateApplication(String(app._id), "second_interview")}
                            className="px-2.5 py-1 bg-white/[0.04] border border-glass-border rounded text-xs text-cream/60 hover:text-cream"
                          >
                            2nd Round
                          </button>
                          <button
                            onClick={() => updateApplication(String(app._id), "final_offer", { generateOfferLetter: true })}
                            className="px-2.5 py-1 bg-[#C8FF00]/10 border border-[#C8FF00]/30 rounded text-xs text-[#C8FF00]"
                          >
                            Extend Offer
                          </button>
                          <button
                            onClick={() => updateApplication(String(app._id), "selected", { createEmployee: true })}
                            className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 font-bold rounded text-xs hover:bg-green-500/30"
                          >
                            Hire &rarr;
                          </button>
                          <button
                            onClick={() => updateApplication(String(app._id), "rejected")}
                            className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs hover:bg-red-500/20"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
