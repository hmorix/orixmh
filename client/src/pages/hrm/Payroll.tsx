import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import SEOHead from "../../components/seo/SEOHead"
import {
  DollarSign,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Printer,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowLeft,
  Building,
  ShieldCheck
} from "lucide-react"
import { config } from "../../lib/config"
import { printPayslip } from "../../lib/hrm-documents"

export default function Payroll() {
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7))
  const [rows, setRows] = useState<any[]>([])
  const [summary, setSummary] = useState<any>({
    totalPayroll: "₹0",
    avgSalary: "₹0",
    totalBenefits: "Included",
    taxWithholding: "12%",
    nextPayDate: "—"
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const loadPayroll = () => {
    setLoading(true)
    fetch(`${config.apiUrl}/hrm/payroll?period=${encodeURIComponent(period)}`, {
      credentials: "include",
      cache: "no-store"
    })
      .then(async response => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || "Unable to load payroll")
        setRows(data.data.rows || [])
        setSummary({
          totalPayroll: `₹${Number(data.data.summary?.totalPayroll || 0).toLocaleString("en-IN")}`,
          avgSalary: `₹${Number(data.data.summary?.avgSalary || 0).toLocaleString("en-IN")}`,
          totalBenefits: "Included",
          taxWithholding: "12%",
          nextPayDate: data.data.summary?.nextPayDate || `${period}-28`
        })
      })
      .catch(err => {
        setRows([])
        setSummary({
          totalPayroll: "₹0",
          avgSalary: "₹0",
          totalBenefits: "Included",
          taxWithholding: "0%",
          nextPayDate: "—"
        })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPayroll()
  }, [period])

  const runPayroll = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const response = await fetch(`${config.apiUrl}/hrm/payroll`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Unable to run payroll")
      setRows(data.data.rows || rows)
      setMessage({ type: "success", text: `Payroll for ${period} has been processed successfully.` })
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Unable to run payroll"
      })
    } finally {
      setLoading(false)
    }
  }

  const exportCsv = () => {
    window.open(`${config.apiUrl}/hrm/payroll/export?period=${encodeURIComponent(period)}`, "_blank")
  }

  const handlePrintSlip = (emp: any) => {
    printPayslip({
      name: emp.name,
      employeeId: emp.employeeId || emp.id || `HM-${Date.now().toString().slice(-4)}`,
      role: emp.role || "Software Engineer",
      department: emp.department || "Engineering",
      period: period,
      baseSalary: Number(emp.baseSalary || 35000),
      bonus: Number(emp.bonus || 0),
      deductions: Number(emp.deductions || 4500),
      net: Number(emp.net || 40000),
      email: emp.email,
      location: emp.location || "Hathras, UP"
    })
  }

  const filteredRows = rows.filter(
    r =>
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.role?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="pt-28 pb-20 min-h-screen bg-obsidian text-cream">
      <SEOHead
        title="Payroll & Compensation Management | Enterprise HRM"
        description="Process employee salaries, calculate tax deductions, issue 1-click payslips, and export financial reports."
        keywords="HRM payroll, salary processing, employee payslips, payroll software, tax withholding, compensation management"
        canonical="/hrm/payroll"
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
            <span className="text-xs px-2.5 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 flex items-center gap-1.5 font-medium">
              <ShieldCheck size={13} /> Statutory Compliance Ready
            </span>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
              Payroll Management
            </h1>
            <p className="text-cream/50 text-sm mt-1">
              Monthly compensation processing &bull; Next pay date:{" "}
              <span className="text-[#C8FF00] font-semibold">{summary.nextPayDate}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="month"
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
            />
            <button
              onClick={exportCsv}
              className="btn-outline text-xs flex items-center gap-1.5 py-2 px-3.5"
            >
              <Download size={13} /> Export CSV
            </button>
            <button
              onClick={runPayroll}
              disabled={loading}
              className="btn-primary text-xs flex items-center gap-1.5 py-2 px-4 disabled:opacity-60"
            >
              <DollarSign size={13} /> {loading ? "Processing..." : "Run Payroll Cycle"}
            </button>
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
            {message.type === "success" ? <CheckCircle2 size={16} className="mt-0.5" /> : <AlertCircle size={16} />}
            <div>{message.text}</div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          {[
            { label: "Total Payroll (Period)", value: summary.totalPayroll, icon: DollarSign, color: "text-[#C8FF00]" },
            { label: "Avg Salary / Emp", value: summary.avgSalary, icon: TrendingUp, color: "text-cream" },
            { label: "Benefits & Perks", value: summary.totalBenefits, icon: ShieldCheck, color: "text-green-400" },
            { label: "Tax / PF Withheld", value: summary.taxWithholding, icon: Calendar, color: "text-blue-400" },
            { label: "Payroll Count", value: `${rows.length} Staff`, icon: Users, color: "text-purple-400" }
          ].map((s, i) => (
            <div key={i} className="p-4 sm:p-5 bg-obsidian-2 border border-glass-border rounded-[14px]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-cream/40">{s.label}</span>
                <s.icon size={15} className={s.color} />
              </div>
              <div className={`font-display text-xl sm:text-2xl font-bold mt-2 ${s.color}`}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Payroll Register Card */}
        <div className="bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden shadow-xl">
          {/* Card Header & Search */}
          <div className="p-4 sm:p-5 border-b border-glass-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display font-semibold text-base">
                Payroll Register &bull; <span className="text-[#C8FF00]">{period}</span>
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[10px] font-bold">
                  {rows.filter(e => e.status === "processed").length} Disbursed
                </span>
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-[10px] font-bold">
                  {rows.filter(e => e.status !== "processed").length} Pending
                </span>
              </div>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search staff, role, dept..."
                className="pl-9 pr-4 py-1.5 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream placeholder:text-cream/30 outline-none focus:border-[#C8FF00] w-full sm:w-64"
              />
            </div>
          </div>

          {/* Desktop Table / Responsive Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-cream/40 text-xs border-b border-glass-border bg-white/[0.02]">
                  <th className="p-4 font-medium">Employee Name</th>
                  <th className="p-4 font-medium hidden md:table-cell">Department</th>
                  <th className="p-4 font-medium">Base Salary</th>
                  <th className="p-4 font-medium hidden sm:table-cell">Allowances</th>
                  <th className="p-4 font-medium hidden sm:table-cell">Deductions</th>
                  <th className="p-4 font-medium">Net Payout</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">1-Click Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/50">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-cream/40">
                      Loading payroll registers...
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-cream/40">
                      No payroll records found for this period. Click &quot;Run Payroll Cycle&quot; to calculate.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((emp: any, index: number) => (
                    <tr
                      key={emp.employeeId || emp.id || index}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#C8FF00] text-obsidian font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {String(emp.name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-cream text-sm">{emp.name}</div>
                            <div className="text-[10px] text-cream/40 font-mono">{emp.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-cream/60 hidden md:table-cell">{emp.department || "Engineering"}</td>
                      <td className="p-4 font-medium">₹{Number(emp.baseSalary || 0).toLocaleString("en-IN")}</td>
                      <td className="p-4 text-green-400 hidden sm:table-cell">
                        +₹{Number(emp.bonus || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-4 text-red-400 hidden sm:table-cell">
                        -₹{Number(emp.deductions || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-4 font-bold text-[#C8FF00]">
                        ₹{Number(emp.net || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            emp.status === "processed"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          }`}
                        >
                          {emp.status || "pending"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handlePrintSlip(emp)}
                          className="btn-outline text-xs px-3 py-1.5 inline-flex items-center gap-1.5 hover:text-[#C8FF00] hover:border-[#C8FF00]/40"
                          title="Generate official salary slip"
                        >
                          <Printer size={12} /> Print Slip
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
