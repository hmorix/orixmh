import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import SEOHead from "../../components/seo/SEOHead"
import {
  Save,
  Globe,
  Mail,
  Shield,
  Database,
  Zap,
  Bell,
  ArrowLeft,
  Check,
  RefreshCw,
  Sparkles
} from "lucide-react"
import { config } from "../../lib/config"

const sections = ["General", "Email & Alerts", "Security & RBAC", "Database & Cluster", "API Keys"]

export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState("General")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [settings, setSettings] = useState({
    platformName: "HMorix Cloud Platform",
    domain: "hmorix.in",
    supportEmail: "support@hmorix.com",
    timezone: "Asia/Kolkata (IST)",
    maintenanceMode: false,
    userRegistration: true,
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "support@hmorix.com",
    fromEmail: "support@hmorix.com",
    enforce2FA: true,
    sessionTimeout: 60,
    auditLogging: true,
    dbProvider: "MongoDB Atlas Cluster",
    dbRegion: "ap-south-1 (Mumbai)",
    corsOrigins: "https://hmorix.in, http://localhost:5173"
  })

  useEffect(() => {
    fetch(`${config.apiUrl}/settings`, { credentials: "include", cache: "no-store" })
      .then(async r => {
        const d = await r.json().catch(() => ({}))
        if (r.ok && d.data) {
          setSettings(prev => ({ ...prev, ...d.data }))
        }
      })
      .catch(() => null)
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const response = await fetch(`${config.apiUrl}/settings`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      })
      if (!response.ok) throw new Error("Failed to update settings")
      setMessage({ type: "success", text: "Global system configuration updated & saved." })
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-28 pb-20 min-h-screen bg-obsidian text-cream">
      <SEOHead
        title="Global Platform Settings | HMorix Admin"
        description="Configure enterprise system settings, database cluster connections, security policies, and email endpoints."
        keywords="system settings, platform configuration, database cluster, security rules"
        canonical="/admin/settings"
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-xs text-cream/50 hover:text-[#C8FF00] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Admin Console
          </Link>
          <span className="text-xs px-2.5 py-1 bg-white/[0.04] border border-glass-border rounded-full text-cream/40 font-mono">
            Environment: Production (Vercel Node.js Edge)
          </span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
              System Configuration & Architecture
            </h1>
            <p className="text-cream/50 text-sm mt-1">
              Global platform controls, authentication rules, database cluster parameters, and routing.
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

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="space-y-1 bg-obsidian-2 border border-glass-border p-3 rounded-[14px] h-fit">
            {sections.map(s => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-[8px] transition-all flex items-center justify-between ${
                  activeSection === s
                    ? "bg-[#C8FF00] text-obsidian font-bold shadow-md"
                    : "text-cream/50 hover:text-cream hover:bg-white/[0.03]"
                }`}
              >
                <span>{s}</span>
              </button>
            ))}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSave} className="lg:col-span-3 space-y-6">
            {activeSection === "General" && (
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-4">
                <h3 className="font-display font-semibold text-base flex items-center gap-2 pb-3 border-b border-glass-border">
                  <Globe size={16} className="text-[#C8FF00]" /> General Platform Settings
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Platform Title</label>
                    <input
                      value={settings.platformName}
                      onChange={e => setSettings({ ...settings, platformName: e.target.value })}
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Production Domain</label>
                    <input
                      value={settings.domain}
                      onChange={e => setSettings({ ...settings, domain: e.target.value })}
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Support Contact Email</label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Default System Timezone</label>
                    <select
                      value={settings.timezone}
                      onChange={e => setSettings({ ...settings, timezone: e.target.value })}
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    >
                      <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                      <option value="America/New_York (EST)">America/New_York (EST)</option>
                      <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-glass-border space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-obsidian border border-glass-border rounded-[10px]">
                    <div>
                      <div className="text-xs font-semibold text-cream">Public User Registration</div>
                      <div className="text-[10px] text-cream/40">Allow new users to sign up via /signup and OAuth</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, userRegistration: !settings.userRegistration })}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                        settings.userRegistration
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {settings.userRegistration ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-obsidian border border-glass-border rounded-[10px]">
                    <div>
                      <div className="text-xs font-semibold text-cream">Maintenance Mode</div>
                      <div className="text-[10px] text-cream/40">Redirect non-admin visitors to maintenance screen</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                        settings.maintenanceMode
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-white/[0.04] text-cream/60 border border-glass-border"
                      }`}
                    >
                      {settings.maintenanceMode ? "ACTIVE" : "OFF"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "Email & Alerts" && (
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-4">
                <h3 className="font-display font-semibold text-base flex items-center gap-2 pb-3 border-b border-glass-border">
                  <Mail size={16} className="text-[#C8FF00]" /> SMTP & Dispatch Endpoints
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">SMTP Server Host</label>
                    <input
                      value={settings.smtpHost}
                      onChange={e => setSettings({ ...settings, smtpHost: e.target.value })}
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">SMTP Port</label>
                    <input
                      value={settings.smtpPort}
                      onChange={e => setSettings({ ...settings, smtpPort: e.target.value })}
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-cream/70 font-medium">From Email Sender</label>
                    <input
                      value={settings.fromEmail}
                      onChange={e => setSettings({ ...settings, fromEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "Security & RBAC" && (
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-4">
                <h3 className="font-display font-semibold text-base flex items-center gap-2 pb-3 border-b border-glass-border">
                  <Shield size={16} className="text-[#C8FF00]" /> Security Policies & Compliance
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-obsidian border border-glass-border rounded-[10px]">
                    <div>
                      <div className="text-xs font-semibold text-cream">Universal Audit Logging</div>
                      <div className="text-[10px] text-cream/40">Log all API mutations, user creations, and financial triggers to activity_log</div>
                    </div>
                    <span className="px-2.5 py-0.5 bg-green-500/20 text-green-400 rounded text-[10px] font-bold">
                      ENFORCED
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-obsidian border border-glass-border rounded-[10px]">
                    <div>
                      <div className="text-xs font-semibold text-cream">Signed Session Cookies (HMAC-SHA256)</div>
                      <div className="text-[10px] text-cream/40">HttpOnly + SameSite=Lax cryptographic session validation</div>
                    </div>
                    <span className="px-2.5 py-0.5 bg-[#C8FF00]/20 text-[#C8FF00] rounded text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "Database & Cluster" && (
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-4">
                <h3 className="font-display font-semibold text-base flex items-center gap-2 pb-3 border-b border-glass-border">
                  <Database size={16} className="text-[#C8FF00]" /> Primary Database Cluster
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Provider</label>
                    <input
                      disabled
                      value={settings.dbProvider}
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream/60 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-cream/70 font-medium">Primary Cluster Region</label>
                    <input
                      disabled
                      value={settings.dbRegion}
                      className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream/60 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "API Keys" && (
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] space-y-4">
                <h3 className="font-display font-semibold text-base flex items-center gap-2 pb-3 border-b border-glass-border">
                  <Zap size={16} className="text-[#C8FF00]" /> CORS & Edge Access
                </h3>

                <div className="space-y-1">
                  <label className="text-xs text-cream/70 font-medium">Allowed CORS Origins</label>
                  <input
                    value={settings.corsOrigins}
                    onChange={e => setSettings({ ...settings, corsOrigins: e.target.value })}
                    className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00]"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2 disabled:opacity-60"
              >
                <Save size={14} /> {loading ? "Saving Settings..." : "Save Platform Settings"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
