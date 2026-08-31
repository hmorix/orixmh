import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import SEOHead from "../../components/seo/SEOHead"
import {
  Plus,
  DollarSign,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Layers,
  ArrowLeft,
  Filter,
  Sparkles,
  Building,
  Check
} from "lucide-react"
import { config } from "../../lib/config"

const stageDefs = [
  { key: "lead", name: "Lead", color: "border-blue-500 bg-blue-500/10 text-blue-400" },
  { key: "qualification", name: "Qualification", color: "border-purple-500 bg-purple-500/10 text-purple-400" },
  { key: "discovery", name: "Discovery", color: "border-yellow-500 bg-yellow-500/10 text-yellow-400" },
  { key: "proposal", name: "Proposal", color: "border-orange-500 bg-orange-500/10 text-orange-400" },
  { key: "negotiation", name: "Negotiation", color: "border-pink-500 bg-pink-500/10 text-pink-400" },
  { key: "closed_won", name: "Closed Won", color: "border-green-500 bg-green-500/10 text-green-400" },
  { key: "closed_lost", name: "Closed Lost", color: "border-red-500 bg-red-500/10 text-red-400" }
]

const blankDeal = {
  id: "",
  name: "",
  company: "",
  contact: "",
  value: "",
  owner: "HMorix Commercial Sales",
  stage: "lead",
  probability: "40",
  expectedClose: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
}

