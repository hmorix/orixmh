# HMorix Enterprise Platform - Project Workflow & Systems Architecture

This file documents the complete operational workflows, role-based access rules, database architecture, and integration pipelines across all HMorix portals: **Admin, HRM, Manager, Employee, CRM, Sales, and Client/User**.

---

## 1. Core Architectural Rules

1. **No Demo Data in Portal Operations**: All portal modules (HRM, Employee, Manager, CRM, Sales, Portal, Admin) fetch real-time state via `/api/...` endpoints backed by persistent collections in MongoDB Atlas (with database repository abstraction for Supabase/PostgreSQL).
2. **Unified Role-Based Access Control (RBAC)**: All sensitive routes and API handlers enforce strict role and user ownership validations.
3. **Offline-First PWA Synchronization**: Core client snapshots are stored in IndexedDB (`hmorix-offline`) and cached via Service Worker. When offline, mutation operations queue gracefully.
4. **Real-Time Notification & Audit Log Tracing**: Critical business events (user registration, hiring status changes, deal closures, ticket submissions, leave approvals, payroll runs) automatically emit `notifications` and `activity_log` entries.

---

## 2. Core Shared Database Collections

| Collection | Purpose & Contents |
| :--- | :--- |
| `users` | User credentials, email, password hash, role (`admin`, `manager`, `hr`, `employee`, `sales`, `crm`, `user`), `emailVerified`, OAuth providers. |
| `profiles` | User profile details: display name, username, bio, company, avatar, cover photo, country, social links. |
| `sessions` | Active user sessions with cryptographically signed cookie hashes and automated TTL expiration. |
| `verification_tokens` | Hashed email verification and password reset tokens with TTL. |
| `otp_records` | 6-digit numeric OTP codes for secure password resets and 2FA verification. |
| `hrm_employees` | Full employee profiles: employee ID (`HM-XXXXXX`), personal info, department, designation, salary, status, documents, credentials linkage. |
| `hrm_teams` | Manager-created operational teams linked to department leads, members, clients, and active project IDs. |
| `hrm_tasks` | Work items assigned to individual employees or teams with priority, status, scores, feedback, and ticket linkages. |
| `hrm_leave_requests` | Leave applications (casual, sick, earned, maternity/paternity), date spans, reason, approval status, and approver timestamps. |
| `hrm_recruitment` | Open career job requisitions, requirements, department, salary brackets, hiring status, and candidate count. |
| `job_applications` | Inbound candidate applications, resume URLs, scores, stage history (`applied` → `screening` → `interview` → `offer` → `hired`), offer & joining letters. |
| `hrm_payroll_runs` | Monthly payroll batch runs, salary components (base, bonus, deductions, net pay), status, and disbursement logs. |
| `employee_attendance` | Daily employee clock-in/out timestamps, work duration, breaks, regularization status, and geo/device metadata. |
| `hrm_trainings` | Assigned training modules, skill onboarding courses, progress percentage, and completion certifications. |
| `crm_contacts` | Prospective client contacts, business categories (Hotel, Restaurant, Factory, Hospital, School, etc.), owners, phone, email, and address. |
| `crm_deals` | Sales pipeline deals with deal stages (`lead`, `contacted`, `proposal`, `negotiation`, `closed_won`, `closed_lost`), value, follow-up dates. |
| `client_projects` | Active client deliverables created by Sales/Manager/Admin, assigned team, milestone deadlines, budget, and status. |
| `support_tickets` | Customer support tickets (`TKT-XXXXXX`), severity, messages thread, linked project, and assigned team resolution task. |
| `billing_invoices` | Invoices (`INV-XXXXXXXXXXXXX`), line items, payment status, tax calculations, and PDF download links. |
| `activity_log` | Centralized audit timeline tracking all major user, administrative, and system events. |
| `notifications` | System, user, and portal alerts with read/unread flags and target redirection URLs. |
| `user_settings` | Theme settings, appearance, notification preferences, language, keyboard shortcuts, and 2FA configuration. |
| `user_integrations` | External OAuth & cloud storage configurations (Google Drive, GitHub, etc.). |

---

## 3. Role-Based Access Control (RBAC) Matrix

