import { useEffect, useMemo, useState } from 'react'
import SEOHead from '../../components/seo/SEOHead'
import { Calendar, Check, X } from 'lucide-react'
import { config } from '../../lib/config'

export default function Leaves() {
  const [leaves, setLeaves] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const loadLeaves = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiUrl}/hrm/leave`, { credentials: 'include', cache: 'no-store' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Unable to load leave requests')
      setLeaves(data.data || [])
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to load leave requests')
      setLeaves([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaves()
  }, [])

  const todayLabel = useMemo(() => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), [])
  const pending = leaves.filter(leave => leave.status === 'pending')
  const approved = leaves.filter(leave => leave.status === 'approved')
  const rejected = leaves.filter(leave => leave.status === 'rejected')

  const decide = async (id: string, status: 'approved' | 'rejected') => {
    const response = await fetch(`${config.apiUrl}/hrm/leave`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(data.error || 'Unable to update leave request')
      return
    }
    setMessage(`Leave ${status}`)
    loadLeaves()
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <SEOHead title="HRM Leaves" description="Manage employee leave requests." canonical="/hrm/leaves" />
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Leave Requests</h1>
            <p className="text-cream/50 text-sm mt-1">Today: {todayLabel}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-cream/60">
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">Pending {pending.length}</span>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">Approved {approved.length}</span>
            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded">Rejected {rejected.length}</span>
          </div>
        </div>

        {message && <div className="mb-6 p-3 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-[8px] text-sm text-[#C8FF00]">{message}</div>}

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Pending', count: pending.length, color: 'text-yellow-400' },
            { label: 'Approved', count: approved.length, color: 'text-green-400' },
            { label: 'Rejected', count: rejected.length, color: 'text-red-400' },
          ].map(card => (
            <div key={card.label} className="p-5 bg-obsidian-2 border border-glass-border rounded-[12px]">
              <div className="text-xs text-cream/30">{card.label}</div>
              <div className={`font-display text-3xl font-bold mt-2 ${card.color}`}>{card.count}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="p-8 text-center text-cream/40">Loading leave requests...</div>
          ) : leaves.length === 0 ? (
            <div className="p-8 bg-obsidian-2 border border-glass-border rounded-[12px] text-center text-cream/40">No leave requests yet.</div>
          ) : (
            leaves.map(leave => (
              <div key={leave._id} className="p-4 bg-obsidian-2 border border-glass-border rounded-[12px] flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#C8FF00]" />
                    <div className="text-sm font-medium">{leave.name}</div>
                  </div>
                  <div className="text-[10px] text-cream/30 mt-1">{leave.type} · {leave.dates} · {leave.days} day(s)</div>
                  <div className="text-[10px] text-cream/20 mt-1">{String(leave.employeeId || '')}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-[10px] ${leave.status === 'approved' ? 'bg-green-500/20 text-green-400' : leave.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{leave.status}</span>
                  {leave.status === 'pending' && (
                    <>
                      <button onClick={() => decide(String(leave._id), 'approved')} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-[10px] flex items-center gap-1"><Check size={12} /> Approve</button>
                      <button onClick={() => decide(String(leave._id), 'rejected')} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-[10px] flex items-center gap-1"><X size={12} /> Reject</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
