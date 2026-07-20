import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense, useState, useEffect } from 'react'
import { useAuth } from './lib/AuthContext'
import MainLayout from './layouts/MainLayout'
import CommandPalette from './components/CommandPalette'

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
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Architecture = lazy(() => import('./pages/Architecture'))
const Careers = lazy(() => import('./pages/Careers'))
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
const BlogPost = lazy(() => import('./pages/blog/BlogPost'))
const AdminBlogManager = lazy(() => import('./pages/blog/AdminBlogManager'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminLogs = lazy(() => import('./pages/admin/AdminLogs'))
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
const HRMDashboard = lazy(() => import('./pages/hrm/HRMDashboard'))
const Recruitment = lazy(() => import('./pages/hrm/Recruitment'))
const Payroll = lazy(() => import('./pages/hrm/Payroll'))
const AnalyticsDashboard = lazy(() => import('./pages/analytics/AnalyticsDashboard'))

function App() {
  const [commandOpen, setCommandOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(prev => !prev)
      }
      if (e.key === 'Escape') setCommandOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
      <Suspense fallback={appLoader}>
        <Routes>
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
          <Route path="/blog/:slug" element={<BlogPost />} />

          {/* Enterprise Trust Layer */}
          <Route path="/security" element={<Security />} />
          <Route path="/status" element={<Status />} />
          <Route path="/trust" element={<Trust />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/support" element={<Support />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/whitepapers" element={<Whitepapers />} />
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/activity" element={<ActivityFeed />} />

          {/* CRM */}
          <Route path="/crm" element={<CRMDashboard />} />
          <Route path="/crm/contacts" element={<Contacts />} />
          <Route path="/crm/deals" element={<Deals />} />
          <Route path="/crm/pipeline" element={<Deals />} />

          {/* HRM */}
          <Route path="/hrm" element={<HRMDashboard />} />
          <Route path="/hrm/recruitment" element={<Recruitment />} />
          <Route path="/hrm/payroll" element={<Payroll />} />

          {/* Analytics */}
          <Route path="/analytics" element={<AnalyticsDashboard />} />

          {/* Company */}
          <Route path="/careers" element={<Careers />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/media-kit" element={<MediaKit />} />
          <Route path="/press" element={<PressReleases />} />

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
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/search-account" element={<SearchAccount />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
