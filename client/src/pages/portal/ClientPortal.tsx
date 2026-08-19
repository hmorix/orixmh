import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../../components/seo/SEOHead'
import { AlertCircle, BarChart3, CheckCircle, Clock, FileText, FolderOpen, Loader2, MessageCircle, Send, Users } from 'lucide-react'
import { config } from '../../lib/config'

function money(value: number) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

export default function ClientPortal() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [ticketForm, setTicketForm] = useState({ projectId: '', subject: '', description: '', priority: 'medium' })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${config.apiUrl}/portal`, { credentials: 'include', cache: 'no-store' })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Unable to load portal')
      setData(result.data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load portal')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const projects = data?.projects || []
  const tickets = data?.tickets || []
  const teams = data?.teams || []
  const invoices = data?.invoices || []
  const activities = data?.activities || []
  const stats = data?.stats || {}

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')
    const response = await fetch(`${config.apiUrl}/tickets`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketForm),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(result.error || 'Unable to submit ticket')
      return
    }
    setMessage('Ticket submitted to your assigned team')
    setTicketForm({ projectId: '', subject: '', description: '', priority: 'medium' })
    load()
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <SEOHead title="Client Portal" description="Client portal for live HMorix projects, support tickets, assigned teams, invoices, and activity." keywords="client portal, projects, support tickets, invoices, assigned team" canonical="/portal" />
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <span className="label-mono">Client Portal</span>
            <h1 className="section-title mt-2">{data?.user?.name || data?.user?.email || 'Client Portal'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} className="btn-outline text-sm">Refresh</button>
            <Link to="/profile" className="btn-primary text-sm">Profile</Link>
          </div>
        </div>

        {message && <div className="mb-6 p-3 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-[8px] text-sm text-[#C8FF00]">{message}</div>}
        {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-[8px] text-sm text-red-400">{error}</div>}

        {loading ? (
          <div className="p-10 bg-obsidian-2 border border-glass-border rounded-[16px] flex justify-center"><Loader2 className="animate-spin text-[#C8FF00]" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Active Projects', value: stats.activeProjects || 0, icon: FolderOpen },
                { label: 'Open Tickets', value: stats.openTickets || 0, icon: MessageCircle },
                { label: 'Invoices Due', value: money(stats.invoicesDue || 0), icon: FileText },
                { label: 'Team Members', value: stats.teamMembers || 0, icon: Users },
              ].map((stat, i) => (
                <div key={i} className="p-5 bg-obsidian-2 border border-glass-border rounded-[12px]">
                  <stat.icon size={18} className="text-[#C8FF00] mb-3" />
                  <div className="font-display text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-cream/40 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                  <h3 className="font-display font-semibold mb-4">Projects</h3>
                  <div className="space-y-3">
                    {projects.length === 0 && <div className="text-sm text-cream/40">No projects assigned yet.</div>}
                    {projects.map((project: any) => (
                      <div key={project.id} className="p-4 bg-white/[0.02] border border-glass-border rounded-[12px]">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div>
                            <div className="font-medium text-sm">{project.name}</div>
                            <div className="text-[10px] text-cream/30">{project.client_name || project.businessName || 'Client'} · {project.assignedTeamName || 'Team pending'}</div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C8FF00]/10 text-[#C8FF00] capitalize">{String(project.status || 'planning').replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-[#C8FF00]" style={{ width: `${Math.min(100, Number(project.progress || 0))}%` }} />
                          </div>
                          <span className="text-xs text-cream/40">{project.progress || 0}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                  <h3 className="font-display font-semibold mb-4">Tickets</h3>
                  <div className="space-y-3">
                    {tickets.length === 0 && <div className="text-sm text-cream/40">No tickets yet.</div>}
                    {tickets.map((ticket: any) => (
                      <div key={ticket.id} className="p-4 bg-white/[0.02] border border-glass-border rounded-[12px]">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-medium">{ticket.number || ticket.id} · {ticket.subject}</div>
                            <div className="text-[10px] text-cream/30">{ticket.projectName || 'General'} · {ticket.assignedTeamName || 'Assignment pending'}</div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] capitalize">{ticket.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                  <h3 className="font-display font-semibold mb-4">Activity</h3>
                  <div className="space-y-3">
                    {activities.length === 0 && <div className="text-sm text-cream/40">No activity yet.</div>}
                    {activities.map((activity: any, i: number) => (
                      <div key={activity._id || i} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-[8px]">
                        {String(activity.action || '').includes('ticket') ? <AlertCircle size={16} className="text-yellow-400" /> : String(activity.action || '').includes('project') ? <CheckCircle size={16} className="text-green-400" /> : <Clock size={16} className="text-[#C8FF00]" />}
                        <span className="flex-1 text-sm capitalize">{String(activity.action || 'activity').replace(/_/g, ' ')}</span>
                        <span className="text-[10px] text-cream/30">{activity.createdAt ? new Date(activity.createdAt).toLocaleString() : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <form onSubmit={submitTicket} className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-3">
                  <div className="flex items-center gap-2 mb-1"><Send size={15} className="text-[#C8FF00]" /><h3 className="font-display font-semibold">Submit Ticket</h3></div>
                  <select value={ticketForm.projectId} onChange={e => setTicketForm({ ...ticketForm, projectId: e.target.value })} className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm">
                    <option value="">General support</option>
                    {projects.map((project: any) => <option key={project.id} value={project.id}>{project.name}</option>)}
                  </select>
                  <input required value={ticketForm.subject} onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })} placeholder="Subject" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm" />
                  <select value={ticketForm.priority} onChange={e => setTicketForm({ ...ticketForm, priority: e.target.value })} className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <textarea required value={ticketForm.description} onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })} rows={5} placeholder="Explain the issue or request" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm resize-none" />
                  <button type="submit" className="btn-primary w-full text-sm">Submit Ticket</button>
                </form>

                <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                  <h3 className="font-display font-semibold mb-4">Assigned Team</h3>
                  <div className="space-y-3">
                    {teams.length === 0 && <div className="text-sm text-cream/40">No team assigned yet.</div>}
                    {teams.map((team: any) => (
                      <div key={team.id} className="p-3 bg-white/[0.02] rounded-[8px]">
                        <div className="text-sm font-medium">{team.name}</div>
                        <div className="text-[10px] text-cream/30">{team.department || 'General'} · Lead: {team.lead || '—'}</div>
                        <div className="text-[10px] text-cream/20 mt-1">Members: {Array.isArray(team.members) ? team.members.length : 0}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                  <h3 className="font-display font-semibold mb-4">Invoices</h3>
                  <div className="space-y-2">
                    {invoices.length === 0 && <div className="text-sm text-cream/40">No invoices yet.</div>}
                    {invoices.map((invoice: any) => (
                      <div key={invoice._id || invoice.number} className="flex items-center justify-between text-xs p-2 bg-white/[0.02] rounded-[6px]">
                        <span>{invoice.number || invoice.title}</span>
                        <span className="text-[#C8FF00]">{money(invoice.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
                  <h3 className="font-display font-semibold mb-4">SLA Status</h3>
                  <div className="space-y-3">
                    {[{ metric: 'Uptime', value: '99.98%' }, { metric: 'Response Time', value: '<1 hour' }, { metric: 'Resolution Target', value: '<8 hours' }].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-xs text-cream/50">{item.metric}</span>
                        <div className="flex items-center gap-2"><span className="text-xs font-mono">{item.value}</span><BarChart3 size={12} className="text-green-400" /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
