# 🏛️ HMorix Enterprise Architecture & Complete System Topology

> **Canonical System Blueprint for HMorix Platform (`https://hmorix.in`)**  
> Document Version: `2026.3.1` | Production Origin: `https://hmorix.in`  
> Primary Datastore: **MongoDB Atlas** | Storage & Dual-Adapter: **Supabase** | Edge Runtime: **Vercel Serverless**

---

## 1. 🧭 Executive Lifecycle: Where the Project Starts & How Nodes Connect

```
[User Browser Visit]
         │
         ▼
[1. client/src/main.tsx] ──────────► Mounts React 18, BrowserRouter, AuthProvider, ThemeProvider
         │
         ▼
[2. client/src/components/AppIntroAnimation.tsx]
         │  Duration: 2,700ms (0ms drawing ➔ 700ms revealing ➔ 1400ms ready ➔ 2100ms exit)
         │  Assets: Inline Hexagon SVG Vector, CSS Cyber Grid, Neon Glow Aura (#C8FF00)
         │  Buttons: "SKIP [ESC]" ➔ updates sessionStorage('hm_intro_seen')
         │
         ▼
[3. client/src/pages/Home.tsx] ◄─── Connected directly to intro animation exit
         │  Showcase: BillingFlow Live Widget, AI Agent Typing HUD, 12+ Enterprise Clients
         │  Buttons:
         │    • "Start a Project"   ──► navigates to /contact
         │    • "Public API Docs"   ──► navigates to /docs
         │    • "Developer Portal"  ──► navigates to /developers
         │    • "OpenAPI Spec"      ──► opens /openapi.json
         │    • "Schedule a Call"   ──► navigates to /contact
         │
         ▼
[4. client/src/pages/auth/SignIn.tsx]
         │  Session: HMAC-SHA256 signed HTTP-only cookie (hm_session)
         │  Database: MongoDB 'users' + 'sessions' (TTL: 7 days)
         │  Dynamic Role Routing Matrix:
         │    • 'admin'    ──► /admin or /manager
         │    • 'manager'  ──► /manager
         │    • 'hr'       ──► /hrm
         │    • 'employee' ──► /employee
         │    • 'sales'    ──► /sales
         │    • 'crm'      ──► /crm
         │    • 'user'     ──► /portal (Client Portal)
         │
         ▼
[5. Enterprise Multi-Portals] ───► [6. Vercel Serverless api/[...path].ts] ───► [7. MongoDB Atlas & Supabase]
```

---

## 2. 🧩 Node-by-Node Specification & Flow Map

Every node below documents:
- **File Name & Exact File Path**
- **How it Works (Working Mechanism)**
- **Duration & Lifecycles**
- **Inputs Needed (with sample payloads)**
- **Outputs Produced**
- **Interactive Button Click Behaviors**
- **Connected / Imported Files**
- **Database Layer (MongoDB Atlas vs Supabase)**
- **Exact Queries Run**
- **API Route, Handler Function Name, File & Path**
- **Connected Static Assets (SVGs, PDFs, WebManifest)**

---

### Node 1: Application Bootstrap & Context Providers
- **File Name**: `main.tsx`
- **File Path**: `client/src/main.tsx`
- **Category**: Client Entry
- **Duration**: `50ms – 120ms` initial DOM mount.
- **Working**: Mounts the React 18 Concurrent Root onto `#root`. Sets up `BrowserRouter` for SPA routing, wraps inside `AuthProvider` for signed session synchronization, and `ThemeProvider` for Obsidian Dark / Light mode switching. Imports global stylesheet resets (`client/src/styles/globals.css`).
- **Inputs**:
  - DOM Container: `<div id="root"></div>`
  - Browser Storage: `localStorage.getItem('theme')`, `localStorage.getItem('keyboardShortcuts')`
- **Outputs**: Mounted React DOM tree with active context listeners.
- **Buttons / Actions**:
  - **Browser Navigation / Initial Load**: Triggers React bootstrap and initiates session verification check (`/api/auth/me`).
- **Imports**:
  - `client/src/App.tsx`
  - `client/src/lib/AuthContext.tsx`
  - `client/src/lib/ThemeContext.tsx`
  - `client/src/styles/globals.css`
- **Database & Queries**:
  - Provider: `None (Client initialization)`
  - Storage: `localStorage.getItem("theme")`, `localStorage.setItem("theme", "dark")`
- **API Endpoint**: None
- **Connected Assets**:
  - `client/public/favicon.svg` (Browser Tab Vector)
  - `client/public/manifest.webmanifest` (PWA Manifest)
  - `client/public/sw.js` (Service Worker Registration)
- **Connects To**: `AppIntroAnimation.tsx`, `App.tsx`

---

### Node 2: System Boot Animation
- **File Name**: `AppIntroAnimation.tsx`
- **File Path**: `client/src/components/AppIntroAnimation.tsx`
- **Category**: Boot Animation
- **Duration**: Total `2,700ms`:
  - `0ms – 700ms`: Phase `drawing` (Framer Motion draws hexagonal brand shield stroke via `pathLength: 1`)
  - `700ms – 1,400ms`: Phase `revealing` (Brand monogram slide-up, subtitle telemetry "Enterprise AI Architecture")
  - `1,400ms – 2,100ms`: Phase `ready` (Progress bar animates to 100%, status text displays "SYSTEMS READY")
  - `2,100ms – 2,700ms`: Phase `exit` (Overlay dissolves via `opacity: 0`, scales to `1.05`, and unmounts)