| Role | Default Landing | Primary Routes | Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| **`admin`** | `/manager` / `/admin` | `/admin/*`, `/manager`, `/hrm/*`, `/crm/*`, `/sales`, `/employee`, `/portal` | Complete administrative control over users, logs, global settings, blogs, billing, HRM, CRM, and system configuration. |
| **`manager`** | `/manager` | `/manager`, `/crm/*`, `/sales`, `/employee`, `/portal` | Team creation, employee task assignment, project delegation, performance review, training management, client ticket oversight. |
| **`hr`** | `/hrm` | `/hrm/*`, `/employee`, `/careers` | Employee directory, hiring & recruitment pipeline, offer letter generation, leave approvals, payroll processing, onboarding. |
| **`employee`** | `/employee` | `/employee/*`, `/profile`, `/settings` | Clock in/out attendance, personal leave requests, assigned tasks, team view, document uploads, training courses, payslips. |
| **`sales`** / **`crm`** | `/sales` | `/sales`, `/crm/*`, `/profile` | Lead generation, field business creation, CRM contacts & deals management, pipeline closure, client project initialization. |
| **`user`** (Client) | `/portal` | `/portal`, `/billingflow`, `/agent`, `/pdf-automation`, `/profile`, `/settings` | Client project tracking, support ticket submission, assigned team inspection, invoice payment, API keys, documentation. |

---

## 4. End-to-End Business Workflows

### 4.1 Authentication & Profile Lifecycle
1. **Registration**: User registers at `/signup` with Email + Password or Google/GitHub OAuth.
2. **Verification**: SMTP sends an email with a 6-digit OTP code and a cryptographic one-click verification link.
3. **First-Time Profile Setup**: After verification, OAuth or new users complete `/profile-setup` (avatar upload with 1.5MB validation, username, bio, company).
4. **Session Cookie Security**: Backend issues an `hm_session` HttpOnly, SameSite=Lax signed HMAC-SHA256 cookie.
5. **Role-Based Redirect**: `/api/auth/me` resolves the user identity and directs the browser to their corresponding landing dashboard.

### 4.2 Recruitment to Employee Onboarding Flow
1. **Requisition**: HR creates a job requisition in `/hrm/recruitment`.
2. **Application**: Public applicants apply via `/careers` or `/careers/apply/:id`, uploading resumes and portfolio details.
3. **Pipeline Stages**: HR evaluates candidates through:
   - `applied` → `screening` → `interview_scheduled` → `interview` → `second_interview` → `final_offer` → `offer` → `joining_letter` → `selected` / `hired`.
4. **Offer & Joining Letter Automation**: When moved to `offer` or `joining_letter`, the system dynamically renders customizable offer documents.
5. **1-Click Employee Creation**: Checking `createEmployee` on hire automatically generates:
   - Unique employee record in `hrm_employees` with ID `HM-XXXXXX`.
   - Dedicated login credentials (username + secure password).
   - Onboarding document checklist (Offer letter, ID proof, Address proof, Bank details).
   - Welcome notification and credentials delivery.

### 4.3 Sales to CRM to Project Delivery Flow
1. **Lead Sourcing**: Sales reps visit local/regional businesses (Hotels, Schools, Hospitals, Factories, Retail) and enter leads in `/sales`.
2. **Automated Entity Creation**: Creating a sales entry atomically writes:
   - `crm_contacts`: Owner name, business category, contact phone/email, address.
   - `crm_deals`: Pipeline deal stage, proposed budget, payment terms, expected closing date.
   - `client_projects`: Delivery project placeholder linked to the client.
3. **Deal Closure**: When the deal reaches `closed_won`, notifications alert the Manager Portal.
4. **Team Assignment**: Managers in `/manager` create/assign an operational team (`hrm_teams`) with a department lead and member engineers.
5. **Visibility**:
   - The Client sees the project and assigned team in `/portal`.
   - Assigned employees see the project and tasks in `/employee/tasks`.

### 4.4 Client Support Ticket Resolution Workflow
1. **Ticket Creation**: Client submits an inquiry/issue in `/portal`.
2. **Ticket Generation**: Backend assigns a `TKT-XXXXXX` number in `support_tickets`.
3. **Automatic Task Delegation**: If the ticket links to a project with an assigned team, the API automatically generates a linked task in `hrm_tasks`.
4. **Resolution**: The assigned employee works on the task, marks it done with notes and performance self-score.
5. **Status Update**: Ticket status transitions to `resolved`, updating the client portal and writing to `activity_log`.

