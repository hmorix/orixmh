import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import SEOHead from "../../components/seo/SEOHead"
import {
  Users,
  DollarSign,
  TrendingUp,
  Target,
  Phone,
  Mail,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Briefcase,
  Sparkles,
  Layers,
  ChevronRight,
  CheckCircle2,
  Building,
  ArrowLeft
} from "lucide-react"
import { config } from "../../lib/config"

export default function CRMDashboard() {
  const [timeRange, setTimeRange] = useState("30d")
  const [overview, setOverview] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`${config.apiUrl}/crm/overview`, { credentials: "include", cache: "no-store" })
      .then(async response => {
        const data = await response.json().catch(() => ({}))
        if (response.ok) setOverview(data.data || null)
      })
      .catch(() => setOverview(null))
      .finally(() => setLoading(false))
  }, [timeRange])

  const stats = overview
    ? [
        { label: "Total Client Leads", value: String(overview.contacts?.total || 0), change: "+14%", up: true, icon: Users, color: "#C8FF00" },
        { label: "Active Deals", value: String(overview.deals?.active || 0), change: "+live", up: true, icon: Target, color: "#60a5fa" },
        { label: "Pipeline Value", value: `₹${Number(overview.deals?.totalValue || 0).toLocaleString("en-IN")}`, change: "+28%", up: true, icon: DollarSign, color: "#4ade80" },
        { label: "Deal Win Rate", value: `${overview.deals?.winRate || 68}%`, change: "+5%", up: true, icon: TrendingUp, color: "#facc15" }
      ]
    : [
        { label: "Total Client Leads", value: "0", change: "+0%", up: true, icon: Users, color: "#C8FF00" },
        { label: "Active Deals", value: "0", change: "+0%", up: true, icon: Target, color: "#60a5fa" },
        { label: "Pipeline Value", value: "₹0", change: "+0%", up: true, icon: DollarSign, color: "#4ade80" },
        { label: "Deal Win Rate", value: "0%", change: "+0%", up: true, icon: TrendingUp, color: "#facc15" }
      ]

  const recentDeals = overview?.recentDeals || []
  const activities = overview?.recentActivity || []
  const pipelineStages = [
    { name: "Lead Capture", count: overview?.pipeline?.lead || 12, value: "Incoming", color: "bg-blue-500" },
    { name: "Qualification", count: overview?.pipeline?.qualification || 8, value: "Qualified", color: "bg-purple-500" },
    { name: "Discovery", count: overview?.pipeline?.discovery || 6, value: "Scope Set", color: "bg-yellow-500" },
    { name: "Proposal", count: overview?.pipeline?.proposal || 5, value: "Pitched", color: "bg-orange-500" },
    { name: "Negotiation", count: overview?.pipeline?.negotiation || 4, value: "Closing", color: "bg-pink-500" },
    { name: "Closed Won", count: overview?.pipeline?.closedWon || 9, value: "Won Deals", color: "bg-green-500" }
  ]

  return (
    <div className="pt-28 pb-20 min-h-screen bg-obsidian text-cream">
      <SEOHead
        title="Enterprise CRM & Revenue Pipeline | HMorix"
        description="Comprehensive customer relationship management — sales pipelines, high-value deal tracking, client contact logs, and revenue forecasting."
        keywords="enterprise CRM, sales pipeline, deal management, contact directory, lead tracking, revenue analytics"
        canonical="/crm"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/manager"
            className="inline-flex items-center gap-2 text-xs text-cream/50 hover:text-[#C8FF00] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Operations Hub
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/sales" className="btn-outline text-xs py-1.5 px-3">
              ⚡ Field Sales Portal
            </Link>
            <Link to="/crm/deals" className="btn-primary text-xs py-1.5 px-3">
              + New Deal Pipeline
            </Link>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-full text-xs font-semibold text-[#C8FF00] mb-2">
              <Sparkles size={12} /> Commercial Sales & Account Management
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
              CRM & Revenue Pipeline
            </h1>
            <p className="text-cream/50 text-sm mt-1">
              Lead qualification &bull; Deal negotiation &bull; Contract sign-off &bull; Client lifecycle sync
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">This Quarter</option>
              <option value="1y">Fiscal Year</option>
            </select>
            <Link to="/crm/contacts" className="btn-outline text-xs py-2 px-3.5">
              <Users size={13} className="mr-1.5 inline" /> Contacts Directory
            </Link>
          </div>
        </div>

        {/* Top KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="p-5 bg-obsidian-2 border border-glass-border rounded-[14px] hover:border-glass-border/80 transition-all">
              <div className="flex items-center justify-between mb-3">
                <s.icon size={18} style={{ color: s.color }} />
                <span className="flex items-center gap-0.5 text-xs font-semibold text-green-400">
                  <ArrowUpRight size={13} /> {s.change}
                </span>
              </div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-cream">
                {loading ? "—" : s.value}
              </div>
              <div className="text-xs text-cream/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Sales Pipeline Stage Bar */}
        <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] mb-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-glass-border">
            <div>
              <h2 className="font-display font-semibold text-base">Stage-by-Stage Sales Pipeline</h2>
              <p className="text-xs text-cream/50 mt-0.5">End-to-end deal flow conversion rates</p>
            </div>
            <Link to="/crm/deals" className="text-xs text-[#C8FF00] hover:underline font-semibold">
              Open Interactive Kanban &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {pipelineStages.map((stage, i) => (
              <div key={i} className="p-4 bg-obsidian border border-glass-border rounded-[12px] text-center space-y-1">
                <div className={`h-1.5 w-full ${stage.color} rounded-full mb-3`} />
                <div className="text-xs font-semibold text-cream">{stage.name}</div>
                <div className="font-display text-xl font-bold text-[#C8FF00]">{stage.count}</div>
                <div className="text-[10px] text-cream/40 uppercase tracking-wider">{stage.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Column Split: Recent Deals & Active Client Leads */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Deals Desk */}
          <div className="bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden shadow-lg">
            <div className="p-4 sm:p-5 border-b border-glass-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-[#C8FF00]" />
                <h3 className="font-display font-semibold text-base">Recent High-Value Deals</h3>
              </div>
              <Link to="/crm/deals" className="text-xs text-[#C8FF00] hover:underline">
                View All Deals
              </Link>
            </div>
            <div className="divide-y divide-glass-border/50">
              {recentDeals.length === 0 ? (
                <div className="p-8 text-center text-cream/40 text-xs">
                  No deals in pipeline yet. <Link to="/crm/deals" className="text-[#C8FF00] underline">Create first deal</Link>
                </div>
              ) : (
                recentDeals.slice(0, 5).map((deal: any, idx: number) => (
                  <div key={deal._id || idx} className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-sm text-cream">{deal.name}</div>
                      <div className="text-xs text-cream/40 mt-0.5">
                        {deal.company || "Enterprise Client"} &bull; Stage: <strong className="text-cream/80 capitalize">{deal.stage?.replace(/_/g, " ")}</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-[#C8FF00]">
                        ₹{Number(deal.value || 0).toLocaleString("en-IN")}
                      </div>
                      <span className="text-[10px] text-cream/40">{deal.probability || 80}% Probability</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Action & Contact Links */}
          <div className="space-y-4">
            <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] shadow-lg space-y-4">
              <h3 className="font-display font-semibold text-base flex items-center gap-2">
                <Building size={16} className="text-[#C8FF00]" /> Field Sales Lead Sync
              </h3>
              <p className="text-xs text-cream/60 leading-relaxed">
                Field sales representatives logging leads in <Link to="/sales" className="text-[#C8FF00] underline font-semibold">/sales</Link> automatically provision CRM contacts, initialize deals in the pipeline, and create project delivery blueprints.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link to="/sales" className="btn-primary text-xs py-2.5 text-center">
                  + Log Field Lead
                </Link>
                <Link to="/crm/contacts" className="btn-outline text-xs py-2.5 text-center">
                  Manage Contacts
                </Link>
              </div>
            </div>

            <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] shadow-lg flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm text-cream">Client Portal Interconnect</h4>
                <p className="text-xs text-cream/40 mt-0.5">Won deals automatically create client portal credentials.</p>
              </div>
              <Link to="/portal" className="btn-outline text-xs py-1.5 px-3">
                Open Portal &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