- **Working**: Runs strictly once per browser session. Checks `sessionStorage.getItem('hm_intro_seen')` and `prefers-reduced-motion`. If already seen or user prefers reduced motion, unmounts instantly (`return null`). Otherwise renders a fixed full-viewport cybernetic HUD (`z-[99999]`, `#0A0A0B`) with vector drawing animations and audio-visual telemetry.
- **Inputs**:
  ```typescript
  // Component Props:
  interface AppIntroAnimationProps {
    onComplete?: () => void
  }
  // Browser state check:
  sessionStorage.getItem('hm_intro_seen') === null
  window.matchMedia('(prefers-reduced-motion: reduce)').matches === false
  ```
- **Outputs**:
  - Rendered full-screen SVG animation overlay.
  - On exit: Sets `sessionStorage.setItem('hm_intro_seen', 'true')` and invokes `onComplete?.()`.
- **Buttons / Actions**:
  - **`SKIP [ESC]` Button**:
    - Trigger: Click on `SKIP [ESC]` button, or pressing `Escape`, `Enter`, or `Spacebar`.
    - Effect: Dissolves overlay within 200ms, writes `hm_intro_seen = 'true'`, and immediately reveals Home page.
- **Imports**:
  - `framer-motion` (`motion`, `AnimatePresence`)
  - `react` (`useState`, `useEffect`)
- **Database & Queries**:
  - Provider: `None (SessionStorage)`
  - Storage Call: `sessionStorage.setItem('hm_intro_seen', 'true')`
- **API Endpoint**: None (Pure frontend client animation)
- **Connected Assets**:
  - **Hexagon Shield SVG**: Hardcoded mathematical vector points (`24,3.06 42.14,13.53 42.14,34.47 24,44.94 5.86,34.47 5.86,13.53`)
  - **Cyber Grid Pattern**: CSS linear gradient (`#C8FF00 1px, transparent 1px`, `40px 40px`)
  - **Neon Glow Aura**: Radial blur `110px` with `#C8FF00`
- **Connects To**: `Home.tsx` (Route `/`), `MainLayout.tsx`

---

### Node 3: Home Showcase Page
- **File Name**: `Home.tsx`
- **File Path**: `client/src/pages/Home.tsx`
- **Category**: Marketing Landing Page
- **Duration**: `1,200ms` animated numerical counter progression (60 ticks @ 20ms interval).
- **Working**: Core landing page highlighting HMorix capabilities:
  - Hero with dynamic stats (`12+ Enterprise Clients`, `180+ Delivered Projects`, `98% Satisfaction`, `3+ Years Experience`).
  - Interactive BillingFlow dashboard visual mockup with floating revenue graph.
  - Live AI Agent typing simulation ("Generating website...").
  - Enterprise service cards (Web, AI Agents, Cyber Security, PDF Automation, BillingFlow, Smart Home, Analytics, Cloud).
  - Developer public API banner with direct OpenAPI JSON specification links.
- **Inputs**:
  - Route: `/`
  - SEO Metadata: Title, Description, Canonical link.
- **Outputs**: Fully interactive landing page DOM tree.
- **Buttons / Actions**:
  - **`Start a Project`**:
    - Trigger: Click on primary lime button.
    - Effect: Navigates to `/contact` (Project onboarding & inquiry form).
  - **`Public API Docs`**:
    - Trigger: Click on secondary lime outline button.
    - Effect: Navigates to `/docs` (Interactive OpenAPI documentation).
  - **`Developer Portal`**:
    - Trigger: Click on glass border button.
    - Effect: Navigates to `/developers` (API keys, webhooks, and SDKs).
  - **`OpenAPI Spec`**:
    - Trigger: Click on OpenAPI Spec pill.
    - Effect: Opens `/openapi.json` in new browser tab for Swagger/Postman imports.
  - **`Schedule a Call`**:
    - Trigger: Click on footer CTA button.
    - Effect: Navigates to `/contact`.
  - **`View Pricing`**:
    - Trigger: Click on outline CTA button.
    - Effect: Navigates to `/pricing`.
  - **Service Cards (8 cards)**:
    - Trigger: Click on any card.
    - Effect: Navigates to corresponding `/services/*` page.
- **Imports**:
  - `client/src/components/seo/SEOHead.tsx`
  - `lucide-react` (Globe, Bot, ShieldCheck, FileText, CreditCard, Home, BarChart3, Cloud, Target, Zap, Lock, Users)
  - `react-router-dom` (`Link`)
- **Database & Queries**:
  - Provider: `MongoDB Atlas` (on form submit)
  - Collection: `contact_submissions`
  - Query: `db.collection('contact_submissions').insertOne({ name, email, message, createdAt: new Date() })`
- **API Endpoint**:
  - Route: `/api/contact`
  - Handler: `handleContact` in `api/[...path].ts` (Line ~3200)
- **Connected Assets**:
  - `client/public/openapi.json`
  - `client/public/openapi.yaml`
  - Floating BillingFlow Mockup widget
  - Animated CSS Typing Cursor
- **Connects To**: `MainLayout.tsx`, `SignIn.tsx`, `BillingFlow.tsx`, `AIAgent.tsx`, `PDFAutomation.tsx`

---