export default function Deals() {
  const [deals, setDeals] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blankDeal)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [stageFilter, setStageFilter] = useState("all")

  const loadDeals = async () => {
    const response = await fetch(`${config.apiUrl}/crm/deals`, {
      credentials: "include",
      cache: "no-store"
    })
    const data = await response.json().catch(() => ({}))
    if (response.ok) setDeals(data.deals || [])
  }

  useEffect(() => {
    loadDeals()
  }, [])

  const totalValue = deals.reduce((sum, deal) => sum + Number(deal.value || 0), 0)
  const wonValue = deals
    .filter(d => d.stage === "closed_won")
    .reduce((sum, d) => sum + Number(d.value || 0), 0)

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchSearch =
        (deal.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (deal.company || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchStage = stageFilter === "all" || deal.stage === stageFilter
      return matchSearch && matchStage
    })
  }, [deals, searchTerm, stageFilter])

  const grouped = useMemo(
    () =>
      stageDefs.map(stage => {
        const stageDeals = filteredDeals.filter(deal => (deal.stage || "lead") === stage.key)
        const stageSum = stageDeals.reduce((sum, d) => sum + Number(d.value || 0), 0)
        return {
          ...stage,
          deals: stageDeals,
          total: stageSum
        }
      }),
    [filteredDeals]
  )

  const saveDeal = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    const response = await fetch(`${config.apiUrl}/crm/deals`, {
      method: form.id ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        value: Number(form.value || 0),
        probability: Number(form.probability || 0)
      })
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage({ type: "error", text: data.error || "Unable to save deal" })
      return
    }
    setShowForm(false)
    setForm(blankDeal)
    setMessage({
      type: "success",
      text: form.id ? "Deal updated successfully." : "New deal pipeline initialized."
    })
    loadDeals()
  }

  const updateStage = async (deal: any, stage: string) => {
    const response = await fetch(`${config.apiUrl}/crm/deals`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: String(deal._id || deal.id), stage })
    })
    if (response.ok) {
      setMessage({
        type: "success",
        text: `Deal moved to "${stage.replace(/_/g, " ")}".`
      })
      loadDeals()
    }
  }

  const deleteDeal = async (deal: any) => {
    if (!confirm(`Are you sure you want to delete deal "${deal.name}"?`)) return
    await fetch(`${config.apiUrl}/crm/deals?id=${encodeURIComponent(String(deal._id || deal.id))}`, {
      method: "DELETE",
      credentials: "include"
    })
    loadDeals()
  }

  const openEdit = (deal: any) => {
    setForm({
      id: String(deal._id || deal.id || ""),
      name: deal.name || "",
      company: deal.company || "",
      contact: deal.contact || "",
      value: String(deal.value || ""),
      owner: deal.owner || "HMorix Commercial Sales",
      stage: deal.stage || "lead",
      probability: String(deal.probability || 40),
      expectedClose: deal.expectedClose || ""
    })
    setShowForm(true)
  }

  return (
    <div className="pt-28 pb-20 min-h-screen bg-obsidian text-cream">
      <SEOHead
        title="Sales Deals & Kanban Pipeline | HMorix CRM"
        description="Interactive visual sales Kanban board — manage deal stages, win probabilities, revenue amounts, and close sales."
        keywords="deals pipeline, sales kanban, deal stages, revenue closing, CRM deals"
        canonical="/crm/deals"
      />

      <div className="max-w-[1560px] mx-auto px-4 sm:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/crm"
            className="inline-flex items-center gap-2 text-xs text-cream/50 hover:text-[#C8FF00] transition-colors"
          >
            <ArrowLeft size={14} /> Back to CRM Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setForm(blankDeal)
                setShowForm(true)
              }}
              className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3.5"
            >
              <Plus size={13} /> + New Deal
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
              Deal Pipeline & Revenue Kanban
            </h1>
            <p className="text-cream/50 text-sm mt-1">
              Total Active Pipeline: <strong className="text-[#C8FF00]">₹{totalValue.toLocaleString("en-IN")}</strong> &bull; Won: <strong className="text-green-400">₹{wonValue.toLocaleString("en-IN")}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search deal or company..."
                className="pl-9 pr-4 py-1.5 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00] w-56"
              />
            </div>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-[12px] border text-sm ${
              message.type === "success"
                ? "bg-[#C8FF00]/10 border-[#C8FF00]/30 text-[#C8FF00]"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Deal Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-obsidian-2 border border-glass-border rounded-[18px] max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-glass-border">
                <h3 className="font-display font-semibold text-base text-cream">
                  {form.id ? "Edit Commercial Deal" : "Initialize New Deal Pipeline"}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-cream/40 hover:text-cream text-sm">
                  ✕
                </button>
              </div>

              <form onSubmit={saveDeal} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Deal / Project Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Enterprise Cloud ERP Implementation"
                    className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Company / Client *</label>
                    <input
                      required
                      value={form.company}
                      onChange={e => setForm({ ...form, company: e.target.value })}
                      placeholder="e.g. Royal Palace Hotel"
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Primary Contact</label>
                    <input
                      value={form.contact}
                      onChange={e => setForm({ ...form, contact: e.target.value })}
                      placeholder="e.g. director@royalhotel.com"
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Deal Value (₹ INR) *</label>
                    <input
                      type="number"
                      required
                      value={form.value}
                      onChange={e => setForm({ ...form, value: e.target.value })}
                      placeholder="e.g. 350000"
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Pipeline Stage</label>
                    <select
                      value={form.stage}
                      onChange={e => setForm({ ...form, stage: e.target.value })}
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    >
                      {stageDefs.map(s => (
                        <option key={s.key} value={s.key}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Win Probability (%)</label>
                    <input
                      type="number"
                      value={form.probability}
                      onChange={e => setForm({ ...form, probability: e.target.value })}
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Target Close Date</label>
                    <input
                      type="date"
                      value={form.expectedClose}
                      onChange={e => setForm({ ...form, expectedClose: e.target.value })}
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-glass-border">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-outline text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-6">
                    Save Deal Pipeline
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= KANBAN BOARD ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3.5 overflow-x-auto pb-6">
          {grouped.map(col => (
            <div
              key={col.key}
              className="bg-obsidian-2 border border-glass-border rounded-[14px] p-3 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="pb-3 border-b border-glass-border/60 mb-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${col.color}`}>
                    {col.name}
                  </span>
                  <span className="text-xs font-bold text-cream">{col.deals.length}</span>
                </div>
                <div className="text-[11px] font-bold text-[#C8FF00] mt-1.5 font-mono">
                  ₹{col.total.toLocaleString("en-IN")}
                </div>
              </div>

              {/* Deal Cards Container */}
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {col.deals.map((deal: any) => (
                  <div
                    key={deal._id || deal.id}
                    className="p-3.5 bg-obsidian border border-glass-border rounded-[10px] hover:border-[#C8FF00]/40 transition-all space-y-2 group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-xs text-cream leading-tight">{deal.name}</h4>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(deal)}
                          className="p-1 text-cream/40 hover:text-[#C8FF00]"
                          title="Edit"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={() => deleteDeal(deal)}
                          className="p-1 text-cream/40 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-cream/50">
                      🏢 {deal.company || "Enterprise"}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-glass-border/50 text-[11px]">
                      <span className="font-bold text-[#C8FF00] font-mono">
                        ₹{Number(deal.value || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-cream/40">{deal.probability || 50}%</span>
                    </div>

                    {/* Quick Move / Won Buttons */}
                    <div className="flex items-center justify-between gap-1 pt-1">
                      {col.key !== "closed_won" && (
                        <button
                          onClick={() => updateStage(deal, "closed_won")}
                          className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-[9px] font-bold hover:bg-green-500/30 flex items-center gap-0.5"
                          title="Mark Won"
                        >
                          <Check size={10} /> Won
                        </button>
                      )}
                      {col.key === "lead" && (
                        <button
                          onClick={() => updateStage(deal, "qualification")}
                          className="text-[10px] text-cream/40 hover:text-cream ml-auto flex items-center gap-0.5"
                        >
                          Qualify &rarr;
                        </button>
                      )}
                      {col.key === "qualification" && (
                        <button
                          onClick={() => updateStage(deal, "discovery")}
                          className="text-[10px] text-cream/40 hover:text-cream ml-auto flex items-center gap-0.5"
                        >
                          Discover &rarr;
                        </button>
                      )}
                      {col.key === "discovery" && (
                        <button
                          onClick={() => updateStage(deal, "proposal")}
                          className="text-[10px] text-cream/40 hover:text-cream ml-auto flex items-center gap-0.5"
                        >
                          Propose &rarr;
                        </button>
                      )}
                      {col.key === "proposal" && (
                        <button
                          onClick={() => updateStage(deal, "negotiation")}
                          className="text-[10px] text-cream/40 hover:text-cream ml-auto flex items-center gap-0.5"
                        >
                          Negotiate &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
