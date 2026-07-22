import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Menu, X, Moon, Sun, Bell, User, LogOut } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { useTheme } from '../lib/ThemeContext'
import { config } from '../lib/config'

interface NavbarProps {
  onCommandOpen: () => void
}

export default function Navbar({ onCommandOpen }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMobileOpen(false); setNotifOpen(false); setUserOpen(false) }, [location])

  useEffect(() => {
    if (!user) return
    fetch(`${config.apiUrl}/notifications`, { credentials: 'include', cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}))
        if (response.ok) setNotifications(data.data || [])
      })
      .catch(() => setNotifications([]))
  }, [user])

  const unreadCount = notifications.filter(item => !item.read).length

  const markNotificationsRead = async () => {
    await fetch(`${config.apiUrl}/notifications`, { method: 'PUT', credentials: 'include' }).catch(() => null)
    setNotifications(prev => prev.map(item => ({ ...item, read: true })))
  }

  const handleThemeToggle = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    await setTheme(newTheme)
  }

  const handleSignOut = async () => {
    await signOut()
    setUserOpen(false)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 border-b ${scrolled ? 'bg-obsidian/85 backdrop-blur-[20px] border-glass-border' : 'border-transparent'}`}>
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="flex items-center justify-between gap-8">
          <Link to="/" className="flex items-center gap-3 font-display font-bold text-xl tracking-tight">
            <div className="w-9 h-9 bg-cream flex items-center justify-center text-obsidian text-xs font-bold" style={{clipPath:'polygon(0 0, 78% 0, 100% 22%, 100% 78%, 78% 100%, 0 100%)'}}>HM</div>
            <span>HMorix</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            <Link to="/" className="px-3 py-1.5 text-sm font-medium text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px] transition-all">Home</Link>
            
            {/* Services Dropdown */}
            <div className="relative group">
              <button className="px-3 py-1.5 text-sm font-medium text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px] transition-all">Services ▾</button>
              <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-obsidian-2 border border-glass-border rounded-[8px] p-2 min-w-[240px] backdrop-blur-[20px]">
                <Link to="/services/web-design" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Web Design & Development</Link>
                <Link to="/services/mobile-apps" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Mobile App & APK Dev</Link>
                <Link to="/services/ai-solutions" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">AI & Machine Learning</Link>
                <Link to="/services/software-development" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Software Development</Link>
                <Link to="/services/digital-marketing" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Digital Marketing & SEO</Link>
                <Link to="/services/advertising" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Advertising & Ad Tech</Link>
                <Link to="/services/ecommerce" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">E-commerce Solutions</Link>
                <div className="border-t border-glass-border my-1" />
                <Link to="/services" className="block px-3 py-2 text-sm text-[#C8FF00] hover:bg-white/[0.04] rounded-[4px]">View All Services</Link>
              </div>
            </div>

            {/* Products Dropdown */}
            <div className="relative group">
              <button className="px-3 py-1.5 text-sm font-medium text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px] transition-all">Products ▾</button>
              <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-obsidian-2 border border-glass-border rounded-[8px] p-2 min-w-[220px] backdrop-blur-[20px]">
                <Link to="/billingflow" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">BillingFlow</Link>
                <Link to="/agent" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">AI Agent</Link>
                <Link to="/pdf-automation" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">PDF Automation</Link>
                <Link to="/smart-home" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Smart Home</Link>
                <div className="border-t border-glass-border my-1" />
                <Link to="/playground" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">AI Playground</Link>
              </div>
            </div>

            {/* Platform Dropdown */}
            <div className="relative group">
              <button className="px-3 py-1.5 text-sm font-medium text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px] transition-all">Platform ▾</button>
              <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-obsidian-2 border border-glass-border rounded-[8px] p-2 min-w-[220px] backdrop-blur-[20px]">
                <Link to="/developers" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Developers</Link>
                <Link to="/dashboard" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Dashboard</Link>
                <Link to="/architecture" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Architecture</Link>
                <Link to="/portal" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Client Portal</Link>
                <Link to="/activity" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Activity Feed</Link>
              </div>
            </div>

            {/* Resources Dropdown */}
            <div className="relative group">
              <button className="px-3 py-1.5 text-sm font-medium text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px] transition-all">Resources ▾</button>
              <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-obsidian-2 border border-glass-border rounded-[8px] p-2 min-w-[220px] backdrop-blur-[20px]">
                <Link to="/blog" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Blog</Link>
                <Link to="/case-studies" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Case Studies</Link>
                <Link to="/whitepapers" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Whitepapers</Link>
                <Link to="/knowledge-base" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Knowledge Base</Link>
                <Link to="/support" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Support</Link>
                <Link to="/faq" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">FAQ</Link>
                <Link to="/testimonials" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Testimonials</Link>
              </div>
            </div>

            {/* Trust Dropdown */}
            <div className="relative group">
              <button className="px-3 py-1.5 text-sm font-medium text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px] transition-all">Trust ▾</button>
              <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-obsidian-2 border border-glass-border rounded-[8px] p-2 min-w-[220px] backdrop-blur-[20px]">
                <Link to="/security" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Security Center</Link>
                <Link to="/status" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">System Status</Link>
                <Link to="/trust" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Trust Center</Link>
                <Link to="/compliance" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Compliance</Link>
                <Link to="/certifications" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Certifications</Link>
              </div>
            </div>

            <Link to="/pricing" className="px-3 py-1.5 text-sm font-medium text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px] transition-all">Pricing</Link>

            {/* Company Dropdown */}
            <div className="relative group">
              <button className="px-3 py-1.5 text-sm font-medium text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px] transition-all">Company ▾</button>
              <div className="hidden group-hover:block absolute top-full right-0 mt-2 bg-obsidian-2 border border-glass-border rounded-[8px] p-2 min-w-[220px] backdrop-blur-[20px]">
                <Link to="/about" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">About</Link>
                <Link to="/careers" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Careers</Link>
                <Link to="/investors" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Investors</Link>
                <Link to="/partners" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Partners</Link>
                <Link to="/roadmap" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Roadmap</Link>
                <Link to="/press" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Press Releases</Link>
                <Link to="/media-kit" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Media Kit</Link>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onCommandOpen} className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-glass-border rounded-[4px] text-sm text-cream/60 hover:text-cream hover:border-cream transition-all">
              <Search size={14} /> <span className="text-xs">⌘K</span>
            </button>

            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false) }} className="w-9 h-9 border border-glass-border rounded-[4px] flex items-center justify-center text-cream/60 hover:text-cream hover:border-cream transition-all relative">
                  <Bell size={16} />
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C8FF00] rounded-full text-[8px] text-obsidian font-bold flex items-center justify-center">{unreadCount}</span>}
                </button>
                {notifOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-obsidian-2 border border-glass-border rounded-[8px] p-4 backdrop-blur-[20px]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold">Notifications</span>
                      <button onClick={markNotificationsRead} className="text-[10px] text-[#C8FF00]">Mark all read</button>
                    </div>
                    <div className="space-y-2">
                      {notifications.length === 0 && <div className="p-2 text-xs text-cream/40">No notifications yet.</div>}
                      {notifications.map((n, i) => (
                        <div key={n._id || i} className={`p-2 rounded-[4px] hover:bg-white/[0.04] cursor-pointer ${n.read ? 'bg-white/[0.01]' : 'bg-white/[0.03]'}`}>
                          <div className="text-xs font-medium">{n.title}</div>
                          <div className="text-[10px] text-cream/30">{n.message} · {new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                    <Link to="/activity" className="block text-center text-xs text-[#C8FF00] mt-3 hover:underline">View all activity</Link>
                  </div>
                )}
              </div>
            )}

            <button onClick={handleThemeToggle} className="w-9 h-9 border border-glass-border rounded-[4px] flex items-center justify-center text-cream/60 hover:text-cream hover:border-cream transition-all">
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative hidden md:block">
                <button onClick={() => { setUserOpen(!userOpen); setNotifOpen(false) }} className="w-9 h-9 bg-obsidian-3 border border-glass-border rounded-full flex items-center justify-center text-cream/60 hover:text-cream hover:border-cream transition-all">
                  <User size={16} />
                </button>
                {userOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-obsidian-2 border border-glass-border rounded-[8px] p-2 backdrop-blur-[20px]">
                    <div className="px-3 py-2 border-b border-glass-border mb-1">
                      <div className="text-sm font-medium">{user.user_metadata?.name || 'User'}</div>
                      <div className="text-[10px] text-cream/30">{user.email}</div>
                    </div>
                    <Link to="/profile" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Profile</Link>
                    <Link to="/settings" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Settings</Link>
                    <Link to="/portal" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Client Portal</Link>
                    <Link to="/dashboard" className="block px-3 py-2 text-sm text-cream/60 hover:text-cream hover:bg-white/[0.04] rounded-[4px]">Dashboard</Link>
                    <div className="border-t border-glass-border mt-1 pt-1">
                      <button onClick={handleSignOut} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-[4px] flex items-center gap-2">
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/signin" className="btn-outline hidden md:inline-flex">Login</Link>
                <Link to="/signup" className="btn-primary hidden md:inline-flex">Get Started</Link>
              </>
            )}

            {/* Mobile Menu */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-9 h-9 border border-glass-border rounded-[4px] flex items-center justify-center text-cream/60">
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4 bg-obsidian-2/95 border border-glass-border rounded-[12px] p-2 shadow-2xl backdrop-blur-[24px]">
            <Link to="/" className="block px-3 py-2 text-sm text-cream/85 hover:text-cream hover:bg-white/[0.08] rounded-[6px]">Home</Link>
            <Link to="/services" className="block px-3 py-2 text-sm text-cream/85 hover:text-cream hover:bg-white/[0.08] rounded-[6px]">Services</Link>
            <Link to="/billingflow" className="block px-3 py-2 text-sm text-cream/85 hover:text-cream hover:bg-white/[0.08] rounded-[6px]">BillingFlow</Link>
            <Link to="/agent" className="block px-3 py-2 text-sm text-cream/85 hover:text-cream hover:bg-white/[0.08] rounded-[6px]">AI Agent</Link>
            <Link to="/pricing" className="block px-3 py-2 text-sm text-cream/85 hover:text-cream hover:bg-white/[0.08] rounded-[6px]">Pricing</Link>
            <Link to="/blog" className="block px-3 py-2 text-sm text-cream/85 hover:text-cream hover:bg-white/[0.08] rounded-[6px]">Blog</Link>
            {user ? (
              <>
                <Link to="/profile" className="block px-3 py-2 text-sm text-cream/85 hover:text-cream hover:bg-white/[0.08] rounded-[6px]">Profile</Link>
                <Link to="/settings" className="block px-3 py-2 text-sm text-cream/85 hover:text-cream hover:bg-white/[0.08] rounded-[6px]">Settings</Link>
                <button onClick={handleSignOut} className="w-full text-left px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 rounded-[6px]">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/signin" className="block px-3 py-2 text-sm text-cream/85 hover:text-cream hover:bg-white/[0.08] rounded-[6px]">Login</Link>
                <Link to="/signup" className="block px-3 py-2 text-sm text-[#C8FF00] hover:bg-white/[0.08] rounded-[6px]">Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
