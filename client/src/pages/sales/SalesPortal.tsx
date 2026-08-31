import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import SEOHead from "../../components/seo/SEOHead"
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Target,
  DollarSign,
  TrendingUp,
  Mail,
  Calendar,
  Sparkles,
  ArrowLeft,
  Check,
  Briefcase,
  Layers,
  Award,
  ChevronRight
} from "lucide-react"
import { config } from "../../lib/config"

const serviceOptions = [
  "Custom Website",
  "Mobile App (iOS/Android)",
  "AI & WhatsApp Automation",
  "Enterprise CRM",
  "BillingFlow ERP",
  "SEO & Local Growth",
  "Digital Marketing",
  "Cloud Software Architecture"
]

const placeTypes = [
  "Hotel & Hospitality",
  "Restaurant & Cafe",
  "Manufacturing & Factory",
  "Corporate / Company",
  "School & College",
  "Hospital & Clinic",
  "Retail & Showroom",
  "Real Estate & Construction",
  "Other Local Business"
]

export default function SalesPortal() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [form, setForm] = useState({
    placeType: "Hotel & Hospitality",
    businessName: "",
    ownerName: "",
    ownerEmail: "",
    phone: "",
    location: "Hathras, UP",
    address: "",
    services: [] as string[],
    projectDetails: "",
    budget: "75000",
    paymentDuration: "monthly",
    followUpDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    status: "lead"
  })

  const load = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const response = await fetch(`${config.apiUrl}/sales/projects`, {
        credentials: "include",
        cache: "no-store"
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Unable to load sales projects")
      setProjects(data.data || [])
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Unable to load sales leads"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const toggleService = (service: string) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(item => item !== service)
        : [...prev.services, service]
    }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    const response = await fetch(`${config.apiUrl}/sales/projects`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage({ type: "error", text: data.error || "Unable to register sales project" })
      return
    }
    setMessage({
      type: "success",
      text: `Lead "${form.businessName}" saved! CRM contact, deal pipeline, and delivery project created automatically.`
    })
    setForm({
      placeType: "Hotel & Hospitality",
      businessName: "",
      ownerName: "",
      ownerEmail: "",
      phone: "",
      location: "Hathras, UP",
      address: "",
      services: [],
      projectDetails: "",
      budget: "75000",
      paymentDuration: "monthly",
      followUpDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      status: "lead"
    })
    load()
  }

  const closeDeal = async (project: any) => {
    const response = await fetch(`${config.apiUrl}/sales/projects`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: project.id || project._id,
        status: "closed_won",
        dealStage: "closed_won"
      })
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage({ type: "error", text: data.error || "Unable to close deal" })
      return
    }
    setMessage({
      type: "success",
      text: `Deal "${project.businessName || project.name}" closed as WON! Delivery manager notified.`
    })
    load()
  }

  const totalLeads = projects.length
  const wonDeals = projects.filter(p => p.status === "closed_won")
  const totalPipelineVal = projects.reduce((acc, p) => acc + Number(p.budget || 50000), 0)
  const totalWonVal = wonDeals.reduce((acc, p) => acc + Number(p.budget || 50000), 0)

  return (
    <div className="pt-28 pb-20 min-h-screen bg-obsidian text-cream">
      <SEOHead
        title="Field Sales Operations Portal | HMorix"
        description="Mobile-first field sales command — capture local businesses, auto-generate CRM deals, quote budgets, and close contracts on the ground."
        keywords="field sales portal, lead capture, sales deals, business onboarding, local sales pipeline"
        canonical="/sales"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/crm"
            className="inline-flex items-center gap-2 text-xs text-cream/50 hover:text-[#C8FF00] transition-colors"
          >
            <ArrowLeft size={14} /> Back to CRM Pipeline
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 bg-[#C8FF00]/10 text-[#C8FF00] rounded-full border border-[#C8FF00]/30 font-semibold flex items-center gap-1.5">
              <Sparkles size={12} /> Live CRM Sync Active
            </span>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
              Field Sales & Lead Capture Hub
            </h1>
            <p className="text-cream/50 text-sm mt-1">
              Capture on-ground businesses, auto-sync with CRM & Engineering Delivery pipelines.
            </p>
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

        {/* Top KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 bg-obsidian-2 border border-glass-border rounded-[14px]">
            <div className="flex items-center justify-between text-cream/40 text-xs">
              <span>Total Pitches / Leads</span>
              <Target size={16} className="text-[#C8FF00]" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-[#C8FF00] mt-2">
              {totalLeads}
            </div>
          </div>

          <div className="p-5 bg-obsidian-2 border border-glass-border rounded-[14px]">
            <div className="flex items-center justify-between text-cream/40 text-xs">
              <span>Closed Won Deals</span>
              <CheckCircle2 size={16} className="text-green-400" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-green-400 mt-2">
              {wonDeals.length}
            </div>
          </div>

          <div className="p-5 bg-obsidian-2 border border-glass-border rounded-[14px]">
            <div className="flex items-center justify-between text-cream/40 text-xs">
              <span>Pipeline Deal Value</span>
              <DollarSign size={16} className="text-blue-400" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-blue-400 mt-2">
              ₹{totalPipelineVal.toLocaleString("en-IN")}
            </div>
          </div>

          <div className="p-5 bg-obsidian-2 border border-glass-border rounded-[14px]">
            <div className="flex items-center justify-between text-cream/40 text-xs">
              <span>Won Revenue Booked</span>
              <Award size={16} className="text-yellow-400" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-yellow-400 mt-2">
              ₹{totalWonVal.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* 2-Column Split: Lead Capture Form & Active Field Pitches */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Mobile-First Field Capture Form (2 Cols) */}
          <form
            onSubmit={submit}
            className="lg:col-span-2 p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-4 shadow-xl self-start"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-glass-border">
              <Plus size={16} className="text-[#C8FF00]" />
              <h2 className="font-display font-semibold text-base">Capture New Business Pitch</h2>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-cream/70 font-medium">Business / Enterprise Type *</label>
              <select
                value={form.placeType}
                onChange={e => setForm({ ...form, placeType: e.target.value })}
                className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
              >
                {placeTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-cream/70 font-medium">Business / Entity Name *</label>
              <input
                required
                value={form.businessName}
                onChange={e => setForm({ ...form, businessName: e.target.value })}
                placeholder="e.g. Grand Heritage Palace"
                className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-cream/70 font-medium">Decision Maker Name *</label>
                <input
                  required
                  value={form.ownerName}
                  onChange={e => setForm({ ...form, ownerName: e.target.value })}
                  placeholder="e.g. Rajesh Singhal"
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-cream/70 font-medium">Phone / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-cream/70 font-medium">Decision Maker Email</label>
              <input
                type="email"
                value={form.ownerEmail}
                onChange={e => setForm({ ...form, ownerEmail: e.target.value })}
                placeholder="rajesh@grandpalace.com"
                className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-cream/70 font-medium">City / Location</label>
              <input
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="Hathras / Aligarh / Agra / Noida"
                className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
              />
            </div>

            {/* Services Toggle Pill Matrix */}
            <div className="space-y-1.5">
              <label className="text-xs text-cream/70 font-medium">Required Technology Services</label>
              <div className="flex flex-wrap gap-1.5">
                {serviceOptions.map(svc => {
                  const selected = form.services.includes(svc)
                  return (
                    <button
                      type="button"
                      key={svc}
                      onClick={() => toggleService(svc)}
                      className={`px-2.5 py-1 rounded-[6px] text-[11px] font-medium transition-all border ${
                        selected
                          ? "bg-[#C8FF00] text-obsidian border-[#C8FF00] font-bold"
                          : "bg-obsidian border-glass-border text-cream/60 hover:text-cream"
                      }`}
                    >
                      {selected ? "✓ " : "+ "}{svc}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-cream/70 font-medium">Quoted Budget (₹ INR) *</label>
                <input
                  type="number"
                  required
                  value={form.budget}
                  onChange={e => setForm({ ...form, budget: e.target.value })}
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-cream/70 font-medium">Next Follow-Up Date</label>
                <input
                  type="date"
                  value={form.followUpDate}
                  onChange={e => setForm({ ...form, followUpDate: e.target.value })}
                  className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                />
              </div>
            </div>

            <button type="submit" className="w-full btn-primary text-xs py-2.5 mt-2">
              Save Lead & Sync CRM &rarr;
            </button>
          </form>

          {/* Active Field Pitches List (3 Cols) */}
          <div className="lg:col-span-3 bg-obsidian-2 border border-glass-border rounded-[16px] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-glass-border">
              <div>
                <h3 className="font-display font-semibold text-base">Active Field Pitches & Leads</h3>
                <p className="text-xs text-cream/50 mt-0.5">Synced with CRM contacts & deal records</p>
              </div>
              <span className="text-xs text-cream/50">{projects.length} Total Leads</span>
            </div>

            <div className="space-y-3.5">
              {loading ? (
                <div className="p-12 text-center text-cream/40 bg-obsidian rounded-[10px] border border-glass-border">
                  Loading field leads...
                </div>
              ) : projects.length === 0 ? (
                <div className="p-12 text-center text-cream/40 bg-obsidian rounded-[10px] border border-glass-border">
                  No field pitches recorded yet. Fill the capture form on the left to start.
                </div>
              ) : (
                projects.map((p: any) => (
                  <div
                    key={p._id || p.id}
                    className="p-5 bg-obsidian border border-glass-border rounded-[12px] hover:border-glass-border/80 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-base text-cream">
                            {p.businessName || p.name}
                          </h4>
                          <span className="px-2 py-0.5 bg-white/[0.04] border border-glass-border rounded text-[10px] text-cream/60">
                            {p.placeType || "Enterprise"}
                          </span>
                        </div>
                        <div className="text-xs text-cream/50 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>Decision Maker: <strong className="text-cream/80">{p.ownerName}</strong></span>
                          <span>&bull;</span>
                          <span>{p.phone}</span>
                          <span>&bull;</span>
                          <span>{p.location || "Hathras"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                          p.status === "closed_won"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}>
                          {p.status?.replace(/_/g, " ") || "lead"}
                        </span>
                        {p.status !== "closed_won" && (
                          <button
                            onClick={() => closeDeal(p)}
                            className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 rounded-[6px] text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <Check size={12} /> Close Won
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Services Tags */}
                    {p.services && p.services.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {p.services.map((svc: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-white/[0.03] border border-glass-border rounded text-[10px] text-cream/70">
                            {svc}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-2.5 border-t border-glass-border/50 flex items-center justify-between text-xs text-cream/50">
                      <span>Quoted: <strong className="text-[#C8FF00] font-mono">₹{Number(p.budget || 50000).toLocaleString("en-IN")}</strong></span>
                      <span>Next Touch: <strong className="text-cream/80">{p.followUpDate || "Immediate"}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
