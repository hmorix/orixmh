---
name: hmorix-platform
description: >-
  Comprehensive guide and architectural blueprint for the HMorix platform. Use this skill whenever an AI agent needs to understand the HMorix codebase, multi-portal workflows (HRM, CRM, Sales, Employee, Manager, Admin, Client Portal), backend API routing, MongoDB collections, authentication patterns, role-based access rules, current project status, and active development initiatives.
---

# HMorix Platform - AI Agent Guide & Engineering Runbook

Welcome to the **HMorix Platform** (`https://hmorix.in`). This skill gives any AI agent or developer immediate, complete understanding of the project architecture, operational workflows, database models, current initiatives, and engineering protocols.

---

## 1. Executive Summary: What is HMorix?

HMorix is a unified enterprise B2B SaaS platform that combines:
1. **Core Business Portals**:
   - **HRM (Human Resource Management)**: Recruitment & ATS, Onboarding, Employee Management, Time & Attendance, Leave Approval, Automated Payroll Processing.
   - **Employee Self-Service (ESS)**: Clock-in/out attendance, personal leave requests, task tracking, documents vault, training courses, and payslip downloads.
   - **Manager Portal (MSS)**: Operational team assembly, project delegation, employee scoring, workload distribution, and client support ticket triage.
   - **Sales Portal**: Field sales lead capture for regional businesses (Hotels, Restaurants, Factories, Clinics, Schools, Retail) with instant CRM pipeline synchronization.
   - **CRM (Customer Relationship Management)**: Contact management, deal stage progression (`lead` → `closed_won`), revenue forecasting, and client project initialization.
   - **Client/User Portal**: Real-time project tracking, milestone updates, invoice payments, API key generation, and support ticket submission (`TKT-XXXXXX`).
   - **Admin Portal**: Global user administration, system settings, blog publishing engine, and immutable audit logs.
2. **Product Ecosystems**:
   - **BillingFlow**: Invoice creation, automated tax handling, and PDF generation.
   - **AI Agent & Playground**: LLM chat and automation workflows powered by NVIDIA NIM (`meta/llama-3.1-405b-instruct`).
   - **PDF Automation**: Document processing, automated offer letters, joining letters, and invoice PDF streams.
   - **Smart Home & IoT**: Connected smart devices and integrations.
3. **Regional & Enterprise Services**:
   - Web application development, mobile apps, AI solutions, digital marketing, and local SEO services across Delhi NCR, Mumbai, Bengaluru, Agra, Mathura, Aligarh, and Hathras.

---

## 2. Codebase Topology & Key Directories

```
/root/orixmh/
├── .agents/
│   └── skills/
│       └── hmorix-platform/
│           ├── SKILL.md                 <-- You are here: Canonical AI knowledge base
│           └── references/              <-- Deep dive architectural specifications
├── api/
│   └── [...path].ts                     <-- Vercel serverless catch-all router for all /api/* routes
├── client/                              <-- React 18 + Vite + TypeScript frontend
│   ├── public/                          <-- Static assets, brand SVGs, robots.txt, sitemap
│   └── src/
│       ├── App.tsx                      <-- React Router DOM v6 router & global keyboard shortcuts
│       ├── components/                  <-- Reusable UI components (Navbar, Footer, Notifications, OfflineStatus)
│       ├── layouts/                     <-- Main layout wrapper with CommandPalette & Nav
│       ├── lib/                         <-- Contexts (AuthContext, ThemeContext), config.ts, supabase.ts, seo.ts
│       └── pages/                       <-- Portal pages categorized by domain:
│           ├── hrm/                     <-- HRMDashboard, Recruitment, Payroll, Leaves, AddEmployee
│           ├── employee/                <-- EmployeePortal, Directory, Tasks, Requests, BillingAssignment
│           ├── manager/                 <-- ManagerPortal
│           ├── crm/                     <-- CRMDashboard, Contacts, Deals
│           ├── sales/                   <-- SalesPortal
│           ├── portal/                  <-- ClientPortal
│           ├── admin/                   <-- AdminDashboard, AdminUsers, AdminSettings, AdminLogs, AdminNotifications
│           ├── auth/                    <-- SignIn, SignUp, Verify, ForgotPassword, ProfileSetup, SearchAccount
│           ├── products/                <-- BillingFlow, AIAgent, PDFAutomation
│           └── services/                <-- WebDesign, MobileApps, AISolutions, SoftwareDev, DigitalMarketing
├── server/                              <-- Standalone Express server (API endpoints & middleware)
├── database/                            <-- Schemas, SQL migrations, and migration guides
├── android-client/                      <-- Native Android mobile application (Kotlin)
├── Agent/                               <-- Python SEO and automation agent
├── PROJECT_WORKFLOW.md                  <-- End-to-end business workflows & role map
├── PROJECT_MEMORY.md                    <-- Technical architecture, environment variables, known fixes
└── FIXES_SUMMARY.md                     <-- Historical release notes & fix history
```

