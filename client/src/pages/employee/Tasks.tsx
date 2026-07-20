import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, Circle, Clock, Loader2, Plus } from 'lucide-react'
import { config } from '../../lib/config'

type Task = {
  _id?: string
  id?: string | number
  title: string
  description: string
  dueDate?: string
  due?: string
  priority: string
  status: string
  category: string
  assigneeName?: string
  performanceScore?: number | null
  feedback?: string
}

type Employee = { _id: string; name: string; department: string; role: string }

export default function Tasks() {
  const [filter, setFilter] = useState('all')
  const [tasks, setTasks] = useState<Task[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ title: '', description: '', employeeId: '', dueDate: '', priority: 'medium', category: 'General' })

  const load = async () => {
    setLoading(true)
    try {
      const [taskRes, peopleRes] = await Promise.all([
        fetch(`${config.apiUrl}/hrm/tasks`, { credentials: 'include', cache: 'no-store' }),
        fetch(`${config.apiUrl}/hrm/people`, { credentials: 'include', cache: 'no-store' }),
      ])
      const taskData = await taskRes.json().catch(() => ({}))
      const peopleData = await peopleRes.json().catch(() => ({}))
      if (!taskRes.ok) throw new Error(taskData.error || 'Unable to load tasks')
      setTasks(taskData.data || [])
      setEmployees(peopleData.data || [])
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => tasks.filter(t => filter === 'all' || t.status === filter), [tasks, filter])
  const counts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  }

  const assignTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    const response = await fetch(`${config.apiUrl}/hrm/tasks`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(data.error || 'Unable to assign task')
      return
    }
    setTasks(prev => [data.data, ...prev])
    setForm({ title: '', description: '', employeeId: '', dueDate: '', priority: 'medium', category: 'General' })
    setShowForm(false)
    setMessage('Task assigned successfully')
  }

  const updateTask = async (task: Task, status: string) => {
    const id = task._id || task.id
    if (!id) return
    const performanceScore = status === 'done' ? Number(prompt('HR performance score for this task (1-5)', String(task.performanceScore || 4)) || 4) : undefined
    const feedback = status === 'done' ? prompt('HR feedback', task.feedback || 'Submitted and scored by HR.') || '' : ''
    const response = await fetch(`${config.apiUrl}/hrm/tasks`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, performanceScore, feedback }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(data.error || 'Unable to update task')
      return
    }
    setTasks(prev => prev.map(item => (item._id || item.id) === id ? data.data : item))
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Employee Tasks</h1>
            <p className="text-cream/40 text-sm">Assign work, track deadlines, submit tasks, and calculate performance.</p>
          </div>
          <button onClick={() => setShowForm(v => !v)} className="btn-primary text-sm flex items-center gap-2"><Plus size={14} />Assign Task</button>
        </div>

        {message && <div className="mb-6 p-3 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-[8px] text-sm text-[#C8FF00]">{message}</div>}

        {showForm && (
          <form onSubmit={assignTask} className="grid md:grid-cols-3 gap-3 mb-8 p-5 bg-obsidian-2 border border-glass-border rounded-[12px]">
            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <select required value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]">
              <option value="">Assign to employee</option>
              {employees.map(employee => <option key={employee._id} value={employee._id}>{employee.name} - {employee.department}</option>)}
            </select>
            <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Category" className="px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00]" />
            <button type="submit" className="btn-primary text-sm">Save Task</button>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Task details" className="md:col-span-3 px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm outline-none focus:border-[#C8FF00] resize-none" />
          </form>
        )}

        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: `All (${counts.all})` },
            { key: 'todo', label: `To Do (${counts.todo})` },
            { key: 'in_progress', label: `In Progress (${counts.in_progress})` },
            { key: 'done', label: `Done (${counts.done})` },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 text-xs rounded-full transition-all ${filter === f.key ? 'bg-[#C8FF00] text-obsidian' : 'bg-white/[0.04] text-cream/50 hover:text-cream'}`}>{f.label}</button>
          ))}
        </div>

        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#C8FF00]" /></div>
        ) : (
          <div className="space-y-3">
            {filtered.map(task => (
              <div key={String(task._id || task.id)} className={`p-5 bg-obsidian-2 border rounded-[12px] transition-all hover:border-[#C8FF00]/20 ${task.status === 'done' ? 'border-glass-border/50 opacity-70' : 'border-glass-border'}`}>
                <div className="flex items-start gap-4">
                  <button onClick={() => updateTask(task, task.status === 'done' ? 'todo' : 'done')} className="mt-0.5">
                    {task.status === 'done' ? <CheckCircle size={20} className="text-green-400" /> : task.status === 'in_progress' ? <Clock size={20} className="text-blue-400" /> : <Circle size={20} className="text-cream/20" />}
                  </button>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h4 className={`font-medium text-sm ${task.status === 'done' ? 'line-through text-cream/40' : ''}`}>{task.title}</h4>
                      <span className={`px-2 py-0.5 text-[10px] rounded ${task.priority === 'high' ? 'bg-red-500/10 text-red-400' : task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}`}>{task.priority}</span>
                      <span className="px-2 py-0.5 text-[10px] bg-white/[0.06] rounded text-cream/30">{task.category}</span>
                      {task.assigneeName && <span className="px-2 py-0.5 text-[10px] bg-blue-500/10 rounded text-blue-400">{task.assigneeName}</span>}
                    </div>
                    <p className="text-xs text-cream/30 mb-2">{task.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-cream/30">
                      <span className="flex items-center gap-1"><Clock size={10} /> Due: {task.dueDate || task.due}</span>
                      {task.performanceScore && <span>Performance: {task.performanceScore}/5</span>}
                      {task.feedback && <span>Feedback: {task.feedback}</span>}
                    </div>
                    {task.status !== 'done' && <button onClick={() => updateTask(task, 'in_progress')} className="mt-3 px-3 py-1.5 bg-white/[0.04] border border-glass-border rounded-[4px] text-xs text-cream/60 hover:text-cream">Mark In Progress</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