### Node 4: Application Router & Global Shell
- **File Name**: `App.tsx`
- **File Path**: `client/src/App.tsx`
- **Category**: Global Routing & Shortcuts
- **Duration**: Persistent session shell.
- **Working**: Hosts React Router DOM v6 route definitions with lazy loading (`Suspense`). Enforces `AppErrorBoundary` with offline degradation. Handles global keyboard accelerators:
  - `Cmd+K` / `Ctrl+K`: Toggles `CommandPalette`.
  - `Cmd+D` / `Ctrl+D`: Navigates to `/dashboard`.
  - `Cmd+,` / `Ctrl+,`: Navigates to `/settings`.
  - `Cmd+Shift+T`: Toggles dark/light theme.
  - Fetches `/api/settings` on mount to synchronize platform feature flags.
- **Inputs**: Current route URL pathname, active user session from `useAuth()`.
- **Outputs**: Rendered page component inside `MainLayout`.
- **Buttons / Actions**:
  - **Global Shortcuts**: Triggers rapid keyboard navigation and settings synchronization.
- **Imports**:
  - `client/src/layouts/MainLayout.tsx`
  - `client/src/components/CommandPalette.tsx`
  - `client/src/components/OfflineStatus.tsx`
  - `client/src/components/AppIntroAnimation.tsx`
- **Database & Queries**:
  - Provider: `MongoDB Atlas`
  - Collection: `settings`
  - Query: `db.collection('settings').findOne({ type: 'global' })`
- **API Endpoint**:
  - Route: `GET /api/settings`
  - Handler: `handleSettings` in `api/[...path].ts`
- **Connected Assets**: `client/public/favicon.ico`
- **Connects To**: All marketing pages, all 7 portals, and all product ecosystems.

---

### Node 5: Layout & Global Navigation Shell
- **File Name**: `MainLayout.tsx & Navbar.tsx`
- **File Path**: `client/src/layouts/MainLayout.tsx & client/src/components/Navbar.tsx`
- **Category**: Shell & Navigation
- **Duration**: Real-time scroll listener (>40px scroll triggers glassmorphism background blur).
- **Working**: Renders sticky navigation header with brand monogram, service menus, product suites, unread notification counter badge, theme toggle, and authenticated user dropdown. Polls `/api/notifications` and registers listener for `hm-notification-event`.
- **Inputs**: User object from `useAuth()`, notifications array from store.
- **Outputs**: Navigation bar, notification slide-down drawer, user menu, and footer.
- **Buttons / Actions**:
  - **Theme Toggle**: Switches dark ↔ light mode, persists to `localStorage`.
  - **Notification Bell**: Opens drawer; clicking "Mark Read" triggers `PUT /api/notifications`.
  - **Sign Out**: Calls `signOut()`, deletes `hm_session` cookie via `/api/logout`, redirects to `/signin`.
- **Imports**:
  - `client/src/components/BrandLogo.tsx`
  - `client/src/lib/notificationStore.ts`
  - `client/src/lib/AuthContext.tsx`
- **Database & Queries**:
  - Provider: `MongoDB Atlas`
  - Collection: `notifications`
  - Queries:
    - `db.collection('notifications').find({ $or: [{ userId }, { role }, { broadcast: true }] }).sort({ createdAt: -1 }).limit(30)`
    - `db.collection('notifications').updateMany({ userId }, { $set: { read: true } })`
- **API Endpoint**:
  - Route: `GET /api/notifications` & `PUT /api/notifications`
  - Handler: `handleNotifications` in `api/[...path].ts`
- **Connected Assets**:
  - `client/public/hmorix-icon-lime.svg`
  - `client/public/hmorix-logo-dark.svg`
  - `client/public/hmorix-logo-light.svg`
- **Connects To**: `SignIn.tsx`, `HRMDashboard.tsx`, `EmployeePortal.tsx`, `ManagerPortal.tsx`, `CRMDashboard.tsx`, `SalesPortal.tsx`, `ClientPortal.tsx`, `AdminDashboard.tsx`

---

### Node 6: Authentication & Session Engine
- **File Name**: `SignIn.tsx & AuthContext.tsx`
- **File Path**: `client/src/pages/auth/SignIn.tsx & client/src/lib/AuthContext.tsx`
- **Category**: Authentication Gateway
- **Duration**: `180ms – 320ms` authentication handshake.
- **Working**: Authenticates credentials using `bcrypt.compare(password, user.passwordHash)` (12 rounds) or OAuth2 via Google/GitHub. On success, generates an HMAC-SHA256 signed HttpOnly cookie:
  ```
  hm_session = <sessionId>.<crypto.createHmac('sha256', SECRET).update(sessionId).digest('base64url')>
  ```
  Redirects user dynamically to their role workspace.
- **Inputs**:
  ```json
  {
    "email": "hr@hmorix.in",
    "password": "SecurePassword#2026"
  }
  ```
- **Outputs**:
  ```json
  {
    "success": true,
    "user": {
      "id": "6648b209a1f28b4c",
      "email": "hr@hmorix.in",
      "name": "HR Operations Lead",
      "role": "hr",
      "emailVerified": true
    }
  }
  ```
- **Buttons / Actions**:
  - **`Sign In (Submit)`**: Triggers `POST /api/auth/signin`.
  - **`Continue with Google`**: Redirects to `/api/auth/google`.
  - **`Continue with GitHub`**: Redirects to `/api/auth/github`.
  - **`Forgot password?`**: Navigates to `/forgot-password`.
