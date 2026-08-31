import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import SEOHead from "../../components/seo/SEOHead"
import {
  Search,
  Filter,
  Plus,
  Mail,
  Building,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Phone,
  ArrowLeft,
  User,
  Tag,
  Briefcase,
  ExternalLink,
  Sparkles
} from "lucide-react"
import { config } from "../../lib/config"

type Contact = {
  _id?: string
  id?: string
  name: string
  email: string
  phone?: string
  company?: string
  role?: string
  status: string
  lastContact?: string
  deals?: number
  totalValue?: number
  tags?: string[]
  notes?: string
}

const blankForm = {
  id: "",
  name: "",
  email: "",
  phone: "",
  company: "",
  role: "",
  status: "lead",
  tags: "Enterprise, Lead",
  notes: ""
}

export default function Contacts() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Contact | null>(null)
  const [form, setForm] = useState(blankForm)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const loadContacts = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "30", status: statusFilter })
    if (search) params.set("search", search)
    try {
      const response = await fetch(`${config.apiUrl}/crm/contacts?${params}`, {
        credentials: "include",
        cache: "no-store"
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        setContacts(data.contacts || [])
        setPages(data.pages || 1)
      }
    } catch {
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [page, statusFilter])

  const openAdd = () => {
    setForm(blankForm)
    setShowForm(true)
    setSelected(null)
  }

  const openEdit = (contact: Contact) => {
    setSelected(contact)
    setForm({
      id: String(contact._id || contact.id || ""),
      name: contact.name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      company: contact.company || "",
      role: contact.role || "",
      status: contact.status || "lead",
      tags: (contact.tags || []).join(", "),
      notes: contact.notes || ""
    })
    setShowForm(true)
  }

  const saveContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    const payload = {
      ...form,
      tags: form.tags.split(",").map(tag => tag.trim()).filter(Boolean)
    }
    const response = await fetch(`${config.apiUrl}/crm/contacts`, {
      method: form.id ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage({ type: "error", text: data.error || "Unable to save contact" })
      return
    }
    setShowForm(false)
    setMessage({
      type: "success",
      text: form.id ? "Contact details updated." : "New client contact registered."
    })
    loadContacts()
  }

  return (
    <div className="pt-28 pb-20 min-h-screen bg-obsidian text-cream">
      <SEOHead
        title="Client Contacts Directory | HMorix CRM"
        description="Comprehensive enterprise contact directory — manage decision makers, business clients, leads, and account logs."
        keywords="contact management, CRM contacts, client directory, business leads, account executives"
        canonical="/crm/contacts"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
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
              onClick={openAdd}
              className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3.5"
            >
              <Plus size={13} /> + New Contact Lead
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
              Client & Lead Directory
            </h1>
            <p className="text-cream/50 text-sm mt-1">
              Account decision-makers, verified contacts, and deal histories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && loadContacts()}
                placeholder="Search name, company, email..."
                className="pl-9 pr-4 py-1.5 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00] w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
            >
              <option value="all">All Statuses</option>
              <option value="lead">Lead</option>
              <option value="customer">Customer / Active</option>
              <option value="partner">Partner</option>
            </select>
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

        {/* Add/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-obsidian-2 border border-glass-border rounded-[18px] max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-glass-border">
                <h3 className="font-display font-semibold text-base text-cream">
                  {form.id ? "Edit Client Contact" : "Register New Business Contact"}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-cream/40 hover:text-cream text-sm">
                  ✕
                </button>
              </div>

              <form onSubmit={saveContact} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Contact Full Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Vikram Singhania"
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Company / Business Name *</label>
                    <input
                      required
                      value={form.company}
                      onChange={e => setForm({ ...form, company: e.target.value })}
                      placeholder="e.g. Singhania Industries"
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="vikram@singhania.in"
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Designation / Role</label>
                    <input
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                      placeholder="Managing Director"
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Relationship Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    >
                      <option value="lead">Lead / Prospect</option>
                      <option value="customer">Active Customer</option>
                      <option value="partner">Strategic Partner</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Industry Classification Tags</label>
                  <input
                    value={form.tags}
                    onChange={e => setForm({ ...form, tags: e.target.value })}
                    placeholder="Hotel, Manufacturing, Hospital, Retail..."
                    className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Account Notes</label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="Key priorities, budget, preferred communication times..."
                    className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  />
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
                    Save Contact
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Contacts Grid Table */}
        <div className="bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-cream/40 text-xs border-b border-glass-border bg-white/[0.02]">
                  <th className="p-4 font-medium">Contact Person</th>
                  <th className="p-4 font-medium">Company & Designation</th>
                  <th className="p-4 font-medium hidden sm:table-cell">Contact Channels</th>
                  <th className="p-4 font-medium hidden md:table-cell">Industry Tags</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/50">
                {loading ? (
                  <tr><td colSpan={6} className="p-12 text-center text-cream/40">Loading contacts...</td></tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-cream/40">
                      No contacts found. Click &quot;+ New Contact Lead&quot; to register prospects.
                    </td>
                  </tr>
                ) : (
                  contacts.map(c => (
                    <tr key={c._id || c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#C8FF00] text-obsidian font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {String(c.name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-cream text-sm">{c.name}</div>
                            <div className="text-[10px] text-cream/40">{c.role || "Director / Owner"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-cream/80 text-xs">{c.company || "Enterprise Client"}</div>
                      </td>
                      <td className="p-4 text-xs text-cream/60 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <a href={`mailto:${c.email}`} className="hover:text-[#C8FF00] flex items-center gap-1">
                            <Mail size={12} /> {c.email}
                          </a>
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-2 mt-0.5 text-cream/40">
                            <a href={`tel:${c.phone}`} className="hover:text-[#C8FF00] flex items-center gap-1">
                              <Phone size={11} /> {c.phone}
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {(c.tags || ["Enterprise"]).map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-white/[0.04] border border-glass-border rounded text-[10px] text-cream/60">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          c.status === "customer" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                        }`}>
                          {c.status || "lead"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openEdit(c)}
                          className="btn-outline text-xs px-2.5 py-1"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