---

## 3. What is Going On & What We Are Doing

### 3.1 Current System State
- **Production URL**: `https://hmorix.in`
- **Database**: MongoDB Atlas is the live primary datastore, backed by automated indexes and TTL collection cleanup.
- **Authentication**: Signed HTTP-only session cookies (`hm_session`) with HMAC-SHA256 signatures, SMTP OTP email verification, and Google/GitHub OAuth.
- **Role Routing**: Dynamic post-login redirection based on role (`admin`, `manager`, `hr`, `employee`, `sales`, `crm`, `user`).
- **No Mock Data Rule**: All portal operations connect to real backend database collections.
- **PWA & Offline Capability**: Service Worker and IndexedDB (`hmorix-offline`) provide graceful offline degradation with waiting sync states.

### 3.2 Active Engineering Focus
1. **Enterprise HRM Model Expansion**: Upgrading from the current core HRM to a comprehensive, enterprise-grade architecture covering multi-branch organizational hierarchy, advanced biometric/geo-fenced attendance, multi-tiered leave approval workflows, global & Indian statutory payroll (PF, ESI, TDS, PT), 360-degree OKR/KPI appraisal cycles, and automated talent acquisition with AI resume scoring.
2. **Seamless Portal Interoperability**: Ensuring cross-portal automation:
   - Field Sales logs a deal → CRM pipeline updates → Manager delegates team → Employee gets task → Client monitors live progress on Portal.
   - Public candidate applies → HR moves candidate to hire → System auto-generates `HM-XXXXXX` employee profile & login credentials.
   - Client submits a support ticket → Manager receives notification → Task automatically created for project engineering team.

---

## 4. Key Developer Runbooks & Protocols

### 4.1 Adding a New API Endpoint
1. Open `api/[...path].ts`.
2. Locate the handler dispatch `switch (routePath)` block around line 3220.
3. Add your route case (e.g. `case 'hrm/analytics': return handleHrmAnalytics(req, res)`).
4. Implement the asynchronous handler function:
   - Always call `setCors(res)` (handled automatically at top of router).
   - Authenticate with `const user = await getAuthUser(req)` if private.
   - Enforce RBAC with `if (!requireRole(user, ['admin', 'hr'])) return res.status(403).json({ error: 'Unauthorized' })`.
   - Perform database queries using `const col = await mongoCollection('collection_name')`.
   - Sanitize all text inputs using `sanitizeText()`.
   - Return structured JSON: `res.json({ success: true, data: result })`.

### 4.2 Adding a New Portal Page
1. Create the page component in `client/src/pages/<domain>/<PageName>.tsx`.
2. Wrap with `<SEOHead title="..." description="..." canonical="..." />`.
3. Fetch data inside `useEffect` using `config.apiUrl` with `{ credentials: 'include', cache: 'no-store' }`.
4. Register the route with lazy loading in `client/src/App.tsx`.
5. Ensure responsive UI using Tailwind classes, dark obsidian palette (`bg-obsidian`, `bg-obsidian-2`, `border-glass-border`, `text-cream`, lime accent `#C8FF00`).

### 4.3 Database Access & Security Rules
- **Client Data Isolation**: Always filter by `userId == user.id || clientEmail == user.email || ownerEmail == user.email`.
- **Employee Data Isolation**: Always filter by `employeeId == employee._id || email == employee.email || teamId in employee.teams`.
- **Indexes**: When introducing a new collection, register its unique/lookup indexes inside `ensureIndexes()` in `api/[...path].ts`.

---

## 5. Verification Protocol

Before finishing any task, run the validation suite:

```bash
# Typecheck
npx tsc --noEmit

# Build client
npm run build
```
