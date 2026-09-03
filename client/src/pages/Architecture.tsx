import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../components/seo/SEOHead'
import {
  Layers,
  Play,
  ArrowRight,
  Database,
  FileCode,
  Sparkles,
  Zap,
  Copy,
  ExternalLink,
  Shield,
  Search,
  Server,
  FolderGit2,
  Clock,
  Compass,
  Cpu,
  Boxes,
  Code2
} from 'lucide-react'

interface NodeAction {
  label: string
  trigger: string
  effect: string
  target?: string
  api?: string
}

interface ProjectNode {
  id: string
  name: string
  title: string
  file: string
  path: string
  category: string
  duration: string
  working: string
  inputs: {
    type: string
    required: boolean
    exampleData: string
    notes: string
  }
  outputs: {
    type: string
    exampleOutput: string
    notes: string
  }
  buttons: NodeAction[]
  imports: string[]
  database: {
    provider: string
    collectionsOrTables: string[]
    queries: string[]
  }
  api: {
    route: string
    method: string
    handlerName: string
    handlerFile: string
    handlerPath: string
  }
  assets: {
    name: string
    path: string
    role: string
  }[]
  connectsTo: string[]
}

const PROJECT_NODES: ProjectNode[] = [
  {
    id: 'boot',
    name: 'App Bootstrap',
    title: 'Client Entry & Provider Pipeline',
    file: 'main.tsx',
    path: 'client/src/main.tsx',
    category: 'entry',
    duration: '50ms – 120ms initial bundle mount',
    working: 'Mounts the React 18 Concurrent Root onto document.getElementById("root"). Wraps the application tree in BrowserRouter (routing), AuthProvider (session state), and ThemeProvider (dark/light theme persistence). Imports global CSS resets and Tailwind styles.',
    inputs: {
      type: 'HTML Element & Browser Storage',
      required: true,
      exampleData: `// DOM container in index.html:\n<div id="root"></div>\n\n// LocalStorage initialization:\nlocalStorage.getItem('theme') // 'dark' | 'light'\nlocalStorage.getItem('keyboardShortcuts') // 'true' | 'false'`,
      notes: 'Requires active DOM container; reads initial theme & shortcuts preference.'
    },
    outputs: {
      type: 'Mounted React DOM Tree',
      exampleOutput: `<React.StrictMode>\n  <BrowserRouter>\n    <AuthProvider>\n      <ThemeProvider>\n        <App />\n      </ThemeProvider>\n    </AuthProvider>\n  </BrowserRouter>\n</React.StrictMode>`,
      notes: 'Initializes context trees and renders the central App component.'
    },
    buttons: [
      {
        label: 'Initial Browser Visit',
        trigger: 'Window onload / navigation',
        effect: 'Renders DOM tree, checks active session, mounts App component',
        target: 'App.tsx'
      }
    ],
    imports: [
      'client/src/App.tsx',
      'client/src/lib/AuthContext.tsx',
      'client/src/lib/ThemeContext.tsx',
      'client/src/styles/globals.css'
    ],
    database: {
      provider: 'None (Client Cache/Asset)',
      collectionsOrTables: ['localStorage: theme', 'localStorage: keyboardShortcuts'],
      queries: ['localStorage.getItem("theme")', 'localStorage.setItem("theme", "dark")']
    },
    api: {
      route: 'None',
      method: 'NONE',
      handlerName: 'Client-side entry',
      handlerFile: 'main.tsx',
      handlerPath: 'client/src/main.tsx'
    },
    assets: [
      { name: 'favicon.svg', path: 'client/public/favicon.svg', role: 'Browser Tab Icon' },
      { name: 'manifest.webmanifest', path: 'client/public/manifest.webmanifest', role: 'PWA Web Manifest' },
      { name: 'sw.js', path: 'client/public/sw.js', role: 'Offline Service Worker' }
    ],
    connectsTo: ['intro-animation', 'app-root']
  },
  {
    id: 'intro-animation',
    name: 'App Intro Animation',
    title: 'Cybernetic Hexagonal Boot HUD',
    file: 'AppIntroAnimation.tsx',
    path: 'client/src/components/AppIntroAnimation.tsx',
    category: 'animation',
    duration: '2,700ms total (0ms drawing -> 700ms revealing -> 1,400ms ready -> 2,100ms exit)',
    working: 'Checks sessionStorage("hm_intro_seen") and prefers-reduced-motion. If first visit in browser session, overlays a full-viewport obsidian backdrop (z-[99999]). Uses Framer Motion to draw the HMorix hexagonal cyber-shield SVG pathLength (0 to 1), triggers ambient neon lime blur aura, types out telemetry "Enterprise AI Architecture", and animates progress bar to 100% before graceful fade-out.',
    inputs: {
      type: 'Component Props & Session Storage',
      required: false,
      exampleData: `// Props:\n{\n  onComplete?: () => void\n}\n\n// Session check:\nsessionStorage.getItem('hm_intro_seen') === null\nwindow.matchMedia('(prefers-reduced-motion: reduce)').matches === false`,
      notes: 'If hm_intro_seen exists or user prefers reduced motion, component immediately returns null.'
    },
    outputs: {
      type: 'Fullscreen Animated Overlay + Unmount Event',
      exampleOutput: `// Final state:\nsessionStorage.setItem('hm_intro_seen', 'true')\nonComplete?.()\n// DOM unmounts overlay, revealing Home/App shell beneath`,
      notes: 'Reveals the main application shell with zero cumulative layout shift (CLS).'
    },
    buttons: [
      {
        label: 'SKIP [ESC]',
        trigger: 'onClick or Keydown (Escape / Enter / Spacebar)',
        effect: 'Fades out overlay within 200ms, sets hm_intro_seen="true", and calls onComplete()',
        target: 'Home.tsx'
      }
    ],
    imports: [
      'framer-motion (motion, AnimatePresence)',
      'react (useState, useEffect)'
    ],
    database: {
      provider: 'None (Client Cache/Asset)',
      collectionsOrTables: ['sessionStorage: hm_intro_seen'],
      queries: [
        'sessionStorage.getItem("hm_intro_seen")',
        'sessionStorage.setItem("hm_intro_seen", "true")'
      ]
    },
    api: {
      route: 'None',
      method: 'NONE',
      handlerName: 'Client-side Animation Pipeline',
      handlerFile: 'AppIntroAnimation.tsx',
      handlerPath: 'client/src/components/AppIntroAnimation.tsx'
    },
    assets: [
      { name: 'Hexagon Shield SVG', path: 'Inline Vector (Points: 24,3.06 42.14,13.53...)', role: 'Brand Hexagonal Vector' },
      { name: 'Cyber Grid Pattern', path: 'CSS Linear Gradient (#C8FF00 1px)', role: 'Background Grid Overlay' },
      { name: 'Radial Neon Glow', path: 'CSS Blur (#C8FF00, blur: 110px)', role: 'Ambient Backlight Aura' }
    ],
    connectsTo: ['home-page', 'app-root']
  },
  {
    id: 'app-root',
    name: 'App Root & Router',
    title: 'Core Route Matrix & Global Handlers',
    file: 'App.tsx',
    path: 'client/src/App.tsx',
    category: 'entry',
    duration: 'Persistent application lifecycle',
    working: 'Central routing table with React Router v6. Wraps views in AppErrorBoundary and Suspense fallbacks. Registers global keyboard shortcuts (Cmd+K for Command Palette, Cmd+D for Dashboard, Cmd+, for Settings, Cmd+Shift+T for Theme toggle). Fetches platform settings (/api/settings) on mount.',
    inputs: {
      type: 'URL Location & Auth State',
      required: true,
      exampleData: `// Active route location:\nwindow.location.pathname = "/hrm"\n\n// AuthContext:\n{ user: { id: "HM-001", role: "hr" }, loading: false }`,
      notes: 'Listens to route changes and keyboard event listeners.'
    },
    outputs: {
      type: 'Active Route Element & Global Overlays',
      exampleOutput: `<CommandPalette isOpen={commandOpen} />\n<OfflineStatus />\n<MainLayout>\n  <Routes> ... </Routes>\n</MainLayout>`,
      notes: 'Renders lazy-loaded page modules inside standard layout.'
    },
    buttons: [
      {
        label: 'Cmd + K / Ctrl + K',
        trigger: 'Global keydown event',
        effect: 'Opens the Command Palette overlay for rapid portal jumping',
        target: 'CommandPalette.tsx'
      },
      {
        label: 'Cmd + Shift + T',
        trigger: 'Global keydown event',
        effect: 'Toggles between Dark Obsidian and Clean Light theme',
        target: 'ThemeContext.tsx'
      }
    ],
    imports: [
      'client/src/layouts/MainLayout.tsx',
      'client/src/components/CommandPalette.tsx',
      'client/src/components/OfflineStatus.tsx',
      'client/src/components/AppIntroAnimation.tsx',
      'client/src/lib/AuthContext.tsx'
    ],
    database: {
      provider: 'MongoDB Atlas',
      collectionsOrTables: ['settings (type: "global")'],
      queries: ['db.collection("settings").findOne({ type: "global" })']
    },
    api: {
      route: '/api/settings',
      method: 'GET',
      handlerName: 'handleSettings',
      handlerFile: '[...path].ts',
      handlerPath: 'api/[...path].ts'
    },
    assets: [
      { name: 'favicon.ico', path: 'client/public/favicon.ico', role: 'Default Tab Icon' }
    ],
    connectsTo: ['home-page', 'main-layout', 'auth-signin', 'hrm-portal', 'employee-portal', 'manager-portal', 'sales-portal', 'crm-portal', 'client-portal', 'admin-portal']
  },
  {
    id: 'home-page',
    name: 'Home Landing Page',
    title: 'Enterprise Showcase & Project Launchpad',
    file: 'Home.tsx',
    path: 'client/src/pages/Home.tsx',
    category: 'page',
    duration: '1,200ms statistical counter animation',
    working: 'Public enterprise landing experience. Features animated numerical counters (12+ Enterprise Clients, 180+ Delivered Projects, 98% Client Satisfaction), interactive BillingFlow dashboard mockup, AI Agent typing simulator, enterprise services breakdown, technology stack badges, and public developer API links.',
    inputs: {
      type: 'Public Web Request (Route: "/")',
      required: false,
      exampleData: `// Route params: None\n// SEOHead Props:\n{\n  title: "HMorix – Enterprise AI Software & Digital Solutions",\n  description: "Enterprise software, AI agents, and digital solutions...",\n  canonical: "/"\n}`,
      notes: 'Fully indexable static/client rendered page with OpenGraph tags.'
    },
    outputs: {
      type: 'Rendered Public UI & Conversion Entrypoints',
      exampleOutput: 'Hero Banner + Services Grid + Enterprise Trust Layer + API Developer Card + CTA',
      notes: 'Provides one-click navigation to contact onboarding, developer portal, and products.'
    },
    buttons: [
      {
        label: 'Start a Project',
        trigger: 'onClick (Link to "/contact")',
        effect: 'Navigates to Project Inquiry & Onboarding Form',
        target: '/contact'
      },
      {
        label: 'Public API Docs',
        trigger: 'onClick (Link to "/docs")',
        effect: 'Navigates to interactive OpenAPI 3.0 Documentation',
        target: '/docs'
      },
      {
        label: 'Developer Portal',
        trigger: 'onClick (Link to "/developers")',
        effect: 'Navigates to Developer API Keys, Webhooks & SDK Sandbox',
        target: '/developers'
      },
      {
        label: 'Schedule a Call',
        trigger: 'onClick (Link to "/contact")',
        effect: 'Scrolls/redirects to booking calendar consultation',
        target: '/contact'
      },
      {
        label: 'OpenAPI Spec',
        trigger: 'onClick (Target: "_blank")',
        effect: 'Opens raw /openapi.json specification for Postman/Swagger imports',
        target: '/openapi.json'
      }
    ],
    imports: [
      'client/src/components/seo/SEOHead.tsx',
      'lucide-react (Globe, Bot, ShieldCheck, FileText, CreditCard, Home, BarChart3, Cloud, Target, Zap, Lock, Users)',
      'react-router-dom (Link)'
    ],
    database: {
      provider: 'MongoDB Atlas',
      collectionsOrTables: ['contact_submissions (upon form submission)'],
      queries: ['db.collection("contact_submissions").insertOne({ name, email, message, createdAt })']
    },
    api: {
      route: '/api/contact',
      method: 'POST',
      handlerName: 'handleContact',
      handlerFile: '[...path].ts',
      handlerPath: 'api/[...path].ts'
    },
    assets: [
      { name: 'openapi.json', path: 'client/public/openapi.json', role: 'OpenAPI 3.0 Spec' },
      { name: 'openapi.yaml', path: 'client/public/openapi.yaml', role: 'OpenAPI 3.0 YAML' }
    ],
    connectsTo: ['main-layout', 'auth-signin', 'billingflow-product', 'ai-agent-product', 'pdf-automation-product']
  },
  {
    id: 'main-layout',
    name: 'Layout & Navigation Shell',
    title: 'Brand Header, Notification Engine & Footer',
    file: 'MainLayout.tsx & Navbar.tsx',
    path: 'client/src/layouts/MainLayout.tsx',
    category: 'entry',
    duration: 'Real-time scroll detection & notification polling',
    working: 'Provides sticky frosted glass navigation bar. Detects scroll depth (>40px) to enhance background blur. Houses BrandLogo, product dropdowns, services dropdowns, unread notifications badge counter, dark/light theme switch, and user session avatar with role-specific menu.',
    inputs: {
      type: 'User Session & Scroll Position',
      required: false,
      exampleData: `// AuthContext user:\n{\n  id: "HM-USR-01",\n  name: "Harsh Sharma",\n  email: "admin@hmorix.in",\n  role: "admin"\n}\n\n// Notification fetch: GET /api/notifications`,
      notes: 'Merges local indexed notifications with remote database notifications.'
    },
    outputs: {
      type: 'Global Header + Notification Drawer + Footer',
      exampleOutput: 'Navbar with active portal links, unread count badge, and quick Sign Out button.',
      notes: 'Synchronizes unread notifications with browser system notification API.'
    },
    buttons: [
      {
        label: 'Theme Switcher (Sun/Moon)',
        trigger: 'onClick handleThemeToggle()',
        effect: 'Toggles ThemeContext, updates HTML class "dark" / "light", saves to localStorage',
        target: 'ThemeContext.tsx'
      },
      {
        label: 'Notification Bell',
        trigger: 'onClick setNotifOpen(!notifOpen)',
        effect: 'Opens dropdown showing recent notifications with "Mark all read" button',
        api: 'PUT /api/notifications'
      },
      {
        label: 'Sign Out',
        trigger: 'onClick handleSignOut()',
        effect: 'Calls /api/logout, deletes hm_session cookie, redirects to /signin',
        target: '/signin',
        api: 'POST /api/logout'
      }
    ],
    imports: [
      'client/src/components/Navbar.tsx',
      'client/src/components/Footer.tsx',
      'client/src/components/BrandLogo.tsx',
      'client/src/lib/notificationStore.ts'
    ],
    database: {
      provider: 'MongoDB Atlas',
      collectionsOrTables: ['notifications'],
      queries: [
        'db.collection("notifications").find({ $or: [{ userId }, { role }, { broadcast: true }] }).sort({ createdAt: -1 })',
        'db.collection("notifications").updateMany({ userId }, { $set: { read: true } })'
      ]
    },
    api: {
      route: '/api/notifications',
      method: 'MULTI',
      handlerName: 'handleNotifications',
      handlerFile: '[...path].ts',
      handlerPath: 'api/[...path].ts'
    },
    assets: [
      { name: 'hmorix-icon-lime.svg', path: 'client/public/hmorix-icon-lime.svg', role: 'Brand Icon' },
      { name: 'hmorix-logo-dark.svg', path: 'client/public/hmorix-logo-dark.svg', role: 'Dark Theme Logo' },
      { name: 'hmorix-logo-light.svg', path: 'client/public/hmorix-logo-light.svg', role: 'Light Theme Logo' }
    ],
    connectsTo: ['auth-signin', 'home-page']
  },
  {
    id: 'auth-signin',
    name: 'Authentication Engine',
    title: 'HMAC-SHA256 Session Gateway & RBAC Router',
    file: 'SignIn.tsx & AuthContext.tsx',
    path: 'client/src/pages/auth/SignIn.tsx',
    category: 'entry',
    duration: '180ms – 320ms authentication handshake',
    working: 'Authenticates users via credentials (bcrypt with 12 rounds) or OAuth2 (Google / GitHub). Sets a signed HttpOnly session cookie (hm_session) with HMAC-SHA256 signature. Dynamically routes users post-login to their role workspace.',
    inputs: {
      type: 'Credentials JSON Payload',
      required: true,
      exampleData: `{\n  "email": "hr@hmorix.in",\n  "password": "SecurePassword#2026"\n}`,
      notes: 'Headers: Content-Type: application/json, credentials: "include"'
    },
    outputs: {
      type: 'HTTP-Only Cookie & Role Redirection',
      exampleOutput: `// Cookie:\nSet-Cookie: hm_session=<sessionId>.<hmacSignature>; Path=/; HttpOnly; SameSite=Lax;\n\n// Response JSON:\n{\n  "success": true,\n  "user": {\n    "id": "6648b209a1f28b4c",\n    "email": "hr@hmorix.in",\n    "name": "HR Operations Lead",\n    "role": "hr",\n    "emailVerified": true\n  }\n}\n\n// Redirection:\nnavigate('/hrm')`,
      notes: 'Role redirection table: admin->/admin, hr->/hrm, employee->/employee, manager->/manager, sales->/sales, crm->/crm, user->/portal'
    },
    buttons: [
      {
        label: 'Sign In (Submit)',
        trigger: 'onSubmit handleSubmit()',
        effect: 'Validates input, sends POST /api/auth/signin, updates AuthContext, routes to role portal',
        api: 'POST /api/auth/signin'
      },
      {
        label: 'Continue with Google',
        trigger: 'onClick (Redirect)',
        effect: 'Redirects to /api/auth/google for OAuth2 consent screen',
        target: '/api/auth/google'
      },
      {
        label: 'Continue with GitHub',
        trigger: 'onClick (Redirect)',
        effect: 'Redirects to /api/auth/github for OAuth2 consent screen',
        target: '/api/auth/github'
      }
    ],
    imports: [
      'client/src/lib/AuthContext.tsx',
      'client/src/lib/config.ts',
      'client/src/components/BrandLogo.tsx'
    ],
    database: {
      provider: 'MongoDB Atlas',
      collectionsOrTables: ['users', 'sessions'],
      queries: [
        'db.collection("users").findOne({ email: cleanEmail(email) })',
        'bcrypt.compare(password, user.passwordHash)',
        'db.collection("sessions").insertOne({ userId, token, expiresAt, createdAt })'
      ]
    },
    api: {
      route: '/api/auth/signin',
      method: 'POST',
      handlerName: 'handleAuthSignin',
      handlerFile: '[...path].ts',
      handlerPath: 'api/[...path].ts'
    },
    assets: [
      { name: 'Brand Monogram Shield', path: 'client/src/components/BrandLogo.tsx', role: 'Sign In Visual Identity' }
    ],
    connectsTo: ['hrm-portal', 'employee-portal', 'manager-portal', 'sales-portal', 'crm-portal', 'client-portal', 'admin-portal', 'api-gateway', 'mongo-db']
  },
  {
    id: 'hrm-portal',
    name: 'Enterprise HRM Suite',
    title: 'HRM Cockpit, ATS, Automated Payroll & Leave Matrix',
    file: 'HRMDashboard.tsx',
    path: 'client/src/pages/hrm/HRMDashboard.tsx',
    category: 'portal',
    duration: '220ms initial overview data fetch',
    working: 'Central cockpit for HR operations. Manages employee master directory (HM-XXXXXX IDs), recruitment applicant pipeline with AI resume scoring, one-click legal document generation (Offer, Joining, Relieving letters), multi-tier leave approval queue, automated monthly statutory payroll runs (PF, ESI, TDS, PT deductions), and official holiday calendar.',
    inputs: {
      type: 'Session Cookie & HR Authorization',
      required: true,
      exampleData: `// Request Headers:\nCookie: hm_session=...\n\n// New Employee Form Body:\n{\n  "fullName": "Aarav Sharma",\n  "email": "aarav.sharma@hmorix.in",\n  "role": "Frontend Architect",\n  "department": "Engineering",\n  "salary": 1400000,\n  "joiningDate": "2026-10-01"\n}`,
      notes: 'Enforces RBAC: requireRole(user, ["admin", "hr"])'
    },
    outputs: {
      type: 'Analytics Telemetry & Document Streams',
      exampleOutput: `{\n  "success": true,\n  "data": {\n    "stats": { "totalEmployees": 48, "activeLeaves": 3, "pendingApplicants": 14, "payrollStatus": "ready" },\n    "employees": [ ... ],\n    "leaveRequests": [ ... ]\n  }\n}`,
      notes: 'Provides real-time updates and one-click PDF generation for payroll and offer letters.'
    },
    buttons: [
      {
        label: 'Add New Employee',
        trigger: 'onClick (Link to "/hrm/employees/new")',
        effect: 'Navigates to onboarding wizard, auto-generates HM-XXXXXX credentials',
        target: '/hrm/employees/new'
      },
      {
        label: 'Approve Leave Request',
        trigger: 'onClick handleApproveLeave(id)',
        effect: 'Sends PUT /api/hrm/leave, deducts PTO balance, sends notification',
        api: 'PUT /api/hrm/leave'
      },
      {
        label: 'Run Monthly Payroll',
        trigger: 'onClick handleExecutePayroll()',
        effect: 'Calculates Indian statutory deductions (PF 12%, ESI 0.75%, TDS slab), records run',
        api: 'POST /api/hrm/payroll'
      },
      {
        label: 'Export Payroll Report',
        trigger: 'onClick handleExportPayroll()',
        effect: 'Downloads consolidated CSV and PDF summary report',
        api: 'GET /api/hrm/payroll/export'
      },
      {
        label: 'Generate Offer Letter',
        trigger: 'onClick handleGenerateOfferLetter(candidateId)',
        effect: 'Synthesizes branded PDF offer letter with salary breakup and joins link',
        target: 'lib/hrm-documents.ts'
      }
    ],
    imports: [
      'client/src/pages/hrm/Recruitment.tsx',
      'client/src/pages/hrm/Payroll.tsx',
      'client/src/pages/hrm/Leaves.tsx',
      'client/src/pages/hrm/AddEmployee.tsx',
      'client/src/pages/hrm/HRMCalendar.tsx',
      'client/src/pages/hrm/Internship.tsx',
      'client/src/lib/hrm-documents.ts'
    ],
    database: {
      provider: 'MongoDB Atlas',
      collectionsOrTables: ['hrm_employees', 'hrm_leave_requests', 'hrm_payroll_runs', 'hrm_recruitment', 'job_applications'],
      queries: [
        'db.collection("hrm_employees").find({ status: "active" }).toArray()',
        'db.collection("hrm_leave_requests").find({ status: "pending" }).toArray()',
        'db.collection("hrm_payroll_runs").find().sort({ month: -1 })',
        'db.collection("job_applications").find().sort({ created_at: -1 })'
      ]
    },
    api: {
      route: '/api/hrm/stats & /api/hrm/employees',
      method: 'MULTI',
      handlerName: 'handleHrmStats, handleHrmEmployees, handleHrmPayroll',
      handlerFile: '[...path].ts',
      handlerPath: 'api/[...path].ts'
    },
    assets: [
      { name: 'Salary Slip PDF Engine', path: 'client/src/lib/hrm-documents.ts', role: 'Statutory PDF Generator' },
      { name: 'Orixbucket Resumes', path: 'Supabase Storage: Orixbucket/resumes/*', role: 'Applicant CV Storage' }
    ],
    connectsTo: ['employee-portal', 'manager-portal', 'api-gateway', 'mongo-db', 'supabase-storage']
  },
  {
    id: 'employee-portal',
    name: 'Employee Self-Service (ESS)',
    title: 'Daily Workstation, Punch Clock & Document Vault',
    file: 'EmployeePortal.tsx',
    path: 'client/src/pages/employee/EmployeePortal.tsx',
    category: 'portal',
    duration: '140ms punch clock mutation; 1,000ms active work timer',
    working: 'Personal workstation for staff. Allows biometric/web clock-in & clock-out with geolocation tagging, tracks active sprint tasks, allows submitting PTO/leave requests, stores personal employment contracts, and provides 1-click payslip PDF downloads.',
    inputs: {
      type: 'Employee Identity & Action Payload',
      required: true,
      exampleData: `// Clock In Action:\n{\n  "action": "clock_in",\n  "timestamp": "2026-09-03T09:00:00.000Z",\n  "workMode": "remote"\n}\n\n// Leave Application:\n{\n  "leaveType": "sick",\n  "startDate": "2026-09-10",\n  "endDate": "2026-09-11",\n  "reason": "Viral fever recovery"\n}`,
      notes: 'Requires active session of role "employee", "hr", "manager", or "admin".'
    },
    outputs: {
      type: 'Attendance Records & Payslip PDF Stream',
      exampleOutput: `{\n  "status": "clocked_in",\n  "clockInTime": "09:00 AM",\n  "hoursWorkedToday": "4.5 hrs",\n  "assignedTasks": 6,\n  "leaveBalance": { "casual": 8, "sick": 6, "earned": 12 }\n}`,
      notes: 'Updates client state with zero page reloads.'
    },
    buttons: [
      {
        label: 'Clock In / Clock Out',
        trigger: 'onClick handleToggleClock()',
        effect: 'Records punch timestamp in employee_attendance collection, updates UI badge',
        api: 'POST /api/employee/attendance'
      },
      {
        label: 'Submit Leave Request',
        trigger: 'onSubmit handleLeaveSubmit()',
        effect: 'Inserts record into hrm_leave_requests with status "pending", alerts Manager',
        api: 'POST /api/hrm/leave'
      },
      {
        label: 'Mark Task Done',
        trigger: 'onClick handleCompleteTask(taskId)',
        effect: 'Updates hrm_tasks status to "completed", recalculates sprint velocity',
        api: 'PUT /api/hrm/tasks'
      },
      {
        label: 'Download Payslip',
        trigger: 'onClick handleDownloadPayslip(month)',
        effect: 'Fetches /api/employee/payslip and initiates native PDF download',
        api: 'GET /api/employee/payslip'
      }
    ],
    imports: [
      'client/src/pages/employee/Directory.tsx',
      'client/src/pages/employee/Tasks.tsx',
      'client/src/pages/employee/Requests.tsx',
      'client/src/pages/employee/BillingAssignment.tsx'
    ],
    database: {
      provider: 'MongoDB Atlas',
      collectionsOrTables: ['employee_attendance', 'hrm_tasks', 'hrm_leave_requests', 'employee_documents'],
      queries: [
        'db.collection("employee_attendance").findOne({ employeeId, date: todayDate })',
        'db.collection("employee_attendance").insertOne({ employeeId, clockIn, clockOut, duration })',
        'db.collection("hrm_tasks").find({ assignedTo: employeeId, status: { $ne: "archived" } })'
      ]
    },
    api: {
      route: '/api/employee/dashboard & /api/employee/attendance',
      method: 'MULTI',
      handlerName: 'handleEmployeeDashboard, handleEmployeeAttendance, handleEmployeePayslip',
      handlerFile: '[...path].ts',
      handlerPath: 'api/[...path].ts'
    },
    assets: [
      { name: 'Branded Payslip PDF', path: 'Dynamic stream via Node.js', role: 'Official Salary Record' }
    ],
    connectsTo: ['manager-portal', 'api-gateway', 'mongo-db']
  },
  {
    id: 'manager-portal',
    name: 'Manager Operations Portal',
    title: 'Pod Assembly, Delegation & Employee Scoring',
    file: 'ManagerPortal.tsx',
    path: 'client/src/pages/manager/ManagerPortal.tsx',
    category: 'portal',
    duration: '180ms project pod query execution',
    working: 'Command dashboard for engineering leads and operations managers. Enables assembling project pods, delegating deliverables from client projects into employee sprint tasks, conducting quarterly OKR/KPI appraisal ratings (1.0 - 5.0 stars with qualitative feedback), and routing client tickets to developers.',
    inputs: {
      type: 'Manager Session & Sprint Allocations',
      required: true,
      exampleData: `// Task Delegation Payload:\n{\n  "title": "Build Supabase Webhook Endpoint",\n  "assignedTo": "HM-042",\n  "projectId": "PRJ-9042",\n  "priority": "high",\n  "dueDate": "2026-09-18"\n}\n\n// Performance Rating:\n{\n  "employeeId": "HM-018",\n  "score": 4.9,\n  "quarter": "Q3-2026",\n  "remarks": "Outstanding execution on Vercel deployment pipeline."\n}`,
      notes: 'Requires user role: "manager" or "admin".'
    },
    outputs: {
      type: 'Pod Workload Heatmap & Scorecard',
      exampleOutput: 'Live pod capacity chart, active project sprint velocity, ticket assignment queue.',
      notes: 'Automatically syncs status to Client Portal.'
    },
    buttons: [
      {
        label: 'Create Engineering Pod',
        trigger: 'onSubmit handleCreateTeam()',
        effect: 'Creates squad record in hrm_teams, assigns lead and engineers',
        api: 'POST /api/manager/teams'
      },
      {
        label: 'Delegate Sprint Task',
        trigger: 'onSubmit handleDelegateTask()',
        effect: 'Inserts sprint item in hrm_tasks, notifies assigned employee',
        api: 'POST /api/hrm/tasks'
      },
      {
        label: 'Submit OKR Rating',
        trigger: 'onClick handleSaveAppraisal()',
        effect: 'Updates performance metric on employee profile, recalculates bonus eligibility',
        api: 'PUT /api/hrm/employees'
      }
    ],
    imports: [
      'client/src/lib/config.ts',
      'lucide-react (Users, CheckSquare, Star, FolderPlus, LifeBuoy)'
    ],
    database: {
      provider: 'MongoDB Atlas',
      collectionsOrTables: ['hrm_teams', 'client_projects', 'hrm_tasks', 'tickets'],
      queries: [
        'db.collection("hrm_teams").find().toArray()',
        'db.collection("client_projects").find({ status: "active" }).toArray()',
        'db.collection("tickets").find({ status: "open" }).sort({ createdAt: -1 })'
      ]
    },
    api: {
      route: '/api/manager/overview & /api/manager/teams',
      method: 'MULTI',
      handlerName: 'handleManagerOverview, handleManagerTeams, handleManagerTraining',
      handlerFile: '[...path].ts',
      handlerPath: 'api/[...path].ts'
    },
    assets: [
      { name: 'Team Capacity Matrix', path: 'Dynamic UI Component', role: 'Workload Visualizer' }
    ],
    connectsTo: ['employee-portal', 'client-portal', 'crm-portal', 'api-gateway', 'mongo-db']
  },
  {
    id: 'sales-portal',
    name: 'Field Sales Lead Capture',
    title: 'Mobile Pitch Capture & 3-Way Auto-Sync',
    file: 'SalesPortal.tsx',
    path: 'client/src/pages/sales/SalesPortal.tsx',
    category: 'portal',
    duration: '160ms instant pipeline synchronization',
    working: 'Designed for on-ground sales reps pitching local businesses (Hotels, Restaurants, Factories, Clinics, Schools, Retail across Delhi NCR, Mumbai, Hathras, Agra, Mathura). Form submission initiates an atomic 3-way synchronization: creates Contact -> creates CRM Deal -> initializes Client Project.',
    inputs: {
      type: 'Field Lead Form Submission',
      required: true,
      exampleData: `{\n  "businessName": "Vrindavan Heritage Resort",\n  "contactPerson": "Vikram Singh",\n  "phone": "+91-98765-43210",\n  "email": "vikram@vrindavanresort.com",\n  "sector": "Hospitality",\n  "projectType": "Smart AI Booking Engine & Website",\n  "dealValue": 250000,\n  "notes": "Met on-site. Needs automated WhatsApp confirmations."\n}`,
      notes: 'Features offline buffering if sales agent loses network in transit.'
    },
    outputs: {
      type: 'Synchronized Records & CRM Deal ID',
      exampleOutput: `{\n  "success": true,\n  "dealId": "DEAL-8492",\n  "contactId": "CNT-3109",\n  "projectId": "PRJ-9042",\n  "message": "3-way sync complete: Deal moved to CRM pipeline"\n}`,
      notes: 'Immediately alerts Sales Manager and Commercial CRM reps.'
    },
    buttons: [
      {
        label: 'Capture & Sync Lead',
        trigger: 'onSubmit handleLeadSubmit()',
        effect: 'Creates contact, deal, and project skeleton in single atomic transaction',
        api: 'POST /api/sales/projects'
      },
      {
        label: '1-Click Deal Won',
        trigger: 'onClick handleFastClose()',
        effect: 'Advances deal stage directly to "closed_won" and triggers invoice draft',
        api: 'PUT /api/crm/deals'
      }
    ],
    imports: [
      'client/src/lib/config.ts',
      'client/src/components/OfflineStatus.tsx',
      'lucide-react (Briefcase, MapPin, Building, Phone, DollarSign)'
    ],
    database: {
      provider: 'MongoDB Atlas',
      collectionsOrTables: ['crm_contacts', 'crm_deals', 'client_projects'],
      queries: [
        'db.collection("crm_contacts").insertOne(contactData)',
        'db.collection("crm_deals").insertOne({ title, value, stage: "lead", ownerEmail })',
        'db.collection("client_projects").insertOne({ title, status: "planning", clientEmail })'
      ]
    },
    api: {
      route: '/api/sales/projects & /api/crm/deals',
      method: 'POST',
      handlerName: 'handleSalesProjects, handleCrmDeals',
      handlerFile: '[...path].ts',
      handlerPath: 'api/[...path].ts'
    },
    assets: [
      { name: 'Offline Storage Store', path: 'IndexedDB: hmorix-offline', role: 'Transit Cache' }
    ],
    connectsTo: ['crm-portal', 'manager-portal', 'api-gateway', 'mongo-db']
  },
  {
    id: 'crm-portal',
    name: 'Commercial CRM Suite',
    title: 'Enterprise Deals, Kanban Pipeline & Revenue Forecasting',
    file: 'CRMDashboard.tsx',
    path: 'client/src/pages/crm/CRMDashboard.tsx',
    category: 'portal',
    duration: '80ms Kanban drag-and-drop state mutation',
    working: 'Comprehensive CRM for account executives. Features visual deal stage progression (lead -> contacted -> proposal -> negotiation -> closed_won -> closed_lost), aggregate revenue forecasting, contact relationship timelines, and sales representative quota trackers.',
    inputs: {
      type: 'Deal Pipeline Operations',
      required: true,
      exampleData: `{\n  "dealId": "DEAL-8492",\n  "stage": "negotiation",\n  "expectedCloseDate": "2026-09-30",\n  "probability": 85\n}`,
      notes: 'Requires role: "sales", "crm", "manager", or "admin".'
    },
    outputs: {
      type: 'Live Pipeline Metrics & Revenue Analytics',
      exampleOutput: `{\n  "pipelineValue": 18450000,\n  "weightedForecast": 14200000,\n  "stages": { "lead": 12, "proposal": 7, "closed_won": 24 }\n}`,
      notes: 'Reflects instant updates across team boards.'
    },
    buttons: [
      {
        label: 'Move Deal Stage',
        trigger: 'onDragEnd / handleStageChange()',
        effect: 'Updates deal stage in database, recalculates monthly quota attainment',
        api: 'PUT /api/crm/deals'
      },
      {
        label: 'Create New Deal',
        trigger: 'onSubmit handleNewDeal()',
        effect: 'Opens modal, creates new deal record attached to client contact',
        api: 'POST /api/crm/deals'
      },
      {
        label: 'Export Pipeline Data',
        trigger: 'onClick handleExportCSV()',
        effect: 'Exports sanitized deal forecast as CSV spreadsheet',
        api: 'GET /api/crm/deals?format=csv'
      }
    ],
    imports: [
      'client/src/pages/crm/Contacts.tsx',
      'client/src/pages/crm/Deals.tsx',
      'client/src/lib/config.ts'
    ],
    database: {
      provider: 'MongoDB Atlas',
      collectionsOrTables: ['crm_deals', 'crm_contacts', 'activity_log'],
      queries: [
        'db.collection("crm_deals").find().sort({ updatedAt: -1 })',
        'db.collection("crm_deals").aggregate([{ $group: { _id: "$stage", total: { $sum: "$value" } } }])',
        'db.collection("crm_contacts").find().limit(100)'
      ]
    },
    api: {
      route: '/api/crm/deals & /api/crm/contacts',
      method: 'MULTI',
      handlerName: 'handleCrmStats, handleCrmDeals, handleCrmContacts',
      handlerFile: '[...path].ts',
      handlerPath: 'api/[...path].ts'
    },
    assets: [
      { name: 'Revenue Pipeline Charts', path: 'Dynamic SVG SVG Bar Chart', role: 'Visual Telemetry' }
    ],
    connectsTo: ['sales-portal', 'manager-portal', 'client-portal', 'api-gateway', 'mongo-db']
  },
  {
    id: 'client-portal',
    name: 'Client Customer Portal',
    title: 'Milestone Tracking, Invoices & Support Escalation',
    file: 'ClientPortal.tsx',
    path: 'client/src/pages/portal/ClientPortal.tsx',
    category: 'portal',
    duration: '210ms customer workspace initialization',
    working: 'Dedicated customer portal for paying clients. Offers radical delivery transparency: monitor project sprint progress, view team roster, download official GST invoices, generate developer API keys, and submit support tickets (TKT-XXXXXX) with automatic engineering pod alerts.',
    inputs: {
      type: 'Client Session Cookie (hm_session)',
      required: true,
      exampleData: `// Support Ticket Payload:\n{\n  "subject": "Webhook retry configuration",\n  "category": "Integration",\n  "priority": "High",\n  "description": "We need our webhook endpoint to receive raw invoice JSON payloads."\n}`,
      notes: 'Customer data is strictly isolated: userId == user.id || clientEmail == user.email'
    },
    outputs: {
      type: 'Project Status & Ticket Tracking Number',
      exampleOutput: `{\n  "ticketId": "TKT-829104",\n  "status": "open",\n  "assignedPod": "TEAM-ENG-01",\n  "slaRemaining": "4 hrs"\n}`,
      notes: 'Generates immutable customer support paper trail.'
    },
    buttons: [
      {
        label: 'Submit Support Ticket',
        trigger: 'onSubmit handleTicketSubmit()',
        effect: 'Generates TKT-XXXXXX code, inserts into tickets collection, alerts Delivery Manager',
        api: 'POST /api/tickets'
      },
      {
        label: 'Download GST Invoice',
        trigger: 'onClick handleDownloadInvoice(invId)',
        effect: 'Streams signed PDF invoice with tax breakdowns',
        api: 'GET /api/account/billing/invoices/:id/pdf'
      },
      {
        label: 'Generate API Key',
        trigger: 'onClick handleCreateKey()',
        effect: 'Creates secure secret token with read/write access to client webhooks',
        api: 'POST /api/account/api-keys'
      }
    ],
    imports: [
      'client/src/lib/config.ts',
      'client/src/components/BrandLogo.tsx',
      'lucide-react (FileText, Key, CheckCircle, LifeBuoy, Download)'
    ],
    database: {
      provider: 'MongoDB Atlas',
      collectionsOrTables: ['client_projects', 'invoices', 'tickets'],
      queries: [
        'db.collection("client_projects").find({ $or: [{ userId: user.id }, { clientEmail: user.email }] })',
        'db.collection("invoices").find({ clientEmail: user.email })',
        'db.collection("tickets").insertOne({ ticketId, userEmail, subject, status: "open", createdAt })'
      ]
    },
    api: {
      route: '/api/portal & /api/tickets',
      method: 'MULTI',
      handlerName: 'handleClientPortal, handleTickets, handleInvoices',
      handlerFile: '[...path].ts',
      handlerPath: 'api/[...path].ts'
    },
    assets: [
      { name: 'Branded Invoice PDF Stream', path: 'Serverless Node.js PDF Buffer', role: 'GST Tax Document' }
    ],
    connectsTo: ['manager-portal', 'billingflow-product', 'api-gateway', 'mongo-db']
  },
  {
    id: 'admin-portal',
    name: 'Super Admin Suite',
    title: 'Platform Governance, User Security & Audit Logs',
    file: 'AdminDashboard.tsx',
    path: 'client/src/pages/admin/AdminDashboard.tsx',
    category: 'portal',
    duration: '240ms system telemetry audit fetch',
    working: 'Platform control cockpit for super administrators. Features complete user roster management, role escalation/demotion, immutable security audit logs (activity_log), global notification dispatch, system settings configuration, and blog editorial publishing.',
    inputs: {
      type: 'Admin Session (Role == "admin")',
      required: true,
      exampleData: `// Role Escalation Payload:\n{\n  "targetUserId": "HM-USR-99",\n  "newRole": "hr",\n  "reason": "Promotion to Human Resources Department"\n}\n\n// Broadcast Notification:\n{\n  "title": "Scheduled Maintenance",\n  "message": "Database indexes update tonight at 02:00 AM UTC",\n  "broadcast": true\n}`,
      notes: 'Strictly restricted to users possessing verified admin role.'
    },
    outputs: {
      type: 'Audit Stream & Configuration Status',
      exampleOutput: 'System health vitals, active user count (users: 142), database latency metrics.',
      notes: 'All security events are permanently recorded in activity_log.'
    },
    buttons: [
      {
        label: 'Update User Role',
        trigger: 'onClick handleRoleChange(userId, role)',
        effect: 'Updates users collection, invalidates cached permissions, logs audit entry',
        api: 'PUT /api/admin/users'
      },
      {
        label: 'Broadcast Notification',
        trigger: 'onSubmit handleBroadcast()',
        effect: 'Pushes notification to all connected clients and service worker',
        api: 'POST /api/notifications'
      },
      {
        label: 'Publish Blog Post',
        trigger: 'onSubmit handleBlogPublish()',
        effect: 'Saves blog article, creates Supabase backup JSON, updates sitemap',
        api: 'POST /api/blogs'
      }
    ],
    imports: [
      'client/src/pages/admin/AdminUsers.tsx',
      'client/src/pages/admin/AdminSettings.tsx',
      'client/src/pages/admin/AdminLogs.tsx',
      'client/src/pages/admin/AdminNotifications.tsx',
      'client/src/pages/blog/AdminBlogManager.tsx'
    ],
    database: {
      provider: 'MongoDB Atlas',
      collectionsOrTables: ['users', 'activity_log', 'settings', 'blogs'],
      queries: [
        'db.collection("users").find().sort({ createdAt: -1 })',
        'db.collection("activity_log").find().sort({ timestamp: -1 }).limit(100)',
        'db.collection("settings").findOne({ type: "global" })'
      ]
    },
    api: {
      route: '/api/admin/stats & /api/admin/users',
      method: 'MULTI',
      handlerName: 'handleAdminStats, handleAdminUsers, handleAdminLogs',
      handlerFile: '[...path].ts',
      handlerPath: 'api/[...path].ts'
    },
    assets: [
      { name: 'sitemap.xml', path: 'client/public/sitemap.xml', role: 'Dynamic Search Sitemap' },
      { name: 'robots.txt', path: 'client/public/robots.txt', role: 'SEO Crawl Directives' }
    ],
    connectsTo: ['api-gateway', 'mongo-db']
  },
  {
    id: 'billingflow-product',
    name: 'BillingFlow Ecosystem',
    title: 'Automated Invoicing, GST & Payment Gateway',
    file: 'BillingFlow.tsx',
    path: 'client/src/pages/products/BillingFlow.tsx',
    category: 'product',
    duration: '40ms instant client-side tax computation',
    working: 'Enterprise billing product within HMorix. Supports multi-currency invoicing, GST/VAT tax calculation, retainer contracts, and compliant PDF generation. Connects directly with client accounts and CRM deal closures.',
    inputs: {
      type: 'Invoice Items & Tax Parameters',
      required: true,
      exampleData: `{\n  "clientId": "CLI-8492",\n  "items": [\n    { "description": "Custom AI Agent Architecture", "quantity": 1, "unitPrice": 120000 }\n  ],\n  "gstRate": 18,\n  "currency": "INR"\n}`,
      notes: 'Generates itemized subtotals, CGST, SGST, and total payable.'
    },
    outputs: {
      type: 'Invoice PDF & Payment Record',
      exampleOutput: 'Invoice number "INV-2026-0891" with payable link and downloadable PDF file.',
      notes: 'Synchronizes status to Client Portal and Admin Dashboard.'
    },
    buttons: [
      {
        label: 'Create Invoice',
        trigger: 'onSubmit handleCreateInvoice()',
        effect: 'Records invoice in database, emails customer invoice link',
        api: 'POST /api/invoices'
      },
      {
        label: 'Download Invoice PDF',
        trigger: 'onClick handleDownloadPdf(id)',
        effect: 'Streams PDF binary with embedded vector brand logo',
        api: 'GET /api/account/billing/invoices/:id/pdf'
      }
    ],
    imports: [
      'client/src/pages/products/BillingFlowFeatures.tsx',
      'client/src/pages/products/BillingFlowPricing.tsx',
      'client/src/pages/products/BillingFlowDocs.tsx'
    ],
    database: {
      provider: 'MongoDB Atlas',
      collectionsOrTables: ['invoices'],
      queries: [
        'db.collection("invoices").insertOne(invoiceDoc)',
        'db.collection("invoices").find({ status: "pending" })'
      ]
    },
    api: {
      route: '/api/invoices & /api/account/billing',
      method: 'MULTI',
      handlerName: 'handleInvoices, handleBilling',
      handlerFile: '[...path].ts',
      handlerPath: 'api/[...path].ts'
    },
    assets: [
      { name: 'Invoice Layout Blueprint', path: 'Serverless Node.js PDF Buffer', role: 'Official Financial Document' }
    ],
    connectsTo: ['client-portal', 'api-gateway', 'mongo-db']
  },
  {
    id: 'ai-agent-product',
    name: 'AI Agent & LLM Playground',
    title: 'NVIDIA NIM 405B Llama Reasoning Engine',
    file: 'AIAgent.tsx & AIAgentPlayground.tsx',
    path: 'client/src/pages/products/AIAgent.tsx',
    category: 'product',
    duration: '850ms – 2,400ms neural streaming latency',
    working: 'High-performance AI workflow engine powered by NVIDIA NIM inference (meta/llama-3.1-405b-instruct). Provides prompt playground, tool calling sandbox, and autonomous agents for document processing and customer support triage.',
    inputs: {
      type: 'Natural Language Prompt & Hyperparameters',
      required: true,
      exampleData: `{\n  "model": "meta/llama-3.1-405b-instruct",\n  "prompt": "Analyze this employee contract and highlight any non-compete ambiguities.",\n  "temperature": 0.4,\n  "maxTokens": 1024\n}`,
      notes: 'Protected by server-side bearer token authentication.'
    },
    outputs: {
      type: 'Streaming Markdown & JSON Tool Call',
      exampleOutput: 'Structured legal analysis with bullet points and suggested contract revisions.',
      notes: 'Tokens stream in real-time to client interface.'
    },
    buttons: [
      {
        label: 'Run Agent Query',
        trigger: 'onSubmit handleSendPrompt()',
        effect: 'Sends prompt to NVIDIA NIM inference cluster, streams response',
        api: 'POST /api/ai/chat'
      },
      {
        label: 'Open Playground',
        trigger: 'onClick (Link to "/agent/playground")',
        effect: 'Navigates to developer prompt playground with temperature sliders',
        target: '/agent/playground'
      }
    ],
    imports: [
      'client/src/pages/products/AIAgentPlayground.tsx',
      'client/src/pages/products/AIAgentDocs.tsx',
      'client/src/pages/products/AIAgentTemplates.tsx'
    ],
    database: {
      provider: 'None (Direct LLM Inference)',
      collectionsOrTables: ['ai_conversations (optional session history)'],
      queries: ['HTTPS POST to https://integrate.api.nvidia.com/v1/chat/completions']
    },
    api: {
      route: '/api/ai/chat & /api/ai/playground',
      method: 'POST',
      handlerName: 'handleAiChat, handleAiPlayground',
      handlerFile: '[...path].ts',
      handlerPath: 'api/[...path].ts'
    },
    assets: [
      { name: 'Typing Cursor Animation', path: 'CSS Steps Keyframe', role: 'Real-time Streaming Indicator' }
    ],
    connectsTo: ['api-gateway']
  },
  {
    id: 'pdf-automation-product',
    name: 'PDF Automation Engine',
    title: 'High-Speed Document Synthesis & Cloud Vault',
    file: 'PDFAutomation.tsx & hrm-documents.ts',
    path: 'client/src/pages/products/PDFAutomation.tsx',
    category: 'product',
    duration: '350ms – 600ms document generation',
    working: 'Document automation pipeline. Compiles structured data (salaries, employee details, milestones, contracts) into legally compliant PDF documents. Integrates with Supabase Storage (Orixbucket) for persistent cloud archiving.',
    inputs: {
      type: 'Structured Document Model',
      required: true,
      exampleData: `{\n  "documentType": "offer_letter",\n  "candidateName": "Pooja Verma",\n  "position": "DevOps Engineer",\n  "annualCTC": "14,00,000 INR",\n  "signingAuthority": "Harsh Sharma, CEO"\n}`,
      notes: 'Injects official brand vector watermark and anti-tamper hash.'
    },
    outputs: {
      type: 'Downloadable PDF & Supabase Storage URL',
      exampleOutput: 'https://jdfnchfcvjebkcvffkvc.supabase.co/storage/v1/object/public/Orixbucket/documents/offer_letter_HM102.pdf',
      notes: 'Immediate client download and permanent cloud archival.'
    },
    buttons: [
      {
        label: 'Synthesize Document',
        trigger: 'onSubmit handleGenerateDoc()',
        effect: 'Renders PDF binary, presents instant preview modal',
        target: 'lib/hrm-documents.ts'
      },
      {
        label: 'Upload to Supabase Vault',
        trigger: 'onClick handleCloudSync()',
        effect: 'Uploads generated PDF to Supabase Orixbucket with public CDN URL',
        api: 'POST /api/upload'
      }
    ],
    imports: [
      'client/src/lib/hrm-documents.ts',
      'client/src/pages/products/PDFDocs.tsx',
      'client/src/pages/products/PDFDemo.tsx'
    ],
    database: {
      provider: 'Supabase',
      collectionsOrTables: ['Supabase Storage: Orixbucket'],
      queries: [
        'supabase.storage.from("Orixbucket").upload(storagePath, buffer, { contentType: "application/pdf" })',
        'supabase.storage.from("Orixbucket").getPublicUrl(storagePath)'
      ]
    },
    api: {
      route: '/api/upload',
      method: 'POST',
      handlerName: 'handleUpload',
      handlerFile: '[...path].ts',
      handlerPath: 'api/[...path].ts'
    },
    assets: [
      { name: 'whitepaper-pdfs', path: 'client/public/whitepaper-pdfs/*', role: 'Enterprise Whitepapers' },
      { name: 'press-pdfs', path: 'client/public/press-pdfs/*', role: 'Press Release PDFs' }
    ],
    connectsTo: ['hrm-portal', 'api-gateway', 'supabase-storage']
  },
  {
    id: 'api-gateway',
    name: 'Vercel Serverless API Gateway',
    title: 'Catch-All HTTP Router, CORS & RBAC Enforcement',
    file: '[...path].ts',
    path: 'api/[...path].ts',
    category: 'backend',
    duration: '40ms – 160ms serverless function execution',
    working: 'Universal serverless dispatch router running on Vercel Node.js runtime. Handles CORS headers, validates signed session cookies (decodeSessionCookie), enforces role-based access control (requireRole), connects to MongoDB Atlas client pool, and provides automated fallback to Supabase.',
    inputs: {
      type: 'VercelRequest (HTTP Headers, Query, Body)',
      required: true,
      exampleData: `// VercelRequest path:\nreq.query.path = ["hrm", "employees"]\nreq.headers.cookie = "hm_session=6648b209...d8a2"\nreq.method = "GET"`,
      notes: 'Dispatches via switch(routePath) with over 50 registered API endpoints.'
    },
    outputs: {
      type: 'Structured JSON Response / Binary Stream',
      exampleOutput: `{\n  "success": true,\n  "data": [ ... ],\n  "timestamp": "2026-09-03T15:00:00.000Z"\n}`,
      notes: 'All error states return structured { error: string, code?: string } with appropriate HTTP status code.'
    },
    buttons: [
      {
        label: 'Internal Router Dispatch',
        trigger: 'Incoming HTTP request to /api/*',
        effect: 'Evaluates switch(routePath) and executes corresponding asynchronous handler function',
        target: 'api/[...path].ts'
      }
    ],
    imports: [
      '@vercel/node',
      'mongodb (MongoClient, ObjectId)',
      '@supabase/supabase-js (createClient)',
      'bcryptjs',
      'crypto',
      'nodemailer'
    ],
    database: {
      provider: 'Dual / Hybrid',
      collectionsOrTables: ['All 16+ MongoDB collections & Supabase Orixbucket'],
      queries: [
        'mongoCollection(name)',
        'ensureStorageBucket()',
        'getAuthUser(req)',
        'requireRole(user, allowedRoles)'
      ]
    },
    api: {
      route: '/api/*',
      method: 'MULTI',
      handlerName: 'handler (Default Export)',
      handlerFile: '[...path].ts',
      handlerPath: 'api/[...path].ts'
    },
    assets: [
      { name: 'OpenAPI 3.0 Route Spec', path: 'client/public/openapi.json', role: 'API Contract' }
    ],
    connectsTo: ['mongo-db', 'supabase-storage']
  },
  {
    id: 'mongo-db',
    name: 'MongoDB Atlas Primary Datastore',
    title: 'Cluster Database, TTL Indexes & Aggregations',
    file: 'api/[...path].ts & server/db/mongo.js',
    path: 'api/[...path].ts',
    category: 'database',
    duration: '12ms – 35ms P95 query latency',
    working: 'Primary production database hosted on MongoDB Atlas. Houses all core collections for users, sessions, employees, leaves, payroll, sprint tasks, CRM deals, client projects, and tickets. Utilizes automated TTL expiration on sessions and verification tokens.',
    inputs: {
      type: 'MongoDB Connection URI & BSON Queries',
      required: true,
      exampleData: `// Environment Variable:\nprocess.env.MONGODB_URI = "mongodb+srv://..."\n\n// Sample Aggregation:\n[\n  { $match: { status: "active" } },\n  { $group: { _id: "$department", count: { $sum: 1 } } }\n]`,
      notes: 'Connection pool is memoized across serverless invocations to minimize cold starts.'
    },
    outputs: {
      type: 'BSON Document Cursors & Write Results',
      exampleOutput: `{\n  "acknowledged": true,\n  "insertedId": ObjectId("6648b209a1f28b4c"),\n  "matchedCount": 1\n}`,
      notes: 'Zero mock data: all portal data reflects real MongoDB Atlas documents.'
    },
    buttons: [
      {
        label: 'Auto-Index Initialization',
        trigger: 'Invoked on serverless cold-start (ensureIndexes)',
        effect: 'Creates unique indexes on users.email, sessions.expiresAt, and employee_attendance',
        target: 'api/[...path].ts'
      }
    ],
    imports: [
      'mongodb (MongoClient, ObjectId)'
    ],
    database: {
      provider: 'MongoDB Atlas',
      collectionsOrTables: [
        'users',
        'sessions (TTL: 7 days)',
        'hrm_employees',
        'hrm_leave_requests',
        'hrm_payroll_runs',
        'hrm_tasks',
        'hrm_teams',
        'employee_attendance',
        'crm_contacts',
        'crm_deals',
        'client_projects',
        'invoices',
        'tickets',
        'activity_log',
        'blogs',
        'settings'
      ],
      queries: [
        'col.findOne({ ... })',
        'col.find({ ... }).sort({ ... }).toArray()',
        'col.insertOne(doc)',
        'col.updateOne({ _id }, { $set: update })',
        'col.aggregate([ ... ])'
      ]
    },
    api: {
      route: 'Backend Database Protocol',
      method: 'NONE',
      handlerName: 'mongoCollection',
      handlerFile: '[...path].ts',
      handlerPath: 'api/[...path].ts'
    },
    assets: [
      { name: 'Migration Script', path: 'database/PORTAL_CONNECTIONS_AND_FLOW.md', role: 'Schema Blueprint' }
    ],
    connectsTo: ['api-gateway']
  },
  {
    id: 'supabase-storage',
    name: 'Supabase Storage & SQL Dual-Adapter',
    title: 'Cloud Bucket (Orixbucket) & PostgreSQL Adapter',
    file: 'client/src/lib/supabase.ts & server/db/supabase.js',
    path: 'client/src/lib/supabase.ts & api/[...path].ts',
    category: 'database',
    duration: '180ms – 420ms object upload latency',
    working: 'Cloud object storage bucket ("Orixbucket") for binary assets: candidate resumes, generated legal PDFs, blog JSON snapshots, and media files. Also acts as an alternate SQL database adapter via DATABASE=supabase environment configuration.',
    inputs: {
      type: 'Buffer Upload & Bucket Credentials',
      required: true,
      exampleData: `// Storage Upload Call:\nsupabase.storage\n  .from('Orixbucket')\n  .upload('resumes/aarav_resume.pdf', fileBuffer, {\n    contentType: 'application/pdf',\n    upsert: false\n  })`,
      notes: 'Credentials: process.env.SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    },
    outputs: {
      type: 'Public CDN URL & SQL Result Sets',
      exampleOutput: `{\n  "data": {\n    "publicUrl": "https://jdfnchfcvjebkcvffkvc.supabase.co/storage/v1/object/public/Orixbucket/resumes/aarav_resume.pdf"\n  }\n}`,
      notes: 'Global high-speed CDN delivery for resumes and invoices.'
    },
    buttons: [
      {
        label: 'Upload Candidate Resume',
        trigger: 'onSubmit /api/upload/resume',
        effect: 'Uploads PDF buffer to Orixbucket/resumes/, returns public URL, attaches to applicant record',
        api: 'POST /api/upload/resume'
      }
    ],
    imports: [
      '@supabase/supabase-js (createClient)',
      'client/src/lib/supabase.ts'
    ],
    database: {
      provider: 'Supabase',
      collectionsOrTables: ['Bucket: Orixbucket', 'Tables: job_applications, hrm_calendar, user_profiles'],
      queries: [
        'supabase.storage.from("Orixbucket").upload(...)',
        'supabase.storage.from("Orixbucket").getPublicUrl(...)',
        'supabase.from("job_applications").select("*")'
      ]
    },
    api: {
      route: '/api/upload & /api/careers/applications',
      method: 'MULTI',
      handlerName: 'handleUploadResume, handleJobApplications',
      handlerFile: '[...path].ts',
      handlerPath: 'api/[...path].ts'
    },
    assets: [
      { name: 'Orixbucket Cloud Bucket', path: 'https://jdfnchfcvjebkcvffkvc.supabase.co/storage/v1/object/public/Orixbucket', role: 'Object CDN' }
    ],
    connectsTo: ['api-gateway', 'hrm-portal', 'pdf-automation-product']
  },
  {
    id: 'static-assets',
    name: 'Static Assets & Brand Vector Hub',
    title: 'Public Manifests, Logos, SVGs & PWA Infrastructure',
    file: 'client/public/* & client/src/components/BrandLogo.tsx',
    path: 'client/public/',
    category: 'asset',
    duration: '0ms (Edge CDN Cached / Instant)',
    working: 'Central asset repository serving official brand vectors (hexagonal shields in dark, light, and lime variants), PWA WebManifest, Service Worker cache scripts (sw.js), offline IndexedDB stores, developer OpenAPI specifications, and downloadable PDFs.',
    inputs: {
      type: 'Public HTTP GET Request',
      required: false,
      exampleData: `// Browser request:\nGET /hmorix-icon-lime.svg\nGET /manifest.webmanifest\nGET /openapi.json`,
      notes: 'Edge-cached on Cloudflare with immutable cache-control headers.'
    },
    outputs: {
      type: 'Raw SVG / JSON / PDF / ICO Assets',
      exampleOutput: 'High-resolution vector assets, browser install prompts, API schemas.',
      notes: 'Zero latency static asset distribution.'
    },
    buttons: [
      {
        label: 'Download Brand Kit SVG',
        trigger: 'onClick getStandaloneBrandLogoSVG()',
        effect: 'Generates standalone SVG vector string for media kit download',
        target: 'client/src/components/BrandLogo.tsx'
      },
      {
        label: 'Inspect OpenAPI 3.0',
        trigger: 'onClick (Link to "/openapi.json")',
        effect: 'Displays complete JSON contract of all HMorix endpoints',
        target: '/openapi.json'
      }
    ],
    imports: [
      'client/src/components/BrandLogo.tsx',
      'client/src/components/Navbar.tsx',
      'client/src/components/Footer.tsx'
    ],
    database: {
      provider: 'None (Client Cache/Asset)',
      collectionsOrTables: ['Cache Storage', 'IndexedDB: hmorix-offline'],
      queries: ['caches.open("hmorix-v1")', 'indexedDB.open("hmorix-offline")']
    },
    api: {
      route: '/openapi.json & /openapi.yaml',
      method: 'GET',
      handlerName: 'handleOpenApiJson, handleOpenApiYaml',
      handlerFile: '[...path].ts',
      handlerPath: 'api/[...path].ts'
    },
    assets: [
      { name: 'hmorix-icon-lime.svg', path: 'client/public/hmorix-icon-lime.svg', role: 'Brand Monogram Lime' },
      { name: 'hmorix-icon.svg', path: 'client/public/hmorix-icon.svg', role: 'Brand Monogram Dark' },
      { name: 'hmorix-logo-dark.svg', path: 'client/public/hmorix-logo-dark.svg', role: 'Full Dark Logo' },
      { name: 'hmorix-logo-light.svg', path: 'client/public/hmorix-logo-light.svg', role: 'Full Light Logo' },
      { name: 'favicon.svg', path: 'client/public/favicon.svg', role: 'Browser Tab Vector Icon' },
      { name: 'manifest.webmanifest', path: 'client/public/manifest.webmanifest', role: 'PWA Manifest' },
      { name: 'sw.js', path: 'client/public/sw.js', role: 'Service Worker Cache Engine' },
      { name: 'openapi.json', path: 'client/public/openapi.json', role: 'OpenAPI 3.0 JSON Schema' }
    ],
    connectsTo: ['boot', 'intro-animation', 'home-page', 'main-layout']
  }
]

export default function Architecture() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('intro-animation')
  const [activeTab, setActiveTab] = useState<'working' | 'inputs' | 'buttons' | 'connections' | 'database' | 'assets'>('working')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [copiedPath, setCopiedPath] = useState(false)

  const filteredNodes = useMemo(() => {
    return PROJECT_NODES.filter(node => {
      const matchesCategory = filterCategory === 'all' || node.category === filterCategory
      const matchesSearch =
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.file.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.working.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.api.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.database.provider.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [filterCategory, searchQuery])

  const selectedNode = useMemo(() => {
    return PROJECT_NODES.find(n => n.id === selectedNodeId) || PROJECT_NODES[1]
  }, [selectedNodeId])

  const handleCopyPath = () => {
    navigator.clipboard.writeText(selectedNode.path)
    setCopiedPath(true)
    setTimeout(() => setCopiedPath(false), 2000)
  }

  return (
    <div className="pt-28 pb-20 min-h-screen bg-obsidian text-cream">
      <SEOHead
        title="Project Architecture & Topology Graph – HMorix Enterprise"
        description="Interactive node-based architecture, execution lifecycles, database queries, and asset connections across the HMorix enterprise platform."
        keywords="HMorix architecture, project topology, AppIntroAnimation, React routes, MongoDB queries, Supabase storage, API routes"
        canonical="/architecture"
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C8FF00] animate-pulse" />
            <span className="label-mono text-[#C8FF00]">Interactive Project Topology & Node Explorer</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            How HMorix <span className="text-[#C8FF00]">Starts, Connects & Operates</span>
          </h1>
          <p className="text-cream/60 mt-3 max-w-[820px] text-sm sm:text-base leading-relaxed">
            Explore every node from the initial boot sequence and <code className="text-[#C8FF00] bg-white/[0.04] px-1.5 py-0.5 rounded">AppIntroAnimation</code> to the <code className="text-[#C8FF00] bg-white/[0.04] px-1.5 py-0.5 rounded">Home</code> showcase, all 7 enterprise portals, Vercel serverless API handlers, MongoDB queries, and Supabase cloud storage assets.
          </p>
        </div>

        {/* Quick Lifecycle Pipeline Walkthrough */}
        <div className="p-4 sm:p-6 bg-obsidian-2 border border-glass-border rounded-[12px] mb-8 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[760px] text-xs font-mono text-cream/70 gap-2">
            <button
              onClick={() => setSelectedNodeId('boot')}
              className={`flex items-center gap-2 px-3 py-2 rounded-[6px] border transition-all ${selectedNodeId === 'boot' ? 'bg-[#C8FF00]/15 border-[#C8FF00] text-[#C8FF00]' : 'border-glass-border hover:border-cream/30'}`}
            >
              <Zap className="w-3.5 h-3.5 text-[#C8FF00]" />
              <span>1. main.tsx (Boot)</span>
            </button>
            <ArrowRight className="w-4 h-4 text-cream/30" />
            <button
              onClick={() => setSelectedNodeId('intro-animation')}
              className={`flex items-center gap-2 px-3 py-2 rounded-[6px] border transition-all ${selectedNodeId === 'intro-animation' ? 'bg-[#C8FF00]/15 border-[#C8FF00] text-[#C8FF00]' : 'border-glass-border hover:border-cream/30'}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C8FF00]" />
              <span>2. AppIntroAnimation (2.7s)</span>
            </button>
            <ArrowRight className="w-4 h-4 text-cream/30" />
            <button
              onClick={() => setSelectedNodeId('home-page')}
              className={`flex items-center gap-2 px-3 py-2 rounded-[6px] border transition-all ${selectedNodeId === 'home-page' ? 'bg-[#C8FF00]/15 border-[#C8FF00] text-[#C8FF00]' : 'border-glass-border hover:border-cream/30'}`}
            >
              <Boxes className="w-3.5 h-3.5 text-[#C8FF00]" />
              <span>3. Home.tsx (Landing & Shell)</span>
            </button>
            <ArrowRight className="w-4 h-4 text-cream/30" />
            <button
              onClick={() => setSelectedNodeId('auth-signin')}
              className={`flex items-center gap-2 px-3 py-2 rounded-[6px] border transition-all ${selectedNodeId === 'auth-signin' ? 'bg-[#C8FF00]/15 border-[#C8FF00] text-[#C8FF00]' : 'border-glass-border hover:border-cream/30'}`}
            >
              <Shield className="w-3.5 h-3.5 text-[#C8FF00]" />
              <span>4. Auth & RBAC Cookie</span>
            </button>
            <ArrowRight className="w-4 h-4 text-cream/30" />
            <button
              onClick={() => setSelectedNodeId('hrm-portal')}
              className={`flex items-center gap-2 px-3 py-2 rounded-[6px] border transition-all ${selectedNodeId.includes('portal') ? 'bg-[#C8FF00]/15 border-[#C8FF00] text-[#C8FF00]' : 'border-glass-border hover:border-cream/30'}`}
            >
              <Layers className="w-3.5 h-3.5 text-[#C8FF00]" />
              <span>5. 7 Multi-Portals</span>
            </button>
            <ArrowRight className="w-4 h-4 text-cream/30" />
            <button
              onClick={() => setSelectedNodeId('api-gateway')}
              className={`flex items-center gap-2 px-3 py-2 rounded-[6px] border transition-all ${selectedNodeId === 'api-gateway' ? 'bg-[#C8FF00]/15 border-[#C8FF00] text-[#C8FF00]' : 'border-glass-border hover:border-cream/30'}`}
            >
              <Server className="w-3.5 h-3.5 text-[#C8FF00]" />
              <span>6. api/[...path].ts</span>
            </button>
            <ArrowRight className="w-4 h-4 text-cream/30" />
            <button
              onClick={() => setSelectedNodeId('mongo-db')}
              className={`flex items-center gap-2 px-3 py-2 rounded-[6px] border transition-all ${selectedNodeId === 'mongo-db' ? 'bg-[#C8FF00]/15 border-[#C8FF00] text-[#C8FF00]' : 'border-glass-border hover:border-cream/30'}`}
            >
              <Database className="w-3.5 h-3.5 text-[#C8FF00]" />
              <span>7. MongoDB & Supabase</span>
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-6">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[
              { id: 'all', label: 'All Components' },
              { id: 'entry', label: 'Boot & Entry' },
              { id: 'animation', label: 'Intro Animation' },
              { id: 'page', label: 'Core Pages' },
              { id: 'portal', label: 'Enterprise Portals' },
              { id: 'product', label: 'Products & AI' },
              { id: 'backend', label: 'API Gateway' },
              { id: 'database', label: 'Database & Storage' },
              { id: 'asset', label: 'Assets & Vectors' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-mono transition-all ${
                  filterCategory === cat.id
                    ? 'bg-[#C8FF00] text-obsidian font-semibold'
                    : 'bg-white/[0.04] text-cream/60 hover:text-cream border border-glass-border'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-cream/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search file, query, button..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-obsidian-2 border border-glass-border rounded-[6px] text-xs font-mono text-cream focus:outline-none focus:border-[#C8FF00]"
            />
          </div>
        </div>

        {/* Interactive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Node Graph List */}
          <div className="lg:col-span-5 space-y-3 max-h-[860px] overflow-y-auto pr-1">
            <div className="text-xs font-mono text-cream/40 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Nodes in Architecture ({filteredNodes.length})</span>
              <span>Click node to inspect</span>
            </div>

            {filteredNodes.map(node => {
              const isSelected = node.id === selectedNodeId
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-4 rounded-[10px] border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-obsidian-2 border-[#C8FF00] shadow-[0_0_24px_rgba(200,255,0,0.15)] ring-1 ring-[#C8FF00]/40'
                      : 'bg-obsidian-2/60 border-glass-border hover:border-cream/30 hover:bg-obsidian-2'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#C8FF00]' : 'bg-cream/40'}`} />
                      <h3 className="font-display font-bold text-sm text-cream">{node.name}</h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-white/[0.06] border border-glass-border text-[#C8FF00] uppercase">
                      {node.category}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-[#C8FF00] truncate mb-2 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 flex-shrink-0 text-cream/50" />
                    <span>{node.path}</span>
                  </div>

                  <p className="text-xs text-cream/60 line-clamp-2 mb-3 leading-relaxed">
                    {node.working}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-cream/40 pt-2 border-t border-glass-border">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#C8FF00]" />
                      {node.duration.split(' ')[0]}
                    </span>
                    <span className="text-cream/50">
                      {node.database.provider.replace('None (Client Cache/Asset)', 'Client')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column: Node Inspector & Flow Details */}
          <div className="lg:col-span-7 bg-obsidian-2 border border-glass-border rounded-[14px] p-6 sticky top-28 shadow-2xl">
            {/* Inspector Header */}
            <div className="border-b border-glass-border pb-5 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[8px] bg-[#C8FF00]/10 border border-[#C8FF00]/30 flex items-center justify-center text-[#C8FF00]">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-cream">{selectedNode.name}</h2>
                    <p className="text-xs text-cream/60">{selectedNode.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#C8FF00]/15 text-[#C8FF00] border border-[#C8FF00]/30 uppercase">
                    {selectedNode.category}
                  </span>
                </div>
              </div>

              {/* File Path Pill with Copy */}
              <div className="flex items-center justify-between bg-obsidian border border-glass-border rounded-[6px] px-3 py-2 mt-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-[#C8FF00] truncate">
                  <FolderGit2 className="w-4 h-4 text-cream/50 flex-shrink-0" />
                  <span className="truncate">{selectedNode.path}</span>
                </div>
                <button
                  onClick={handleCopyPath}
                  className="flex items-center gap-1.5 text-xs text-cream/60 hover:text-[#C8FF00] transition-colors ml-3 flex-shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedPath ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="flex flex-wrap gap-1 border-b border-glass-border pb-3 mb-5 text-xs font-mono">
              {[
                { id: 'working', label: '1. Working & Logic' },
                { id: 'inputs', label: '2. Inputs & Outputs' },
                { id: 'buttons', label: '3. Button & Actions' },
                { id: 'connections', label: '4. Connections' },
                { id: 'database', label: '5. DB & Queries' },
                { id: 'assets', label: '6. Assets & SVGs' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-[4px] transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#C8FF00] text-obsidian font-bold'
                      : 'text-cream/60 hover:text-cream hover:bg-white/[0.04]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Working & Logic */}
            {activeTab === 'working' && (
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-mono text-[#C8FF00] uppercase mb-1.5 text-[11px]">How this node works</h4>
                  <p className="text-cream/80 leading-relaxed text-sm bg-obsidian p-4 rounded-[8px] border border-glass-border">
                    {selectedNode.working}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-obsidian p-3.5 rounded-[8px] border border-glass-border">
                    <span className="font-mono text-cream/40 text-[10px] uppercase block mb-1">Duration & Lifecycles</span>
                    <div className="flex items-center gap-2 text-cream font-mono text-xs">
                      <Clock className="w-3.5 h-3.5 text-[#C8FF00]" />
                      <span>{selectedNode.duration}</span>
                    </div>
                  </div>

                  <div className="bg-obsidian p-3.5 rounded-[8px] border border-glass-border">
                    <span className="font-mono text-cream/40 text-[10px] uppercase block mb-1">Primary Data Layer</span>
                    <div className="flex items-center gap-2 text-cream font-mono text-xs">
                      <Database className="w-3.5 h-3.5 text-[#C8FF00]" />
                      <span>{selectedNode.database.provider}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="font-mono text-[#C8FF00] uppercase mb-1.5 text-[11px] block">Downstream Connections</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.connectsTo.map(targetId => {
                      const targetNode = PROJECT_NODES.find(n => n.id === targetId)
                      return (
                        <button
                          key={targetId}
                          onClick={() => setSelectedNodeId(targetId)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-[#C8FF00]/15 border border-glass-border hover:border-[#C8FF00] rounded-[6px] text-xs font-mono text-cream transition-all group"
                        >
                          <ArrowRight className="w-3 h-3 text-[#C8FF00] group-hover:translate-x-0.5 transition-transform" />
                          <span>{targetNode?.name || targetId}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Inputs & Outputs */}
            {activeTab === 'inputs' && (
              <div className="space-y-4 text-xs font-mono">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[#C8FF00] uppercase text-[11px]">Inputs Needed</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${selectedNode.inputs.required ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {selectedNode.inputs.required ? 'Required' : 'Optional / Empty Initial'}
                    </span>
                  </div>
                  <p className="text-cream/50 text-[11px] mb-2 font-sans">{selectedNode.inputs.notes}</p>
                  <pre className="p-3 bg-obsidian rounded-[8px] border border-glass-border text-cream/90 overflow-x-auto text-[11px] leading-relaxed">
                    {selectedNode.inputs.exampleData}
                  </pre>
                </div>

                <div>
                  <span className="text-[#C8FF00] uppercase text-[11px] block mb-1.5">Output Produced</span>
                  <p className="text-cream/50 text-[11px] mb-2 font-sans">{selectedNode.outputs.notes}</p>
                  <pre className="p-3 bg-obsidian rounded-[8px] border border-glass-border text-[#C8FF00] overflow-x-auto text-[11px] leading-relaxed">
                    {selectedNode.outputs.exampleOutput}
                  </pre>
                </div>
              </div>
            )}

            {/* Tab 3: Buttons & Actions */}
            {activeTab === 'buttons' && (
              <div className="space-y-3 text-xs">
                <span className="font-mono text-[#C8FF00] uppercase text-[11px] block">
                  Interactive Buttons & Trigger Actions ({selectedNode.buttons.length})
                </span>
                <p className="text-cream/60 text-xs font-sans mb-3">
                  What happens when a user clicks buttons or triggers actions on this component:
                </p>

                {selectedNode.buttons.map((btn, idx) => (
                  <div key={idx} className="p-3.5 bg-obsidian rounded-[8px] border border-glass-border space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display font-bold text-[#C8FF00] text-sm flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 fill-[#C8FF00]" />
                        {btn.label}
                      </span>
                      {btn.target && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-cream/70">
                          Target: {btn.target}
                        </span>
                      )}
                    </div>

                    <div className="font-mono text-[11px] text-cream/50">
                      <span className="text-[#C8FF00]/70">Trigger:</span> {btn.trigger}
                    </div>

                    <div className="text-cream/80 text-xs leading-relaxed font-sans">
                      <span className="font-mono text-[#C8FF00]/70">Action & Result:</span> {btn.effect}
                    </div>

                    {btn.api && (
                      <div className="pt-1 text-[11px] font-mono text-[#C8FF00]">
                        <span className="text-cream/40">API Handshake:</span> {btn.api}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: Connected Files & Imports */}
            {activeTab === 'connections' && (
              <div className="space-y-4 text-xs font-mono">
                <div>
                  <span className="text-[#C8FF00] uppercase text-[11px] block mb-2">Imported & Linked Modules</span>
                  <div className="space-y-1.5">
                    {selectedNode.imports.map((imp, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-obsidian rounded-[6px] border border-glass-border text-cream/80">
                        <Code2 className="w-3.5 h-3.5 text-[#C8FF00] flex-shrink-0" />
                        <span className="truncate">{imp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[#C8FF00] uppercase text-[11px] block mb-2">Connected Downstream Nodes</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedNode.connectsTo.map(targetId => {
                      const t = PROJECT_NODES.find(n => n.id === targetId)
                      return (
                        <button
                          key={targetId}
                          onClick={() => setSelectedNodeId(targetId)}
                          className="p-3 bg-obsidian hover:bg-[#C8FF00]/10 border border-glass-border hover:border-[#C8FF00] rounded-[8px] text-left transition-all group"
                        >
                          <div className="font-display font-bold text-cream text-xs flex items-center justify-between">
                            <span>{t?.name || targetId}</span>
                            <ExternalLink className="w-3 h-3 text-[#C8FF00] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-[10px] text-cream/40 truncate mt-1">{t?.path}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Database & Queries */}
            {activeTab === 'database' && (
              <div className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-obsidian rounded-[8px] border border-glass-border">
                    <span className="text-cream/40 text-[10px] block mb-1 uppercase">Database Service</span>
                    <span className="font-bold text-[#C8FF00] text-sm">{selectedNode.database.provider}</span>
                  </div>
                  <div className="p-3 bg-obsidian rounded-[8px] border border-glass-border">
                    <span className="text-cream/40 text-[10px] block mb-1 uppercase">API Route & Handler</span>
                    <span className="text-cream truncate block text-xs">{selectedNode.api.route}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[#C8FF00] uppercase text-[11px] block mb-2">Target Collections / Tables</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.database.collectionsOrTables.map((col, i) => (
                      <span key={i} className="px-2.5 py-1 bg-obsidian rounded-[4px] border border-glass-border text-cream/80 text-[11px]">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[#C8FF00] uppercase text-[11px] block mb-2">Live Queries Executed</span>
                  <div className="space-y-1.5">
                    {selectedNode.database.queries.map((q, i) => (
                      <pre key={i} className="p-2.5 bg-obsidian rounded-[6px] border border-glass-border text-[#C8FF00] text-[11px] overflow-x-auto leading-relaxed">
                        {q}
                      </pre>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-glass-border">
                  <span className="text-cream/40 text-[10px] uppercase block mb-1">Backend Handler File</span>
                  <div className="text-cream/90 text-xs truncate">
                    Function: <code className="text-[#C8FF00]">{selectedNode.api.handlerName}</code> in <code className="text-cream">{selectedNode.api.handlerPath}</code>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 6: Assets & SVGs */}
            {activeTab === 'assets' && (
              <div className="space-y-3 text-xs">
                <span className="font-mono text-[#C8FF00] uppercase text-[11px] block">
                  Connected Static Assets & Vectors ({selectedNode.assets.length})
                </span>

                {selectedNode.assets.length === 0 ? (
                  <p className="text-cream/50 italic">No direct static binary assets wired to this logic node.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedNode.assets.map((asset, i) => (
                      <div key={i} className="p-3 bg-obsidian rounded-[8px] border border-glass-border flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 truncate">
                          <Compass className="w-4 h-4 text-[#C8FF00] flex-shrink-0" />
                          <div className="truncate">
                            <div className="font-display font-bold text-cream text-xs truncate">{asset.name}</div>
                            <div className="font-mono text-[10px] text-[#C8FF00] truncate">{asset.path}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-cream/60 flex-shrink-0">
                          {asset.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Global Topology Summary Footer Banner */}
        <div className="mt-16 p-8 bg-obsidian-2 border border-glass-border rounded-[14px] flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="label-mono text-[#C8FF00]">Full System Documentation</span>
            <h3 className="font-display text-2xl font-bold mt-1 text-cream">Need the complete markdown specification?</h3>
            <p className="text-xs sm:text-sm text-cream/60 mt-1 max-w-[620px]">
              Review <code className="text-[#C8FF00]">ARCHITECTURE.md</code> and <code className="text-[#C8FF00]">PROJECT.md</code> in the repository root for full offline schemas, SQL migrations, and role matrices.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/docs"
              className="px-5 py-2.5 bg-[#C8FF00] text-obsidian font-display font-semibold rounded-[4px] text-xs hover:opacity-90 transition-all"
            >
              Public API Docs
            </Link>
            <Link
              to="/portal"
              className="px-5 py-2.5 border border-glass-border text-cream font-display rounded-[4px] text-xs hover:bg-white/[0.05] transition-all"
            >
              Open Client Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
