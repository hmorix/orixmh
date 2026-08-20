# HMorix Project Workflow

This file explains how the HMorix platform should work across admin, HR, manager, employee, sales, CRM, and client/user portals.

## Core Rule

The frontend should never use demo data for portal operations. Portal pages should call `/api/...` routes, and the API should read/write shared database collections.

Main shared collections:

| Collection | Purpose |
| --- | --- |
| `users` | Login identity, email, role, verification status |
| `profiles` | User profile, company, avatar, settings-facing details |
| `sessions` | Cookie sessions for logged-in users |
| `client_projects` | Real client projects created by sales, manager, admin, or portal |
| `support_tickets` | Client/user tickets and internal ticket updates |
| `hrm_employees` | Employee records and portal identity mapping |
| `hrm_teams` | Manager-created teams assigned to clients and projects |
| `hrm_tasks` | Employee work items, including client ticket follow-ups |
| `crm_contacts` | Sales/CRM leads and customer contacts |
| `crm_deals` | Sales pipeline deals |
| `activity_log` | Real activity timeline |
| `notifications` | Header notifications and portal alerts |
| `billing_invoices` | Client invoices and employee-assigned billing |

## Role Access

| Role | Login Destination | Main Routes | Access |
| --- | --- | --- | --- |
| `admin` | `/manager` | `/admin`, `/manager`, `/hrm`, `/crm`, `/sales`, `/employee`, `/portal` | Full platform control |
| `manager` | `/manager` | `/manager`, `/crm`, `/sales`, `/employee`, `/portal` | Teams, projects, employee work, tickets |
| `hr` | `/employee` or `/hrm` | `/hrm`, `/employee` | Hiring, employee records, payroll, leave |
| `employee` | `/employee` | `/employee`, `/employee/tasks`, `/employee/requests` | Assigned tasks, attendance, leave, payroll, documents |
| `sales` | `/sales` | `/sales`, `/crm` | Field leads, projects, CRM contacts, deals |
| `crm` | `/sales` | `/sales`, `/crm` | CRM pipeline and sales projects |
| `user` / client | `/portal` | `/portal`, `/profile`, `/settings` | Own projects, tickets, team, invoices, activity |

## Login Flow

1. User signs in from `/signin`.
2. Backend validates email/password or OAuth callback.
3. Backend creates `hm_session` cookie in `sessions`.
4. Frontend calls `/api/auth/me`.
5. User is redirected by role:
   - Admin/manager: `/manager`
   - Sales/CRM: `/sales`
   - Employee/HR: `/employee`
   - Normal user/client: `/portal`

## Verification Flow

Email/password signup:

1. User registers from `/signup`.
2. API creates a `users` row with `emailVerified: false`.
3. API creates a verification token in `verification_tokens`.
4. API sends email verification link and OTP using SMTP.
5. User verifies from `/verify`.
6. API updates `users.emailVerified` to `true`.
7. User can then sign in.

OAuth signup/login:

1. User clicks Google or GitHub.
2. Frontend redirects to `/api/auth/google` or `/api/auth/github`.
3. API redirects to the provider with callback:
   - Google: `/api/auth/google/callback`
   - GitHub: `/api/auth/github/callback`
4. API links or creates the user in `users` and `oauth_accounts`.
5. API creates a session and redirects by role.

## ID Generation

| Object | ID Format |
| --- | --- |
| User | Mongo `_id` |
| Session | Random token, stored hashed in `sessions` |
| Verification token | Random token, stored hashed in `verification_tokens` |
| OTP | 6 digit code |
| Employee | `HM-` plus timestamp suffix, example `HM-123456` |
| Ticket | `TKT-` plus timestamp suffix, example `TKT-452019` |
| Invoice | `INV-` plus timestamp, example `INV-1720000000000` |
| API key | `hm_` plus random token, stored hashed |

## Hiring Workflow

1. HR/admin creates a job in HRM recruitment.
2. Candidate applies from the public career page.
3. Application is stored in `job_applications`.
4. HR updates application stage:
   - `applied`
   - `screening`
   - `interview_scheduled`
   - `interview`
   - `second_interview`
   - `final_offer`
   - `offer`
   - `joining_letter`
   - `selected`
   - `rejected`
   - `hired`
5. When `createEmployee` is enabled on selected/hired status, API creates an `hrm_employees` record.
6. API generates employee access credentials.
7. Employee logs in from `/employee/login`.
8. Employee uses `/employee` for attendance, tasks, leave, payroll, documents, training, and assigned client work.

## Sales To CRM Workflow

1. Sales employee opens `/sales`.
2. Sales adds a business/place:
   - Hotel
   - Restaurant
   - Factory
   - Company
   - School
   - College
   - Shop
   - Clinic
   - Other
3. Sales enters owner name, email, phone, address, project details, services, budget, payment duration, and follow-up date.
4. API creates:
   - `crm_contacts` row for the owner/business
   - `crm_deals` row for the sales pipeline
   - `client_projects` row for project delivery
   - `activity_log` row
   - `notifications` row
5. Sales can close the deal from `/sales`.
6. Closing updates the linked CRM deal stage to `closed_won`.
7. Manager can then assign a team/project for delivery.

## Manager Project And Team Workflow