### 4.5 Time, Attendance, Leave & Payroll Flow
1. **Attendance**: Employees clock in/out daily from `/employee`. The system records exact timestamps, working hours, and presence metrics.
2. **Leave Requests**: Employees apply for leave at `/employee/requests` or `/employee` (tab `Leave`).
3. **Approval**: HR/Manager receives instant alerts in `/hrm/leaves` and approves/rejects with a single click.
4. **Payroll Calculation**: At the end of the period (e.g. `2026-07`), HR opens `/hrm/payroll`.
5. **Automated Batch Processing**:
   - Base salary calculated per month.
   - Bonuses (5%) and statutory deductions (12% tax/PF) computed.
   - 1-click batch run marks payroll as `processed` in `hrm_payroll_runs`.
   - CSV export generated for banking/accounting disbursements.
   - Individual payslips immediately available in `/employee` (tab `Payroll`).

---

## 5. Standardized API Route Map

```
/api/
├── auth/
│   ├── signin                   [POST] - Email/password login
│   ├── signup                   [POST] - Register new user
│   ├── me                       [GET]  - Get authenticated session user
│   ├── verify-email             [POST] - Verify token link
│   ├── otp/request              [POST] - Send 6-digit OTP
│   ├── otp/verify               [POST] - Validate OTP
│   ├── forgot-password          [POST] - Initiate password reset
│   ├── reset-password           [POST] - Reset with OTP/token
│   ├── google & google/callback [GET]  - Google OAuth2 flow
│   └── github & github/callback [GET]  - GitHub OAuth2 flow
├── hrm/
│   ├── stats                    [GET]  - Live workforce, recruitment & payroll stats
│   ├── overview                 [GET]  - Aggregate HRM dashboard data
│   ├── people                   [GET, POST, PUT] - Employee records & credential generator
│   ├── leave                    [GET, POST, PUT] - Employee leave applications & approvals
│   ├── tasks                    [GET, POST, PUT] - Work assignments & performance scoring
│   ├── payroll                  [GET, POST] - Monthly payroll calculations & batch run
│   ├── payroll/export           [GET]  - Download payroll CSV
│   └── recruitment              [GET, POST, PUT, DELETE] - Job requisitions & pipeline
├── employee/
│   ├── dashboard                [GET]  - Employee personal portal overview & metrics
│   ├── attendance               [GET, POST] - Daily clock-in/clock-out & attendance logs
│   ├── payslip                  [GET]  - Individual monthly payslip records
│   └── profile                  [GET, PUT] - Personal profile information
├── manager/
│   ├── overview                 [GET]  - Team managers overview, tasks, stats
│   ├── teams                    [GET, POST] - Manage project teams and members
│   └── trainings                [GET, POST, PUT] - Manage skill training assignments
├── crm/
│   ├── stats                    [GET]  - CRM revenue, pipeline & conversion stats
│   ├── overview                 [GET]  - Comprehensive CRM dashboard data
│   ├── contacts                 [GET, POST, PUT, DELETE] - Lead & customer contacts
│   └── deals                    [GET, POST, PUT, DELETE] - Sales deals & pipeline stages
├── sales/
│   └── projects                 [GET, POST] - Field sales lead creation & project sync
├── portal                       [GET]  - Client portal data (projects, tickets, invoices)
├── tickets                      [GET, POST, PUT] - Client support tickets
├── projects                     [GET, POST, PUT] - Project delivery management
├── invoices                     [GET, POST] - Billing invoices & status
├── settings                     [GET, PUT] - User preferences, theme, shortcuts
└── admin/
    ├── stats                    [GET]  - Platform analytics & counters
    ├── users                    [GET, PUT, DELETE] - User administration & role changes
    └── logs                     [GET]  - Audit trail logs
```

---

## 6. Pre-Deployment & Verification Protocol

Always execute these validation checks before committing or pushing changes:

```bash
# 1. Typecheck the entire TypeScript codebase
npx tsc --noEmit

# 2. Build the client application
npm run build
```

### Manual Verification Checklist
1. **Auth & Redirection**: Verify `/signin` correctly directs each role (`admin`, `manager`, `hr`, `employee`, `sales`, `user`) to their respective destination.
2. **Employee Creation**: Add an employee in `/hrm/employees/new`, verify credentials generation, and test login at `/employee/login`.
3. **Attendance & Leave**: Clock in from `/employee`, submit a leave request, and approve it in `/hrm/leaves`.
4. **Sales & CRM**: Create a lead in `/sales`, verify it populates `crm_contacts`, `crm_deals`, and `client_projects`.
5. **Ticketing**: Submit a ticket from `/portal`, verify it generates a team task in `/manager` and `/employee/tasks`.
6. **Payroll**: Run payroll in `/hrm/payroll` and test CSV download.
