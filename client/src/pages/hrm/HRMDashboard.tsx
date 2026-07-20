import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../../components/seo/SEOHead'
import { Users, UserPlus, UserMinus, Clock, Calendar, Award, TrendingUp, Briefcase, ArrowUpRight } from 'lucide-react'
import { config } from '../../lib/config'

const stats = [
  { label: 'Total Employees', value: '247', change: '+8', icon: Users, color: 'text-blue-400' },
  { label: 'New Hires (Month)', value: '12', change: '+3', icon: UserPlus, color: 'text-green-400' },
  { label: 'Open Positions', value: '18', change: '-2', icon: Briefcase, color: 'text-purple-400' },
  { label: 'Avg. Attendance', value: '96.4%', change: '+1.2%', icon: Clock, color: 'text-yellow-400' },
]

const departments = [
  { name: 'Engineering', headcount: 84, budget: '$12.4M', openRoles: 6, avgTenure: '2.8y' },
  { name: 'Product', headcount: 28, budget: '$4.2M', openRoles: 3, avgTenure: '2.1y' },
  { name: 'Marketing', headcount: 32, budget: '$3.8M', openRoles: 2, avgTenure: '1.9y' },
  { name: 'Sales', headcount: 45, budget: '$5.6M', openRoles: 4, avgTenure: '1.5y' },
  { name: 'AI/ML', headcount: 24, budget: '$6.8M', openRoles: 2, avgTenure: '1.8y' },
  { name: 'Operations', headcount: 18, budget: '$2.1M', openRoles: 1, avgTenure: '3.2y' },
  { name: 'HR', headcount: 8, budget: '$1.2M', openRoles: 0, avgTenure: '2.5y' },
  { name: 'Finance', headcount: 8, budget: '$1.4M', openRoles: 0, avgTenure: '2.7y' },
]

const recentHires = [
  { name: 'Alex Johnson', role: 'Senior Frontend Engineer', department: 'Engineering', startDate: '2024-06-24', status: 'onboarding' },
  { name: 'Maria Garcia', role: 'ML Engineer', department: 'AI/ML', startDate: '2024-06-20', status: 'onboarding' },
  { name: 'James Lee', role: 'Product Designer', department: 'Product', startDate: '2024-06-17', status: 'active' },
  { name: 'Sophie Brown', role: 'Account Executive', department: 'Sales', startDate: '2024-06-15', status: 'active' },
  { name: 'Ryan Patel', role: 'DevOps Engineer', department: 'Engineering', startDate: '2024-06-10', status: 'active' },
]

const leaveRequests = [
  { name: 'Emily Chen', type: 'Annual Leave', dates: 'Jul 15-19', days: 5, status: 'pending' },
  { name: 'Mike Johnson', type: 'Sick Leave', dates: 'Jul 1', days: 1, status: 'approved' },
  { name: 'Lisa Martinez', type: 'Personal', dates: 'Jul 8', days: 1, status: 'pending' },
  { name: 'David Kim', type: 'Annual Leave', dates: 'Jul 22-26', days: 5, status: 'pending' },
]

const upcomingReviews = [
  { name: 'Alex Rivera', department: 'Engineering', dueDate: 'Jul 5', type: 'Quarterly' },
  { name: 'Sarah Chen', department: 'Product', dueDate: 'Jul 8', type: 'Annual' },
  { name: 'Tom Anderson', department: 'Marketing', dueDate: 'Jul 10', type: 'Quarterly' },
]

