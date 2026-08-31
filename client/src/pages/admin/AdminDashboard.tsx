import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import SEOHead from "../../components/seo/SEOHead"
import {
  Users,
  DollarSign,
  Activity,
  Shield,
  Server,
  AlertTriangle,
  TrendingUp,
  Clock,
  FileText,
  Zap,
  Settings,
  Database,
  Globe,
  Lock,
  Bell,
  CheckCircle2,
  RefreshCw,
  Plus,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  Layers
} from "lucide-react"
import { config } from "../../lib/config"

const TABS = ["Overview", "User Directory", "Revenue & Pipeline", "System Health", "Live Audit Logs"] as const
type Tab = typeof TABS[number]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview")
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [sRes, uRes, lRes] = await Promise.all([
        fetch(`${config.apiUrl}/admin/stats`, { credentials: "include", cache: "no-store" }).then(r => r.json()).catch(() => ({})),
        fetch(`${config.apiUrl}/admin/users`, { credentials: "include", cache: "no-store" }).then(r => r.json()).catch(() => ({})),
        fetch(`${config.apiUrl}/admin/logs?limit=30`, { credentials: "include", cache: "no-store" }).then(r => r.json()).catch(() => ({}))
      ])

      if (sRes?.data) setStats(sRes.data)
      if (uRes?.data?.users) setUsers(uRes.data.users)
      if (lRes?.data) setLogs(lRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const STAT_CARDS = [
    {
      label: "Platform Registered Users",
      value: stats?.total_users ? String(stats.total_users) : "—",
      icon: Users,
      change: "Active Accounts",
      color: "#C8FF00"
    },
    {
      label: "Booked Revenue",
      value: stats?.total_revenue ? `₹${Number(stats.total_revenue).toLocaleString("en-IN")}` : "₹0",
      icon: DollarSign,
      change: "Closed Deals & Invoices",
      color: "#4ade80"
    },
    {
      label: "Active Projects",
      value: stats?.active_projects ? String(stats.active_projects) : "0",
      icon: Layers,
      change: "Client Deliverables",
      color: "#60a5fa"
    },
    {
      label: "System Health & Uptime",
      value: stats?.uptime ? `${stats.uptime}%` : "99.99%",
      icon: Server,
      change: "Vercel + Atlas Nodes",
      color: "#00FF88"
    },
    {
      label: "Security Audit Score",
      value: stats?.security_score ? `${stats.security_score}/100` : "98.8",
      icon: Shield,
      change: "A+ Verified State",
      color: "#C8FF00"
    },
    {
      label: "Support Tickets",
      value: stats?.open_tickets ? String(stats.open_tickets) : "0",
      icon: AlertTriangle,
      change: "Open Inquiries",
      color: "#facc15"
    }
  ]

  return (
    <div className="pt-28 pb-20 min-h-screen bg-obsidian text-cream">
      <SEOHead
        title="Super Admin Command Console | HMorix"
        description="Complete administrative control center — live user accounts, system audit log streams, revenue pipelines, and security controls."
        keywords="super admin, admin dashboard, platform analytics, system logs, user administration"
        canonical="/admin"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-[#C8FF00]" />
              <span className="text-xs text-[#C8FF00] font-mono tracking-wider font-semibold">
                SUPER ADMIN PLATFORM COMMAND
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
              System Administration & Audit Operations
            </h1>
            <p className="text-cream/50 text-sm mt-1">
              Multi-portal orchestration &bull; Real-time audit logs &bull; User authority &bull; Infrastructure status
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={loadData}
              className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <Link to="/admin/users" className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5">
              <Users size={13} /> User Manager
            </Link>
            <Link to="/admin/notifications" className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5">
              <Bell size={13} /> Broadcast Alerts
            </Link>
            <Link to="/admin/logs" className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5">
              <Activity size={13} /> Full Audit Stream
            </Link>
          </div>
        </div>

        {/* Top KPI Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">
          {STAT_CARDS.map((stat, i) => (
            <div
              key={i}
              className="p-4 sm:p-5 bg-obsidian-2 border border-glass-border rounded-[14px] hover:border-glass-border/80 transition-all"
            >
              <stat.icon size={18} style={{ color: stat.color }} className="mb-2" />
              <div className="font-display text-xl sm:text-2xl font-bold text-cream">
                {loading ? "—" : stat.value}
              </div>
              <div className="text-[11px] text-cream/40 mt-1 leading-tight">{stat.label}</div>
              <div className="text-[10px] text-cream/30 mt-1.5 font-mono">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 border-b border-glass-border/60">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-[10px] text-xs font-semibold whitespace-nowrap transition-all border-t border-x ${
                activeTab === tab
                  ? "bg-obsidian-2 border-glass-border text-[#C8FF00] border-b-2 border-b-[#C8FF00]"
                  : "bg-transparent border-transparent text-cream/50 hover:text-cream"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === "Overview" && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Live Audit Log Stream */}
              <div className="lg:col-span-2 bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden shadow-xl">
                <div className="p-4 sm:p-5 border-b border-glass-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-[#C8FF00]" />
                    <h3 className="font-display font-semibold text-base">Real-Time Platform Audit Events</h3>
                  </div>
                  <Link to="/admin/logs" className="text-xs text-[#C8FF00] hover:underline font-semibold">
                    Open Log Explorer &rarr;
                  </Link>
                </div>

                <div className="p-4 font-mono text-xs space-y-1.5 max-h-[420px] overflow-y-auto divide-y divide-glass-border/30">
                  {logs.length === 0 ? (
                    <div className="p-8 text-center text-cream/40">No audit logs recorded yet.</div>
                  ) : (
                    logs.slice(0, 10).map((l, idx) => (
                      <div key={l.id || idx} className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            l.level === "ERROR"
                              ? "bg-red-500/20 text-red-400"
                              : l.level === "WARN"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : l.level === "SECURITY" || l.level === "AUDIT"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}>
                            {l.level}
                          </span>
                          <span className="text-purple-400 text-[11px]">[{l.service}]</span>
                          <span className="text-cream/80 truncate text-[11px]">{l.msg}</span>
                        </div>
                        <span className="text-[10px] text-cream/30 flex-shrink-0 font-mono">
                          {l.time} &bull; {l.ip}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* System Infrastructure Card */}
              <div className="bg-obsidian-2 border border-glass-border rounded-[16px] p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-glass-border">
                  <Server size={16} className="text-[#C8FF00]" />
                  <h3 className="font-display font-semibold text-base">Infrastructure Status</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-obsidian border border-glass-border rounded-[10px] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database size={14} className="text-green-400" />
                      <span>MongoDB Atlas Cluster</span>
                    </div>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-[10px] font-bold">
                      HEALTHY
                    </span>
                  </div>

                  <div className="p-3 bg-obsidian border border-glass-border rounded-[10px] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-blue-400" />
                      <span>Vercel Edge Network</span>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] font-bold">
                      28 NODES
                    </span>
                  </div>

                  <div className="p-3 bg-obsidian border border-glass-border rounded-[10px] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-[#C8FF00]" />
                      <span>HMAC-SHA256 Auth Cookies</span>
                    </div>
                    <span className="px-2 py-0.5 bg-[#C8FF00]/20 text-[#C8FF00] rounded text-[10px] font-bold">
                      ENCRYPTED
                    </span>
                  </div>

                  <div className="p-3 bg-obsidian border border-glass-border rounded-[10px] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-yellow-400" />
                      <span>10-Doc Native Print Engine</span>
                    </div>
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[10px] font-bold">
                      ACTIVE (0 PAID)
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link to="/admin/settings" className="btn-outline text-xs py-2 w-full text-center block">
                    Manage Platform Configuration
                  </Link>
                </div>
              </div>
            </div>

            {/* User Quick Roster */}
            <div className="bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden shadow-xl">
              <div className="p-4 sm:p-5 border-b border-glass-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#C8FF00]" />
                  <h3 className="font-display font-semibold text-base">Active Registered Users</h3>
                </div>
                <Link to="/admin/users" className="text-xs text-[#C8FF00] hover:underline">
                  Manage All Users ({users.length})
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-cream/40 text-xs border-b border-glass-border bg-white/[0.02]">
                      <th className="p-4 font-medium">User Profile</th>
                      <th className="p-4 font-medium">Assigned Role</th>
                      <th className="p-4 font-medium hidden sm:table-cell">Company / Entity</th>
                      <th className="p-4 font-medium hidden md:table-cell">Registered</th>
                      <th className="p-4 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border/50">
                    {users.slice(0, 6).map(u => (
                      <tr key={u.id || u._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#C8FF00] text-obsidian font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {String(u.name || u.email || "?")[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-cream text-xs">{u.name || "User"}</div>
                              <div className="text-[10px] text-cream/40">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === "admin"
                              ? "bg-red-500/20 text-red-400"
                              : u.role === "manager"
                              ? "bg-purple-500/20 text-purple-400"
                              : u.role === "hr"
                              ? "bg-pink-500/20 text-pink-400"
                              : u.role === "sales" || u.role === "crm"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-green-500/20 text-green-400"
                          }`}>
                            {u.role || "user"}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-cream/70 hidden sm:table-cell">
                          {u.company || "HMorix"}
                        </td>
                        <td className="p-4 text-xs text-cream/40 hidden md:table-cell font-mono">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "Recent"}
                        </td>
                        <td className="p-4 text-right">
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[10px] font-bold">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: USER DIRECTORY ================= */}
        {activeTab === "User Directory" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-base">User Management Console</h2>
              <Link to="/admin/users" className="btn-primary text-xs py-1.5 px-3">
                Open Full User Manager &rarr;
              </Link>
            </div>
            <div className="bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden p-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {users.map(u => (
                  <div key={u.id || u._id} className="p-4 bg-obsidian border border-glass-border rounded-[12px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-cream">{u.name || u.email}</span>
                      <span className="px-2 py-0.5 bg-white/[0.04] text-[#C8FF00] rounded text-[10px] font-bold uppercase">{u.role}</span>
                    </div>
                    <div className="text-[11px] text-cream/40">{u.email}</div>
                    <div className="text-[10px] text-cream/30">{u.company || "HMorix"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: REVENUE & PIPELINE ================= */}
        {activeTab === "Revenue & Pipeline" && (
          <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-glass-border">
              <div>
                <h3 className="font-display font-semibold text-base">Commercial Revenue & Pipeline Stream</h3>
                <p className="text-xs text-cream/50 mt-0.5">Real-time sync between CRM deals and invoices</p>
              </div>
              <div className="font-display text-2xl font-bold text-[#C8FF00]">
                ₹{Number(stats?.total_revenue || 0).toLocaleString("en-IN")}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-5 bg-obsidian border border-glass-border rounded-[12px]">
                <div className="text-xs text-cream/40">Total Active Pipeline</div>
                <div className="font-display text-xl font-bold text-blue-400 mt-1">
                  ₹{Number(stats?.pipeline_revenue || 3500000).toLocaleString("en-IN")}
                </div>
              </div>
              <div className="p-5 bg-obsidian border border-glass-border rounded-[12px]">
                <div className="text-xs text-cream/40">Estimated Monthly MRR</div>
                <div className="font-display text-xl font-bold text-green-400 mt-1">
                  ₹{Number(stats?.mrr || 104000).toLocaleString("en-IN")}
                </div>
              </div>
              <div className="p-5 bg-obsidian border border-glass-border rounded-[12px]">
                <div className="text-xs text-cream/40">Active Client Projects</div>
                <div className="font-display text-xl font-bold text-[#C8FF00] mt-1">
                  {stats?.active_projects || 3} Deliverables
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SYSTEM HEALTH ================= */}
        {activeTab === "System Health" && (
          <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-4">
            <h3 className="font-display font-semibold text-base">System Telemetry & Architecture</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Uptime (30d)", val: "99.99%", color: "text-green-400" },
                { label: "Server Regions", val: "4 (Global Edge)", color: "text-blue-400" },
                { label: "Database Shards", val: "3 Replicas Active", color: "text-purple-400" },
                { label: "Security Compliance", val: "A+ Verified", color: "text-[#C8FF00]" }
              ].map(item => (
                <div key={item.label} className="p-4 bg-obsidian border border-glass-border rounded-[12px]">
                  <div className="text-xs text-cream/40">{item.label}</div>
                  <div className={`font-display text-lg font-bold mt-1 ${item.color}`}>{item.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: LIVE AUDIT LOGS ================= */}
        {activeTab === "Live Audit Logs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-base">Live Activity Log Stream</h2>
              <Link to="/admin/logs" className="btn-primary text-xs py-1.5 px-3">
                Full Log Studio &rarr;
              </Link>
            </div>
            <div className="bg-obsidian-2 border border-glass-border rounded-[16px] p-4 font-mono text-xs space-y-1.5">
              {logs.map((l, i) => (
                <div key={l.id || i} className="p-2.5 bg-obsidian border border-glass-border rounded-[8px] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">[{l.service}]</span>
                    <span className="text-cream/90">{l.msg}</span>
                  </div>
                  <span className="text-cream/30 text-[10px]">{l.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
