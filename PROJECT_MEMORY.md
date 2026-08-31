# 🧠 HMorix Platform - Project Memory & System Knowledge Base

This file serves as the canonical system reference for HMorix (`hmorix.in`), capturing the complete architectural topology, database schemas, security configurations, environment variables, and debugging knowledge.

---

## 1. 🏗️ Architecture & Topology

### 1.1 Frontend (Client)
- **Framework**: React 18 + Vite + TypeScript + TailwindCSS
- **State & Context**: `AuthContext` (`client/src/lib/AuthContext.tsx`), `ThemeContext` (`client/src/lib/ThemeContext.tsx`)
- **Routing**: React Router DOM v6 (`client/src/App.tsx`) with lazy-loaded portal and marketing views.
- **Offline & PWA**: Service Worker caching, IndexedDB (`hmorix-offline`) for client snapshots, and automatic connectivity status indicators (`client/src/components/OfflineStatus.tsx`).
- **Icons & UI**: Lucide React, Tailwind animated gradients, brand SVG icon suites (`hmorix-icon.svg`, `hmorix-logo-dark.svg`).

### 1.2 Backend (Serverless & Express)
- **Primary Serverless Router**: `api/[...path].ts` (Vercel Serverless Function routing all `/api/*` REST endpoints).
- **Express Backend**: `server/index.js` with routes for AI (`server/routes/ai.js`), auth (`server/routes/auth.js`), blogs (`server/routes/blogs.js`), and upload (`server/routes/upload.js`).
- **Mobile Client**: Native Android app in `android-client/` (Kotlin + Gradle).
- **AI & Automation Agent**: Python SEO and automation agent in `Agent/seo-agent-python-with-case-studies/`.

### 1.3 Database Architecture
- **Primary Production DB**: MongoDB Atlas (`MONGODB_URI`).
- **Secondary Adapter Support**: Supabase / PostgreSQL database abstraction layer (`database/supabase-migration.sql`, `database/mysql-schema.sql`).
- **Indexing & TTL**: Unique indexes on `users.email`, `profiles.userId`, `sessions.expiresAt` (TTL), `verification_tokens.expiresAt` (TTL), and `employee_attendance`.

---

## 2. 🔑 Critical Environment Variables

| Variable | Scope | Purpose |
| :--- | :--- | :--- |
| `APP_URL` / `SITE_URL` | Server | Production server origin (`https://hmorix.in`) |
| `CLIENT_ORIGIN` | Server | CORS allowed client domain (`https://hmorix.in`) |
| `VITE_APP_URL` | Client | Frontend public domain for OAuth redirects & verification links |
| `VITE_API_URL` | Client | API root prefix (`/api` or `https://hmorix.in/api`) |
| `MONGODB_URI` | Server | MongoDB Atlas connection string |
| `SESSION_SECRET` / `JWT_SECRET` | Server | 32+ byte cryptographic secret for HMAC-SHA256 session signatures |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Server | Google OAuth2 and Google Drive integration |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Server | GitHub OAuth2 credentials |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Server | SMTP credentials for verification links & OTP delivery |
| `NVIDIA_API_KEY` / `NVIDIA_MODEL` | Server | NVIDIA NIM LLM integration (`meta/llama-3.1-405b-instruct`) |
| `DATABASE` / `DATABASE_PROVIDER` | Server | Database driver selection (`mongodb`, `supabase`, `postgres`) |

---

## 3. 🛡️ Security & Authentication Model

1. **Session Cookie Protocol**:
   - Cookie Name: `hm_session`
   - Content: Cryptographic payload signed with HMAC-SHA256 (`sessionId.signature`).
   - Flags: `HttpOnly; SameSite=Lax; Path=/; Secure` (in production).
2. **Password Security**: Passwords hashed with `bcryptjs` using 12 salt rounds.
3. **Role Routing**:
   - `admin` / `manager` → `/manager` or `/admin`
   - `hr` → `/hrm`
   - `employee` → `/employee`
   - `sales` / `crm` → `/sales` or `/crm`
   - `user` (Client) → `/portal`
4. **Data Isolation Filters**:
   - Client Portal queries are strictly scoped to `userId`, `clientEmail`, or `ownerEmail`.
   - Employee queries are strictly scoped to `employeeId`, email, username, or team ID.

---

## 4. 🛠️ Common Fixes & Debugging Playbook

### 4.1 Production Domain & OAuth Redirects
- **Problem**: OAuth redirecting to `localhost:3000` or invalid callback URLs.
- **Fix**: Centralized `appUrl()` helper in `api/[...path].ts` and `client/src/lib/config.ts` ensures `https://hmorix.in` is always used.

### 4.2 White/Black Screen on Refresh (SPA Routing)
- **Problem**: Direct navigation or page refresh returning 404.
- **Fix**: `vercel.json` rewrite rule `{ "source": "/(.*)", "destination": "/index.html" }` routes all client requests through React Router.

### 4.3 Session Expiration & Auto-Refresh
- **Problem**: Expired cookies causing silent failures.
- **Fix**: `AuthProvider` catches 401 responses, clears stale state, and redirects to `/signin` with return route memory.

### 4.4 Build & Environment Execution Guidelines
- **Development Environment**: Termux inside Ubuntu (Mobile/ARM architecture).
- **Execution Rule**: Do NOT run CPU/memory-heavy build commands (such as `npm run build` or `npx tsc`) in the local Termux environment unless explicitly asked.
- **CI/CD & Deployment**: Code is continuously built, validated, and deployed automatically by Vercel upon pushing to the `main` GitHub branch.

---

## 5. 📂 Key Files Index

- `api/[...path].ts`: Comprehensive serverless API router handling auth, HRM, CRM, sales, portal, settings, and billing.
- `client/src/App.tsx`: Central client router, layout wrapper, global keyboard shortcuts, and error boundaries.
- `client/src/lib/config.ts`: Client-side configuration and environment variable resolver.
- `client/src/pages/hrm/`: HRM dashboard, recruitment pipeline, payroll processing, leave management, and employee creation.
- `client/src/pages/employee/`: Employee self-service portal, attendance clock, requests, and directory.
- `client/src/pages/manager/`: Manager team overview, delegation, task scoring, and training management.
- `client/src/pages/crm/`: CRM contacts, deal pipeline stages, and analytics.
- `client/src/pages/sales/`: Field sales portal for immediate lead-to-project synchronization.
- `client/src/pages/portal/`: Client portal for project tracking, invoices, and support ticketing.
- `PROJECT_WORKFLOW.md`: Complete end-to-end operational workflows and role access specifications.
- `FIXES_SUMMARY.md`: Historical and recent production change log.