- **Database & Queries**:
  - Provider: `MongoDB Atlas`
  - Collections: `users`, `sessions`
  - Queries:
    - `db.collection('users').findOne({ email: cleanEmail(email) })`
    - `bcrypt.compare(password, user.passwordHash)`
    - `db.collection('sessions').insertOne({ userId, token, expiresAt, createdAt })`
- **API Endpoint**:
  - Route: `/api/auth/signin` & `/api/auth/me`
  - Handler: `handleAuthSignin`, `handleAuthMe` in `api/[...path].ts`
- **Connected Assets**: `BrandIcon` Monogram Shield
- **Connects To**: All 7 Portals based on user role.

---

### Node 7: Enterprise HRM Suite
- **File Name**: `HRMDashboard.tsx`
- **File Path**: `client/src/pages/hrm/HRMDashboard.tsx`
- **Category**: Core Business Portal
- **Duration**: `220ms` data query latency.
- **Working**: Complete HR management:
  - Employee roster with unique `HM-XXXXXX` IDs.
  - ATS Applicant tracking with AI resume scoring.
  - Multi-tier leave approval queue.
  - Automated monthly Indian statutory payroll processing (PF 12%, ESI 0.75%, TDS slab calculation).
  - 1-click legal document generation (Offer letters, Appointment letters, Payslip PDFs).
- **Inputs**:
  - Session cookie `hm_session` (Enforces role: `admin` or `hr`).
  - Employee creation payload:
    ```json
    {
      "fullName": "Aarav Sharma",
      "email": "aarav.sharma@hmorix.in",
      "role": "Frontend Architect",
      "department": "Engineering",
      "salary": 1400000,
      "joiningDate": "2026-10-01"
    }
    ```
- **Outputs**: Consolidated HR dashboard telemetry, headcount charts, and PDF download streams.
- **Buttons / Actions**:
  - **`Add New Employee`**: Navigates to `/hrm/employees/new`. Auto-provisions employee record and auth credentials.
  - **`Approve Leave Request`**: Sends `PUT /api/hrm/leave` with `{ id, status: 'approved' }`.
  - **`Run Monthly Payroll`**: Sends `POST /api/hrm/payroll`. Calculates statutory deductions and records payroll batch.
  - **`Export Payroll Report`**: Downloads CSV and consolidated PDF summary.
  - **`Generate Offer Letter`**: Compiles candidate details into official PDF document with signing link.
- **Imports**:
  - `client/src/pages/hrm/Recruitment.tsx`
  - `client/src/pages/hrm/Payroll.tsx`
  - `client/src/pages/hrm/Leaves.tsx`
  - `client/src/pages/hrm/AddEmployee.tsx`
  - `client/src/pages/hrm/HRMCalendar.tsx`
  - `client/src/pages/hrm/Internship.tsx`
  - `client/src/lib/hrm-documents.ts`
- **Database & Queries**:
  - Provider: `MongoDB Atlas` + `Supabase Storage (Orixbucket)`
  - Collections: `hrm_employees`, `hrm_leave_requests`, `hrm_payroll_runs`, `hrm_recruitment`, `job_applications`
  - Queries:
    - `db.collection('hrm_employees').find({ status: 'active' }).toArray()`
    - `db.collection('hrm_leave_requests').find({ status: 'pending' }).toArray()`
    - `db.collection('hrm_payroll_runs').find().sort({ month: -1 })`
    - `db.collection('job_applications').find().sort({ created_at: -1 })`
- **API Endpoint**:
  - Routes: `/api/hrm/stats`, `/api/hrm/employees`, `/api/hrm/payroll`, `/api/hrm/leave`, `/api/hrm/recruitment`
  - Handlers: `handleHrmStats`, `handleHrmEmployees`, `handleHrmPayroll`, `handleHrmLeave` in `api/[...path].ts`
- **Connected Assets**:
  - Branded Offer Letter HTML/PDF template
  - Resume PDFs in `Supabase Storage: Orixbucket/resumes/*`
- **Connects To**: `EmployeePortal.tsx`, `ManagerPortal.tsx`, `api/[...path].ts`

---

### Node 8: Employee Self-Service (ESS)
- **File Name**: `EmployeePortal.tsx`
- **File Path**: `client/src/pages/employee/EmployeePortal.tsx`
- **Category**: Core Business Portal
- **Duration**: `140ms` clock-in mutation; `1,000ms` live work duration ticker.
- **Working**: Personal workspace for employees. Daily biometric/browser clock-in and clock-out with IP/timestamp tracking, assigned sprint tasks board, personal leave applications, document vault, and monthly payslip downloads.
- **Inputs**:
  ```json
  // Punch Clock Payload:
  {
    "action": "clock_in",
    "timestamp": "2026-09-03T09:00:00.000Z",
    "workMode": "remote"
  }
  ```
- **Outputs**: Active clock-in status, work duration counter, task list, downloadable payslip PDF.
- **Buttons / Actions**:
  - **`Clock In / Clock Out`**: Triggers `POST /api/employee/attendance`.
  - **`Submit Leave Request`**: Triggers `POST /api/hrm/leave`.
  - **`Mark Task Done`**: Triggers `PUT /api/hrm/tasks` with `{ taskId, status: 'completed' }`.
  - **`Download Payslip`**: Triggers `GET /api/employee/payslip?month=2026-08`.
- **Imports**:
  - `client/src/pages/employee/Directory.tsx`
  - `client/src/pages/employee/Tasks.tsx`
  - `client/src/pages/employee/Requests.tsx`
  - `client/src/pages/employee/BillingAssignment.tsx`
