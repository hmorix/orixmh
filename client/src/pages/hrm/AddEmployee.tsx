import { useState } from "react"
import { Link } from "react-router-dom"
import SEOHead from "../../components/seo/SEOHead"
import {
  UserPlus,
  Copy,
  Check,
  FileText,
  Building,
  User,
  Key,
  ArrowLeft,
  Printer,
  Sparkles,
  ExternalLink
} from "lucide-react"
import { config } from "../../lib/config"
import {
  printAppointmentLetter,
  printJoiningLetter,
  printOfferLetter
} from "../../lib/hrm-documents"

const DEPARTMENTS = [
  "Engineering",
  "Product & Design",
  "Marketing & Growth",
  "Sales & Business Dev",
  "Human Resources",
  "Finance & Operations",
  "Customer Success"
]

export default function AddEmployee() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    department: "Engineering",
    role: "",
    location: "Hathras, UP",
    salary: "600000",
    startDate: new Date().toISOString().slice(0, 10),
    status: "active",
    reportingTo: "Harsh Sharma (Director)"
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [created, setCreated] = useState<any>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copyValue = (value: string, keyName: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(keyName)
      setTimeout(() => setCopiedKey(null), 2000)
    })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setCreated(null)

    try {
      const response = await fetch(`${config.apiUrl}/hrm/people`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email || undefined,
          username: form.username || undefined,
          password: form.password || undefined,
          department: form.department,
          role: form.role,
          location: form.location,
          salary: Number(form.salary || 0),
          startDate: form.startDate,
          status: form.status,
          reportingTo: form.reportingTo
        })
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || "Unable to create employee record")
      }

      setCreated(data.data)
      setMessage({
        type: "success",
        text: `Employee ${form.name} created successfully with permanent ID ${data.data?.employeeId || "assigned"}.`
      })
      setStep(3)
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Unable to add employee"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePrintAppointment = () => {
    if (!created) return
    printAppointmentLetter({
      name: created.name || form.name,
      employeeId: created.employeeId || "HM-NEW",
      role: created.role || form.role,
      department: created.department || form.department,
      joiningDate: created.startDate || form.startDate,
      location: created.location || form.location,
      ctc: Number(created.salary || form.salary || 600000),
      reportingTo: form.reportingTo
    })
  }

  const handlePrintJoining = () => {
    if (!created) return
    printJoiningLetter({
      name: created.name || form.name,
      employeeId: created.employeeId || "HM-NEW",
      role: created.role || form.role,
      department: created.department || form.department,
      joiningDate: created.startDate || form.startDate,
      location: created.location || form.location,
      reportingTo: form.reportingTo,
      workEmail: created.credentials?.email || form.email
    })
  }

  const handlePrintOffer = () => {
    if (!created) return
    printOfferLetter({
      name: created.name || form.name,
      email: created.credentials?.email || form.email,
      phone: form.phone,
      role: created.role || form.role,
      department: created.department || form.department,
      ctc: Number(created.salary || form.salary || 600000),
      joiningDate: created.startDate || form.startDate,
      location: created.location || form.location,
      reportingTo: form.reportingTo
    })
  }

  const resetForm = () => {
    setCreated(null)
    setMessage(null)
    setStep(1)
    setForm({
      name: "",
      email: "",
      phone: "",
      username: "",
      password: "",
      department: "Engineering",
      role: "",
      location: "Hathras, UP",
      salary: "600000",
      startDate: new Date().toISOString().slice(0, 10),
      status: "active",
      reportingTo: "Harsh Sharma (Director)"
    })
  }

  return (
    <div className="pt-28 pb-20 min-h-screen bg-obsidian text-cream">
      <SEOHead
        title="Add Employee | Enterprise HRM"
        description="Onboard team members, auto-generate login credentials, and issue 1-click appointment & joining letters."
        keywords="add employee, employee onboarding, HRM, employee credentials, appointment letter generator"
        canonical="/hrm/employees/new"
      />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/hrm"
            className="inline-flex items-center gap-2 text-xs text-cream/50 hover:text-[#C8FF00] transition-colors"
          >
            <ArrowLeft size={14} /> Back to HRM Dashboard
          </Link>
          <span className="text-xs px-2.5 py-1 bg-white/[0.04] border border-glass-border rounded-full text-cream/40 font-mono">
            Auto-ID Generator Active
          </span>
        </div>

        {/* Page Header */}
        <div className="p-6 sm:p-8 bg-obsidian-2 border border-glass-border rounded-[16px] mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C8FF00]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-full text-xs font-semibold text-[#C8FF00] mb-3">
                <Sparkles size={12} /> Enterprise Onboarding Engine
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
                Onboard New Employee
              </h1>
              <p className="text-cream/50 text-sm mt-1 max-w-xl">
                Create full employee profile, auto-provision employee portal access credentials, and instantly generate official printable HR letters.
              </p>
            </div>
            <div className="w-14 h-14 rounded-[14px] bg-[#C8FF00]/10 border border-[#C8FF00]/20 flex items-center justify-center text-[#C8FF00] flex-shrink-0">
              <UserPlus size={28} />
            </div>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-glass-border/70">
            {[
              { num: 1, label: "Personal Info", icon: User },
              { num: 2, label: "Role & Compensation", icon: Building },
              { num: 3, label: "Access & Documents", icon: Key }
            ].map(s => {
              const active = step === s.num
              const done = step > s.num || (created && s.num < 3)
              return (
                <button
                  type="button"
                  key={s.num}
                  onClick={() => !created && setStep(s.num as any)}
                  className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-[10px] text-left transition-all border ${
                    active
                      ? "bg-[#C8FF00]/10 border-[#C8FF00]/40 text-[#C8FF00]"
                      : done
                      ? "bg-white/[0.02] border-glass-border text-cream/70"
                      : "bg-transparent border-transparent text-cream/30"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      active
                        ? "bg-[#C8FF00] text-obsidian"
                        : done
                        ? "bg-white/[0.1] text-cream"
                        : "bg-white/[0.04] text-cream/30"
                    }`}
                  >
                    {s.num}
                  </div>
                  <span className="text-xs font-medium hidden sm:inline">{s.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-[12px] border text-sm flex items-start gap-3 ${
              message.type === "success"
                ? "bg-[#C8FF00]/10 border-[#C8FF00]/30 text-[#C8FF00]"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {message.type === "success" ? <Check size={18} className="flex-shrink-0 mt-0.5" /> : null}
            <div>{message.text}</div>
          </div>
        )}

        {/* Form or Success Card */}
        {!created ? (
          <form onSubmit={submit} className="space-y-6">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-glass-border">
                  <User size={16} className="text-[#C8FF00]" />
                  <h2 className="font-display font-semibold text-base">Step 1: Personal & Contact Information</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs text-cream/70 font-medium">Full Legal Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Rahul Verma"
                      className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream placeholder:text-cream/30 outline-none focus:border-[#C8FF00] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-cream/70 font-medium">Official / Personal Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="rahul.verma@hmorix.com"
                      className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream placeholder:text-cream/30 outline-none focus:border-[#C8FF00] transition-colors"
                    />
                    <span className="text-[10px] text-cream/40">If left empty, system generates email from name.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-cream/70 font-medium">Contact Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream placeholder:text-cream/30 outline-none focus:border-[#C8FF00] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-glass-border">
                  <button
                    type="button"
                    disabled={!form.name.trim()}
                    onClick={() => setStep(2)}
                    className="btn-primary text-sm px-6 py-2.5 disabled:opacity-50"
                  >
                    Next: Role & Compensation &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Role & Compensation */}
            {step === 2 && (
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-glass-border">
                  <Building size={16} className="text-[#C8FF00]" />
                  <h2 className="font-display font-semibold text-base">Step 2: Role & Employment Details</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-cream/70 font-medium">Job Designation / Role *</label>
                    <input
                      required
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream placeholder:text-cream/30 outline-none focus:border-[#C8FF00] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-cream/70 font-medium">Department *</label>
                    <select
                      value={form.department}
                      onChange={e => setForm({ ...form, department: e.target.value })}
                      className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] transition-colors"
                    >
                      {DEPARTMENTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-cream/70 font-medium">Annual CTC (INR ₹) *</label>
                    <input
                      type="number"
                      required
                      value={form.salary}
                      onChange={e => setForm({ ...form, salary: e.target.value })}
                      placeholder="e.g. 750000"
                      className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream placeholder:text-cream/30 outline-none focus:border-[#C8FF00] transition-colors"
                    />
                    <span className="text-[10px] text-[#C8FF00]">
                      ₹{Math.round(Number(form.salary || 0) / 12).toLocaleString("en-IN")}/month gross
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-cream/70 font-medium">Date of Joining *</label>
                    <input
                      type="date"
                      required
                      value={form.startDate}
                      onChange={e => setForm({ ...form, startDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-cream/70 font-medium">Work Location</label>
                    <input
                      value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g. Hathras / Remote / Delhi NCR"
                      className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream placeholder:text-cream/30 outline-none focus:border-[#C8FF00] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-cream/70 font-medium">Reporting Manager</label>
                    <input
                      value={form.reportingTo}
                      onChange={e => setForm({ ...form, reportingTo: e.target.value })}
                      placeholder="Harsh Sharma (Director)"
                      className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream placeholder:text-cream/30 outline-none focus:border-[#C8FF00] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-glass-border">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-outline text-sm px-5 py-2.5"
                  >
                    &larr; Back
                  </button>
                  <button
                    type="button"
                    disabled={!form.role.trim() || !form.salary}
                    onClick={() => setStep(3)}
                    className="btn-primary text-sm px-6 py-2.5 disabled:opacity-50"
                  >
                    Next: Provision Credentials &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Access & Submit */}
            {step === 3 && (
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-glass-border">
                  <Key size={16} className="text-[#C8FF00]" />
                  <h2 className="font-display font-semibold text-base">Step 3: Portal Credentials & Status</h2>
                </div>

                <div className="p-4 bg-obsidian border border-glass-border rounded-[10px] space-y-2">
                  <div className="text-xs font-semibold text-[#C8FF00]">Automated Access Provisioning:</div>
                  <p className="text-xs text-cream/60">
                    Leaving username/password blank will auto-generate secure login credentials and email them to the employee.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-cream/70 font-medium">Custom Username (Optional)</label>
                    <input
                      value={form.username}
                      onChange={e => setForm({ ...form, username: e.target.value })}
                      placeholder="Auto-generated if blank"
                      className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream placeholder:text-cream/30 outline-none focus:border-[#C8FF00]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-cream/70 font-medium">Custom Password (Optional)</label>
                    <input
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="Auto-generated if blank"
                      className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream placeholder:text-cream/30 outline-none focus:border-[#C8FF00]"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs text-cream/70 font-medium">Initial Employment Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00]"
                    >
                      <option value="active">Active (Standard Full-Time)</option>
                      <option value="onboarding">Onboarding / Probation Period</option>
                      <option value="contract">Contractor / Consultant</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-glass-border">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-outline text-sm px-5 py-2.5"
                  >
                    &larr; Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary text-sm px-8 py-2.5 flex items-center gap-2 disabled:opacity-60"
                  >
                    {loading ? "Creating Employee..." : "Confirm & Create Employee"}
                  </button>
                </div>
              </div>
            )}
          </form>
        ) : (
          /* ================= SUCCESS & DOCUMENT DISPATCH CARD ================= */
          <div className="space-y-6">
            {/* Credentials Card */}
            <div className="p-6 sm:p-8 bg-obsidian-2 border border-[#C8FF00]/30 rounded-[16px] relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="px-2.5 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                    ✓ Onboarding Complete
                  </span>
                  <h2 className="font-display text-xl font-bold mt-2">
                    {created.name} &bull; <span className="text-[#C8FF00]">{created.employeeId}</span>
                  </h2>
                  <p className="text-xs text-cream/50 mt-1">
                    {created.role} &bull; {created.department} &bull; {created.location}
                  </p>
                </div>
                <a
                  href="/employee/login"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline text-xs flex items-center gap-1.5 w-fit"
                >
                  <ExternalLink size={14} /> Open Employee Portal
                </a>
              </div>

              {/* Login Credentials Grid */}
              <div className="grid sm:grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Login Email", val: created.credentials?.email || form.email, key: "email" },
                  { label: "Username", val: created.credentials?.username || "auto-generated", key: "user" },
                  { label: "Initial Password", val: created.credentials?.password || "********", key: "pass" }
                ].map(cred => (
                  <div key={cred.label} className="p-4 bg-obsidian border border-glass-border rounded-[10px]">
                    <div className="text-[10px] text-cream/40 uppercase tracking-wider font-mono mb-1.5">
                      {cred.label}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-cream break-all">{cred.val}</span>
                      <button
                        type="button"
                        onClick={() => copyValue(cred.val, cred.key)}
                        className="p-1.5 bg-white/[0.04] border border-glass-border rounded-[6px] hover:text-[#C8FF00] transition-colors flex-shrink-0"
                        title="Copy to clipboard"
                      >
                        {copiedKey === cred.key ? <Check size={13} className="text-[#C8FF00]" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 1-Click Document Generation Toolbar */}
              <div className="p-4 bg-obsidian border border-glass-border rounded-[12px]">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={16} className="text-[#C8FF00]" />
                  <span className="text-xs font-semibold text-cream">1-Click Official Document Generator:</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={handlePrintAppointment}
                    className="btn-primary text-xs flex items-center gap-1.5 py-2 px-4"
                  >
                    <Printer size={13} /> Print Appointment Letter
                  </button>
                  <button
                    onClick={handlePrintJoining}
                    className="btn-outline text-xs flex items-center gap-1.5 py-2 px-4"
                  >
                    <FileText size={13} /> Print Joining Letter
                  </button>
                  <button
                    onClick={handlePrintOffer}
                    className="btn-outline text-xs flex items-center gap-1.5 py-2 px-4"
                  >
                    <FileText size={13} /> Print Offer Letter
                  </button>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between gap-4">
              <Link to="/hrm" className="btn-outline text-sm">
                &larr; Return to HRM Dashboard
              </Link>
              <button onClick={resetForm} className="btn-primary text-sm">
                + Onboard Another Employee
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
