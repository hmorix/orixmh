import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import SEOHead from "../../components/seo/SEOHead"
import {
  Users,
  ClipboardList,
  TrendingUp,
  Award,
  BookOpen,
  FolderOpen,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  Building,
  Target,
  Sparkles,
  ArrowLeft,
  Calendar,
  Layers,
  FileText
} from "lucide-react"
import { config } from "../../lib/config"

type TabType = "overview" | "teams" | "tasks" | "performance" | "training" | "projects"

export default function ManagerPortal() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [tab, setTab] = useState<TabType>("overview")
  const [search, setSearch] = useState("")

  // Team Form
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [teamForm, setTeamForm] = useState({
    name: "",
    department: "Engineering",
    lead: "",
    members: "",
    clients: "",
    projectIds: [] as string[],
    notes: ""
  })

  // Task / Ticket Delegation Form
  const [taskForm, setTaskForm] = useState({
    employeeId: "",
    title: "",
    description: "",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    priority: "medium",
    category: "Feature"
  })

  // Training / LMS Form
  const [trainingForm, setTrainingForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    assignedToName: "",
    assignedToEmail: "",
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    progress: "0"
  })

  // Performance Rating State
  const [performance, setPerformance] = useState<Record<string, string>>({})

  const load = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const response = await fetch(`${config.apiUrl}/manager/overview`, {
        credentials: "include",
        cache: "no-store"
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "Unable to load manager operational data")
      setData(result.data || null)
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Unable to load manager operations"
      })
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
  const trainings = data?.trainings || []

  const filteredEmployees = useMemo(() => {
    const term = search.toLowerCase()
    return employees.filter((emp: any) =>
      `${emp.name} ${emp.role} ${emp.department} ${emp.email}`
        .toLowerCase()
        .includes(term)
    )
  }, [employees, search])

  const updatePerformance = async (id: string) => {
    const score = Number(performance[id] || 0)
    const response = await fetch(`${config.apiUrl}/hrm/people`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, performanceScore: score })
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage({ type: "error", text: result.error || "Unable to update appraisal score" })
      return
    }
    setMessage({ type: "success", text: `Appraisal score (${score}/5) saved for employee.` })
    load()
  }

  const assignTask = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch(`${config.apiUrl}/hrm/tasks`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskForm)
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage({ type: "error", text: result.error || "Unable to delegate task" })
      return
    }
    setMessage({ type: "success", text: `Task "${taskForm.title}" delegated successfully.` })
    setTaskForm({
      employeeId: "",
      title: "",
      description: "",
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      priority: "medium",
      category: "Feature"
    })
    load()
  }

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch(`${config.apiUrl}/manager/teams`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...teamForm,
        members: teamForm.members.split(",").map(item => item.trim()).filter(Boolean),
        clients: teamForm.clients.split(",").map(item => item.trim()).filter(Boolean),
        projectIds: teamForm.projectIds,
        projects: projects
          .filter((project: any) => teamForm.projectIds.includes(String(project.id || project._id)))
          .map((project: any) => project.name)
      })
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage({ type: "error", text: result.error || "Unable to assemble team" })
      return
    }
    setMessage({ type: "success", text: `Team "${teamForm.name}" created and assigned projects.` })
    setTeamForm({
      name: "",
      department: "Engineering",
      lead: "",
      members: "",
      clients: "",
      projectIds: [],
      notes: ""
    })
    setShowTeamModal(false)
    load()
  }

  const createTraining = async (e: React.FormEvent) => {
    e.preventDefault()
    const selectedEmp = employees.find((emp: any) => String(emp._id) === trainingForm.assignedTo)
    const payload = {
      ...trainingForm,
      assignedToName: selectedEmp?.name || trainingForm.assignedToName,
      assignedToEmail: selectedEmp?.email || trainingForm.assignedToEmail,
      progress: Number(trainingForm.progress || 0)
    }

    const response = await fetch(`${config.apiUrl}/manager/trainings`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage({ type: "error", text: result.error || "Unable to assign LMS training" })
      return
    }
    setMessage({ type: "success", text: `Training module "${trainingForm.title}" enrolled.` })
    setTrainingForm({
      title: "",
      description: "",
      assignedTo: "",
      assignedToName: "",
      assignedToEmail: "",
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      progress: "0"
    })
    load()
  }

  const STATS_DATA = [
    { label: "Total Team Staff", val: stats.employees || employees.length || 0, icon: Users, color: "#C8FF00" },
    { label: "Active On Duty", val: stats.activeEmployees || employees.filter((e: any) => e.status === "active").length || 0, icon: UserCheck, color: "#4ade80" },
    { label: "Project Teams", val: stats.teams || teams.length || 0, icon: Layers, color: "#60a5fa" },
    { label: "Active Client Projects", val: projects.length || 0, icon: FolderOpen, color: "#c084fc" },
    { label: "Delegated Tasks", val: tasks.length || 0, icon: ClipboardList, color: "#fb923c" },
    { label: "Avg Performance Score", val: `${stats.avgPerformance || 4.6}/5`, icon: Award, color: "#facc15" }
  ]

  return (
    <div className="pt-28 pb-20 min-h-screen bg-obsidian text-cream">
      <SEOHead
        title="Manager Operations & Delegation Portal | HMorix"
        description="Enterprise manager operations — assemble project teams, delegate engineering sprints, review performance scores, and track client deliverables."
        keywords="manager portal, project delegation, engineering manager, team workload, performance reviews, OKRs"
        canonical="/manager"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Header Ribbon */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-full text-xs font-semibold text-[#C8FF00] mb-2">
              <Sparkles size={12} /> Manager Command Center
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
              Workforce Operations & Delivery
            </h1>
            <p className="text-cream/50 text-sm mt-1">
              Project team orchestration &bull; Sprint delegation &bull; Performance appraisals &bull; Client alignment
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowTeamModal(true)}
              className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3.5"
            >
              <Plus size={13} /> Assemble Team
            </button>
            <button
              onClick={() => setTab("tasks")}
              className="btn-outline text-xs flex items-center gap-1.5 py-2 px-3.5"
            >
              <ClipboardList size={13} /> Delegate Task
            </button>
            <button
              onClick={load}
              className="btn-outline text-xs flex items-center gap-1.5 py-2 px-3.5"
            >
              <Clock size={13} /> Refresh Ops
            </button>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-[12px] border text-sm flex items-center gap-3 ${
              message.type === "success"
                ? "bg-[#C8FF00]/10 border-[#C8FF00]/30 text-[#C8FF00]"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <div>{message.text}</div>
          </div>
        )}

        {/* KPI Ribbons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          {STATS_DATA.map(s => (
            <div
              key={s.label}
              className="p-4 bg-obsidian-2 border border-glass-border rounded-[14px] hover:border-glass-border/80 transition-all"
            >
              <div className="flex items-center justify-between">
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <div
                className="font-display text-2xl sm:text-3xl font-bold mt-2"
                style={{ color: s.color }}
              >
                {loading ? "—" : s.val}
              </div>
              <div className="text-[11px] text-cream/40 mt-1 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 mb-8 overflow-x-auto pb-1 border-b border-glass-border/60">
          {[
            { id: "overview", label: "Executive Overview", icon: Target },
            { id: "teams", label: "Project Teams", icon: Layers },
            { id: "tasks", label: "Task Delegation", icon: ClipboardList },
            { id: "performance", label: "Performance & OKRs", icon: Award },
            { id: "training", label: "LMS & Skill Upskilling", icon: BookOpen },
            { id: "projects", label: "Client Projects", icon: FolderOpen }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-4 py-2.5 rounded-t-[10px] text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border-t border-x ${
                tab === t.id
                  ? "bg-obsidian-2 border-glass-border text-[#C8FF00] border-b-2 border-b-[#C8FF00]"
                  : "bg-transparent border-transparent text-cream/50 hover:text-cream"
              }`}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {tab === "overview" && (
          <div className="space-y-8">
            {/* Quick Action Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div
                onClick={() => setShowTeamModal(true)}
                className="p-5 bg-obsidian-2 border border-glass-border hover:border-[#C8FF00]/40 rounded-[14px] cursor-pointer transition-all flex items-start gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-[10px] bg-[#C8FF00]/10 text-[#C8FF00] flex items-center justify-center group-hover:bg-[#C8FF00]/20 transition-all flex-shrink-0">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm text-cream">Assemble Project Team</h3>
                  <p className="text-xs text-cream/50 mt-0.5">Group engineers & link to client deliverables</p>
                </div>
              </div>

              <div
                onClick={() => setTab("tasks")}
                className="p-5 bg-obsidian-2 border border-glass-border hover:border-[#C8FF00]/40 rounded-[14px] cursor-pointer transition-all flex items-start gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-[10px] bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-500/20 transition-all flex-shrink-0">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm text-cream">Delegate Sprint Task</h3>
                  <p className="text-xs text-cream/50 mt-0.5">Route client tickets & assign deliverables</p>
                </div>
              </div>

              <div
                onClick={() => setTab("performance")}
                className="p-5 bg-obsidian-2 border border-glass-border hover:border-[#C8FF00]/40 rounded-[14px] cursor-pointer transition-all flex items-start gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-[10px] bg-yellow-500/10 text-yellow-400 flex items-center justify-center group-hover:bg-yellow-500/20 transition-all flex-shrink-0">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm text-cream">Score Employee OKRs</h3>
                  <p className="text-xs text-cream/50 mt-0.5">Quarterly appraisals & performance review</p>
                </div>
              </div>
            </div>

            {/* Split Row: Teams Snapshot & Active Projects */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Teams Snapshot */}
              <div className="bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden shadow-lg">
                <div className="p-4 sm:p-5 border-b border-glass-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-[#C8FF00]" />
                    <h2 className="font-display font-semibold text-sm">Active Engineering Teams</h2>
                  </div>
                  <button onClick={() => setTab("teams")} className="text-xs text-[#C8FF00] hover:underline">
                    View All ({teams.length})
                  </button>
                </div>
                <div className="divide-y divide-glass-border/50">
                  {teams.length === 0 ? (
                    <div className="p-8 text-center text-cream/40 text-xs">
                      No project teams assembled yet. Click &quot;Assemble Team&quot; above.
                    </div>
                  ) : (
                    teams.slice(0, 4).map((team: any, i: number) => (
                      <div key={team._id || i} className="p-4 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-sm text-cream">{team.name}</div>
                          <div className="text-xs text-cream/50 mt-0.5">
                            Lead: <span className="text-[#C8FF00]">{team.lead || "Unassigned"}</span> &bull; {team.members?.length || 0} Members
                          </div>
                        </div>
                        <span className="text-xs px-2.5 py-0.5 bg-white/[0.04] border border-glass-border rounded-full text-cream/60">
                          {team.department || "Engineering"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Client Projects Snapshot */}
              <div className="bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden shadow-lg">
                <div className="p-4 sm:p-5 border-b border-glass-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen size={16} className="text-[#C8FF00]" />
                    <h2 className="font-display font-semibold text-sm">Active Client Projects</h2>
                  </div>
                  <button onClick={() => setTab("projects")} className="text-xs text-[#C8FF00] hover:underline">
                    View All ({projects.length})
                  </button>
                </div>
                <div className="divide-y divide-glass-border/50">
                  {projects.length === 0 ? (
                    <div className="p-8 text-center text-cream/40 text-xs">
                      No active client projects currently registered.
                    </div>
                  ) : (
                    projects.slice(0, 4).map((proj: any, i: number) => (
                      <div key={proj.id || proj._id || i} className="p-4 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-sm text-cream">{proj.name}</div>
                          <div className="text-xs text-cream/50 mt-0.5">
                            Client: <span className="text-cream/80">{proj.client_name || "Enterprise"}</span>
                          </div>
                        </div>
                        <span className="text-xs px-2.5 py-0.5 bg-green-500/20 text-green-400 rounded-full font-semibold capitalize">
                          {proj.status || "in_progress"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PROJECT TEAMS ================= */}
        {tab === "teams" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-display font-semibold text-base">All Engineering Teams & Rosters</h2>
              <button onClick={() => setShowTeamModal(true)} className="btn-primary text-xs py-1.5 px-3">
                + Assemble New Team
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.length === 0 ? (
                <div className="col-span-3 p-12 bg-obsidian-2 border border-glass-border rounded-[14px] text-center text-cream/40">
                  No teams assembled yet. Click &quot;Assemble New Team&quot; to organize workforce.
                </div>
              ) : (
                teams.map((team: any, i: number) => (
                  <div key={team._id || i} className="p-5 bg-obsidian-2 border border-glass-border rounded-[14px] space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display font-semibold text-base text-cream">{team.name}</h3>
                        <span className="text-[11px] text-cream/40">{team.department}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] font-bold">
                        {team.members?.length || 0} Staff
                      </span>
                    </div>

                    <div className="p-3 bg-obsidian rounded-[8px] border border-glass-border/50 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-cream/40">Team Lead:</span>
                        <span className="font-semibold text-[#C8FF00]">{team.lead || "Unassigned"}</span>
                      </div>
                      {team.projects && team.projects.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-cream/40">Assigned Deliverables:</span>
                          <span className="text-cream/80 truncate max-w-[160px]">{team.projects.join(", ")}</span>
                        </div>
                      )}
                    </div>

                    {team.members && team.members.length > 0 && (
                      <div>
                        <div className="text-[10px] text-cream/40 uppercase tracking-wider mb-1.5 font-mono">Members:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {team.members.map((m: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-white/[0.04] border border-glass-border rounded text-[11px] text-cream/70">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: TASK DELEGATION ================= */}
        {tab === "tasks" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Task Delegation Form */}
            <form onSubmit={assignTask} className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-glass-border">
                <ClipboardList size={16} className="text-[#C8FF00]" />
                <h3 className="font-display font-semibold text-base">Delegate New Sprint Task</h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-cream/70 font-medium">Assign To Staff Member *</label>
                <select
                  required
                  value={taskForm.employeeId}
                  onChange={e => setTaskForm({ ...taskForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                >
                  <option value="">Select team member</option>
                  {employees.map((emp: any) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} &bull; {emp.role} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-cream/70 font-medium">Task Deliverable Title *</label>
                <input
                  required
                  value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Build Auth Middleware & Redis Cache"
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-cream/70 font-medium">Task Scope & Details</label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Detailed specifications, acceptance criteria, Figma links..."
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Critical / Urgent</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Target Deadline</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  />
                </div>
              </div>

              <button type="submit" className="w-full btn-primary text-xs py-2.5 mt-2">
                Delegate Task to Staff &rarr;
              </button>
            </form>

            {/* Live Tasks Register */}
            <div className="lg:col-span-2 bg-obsidian-2 border border-glass-border rounded-[16px] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-glass-border">
                <h3 className="font-display font-semibold text-base">Delegated Tasks Register</h3>
                <span className="text-xs text-cream/50">{tasks.length} Active Tasks</span>
              </div>

              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="p-12 text-center text-cream/40 bg-obsidian rounded-[10px] border border-glass-border">
                    No active tasks currently assigned.
                  </div>
                ) : (
                  tasks.map((task: any) => (
                    <div key={task._id} className="p-4 bg-obsidian border border-glass-border rounded-[10px] flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-cream">{task.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            task.priority === "urgent" || task.priority === "high"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}>
                            {task.priority || "normal"}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-cream/50 mt-1 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-cream/40">
                          <span>Assigned: <strong className="text-cream/80">{task.employeeName || task.assignedTo || "Staff"}</strong></span>
                          <span>&bull;</span>
                          <span>Due: <strong className="text-[#C8FF00]">{task.dueDate || "No deadline"}</strong></span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-white/[0.04] border border-glass-border rounded-full text-xs font-semibold text-cream/70 capitalize">
                        {task.status || "pending"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: PERFORMANCE & OKRs ================= */}
        {tab === "performance" && (
          <div className="bg-obsidian-2 border border-glass-border rounded-[16px] p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-glass-border">
              <div>
                <h2 className="font-display font-semibold text-base">Quarterly Staff Performance Scoring</h2>
                <p className="text-xs text-cream/50 mt-0.5">Rate deliverables, adherence, and leadership on a 1.0 to 5.0 scale.</p>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search staff..."
                  className="pl-9 pr-4 py-1.5 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00] w-64"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((emp: any) => (
                <div key={emp._id} className="p-5 bg-obsidian border border-glass-border rounded-[12px] space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-cream">{emp.name}</h4>
                      <p className="text-xs text-cream/40">{emp.role} &bull; {emp.department}</p>
                    </div>
                    <span className="font-display text-base font-bold text-[#C8FF00]">
                      {emp.performanceScore || 4.5}/5.0
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-glass-border/50">
                    <label className="text-[11px] text-cream/60 font-medium">Update Appraisal Score (1-5)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={performance[String(emp._id)] !== undefined ? performance[String(emp._id)] : String(emp.performanceScore || 4.5)}
                        onChange={e => setPerformance(prev => ({ ...prev, [String(emp._id)]: e.target.value }))}
                        className="w-24 px-3 py-1.5 bg-obsidian-2 border border-glass-border rounded-[6px] text-xs text-cream font-bold outline-none focus:border-[#C8FF00]"
                      />
                      <button
                        onClick={() => updatePerformance(String(emp._id))}
                        className="btn-primary text-xs py-1.5 px-3 flex-1"
                      >
                        Save Score
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: TRAINING & LMS ================= */}
        {tab === "training" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <form onSubmit={createTraining} className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-glass-border">
                <BookOpen size={16} className="text-[#C8FF00]" />
                <h3 className="font-display font-semibold text-base">Assign LMS Training Module</h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-cream/70 font-medium">Staff Member *</label>
                <select
                  required
                  value={trainingForm.assignedTo}
                  onChange={e => setTrainingForm({ ...trainingForm, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                >
                  <option value="">Select staff</option>
                  {employees.map((emp: any) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-cream/70 font-medium">Course / Certification Title *</label>
                <input
                  required
                  value={trainingForm.title}
                  onChange={e => setTrainingForm({ ...trainingForm, title: e.target.value })}
                  placeholder="e.g. Distributed Systems & Redis Caching"
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-cream/70 font-medium">Syllabus / Resources Link</label>
                <textarea
                  rows={3}
                  value={trainingForm.description}
                  onChange={e => setTrainingForm({ ...trainingForm, description: e.target.value })}
                  placeholder="Course outline, documentation links, lab tasks..."
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-cream/70 font-medium">Completion Target Date</label>
                <input
                  type="date"
                  value={trainingForm.dueDate}
                  onChange={e => setTrainingForm({ ...trainingForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                />
              </div>

              <button type="submit" className="w-full btn-primary text-xs py-2.5 mt-2">
                Enroll Employee &rarr;
              </button>
            </form>

            <div className="lg:col-span-2 bg-obsidian-2 border border-glass-border rounded-[16px] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-glass-border">
                <h3 className="font-display font-semibold text-base">Active Training Enrollments</h3>
                <span className="text-xs text-cream/50">{trainings.length} In-Progress</span>
              </div>

              <div className="space-y-3">
                {trainings.length === 0 ? (
                  <div className="p-12 text-center text-cream/40 bg-obsidian rounded-[10px] border border-glass-border">
                    No active LMS training modules assigned.
                  </div>
                ) : (
                  trainings.map((tr: any) => (
                    <div key={tr._id} className="p-4 bg-obsidian border border-glass-border rounded-[10px] space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-sm text-cream">{tr.title}</h4>
                          <p className="text-xs text-cream/50 mt-0.5">
                            Enrolled: <strong className="text-cream/80">{tr.assignedToName || "Staff"}</strong> &bull; Due: {tr.dueDate}
                          </p>
                        </div>
                        <span className="font-mono text-xs text-[#C8FF00] font-bold">{tr.progress || 0}% Complete</span>
                      </div>
                      <div className="h-1.5 bg-obsidian-2 rounded-full overflow-hidden">
                        <div className="h-full bg-[#C8FF00] rounded-full" style={{ width: `${tr.progress || 0}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: CLIENT PROJECTS ================= */}
        {tab === "projects" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.length === 0 ? (
              <div className="col-span-3 p-12 bg-obsidian-2 border border-glass-border rounded-[14px] text-center text-cream/40">
                No active client projects on record.
              </div>
            ) : (
              projects.map((proj: any) => (
                <div key={proj.id || proj._id} className="p-5 bg-obsidian-2 border border-glass-border rounded-[14px] space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-semibold text-base text-cream">{proj.name}</h3>
                      <p className="text-xs text-cream/50">Client: {proj.client_name || "Enterprise Partner"}</p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[10px] font-bold capitalize">
                      {proj.status || "active"}
                    </span>
                  </div>
                  {proj.description && (
                    <p className="text-xs text-cream/60 line-clamp-2">{proj.description}</p>
                  )}
                  <div className="pt-3 border-t border-glass-border/50 flex justify-between text-xs text-cream/40">
                    <span>Budget: <strong className="text-cream/80">₹{Number(proj.budget || 50000).toLocaleString("en-IN")}</strong></span>
                    <span>Timeline: <strong className="text-[#C8FF00]">{proj.deadline || "On Track"}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================= MODAL: ASSEMBLE TEAM ================= */}
        {showTeamModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-obsidian-2 border border-glass-border rounded-[18px] max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-glass-border">
                <h3 className="font-display font-semibold text-lg text-cream flex items-center gap-2">
                  <Layers size={18} className="text-[#C8FF00]" /> Assemble New Project Team
                </h3>
                <button onClick={() => setShowTeamModal(false)} className="text-cream/40 hover:text-cream text-sm">
                  ✕
                </button>
              </div>

              <form onSubmit={createTeam} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Team Name *</label>
                    <input
                      required
                      value={teamForm.name}
                      onChange={e => setTeamForm({ ...teamForm, name: e.target.value })}
                      placeholder="e.g. Core Engine Pod"
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Department</label>
                    <select
                      value={teamForm.department}
                      onChange={e => setTeamForm({ ...teamForm, department: e.target.value })}
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    >
                      {["Engineering", "Design & UX", "AI & ML", "QA & Testing", "Cloud & DevOps"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Team Lead (Name/Email)</label>
                    <input
                      value={teamForm.lead}
                      onChange={e => setTeamForm({ ...teamForm, lead: e.target.value })}
                      placeholder="e.g. harsh.sharma@hmorix.com"
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Member Names (Comma separated)</label>
                    <input
                      value={teamForm.members}
                      onChange={e => setTeamForm({ ...teamForm, members: e.target.value })}
                      placeholder="Rahul Verma, Priya Singh, Amit"
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Link to Client Projects (Hold Ctrl/Cmd for multi-select)</label>
                  <select
                    multiple
                    value={teamForm.projectIds}
                    onChange={e => {
                      const selected = Array.from(e.target.selectedOptions, opt => opt.value)
                      setTeamForm({ ...teamForm, projectIds: selected })
                    }}
                    className="w-full h-24 px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  >
                    {projects.map((p: any) => (
                      <option key={p.id || p._id} value={String(p.id || p._id)}>
                        {p.name} ({p.client_name || "Internal"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-glass-border">
                  <button
                    type="button"
                    onClick={() => setShowTeamModal(false)}
                    className="btn-outline text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-6">
                    Create & Deploy Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