- **Database & Queries**:
  - Provider: `MongoDB Atlas`
  - Collections: `employee_attendance`, `hrm_tasks`, `hrm_leave_requests`, `employee_documents`
  - Queries:
    - `db.collection('employee_attendance').findOne({ employeeId, date: todayDate })`
    - `db.collection('employee_attendance').insertOne({ employeeId, clockIn, clockOut, duration })`
    - `db.collection('hrm_tasks').find({ assignedTo: employeeId, status: { $ne: 'archived' } })`
- **API Endpoint**:
  - Routes: `/api/employee/dashboard`, `/api/employee/attendance`, `/api/employee/payslip`
  - Handlers: `handleEmployeeDashboard`, `handleEmployeeAttendance`, `handleEmployeePayslip` in `api/[...path].ts`
- **Connected Assets**: Official PDF Payslip binary stream.
- **Connects To**: `ManagerPortal.tsx`, `HRMDashboard.tsx`, `api/[...path].ts`

---

### Node 9: Operations & Delivery Manager Portal
- **File Name**: `ManagerPortal.tsx`
- **File Path**: `client/src/pages/manager/ManagerPortal.tsx`
- **Category**: Core Business Portal
- **Duration**: `180ms` pod query execution.
- **Working**: Cockpit for engineering delivery leads and managers: assemble cross-functional project pods, assign client deliverables to employee sprint tasks, conduct quarterly OKR/KPI appraisal scoring (1.0 – 5.0 stars with written feedback), and triage incoming client support tickets.
- **Inputs**:
  ```json
  // Sprint Task Delegation:
  {
    "title": "Implement Supabase Storage Webhook",
    "assignedTo": "HM-042",
    "projectId": "PRJ-9042",
    "priority": "high",
    "dueDate": "2026-09-18"
  }
  ```
- **Outputs**: Team pod capacity matrix, project velocity metrics, ticket triage queues.
- **Buttons / Actions**:
  - **`Create Engineering Pod`**: Triggers `POST /api/manager/teams`.
  - **`Delegate Sprint Task`**: Triggers `POST /api/hrm/tasks`.
  - **`Submit OKR Rating`**: Triggers appraisal update via `PUT /api/hrm/employees`.
  - **`Assign Ticket to Engineer`**: Triggers `PUT /api/tickets`.
- **Database & Queries**:
  - Provider: `MongoDB Atlas`
  - Collections: `hrm_teams`, `client_projects`, `hrm_tasks`, `tickets`
  - Queries:
    - `db.collection('hrm_teams').find().toArray()`
    - `db.collection('client_projects').find({ status: 'active' }).toArray()`
    - `db.collection('tickets').find({ status: 'open' }).sort({ createdAt: -1 })`
- **API Endpoint**:
  - Routes: `/api/manager/overview`, `/api/manager/teams`, `/api/hrm/tasks`, `/api/tickets`
  - Handlers: `handleManagerOverview`, `handleManagerTeams` in `api/[...path].ts`
- **Connects To**: `EmployeePortal.tsx`, `ClientPortal.tsx`, `CRMDashboard.tsx`

---

### Node 10: Field Sales Portal
- **File Name**: `SalesPortal.tsx`
- **File Path**: `client/src/pages/sales/SalesPortal.tsx`
- **Category**: Field Lead Sourcing
- **Duration**: `160ms` atomic 3-way synchronization.
- **Working**: High-speed mobile-optimized portal for on-ground sales reps pitching local businesses (Hotels, Restaurants, Factories, Clinics, Schools, Retail across UP and Delhi NCR). Submitting a lead initiates an atomic 3-way synchronization: Contact ➔ CRM Deal ➔ Client Project.
- **Inputs**:
  ```json
  {
    "businessName": "Vrindavan Heritage Resort",
    "contactPerson": "Vikram Singh",
    "phone": "+91-98765-43210",
    "email": "vikram@vrindavanresort.com",
    "sector": "Hospitality",
    "projectType": "Smart AI Booking Engine & Website",
    "dealValue": 250000,
    "notes": "Met on-site. Needs automated WhatsApp confirmations."
  }
  ```
- **Outputs**: Immediate synchronization confirmation with generated `dealId` and `projectId`.
- **Buttons / Actions**:
  - **`Capture & Sync Lead`**: Triggers `POST /api/sales/projects`.
  - **`1-Click Deal Won`**: Advances deal stage directly to `closed_won`.
- **Database & Queries**:
  - Provider: `MongoDB Atlas`
  - Collections: `crm_contacts`, `crm_deals`, `client_projects`
  - Queries:
    - `db.collection('crm_contacts').insertOne(contactData)`
    - `db.collection('crm_deals').insertOne({ title, value, stage: 'lead', ownerEmail })`
    - `db.collection('client_projects').insertOne({ title, status: 'planning', clientEmail })`
- **API Endpoint**:
  - Route: `/api/sales/projects` & `/api/crm/deals`
  - Handlers: `handleSalesProjects`, `handleCrmDeals` in `api/[...path].ts`
- **Connected Assets**: IndexedDB offline buffer (`hmorix-offline`).
- **Connects To**: `CRMDashboard.tsx`, `ManagerPortal.tsx`, `api/[...path].ts`

---