1. Manager opens `/manager`.
2. Manager sees employees, teams, tasks, and client projects from real collections.
3. Manager creates a team with:
   - Team name
   - Department
   - Lead
   - Employee members by id/name/email
   - Client emails
   - Project ids
   - Notes
4. API stores the team in `hrm_teams`.
5. API updates selected `client_projects` with:
   - `assignedTeamId`
   - `assignedTeamName`
6. Client portal can now show the assigned team.
7. Employee portal can now show projects/tasks connected to that team.

## Client/User Portal Workflow

1. Normal logged-in user lands on `/portal`.
2. Portal loads `/api/portal`.
3. API returns only that client/user data:
   - Projects from `client_projects`
   - Tickets from `support_tickets`
   - Assigned teams from `hrm_teams`
   - Invoices from `billing_invoices`
   - Activity from `activity_log`
4. Client submits a ticket from `/portal`.
5. API creates a `support_tickets` record.
6. If the project has an assigned team, API also creates an `hrm_tasks` support task for that team.
7. Ticket appears for manager/employee workflows.
8. Activity and notification records are created.

## Employee Work Update Workflow

1. Employee opens `/employee`.
2. Employee sees:
   - Own employee profile
   - Attendance
   - Leave requests
   - Tasks assigned directly
   - Tasks assigned to their team
   - Client projects assigned to their team
   - Training
   - Payroll
   - Documents
3. Employee updates task status from employee task screens.
4. API updates `hrm_tasks`.
5. Manager can see task progress in `/manager`.
6. Client can see related activity in `/portal` when project/ticket activity is logged.

## Ticket Flow

1. Client creates ticket from `/portal`.
2. Ticket is stored in `support_tickets`.
3. Ticket gets:
   - `number`
   - `clientEmail`
   - `projectId`
   - `assignedTeamId`
   - `assignedTeamName`
   - `assignedEmployees`
   - `updates`
4. Manager/admin/sales/CRM can see all tickets.
5. Client can see only their own tickets.
6. Employees can see ticket tasks when assigned directly or via team.
7. Ticket updates write to `activity_log` and `notifications`.

## Route Map

| Area | Frontend Route | API Routes |
| --- | --- | --- |
| Auth | `/signin`, `/signup`, `/verify` | `/api/auth/*` |
| Client Portal | `/portal` | `/api/portal`, `/api/projects`, `/api/tickets`, `/api/account/billing` |
| Manager | `/manager` | `/api/manager/overview`, `/api/manager/teams`, `/api/manager/trainings` |
| Employee | `/employee` | `/api/employee/dashboard`, `/api/employee/attendance`, `/api/employee/payslip`, `/api/hrm/tasks`, `/api/hrm/leave` |
| HRM | `/hrm` | `/api/hrm/*` |
| CRM | `/crm`, `/crm/contacts`, `/crm/deals` | `/api/crm/*` |
| Sales | `/sales` | `/api/sales/projects`, `/api/crm/contacts`, `/api/crm/deals` |
| Admin | `/admin` | `/api/admin/*` |

## Access Checks

Every private API route should call one of these before reading or writing data:

1. `getAuthUser(req)` for logged-in routes.
2. `findSessionUser(req, res)` when cookie-only auth is required.
3. `requireRole(user, [...])` for privileged routes.
4. User-owned filters for client portal data.

Client/user data must be filtered by:

```text
userId == logged in user id
or clientEmail == logged in user email
or ownerEmail == logged in user email
```

Employee data must be filtered by:

```text
employeeId
or employee email
or employee username
or team membership
```

## Current Implementation Notes

Implemented route behavior:

| Feature | Status |
| --- | --- |
| Normal user login redirects to `/portal` | Done |
| Manager/admin login redirects to `/manager` | Done |
| Sales/CRM login redirects to `/sales` | Done |
| Employee/HR login redirects to `/employee` | Done |
| Google/GitHub OAuth callback redirects by role | Done |
| Client portal reads real API data | Done |
| Client ticket submit creates real ticket | Done |
| Ticket creates team task when project has assigned team | Done |
| Manager team can store clients and project ids | Done |
| Sales portal creates CRM contact, CRM deal, and client project | Done |

## Verification Checklist

Run these before deploy:

```bash
npx tsc --noEmit
npm run build
```

Manual test:

1. Login as normal user, confirm landing page is `/portal`.
2. Login as manager/admin, confirm landing page is `/manager`.
3. Login as sales/CRM, confirm landing page is `/sales`.
4. Create a sales project, confirm it appears in CRM contacts/deals.
5. In manager portal, create a team and assign the sales/client project.
6. Login as client/user and submit a ticket from `/portal`.
7. Confirm the ticket appears in manager/team work.
8. Confirm employee portal shows assigned project/task when employee is part of that team.
9. Confirm activity and notification records are created.

## Deployment Notes

Required backend environment variables:

```env
APP_URL=https://your-domain.vercel.app
CLIENT_ORIGIN=https://your-domain.vercel.app
MONGODB_URI=mongodb+srv://...
SESSION_SECRET=replace_with_32_plus_random_bytes
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=...
SMTP_PASS=...
```

Required frontend environment variables:

```env
VITE_APP_URL=https://your-domain.vercel.app
VITE_API_URL=/api
```

OAuth callback URLs:

```text
https://your-domain.vercel.app/api/auth/google/callback
https://your-domain.vercel.app/api/auth/github/callback
```
