import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import SEOHead from "../../components/seo/SEOHead"
import {
  Calendar,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Filter,
  User
} from "lucide-react"
import { config } from "../../lib/config"

export default function Leaves() {
  const [leaves, setLeaves] = useState<any[]>([])
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")

  const loadLeaves = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiUrl}/hrm/leave`, {
        credentials: "include",
        cache: "no-store"
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Unable to load leave requests")
      setLeaves(data.data || [])
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Unable to load leave requests"
      })
      setLeaves([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaves()
  }, [])

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      }),
    []
  )

  const pending = leaves.filter(leave => leave.status === "pending")
  const approved = leaves.filter(leave => leave.status === "approved")
  const rejected = leaves.filter(leave => leave.status === "rejected")

  const decide = async (id: string, status: "approved" | "rejected") => {
    const response = await fetch(`${config.apiUrl}/hrm/leave`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage({ type: "error", text: data.error || "Unable to update leave request" })
      return
    }
    setMessage({
      type: "success",
      text: `Leave request ${status === "approved" ? "approved" : "rejected"} successfully.`
    })
    setLeaves(prev => prev.map(l => (String(l._id) === id ? { ...l, status } : l)))
    setTimeout(() => setMessage(null), 3500)
  }

  const filteredLeaves =
    statusFilter === "all" ? leaves : leaves.filter(l => l.status === statusFilter)

  return (
    <div className="pt-28 pb-20 min-h-screen bg-obsidian text-cream">
      <SEOHead
        title="Leave Management & Approvals | Enterprise HRM"
        description="Review, approve, and track employee time-off requests, sick leaves, and annual leave quotas."
        keywords="HRM leaves, leave management, time off approvals, employee attendance, PTO"
        canonical="/hrm/leaves"
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/hrm"
            className="inline-flex items-center gap-2 text-xs text-cream/50 hover:text-[#C8FF00] transition-colors"
          >
            <ArrowLeft size={14} /> Back to HRM Dashboard
          </Link>
          <span className="text-xs text-cream/40 font-mono">Today: {todayLabel}</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
              Leave & Time-Off Approvals
            </h1>
            <p className="text-cream/50 text-sm mt-1">
              Review pending staff time-off requests and maintain department coverage.
            </p>
          </div>
        </div>

        {/* Message Toast */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-[12px] border text-sm flex items-start gap-3 ${
              message.type === "success"
                ? "bg-[#C8FF00]/10 border-[#C8FF00]/30 text-[#C8FF00]"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {message.type === "success" ? <Check size={16} className="mt-0.5" /> : <AlertCircle size={16} />}
            <div>{message.text}</div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          {[
            { label: "Pending Approval", count: pending.length, color: "text-yellow-400", bg: "border-yellow-500/20 bg-yellow-500/5", icon: Clock },
            { label: "Approved Leaves", count: approved.length, color: "text-green-400", bg: "border-green-500/20 bg-green-500/5", icon: CheckCircle2 },
            { label: "Rejected Requests", count: rejected.length, color: "text-red-400", bg: "border-red-500/20 bg-red-500/5", icon: XCircle }
          ].map(card => (
            <div key={card.label} className={`p-4 sm:p-5 rounded-[14px] border ${card.bg}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-cream/40">{card.label}</span>
                <card.icon size={16} className={card.color} />
              </div>
              <div className={`font-display text-2xl sm:text-3xl font-bold mt-2 ${card.color}`}>
                {card.count}
              </div>
            </div>
          ))}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-6">
          <Filter size={13} className="text-cream/40 mr-1" />
          {[
            { id: "all", label: "All Requests", count: leaves.length },
            { id: "pending", label: "Pending", count: pending.length },
            { id: "approved", label: "Approved", count: approved.length },
            { id: "rejected", label: "Rejected", count: rejected.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                statusFilter === tab.id
                  ? "bg-[#C8FF00] text-obsidian font-bold"
                  : "bg-obsidian-2 border border-glass-border text-cream/60 hover:text-cream"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Leave Requests Cards List */}
        <div className="space-y-3.5">
          {loading ? (
            <div className="p-12 bg-obsidian-2 border border-glass-border rounded-[14px] text-center text-cream/40">
              Loading leave requests...
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="p-12 bg-obsidian-2 border border-glass-border rounded-[14px] text-center text-cream/40">
              No leave requests found for this filter.
            </div>
          ) : (
            filteredLeaves.map(leave => (
              <div
                key={leave._id}
                className="p-5 bg-obsidian-2 border border-glass-border rounded-[14px] hover:border-glass-border/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#C8FF00] text-obsidian flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {String(leave.name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-base text-cream">{leave.name}</h3>
                      <span className="text-[10px] font-mono text-cream/30">
                        {leave.employeeId || ""}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-cream/50">
                      <span className="px-2 py-0.5 bg-white/[0.04] border border-glass-border rounded font-medium text-cream/80">
                        {leave.type || "Casual Leave"}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-[#C8FF00]" /> {leave.dates || "Dates specified"}
                      </span>
                      <span>&bull;</span>
                      <span className="font-semibold text-cream">{leave.days || 1} day(s)</span>
                    </div>
                    {leave.reason && (
                      <p className="mt-2 text-xs text-cream/60 italic bg-obsidian p-2.5 rounded-[8px] border border-glass-border/50">
                        &ldquo;{leave.reason}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Status & Decision Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                      leave.status === "approved"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : leave.status === "rejected"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    }`}
                  >
                    {leave.status}
                  </span>

                  {leave.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decide(String(leave._id), "approved")}
                        className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 text-green-400 rounded-[8px] text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Check size={13} /> Approve
                      </button>
                      <button
                        onClick={() => decide(String(leave._id), "rejected")}
                        className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-[8px] text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <X size={13} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