### Node 11: Commercial CRM Suite
- **File Name**: `CRMDashboard.tsx`
- **File Path**: `client/src/pages/crm/CRMDashboard.tsx`
- **Category**: Commercial Operations
- **Duration**: `80ms` Kanban drag-and-drop state mutation.
- **Working**: Tracks enterprise deal pipeline stages (`lead` ➔ `contacted` ➔ `proposal` ➔ `negotiation` ➔ `closed_won` ➔ `closed_lost`), sales representative quota attainment, and aggregate revenue forecasting.
- **Inputs**: Deal stage mutation payload:
  ```json
  {
    "dealId": "DEAL-8492",
    "stage": "negotiation",
    "expectedCloseDate": "2026-09-30",
    "probability": 85
  }
  ```
- **Outputs**: Real-time pipeline metrics, weighted revenue projections, contact history.
- **Buttons / Actions**:
  - **`Move Deal Stage`**: Triggers `PUT /api/crm/deals`.
  - **`Create New Deal`**: Triggers `POST /api/crm/deals`.
  - **`Export Pipeline Data`**: Triggers `GET /api/crm/deals?format=csv`.
- **Database & Queries**:
  - Provider: `MongoDB Atlas`
  - Collections: `crm_deals`, `crm_contacts`, `activity_log`
  - Queries:
    - `db.collection('crm_deals').find().sort({ updatedAt: -1 })`
    - `db.collection('crm_deals').aggregate([{ $group: { _id: '$stage', total: { $sum: '$value' } } }])`
- **API Endpoint**:
  - Routes: `/api/crm/stats`, `/api/crm/deals`, `/api/crm/contacts`
  - Handlers: `handleCrmStats`, `handleCrmDeals` in `api/[...path].ts`
- **Connects To**: `SalesPortal.tsx`, `ManagerPortal.tsx`, `ClientPortal.tsx`

---

### Node 12: Client Customer Portal
- **File Name**: `ClientPortal.tsx`
- **File Path**: `client/src/pages/portal/ClientPortal.tsx`
- **Category**: Customer Experience
- **Duration**: `210ms` customer workspace load.
- **Working**: Dedicated transparency portal for paying clients: inspect project sprint progress, view team roster, download official GST invoices (`INV-XXXX`), generate production API developer keys, and open support tickets (`TKT-XXXXXX`).
- **Inputs**:
  - Client session cookie (`hm_session`).
  - Strict data isolation: `userId == user.id || clientEmail == user.email`.
  - Ticket payload:
    ```json
    {
      "subject": "Webhook retry configuration",
      "category": "Integration",
      "priority": "High",
      "description": "We need our webhook endpoint to receive raw invoice JSON payloads."
    }
    ```
- **Outputs**: Real-time milestone progress bar, invoices table, support ticket tracker.
- **Buttons / Actions**:
  - **`Submit Support Ticket`**: Triggers `POST /api/tickets` (Auto-assigns `TKT-XXXXXX` code and alerts Engineering Lead).
  - **`Download GST Invoice`**: Triggers `GET /api/account/billing/invoices/:id/pdf`.
  - **`Generate API Key`**: Triggers `POST /api/account/api-keys`.
- **Database & Queries**:
  - Provider: `MongoDB Atlas`
  - Collections: `client_projects`, `invoices`, `tickets`
  - Queries:
    - `db.collection('client_projects').find({ $or: [{ userId: user.id }, { clientEmail: user.email }] })`
    - `db.collection('invoices').find({ clientEmail: user.email })`
    - `db.collection('tickets').insertOne({ ticketId, userEmail, subject, status: 'open', createdAt })`
- **API Endpoint**:
  - Routes: `/api/portal`, `/api/projects`, `/api/invoices`, `/api/tickets`
  - Handlers: `handleClientPortal`, `handleTickets`, `handleInvoices` in `api/[...path].ts`
- **Connected Assets**: Signed PDF invoice streams generated by Node.js.
- **Connects To**: `ManagerPortal.tsx`, `BillingFlow.tsx`, `api/[...path].ts`

---

### Node 13: Super Admin Suite
- **File Name**: `AdminDashboard.tsx`
- **File Path**: `client/src/pages/admin/AdminDashboard.tsx`
- **Category**: Governance & Audit
- **Duration**: `240ms` audit trail query.
- **Working**: Full administrative control: user roster management, role escalation/demotion, immutable security audit logs (`activity_log`), system settings configuration, broadcast notification dispatch, and blog publishing.
- **Inputs**: Admin session (`role === 'admin'`).
- **Outputs**: User table, audit event timeline, database latency metrics.
- **Buttons / Actions**:
  - **`Update User Role`**: Triggers `PUT /api/admin/users`.
  - **`Broadcast Notification`**: Triggers `POST /api/notifications`.
  - **`Publish Blog Post`**: Triggers `POST /api/blogs`.
- **Database & Queries**:
  - Provider: `MongoDB Atlas`
  - Collections: `users`, `activity_log`, `settings`, `blogs`
  - Queries:
    - `db.collection('users').find().sort({ createdAt: -1 })`
    - `db.collection('activity_log').find().sort({ timestamp: -1 }).limit(100)`
    - `db.collection('settings').findOne({ type: 'global' })`
- **API Endpoint**:
  - Routes: `/api/admin/stats`, `/api/admin/users`, `/api/admin/logs`, `/api/settings`
  - Handlers: `handleAdminStats`, `handleAdminUsers`, `handleAdminLogs` in `api/[...path].ts`
- **Connected Assets**: `sitemap.xml`, `robots.txt`
- **Connects To**: `api/[...path].ts`, `mongo-db`

