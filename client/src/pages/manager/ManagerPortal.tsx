import { useEffect, useMemo, useState } from 'react'
import SEOHead from '../../components/seo/SEOHead'
import { Award, ClipboardList, Loader2, Plus, Search, TrendingUp, Users } from 'lucide-react'
import { config } from '../../lib/config'

export default function ManagerPortal() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'overview' | 'employees' | 'tasks' | 'teams' | 'training'>('overview')
  const [search, setSearch] = useState('')
  const [teamForm, setTeamForm] = useState({ name: '', department: 'General', lead: '', members: '', clients: '', projectIds: [] as string[], notes: '' })
  const [trainingForm, setTrainingForm] = useState({ title: '', description: '', assignedTo: '', assignedToName: '', assignedToEmail: '', dueDate: '', progress: '0' })
  const [taskForm, setTaskForm] = useState({ employeeId: '', title: '', description: '', dueDate: '', priority: 'medium', category: 'General' })
  const [performance, setPerformance] = useState<Record<string, string>>({})

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${config.apiUrl}/manager/overview`, { credentials: 'include', cache: 'no-store' })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Unable to load manager data')
      setData(result.data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load manager data')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const employees = data?.employees || []
  const tasks = data?.tasks || []
  const teams = data?.teams || []
  const projects = data?.projects || []
  const stats = data?.stats || {}

  const filteredEmployees = useMemo(() => {
    const term = search.toLowerCase()
    return employees.filter((employee: any) => `${employee.name} ${employee.role} ${employee.department} ${employee.email}`.toLowerCase().includes(term))
  }, [employees, search])

  const updatePerformance = async (id: string) => {
    const response = await fetch(`${config.apiUrl}/hrm/people`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, performanceScore: Number(performance[id] || 0) }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(result.error || 'Unable to update performance')
      return
    }
    setMessage('Performance updated')
    load()
  }

  const assignTask = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch(`${config.apiUrl}/hrm/tasks`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskForm),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(result.error || 'Unable to assign task')
      return
    }
    setMessage('Task assigned')
    setTaskForm({ employeeId: '', title: '', description: '', dueDate: '', priority: 'medium', category: 'General' })
    load()
  }

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch(`${config.apiUrl}/manager/teams`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...teamForm,
        members: teamForm.members.split(',').map(item => item.trim()).filter(Boolean),
        clients: teamForm.clients.split(',').map(item => item.trim()).filter(Boolean),
        projectIds: teamForm.projectIds,
        projects: projects.filter((project: any) => teamForm.projectIds.includes(String(project.id || project._id))).map((project: any) => project.name),
      }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(result.error || 'Unable to create team')
      return
    }
    setMessage('Team created')
    setTeamForm({ name: '', department: 'General', lead: '', members: '', clients: '', projectIds: [], notes: '' })
    load()
  }

  const createTraining = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch(`${config.apiUrl}/manager/trainings`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...trainingForm,
        progress: Number(trainingForm.progress || 0),
      }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(result.error || 'Unable to assign training')
      return
    }
    setMessage('Training assigned')
    setTrainingForm({ title: '', description: '', assignedTo: '', assignedToName: '', assignedToEmail: '', dueDate: '', progress: '0' })
    load()
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <SEOHead title="Manager Portal" description="Manage employees, performance, tasks, teams, and training." keywords="manager portal, employee management, team management, task assignment, performance reviews, training" canonical="/manager" />
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Manager Portal</h1>
            <p className="text-cream/40 text-sm">Live employee operations and team management.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} className="btn-outline text-sm">Refresh</button>
            <button onClick={() => setTab('employees')} className="btn-primary text-sm">Manage Employees</button>
          </div>
        </div>

        {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-[8px] text-sm text-red-400">{error}</div>}
        {message && <div className="mb-6 p-3 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-[8px] text-sm text-[#C8FF00]">{message}</div>}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Employees', value: stats.employees || 0, icon: Users },
            { label: 'Active', value: stats.activeEmployees || 0, icon: TrendingUp },
            { label: 'Teams', value: stats.teams || 0, icon: ClipboardList },
            { label: 'Avg Score', value: stats.avgPerformance || 0, icon: Award },
          ].map((card, index) => (
            <div key={index} className="p-4 bg-obsidian-2 border border-glass-border rounded-[12px]">
              <card.icon size={16} className="text-[#C8FF00] mb-2" />
              <div className="font-display text-lg font-bold">{card.value}</div>
              <div className="text-[10px] text-cream/30">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mb-8 overflow-x-auto pb-2 border-b border-glass-border">
          {(['overview', 'employees', 'tasks', 'teams', 'training'] as const).map(item => (
            <button key={item} onClick={() => setTab(item)} className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-[4px] transition-all ${tab === item ? 'text-[#C8FF00] border-b-2 border-[#C8FF00]' : 'text-cream/40 hover:text-cream'}`}>{item}</button>
          ))}
        </div>

        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#C8FF00]" /></div>
        ) : (
          <>
            {tab === 'overview' && (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold">Employees</h3>
                    <button onClick={() => setTab('employees')} className="text-xs text-[#C8FF00]">Open employee list</button>
                  </div>
                  <div className="space-y-3">
                    {employees.length === 0 && <div className="text-sm text-cream/40">No employees yet.</div>}
                    {employees.slice(0, 6).map((employee: any) => (
                      <div key={employee._id} className="p-3 bg-obsidian border border-glass-border rounded-[8px] flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium">{employee.name}</div>
                          <div className="text-[10px] text-cream/30">{employee.department} · {employee.role}</div>
                        </div>
                        <div className="text-xs text-[#C8FF00]">{employee.performanceScore || 0}/5</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                  <h3 className="font-display font-semibold mb-4">Projects</h3>
                  <div className="space-y-3">
                    {projects.length === 0 && <div className="text-sm text-cream/40">No projects available.</div>}
                    {projects.slice(0, 6).map((project: any) => (
                      <div key={project.id || project._id} className="p-3 bg-obsidian border border-glass-border rounded-[8px]">
                        <div className="text-sm font-medium">{project.name}</div>
                        <div className="text-[10px] text-cream/30">{project.client_name || 'Internal'} · {project.status || 'planning'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'employees' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees..." className="w-full pl-10 pr-4 py-3 bg-obsidian-2 border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00]" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredEmployees.map((employee: any) => (
                    <div key={employee._id} className="p-5 bg-obsidian-2 border border-glass-border rounded-[12px]">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">{employee.name}</div>
                          <div className="text-[10px] text-cream/30">{employee.department} · {employee.role}</div>
                          <div className="text-[10px] text-cream/20 mt-1">{employee.email}</div>
                        </div>
                        <span className="text-xs text-[#C8FF00]">{employee.status || 'active'}</span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-cream/30 mb-1">Performance</label>
                          <input value={performance[String(employee._id)] || String(employee.performanceScore || 0)} onChange={e => setPerformance(prev => ({ ...prev, [String(employee._id)]: e.target.value }))} className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
                        </div>
                        <div className="flex items-end">
                          <button onClick={() => updatePerformance(String(employee._id))} className="w-full btn-outline text-sm">Save</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'tasks' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <form onSubmit={assignTask} className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-3">
                  <h3 className="font-display font-semibold">Assign Task</h3>
                  <select value={taskForm.employeeId} onChange={e => setTaskForm({ ...taskForm, employeeId: e.target.value })} className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm">
                    <option value="">Select employee</option>
                    {employees.map((employee: any) => <option key={employee._id} value={employee._id}>{employee.name} - {employee.department}</option>)}
                  </select>
                  <input required value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Task title" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
                  <input value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} type="date" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
                  <div className="grid md:grid-cols-2 gap-3">
                    <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })} className="px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <input value={taskForm.category} onChange={e => setTaskForm({ ...taskForm, category: e.target.value })} placeholder="Category" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
                  </div>
                  <textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows={4} placeholder="Task details" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm resize-none" />
                  <button type="submit" className="btn-primary text-sm">Save Task</button>
                </form>
                <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                  <h3 className="font-display font-semibold mb-4">Recent Tasks</h3>
                  <div className="space-y-3">
                    {tasks.length === 0 && <div className="text-sm text-cream/40">No tasks assigned.</div>}
                    {tasks.slice(0, 10).map((task: any) => (
                      <div key={task._id} className="p-4 bg-obsidian border border-glass-border rounded-[8px]">
                        <div className="text-sm font-medium">{task.title}</div>
                        <div className="text-[10px] text-cream/30">{task.assigneeName || 'Unassigned'} · {task.category || 'General'}</div>
                        <div className="text-[10px] text-cream/20 mt-1">{task.status || 'todo'} · due {task.dueDate || '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'teams' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <form onSubmit={createTeam} className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-3">
                  <h3 className="font-display font-semibold">Create Team</h3>
                  <input required value={teamForm.name} onChange={e => setTeamForm({ ...teamForm, name: e.target.value })} placeholder="Team name" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
                  <input value={teamForm.department} onChange={e => setTeamForm({ ...teamForm, department: e.target.value })} placeholder="Department" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
                  <input value={teamForm.lead} onChange={e => setTeamForm({ ...teamForm, lead: e.target.value })} placeholder="Team lead" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
                  <input value={teamForm.members} onChange={e => setTeamForm({ ...teamForm, members: e.target.value })} placeholder="Employee ids, names, or emails separated by comma" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
                  <input value={teamForm.clients} onChange={e => setTeamForm({ ...teamForm, clients: e.target.value })} placeholder="Client emails separated by comma" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
                  <select multiple value={teamForm.projectIds} onChange={e => setTeamForm({ ...teamForm, projectIds: Array.from(e.target.selectedOptions).map(option => option.value) })} className="w-full min-h-[120px] px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm">
                    {projects.map((project: any) => <option key={project.id || project._id} value={String(project.id || project._id)}>{project.name} - {project.client_name || project.clientName || project.businessName || 'Client'}</option>)}
                  </select>
                  <textarea value={teamForm.notes} onChange={e => setTeamForm({ ...teamForm, notes: e.target.value })} rows={3} placeholder="Notes" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm resize-none" />
                  <button type="submit" className="btn-primary text-sm">Save Team</button>
                </form>
                <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                  <h3 className="font-display font-semibold mb-4">Teams</h3>
                  <div className="space-y-3">
                    {teams.length === 0 && <div className="text-sm text-cream/40">No teams created.</div>}
                    {teams.map((team: any) => (
                      <div key={team._id} className="p-4 bg-obsidian border border-glass-border rounded-[8px]">
                        <div className="text-sm font-medium">{team.name}</div>
                        <div className="text-[10px] text-cream/30">{team.department} · Lead: {team.lead || '—'}</div>
                        <div className="text-[10px] text-cream/20 mt-1">Members: {Array.isArray(team.members) ? team.members.length : 0}</div>
                        <div className="text-[10px] text-cream/20 mt-1">Clients: {Array.isArray(team.clients) ? team.clients.join(', ') : '—'}</div>
                        <div className="text-[10px] text-cream/20 mt-1">Projects: {Array.isArray(team.projects) && team.projects.length ? team.projects.join(', ') : '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'training' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <form onSubmit={createTraining} className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-3">
                  <h3 className="font-display font-semibold">Assign Training</h3>
                  <input required value={trainingForm.title} onChange={e => setTrainingForm({ ...trainingForm, title: e.target.value })} placeholder="Training title" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
                  <textarea value={trainingForm.description} onChange={e => setTrainingForm({ ...trainingForm, description: e.target.value })} rows={4} placeholder="Description" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm resize-none" />
                  <div className="grid md:grid-cols-2 gap-3">
                    <input value={trainingForm.assignedToName} onChange={e => setTrainingForm({ ...trainingForm, assignedToName: e.target.value })} placeholder="Employee name" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
                    <input value={trainingForm.assignedToEmail} onChange={e => setTrainingForm({ ...trainingForm, assignedToEmail: e.target.value })} placeholder="Employee email" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
                  </div>
                  <input value={trainingForm.assignedTo} onChange={e => setTrainingForm({ ...trainingForm, assignedTo: e.target.value })} placeholder="Employee id" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
                  <div className="grid md:grid-cols-2 gap-3">
                    <input type="date" value={trainingForm.dueDate} onChange={e => setTrainingForm({ ...trainingForm, dueDate: e.target.value })} className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
                    <input type="number" min="0" max="100" value={trainingForm.progress} onChange={e => setTrainingForm({ ...trainingForm, progress: e.target.value })} className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
                  </div>
                  <button type="submit" className="btn-primary text-sm">Save Training</button>
                </form>
                <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                  <h3 className="font-display font-semibold mb-4">Training Assignments</h3>
                  <div className="space-y-3">
                    {data?.trainings?.length === 0 && <div className="text-sm text-cream/40">No training items assigned.</div>}
                    {(data?.trainings || []).map((item: any) => (
                      <div key={item._id} className="p-4 bg-obsidian border border-glass-border rounded-[8px]">
                        <div className="text-sm font-medium">{item.title}</div>
                        <div className="text-[10px] text-cream/30">{item.assignedToName || item.assignedToEmail || 'Unassigned'}</div>
                        <div className="text-[10px] text-cream/20 mt-1">{item.progress || 0}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
