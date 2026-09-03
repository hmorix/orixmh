# 🌐 HMorix Enterprise Platform - Comprehensive Project Manual

> **Master Engineering & Operational Overview for HMorix (`https://hmorix.in`)**  
> Built with **React 18 + Vite + TypeScript + TailwindCSS**, **Vercel Serverless**, **MongoDB Atlas**, and **Supabase**.

---

## 1. 📌 Project Summary

**HMorix** is an enterprise-grade multi-portal B2B SaaS platform delivering:
1. **7 Core Operations Portals**:
   - **HRM Suite (`/hrm`)**: Complete talent acquisition, ATS AI resume scoring, employee directory (`HM-XXXXXX`), leave approvals, statutory payroll calculations (Indian PF, ESI, TDS, PT), and document issuance.
   - **Employee Self-Service (`/employee`)**: Punch clock (biometric/web), personal sprint tasks, leave requests, payslip PDF downloads.
   - **Manager Portal (`/manager`)**: Engineering pod assembly, sprint task delegation, quarterly OKR/KPI appraisal ratings, and customer ticket triage.
   - **Field Sales (`/sales`)**: High-speed mobile lead capture for regional businesses (Hotels, Factories, Clinics, Schools, Retail) with instant 3-way synchronization (Lead ➔ CRM Deal ➔ Client Project).
   - **Commercial CRM (`/crm`)**: Deals pipeline Kanban board, revenue forecasting, contact relationship timelines.
   - **Client Portal (`/portal`)**: Customer transparency cockpit: milestone progress, GST invoices (`INV-XXXX`), API key management, and support tickets (`TKT-XXXXXX`).
   - **Super Admin (`/admin`)**: Platform governance, user RBAC escalation, immutable audit logs (`activity_log`), system settings, and blog publishing.
2. **Integrated Product Ecosystems**:
   - **BillingFlow (`/billingflow`)**: Automated invoicing, tax computation, and PDF generator.
   - **AI Agent (`/agent`)**: Autonomous enterprise agents powered by NVIDIA NIM (`meta/llama-3.1-405b-instruct`).
   - **PDF Automation (`/pdf-automation`)**: Document compiler with Supabase Storage cloud vault.

---

## 2. 🗂️ Complete Directory & File Structure

```
/root/orixmh/
├── api/
│   └── [...path].ts               <-- Catch-all Vercel serverless function (50+ REST endpoints)
├── client/
│   ├── public/                    <-- Static assets, brand SVGs, PWA manifest, OpenAPI specs
│   │   ├── hmorix-icon-lime.svg   <-- Electric lime brand vector
│   │   ├── manifest.webmanifest   <-- PWA metadata
│   │   ├── openapi.json           <-- OpenAPI 3.0 REST spec
│   │   └── sw.js                  <-- Service Worker offline cache engine
│   └── src/
│       ├── App.tsx                <-- React Router v6 table, error boundary, shortcuts
│       ├── main.tsx               <-- Entry mount (ReactDOM, BrowserRouter, Contexts)
│       ├── components/            <-- Reusable components
│       │   ├── AppIntroAnimation.tsx  <-- 2.7s boot animation (Hexagon SVG, Framer Motion)
│       │   ├── BrandLogo.tsx      <-- Vector Monogram & Wordmark generator
│       │   ├── CommandPalette.tsx <-- Global quick-nav modal (Cmd+K)
│       │   ├── Navbar.tsx         <-- Sticky navigation with unread notification badge
│       │   └── OfflineStatus.tsx  <-- Network detection & IndexedDB sync
│       ├── layouts/
│       │   └── MainLayout.tsx     <-- Main responsive layout wrapper
│       ├── lib/
│       │   ├── AuthContext.tsx    <-- HMAC session cookie management & RBAC routing
│       │   ├── ThemeContext.tsx   <-- Obsidian Dark & Clean Light theme state
│       │   ├── config.ts          <-- Universal API URL resolver (https://hmorix.in/api)
│       │   ├── hrm-documents.ts   <-- Official offer letter & payslip synthesizer
│       │   └── notificationStore.ts <-- Real-time notification store
│       └── pages/                 <-- Categorized views
│           ├── Home.tsx           <-- Core landing experience & product showcase
│           ├── Architecture.tsx   <-- Live interactive node topology & query inspector
│           ├── hrm/               <-- HRMDashboard, Recruitment, Payroll, Leaves, AddEmployee
│           ├── employee/          <-- EmployeePortal, Directory, Tasks, Requests
│           ├── manager/           <-- ManagerPortal
│           ├── sales/             <-- SalesPortal
│           ├── crm/               <-- CRMDashboard, Contacts, Deals
│           ├── portal/            <-- ClientPortal
│           ├── admin/             <-- AdminDashboard, AdminUsers, AdminLogs, AdminSettings
│           ├── auth/              <-- SignIn, SignUp, Verify, ForgotPassword
│           └── products/          <-- BillingFlow, AIAgent, PDFAutomation
├── database/
│   ├── PORTAL_CONNECTIONS_AND_FLOW.md <-- Architectural portal flow manual
│   └── MIGRATION_GUIDE.md        <-- Database schema and indexing guide
├── ARCHITECTURE.md                <-- Canonical node-by-node architecture & query spec
├── PROJECT.md                     <-- This project overview manual
├── PROJECT_WORKFLOW.md            <-- Multi-portal operations & role matrix
└── PROJECT_MEMORY.md              <-- Technical memory, environment variables, known fixes
```

---

## 3. 🔄 System Flow: From Boot to Database

```
1. Browser Load ➔ client/src/main.tsx
2. Session Animation ➔ client/src/components/AppIntroAnimation.tsx (2.7 seconds)
3. Landing Page ➔ client/src/pages/Home.tsx
4. Authentication ➔ client/src/pages/auth/SignIn.tsx ➔ POST /api/auth/signin
5. Session Cookie Issued ➔ Set-Cookie: hm_session=<sessionId>.<hmacSignature>
6. Role Portal Redirection:
   • admin/manager ➔ /manager or /admin
   • hr            ➔ /hrm
   • employee      ➔ /employee
   • sales/crm     ➔ /sales or /crm
   • user (client) ➔ /portal
7. API Call ➔ api/[...path].ts (CORS, decodeSessionCookie, requireRole)
8. Datastore Execution ➔ MongoDB Atlas (Primary) & Supabase Storage (Orixbucket)
```

---

## 4. 🔑 Role Matrix & RBAC Permissions

| Role | Target Workspace | Core Permissions |
| :--- | :--- | :--- |
| `admin` | `/admin` & `/manager` | Full access: User management, role escalation, audit trail, global settings. |
| `manager` | `/manager` | Project pod assembly, sprint task delegation, employee appraisal ratings. |
| `hr` | `/hrm` | Employee directory (`HM-XXXXXX`), ATS recruitment, leave approvals, payroll. |
| `employee` | `/employee` | Daily punch clock, sprint tasks, PTO applications, payslip PDF download. |
| `sales` | `/sales` | Field lead capture with instant 3-way sync (Contact ➔ Deal ➔ Project). |
| `crm` | `/crm` | Enterprise deal pipeline, revenue forecasting, quota tracking. |
| `user` | `/portal` | Project sprint tracking, GST invoices, developer API keys, support tickets. |

---

## 5. 🌐 Deployment & Verification

- **Production Domain**: `https://hmorix.in`
- **Interactive Node Architecture**: `https://hmorix.in/architecture`
- **Public API Documentation**: `https://hmorix.in/docs`
- **OpenAPI 3.0 Specification**: `https://hmorix.in/openapi.json`
