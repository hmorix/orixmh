import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../../components/seo/SEOHead'
import { Users, DollarSign, TrendingUp, Target, Phone, Mail, Calendar, BarChart3, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { config } from '../../lib/config'

export default function CRMDashboard() {
  const [timeRange, setTimeRange] = useState('30d')
  const [overview, setOverview] = useState<any>(null)

  useEffect(() => {
    fetch(`${config.apiUrl}/crm/overview`, { credentials: 'include', cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}))
        if (response.ok) setOverview(data.data || null)
      })
      .catch(() => setOverview(null))
  }, [timeRange])

  const stats = overview
    ? [
        { label: 'Total Contacts', value: String(overview.contacts.total), change: `${overview.contacts.growth || '+0%'}`, up: true, icon: Users },
        { label: 'Active Deals', value: String(overview.deals.active), change: '+live', up: true, icon: Target },
        { label: 'Pipeline Value', value: `₹${Number(overview.deals.totalValue || 0).toLocaleString('en-IN')}`, change: '+live', up: true, icon: DollarSign },
        { label: 'Win Rate', value: `${overview.deals.winRate || 0}%`, change: '+live', up: true, icon: TrendingUp },
      ]
    : [
        { label: 'Total Contacts', value: '0', change: '+0%', up: true, icon: Users },
        { label: 'Active Deals', value: '0', change: '+0%', up: true, icon: Target },
        { label: 'Pipeline Value', value: '₹0', change: '+0%', up: true, icon: DollarSign },
        { label: 'Win Rate', value: '0%', change: '+0%', up: true, icon: TrendingUp },
      ]

  const recentDeals = overview?.recentDeals || []
  const activities = overview?.recentActivity || []
  const pipelineStages = [
    { name: 'Lead', count: overview?.pipeline?.lead || 0, value: 'Lead stage', color: 'bg-blue-500' },
    { name: 'Qualification', count: overview?.pipeline?.qualification || 0, value: 'Qualification stage', color: 'bg-purple-500' },
    { name: 'Discovery', count: overview?.pipeline?.discovery || 0, value: 'Discovery stage', color: 'bg-yellow-500' },
    { name: 'Proposal', count: overview?.pipeline?.proposal || 0, value: 'Proposal stage', color: 'bg-orange-500' },
    { name: 'Negotiation', count: overview?.pipeline?.negotiation || 0, value: 'Negotiation stage', color: 'bg-pink-500' },
    { name: 'Closed Won', count: overview?.pipeline?.closedWon || 0, value: 'Won deals', color: 'bg-green-500' },
  ]

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <SEOHead title="CRM Dashboard" description="HMorix CRM - Customer Relationship Management system with pipeline tracking, deal management, contact management, and sales analytics." keywords="CRM, customer relationship management, sales pipeline, deal tracking, contact management, sales analytics, lead management, HMorix CRM" canonical="/crm" />
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">CRM Dashboard</h1>
            <p className="text-cream/50 text-sm mt-1">Manage your sales pipeline and customer relationships</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[6px] text-sm text-cream/70">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">This year</option>
            </select>
            <Link to="/crm/contacts" className="btn-outline text-sm">View Contacts</Link>
            <Link to="/crm/deals" className="btn-primary text-sm">+ New Deal</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="p-5 bg-obsidian-2 border border-glass-border rounded-[12px]">
              <div className="flex items-center justify-between mb-3">
                <s.icon size={18} className="text-[#C8FF00]" />
                <span className={`flex items-center gap-0.5 text-xs font-medium ${s.up ? 'text-green-400' : 'text-red-400'}`}>
                  {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {s.change}
                </span>
              </div>
              <div className="font-display text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-cream/30 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Pipeline */}
          <div className="lg:col-span-2 p-6 bg-obsidian-2 border border-glass-border rounded-[12px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold">Sales Pipeline</h2>
              <Link to="/crm/pipeline" className="text-xs text-[#C8FF00] hover:underline">View Full Pipeline</Link>
            </div>
            <div className="flex gap-2">
              {pipelineStages.map((stage, i) => (
                <div key={i} className="flex-1 text-center">
                  <div className={`h-2 ${stage.color} rounded-full mb-2`} style={{ opacity: 0.3 + (i * 0.14) }} />
                  <div className="text-xs font-medium">{stage.name}</div>
                  <div className="text-lg font-bold mt-1">{stage.count}</div>
                  <div className="text-[10px] text-cream/30">{stage.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[12px]">
            <h2 className="font-display text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {activities.map((a: any, i: number) => (
                <div key={i} className="flex gap-3 p-2 rounded-[6px] hover:bg-white/[0.02]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${a.type === 'call' ? 'bg-blue-500/20 text-blue-400' : a.type === 'email' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {a.type === 'call' ? <Phone size={12} /> : a.type === 'email' ? <Mail size={12} /> : <Calendar size={12} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{a.title || a.contact || 'CRM activity'}</div>
                    <div className="text-[10px] text-cream/30 truncate">{a.description || a.note || ''}</div>
                    <div className="text-[10px] text-cream/20 mt-0.5">{a.time ? new Date(a.time).toLocaleString() : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Deals */}
        <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[12px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Recent Deals</h2>
            <Link to="/crm/deals" className="text-xs text-[#C8FF00] hover:underline">View All Deals</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-cream/30 text-xs border-b border-glass-border">
                  <th className="pb-3 font-medium">Deal Name</th>
                  <th className="pb-3 font-medium">Value</th>
                  <th className="pb-3 font-medium">Stage</th>
                  <th className="pb-3 font-medium">Probability</th>
                  <th className="pb-3 font-medium">Owner</th>
                  <th className="pb-3 font-medium">Days in Stage</th>
                </tr>
              </thead>
              <tbody>
                {recentDeals.map((deal: any, i: number) => (
                  <tr key={deal.id || deal._id || i} className="border-b border-glass-border/50 hover:bg-white/[0.02]">
                    <td className="py-3 font-medium">{deal.name}</td>
                    <td className="py-3 text-[#C8FF00]">₹{Number(deal.value || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-medium ${deal.stage === 'closed_won' ? 'bg-green-500/20 text-green-400' : deal.stage === 'negotiation' ? 'bg-pink-500/20 text-pink-400' : 'bg-blue-500/20 text-blue-400'}`}>{String(deal.stage || 'lead').replace(/_/g, ' ')}</span></td>
                    <td className="py-3">{deal.probability || 0}%</td>
                    <td className="py-3 text-cream/50">{deal.owner || '-'}</td>
                    <td className="py-3 text-cream/50">{deal.daysInStage || 0}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
