import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../../components/seo/SEOHead'
import { Users, UserPlus, Clock, Calendar, Award, TrendingUp, Briefcase, ArrowUpRight, BadgeAlert, ClipboardList } from 'lucide-react'
import { config } from '../../lib/config'

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
    if (!s) {
      return [
        { label: 'Total Employees', value: '0', change: '0 active', icon: Users, color: 'text-blue-400' },
        { label: 'New Hires (45d)', value: '0', change: '+real', icon: UserPlus, color: 'text-green-400' },
        { label: 'Open Positions', value: '0', change: '0 roles', icon: Briefcase, color: 'text-purple-400' },
        { label: 'Task Completion', value: '0%', change: '0/5 avg', icon: Clock, color: 'text-yellow-400' },
      ]
    }
    return [
      { label: 'Total Employees', value: String(s.totalEmployees), change: `${s.activeEmployees} active`, icon: Users, color: 'text-blue-400' },
      { label: 'New Hires (45d)', value: String(s.newHires), change: '+real', icon: UserPlus, color: 'text-green-400' },
      { label: 'Open Positions', value: String(s.openPositions), change: `${overview.recruitment?.length || 0} roles`, icon: Briefcase, color: 'text-purple-400' },
      { label: 'Task Completion', value: `${s.taskCompletionRate}%`, change: `${s.avgPerformance}/5 avg`, icon: Clock, color: 'text-yellow-400' },
    ]
  }, [overview])

  const liveDepartments = overview?.departments || []
  const liveLeaveRequests = overview?.leaveRequests || []
  const liveRecentHires = overview?.recentHires || []
  const liveUpcomingReviews = overview?.upcomingReviews || []
  const liveEmployees = overview?.employees || []
  const todaySnapshot = overview?.todaySnapshot || { onLeaveToday: 0, presentToday: 0, pendingLeaves: 0, totalEmployees: 0, label: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }

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
            <Link to="/hrm/leaves" className="btn-outline text-sm">Leaves</Link>
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 bg-obsidian-2 border border-glass-border rounded-[12px]">
            <div className="flex items-center justify-between mb-3">
              <Calendar size={18} className="text-[#C8FF00]" />
              <span className="text-[10px] text-cream/30">{todaySnapshot.label}</span>
            </div>
            <div className="font-display text-2xl font-bold">{todaySnapshot.presentToday}</div>
            <div className="text-xs text-cream/30 mt-1">Present today</div>
          </div>
          <div className="p-5 bg-obsidian-2 border border-glass-border rounded-[12px]">
            <div className="flex items-center justify-between mb-3">
              <BadgeAlert size={18} className="text-yellow-400" />
              <span className="text-[10px] text-cream/30">Leave</span>
            </div>
            <div className="font-display text-2xl font-bold">{todaySnapshot.onLeaveToday}</div>
            <div className="text-xs text-cream/30 mt-1">On leave today</div>
          </div>
          <div className="p-5 bg-obsidian-2 border border-glass-border rounded-[12px]">
            <div className="flex items-center justify-between mb-3">
              <ClipboardList size={18} className="text-blue-400" />
              <span className="text-[10px] text-cream/30">HR</span>
            </div>
            <div className="font-display text-2xl font-bold">{todaySnapshot.pendingLeaves}</div>
            <div className="text-xs text-cream/30 mt-1">Pending leaves</div>
          </div>
          <div className="p-5 bg-obsidian-2 border border-glass-border rounded-[12px]">
            <div className="flex items-center justify-between mb-3">
              <Users size={18} className="text-green-400" />
              <span className="text-[10px] text-cream/30">Team</span>
            </div>
            <div className="font-display text-2xl font-bold">{todaySnapshot.totalEmployees}</div>
            <div className="text-xs text-cream/30 mt-1">Total employees</div>
          </div>
        </div>

        {tab === 'overview' && (
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
        )}

        {tab === 'recruitment' && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[12px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold">Open Roles</h2>
                <Link to="/hrm/recruitment" className="text-xs text-[#C8FF00] hover:underline">Open recruitment</Link>
              </div>
              <div className="space-y-3">
                {overview?.recruitment?.length ? overview.recruitment.map((job: any, i: number) => (
                  <div key={job._id || i} className="p-3 bg-obsidian border border-glass-border rounded-[8px]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{job.role}</div>
                        <div className="text-[10px] text-cream/30">{job.department} · {job.location}</div>
                      </div>
                      <span className="text-[10px] text-[#C8FF00]">{Number(job.applicants || 0)} applicants</span>
                    </div>
                  </div>
                )) : <div className="text-sm text-cream/40">No live recruitment records yet.</div>}
              </div>
            </div>
            <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[12px]">
              <h2 className="font-display text-lg font-semibold mb-4">Applicants Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-obsidian border border-glass-border rounded-[8px]"><div className="text-2xl font-bold">{overview?.stats?.openPositions || 0}</div><div className="text-[10px] text-cream/30">Open positions</div></div>
                <div className="p-4 bg-obsidian border border-glass-border rounded-[8px]"><div className="text-2xl font-bold">{overview?.recruitment?.reduce((s: number, j: any) => s + Number(j.applicants || 0), 0) || 0}</div><div className="text-[10px] text-cream/30">Total applicants</div></div>
              </div>
            </div>
          </div>
        )}

        {tab === 'payroll' && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[12px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold">Payroll Snapshot</h2>
                <Link to="/hrm/payroll" className="text-xs text-[#C8FF00] hover:underline">Open payroll</Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-obsidian border border-glass-border rounded-[8px]"><div className="text-2xl font-bold">₹{Number(overview?.stats?.monthlyPayroll || 0).toLocaleString('en-IN')}</div><div className="text-[10px] text-cream/30">Monthly payroll</div></div>
                <div className="p-4 bg-obsidian border border-glass-border rounded-[8px]"><div className="text-2xl font-bold">{overview?.lastPayroll?.period || '—'}</div><div className="text-[10px] text-cream/30">Last payroll period</div></div>
              </div>
            </div>
            <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[12px]">
              <h2 className="font-display text-lg font-semibold mb-4">Current Payroll Staff</h2>
              <div className="space-y-3">
                {liveEmployees.length ? liveEmployees.slice(0, 5).map((emp: any, i: number) => (
                  <div key={emp._id || i} className="flex items-center justify-between p-3 bg-obsidian border border-glass-border rounded-[8px]">
                    <div>
                      <div className="text-sm font-medium">{emp.name}</div>
                      <div className="text-[10px] text-cream/30">{emp.department} · {emp.role}</div>
                    </div>
                    <div className="text-xs text-[#C8FF00]">₹{Math.round(Number(emp.salary || 0) / 12).toLocaleString('en-IN')}</div>
                  </div>
                )) : <div className="text-sm text-cream/40">No employee payroll data yet.</div>}
              </div>
            </div>
          </div>
        )}

        {tab === 'performance' && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[12px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold">Leave Requests</h2>
                <Link to="/hrm/leaves" className="text-xs text-[#C8FF00] hover:underline">Open leaves</Link>
              </div>
              <div className="space-y-3">
                {liveLeaveRequests.length ? liveLeaveRequests.map((req: any, i: number) => (
                  <div key={req._id || i} className="p-3 bg-obsidian border border-glass-border rounded-[8px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{req.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${req.status === 'approved' ? 'bg-green-500/20 text-green-400' : req.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{req.status}</span>
                    </div>
                    <div className="text-[10px] text-cream/30">{req.type} · {req.dates} ({req.days}d)</div>
                  </div>
                )) : <div className="text-sm text-cream/40">No leave requests yet.</div>}
              </div>
            </div>
            <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[12px]">
              <h2 className="font-display text-lg font-semibold mb-4">Performance Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-obsidian border border-glass-border rounded-[8px]"><div className="text-2xl font-bold">{overview?.stats?.avgPerformance || 0}</div><div className="text-[10px] text-cream/30">Average score</div></div>
                <div className="p-4 bg-obsidian border border-glass-border rounded-[8px]"><div className="text-2xl font-bold">{overview?.stats?.taskCompletionRate || 0}%</div><div className="text-[10px] text-cream/30">Task completion</div></div>
              </div>
            </div>
          </div>
        )}

        {tab === 'overview' && (
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
        )}
      </div>
    </div>
  )
}
