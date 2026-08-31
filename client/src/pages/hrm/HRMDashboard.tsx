import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import SEOHead from "../../components/seo/SEOHead"
import {
  Users,
  UserPlus,
  Calendar,
  TrendingUp,
  Briefcase,
  Check,
  X,
  Clock,
  Building2,
  ChevronRight,
  Printer,
  FileText,
  Search,
  Sparkles,
  ShieldCheck,
  Award,
  CreditCard,
  LogOut,
  DollarSign,
  AlertCircle
} from "lucide-react"
import { config } from "../../lib/config"
import {
  printOfferLetter,
  printJoiningLetter,
  printAppointmentLetter,
  printExperienceLetter,
  printRelievingLetter,
  printSalaryCertificate,
  printFnFStatement,
  printNocLetter,
  printEmployeeIdCard,
  printPayslip
} from "../../lib/hrm-documents"

const TABS = [
  "Overview",
  "Staff Directory",
  "Leave Approvals",
  "Exit & Offboarding",
  "Document Studio",
  "Departments"
] as const

type Tab = typeof TABS[number]

export default function HRMDashboard() {
  const [tab, setTab] = useState<Tab>("Overview")
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    openPositions: 0,
    departments: 0,
    newHires: 0
  })
  const [employees, setEmployees] = useState<any[]>([])
  const [leaves, setLeaves] = useState<any[]>([])
  const [overview, setOverview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Offboarding / Exit State
  const [selectedExitEmp, setSelectedExitEmp] = useState<any>(null)
  const [exitForm, setExitForm] = useState({
    relievingDate: new Date().toISOString().slice(0, 10),
    reason: "Career growth / Resignation",
    leaveEncashmentDays: "8",
    leaveEncashmentAmount: "12000",
    gratuityAmount: "25000",
    pendingBonus: "5000",
    noticeAdjustment: "0",
    otherDeductions: "3500",
    itClearance: true,
    financeClearance: true,
    hrClearance: true
  })

  // Document Studio Form State
  const [docType, setDocType] = useState<
    "offer" | "joining" | "appointment" | "salary_cert" | "experience" | "relieving" | "fnf" | "noc" | "id_card" | "payslip"
  >("offer")

  const [docForm, setDocForm] = useState({
    name: "Rahul Verma",
    employeeId: "HM-24901",
    role: "Senior Fullstack Engineer",
    department: "Engineering",
    location: "Hathras, UP",
    email: "rahul.verma@hmorix.com",
    ctc: "850000",
    joiningDate: "2025-06-15",
    relievingDate: new Date().toISOString().slice(0, 10),
    bloodGroup: "O+ (Pos)",
    emergencyPhone: "+91 98765 43210",
    period: new Date().toISOString().slice(0, 7),
    baseSalary: "45000",
    bonus: "5000",
    deductions: "4800",
    net: "45200",
    monthlyGross: "70833",
    annualCtc: "850000",
    leaveEncashmentDays: "8",
    leaveEncashmentAmount: "12000",
    gratuityAmount: "25000",
    pendingBonus: "5000",
    noticePayAdjustment: "0",
    otherDeductions: "3500",
    purpose: "Official verification for loan / visa application"
  })

  useEffect(() => {
    Promise.all([
      fetch(`${config.apiUrl}/hrm/stats`, { credentials: "include", cache: "no-store" }).then(r => r.json()).catch(() => ({})),
      fetch(`${config.apiUrl}/hrm/employees`, { credentials: "include", cache: "no-store" }).then(r => r.json()).catch(() => ({})),
      fetch(`${config.apiUrl}/hrm/leave`, { credentials: "include", cache: "no-store" }).then(r => r.json()).catch(() => ({})),
      fetch(`${config.apiUrl}/hrm/overview`, { credentials: "include", cache: "no-store" }).then(r => r.json()).catch(() => ({}))
    ]).then(([s, e, l, o]) => {
      if (s?.data) setStats(s.data)
      if (e?.data) setEmployees(e.data)
      if (l?.data) setLeaves(l.data)
      if (o?.data) setOverview(o.data)
      setLoading(false)
    })
  }, [])

  const decide = async (id: string, status: "approved" | "rejected") => {
    const r = await fetch(`${config.apiUrl}/hrm/leave`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) {
      setMsg({ type: "error", text: d.error || "Unable to update leave" })
      return
    }
    setMsg({ type: "success", text: `Leave request ${status} successfully.` })
    setLeaves(prev => prev.map(l => (String(l._id) === id ? { ...l, status } : l)))
    setTimeout(() => setMsg(null), 3000)
  }

  const pendingLeaves = leaves.filter(l => l.status === "pending")
  const departmentsList = overview?.departments || []

  const handleGenerateDoc = (e: React.FormEvent) => {
    e.preventDefault()
    if (docType === "offer") {
      printOfferLetter({
        name: docForm.name,
        email: docForm.email,
        role: docForm.role,
        department: docForm.department,
        ctc: Number(docForm.ctc || 800000),
        joiningDate: docForm.joiningDate,
        location: docForm.location
      })
    } else if (docType === "joining") {
      printJoiningLetter({
        name: docForm.name,
        employeeId: docForm.employeeId,
        role: docForm.role,
        department: docForm.department,
        joiningDate: docForm.joiningDate,
        location: docForm.location,
        workEmail: docForm.email
      })
    } else if (docType === "appointment") {
      printAppointmentLetter({
        name: docForm.name,
        employeeId: docForm.employeeId,
        role: docForm.role,
        department: docForm.department,
        joiningDate: docForm.joiningDate,
        location: docForm.location,
        ctc: Number(docForm.ctc || 800000)
      })
    } else if (docType === "salary_cert") {
      printSalaryCertificate({
        name: docForm.name,
        employeeId: docForm.employeeId,
        role: docForm.role,
        department: docForm.department,
        joiningDate: docForm.joiningDate,
        monthlyGross: Number(docForm.monthlyGross || 65000),
        annualCtc: Number(docForm.annualCtc || 780000),
        purpose: docForm.purpose
      })
    } else if (docType === "experience") {
      printExperienceLetter({
        name: docForm.name,
        employeeId: docForm.employeeId,
        role: docForm.role,
        department: docForm.department,
        joiningDate: docForm.joiningDate,
        relievingDate: docForm.relievingDate
      })
    } else if (docType === "relieving") {
      printRelievingLetter({
        name: docForm.name,
        employeeId: docForm.employeeId,
        role: docForm.role,
        department: docForm.department,
        joiningDate: docForm.joiningDate,
        relievingDate: docForm.relievingDate,
        reason: docForm.purpose
      })
    } else if (docType === "fnf") {
      printFnFStatement({
        name: docForm.name,
        employeeId: docForm.employeeId,
        role: docForm.role,
        department: docForm.department,
        joiningDate: docForm.joiningDate,
        relievingDate: docForm.relievingDate,
        monthlySalary: Number(docForm.baseSalary || 45000),
        leaveEncashmentDays: Number(docForm.leaveEncashmentDays || 8),
        leaveEncashmentAmount: Number(docForm.leaveEncashmentAmount || 12000),
        gratuityAmount: Number(docForm.gratuityAmount || 25000),
        pendingBonus: Number(docForm.pendingBonus || 5000),
        noticePayAdjustment: Number(docForm.noticePayAdjustment || 0),
        otherDeductions: Number(docForm.otherDeductions || 3500),
        netPayable: Number(docForm.net || 78500)
      })
    } else if (docType === "noc") {
      printNocLetter({
        name: docForm.name,
        employeeId: docForm.employeeId,
        role: docForm.role,
        department: docForm.department,
        joiningDate: docForm.joiningDate,
        purpose: docForm.purpose
      })
    } else if (docType === "id_card") {
      printEmployeeIdCard({
        name: docForm.name,
        employeeId: docForm.employeeId,
        role: docForm.role,
        department: docForm.department,
        bloodGroup: docForm.bloodGroup,
        emergencyPhone: docForm.emergencyPhone,
        joiningDate: docForm.joiningDate
      })
    } else if (docType === "payslip") {
      printPayslip({
        name: docForm.name,
        employeeId: docForm.employeeId,
        role: docForm.role,
        department: docForm.department,
        period: docForm.period,
        baseSalary: Number(docForm.baseSalary || 45000),
        bonus: Number(docForm.bonus || 0),
        deductions: Number(docForm.deductions || 4800),
        net: Number(docForm.net || 45200),
        email: docForm.email,
        location: docForm.location
      })
    }
  }

  const selectEmployeeForDoc = (emp: any) => {
    const monthlyGross = Math.round((emp.salary || 600000) / 12)
    const base = Math.round(monthlyGross * 0.5)
    setDocForm({
      name: emp.name || "",
      employeeId: emp.employeeId || emp.id || `HM-${Date.now().toString().slice(-4)}`,
      role: emp.role || "Software Engineer",
      department: emp.department || "Engineering",
      location: emp.location || "Hathras, UP",
      email: emp.email || "",
      ctc: String(emp.salary || 750000),
      joiningDate: emp.startDate || "2025-06-15",
      relievingDate: new Date().toISOString().slice(0, 10),
      bloodGroup: "O+ (Pos)",
      emergencyPhone: "+91 98765 43210",
      period: new Date().toISOString().slice(0, 7),
      baseSalary: String(base),
      bonus: "0",
      deductions: "4500",
      net: String(Math.round(monthlyGross * 0.85)),
      monthlyGross: String(monthlyGross),
      annualCtc: String(emp.salary || 750000),
      leaveEncashmentDays: "8",
      leaveEncashmentAmount: String(Math.round(base * 0.25)),
      gratuityAmount: "25000",
      pendingBonus: "5000",
      noticePayAdjustment: "0",
      otherDeductions: "3500",
      purpose: "Official employment and salary verification"
    })
    setTab("Document Studio")
  }

  const selectEmployeeForExit = (emp: any) => {
    setSelectedExitEmp(emp)
    const monthlyGross = Math.round((emp.salary || 600000) / 12)
    const base = Math.round(monthlyGross * 0.5)
    setExitForm({
      relievingDate: new Date().toISOString().slice(0, 10),
      reason: "Career growth / Resignation",
      leaveEncashmentDays: "8",
      leaveEncashmentAmount: String(Math.round(base * 0.25)),
      gratuityAmount: "25000",
      pendingBonus: "5000",
      noticeAdjustment: "0",
      otherDeductions: "3500",
      itClearance: true,
      financeClearance: true,
      hrClearance: true
    })
    setTab("Exit & Offboarding")
  }

  const filteredEmployees = employees.filter(
    e =>
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const STAT_CARDS = [
    { label: "Total Headcount", value: stats.totalEmployees, icon: Users, color: "#C8FF00" },
    { label: "Present Today", value: stats.presentToday, icon: Check, color: "#4ade80" },
    { label: "On Leave", value: stats.onLeave, icon: Calendar, color: "#facc15" },
    { label: "Open Positions", value: stats.openPositions, icon: Briefcase, color: "#60a5fa" },
    { label: "Departments", value: stats.departments, icon: Building2, color: "#c084fc" },
    { label: "New Hires (Month)", value: stats.newHires, icon: UserPlus, color: "#fb923c" }
  ]

  return (
    <div className="pt-28 pb-20 min-h-screen bg-obsidian text-cream">
      <SEOHead
        title="Enterprise HRM & Offboarding Suite | HMorix"
        description="Comprehensive HR suite — onboarding, ATS recruitment, payroll, 1-click legal documents, employee separation & exit clearance."
        keywords="enterprise HRM, exit clearance, relieving letter, experience certificate, salary verification, FnF settlement"
        canonical="/hrm"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Top Header Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-full text-xs font-semibold text-[#C8FF00] mb-2">
              <Sparkles size={12} /> HMorix Enterprise HRM & Lifecycle Suite
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
              Human Resource Management & Operations
            </h1>
            <p className="text-cream/50 text-sm mt-1">
              Onboarding &bull; ATS Hiring &bull; Time/Attendance &bull; Payroll &bull; Offboarding & Exit Letters &bull; Document Studio
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/hrm/employees/new"
              className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3.5"
            >
              <UserPlus size={13} /> + Onboard Staff
            </Link>
            <Link
              to="/hrm/recruitment"
              className="btn-outline text-xs flex items-center gap-1.5 py-2 px-3.5"
            >
              <Briefcase size={13} /> ATS Hiring
            </Link>
            <Link
              to="/hrm/payroll"
              className="btn-outline text-xs flex items-center gap-1.5 py-2 px-3.5"
            >
              <TrendingUp size={13} /> Payroll Desk
            </Link>
            <Link
              to="/hrm/leaves"
              className="btn-outline text-xs flex items-center gap-1.5 py-2 px-3.5"
            >
              <Calendar size={13} /> Leaves
            </Link>
          </div>
        </div>

        {/* Message Banner */}
        {msg && (
          <div
            className={`mb-6 p-4 rounded-[12px] border text-sm flex items-center gap-2 ${
              msg.type === "success"
                ? "bg-[#C8FF00]/10 border-[#C8FF00]/30 text-[#C8FF00]"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {msg.type === "success" ? <Check size={16} /> : <X size={16} />}
            <div>{msg.text}</div>
          </div>
        )}

        {/* Top KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          {STAT_CARDS.map(s => (
            <div
              key={s.label}
              className="p-4 bg-obsidian-2 border border-glass-border rounded-[14px] hover:border-glass-border/80 transition-all"
            >
              <div className="flex items-center justify-between">
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <div
                className="font-display text-2xl sm:text-3xl font-bold mt-2"
                style={{ color: s.color }}
              >
                {loading ? "—" : s.value}
              </div>
              <div className="text-[11px] text-cream/40 mt-1 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex gap-1.5 mb-8 overflow-x-auto pb-1 border-b border-glass-border/60">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 rounded-t-[10px] text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border-t border-x ${
                tab === t
                  ? "bg-obsidian-2 border-glass-border text-[#C8FF00] border-b-2 border-b-[#C8FF00]"
                  : "bg-transparent border-transparent text-cream/50 hover:text-cream"
              }`}
            >
              {t === "Exit & Offboarding" && <LogOut size={13} className="text-red-400" />}
              {t === "Document Studio" && <Printer size={13} className="text-[#C8FF00]" />}
              {t}
              {t === "Leave Approvals" && pendingLeaves.length > 0 && (
                <span className="px-1.5 py-0.2 bg-yellow-500 text-obsidian text-[10px] font-bold rounded-full">
                  {pendingLeaves.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {tab === "Overview" && (
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "Onboard New Employee",
                  desc: "Generate ID, credentials & appointment letter",
                  to: "/hrm/employees/new",
                  icon: UserPlus
                },
                {
                  title: "Exit & Offboarding Desk",
                  desc: "Issue Experience, Relieving & FnF letters",
                  to: "#exit",
                  onClick: () => setTab("Exit & Offboarding"),
                  icon: LogOut
                },
                {
                  title: "1-Click Document Studio",
                  desc: "10+ official corporate legal documents",
                  to: "#docs",
                  onClick: () => setTab("Document Studio"),
                  icon: Printer
                },
                {
                  title: "Run Monthly Payroll",
                  desc: "Compute statutory taxes & print payslips",
                  to: "/hrm/payroll",
                  icon: TrendingUp
                }
              ].map(action => (
                <div
                  key={action.title}
                  onClick={action.onClick ? action.onClick : undefined}
                  className="p-5 bg-obsidian-2 border border-glass-border hover:border-[#C8FF00]/40 rounded-[14px] transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="w-10 h-10 rounded-[10px] bg-[#C8FF00]/10 text-[#C8FF00] flex items-center justify-center group-hover:bg-[#C8FF00]/20 transition-all mb-3">
                      <action.icon size={20} />
                    </div>
                    <h3 className="font-display font-semibold text-base text-cream">{action.title}</h3>
                    <p className="text-xs text-cream/50 mt-1">{action.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-glass-border/50 flex items-center justify-between text-xs font-semibold text-[#C8FF00]">
                    <span>Launch &rarr;</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Split Row: Pending Leaves & Recent Staff */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pending Leaves Box */}
              <div className="bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden shadow-lg">
                <div className="p-4 sm:p-5 border-b border-glass-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#C8FF00]" />
                    <h2 className="font-display font-semibold text-sm">Pending Leave Requests</h2>
                  </div>
                  <button onClick={() => setTab("Leave Approvals")} className="text-xs text-[#C8FF00] hover:underline">
                    View All ({leaves.length})
                  </button>
                </div>
                <div className="divide-y divide-glass-border/50">
                  {pendingLeaves.length === 0 ? (
                    <div className="p-8 text-center text-cream/40 text-xs">No pending leave applications.</div>
                  ) : (
                    pendingLeaves.slice(0, 4).map(l => (
                      <div key={l._id} className="p-4 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-medium text-xs text-cream">{l.name}</div>
                          <div className="text-[10px] text-cream/40 mt-0.5">
                            {l.type} &bull; {l.dates} &bull; {l.days} day(s)
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => decide(String(l._id), "approved")}
                            className="px-2.5 py-1 bg-green-500/20 text-green-400 rounded-[6px] text-[10px] font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => decide(String(l._id), "rejected")}
                            className="px-2.5 py-1 bg-red-500/10 text-red-400 rounded-[6px] text-[10px] font-bold"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Staff Box */}
              <div className="bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden shadow-lg">
                <div className="p-4 sm:p-5 border-b border-glass-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-[#C8FF00]" />
                    <h2 className="font-display font-semibold text-sm">Employee Actions Directory</h2>
                  </div>
                  <Link to="/hrm/employees/new" className="text-xs text-[#C8FF00] hover:underline">
                    + Onboard
                  </Link>
                </div>
                <div className="divide-y divide-glass-border/50">
                  {employees.slice(0, 5).map((emp: any, i) => (
                    <div key={emp._id || i} className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-xs text-cream">{emp.name}</div>
                        <div className="text-[10px] text-cream/40">{emp.role} &bull; {emp.department}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => selectEmployeeForDoc(emp)}
                          className="px-2.5 py-1 bg-white/[0.04] border border-glass-border rounded-[6px] text-[10px] text-cream/80 hover:text-[#C8FF00]"
                        >
                          Docs
                        </button>
                        <button
                          onClick={() => selectEmployeeForExit(emp)}
                          className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-[6px] text-[10px]"
                        >
                          Exit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: STAFF DIRECTORY ================= */}
        {tab === "Staff Directory" && (
          <div className="bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-glass-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="font-display font-semibold text-base">Employee Directory</h2>
                <span className="text-xs px-2.5 py-0.5 bg-white/[0.04] text-cream/60 rounded-full border border-glass-border">
                  {filteredEmployees.length} Total Staff
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" />
                  <input
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search staff, role, dept..."
                    className="pl-9 pr-4 py-1.5 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream placeholder:text-cream/30 outline-none focus:border-[#C8FF00] w-full sm:w-64"
                  />
                </div>
                <Link to="/hrm/employees/new" className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap">
                  + Onboard Staff
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-cream/40 text-xs border-b border-glass-border bg-white/[0.02]">
                    <th className="p-4 font-medium">Employee</th>
                    <th className="p-4 font-medium">Role & Department</th>
                    <th className="p-4 font-medium hidden sm:table-cell">Salary CTC</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Lifecycle Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/50">
                  {filteredEmployees.map((emp: any, i) => (
                    <tr key={emp._id || i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#C8FF00] text-obsidian font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {String(emp.name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-cream text-sm">{emp.name}</div>
                            <div className="text-[10px] text-cream/40 font-mono">{emp.employeeId || "HM-STAFF"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-cream font-medium">{emp.role}</div>
                        <div className="text-[10px] text-cream/40">{emp.department}</div>
                      </td>
                      <td className="p-4 text-xs font-mono font-bold text-[#C8FF00] hidden sm:table-cell">
                        ₹{Number(emp.salary || 600000).toLocaleString("en-IN")}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          emp.status === "active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => selectEmployeeForDoc(emp)}
                            className="btn-outline text-xs px-2.5 py-1 inline-flex items-center gap-1"
                          >
                            <Printer size={11} /> Issue Docs
                          </button>
                          <button
                            onClick={() => selectEmployeeForExit(emp)}
                            className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-[6px] text-xs font-medium inline-flex items-center gap-1"
                          >
                            <LogOut size={11} /> Exit Desk
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: LEAVE APPROVALS ================= */}
        {tab === "Leave Approvals" && (
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-base">Leave & Time-Off Approvals</h2>
            {leaves.length === 0 ? (
              <div className="p-12 bg-obsidian-2 border border-glass-border rounded-[14px] text-center text-cream/40">
                No leave requests on record.
              </div>
            ) : (
              leaves.map(l => (
                <div key={l._id} className="p-5 bg-obsidian-2 border border-glass-border rounded-[14px] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-sm text-cream">{l.name}</div>
                    <div className="text-xs text-cream/50 mt-0.5">{l.type} &bull; {l.dates} &bull; {l.days} day(s)</div>
                    {l.reason && <p className="text-xs text-cream/60 italic mt-1">&ldquo;{l.reason}&rdquo;</p>}
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      l.status === "approved" ? "bg-green-500/20 text-green-400" : l.status === "rejected" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
                    }`}>{l.status}</span>
                    {l.status === "pending" && (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => decide(String(l._id), "approved")} className="px-2.5 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">Approve</button>
                        <button onClick={() => decide(String(l._id), "rejected")} className="px-2.5 py-1 bg-red-500/10 text-red-400 rounded text-xs font-bold">Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================= TAB 4: EXIT & OFFBOARDING DESK ================= */}
        {tab === "Exit & Offboarding" && (
          <div className="p-6 sm:p-8 bg-obsidian-2 border border-red-500/20 rounded-[18px] shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-glass-border">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-xs font-semibold text-red-400 mb-2">
                  <LogOut size={12} /> Formal Exit Clearance & Settlement Desk
                </div>
                <h2 className="font-display text-xl font-bold text-cream">
                  Employee Separation & FnF Settlement
                </h2>
                <p className="text-xs text-cream/50 mt-0.5">
                  Process employee resignations, calculate Full & Final (FnF) statements, and generate Experience & Relieving Certificates in 1-click.
                </p>
              </div>

              {/* Staff Selector */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedExitEmp?._id || ""}
                  onChange={e => {
                    const found = employees.find(emp => String(emp._id) === e.target.value)
                    if (found) selectEmployeeForExit(found)
                  }}
                  className="px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-red-500"
                >
                  <option value="">Select separating staff</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId || "Staff"})</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedExitEmp ? (
              <div className="space-y-6">
                {/* Employee Exit Summary Banner */}
                <div className="p-5 bg-obsidian border border-glass-border rounded-[14px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {String(selectedExitEmp.name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-base text-cream">{selectedExitEmp.name}</h3>
                      <p className="text-xs text-cream/50">
                        {selectedExitEmp.employeeId || "HM-STAFF"} &bull; {selectedExitEmp.role} ({selectedExitEmp.department})
                      </p>
                      <p className="text-[11px] text-[#C8FF00] font-mono mt-0.5">
                        CTC: ₹{Number(selectedExitEmp.salary || 600000).toLocaleString("en-IN")} &bull; Joined: {selectedExitEmp.startDate || "2025-06-15"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        printRelievingLetter({
                          name: selectedExitEmp.name,
                          employeeId: selectedExitEmp.employeeId || "HM-STAFF",
                          role: selectedExitEmp.role,
                          department: selectedExitEmp.department,
                          joiningDate: selectedExitEmp.startDate || "2025-06-15",
                          relievingDate: exitForm.relievingDate,
                          reason: exitForm.reason
                        })
                      }
                      className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
                    >
                      <Printer size={13} /> 1-Click Relieving Letter
                    </button>
                    <button
                      onClick={() =>
                        printExperienceLetter({
                          name: selectedExitEmp.name,
                          employeeId: selectedExitEmp.employeeId || "HM-STAFF",
                          role: selectedExitEmp.role,
                          department: selectedExitEmp.department,
                          joiningDate: selectedExitEmp.startDate || "2025-06-15",
                          relievingDate: exitForm.relievingDate
                        })
                      }
                      className="btn-outline text-xs py-2 px-3.5 flex items-center gap-1.5"
                    >
                      <Award size={13} /> 1-Click Experience Certificate
                    </button>
                  </div>
                </div>

                {/* Exit Clearance & FnF Calculation Grid */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* FnF Parameters Form */}
                  <div className="p-6 bg-obsidian border border-glass-border rounded-[14px] space-y-4">
                    <h4 className="font-display font-semibold text-sm text-cream flex items-center gap-2">
                      <DollarSign size={16} className="text-[#C8FF00]" /> FnF Settlement Ledger
                    </h4>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-cream/70 font-medium">Relieving / Last Working Day</label>
                        <input
                          type="date"
                          value={exitForm.relievingDate}
                          onChange={e => setExitForm({ ...exitForm, relievingDate: e.target.value })}
                          className="w-full px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-cream/70 font-medium">Leave Encashment Days</label>
                        <input
                          type="number"
                          value={exitForm.leaveEncashmentDays}
                          onChange={e => setExitForm({ ...exitForm, leaveEncashmentDays: e.target.value })}
                          className="w-full px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-cream/70 font-medium">Leave Encashment Amount (₹)</label>
                        <input
                          type="number"
                          value={exitForm.leaveEncashmentAmount}
                          onChange={e => setExitForm({ ...exitForm, leaveEncashmentAmount: e.target.value })}
                          className="w-full px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-cream/70 font-medium">Gratuity Settlement (₹)</label>
                        <input
                          type="number"
                          value={exitForm.gratuityAmount}
                          onChange={e => setExitForm({ ...exitForm, gratuityAmount: e.target.value })}
                          className="w-full px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-cream/70 font-medium">Pending Incentives / Bonus (₹)</label>
                        <input
                          type="number"
                          value={exitForm.pendingBonus}
                          onChange={e => setExitForm({ ...exitForm, pendingBonus: e.target.value })}
                          className="w-full px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-cream/70 font-medium">Statutory Tax / Deductions (₹)</label>
                        <input
                          type="number"
                          value={exitForm.otherDeductions}
                          onChange={e => setExitForm({ ...exitForm, otherDeductions: e.target.value })}
                          className="w-full px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-glass-border flex justify-end">
                      <button
                        onClick={() => {
                          const base = Math.round((Number(selectedExitEmp.salary || 600000) / 12) * 0.5)
                          const totalGross = base + Number(exitForm.leaveEncashmentAmount) + Number(exitForm.gratuityAmount) + Number(exitForm.pendingBonus)
                          const net = totalGross - Number(exitForm.otherDeductions)
                          printFnFStatement({
                            name: selectedExitEmp.name,
                            employeeId: selectedExitEmp.employeeId || "HM-STAFF",
                            role: selectedExitEmp.role,
                            department: selectedExitEmp.department,
                            joiningDate: selectedExitEmp.startDate || "2025-06-15",
                            relievingDate: exitForm.relievingDate,
                            monthlySalary: base,
                            leaveEncashmentDays: Number(exitForm.leaveEncashmentDays),
                            leaveEncashmentAmount: Number(exitForm.leaveEncashmentAmount),
                            gratuityAmount: Number(exitForm.gratuityAmount),
                            pendingBonus: Number(exitForm.pendingBonus),
                            noticePayAdjustment: Number(exitForm.noticeAdjustment),
                            otherDeductions: Number(exitForm.otherDeductions),
                            netPayable: net
                          })
                        }}
                        className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                      >
                        <Printer size={13} /> Print Official FnF Statement
                      </button>
                    </div>
                  </div>

                  {/* 1-Click Separation Document Suite */}
                  <div className="p-6 bg-obsidian border border-glass-border rounded-[14px] space-y-3.5">
                    <h4 className="font-display font-semibold text-sm text-cream flex items-center gap-2">
                      <ShieldCheck size={16} className="text-[#C8FF00]" /> 1-Click Exit Document Suite
                    </h4>

                    <div className="space-y-2.5">
                      <div className="p-3 bg-obsidian-2 border border-glass-border rounded-[8px] flex items-center justify-between">
                        <div>
                          <div className="font-medium text-xs text-cream">Salary & Income Certificate</div>
                          <div className="text-[10px] text-cream/40">Proof of earnings for new employer / loan verification</div>
                        </div>
                        <button
                          onClick={() => {
                            const monthlyGross = Math.round((selectedExitEmp.salary || 600000) / 12)
                            printSalaryCertificate({
                              name: selectedExitEmp.name,
                              employeeId: selectedExitEmp.employeeId || "HM-STAFF",
                              role: selectedExitEmp.role,
                              department: selectedExitEmp.department,
                              joiningDate: selectedExitEmp.startDate || "2025-06-15",
                              monthlyGross: monthlyGross,
                              annualCtc: Number(selectedExitEmp.salary || 600000)
                            })
                          }}
                          className="btn-outline text-xs py-1.5 px-3"
                        >
                          Print Cert
                        </button>
                      </div>

                      <div className="p-3 bg-obsidian-2 border border-glass-border rounded-[8px] flex items-center justify-between">
                        <div>
                          <div className="font-medium text-xs text-cream">No Objection Certificate (NOC)</div>
                          <div className="text-[10px] text-cream/40">Official clearance for passport, higher studies, or transition</div>
                        </div>
                        <button
                          onClick={() =>
                            printNocLetter({
                              name: selectedExitEmp.name,
                              employeeId: selectedExitEmp.employeeId || "HM-STAFF",
                              role: selectedExitEmp.role,
                              department: selectedExitEmp.department,
                              joiningDate: selectedExitEmp.startDate || "2025-06-15"
                            })
                          }
                          className="btn-outline text-xs py-1.5 px-3"
                        >
                          Print NOC
                        </button>
                      </div>

                      <div className="p-3 bg-obsidian-2 border border-glass-border rounded-[8px] flex items-center justify-between">
                        <div>
                          <div className="font-medium text-xs text-cream">Corporate ID Card / RFID Badge</div>
                          <div className="text-[10px] text-cream/40">Printable corporate badge with blood group & emergency contacts</div>
                        </div>
                        <button
                          onClick={() =>
                            printEmployeeIdCard({
                              name: selectedExitEmp.name,
                              employeeId: selectedExitEmp.employeeId || "HM-STAFF",
                              role: selectedExitEmp.role,
                              department: selectedExitEmp.department,
                              joiningDate: selectedExitEmp.startDate || "2025-06-15"
                            })
                          }
                          className="btn-outline text-xs py-1.5 px-3"
                        >
                          Print Badge
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-cream/40 bg-obsidian rounded-[12px] border border-glass-border">
                Please select an employee from the dropdown above to initiate exit clearance and print offboarding documents.
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: 1-CLICK DOCUMENT STUDIO ================= */}
        {tab === "Document Studio" && (
          <div className="p-6 sm:p-8 bg-obsidian-2 border border-[#C8FF00]/30 rounded-[18px] shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-glass-border mb-6">
              <div>
                <span className="px-2.5 py-1 bg-[#C8FF00]/10 border border-[#C8FF00]/30 rounded-full text-xs font-semibold text-[#C8FF00]">
                  Complete 10-Document Corporate HR Suite
                </span>
                <h2 className="font-display text-xl font-bold mt-2">
                  Instant Legal Document Generator
                </h2>
                <p className="text-xs text-cream/50 mt-0.5">
                  Generate, preview, and print official letters formatted with company letterhead, CIN, and authorized signatures.
                </p>
              </div>
            </div>

            {/* Document Selector Grid (10 Doc Types) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-8">
              {[
                { id: "offer", label: "Offer Letter", icon: FileText },
                { id: "joining", label: "Joining Letter", icon: Check },
                { id: "appointment", label: "Appointment Letter", icon: Award },
                { id: "salary_cert", label: "Salary Certificate", icon: DollarSign },
                { id: "id_card", label: "Digital ID Card", icon: CreditCard },
                { id: "experience", label: "Experience Cert", icon: ShieldCheck },
                { id: "relieving", label: "Relieving Letter", icon: LogOut },
                { id: "fnf", label: "FnF Statement", icon: DollarSign },
                { id: "noc", label: "NOC Letter", icon: FileText },
                { id: "payslip", label: "Monthly Payslip", icon: TrendingUp }
              ].map(dt => (
                <button
                  type="button"
                  key={dt.id}
                  onClick={() => setDocType(dt.id as any)}
                  className={`p-3 rounded-[10px] text-xs font-semibold flex flex-col items-center gap-1.5 transition-all border ${
                    docType === dt.id
                      ? "bg-[#C8FF00] text-obsidian border-[#C8FF00] font-bold shadow-[0_0_15px_rgba(200,255,0,0.3)]"
                      : "bg-obsidian border-glass-border text-cream/60 hover:text-cream"
                  }`}
                >
                  <dt.icon size={16} />
                  <span>{dt.label}</span>
                </button>
              ))}
            </div>

            {/* Document Form */}
            <form onSubmit={handleGenerateDoc} className="space-y-4 bg-obsidian p-6 rounded-[14px] border border-glass-border">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Candidate / Employee Name *</label>
                  <input
                    required
                    value={docForm.name}
                    onChange={e => setDocForm({ ...docForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Employee ID</label>
                  <input
                    value={docForm.employeeId}
                    onChange={e => setDocForm({ ...docForm, employeeId: e.target.value })}
                    className="w-full px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Designation / Role *</label>
                  <input
                    required
                    value={docForm.role}
                    onChange={e => setDocForm({ ...docForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Department</label>
                  <input
                    value={docForm.department}
                    onChange={e => setDocForm({ ...docForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Work Location</label>
                  <input
                    value={docForm.location}
                    onChange={e => setDocForm({ ...docForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Work / Contact Email</label>
                  <input
                    type="email"
                    value={docForm.email}
                    onChange={e => setDocForm({ ...docForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Annual CTC (₹ INR)</label>
                  <input
                    type="number"
                    value={docForm.ctc}
                    onChange={e => setDocForm({ ...docForm, ctc: e.target.value, annualCtc: e.target.value })}
                    className="w-full px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Date of Joining</label>
                  <input
                    type="date"
                    value={docForm.joiningDate}
                    onChange={e => setDocForm({ ...docForm, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Relieving / Effective Date</label>
                  <input
                    type="date"
                    value={docForm.relievingDate}
                    onChange={e => setDocForm({ ...docForm, relievingDate: e.target.value })}
                    className="w-full px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-glass-border">
                <button type="submit" className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2">
                  <Printer size={14} /> Generate & Print {docType.toUpperCase()}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 6: DEPARTMENTS ================= */}
        {tab === "Departments" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentsList.map((d: any, i: number) => (
              <div key={i} className="p-5 bg-obsidian-2 border border-glass-border rounded-[14px] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[#C8FF00]/10 flex items-center justify-center text-[#C8FF00]">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-base text-cream">{d.name}</h3>
                    <p className="text-[11px] text-cream/40">{d.head || "Department Head"}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-cream/50">Staff Allocated:</span>
                  <span className="font-bold text-[#C8FF00]">{d.count || 0} Members</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