---

### Node 14: BillingFlow Product Ecosystem
- **File Name**: `BillingFlow.tsx`
- **File Path**: `client/src/pages/products/BillingFlow.tsx`
- **Category**: Enterprise Product
- **Duration**: `40ms` client-side tax computation.
- **Working**: Multi-currency invoicing, Indian GST (CGST/SGST/IGST) tax computation, recurring client retainers, and compliant PDF invoice downloads.
- **Inputs**: Itemized invoice breakdown with tax rates.
- **Outputs**: Computed invoice record, payable link, and PDF invoice binary.
- **Buttons / Actions**:
  - **`Create Invoice`**: Triggers `POST /api/invoices`.
  - **`Download Invoice PDF`**: Triggers `GET /api/account/billing/invoices/:id/pdf`.
- **Database & Queries**:
  - Provider: `MongoDB Atlas`
  - Collection: `invoices`
  - Query: `db.collection('invoices').insertOne(invoiceDoc)`
- **API Endpoint**:
  - Route: `/api/invoices` & `/api/account/billing`
  - Handler: `handleInvoices`, `handleBilling` in `api/[...path].ts`
- **Connects To**: `ClientPortal.tsx`, `api/[...path].ts`

---

### Node 15: AI Agent & LLM Playground
- **File Name**: `AIAgent.tsx & AIAgentPlayground.tsx`
- **File Path**: `client/src/pages/products/AIAgent.tsx`
- **Category**: Enterprise Product
- **Duration**: `850ms – 2,400ms` neural streaming response.
- **Working**: High-performance AI agent and prompt playground powered by NVIDIA NIM inference (`meta/llama-3.1-405b-instruct`). Performs automated code generation, customer support reasoning, and contract analysis.
- **Inputs**:
  ```json
  {
    "model": "meta/llama-3.1-405b-instruct",
    "prompt": "Analyze this employee contract and highlight any non-compete ambiguities.",
    "temperature": 0.4,
    "maxTokens": 1024
  }
  ```
- **Outputs**: Real-time streaming markdown tokens and JSON tool calls.
- **Buttons / Actions**:
  - **`Run Agent Query`**: Triggers `POST /api/ai/chat`.
  - **`Open Playground`**: Navigates to `/agent/playground`.
- **Database & Queries**:
  - Provider: `None (Direct NVIDIA NIM HTTPS inference with bearer token)`
- **API Endpoint**:
  - Route: `/api/ai/chat` & `/api/ai/playground`
  - Handler: `handleAiChat`, `handleAiPlayground` in `api/[...path].ts`
- **Connects To**: `api/[...path].ts`

---

### Node 16: PDF Automation Engine
- **File Name**: `PDFAutomation.tsx & hrm-documents.ts`
- **File Path**: `client/src/pages/products/PDFAutomation.tsx`
- **Category**: Enterprise Product
- **Duration**: `350ms – 600ms` document synthesis.
- **Working**: High-throughput document compiler. Renders dynamic HTML templates into binary PDF documents with vector branding, anti-tamper hashes, and auto-uploads to Supabase Storage (`Orixbucket`).
- **Inputs**: Document synthesis payload (candidate data, salary, role).
- **Outputs**: Downloadable PDF binary and public Supabase CDN URL.
- **Buttons / Actions**:
  - **`Synthesize Document`**: Renders PDF binary.
  - **`Upload to Cloud Vault`**: Triggers `POST /api/upload`.
- **Database & Queries**:
  - Provider: `Supabase Storage (Orixbucket)`
  - Query: `supabase.storage.from('Orixbucket').upload(path, buffer, { contentType: 'application/pdf' })`
- **API Endpoint**:
  - Route: `/api/upload`
  - Handler: `handleUpload` in `api/[...path].ts`
- **Connects To**: `HRMDashboard.tsx`, `Supabase Storage`

---

### Node 17: Vercel Serverless API Gateway
- **File Name**: `[...path].ts`
- **File Path**: `api/[...path].ts`
- **Category**: Backend Gateway
- **Duration**: `40ms – 160ms` execution time.
- **Working**: Catch-all serverless router running on Vercel Node.js runtime. Handles CORS headers, validates signed session cookies (`decodeSessionCookie`), enforces RBAC (`requireRole`), caches MongoDB Atlas client connection, and provides dual-adapter support for Supabase.
- **Inputs**: Incoming `VercelRequest` (headers, path segments, cookie, JSON body).
- **Outputs**: `VercelResponse` with status codes (`200`, `201`, `401`, `403`, `500`), JSON body, or PDF binary streams.
- **Database & Queries**:
  - Coordinates all reads and writes to MongoDB Atlas and Supabase Storage.
- **API Endpoint**: Universal `/api/*` router (50+ registered endpoints).
- **Connects To**: MongoDB Atlas and Supabase.

---

