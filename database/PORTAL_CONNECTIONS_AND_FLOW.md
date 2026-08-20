# HMorix HRM, CRM, Employee, Admin, and Manager Portal Flow

This file documents how the portals connect today and how to keep the data layer portable between Supabase and a direct PostgreSQL service.

For the full end-to-end business workflow, role routing, ID generation, hiring process, sales-to-CRM flow, client project flow, and verification checklist, read [PROJECT_WORKFLOW.md](../PROJECT_WORKFLOW.md).

## Portal Map

| Portal | Routes | Primary users | Main work |
| --- | --- | --- | --- |
| Admin | `/admin`, `/admin/users`, `/admin/settings`, `/admin/logs`, `/admin/blogs` | Platform admins | User control, settings, audit logs, blog publishing |
| CRM | `/crm`, `/crm/contacts`, `/crm/deals`, `/crm/pipeline` | Sales, admin, managers | Contacts, deals, pipeline, activity, revenue forecast |
| HRM | `/hrm`, `/hrm/recruitment`, `/hrm/payroll`, `/hrm/leaves`, `/hrm/employees/new` | HR, admin, managers | Employee records, recruitment, payroll, leave approvals |
| Employee | `/employee`, `/employee/directory`, `/employee/requests`, `/employee/tasks`, `/employee/billing` | Employees | Profile, directory, tasks, requests, billing assignments |
| Manager | `/manager` | Team managers | Team overview, approvals, workload, performance follow-up |
| Client | `/portal` | Customers | Project status, documents, invoices, support |

## Connection Flow

1. Authentication starts in the auth pages and backend auth routes.
2. The API validates the session and attaches the user identity and role.
3. Portal pages call `/api/...` endpoints with `credentials: include`.
4. Read-heavy pages cache GET responses in the service worker Cache Storage.
5. Important client snapshots are stored in IndexedDB under `hmorix-offline`.
6. Small sync metadata such as app version and last sync time is stored in localStorage.
7. When the internet is unavailable, cached pages remain usable and the UI shows `Waiting for internet`.
8. When a new app version is installed by the service worker, localStorage is updated and the user can refresh into the new cached build.

## Role Access Model

| Role | Access |
| --- | --- |
| `admin` | All admin, CRM, HRM, manager, employee, and client areas |
| `hr` | HRM, employee records, recruitment, payroll, leave workflows |
| `manager` | Manager portal, team employee data, CRM summaries, approvals |
| `employee` | Employee portal, own tasks, own requests, directory |
| `sales` | CRM dashboards, contacts, deals, pipeline |
| `client` | Client portal only |

Use these role names consistently in JWT claims, Supabase user metadata, and database row-level policies.

## Shared Data Objects

| Object | Used by | Notes |
| --- | --- | --- |
| `users` | All portals | Identity, role, profile, status |
| `employees` | HRM, employee, manager, payroll | One employee can link to one auth user |
| `departments` | HRM, manager, analytics | Department ownership and reporting |
| `leave_requests` | HRM, employee, manager | Approval status and history |
| `tasks` | Employee, manager, admin | Assignments, status, priority |
| `contacts` | CRM, admin | Customer and lead records |
| `deals` | CRM, manager, analytics | Pipeline stage, owner, value |
| `activities` | CRM, admin, manager | Calls, emails, notes, audit events |
| `invoices` | Client, employee billing, admin | Billing status and assignments |
| `audit_logs` | Admin | Security and operational trace |

## Supabase to PostgreSQL Switch

Supabase already runs on PostgreSQL. To switch from Supabase client APIs to direct PostgreSQL without rewriting the portals, keep the frontend talking only to backend `/api` routes.

1. Keep portal pages free of database-specific client code.
2. Add a server-side repository layer such as `server/repositories/users.js`, `server/repositories/crm.js`, and `server/repositories/hrm.js`.
3. Choose the provider with an environment variable:

```env
DATABASE_PROVIDER=supabase
# or
DATABASE_PROVIDER=postgres
```

4. For Supabase mode, repositories call `getSupabase({ admin: true })`.
5. For PostgreSQL mode, repositories call a PostgreSQL pool, using parameterized SQL.
6. Keep response shapes identical for both providers.
7. Keep migrations in SQL files so Supabase and PostgreSQL use the same schema.

## Recommended API Boundaries

| API namespace | Backing repository |
| --- | --- |
| `/api/auth/*` | `authRepository` |
| `/api/crm/*` | `crmRepository` |
| `/api/hrm/*` | `hrmRepository` |
| `/api/employee/*` | `employeeRepository` |
| `/api/manager/*` | `managerRepository` |
| `/api/admin/*` | `adminRepository` |

The frontend should not change when the database provider changes. Only repository selection and environment variables should change.

## Offline Rules

GET requests can be cached. Mutations should be queued only when each mutation has an idempotency key, user id, timestamp, and conflict policy. Until that queue exists, POST/PUT/DELETE should show a waiting state when offline and retry after connectivity returns.

Conflict priority:

1. Server audit/security fields win.
2. Newer user-owned draft fields win.
3. Manager/admin approval status wins over employee draft status.
4. Deleted records stay deleted unless restored by an admin.
