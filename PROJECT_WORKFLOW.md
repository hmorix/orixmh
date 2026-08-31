# 🌐 HMorix Enterprise Platform - Comprehensive Operations & System Workflow Manual

This document is the canonical master reference for the complete multi-portal architecture, role responsibilities, end-to-end business workflows, and database schema mappings across the HMorix platform (**hmorix.in**).

---

## 1. 🏛️ Enterprise Multi-Portal System Topology

The HMorix platform is organized into 7 specialized operational portals operating on a single unified database with strict Role-Based Access Control (RBAC):

```
                                  ┌────────────────────────┐
                                  │      HMorix Core       │
                                  │   (api/[...path].ts)   │
                                  │     MongoDB Atlas      │
                                  └───────────┬────────────┘
                                              │
         ┌──────────────────┬─────────────────┼─────────────────┬──────────────────┐
         │                  │                 │                 │                  │
         ▼                  ▼                 ▼                 ▼                  ▼
  ┌─────────────┐    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐    ┌─────────────┐
  │ Field Sales │    │  Commercial │   │  Operations │   │  Enterprise │    │   Employee  │
  │   Portal    │───►│  CRM Suite  │──►│   Manager   │──►│  HRM Suite  │◄───┤ Self-Service│
  │  (/sales)   │    │   (/crm)    │   │  (/manager) │   │   (/hrm)    │    │ (/employee) │
  └─────────────┘    └─────────────┘   └─────────────┘   └─────────────┘    └─────────────┘
                            ▲                 │                                    │
                            │                 ▼                                    │
                            │          ┌─────────────┐                             │
                            └──────────│   Client    │◄────────────────────────────┘
                                       │   Portal    │
                                       │  (/portal)  │
                                       └─────────────┘
```

---

## 2. 👥 Role Responsibilities & RBAC Matrix

| Role Code | User Role | Primary Portal | Core Responsibilities & Authority |
| :--- | :--- | :--- | :--- |
| **`admin`** | Super Administrator | `/manager` / `/admin` | Full platform authority: system audit logs, global user management, role escalation, billing controls, dual-database replication, and environment config. |
| **`manager`** | Delivery Lead / Eng Manager | `/manager` | Project pod assembly, client project allocation, sprint task delegation, employee quarterly OKR appraisal scoring, LMS course assignments, client ticket resolution routing. |
| **`hr`** | Human Resources / ATS Recruiter | `/hrm` | Talent acquisition requisitions, applicant pipeline screening, 1-click legal document generation (Offer, Joining, Appointment letters), automated login provisioning, leave approvals, monthly payroll calculation, and payslip generation. |
| **`employee`** | Software Engineer / Specialist | `/employee` | Daily biometric punch clock, task delivery, client support ticket resolution, leave/PTO balance requests, payslip reprint, and LMS course completions. |
| **`sales`** | Field Sales Executive | `/sales` | On-ground business sourcing (Hotels, Factories, Clinics, Schools, Retail), proposal quotes, immediate 3-way CRM/Deal/Project auto-sync, 1-click deal closure. |
| **`crm`** | Commercial Account Executive | `/crm` | Enterprise lead qualification, discovery calls, proposal pitch decks, contract negotiations, revenue forecasting, client account management. |
| **`user`** | Enterprise Client / Customer | `/portal` | Project milestone tracking, invoice review and payment, support ticket submission with automated engineering pod escalation, team roster inspection. |

---

## 3. 🔄 End-to-End Enterprise Business Workflows

### Workflow 1: Field Sales Sourcing ➔ CRM Pipeline ➔ Automatic Project Creation
```
[Field Sales Rep in /sales]
       │
       ▼
1. Sourcing: Pitches local business (Hotel, Factory, Clinic, Retail)
       │
       ▼
2. Lead Capture: Selects Place Type, Owner Contact, Tech Services (Web, App, AI, ERP), Budget, Duration
       │
       ▼
3. Atomic Backend Synchronization:
   ├── `crm_contacts` (Owner contact & business categorization)
   ├── `crm_deals` (Deal stage = "lead", value = budget, probability = 40%)
   └── `client_projects` (Delivery blueprint placeholder)
       │
       ▼
4. Commercial Negotiation in `/crm/deals` (Lead ➔ Qualification ➔ Discovery ➔ Proposal ➔ Negotiation)
       │
       ▼
5. 1-Click Deal Closure: Click "Mark Won" (Status = "closed_won")
       │
       ▼
6. Manager Notification: System alerts Manager Portal for engineering team pod assignment.
```

