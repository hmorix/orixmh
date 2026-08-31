import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import SEOHead from "../../components/seo/SEOHead"
import {
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  Award,
  Printer,
  Sparkles,
  ArrowRight,
  ClipboardList,
  ShieldCheck,
  Building,
  Target,
  ExternalLink,
  ChevronRight
} from "lucide-react"
import { config } from "../../lib/config"
import {
  printPayslip,
  printJoiningLetter,
  printAppointmentLetter
} from "../../lib/hrm-documents"

const TABS = [
  "Overview",
  "Punch Clock & Attendance",
  "Leave Center",
  "My Payslips",
  "Sprint Tasks",
  "Team Roster",
  "My Documents",
  "LMS & Upskilling"
] as const

type TabType = typeof TABS[number]

function formatTime(value?: string | Date | null) {
  if (!value) return "—"
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function formatDate(value?: string | Date | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
}

export default function EmployeePortal() {
  const [activeTab, setActiveTab] = useState<TabType>("Overview")
  const [data, setData] = useState<any>(null)
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7))
  const [leaveForm, setLeaveForm] = useState({
    type: "Casual Leave",
    dates: "",
    days: "1",
    reason: ""
  })

  const loadDashboard = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const [dashboardRes, attendanceRes] = await Promise.all([
        fetch(`${config.apiUrl}/employee/dashboard`, { credentials: "include", cache: "no-store" }),
        fetch(`${config.apiUrl}/employee/attendance`, { credentials: "include", cache: "no-store" })
      ])
      const dashboardData = await dashboardRes.json().catch(() => ({}))
      const attendanceData = await attendanceRes.json().catch(() => ({}))
      if (!dashboardRes.ok) throw new Error(dashboardData.error || "Unable to load employee profile")
      setData(dashboardData.data || null)
      setAttendanceLogs(attendanceRes.ok ? attendanceData.data || [] : [])
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Unable to load employee portal data"
      })
      setData(null)
      setAttendanceLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const today = data?.todayAttendance || null
  const summary = data?.summary || {}
  const monthlySummary = data?.monthlySummary || {}
  const employee = data?.employee || null
  const tasks = data?.tasks || []
  const leaves = data?.leaves || []
  const trainings = data?.trainings || []
  const team = data?.team || []

  const clockAction = async (action: "clock_in" | "clock_out") => {
    setActionLoading(true)
    setMessage(null)
    try {
      const response = await fetch(`${config.apiUrl}/employee/attendance`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "Unable to record attendance")
      setMessage({
        type: "success",
        text: action === "clock_in" ? "Clock in recorded! Have a productive workday." : "Clock out recorded! Enjoy your evening."
      })
      await loadDashboard()
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Unable to record punch"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const submitLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    setMessage(null)
    try {
      const response = await fetch(`${config.apiUrl}/hrm/leave`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leaveForm,
          employeeId: employee?.employeeId || employee?._id,
          name: employee?.name || "Staff"
        })
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "Unable to submit leave application")
      setMessage({
        type: "success",
        text: "Leave application submitted to HR & Manager for approval."
      })
      setLeaveForm({ type: "Casual Leave", dates: "", days: "1", reason: "" })
      await loadDashboard()
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Unable to submit leave"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handlePrintMyPayslip = () => {
    if (!employee) return
    const salary = Number(employee.salary || 600000)
    const monthlyGross = Math.round(salary / 12)
    const base = Math.round(monthlyGross * 0.5)
    const bonus = 0
    const deductions = Math.round(base * 0.12) + 200 + Math.round(monthlyGross * 0.05)
    const net = monthlyGross - deductions

    printPayslip({
      name: employee.name,
      employeeId: employee.employeeId || "HM-STAFF",
      role: employee.role || "Software Engineer",
      department: employee.department || "Engineering",
      period: period,
      baseSalary: base,
      bonus: bonus,
      deductions: deductions,
      net: net,
      email: employee.email,
      location: employee.location || "Hathras, UP"
    })
  }

  const handlePrintMyAppointment = () => {
    if (!employee) return
    printAppointmentLetter({
      name: employee.name,
      employeeId: employee.employeeId || "HM-STAFF",
      role: employee.role || "Software Engineer",
      department: employee.department || "Engineering",
      joiningDate: employee.startDate || "2026-01-01",
      location: employee.location || "Hathras, UP",
      ctc: Number(employee.salary || 600000)
    })
  }

  const handlePrintMyJoining = () => {
    if (!employee) return
    printJoiningLetter({
      name: employee.name,
      employeeId: employee.employeeId || "HM-STAFF",
      role: employee.role || "Software Engineer",
      department: employee.department || "Engineering",
      joiningDate: employee.startDate || "2026-01-01",
      location: employee.location || "Hathras, UP",
      workEmail: employee.email
    })
  }

  return (
    <div className="pt-28 pb-20 min-h-screen bg-obsidian text-cream">
      <SEOHead
        title="Employee Self-Service (ESS) Portal | HMorix"
        description="Employee self-service dashboard — punch attendance clock, manage leave balance, download official payslips, and track assigned sprint tasks."
        keywords="employee portal, self-service HR, attendance clock, leave request, payslip download, employee tasks"
        canonical="/employee"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Profile & Punch Clock Header Banner */}
        <div className="p-6 sm:p-8 bg-obsidian-2 border border-glass-border rounded-[18px] mb-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C8FF00]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* User Profile Details */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[16px] bg-[#C8FF00] text-obsidian flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-lg">
                {String(employee?.name || "HM").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-cream">
                    {employee?.name || "Team Member"}
                  </h1>
                  <span className="px-2 py-0.5 bg-[#C8FF00]/10 border border-[#C8FF00]/30 rounded-full text-xs font-mono text-[#C8FF00]">
                    {employee?.employeeId || "HM-STAFF"}
                  </span>
                </div>
                <div className="text-xs text-cream/50 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>{employee?.role || "Software Engineer"}</span>
                  <span>&bull;</span>
                  <span>{employee?.department || "Engineering"}</span>
                  <span>&bull;</span>
                  <span>{employee?.location || "Hathras, UP"}</span>
                  <span>&bull;</span>
                  <span className="text-green-400 font-semibold">{employee?.status || "active"}</span>
                </div>
              </div>
            </div>

            {/* Attendance Punch Clock Widget */}
            <div className="p-4 bg-obsidian border border-glass-border rounded-[14px] flex flex-wrap items-center gap-4 shadow-lg">
              <div>
                <div className="text-[10px] text-cream/40 uppercase tracking-wider font-mono">Today&apos;s Status</div>
                <div className="text-sm font-bold text-cream flex items-center gap-2 mt-0.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${today?.clockIn ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
                  {today?.clockIn ? (today?.clockOut ? "Shift Completed" : "Clocked In & Working") : "Not Clocked In"}
                </div>
                <div className="text-[11px] text-cream/50 mt-0.5">
                  In: {formatTime(today?.clockIn)} &bull; Out: {formatTime(today?.clockOut)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!today?.clockIn ? (
                  <button
                    onClick={() => clockAction("clock_in")}
                    disabled={actionLoading}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <Clock size={14} /> Clock In Now
                  </button>
                ) : !today?.clockOut ? (
                  <button
                    onClick={() => clockAction("clock_out")}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 rounded-[8px] text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-60"
                  >
                    <Clock size={14} /> Clock Out (End Shift)
                  </button>
                ) : (
                  <span className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-[8px] text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 size={13} /> Punch Complete
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-[12px] border text-sm flex items-center gap-3 ${
              message.type === "success"
                ? "bg-[#C8FF00]/10 border-[#C8FF00]/30 text-[#C8FF00]"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <div>{message.text}</div>
          </div>
        )}

        {/* Tab Navigation Ribbon */}
        <div className="flex gap-1.5 mb-8 overflow-x-auto pb-1 border-b border-glass-border/60">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2.5 rounded-t-[10px] text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border-t border-x ${
                activeTab === t
                  ? "bg-obsidian-2 border-glass-border text-[#C8FF00] border-b-2 border-b-[#C8FF00]"
                  : "bg-transparent border-transparent text-cream/50 hover:text-cream"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === "Overview" && (
          <div className="space-y-8">
            {/* Quick KPI Stat Ribbons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 bg-obsidian-2 border border-glass-border rounded-[14px]">
                <div className="flex items-center justify-between text-cream/40 text-xs">
                  <span>Present This Month</span>
                  <Clock size={15} className="text-[#C8FF00]" />
                </div>
                <div className="font-display text-2xl font-bold text-[#C8FF00] mt-2">
                  {monthlySummary?.presentDays || 22} Days
                </div>
                <div className="text-[10px] text-cream/30 mt-0.5">On-time rate: 98%</div>
              </div>

              <div className="p-5 bg-obsidian-2 border border-glass-border rounded-[14px]">
                <div className="flex items-center justify-between text-cream/40 text-xs">
                  <span>Available Leave Balance</span>
                  <Calendar size={15} className="text-green-400" />
                </div>
                <div className="font-display text-2xl font-bold text-green-400 mt-2">
                  {summary?.leaveBalance || 18} Days
                </div>
                <div className="text-[10px] text-cream/30 mt-0.5">Casual + Sick + Earned</div>
              </div>

              <div className="p-5 bg-obsidian-2 border border-glass-border rounded-[14px]">
                <div className="flex items-center justify-between text-cream/40 text-xs">
                  <span>Active Sprint Tasks</span>
                  <ClipboardList size={15} className="text-blue-400" />
                </div>
                <div className="font-display text-2xl font-bold text-blue-400 mt-2">
                  {tasks.filter((t: any) => t.status !== "completed").length || 3} Tasks
                </div>
                <div className="text-[10px] text-cream/30 mt-0.5">Assigned by Manager</div>
              </div>

              <div className="p-5 bg-obsidian-2 border border-glass-border rounded-[14px]">
                <div className="flex items-center justify-between text-cream/40 text-xs">
                  <span>Performance Rating</span>
                  <Award size={15} className="text-yellow-400" />
                </div>
                <div className="font-display text-2xl font-bold text-yellow-400 mt-2">
                  {employee?.performanceScore || 4.8}/5.0
                </div>
                <div className="text-[10px] text-cream/30 mt-0.5">Top Tier Rating</div>
              </div>
            </div>

            {/* Quick Action Row */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div
                onClick={() => setActiveTab("Leave Center")}
                className="p-5 bg-obsidian-2 border border-glass-border hover:border-[#C8FF00]/40 rounded-[14px] cursor-pointer transition-all flex items-start gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-[10px] bg-[#C8FF00]/10 text-[#C8FF00] flex items-center justify-center group-hover:bg-[#C8FF00]/20 transition-all flex-shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm text-cream">Apply for Leave / PTO</h3>
                  <p className="text-xs text-cream/50 mt-0.5">Submit time-off request to manager</p>
                </div>
              </div>

              <div
                onClick={() => setActiveTab("My Payslips")}
                className="p-5 bg-obsidian-2 border border-glass-border hover:border-[#C8FF00]/40 rounded-[14px] cursor-pointer transition-all flex items-start gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-[10px] bg-green-500/10 text-green-400 flex items-center justify-center group-hover:bg-green-500/20 transition-all flex-shrink-0">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm text-cream">Download Salary Slip</h3>
                  <p className="text-xs text-cream/50 mt-0.5">1-click official monthly payslip</p>
                </div>
              </div>

              <div
                onClick={() => setActiveTab("Sprint Tasks")}
                className="p-5 bg-obsidian-2 border border-glass-border hover:border-[#C8FF00]/40 rounded-[14px] cursor-pointer transition-all flex items-start gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-[10px] bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-500/20 transition-all flex-shrink-0">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm text-cream">View Sprint Board</h3>
                  <p className="text-xs text-cream/50 mt-0.5">Manage tasks & client deliverables</p>
                </div>
              </div>
            </div>

            {/* Split Row: Tasks & Recent Attendance */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Sprint Tasks Card */}
              <div className="bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden shadow-lg">
                <div className="p-4 sm:p-5 border-b border-glass-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardList size={16} className="text-[#C8FF00]" />
                    <h2 className="font-display font-semibold text-sm">Assigned Sprint Tasks</h2>
                  </div>
                  <button onClick={() => setActiveTab("Sprint Tasks")} className="text-xs text-[#C8FF00] hover:underline">
                    View All
                  </button>
                </div>
                <div className="divide-y divide-glass-border/50">
                  {tasks.length === 0 ? (
                    <div className="p-8 text-center text-cream/40 text-xs">
                      No active tasks currently assigned. You are all caught up!
                    </div>
                  ) : (
                    tasks.slice(0, 4).map((task: any, i: number) => (
                      <div key={task._id || i} className="p-4 flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-sm text-cream">{task.title}</div>
                          <div className="text-xs text-cream/40 mt-0.5">Due: {task.dueDate || "This Sprint"}</div>
                        </div>
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] font-bold capitalize">
                          {task.status || "todo"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Attendance Log Card */}
              <div className="bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden shadow-lg">
                <div className="p-4 sm:p-5 border-b border-glass-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#C8FF00]" />
                    <h2 className="font-display font-semibold text-sm">Recent Punch Activity</h2>
                  </div>
                  <button onClick={() => setActiveTab("Punch Clock & Attendance")} className="text-xs text-[#C8FF00] hover:underline">
                    View History
                  </button>
                </div>
                <div className="divide-y divide-glass-border/50">
                  {attendanceLogs.length === 0 ? (
                    <div className="p-8 text-center text-cream/40 text-xs">
                      No attendance records for this period.
                    </div>
                  ) : (
                    attendanceLogs.slice(0, 4).map((log: any, i: number) => (
                      <div key={log._id || i} className="p-4 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-xs text-cream">{formatDate(log.date || log.clockIn)}</div>
                          <div className="text-[10px] text-cream/40 mt-0.5">
                            In: {formatTime(log.clockIn)} &bull; Out: {formatTime(log.clockOut)}
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[10px] font-bold">
                          Present
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PUNCH CLOCK & ATTENDANCE ================= */}
        {activeTab === "Punch Clock & Attendance" && (
          <div className="bg-obsidian-2 border border-glass-border rounded-[16px] p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-glass-border">
              <div>
                <h2 className="font-display font-semibold text-base">Monthly Attendance Register</h2>
                <p className="text-xs text-cream/50 mt-0.5">Detailed punch log and working hours calculations.</p>
              </div>
              <input
                type="month"
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="px-3 py-1.5 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-cream/40 text-xs border-b border-glass-border bg-white/[0.02]">
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Clock In</th>
                    <th className="p-4 font-medium">Clock Out</th>
                    <th className="p-4 font-medium">Duration</th>
                    <th className="p-4 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/50">
                  {attendanceLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-cream/40">
                        No punch logs found for this period.
                      </td>
                    </tr>
                  ) : (
                    attendanceLogs.map((log: any, idx: number) => (
                      <tr key={log._id || idx} className="hover:bg-white/[0.02]">
                        <td className="p-4 font-medium">{formatDate(log.date || log.clockIn)}</td>
                        <td className="p-4 text-cream/70 font-mono text-xs">{formatTime(log.clockIn)}</td>
                        <td className="p-4 text-cream/70 font-mono text-xs">{formatTime(log.clockOut)}</td>
                        <td className="p-4 font-bold text-[#C8FF00]">{log.totalHours || "8.5"} hrs</td>
                        <td className="p-4 text-right">
                          <span className="px-2.5 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[10px] font-bold">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: LEAVE CENTER ================= */}
        {activeTab === "Leave Center" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <form onSubmit={submitLeave} className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-glass-border">
                <Calendar size={16} className="text-[#C8FF00]" />
                <h3 className="font-display font-semibold text-base">Submit Leave Application</h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-cream/70 font-medium">Leave Category *</label>
                <select
                  value={leaveForm.type}
                  onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                >
                  <option value="Casual Leave">Casual Leave (12/yr)</option>
                  <option value="Sick Leave">Sick Leave (10/yr)</option>
                  <option value="Earned / Annual Leave">Earned / Annual Leave (18/yr)</option>
                  <option value="Maternity / Paternity">Maternity / Paternity Leave</option>
                  <option value="Compensatory Off">Compensatory Off</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-cream/70 font-medium">Dates Requested *</label>
                <input
                  required
                  value={leaveForm.dates}
                  onChange={e => setLeaveForm({ ...leaveForm, dates: e.target.value })}
                  placeholder="e.g. Oct 12, 2026 to Oct 14, 2026"
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-cream/70 font-medium">No. of Days *</label>
                <input
                  type="number"
                  required
                  value={leaveForm.days}
                  onChange={e => setLeaveForm({ ...leaveForm, days: e.target.value })}
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-cream/70 font-medium">Reason for Absence</label>
                <textarea
                  rows={3}
                  required
                  value={leaveForm.reason}
                  onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Brief reason for time off..."
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                />
              </div>

              <button type="submit" disabled={actionLoading} className="w-full btn-primary text-xs py-2.5 mt-2 disabled:opacity-60">
                {actionLoading ? "Submitting..." : "Submit Application &rarr;"}
              </button>
            </form>

            <div className="lg:col-span-2 bg-obsidian-2 border border-glass-border rounded-[16px] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-glass-border">
                <h3 className="font-display font-semibold text-base">My Leave History & Status</h3>
                <span className="text-xs text-cream/50">{leaves.length} Applications</span>
              </div>

              <div className="space-y-3">
                {leaves.length === 0 ? (
                  <div className="p-12 text-center text-cream/40 bg-obsidian rounded-[10px] border border-glass-border">
                    No past leave requests on record.
                  </div>
                ) : (
                  leaves.map((l: any) => (
                    <div key={l._id} className="p-4 bg-obsidian border border-glass-border rounded-[10px] flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-cream">{l.type}</h4>
                          <span className="text-xs text-[#C8FF00] font-bold">({l.days} Days)</span>
                        </div>
                        <div className="text-xs text-cream/50 mt-1">{l.dates}</div>
                        {l.reason && <p className="text-xs text-cream/60 italic mt-1">&ldquo;{l.reason}&rdquo;</p>}
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        l.status === "approved"
                          ? "bg-green-500/20 text-green-400"
                          : l.status === "rejected"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {l.status || "pending"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: MY PAYSLIPS ================= */}
        {activeTab === "My Payslips" && (
          <div className="bg-obsidian-2 border border-glass-border rounded-[16px] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-glass-border">
              <div>
                <h2 className="font-display font-semibold text-base">Monthly Compensation & Payslip Studio</h2>
                <p className="text-xs text-cream/50 mt-0.5">Generate and download official PDF/Print salary statements.</p>
              </div>
              <div className="flex items-center gap-2.5">
                <input
                  type="month"
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                  className="px-3 py-1.5 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                />
                <button
                  onClick={handlePrintMyPayslip}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <Printer size={13} /> Print Official Payslip
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-5 bg-obsidian border border-glass-border rounded-[12px]">
                <div className="text-xs text-cream/40">Gross Monthly CTC</div>
                <div className="font-display text-2xl font-bold text-cream mt-1">
                  ₹{Math.round(Number(employee?.salary || 600000) / 12).toLocaleString("en-IN")}
                </div>
              </div>

              <div className="p-5 bg-obsidian border border-glass-border rounded-[12px]">
                <div className="text-xs text-cream/40">Statutory Deductions (PF/PT/TDS)</div>
                <div className="font-display text-2xl font-bold text-red-400 mt-1">
                  -₹{Math.round((Number(employee?.salary || 600000) / 12) * 0.15).toLocaleString("en-IN")}
                </div>
              </div>

              <div className="p-5 bg-obsidian border border-glass-border rounded-[12px]">
                <div className="text-xs text-cream/40">Net Take-Home Salary</div>
                <div className="font-display text-2xl font-bold text-[#C8FF00] mt-1">
                  ₹{Math.round((Number(employee?.salary || 600000) / 12) * 0.85).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: SPRINT TASKS ================= */}
        {activeTab === "Sprint Tasks" && (
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-base">Assigned Engineering Tasks & Tickets</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {tasks.length === 0 ? (
                <div className="col-span-2 p-12 bg-obsidian-2 border border-glass-border rounded-[14px] text-center text-cream/40">
                  No sprint tasks assigned.
                </div>
              ) : (
                tasks.map((task: any) => (
                  <div key={task._id} className="p-5 bg-obsidian-2 border border-glass-border rounded-[14px] space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-base text-cream">{task.title}</h4>
                        <p className="text-xs text-cream/50 mt-1">{task.description}</p>
                      </div>
                      <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] font-bold uppercase">
                        {task.status || "in_progress"}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-glass-border/50 flex justify-between text-xs text-cream/40">
                      <span>Priority: <strong className="text-yellow-400 uppercase">{task.priority || "normal"}</strong></span>
                      <span>Target: <strong className="text-[#C8FF00]">{task.dueDate || "This Sprint"}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 6: TEAM ROSTER ================= */}
        {activeTab === "Team Roster" && (
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-base">My Department & Pod Roster</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.length === 0 ? (
                <div className="col-span-3 p-12 bg-obsidian-2 border border-glass-border rounded-[14px] text-center text-cream/40">
                  No other team members in roster.
                </div>
              ) : (
                team.map((m: any, i: number) => (
                  <div key={m._id || i} className="p-5 bg-obsidian-2 border border-glass-border rounded-[14px] flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-[#C8FF00] text-obsidian font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {String(m.name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-cream">{m.name}</h4>
                      <p className="text-xs text-cream/50">{m.role}</p>
                      <p className="text-[10px] text-cream/30 font-mono mt-0.5">{m.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 7: MY DOCUMENTS ================= */}
        {activeTab === "My Documents" && (
          <div className="bg-obsidian-2 border border-glass-border rounded-[16px] p-6 shadow-xl space-y-6">
            <div className="pb-4 border-b border-glass-border">
              <h2 className="font-display font-semibold text-base">Official Employment Documentation</h2>
              <p className="text-xs text-cream/50 mt-0.5">1-click reprint of your official onboarding agreements and company certificates.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-5 bg-obsidian border border-glass-border rounded-[14px] space-y-3">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-[#C8FF00]" />
                  <h4 className="font-semibold text-sm text-cream">Appointment Letter</h4>
                </div>
                <p className="text-xs text-cream/50">Formal employment contract & IP agreements.</p>
                <button
                  onClick={handlePrintMyAppointment}
                  className="btn-primary text-xs py-2 px-4 w-full flex items-center justify-center gap-1.5"
                >
                  <Printer size={13} /> View & Print Letter
                </button>
              </div>

              <div className="p-5 bg-obsidian border border-glass-border rounded-[14px] space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-400" />
                  <h4 className="font-semibold text-sm text-cream">Joining & Induction Letter</h4>
                </div>
                <p className="text-xs text-cream/50">Onboarding confirmation & employee credentials.</p>
                <button
                  onClick={handlePrintMyJoining}
                  className="btn-outline text-xs py-2 px-4 w-full flex items-center justify-center gap-1.5"
                >
                  <Printer size={13} /> View & Print Letter
                </button>
              </div>

              <div className="p-5 bg-obsidian border border-glass-border rounded-[14px] space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-blue-400" />
                  <h4 className="font-semibold text-sm text-cream">Company Code of Conduct</h4>
                </div>
                <p className="text-xs text-cream/50">Information security & workplace ethics.</p>
                <a
                  href="/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline text-xs py-2 px-4 w-full flex items-center justify-center gap-1.5"
                >
                  <ExternalLink size={13} /> Read Standards
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 8: LMS & UPSKILLING ================= */}
        {activeTab === "LMS & Upskilling" && (
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-base">Enrolled LMS Training & Upskilling Tracks</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {trainings.length === 0 ? (
                <div className="col-span-2 p-12 bg-obsidian-2 border border-glass-border rounded-[14px] text-center text-cream/40">
                  No active LMS training courses assigned yet.
                </div>
              ) : (
                trainings.map((tr: any) => (
                  <div key={tr._id} className="p-5 bg-obsidian-2 border border-glass-border rounded-[14px] space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-cream">{tr.title}</h4>
                        <p className="text-xs text-cream/50 mt-0.5">Due: {tr.dueDate}</p>
                      </div>
                      <span className="font-mono text-xs text-[#C8FF00] font-bold">{tr.progress || 0}%</span>
                    </div>
                    {tr.description && (
                      <p className="text-xs text-cream/60 line-clamp-2">{tr.description}</p>
                    )}
                    <div className="h-1.5 bg-obsidian rounded-full overflow-hidden">
                      <div className="h-full bg-[#C8FF00] rounded-full" style={{ width: `${tr.progress || 0}%` }} />
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
