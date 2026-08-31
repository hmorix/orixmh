import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import SEOHead from "../../components/seo/SEOHead"
import {
  Search,
  Download,
  Filter,
  RefreshCw,
  ArrowLeft,
  Activity,
  Shield,
  Plus,
  Check,
  AlertCircle,
  FileText
} from "lucide-react"
import { config } from "../../lib/config"

type LogEntry = {
  id: string
  time: string
  level: string
  service: string
  msg: string
  ip: string
  userId?: string
  details?: any
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [search, setSearch] = useState("")
  const [level, setLevel] = useState("ALL")
  const [service, setService] = useState("all")
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newLog, setNewLog] = useState({
    level: "INFO",
    service: "admin",
    msg: "",
    action: ""
  })
  const [message, setMessage] = useState<string | null>(null)

  const loadLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        level,
        service,
        search,
        limit: "150"
      })
      const response = await fetch(`${config.apiUrl}/admin/logs?${params}`, {
        credentials: "include",
        cache: "no-store"
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok && Array.isArray(data.data)) {
        setLogs(data.data)
      }
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [level, service])

  const handleManualLog = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch(`${config.apiUrl}/admin/logs`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newLog,
        action: newLog.msg
      })
    })
    if (response.ok) {
      setMessage("Audit log record saved successfully.")
      setShowAddModal(false)
      setNewLog({ level: "INFO", service: "admin", msg: "", action: "" })
      loadLogs()
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const exportLogs = () => {
    const jsonStr = JSON.stringify(logs, null, 2)
    const blob = new Blob([jsonStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hmorix-system-logs-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }

  const services = ["all", "api-gateway", "auth-service", "hrm", "crm", "sales", "manager", "billing", "admin", "portal"]

  const errorCount = logs.filter(l => l.level === "ERROR").length
  const warnCount = logs.filter(l => l.level === "WARN").length
  const auditCount = logs.filter(l => l.level === "AUDIT" || l.level === "SECURITY").length

  return (
    <div className="pt-28 pb-20 min-h-screen bg-obsidian text-cream">
      <SEOHead
        title="Live System Audit Logs | HMorix Admin"
        description="Comprehensive real-time system log stream — filter by service, log level, IP address, and security events."
        keywords="system logs, audit trail, server logs, activity stream, admin console"
        canonical="/admin/logs"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-xs text-cream/50 hover:text-[#C8FF00] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Admin Console
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Plus size={13} /> Add Audit Entry
            </button>
            <button
              onClick={exportLogs}
              className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Download size={13} /> Export JSON
            </button>
            <button
              onClick={loadLogs}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
              Live System Logs & Audit Trail
            </h1>
            <p className="text-cream/50 text-sm mt-1">
              Real-time event capture across API gateway, authentication, HRM, CRM, and portal nodes.
            </p>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div className="mb-6 p-4 bg-[#C8FF00]/10 border border-[#C8FF00]/30 rounded-[12px] text-sm text-[#C8FF00]">
            {message}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/40" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && loadLogs()}
              placeholder="Search log messages, IP addresses, services..."
              className="w-full pl-10 pr-4 py-2.5 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
            />
          </div>
          <select
            value={level}
            onChange={e => setLevel(e.target.value)}
            className="px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
          >
            <option value="ALL">All Severity Levels</option>
            <option value="INFO">INFO (Normal)</option>
            <option value="AUDIT">AUDIT (Compliance)</option>
            <option value="SECURITY">SECURITY (Auth/Access)</option>
            <option value="WARN">WARN (Warning)</option>
            <option value="ERROR">ERROR (Failure)</option>
          </select>
          <select
            value={service}
            onChange={e => setService(e.target.value)}
            className="px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
          >
            {services.map(s => (
              <option key={s} value={s}>
                {s === "all" ? "All Microservices" : s.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
          <div className="p-4 bg-obsidian-2 border border-glass-border rounded-[12px] text-center">
            <div className="text-xs text-cream/40">Total Stream Events</div>
            <div className="font-display text-2xl font-bold text-cream mt-1">{logs.length}</div>
          </div>
          <div className="p-4 bg-obsidian-2 border border-glass-border rounded-[12px] text-center">
            <div className="text-xs text-cream/40">Security & Audit Events</div>
            <div className="font-display text-2xl font-bold text-purple-400 mt-1">{auditCount}</div>
          </div>
          <div className="p-4 bg-obsidian-2 border border-glass-border rounded-[12px] text-center">
            <div className="text-xs text-cream/40">Warnings</div>
            <div className="font-display text-2xl font-bold text-yellow-400 mt-1">{warnCount}</div>
          </div>
          <div className="p-4 bg-obsidian-2 border border-glass-border rounded-[12px] text-center">
            <div className="text-xs text-cream/40">Errors / Exceptions</div>
            <div className="font-display text-2xl font-bold text-red-400 mt-1">{errorCount}</div>
          </div>
        </div>

        {/* Modal for Manual Audit Entry */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-obsidian-2 border border-glass-border rounded-[16px] max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-glass-border">
                <h3 className="font-display font-semibold text-base text-cream">Create Manual Audit Record</h3>
                <button onClick={() => setShowAddModal(false)} className="text-cream/40 hover:text-cream">✕</button>
              </div>
              <form onSubmit={handleManualLog} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Log Level</label>
                  <select
                    value={newLog.level}
                    onChange={e => setNewLog({ ...newLog, level: e.target.value })}
                    className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  >
                    <option value="INFO">INFO</option>
                    <option value="AUDIT">AUDIT</option>
                    <option value="SECURITY">SECURITY</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Service Name</label>
                  <input
                    value={newLog.service}
                    onChange={e => setNewLog({ ...newLog, service: e.target.value })}
                    className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Log Message *</label>
                  <textarea
                    required
                    rows={3}
                    value={newLog.msg}
                    onChange={e => setNewLog({ ...newLog, msg: e.target.value })}
                    placeholder="Enter audit message or action summary..."
                    className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline text-xs py-1.5 px-3">Cancel</button>
                  <button type="submit" className="btn-primary text-xs py-1.5 px-5">Save Entry</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Live Logs Terminal Table */}
        <div className="bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden shadow-xl">
          <div className="p-4 font-mono text-xs space-y-1 max-h-[600px] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-12 text-center text-cream/40 font-sans">
                No logs match your filter criteria. Click &quot;Refresh&quot; or clear search terms.
              </div>
            ) : (
              logs.map((log, i) => (
                <div
                  key={log.id || i}
                  className={`p-2.5 rounded-[6px] hover:bg-white/[0.03] transition-colors flex flex-col md:flex-row md:items-center gap-2 md:gap-3 ${
                    log.level === "ERROR"
                      ? "bg-red-500/10 border-l-2 border-red-500"
                      : log.level === "WARN"
                      ? "bg-yellow-500/10 border-l-2 border-yellow-500"
                      : log.level === "SECURITY" || log.level === "AUDIT"
                      ? "bg-purple-500/10 border-l-2 border-purple-500"
                      : "border-l-2 border-transparent"
                  }`}
                >
                  <span className="text-cream/30 whitespace-nowrap text-[11px] font-mono">{log.time}</span>
                  <span
                    className={`w-16 text-center text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      log.level === "ERROR"
                        ? "bg-red-500/20 text-red-400"
                        : log.level === "WARN"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : log.level === "SECURITY" || log.level === "AUDIT"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-purple-400 text-xs font-semibold">[{log.service}]</span>
                  <span className="flex-1 text-cream/80 break-words">{log.msg}</span>
                  <span className="text-cream/30 text-[10px] whitespace-nowrap font-mono">{log.ip}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