---

### Workflow 2: Delivery Manager Pod Orchestration & Ticket Delegation
```
[Delivery Manager in /manager]
       │
       ▼
1. Team Assembly: Creates operational pod (e.g., "Core Engine Pod", "Mobile Frontend Pod")
       │
       ▼
2. Project Linking: Connects client projects (`client_projects`) to the operational team.
       │
       ▼
3. Sprint Task Delegation: Assigns tasks with priority (Critical, High, Medium, Low), scope notes, deadlines.
       │
       ▼
4. Automated Support Ticket Escalation:
   - When a client logs a ticket in `/portal` (`TKT-XXXXXX`), system automatically delegates resolution task to the assigned project team.
       │
       ▼
5. Quarterly Appraisal: Scores staff deliverables on a 1.0 to 5.0 scale in Performance & OKR tab.
```

---

### Workflow 3: Talent Acquisition, 1-Click Legal Document Suite, Onboarding & Payroll
```
[HR Manager in /hrm]
       │
       ▼
1. Requisition: Posts job opening in `/hrm/recruitment`.
       │
       ▼
2. ATS Candidate Evaluation:
   [Applied] ➔ [Screening] ➔ [Interview] ➔ [2nd Round] ➔ [Offer Made] ➔ [Joining Issued] ➔ [Hired]
       │
       ▼
3. Complete 1-Click Hiring & Onboarding Document Suite (100% Free Native Web Engine):
   ├── 📄 "Print Offer Letter" (Calculates Basic 40%, HRA 20%, Special 30%, Flexi 10%, 90-day probation terms)
   ├── 📝 "Print Joining & Induction Letter" (Company policies, workplace standards, documentation checklist)
   ├── 📑 "Print Appointment Letter" (Legally binding employment contract & IP assignment agreements)
   ├── 💰 "Print Salary Certificate / CTC Structure" (Proof of compensation for loans, visas & banks)
   └── 🆔 "Print Corporate Digital ID Card" (Printable badge with Employee ID, blood group, emergency contact)
       │
       ▼
4. 1-Click Automated Onboarding & Provisioning:
   - Clicking "Hire Candidate" creates permanent Employee ID (`HM-XXXXXX`) in `hrm_employees`.
   - Auto-generates employee portal username & secure password in `users` collection.
       │
       ▼
5. Time, Attendance & Leave Approvals:
   - Staff clock in/out daily in `/employee`.
   - Staff apply for leave; HR/Manager reviews and clicks 1-click "Approve" in `/hrm/leaves`.
       │
       ▼
6. Monthly Payroll Cycle & Payslip Generation:
   - In `/hrm/payroll`, click "Run Payroll Cycle".
   - Computes Gross, PF (12%), PT (₹200), TDS, and Net salary.
   - Click "Print Payslip" for individual formatted salary slips with company seal.
   - Click "Export CSV" for banking disbursement sheets.
```

---

### Workflow 4: Employee Self-Service (ESS) & Document Self-Reprint
```
[Employee in /employee]
       │
       ├── Punch Clock: 1-click Clock In / Clock Out with live workday counter & geostamp.
       ├── Sprint Board: Views prioritized tasks assigned by Manager & marks completion.
       ├── Leave Center: Checks annual balance (Casual 12, Sick 10, Earned 18) & submits requests.
       ├── Payslip Studio: 1-click reprints official monthly salary statements.
       ├── My Documents Suite: 1-click reprints:
       │   ├── 📑 Official Appointment Letter
       │   ├── 📝 Official Joining Letter
       │   ├── 💰 Official Salary Certificate (Proof of Income)
       │   └── 🆔 Corporate Digital ID Badge
       └── LMS Learning: Completes assigned skill training modules and certifications.
```

---