export default function HRMDashboard() {
  const [tab, setTab] = useState<'overview' | 'recruitment' | 'payroll' | 'performance'>('overview')
  const [overview, setOverview] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${config.apiUrl}/hrm/overview`, { credentials: 'include', cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || 'Unable to load HRM data')
        setOverview(data.data)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Unable to load HRM data'))
  }, [])

  const decideLeave = async (id: string, status: 'approved' | 'rejected') => {
    const response = await fetch(`${config.apiUrl}/hrm/leave`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(data.error || 'Unable to update leave request')
      return
    }
    setOverview((prev: any) => ({
      ...prev,
      leaveRequests: (prev?.leaveRequests || []).map((leave: any) => String(leave._id) === id ? data.data : leave),
    }))
  }

  const liveStats = useMemo(() => {
    const s = overview?.stats
    if (!s) return stats
    return [
      { label: 'Total Employees', value: String(s.totalEmployees), change: `${s.activeEmployees} active`, icon: Users, color: 'text-blue-400' },
      { label: 'New Hires (45d)', value: String(s.newHires), change: '+real', icon: UserPlus, color: 'text-green-400' },
      { label: 'Open Positions', value: String(s.openPositions), change: `${overview.recruitment?.length || 0} roles`, icon: Briefcase, color: 'text-purple-400' },
      { label: 'Task Completion', value: `${s.taskCompletionRate}%`, change: `${s.avgPerformance}/5 avg`, icon: Clock, color: 'text-yellow-400' },
    ]
  }, [overview])

  const liveDepartments = overview?.departments || departments
  const liveLeaveRequests = overview?.leaveRequests || leaveRequests
  const liveRecentHires = overview?.recentHires || recentHires
  const liveUpcomingReviews = overview?.upcomingReviews || upcomingReviews

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <SEOHead title="HRM Dashboard" description="HMorix Human Resource Management system - manage employees, recruitment, payroll, performance reviews, attendance, and organizational structure." keywords="HRM, human resource management, employee management, HR dashboard, recruitment, payroll, performance reviews, attendance tracking, workforce management, HR software" canonical="/hrm" />
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">HR Management</h1>
            <p className="text-cream/50 text-sm mt-1">Workforce analytics and employee management</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/hrm/recruitment" className="btn-outline text-sm">Recruitment</Link>
            <Link to="/hrm/payroll" className="btn-primary text-sm flex items-center gap-2"><UserPlus size={14} /> Add Employee</Link>
          </div>
        </div>

        {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-[8px] text-sm text-red-400">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-glass-border">
          {(['overview', 'recruitment', 'payroll', 'performance'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${tab === t ? 'text-[#C8FF00] border-[#C8FF00]' : 'text-cream/40 border-transparent hover:text-cream/60'}`}>{t}</button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {liveStats.map((s, i) => (
            <div key={i} className="p-5 bg-obsidian-2 border border-glass-border rounded-[12px]">
              <div className="flex items-center justify-between mb-3">
                <s.icon size={18} className={s.color} />
                <span className="flex items-center gap-0.5 text-xs font-medium text-green-400"><ArrowUpRight size={12} /> {s.change}</span>
              </div>
              <div className="font-display text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-cream/30 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Departments */}
          <div className="lg:col-span-2 p-6 bg-obsidian-2 border border-glass-border rounded-[12px]">
            <h2 className="font-display text-lg font-semibold mb-4">Departments</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-cream/30 text-xs border-b border-glass-border">
                    <th className="pb-3 font-medium">Department</th>
                    <th className="pb-3 font-medium">Headcount</th>
                    <th className="pb-3 font-medium">Budget</th>
                    <th className="pb-3 font-medium">Open Roles</th>
                    <th className="pb-3 font-medium">Avg Tenure</th>
                  </tr>
                </thead>
                <tbody>
                  {liveDepartments.map((dept: any, i: number) => (
                    <tr key={i} className="border-b border-glass-border/50 hover:bg-white/[0.02]">
                      <td className="py-3 font-medium">{dept.name}</td>
                      <td className="py-3">{dept.headcount}</td>
                      <td className="py-3 text-[#C8FF00]">{dept.budget || `₹${Number(dept.payroll || 0).toLocaleString('en-IN')}`}</td>
                      <td className="py-3">{dept.openRoles > 0 ? <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px]">{dept.openRoles} open</span> : <span className="text-cream/30">—</span>}</td>
                      <td className="py-3 text-cream/50">{dept.avgTenure || `${dept.avgScore || 0}/5 score`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leave Requests */}
          <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[12px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">Leave Requests</h2>
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[10px]">{liveLeaveRequests.filter((l: any) => l.status === 'pending').length} pending</span>
            </div>
            <div className="space-y-3">
              {liveLeaveRequests.map((req: any, i: number) => (
                <div key={i} className="p-3 bg-obsidian border border-glass-border rounded-[8px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{req.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${req.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{req.status}</span>
                  </div>
                  <div className="text-[10px] text-cream/30">{req.type} · {req.dates} ({req.days}d)</div>
                  {req.status === 'pending' && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => decideLeave(String(req._id), 'approved')} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-[10px] hover:bg-green-500/30">Approve</button>
                      <button onClick={() => decideLeave(String(req._id), 'rejected')} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-[10px] hover:bg-red-500/30">Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Hires */}
          <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[12px]">
            <h2 className="font-display text-lg font-semibold mb-4">Recent Hires</h2>
            <div className="space-y-3">
              {liveRecentHires.map((hire: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-obsidian border border-glass-border rounded-[8px]">
                  <div className="w-10 h-10 bg-obsidian-3 rounded-full flex items-center justify-center text-xs font-bold">{hire.name.split(' ').map((n: string) => n[0]).join('')}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{hire.name}</div>
                    <div className="text-[10px] text-cream/30">{hire.role} · {hire.department}</div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${hire.status === 'onboarding' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>{hire.status}</span>
                    <div className="text-[10px] text-cream/20 mt-1">{String(hire.startDate).slice(0, 10)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Reviews */}
          <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[12px]">
            <h2 className="font-display text-lg font-semibold mb-4">Upcoming Reviews</h2>
            <div className="space-y-3">
              {liveUpcomingReviews.map((review: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-obsidian border border-glass-border rounded-[8px]">
                  <div className="w-10 h-10 bg-obsidian-3 rounded-full flex items-center justify-center text-xs font-bold">{review.name.split(' ').map((n: string) => n[0]).join('')}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{review.name}</div>
                    <div className="text-[10px] text-cream/30">{review.department}</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[10px]">{review.type}</span>
                    <div className="text-[10px] text-cream/20 mt-1">Due: {review.dueDate}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-[#C8FF00]/5 border border-[#C8FF00]/20 rounded-[8px]">
              <div className="flex items-center gap-2 mb-1">
                <Award size={14} className="text-[#C8FF00]" />
                <span className="text-xs font-medium">Performance Summary</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div><div className="text-lg font-bold">{overview?.stats?.avgPerformance || 4.2}</div><div className="text-[10px] text-cream/30">Avg Score</div></div>
                <div><div className="text-lg font-bold">{overview?.stats?.taskCompletionRate || 87}%</div><div className="text-[10px] text-cream/30">Tasks Done</div></div>
                <div><div className="text-lg font-bold">{overview?.stats?.pendingLeaves || 0}</div><div className="text-[10px] text-cream/30">Pending Leave</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
