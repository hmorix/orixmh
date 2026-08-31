import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import SEOHead from "../../components/seo/SEOHead"
import {
  Search,
  Plus,
  Download,
  Filter,
  Mail,
  Ban,
  Edit,
  Trash2,
  ArrowLeft,
  Users,
  Shield,
  Check,
  RefreshCw,
  Key,
  Building,
  UserCheck
} from "lucide-react"
import { config } from "../../lib/config"

type UserItem = {
  id: string
  _id?: string
  name: string
  email: string
  username?: string
  role: string
  status?: string
  company?: string
  createdAt?: string
  emailVerified?: boolean
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "user",
    company: "HMorix Client",
    department: "Engineering"
  })

  const loadUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ search, role: roleFilter })
      const response = await fetch(`${config.apiUrl}/admin/users?${params}`, {
        credentials: "include",
        cache: "no-store"
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok && data.data?.users) {
        setUsers(data.data.users)
      }
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [roleFilter])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    const response = await fetch(`${config.apiUrl}/admin/users`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage({ type: "error", text: data.error || "Unable to create user" })
      return
    }
    setMessage({
      type: "success",
      text: `User "${form.name}" created with role "${form.role}". Credentials provisioned.`
    })
    setShowAddModal(false)
    setForm({
      name: "",
      email: "",
      username: "",
      password: "",
      role: "user",
      company: "HMorix Client",
      department: "Engineering"
    })
    loadUsers()
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setMessage(null)
    const response = await fetch(`${config.apiUrl}/admin/users`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingUser.id || editingUser._id,
        name: editingUser.name,
        role: editingUser.role,
        company: editingUser.company,
        status: editingUser.status || "active"
      })
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage({ type: "error", text: data.error || "Unable to update user" })
      return
    }
    setMessage({ type: "success", text: "User profile & permissions updated." })
    setEditingUser(null)
    loadUsers()
  }

  const handleDeleteUser = async (user: UserItem) => {
    if (!confirm(`Are you sure you want to permanently delete account "${user.email}"?`)) return
    const response = await fetch(`${config.apiUrl}/admin/users?id=${encodeURIComponent(user.id || user._id || user.email)}`, {
      method: "DELETE",
      credentials: "include"
    })
    if (response.ok) {
      setMessage({ type: "success", text: `User account "${user.email}" removed.` })
      loadUsers()
    }
  }

  const exportUsers = () => {
    const jsonStr = JSON.stringify(users, null, 2)
    const blob = new Blob([jsonStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hmorix-users-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }

  const filtered = users.filter(u => {
    const matchSearch =
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.company || "").toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || (u.status || "active") === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="pt-28 pb-20 min-h-screen bg-obsidian text-cream">
      <SEOHead
        title="User & Access Management | HMorix Admin"
        description="Comprehensive user administration — manage credentials, assign RBAC portal roles, and monitor user statuses."
        keywords="user management, admin users, RBAC roles, security access, credentials"
        canonical="/admin/users"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-xs text-cream/50 hover:text-[#C8FF00] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Admin Console
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={exportUsers}
              className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Download size={13} /> Export Roster
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5"
            >
              <Plus size={13} /> + Provision User
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
              User & Access Administration
            </h1>
            <p className="text-cream/50 text-sm mt-1">
              Configure RBAC permissions, create portal logins, and audit account states.
            </p>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-[12px] border text-sm flex items-center gap-2 ${
              message.type === "success"
                ? "bg-[#C8FF00]/10 border-[#C8FF00]/30 text-[#C8FF00]"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {message.type === "success" ? <Check size={16} /> : null}
            <div>{message.text}</div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/40" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && loadUsers()}
              placeholder="Search by name, email, company..."
              className="w-full pl-10 pr-4 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
          >
            <option value="all">All Portal Roles</option>
            <option value="admin">Super Admin</option>
            <option value="manager">Delivery Manager</option>
            <option value="hr">HR Manager</option>
            <option value="sales">Field Sales</option>
            <option value="crm">Commercial CRM</option>
            <option value="employee">Engineer / Employee</option>
            <option value="user">Client / Customer</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-obsidian-2 border border-glass-border rounded-[18px] max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-glass-border">
                <h3 className="font-display font-semibold text-base text-cream">Provision User Account</h3>
                <button onClick={() => setShowAddModal(false)} className="text-cream/40 hover:text-cream">✕</button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Full Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Vikram Singhania"
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="vikram@singhania.com"
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Portal Access Role *</label>
                    <select
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    >
                      <option value="user">Client / Customer (/portal)</option>
                      <option value="employee">Engineer / Employee (/employee)</option>
                      <option value="manager">Delivery Manager (/manager)</option>
                      <option value="hr">HR Manager (/hrm)</option>
                      <option value="sales">Field Sales Rep (/sales)</option>
                      <option value="crm">Commercial CRM Executive (/crm)</option>
                      <option value="admin">Super Administrator (/admin)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Company / Entity</label>
                    <input
                      value={form.company}
                      onChange={e => setForm({ ...form, company: e.target.value })}
                      placeholder="Singhania Industries"
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Custom Password (Optional)</label>
                  <input
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Auto-generated secure password if blank"
                    className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-glass-border">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline text-xs py-2 px-4">Cancel</button>
                  <button type="submit" className="btn-primary text-xs py-2 px-6">Create User</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-obsidian-2 border border-glass-border rounded-[18px] max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-glass-border">
                <h3 className="font-display font-semibold text-base text-cream">Edit User: {editingUser.email}</h3>
                <button onClick={() => setEditingUser(null)} className="text-cream/40 hover:text-cream">✕</button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Full Name</label>
                  <input
                    value={editingUser.name}
                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Assigned Role</label>
                  <select
                    value={editingUser.role}
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  >
                    <option value="user">Client / Customer</option>
                    <option value="employee">Engineer / Employee</option>
                    <option value="manager">Delivery Manager</option>
                    <option value="hr">HR Manager</option>
                    <option value="sales">Field Sales</option>
                    <option value="crm">Commercial CRM</option>
                    <option value="admin">Super Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Account Status</label>
                  <select
                    value={editingUser.status || "active"}
                    onChange={e => setEditingUser({ ...editingUser, status: e.target.value })}
                    className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="suspended">Suspended / Banned</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Company</label>
                  <input
                    value={editingUser.company || ""}
                    onChange={e => setEditingUser({ ...editingUser, company: e.target.value })}
                    className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-glass-border">
                  <button type="button" onClick={() => setEditingUser(null)} className="btn-outline text-xs py-2 px-4">Cancel</button>
                  <button type="submit" className="btn-primary text-xs py-2 px-6">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-cream/40 text-xs border-b border-glass-border bg-white/[0.02]">
                  <th className="p-4 font-medium">User Profile</th>
                  <th className="p-4 font-medium">Portal Role</th>
                  <th className="p-4 font-medium hidden sm:table-cell">Company / Entity</th>
                  <th className="p-4 font-medium hidden md:table-cell">Created Date</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/50">
                {loading ? (
                  <tr><td colSpan={6} className="p-12 text-center text-cream/40">Loading users...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-cream/40">No users found.</td></tr>
                ) : (
                  filtered.map(u => (
                    <tr key={u.id || u._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#C8FF00] text-obsidian font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {String(u.name || u.email || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-cream text-xs">{u.name || "User"}</div>
                            <div className="text-[10px] text-cream/40">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === "admin"
                            ? "bg-red-500/20 text-red-400"
                            : u.role === "manager"
                            ? "bg-purple-500/20 text-purple-400"
                            : u.role === "hr"
                            ? "bg-pink-500/20 text-pink-400"
                            : u.role === "sales" || u.role === "crm"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-green-500/20 text-green-400"
                        }`}>
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-cream/70 hidden sm:table-cell">
                        {u.company || "HMorix"}
                      </td>
                      <td className="p-4 text-xs text-cream/40 hidden md:table-cell font-mono">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "Recent"}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          (u.status || "active") === "active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {u.status || "active"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingUser(u)}
                            className="p-1.5 text-cream/50 hover:text-[#C8FF00] rounded hover:bg-white/[0.04]"
                            title="Edit Permissions"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 text-cream/50 hover:text-red-400 rounded hover:bg-white/[0.04]"
                            title="Delete User"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
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
