import { Routes, Route, useNavigate } from 'react-router-dom'
import { Component, lazy, Suspense, useState, useEffect, type ReactNode } from 'react'
import { useAuth } from './lib/AuthContext'
import { useTheme } from './lib/ThemeContext'
import { config } from './lib/config'
import MainLayout from './layouts/MainLayout'
import CommandPalette from './components/CommandPalette'
import OfflineStatus from './components/OfflineStatus'
import OfflinePage from './pages/OfflinePage'
import { GeneratedBlogPost, GeneratedContentPage } from './pages/generated/GeneratedContentPage'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Services = lazy(() => import('./pages/Services'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Contact = lazy(() => import('./pages/Contact'))
const Security = lazy(() => import('./pages/Security'))
const Status = lazy(() => import('./pages/Status'))
const Trust = lazy(() => import('./pages/Trust'))
const Compliance = lazy(() => import('./pages/Compliance'))
const BillingFlow = lazy(() => import('./pages/products/BillingFlow'))
const BillingFlowFeatures = lazy(() => import('./pages/products/BillingFlowFeatures'))
const BillingFlowPricing = lazy(() => import('./pages/products/BillingFlowPricing'))
const BillingFlowDocs = lazy(() => import('./pages/products/BillingFlowDocs'))
const BillingFlowAPI = lazy(() => import('./pages/products/BillingFlowAPI'))
const BillingFlowDemo = lazy(() => import('./pages/products/BillingFlowDemo'))
const BillingFlowChangelog = lazy(() => import('./pages/products/BillingFlowChangelog'))
const AIAgent = lazy(() => import('./pages/products/AIAgent'))
const AIAgentPlayground = lazy(() => import('./pages/products/AIAgentPlayground'))
const AIAgentDocs = lazy(() => import('./pages/products/AIAgentDocs'))
const AIAgentTemplates = lazy(() => import('./pages/products/AIAgentTemplates'))
const AIAgentWorkflows = lazy(() => import('./pages/products/AIAgentWorkflows'))
const AIAgentExamples = lazy(() => import('./pages/products/AIAgentExamples'))
const PDFAutomation = lazy(() => import('./pages/products/PDFAutomation'))
const PDFDocs = lazy(() => import('./pages/products/PDFDocs'))
const PDFDemo = lazy(() => import('./pages/products/PDFDemo'))
const PDFTemplates = lazy(() => import('./pages/products/PDFTemplates'))
const Developers = lazy(() => import('./pages/Developers'))
const Playground = lazy(() => import('./pages/Playground'))
const SmartHome = lazy(() => import('./pages/SmartHome'))
const HarshSharma = lazy(() => import('./pages/HarshSharma'))
const HarshSharmaDeveloper = lazy(() => import('./pages/HarshSharmaDeveloper'))
const LocalServices = lazy(() => import('./pages/LocalServices'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Architecture = lazy(() => import('./pages/Architecture'))
const Careers = lazy(() => import('./pages/Careers'))
const ApplyJob = lazy(() => import('./pages/ApplyJob'))
const Investors = lazy(() => import('./pages/Investors'))
const Partners = lazy(() => import('./pages/Partners'))
const Roadmap = lazy(() => import('./pages/Roadmap'))
const KnowledgeBase = lazy(() => import('./pages/KnowledgeBase'))
const Support = lazy(() => import('./pages/Support'))
const Profile = lazy(() => import('./pages/Profile'))
const Retry = lazy(() => import('./pages/Retry'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Settings = lazy(() => import('./pages/settings/Settings'))
const ClientPortal = lazy(() => import('./pages/portal/ClientPortal'))
const CaseStudies = lazy(() => import('./pages/CaseStudies'))
const Whitepapers = lazy(() => import('./pages/Whitepapers'))
const MediaKit = lazy(() => import('./pages/MediaKit'))
const PressReleases = lazy(() => import('./pages/PressReleases'))
const Certifications = lazy(() => import('./pages/Certifications'))
const ActivityFeed = lazy(() => import('./pages/ActivityFeed'))
const BlogList = lazy(() => import('./pages/blog/BlogList'))
const AdminBlogManager = lazy(() => import('./pages/blog/AdminBlogManager'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminLogs = lazy(() => import('./pages/admin/AdminLogs'))
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'))
const EmployeePortal = lazy(() => import('./pages/employee/EmployeePortal'))
const Directory = lazy(() => import('./pages/employee/Directory'))
const Requests = lazy(() => import('./pages/employee/Requests'))
const Tasks = lazy(() => import('./pages/employee/Tasks'))
const BillingAssignment = lazy(() => import('./pages/employee/BillingAssignment'))
const SignIn = lazy(() => import('./pages/auth/SignIn'))
const SignUp = lazy(() => import('./pages/auth/SignUp'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const Verify = lazy(() => import('./pages/auth/Verify'))
const SearchAccount = lazy(() => import('./pages/auth/SearchAccount'))
const ProfileSetup = lazy(() => import('./pages/auth/ProfileSetup'))
const WebDesign = lazy(() => import('./pages/services/WebDesign'))
const MobileApps = lazy(() => import('./pages/services/MobileApps'))
const DigitalMarketing = lazy(() => import('./pages/services/DigitalMarketing'))
const AISolutions = lazy(() => import('./pages/services/AISolutions'))
const SoftwareDev = lazy(() => import('./pages/services/SoftwareDev'))
const Advertising = lazy(() => import('./pages/services/Advertising'))
const Ecommerce = lazy(() => import('./pages/services/Ecommerce'))
const Sitemap = lazy(() => import('./pages/Sitemap'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Testimonials = lazy(() => import('./pages/Testimonials'))
const Terms = lazy(() => import('./pages/legal/Terms'))
const Privacy = lazy(() => import('./pages/legal/Privacy'))
const CRMDashboard = lazy(() => import('./pages/crm/CRMDashboard'))
const Contacts = lazy(() => import('./pages/crm/Contacts'))
const Deals = lazy(() => import('./pages/crm/Deals'))
const SalesPortal = lazy(() => import('./pages/sales/SalesPortal'))
const HRMDashboard = lazy(() => import('./pages/hrm/HRMDashboard'))
const Recruitment = lazy(() => import('./pages/hrm/Recruitment'))
const Payroll = lazy(() => import('./pages/hrm/Payroll'))
const Leaves = lazy(() => import('./pages/hrm/Leaves'))
const AddEmployee = lazy(() => import('./pages/hrm/AddEmployee'))
const ManagerPortal = lazy(() => import('./pages/manager/ManagerPortal'))
const AnalyticsDashboard = lazy(() => import('./pages/analytics/AnalyticsDashboard'))
const EmployeeLogin = lazy(() => import('./pages/employee/EmployeeLogin'))

class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      if (!navigator.onLine) return <OfflinePage />
      return (
        <div className="min-h-screen bg-obsidian flex items-center justify-center px-6">
          <div className="max-w-[420px] text-center">
            <h1 className="font-display text-2xl font-bold text-cream mb-2">Something went wrong</h1>
            <p className="text-sm text-cream/50 mb-6">Refresh the page or sign in again if your session has expired.</p>
            <div className="flex justify-center gap-3">
              <a href={window.location.pathname} className="btn-primary">Refresh</a>
              <a href="/" className="btn-outline">Return Home</a>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  const [commandOpen, setCommandOpen] = useState(false)
  const [shortcutsEnabled, setShortcutsEnabled] = useState(() => localStorage.getItem('keyboardShortcuts') !== 'false')
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    fetch(`${config.apiUrl}/settings`, { credentials: 'include', cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(payload => {
        if (payload?.data?.keyboardShortcuts !== undefined) {
          const enabled = Boolean(payload.data.keyboardShortcuts)
          localStorage.setItem('keyboardShortcuts', String(enabled))
          setShortcutsEnabled(enabled)
        }
      })
      .catch(() => null)

    const handleSettingsChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ keyboardShortcuts?: boolean }>
      if (customEvent.detail?.keyboardShortcuts !== undefined) {
        setShortcutsEnabled(Boolean(customEvent.detail.keyboardShortcuts))
      }
    }
    window.addEventListener('hm-settings-change', handleSettingsChange)
    return () => window.removeEventListener('hm-settings-change', handleSettingsChange)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!shortcutsEnabled && e.key !== 'Escape') return
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(prev => !prev)
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        navigate('/dashboard')
      }
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault()
        navigate('/settings')
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault()
        setTheme(theme === 'dark' ? 'light' : 'dark')
      }
      if (e.key === 'Escape') setCommandOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, setTheme, shortcutsEnabled, theme])

  const { loading } = useAuth()

  const appLoader = (
    <div className="min-h-screen bg-obsidian flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-crimson border-t-transparent rounded-full animate-spin"></div>
        <p className="text-cream/60 font-mono text-sm animate-pulse">Initializing HMorix Platform...</p>
      </div>
    </div>
  )

  if (loading) {
    return (
      appLoader
    )
  }

  return (
    <>
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
      <OfflineStatus />
      <AppErrorBoundary>
        <Suspense fallback={appLoader}>
          <Routes>
          <Route path="/offline" element={<OfflinePage />} />
          <Route element={<MainLayout onCommandOpen={() => setCommandOpen(true)} />}>
          {/* Core Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />

          {/* Service Pages (SEO-optimized) */}
          <Route path="/services/web-design" element={<WebDesign />} />
          <Route path="/services/mobile-apps" element={<MobileApps />} />
          <Route path="/services/digital-marketing" element={<DigitalMarketing />} />
          <Route path="/services/ai-solutions" element={<AISolutions />} />
          <Route path="/services/software-development" element={<SoftwareDev />} />
          <Route path="/services/advertising" element={<Advertising />} />
          <Route path="/services/ecommerce" element={<Ecommerce />} />

          {/* Blog */}
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<GeneratedBlogPost />} />

          {/* Enterprise Trust Layer */}
          <Route path="/security" element={<Security />} />
          <Route path="/status" element={<Status />} />
          <Route path="/trust" element={<Trust />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/support" element={<Support />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/case-studies/:slug" element={<GeneratedContentPage type="caseStudies" />} />
          <Route path="/whitepapers" element={<Whitepapers />} />
          <Route path="/whitepapers/:slug" element={<GeneratedContentPage type="whitepapers" />} />
          <Route path="/certifications" element={<Certifications />} />

          {/* BillingFlow Product Ecosystem */}
          <Route path="/billingflow" element={<BillingFlow />} />
          <Route path="/billingflow/features" element={<BillingFlowFeatures />} />
          <Route path="/billingflow/pricing" element={<BillingFlowPricing />} />
          <Route path="/billingflow/docs" element={<BillingFlowDocs />} />
          <Route path="/billingflow/api" element={<BillingFlowAPI />} />
          <Route path="/billingflow/demo" element={<BillingFlowDemo />} />
          <Route path="/billingflow/changelog" element={<BillingFlowChangelog />} />

          {/* AI Agent Product Ecosystem */}
          <Route path="/agent" element={<AIAgent />} />
          <Route path="/agent/playground" element={<AIAgentPlayground />} />
          <Route path="/agent/docs" element={<AIAgentDocs />} />
          <Route path="/agent/templates" element={<AIAgentTemplates />} />
          <Route path="/agent/workflows" element={<AIAgentWorkflows />} />
          <Route path="/agent/examples" element={<AIAgentExamples />} />

          {/* PDF Automation Product Ecosystem */}
          <Route path="/pdf-automation" element={<PDFAutomation />} />
          <Route path="/pdf-automation/docs" element={<PDFDocs />} />
          <Route path="/pdf-automation/demo" element={<PDFDemo />} />
          <Route path="/pdf-automation/templates" element={<PDFTemplates />} />

          {/* Platform */}
          <Route path="/developers" element={<Developers />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/smart-home" element={<SmartHome />} />
          <Route path="/harsh-sharma" element={<HarshSharma />} />
          <Route path="/harsh-sharma-developer" element={<HarshSharmaDeveloper />} />
          <Route path="/locations/:city/:service" element={<LocalServices />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/activity" element={<ActivityFeed />} />

          {/* CRM */}
          <Route path="/crm" element={<CRMDashboard />} />
          <Route path="/crm/contacts" element={<Contacts />} />
          <Route path="/crm/deals" element={<Deals />} />
          <Route path="/crm/pipeline" element={<Deals />} />
          <Route path="/sales" element={<SalesPortal />} />

          {/* HRM */}
          <Route path="/hrm" element={<HRMDashboard />} />
          <Route path="/hrm/recruitment" element={<Recruitment />} />
          <Route path="/hrm/payroll" element={<Payroll />} />
          <Route path="/hrm/leaves" element={<Leaves />} />
          <Route path="/hrm/employees/new" element={<AddEmployee />} />
          <Route path="/manager" element={<ManagerPortal />} />

          {/* Analytics */}
          <Route path="/analytics" element={<AnalyticsDashboard />} />

          {/* Company */}
          <Route path="/careers" element={<Careers />} />
          <Route path="/careers/apply/:id" element={<ApplyJob />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/media-kit" element={<MediaKit />} />
          <Route path="/press" element={<PressReleases />} />
          <Route path="/press/:slug" element={<GeneratedContentPage type="press" />} />

          {/* SEO & Marketing Pages */}
          <Route path="/faq" element={<FAQ />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/sitemap" element={<Sitemap />} />

          {/* Legal */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* User Pages */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/retry" element={<Retry />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/portal" element={<ClientPortal />} />

          {/* Admin Portal */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/blogs" element={<AdminBlogManager />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/logs" element={<AdminLogs />} />

          {/* Employee Portal */}
          <Route path="/employee" element={<EmployeePortal />} />
          <Route path="/employee/directory" element={<Directory />} />
          <Route path="/employee/requests" element={<Requests />} />
          <Route path="/employee/tasks" element={<Tasks />} />
          <Route path="/employee/billing" element={<BillingAssignment />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Auth Pages (no layout) */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/employee/login" element={<EmployeeLogin />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/search-account" element={<SearchAccount />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          </Routes>
        </Suspense>
      </AppErrorBoundary>
    </>
  )
}

export default App
