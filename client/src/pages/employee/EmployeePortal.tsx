import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../../components/seo/SEOHead'
import { Award, BookOpen, Calendar, CheckCircle2, Clock, Download, FileText, FolderOpen, Layers, MessageSquare, TrendingUp, Users, ClipboardList } from 'lucide-react'
import { config } from '../../lib/config'

const tabs = ['Overview', 'Time & Attendance', 'Leave', 'Payroll', 'Performance', 'Team', 'Documents', 'Training']

function formatTime(value?: string | Date | null) {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(value?: string | Date | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function EmployeePortal() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [data, setData] = useState<any>(null)
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7))
  const [leaveForm, setLeaveForm] = useState({ type: 'Leave', dates: '', days: '1', reason: '' })

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const [dashboardRes, attendanceRes] = await Promise.all([
        fetch(`${config.apiUrl}/employee/dashboard`, { credentials: 'include', cache: 'no-store' }),
        fetch(`${config.apiUrl}/employee/attendance`, { credentials: 'include', cache: 'no-store' }),
      ])
      const dashboardData = await dashboardRes.json().catch(() => ({}))
      const attendanceData = await attendanceRes.json().catch(() => ({}))
      if (!dashboardRes.ok) throw new Error(dashboardData.error || 'Unable to load employee data')
      setData(dashboardData.data || null)
      setAttendanceLogs(attendanceRes.ok ? attendanceData.data || [] : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load employee data')
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

  const clockAction = async (action: 'clock_in' | 'clock_out') => {
    setActionLoading(true)
    setMessage('')
    try {
      const response = await fetch(`${config.apiUrl}/employee/attendance`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Unable to update attendance')
      setMessage(action === 'clock_in' ? 'Clock in saved' : 'Clock out saved')
      await loadDashboard()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update attendance')
    } finally {
      setActionLoading(false)
    }
  }

  const submitLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    setMessage('')
    try {
      const response = await fetch(`${config.apiUrl}/hrm/leave`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaveForm),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Unable to submit leave request')
      setMessage('Leave request submitted')
      setLeaveForm({ type: 'Leave', dates: '', days: '1', reason: '' })
      await loadDashboard()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit leave request')
    } finally {
      setActionLoading(false)
    }
  }

  const downloadPayslip = () => {
    window.open(`${config.apiUrl}/employee/payslip?period=${encodeURIComponent(period)}`, '_blank')
  }

  const currentTeam = data?.teams?.[0] || null
  const currentPayroll = data?.latestPayrollRow || null
  const recentProjects = data?.projects || []
  const documents = data?.documents || []
  const trainings = data?.trainings || []
  const tasks = data?.tasks || []

  const activeLogs = useMemo(() => attendanceLogs.slice(0, 30), [attendanceLogs])

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <SEOHead title="Employee Portal" description="Employee workspace with live attendance, leave requests, payroll, training, tasks, documents, and projects." keywords="employee portal, attendance, leave requests, payroll, training, documents, projects" canonical="/employee" />
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">{employee?.name || 'Employee Portal'}</h1>
            <p className="text-cream/40 text-sm">{employee ? `${employee.role} · ${employee.department} · ${employee.location}` : 'Live employee workspace'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => clockAction(today?.clockIn && !today?.clockOut ? 'clock_out' : 'clock_in')}
              disabled={actionLoading || !employee}
              className="btn-outline text-sm flex items-center gap-2 disabled:opacity-60"
            >
              <Clock size={14} /> {today?.clockIn && !today?.clockOut ? 'Clock Out' : 'Clock In'}
            </button>
            <Link to="/employee/requests" className="btn-primary text-sm">New Request</Link>
          </div>
        </div>

        {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-[8px] text-sm text-red-400">{error}</div>}
        {message && <div className="mb-6 p-3 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-[8px] text-sm text-[#C8FF00]">{message}</div>}

        <div className="flex gap-1 mb-8 overflow-x-auto pb-2 border-b border-glass-border">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-[4px] transition-all ${activeTab === tab ? 'text-[#C8FF00] border-b-2 border-[#C8FF00]' : 'text-cream/40 hover:text-cream'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-10 flex justify-center"><span className="text-cream/40">Loading employee workspace...</span></div>
        ) : (
          <>
            {activeTab === 'Overview' && (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Present Days', value: String(summary.presentDays || 0), icon: Calendar, change: `${monthlySummary.workingDays || 0} logs` },
                      { label: 'Task Completion', value: `${summary.taskCompletionRate || 0}%`, icon: CheckCircle2, change: `${tasks.filter((t: any) => t.status === 'done').length || 0} done` },
                      { label: 'Leave Requests', value: String(summary.pendingLeaves || 0), icon: ClipboardList, change: `${summary.approvedLeaves || 0} approved` },
                      { label: 'Performance', value: `${summary.performanceScore || 0}/5`, icon: TrendingUp, change: `${summary.department || 'General'}` },
                    ].map((stat, i) => (
                      <div key={i} className="p-4 bg-obsidian-2 border border-glass-border rounded-[12px]">
                        <stat.icon size={16} className="text-[#C8FF00] mb-2" />
                        <div className="font-display text-lg font-bold">{stat.value}</div>
                        <div className="text-[10px] text-cream/30">{stat.label}</div>
                        <div className="text-[10px] text-cream/20 mt-1">{stat.change}</div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-semibold">My Tasks</h3>
                      <Link to="/employee/tasks" className="text-xs text-[#C8FF00]">View All</Link>
                    </div>
                    <div className="space-y-3">
                      {tasks.length === 0 && <div className="text-sm text-cream/40">No assigned tasks.</div>}
                      {tasks.slice(0, 6).map((task: any, i: number) => (
                        <div key={task._id || i} className="flex items-center gap-4 p-3 bg-white/[0.02] rounded-[8px] hover:bg-white/[0.04] transition-all">
                          <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                          <div className="flex-1">
                            <div className="text-sm">{task.title}</div>
                            <div className="text-[10px] text-cream/30">{task.description}</div>
                          </div>
                          <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/[0.06] text-cream/40 capitalize">{task.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                    <h3 className="font-display font-semibold mb-4">Projects</h3>
                    <div className="space-y-3">
                      {recentProjects.length === 0 && <div className="text-sm text-cream/40">No projects assigned.</div>}
                      {recentProjects.slice(0, 5).map((project: any, i: number) => (
                        <div key={project.id || project._id || i} className="p-3 bg-white/[0.02] rounded-[8px]">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-medium">{project.name}</div>
                              <div className="text-[10px] text-cream/30">{project.client_name || project.client || 'Internal'} · {project.status || 'planning'}</div>
                            </div>
                            <span className="text-[10px] text-[#C8FF00]">{project.progress || 0}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] text-center">
                    <div className="w-16 h-16 bg-obsidian-3 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">{employee?.name ? employee.name.split(' ').map((part: string) => part[0]).slice(0, 2).join('') : 'ME'}</div>
                    <h4 className="font-display font-semibold">{employee?.name || 'Employee'}</h4>
                    <p className="text-xs text-cream/30 mb-3">{employee?.role || 'Employee'}</p>
                    <div className="text-[10px] text-cream/20 space-y-1">
                      <div>{employee?.department || 'General'} · {employee?.location || 'Remote'}</div>
                      <div>Employee ID: {employee?.employeeId || '—'}</div>
                      <div>Joined: {formatDate(employee?.startDate)}</div>
                    </div>
                    <Link to="/profile" className="block mt-4 text-xs text-[#C8FF00] hover:underline">Edit Profile</Link>
                  </div>

                  <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                    <h4 className="font-display font-semibold text-sm mb-4">Today</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-cream/40">Clock In</span><span>{formatTime(today?.clockIn)}</span></div>
                      <div className="flex justify-between"><span className="text-cream/40">Clock Out</span><span>{formatTime(today?.clockOut)}</span></div>
                      <div className="flex justify-between"><span className="text-cream/40">Hours</span><span className="text-[#C8FF00]">{today?.workedHours || 0}h</span></div>
                      <div className="flex justify-between"><span className="text-cream/40">Status</span><span>{today?.status || '—'}</span></div>
                    </div>
                  </div>

                  <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                    <h4 className="font-display font-semibold text-sm mb-4">Team</h4>
                    {currentTeam ? (
                      <div className="space-y-2 text-xs text-cream/40">
                        <div className="text-cream">{currentTeam.name}</div>
                        <div>{currentTeam.department || 'General'}</div>
                        <div>Lead: {currentTeam.lead || '—'}</div>
                        <div>Members: {Array.isArray(currentTeam.members) ? currentTeam.members.length : 0}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-cream/40">No team assigned yet.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Time & Attendance' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] text-center">
                    <Clock size={24} className="text-[#C8FF00] mx-auto mb-3" />
                    <div className="font-display text-2xl font-bold">{formatTime(today?.clockIn)}</div>
                    <div className="text-xs text-cream/30 mt-1">Clocked in today</div>
                    <button onClick={() => clockAction('clock_out')} disabled={actionLoading || !today?.clockIn || !!today?.clockOut} className="btn-primary w-full mt-4 text-sm disabled:opacity-60">Clock Out</button>
                  </div>
                  <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                    <h4 className="text-sm font-semibold mb-3">Today's Summary</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-cream/40">Clock In</span><span>{formatTime(today?.clockIn)}</span></div>
                      <div className="flex justify-between"><span className="text-cream/40">Clock Out</span><span>{formatTime(today?.clockOut)}</span></div>
                      <div className="flex justify-between"><span className="text-cream/40">Total Hours</span><span className="text-[#C8FF00]">{today?.workedHours || 0}h</span></div>
                      <div className="flex justify-between"><span className="text-cream/40">Late</span><span>{today?.late ? 'Yes' : 'No'}</span></div>
                    </div>
                  </div>
                  <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                    <h4 className="text-sm font-semibold mb-3">Monthly Summary</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-cream/40">Working Days</span><span>{monthlySummary.workingDays || 0}</span></div>
                      <div className="flex justify-between"><span className="text-cream/40">Present Days</span><span>{monthlySummary.presentDays || 0}</span></div>
                      <div className="flex justify-between"><span className="text-cream/40">Total Hours</span><span>{monthlySummary.totalHours || 0}h</span></div>
                      <div className="flex justify-between"><span className="text-cream/40">Late Days</span><span>{monthlySummary.lateDays || 0}</span></div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                  <h3 className="font-display font-semibold mb-4">Attendance Logs</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-cream/30 border-b border-glass-border">
                        <th className="text-left py-2">Date</th>
                        <th className="text-left py-2">Clock In</th>
                        <th className="text-left py-2">Clock Out</th>
                        <th className="text-left py-2">Hours</th>
                        <th className="text-left py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeLogs.length === 0 && (
                        <tr><td colSpan={5} className="py-8 text-center text-cream/40">No attendance logs yet.</td></tr>
                      )}
                      {activeLogs.map((row, i) => (
                        <tr key={row._id || i} className="border-b border-glass-border/50 text-cream/60">
                          <td className="py-3">{formatDate(row.date)}</td>
                          <td className="py-3">{formatTime(row.clockIn)}</td>
                          <td className="py-3">{formatTime(row.clockOut)}</td>
                          <td className="py-3">{row.workedHours || 0}h</td>
                          <td className="py-3"><span className="px-2 py-0.5 text-[10px] rounded-full bg-white/[0.06] text-cream/40 capitalize">{row.status || '—'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'Leave' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <form onSubmit={submitLeave} className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-3">
                  <h3 className="font-display font-semibold">Apply for Leave</h3>
                  <input value={leaveForm.dates} onChange={e => setLeaveForm({ ...leaveForm, dates: e.target.value })} placeholder="Dates e.g. 2026-07-28 to 2026-07-30" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00]" />
                  <div className="grid md:grid-cols-2 gap-3">
                    <input type="number" min="1" value={leaveForm.days} onChange={e => setLeaveForm({ ...leaveForm, days: e.target.value })} placeholder="Days" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00]" />
                    <input value={leaveForm.type} onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value })} placeholder="Leave type" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00]" />
                  </div>
                  <textarea value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} rows={4} placeholder="Reason" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00] resize-none" />
                  <button type="submit" disabled={actionLoading} className="btn-primary text-sm disabled:opacity-60">Submit Leave Request</button>
                </form>
                <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                  <h3 className="font-display font-semibold mb-4">My Leave Requests</h3>
                  <div className="space-y-3">
                    {data?.leaveRequests?.length === 0 && <div className="text-sm text-cream/40">No leave requests yet.</div>}
                    {data?.leaveRequests?.map((leave: any) => (
                      <div key={leave._id} className="p-4 bg-obsidian border border-glass-border rounded-[8px]">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <div className="text-sm font-medium">{leave.type}</div>
                          <span className={`px-2 py-1 rounded text-[10px] ${leave.status === 'approved' ? 'bg-green-500/20 text-green-400' : leave.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{leave.status}</span>
                        </div>
                        <div className="text-[10px] text-cream/30">{leave.dates} · {leave.days} day(s)</div>
                        <div className="text-[10px] text-cream/20 mt-1">{leave.reason || 'No reason provided'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Payroll' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { label: 'Base Salary', value: `₹${Math.round(Number(employee?.salary || 0) / 12).toLocaleString('en-IN')}` },
                    { label: 'Net Pay', value: `₹${Number(currentPayroll?.net || 0).toLocaleString('en-IN')}` },
                    { label: 'Next Payday', value: data?.latestPayroll?.period ? `${data.latestPayroll.period}-28` : '—' },
                    { label: 'Month Hours', value: `${summary.monthHours || 0}h` },
                  ].map((s, i) => (
                    <div key={i} className="p-4 bg-obsidian-2 border border-glass-border rounded-[12px]">
                      <div className="text-xs text-cream/30 mb-1">{s.label}</div>
                      <div className="font-display text-lg font-bold">{s.value}</div>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h3 className="font-display font-semibold">Payslip Download</h3>
                    <div className="flex items-center gap-2">
                      <input value={period} onChange={e => setPeriod(e.target.value)} className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm text-cream/70" />
                      <button onClick={downloadPayslip} className="btn-outline text-sm flex items-center gap-2"><Download size={14} /> Download</button>
                    </div>
                  </div>
                  <div className="text-sm text-cream/40">Latest payroll run: {data?.latestPayroll?.period || '—'}</div>
                </div>
              </div>
            )}

            {activeTab === 'Performance' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                  <h3 className="font-display font-semibold mb-4">Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-obsidian border border-glass-border rounded-[8px]"><div className="text-2xl font-bold">{summary.performanceScore || 0}</div><div className="text-[10px] text-cream/30">Average score</div></div>
                    <div className="p-4 bg-obsidian border border-glass-border rounded-[8px]"><div className="text-2xl font-bold">{summary.taskCompletionRate || 0}%</div><div className="text-[10px] text-cream/30">Task completion</div></div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {tasks.length === 0 && <div className="text-sm text-cream/40">No performance tasks yet.</div>}
                    {tasks.slice(0, 5).map((task: any) => (
                      <div key={task._id} className="p-3 bg-white/[0.02] rounded-[8px] text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span>{task.title}</span>
                          <span className="text-[10px] text-cream/30 capitalize">{task.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                  <h3 className="font-display font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-2 text-sm text-cream/40">
                    <div>Attendance logs: {attendanceLogs.length}</div>
                    <div>Approved leaves: {summary.approvedLeaves || 0}</div>
                    <div>Pending leaves: {summary.pendingLeaves || 0}</div>
                    <div>Current team: {currentTeam?.name || 'Unassigned'}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Team' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                  <h3 className="font-display font-semibold mb-4">Team</h3>
                  {data?.teams?.length === 0 ? (
                    <div className="text-sm text-cream/40">No team assigned.</div>
                  ) : (
                    <div className="space-y-3">
                      {data.teams.map((team: any) => (
                        <div key={team._id} className="p-4 bg-obsidian border border-glass-border rounded-[8px]">
                          <div className="text-sm font-medium">{team.name}</div>
                          <div className="text-[10px] text-cream/30">{team.department || 'General'} · Lead: {team.lead || '—'}</div>
                          <div className="text-[10px] text-cream/20 mt-1">{Array.isArray(team.members) ? team.members.join(', ') : 'No members'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                  <h3 className="font-display font-semibold mb-4">Projects</h3>
                  <div className="space-y-3">
                    {recentProjects.length === 0 && <div className="text-sm text-cream/40">No projects available.</div>}
                    {recentProjects.slice(0, 8).map((project: any) => (
                      <div key={project.id || project._id} className="p-4 bg-obsidian border border-glass-border rounded-[8px]">
                        <div className="text-sm font-medium">{project.name}</div>
                        <div className="text-[10px] text-cream/30">{project.client_name || 'Internal'} · {project.status || 'planning'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Documents' && (
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                <h3 className="font-display font-semibold mb-4">Documents</h3>
                <div className="space-y-3">
                  {documents.length === 0 && <div className="text-sm text-cream/40">No documents uploaded.</div>}
                  {documents.map((doc: any, i: number) => (
                    <div key={doc._id || doc.name || i} className="flex items-center justify-between gap-3 p-3 bg-white/[0.02] rounded-[8px]">
                      <div>
                        <div className="text-sm font-medium">{doc.name || doc.title || 'Document'}</div>
                        <div className="text-[10px] text-cream/30">{doc.status || 'available'}</div>
                      </div>
                      {doc.url ? <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-[#C8FF00]">Open</a> : <span className="text-xs text-cream/40">No file</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Training' && (
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                <h3 className="font-display font-semibold mb-4">Training</h3>
                <div className="space-y-3">
                  {trainings.length === 0 && <div className="text-sm text-cream/40">No training assigned.</div>}
                  {trainings.map((training: any) => (
                    <div key={training._id} className="p-4 bg-obsidian border border-glass-border rounded-[8px]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium">{training.title}</div>
                          <div className="text-[10px] text-cream/30">{training.dueDate || 'No due date'}</div>
                        </div>
                        <span className="text-xs text-[#C8FF00]">{training.progress || 0}%</span>
                      </div>
                      <div className="text-[10px] text-cream/20 mt-2">{training.description || 'No description'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