### Node 18: MongoDB Atlas Primary Datastore
- **File Name**: `api/[...path].ts & server/db/mongo.js`
- **File Path**: `api/[...path].ts`
- **Category**: Primary Database
- **Duration**: `12ms – 35ms` P95 query latency.
- **Working**: Primary production database storing all operational documents. Includes automated TTL indexing on `sessions.expiresAt` (7-day lifecycle) and compound unique indexes on `users.email`.
- **Collections Master Table**:
  | Collection | Portal Owner | Primary Query Pattern |
  | :--- | :--- | :--- |
  | `users` | Auth & Admin | `col.findOne({ email })`, `col.find().sort({ createdAt: -1 })` |
  | `sessions` | Auth | `col.findOne({ token, expiresAt: { $gt: new Date() } })` (TTL) |
  | `hrm_employees` | HRM & Employee | `col.find({ status: 'active' })`, `col.updateOne({ _id })` |
  | `hrm_leave_requests` | HRM & Employee | `col.find({ employeeId })`, `col.find({ status: 'pending' })` |
  | `hrm_payroll_runs` | HRM & Employee | `col.find().sort({ month: -1 })` |
  | `hrm_tasks` | Manager & Employee | `col.find({ assignedTo: employeeId })` |
  | `hrm_teams` | Manager | `col.find().toArray()` |
  | `employee_attendance` | Employee & HRM | `col.findOne({ employeeId, date })`, `col.insertOne()` |
  | `crm_contacts` | Sales & CRM | `col.find().sort({ createdAt: -1 })` |
  | `crm_deals` | Sales & CRM | `col.aggregate([{ $group: { _id: '$stage', sum: { $sum: '$value' } } }])` |
  | `client_projects` | Client & Manager | `col.find({ $or: [{ userId }, { clientEmail }] })` |
  | `invoices` | BillingFlow & Client | `col.find({ clientEmail })`, `col.insertOne()` |
  | `tickets` | Client & Manager | `col.find({ status: 'open' })`, `col.insertOne()` |
  | `activity_log` | Admin | `col.find().sort({ timestamp: -1 }).limit(100)` |
  | `settings` | Admin & App Root | `col.findOne({ type: 'global' })` |
  | `blogs` | Blog & Admin | `col.find({ published: true })`, `col.insertOne()` |

---

### Node 19: Supabase Storage & Dual-Adapter
- **File Name**: `client/src/lib/supabase.ts & server/db/supabase.js`
- **File Path**: `client/src/lib/supabase.ts & api/[...path].ts`
- **Category**: Cloud Storage & SQL Dual-Adapter
- **Duration**: `180ms – 420ms` file upload latency.
- **Working**: Cloud object storage bucket (`Orixbucket`) for binary assets: applicant resumes, generated legal PDFs, blog JSON backups, and documents. Also acts as an alternate SQL database adapter via `DATABASE=supabase` environment configuration.
- **Target Bucket**: `Orixbucket`
- **Queries Run**:
  ```typescript
  // File upload:
  supabase.storage.from('Orixbucket').upload(path, buffer, { contentType })
  // Public URL resolution:
  supabase.storage.from('Orixbucket').getPublicUrl(path)
  // SQL Dual-Adapter (when DATABASE=supabase):
  supabase.from('job_applications').select('*').order('created_at', { ascending: false })
  ```
- **Connects To**: `api/[...path].ts`, `HRMDashboard.tsx`, `PDFAutomation.tsx`

---

### Node 20: Static Assets & Brand Vector Hub
- **File Name**: `client/public/* & client/src/components/BrandLogo.tsx`
- **File Path**: `client/public/`
- **Category**: Static Assets & PWA
- **Asset Connection Map**:
  | Static Asset Path | Connected Component / File | Purpose & Role |
  | :--- | :--- | :--- |
  | `client/public/hmorix-icon-lime.svg` | `BrandLogo.tsx`, `Navbar.tsx`, `Architecture.tsx` | Electric Lime Brand Monogram |
  | `client/public/hmorix-icon.svg` | `BrandLogo.tsx`, `Navbar.tsx`, `Footer.tsx` | Default Brand Vector Monogram |
  | `client/public/hmorix-logo-dark.svg` | `Navbar.tsx`, `SignIn.tsx` | Full Wordmark Logo for Dark Theme |
  | `client/public/hmorix-logo-light.svg` | `Navbar.tsx`, `Footer.tsx` | Full Wordmark Logo for Light Theme |
  | `client/public/favicon.svg` | `index.html` | SVG Vector Favicon for modern browsers |
  | `client/public/favicon.ico` | `index.html`, `App.tsx` | Legacy ICO Favicon fallback |
  | `client/public/manifest.webmanifest` | `index.html`, `main.tsx` | PWA Installation Metadata & Theme Colors |
  | `client/public/sw.js` | `main.tsx`, `OfflineStatus.tsx` | Service Worker Offline Cache Engine |
  | `client/public/openapi.json` | `Home.tsx`, `Docs.tsx`, `Developers.tsx` | Public OpenAPI 3.0 REST Specification |
  | `client/public/openapi.yaml` | `Docs.tsx`, `Developers.tsx` | Public YAML Schema Contract |
  | `client/public/harsh-sharma.jpg` | `HarshSharma.tsx`, `HarshSharmaDeveloper.tsx` | Founder Portfolio Media |
  | `client/public/press-pdfs/*` | `PressReleases.tsx` | Press Announcement Downloads |
  | `client/public/whitepaper-pdfs/*` | `Whitepapers.tsx` | Downloadable Enterprise Whitepapers |

---

## 3. 🚀 Verification Protocol

To verify on the live production deployment:
1. Visit `https://hmorix.in` in a private/incognito window to see `AppIntroAnimation.tsx` (2.7s cybernetic sequence) cleanly resolve and reveal `Home.tsx`.
2. Visit `https://hmorix.in/architecture` to interact with the live interactive node topology and click through all nodes, durations, inputs, outputs, button actions, and MongoDB/Supabase queries.