### Workflow 6: Employee Separation, Exit Clearance & Full Offboarding Suite
```
[HR / Manager in /hrm Exit & Offboarding Desk]
       │
       ▼
1. Resignation Submission & Manager Notice Acceptance.
       │
       ▼
2. Multi-Department Clearance:
   ├── IT & Systems: Laptops, emails, SSH keys, access tokens revoked.
   ├── Finance: Corporate cards, travel advances, departmental claims cleared.
   └── HR & Ops: Project handover acknowledged by reporting lead.
       │
       ▼
3. Full & Final (FnF) Settlement Calculation:
   - Final Month Salary + Leave Encashment (Days × Daily Rate) + Gratuity + Pending Bonuses.
   - Less Notice shortfall & statutory deductions = Net Final Disbursed.
       │
       ▼
4. Complete 1-Click Separation & Offboarding Document Suite:
   ├── 🚪 "Print Formal Relieving Letter" (Official confirmation of completed exit clearance)
   ├── 🏆 "Print Experience & Service Certificate" (Official certification of tenure, role & conduct)
   ├── 💰 "Print Salary Verification Certificate" (Official earnings verification for new employer)
   ├── 🧾 "Print FnF Settlement Statement" (Itemized final credit/debit payout statement)
   └── 📑 "Print No Objection Certificate (NOC)" (Official clearance for passport/visa/higher education)
```

---

## 4. 🗄️ Interconnecting MongoDB Collections Map

| Collection Name | Schema Scope & Primary Fields | Linked Collections / Relational Keys |
| :--- | :--- | :--- |
| `users` | `_id`, `email`, `username`, `password` (bcrypt hash), `role`, `emailVerified` | Linked to `hrm_employees.userId`, `profiles.userId`, `sessions` |
| `hrm_employees` | `_id`, `employeeId` (`HM-XXXXXX`), `name`, `role`, `department`, `salary`, `status`, `performanceScore` | Linked to `users`, `hrm_tasks`, `employee_attendance`, `hrm_leave_requests` |
| `hrm_teams` | `_id`, `name`, `department`, `lead`, `members` (array), `projectIds` (array) | Linked to `client_projects`, `hrm_employees` |
| `hrm_tasks` | `_id`, `employeeId`, `title`, `description`, `priority`, `dueDate`, `status`, `ticketId` | Linked to `hrm_employees`, `support_tickets` |
| `hrm_leave_requests` | `_id`, `employeeId`, `name`, `type`, `dates`, `days`, `reason`, `status` | Linked to `hrm_employees` |
| `employee_attendance`| `_id`, `employeeId`, `date`, `clockIn`, `clockOut`, `totalHours` | Linked to `hrm_employees` |
| `hrm_payroll_runs` | `_id`, `period`, `employeeId`, `baseSalary`, `bonus`, `deductions`, `net`, `status` | Linked to `hrm_employees` |
| `crm_contacts` | `_id`, `name`, `company`, `email`, `phone`, `role`, `status`, `tags`, `notes` | Linked to `crm_deals`, `client_projects` |
| `crm_deals` | `_id`, `name`, `company`, `contact`, `value`, `stage`, `probability`, `expectedClose` | Linked to `crm_contacts`, `client_projects` |
| `client_projects` | `_id`, `name`, `client_name`, `ownerEmail`, `budget`, `status`, `teamId` | Linked to `hrm_teams`, `support_tickets`, `billing_invoices` |
| `support_tickets` | `_id`, `ticketId` (`TKT-XXXXXX`), `userId`, `projectId`, `subject`, `status`, `messages` | Linked to `client_projects`, `hrm_tasks` |

---

## 5. 🛠️ Development & Deployment Guidelines

- **Environment**: Termux inside Ubuntu (ARM/Linux).
- **Execution Constraint**: **Never execute `npm run build` or `npx tsc` locally** due to mobile CPU/memory limitations.
- **CI/CD Pipeline**: Continuous deployment is handled automatically by **Vercel** on every push to `origin main`.
- **Zero Paid Packages Rule**: All document generators, prints, and exports use pure native web APIs (`window.print()`, `Blob`, native Canvas/SVG).

---

**Last Updated:** September 2026  
**Status:** Enterprise Scale & Fully Synchronized ✅
