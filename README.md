# HMorix Platform

Enterprise AI Software, Web Design & Digital Solutions Platform.

**Stack:** React + TypeScript + Tailwind CSS (frontend) | Vercel Serverless Functions (API) | Supabase (Auth + Database) | MySQL (optional switch)

---

## Quick Deploy (No Commands Required)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose a region close to your users)
3. Wait for the project to finish setting up (~2 minutes)
4. Go to **SQL Editor** in the Supabase dashboard
5. Copy the contents of `database/supabase-migration.sql` and paste it into the SQL Editor
6. Click **Run** to create all tables and RLS policies

### Step 2: Get Supabase Keys

1. In Supabase Dashboard, go to **Settings > API**
2. Copy these values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) — keep this secret!

### Step 3: Deploy to Vercel

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **"Add New Project"** and import your repository
4. In the **Environment Variables** section, add:

| Variable | Value |
|----------|-------|
| `DATABASE` | `supabase` |
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public key |
| `SUPABASE_SECRET_KEY` | Your Supabase service_role key |
| `VITE_SUPABASE_URL` | Same as SUPABASE_URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Same as SUPABASE_PUBLISHABLE_KEY |

5. Click **Deploy** — that's it!

### Step 4: Configure OAuth (Optional)

To enable Google/GitHub sign-in:

1. In Supabase Dashboard, go to **Authentication > Providers**
2. **Google:** Enable, add Client ID & Secret from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
3. **GitHub:** Enable, add Client ID & Secret from [GitHub Developer Settings](https://github.com/settings/developers)
4. Set the callback URL to: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`

---

## Project Structure

```
hmorix-platform/
├── api/                    # Vercel Serverless Functions
│   ├── _lib/              # Shared utilities (database adapter, auth)
│   │   ├── database.ts    # Supabase/MySQL adapter (switchable)
│   │   └── auth.ts        # Auth middleware
│   ├── auth/              # Authentication endpoints
│   ├── admin/             # Admin endpoints
│   ├── crm/              # CRM endpoints
│   ├── hrm/              # HRM endpoints
│   ├── blog/             # Blog endpoints
│   ├── analytics/        # Analytics endpoints
│   ├── dashboard/        # Dashboard endpoints
│   ├── health.ts         # Health check
│   ├── contact.ts        # Contact form
│   ├── notifications.ts  # Notifications
│   ├── projects.ts       # Projects CRUD
│   ├── invoices.ts       # Invoices CRUD
│   ├── tickets.ts        # Support tickets
│   ├── profile.ts        # User profile
│   ├── settings.ts       # User settings
│   └── status.ts         # System status
├── client/                # React Frontend (Vite)
│   ├── src/
│   │   ├── App.tsx        # Router with all routes
│   │   ├── lib/           # Supabase client, AuthContext
│   │   ├── components/    # Navbar, Footer, CommandPalette, AI Assistant
│   │   ├── layouts/       # MainLayout
│   │   └── pages/         # All page components
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.ts
├── database/              # SQL Migration Files
│   ├── supabase-migration.sql  # Run this in Supabase SQL Editor
│   └── mysql-schema.sql        # For MySQL mode
├── vercel.json            # Vercel deployment config
├── package.json           # Root dependencies (API functions)
└── .env.example           # Environment variables template
```

---

## Switching to MySQL

To switch from Supabase to MySQL:

1. In Vercel Dashboard > Settings > Environment Variables:
   - Change `DATABASE` to `mysql`
   - Add MySQL connection variables:
     - `DB_HOST` — your MySQL host
     - `DB_PORT` — usually `3306`
     - `DB_USER` — database user
     - `DB_PASSWORD` — database password
     - `DB_NAME` — database name (e.g., `hmorix`)
     - `JWT_SECRET` — a random 32+ character string for JWT signing
2. Run `database/mysql-schema.sql` on your MySQL server to create tables
3. Redeploy on Vercel (or it will auto-deploy on next push)

> **Note:** When using MySQL mode, authentication is handled via JWT tokens instead of Supabase Auth. The sign-in/sign-up API endpoints handle token generation.

---

## Environment Variables Reference

| Variable | Required | Mode | Description |
|----------|----------|------|-------------|
| `DATABASE` | Yes | Both | `supabase` or `mysql` |
| `SUPABASE_URL` | Yes | Supabase | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase | Supabase anon/public key |
| `SUPABASE_SECRET_KEY` | Yes | Supabase | Supabase service_role key |
| `VITE_SUPABASE_URL` | Yes | Supabase | Same as SUPABASE_URL (for frontend) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase | Same as SUPABASE_PUBLISHABLE_KEY (for frontend) |
| `DB_HOST` | Yes | MySQL | MySQL host address |
| `DB_PORT` | No | MySQL | MySQL port (default: 3306) |
| `DB_USER` | Yes | MySQL | MySQL username |
| `DB_PASSWORD` | Yes | MySQL | MySQL password |
| `DB_NAME` | Yes | MySQL | MySQL database name |
| `DB_POOL_SIZE` | No | MySQL | Connection pool size (default: 5) |
| `JWT_SECRET` | Yes | MySQL | JWT signing secret (32+ chars) |
| `JWT_EXPIRES_IN` | No | MySQL | Token expiry in seconds (default: 3600) |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check + database status |
| GET | `/api/status` | System status page data |
| GET | `/api/config/database` | Current database provider info |
| POST | `/api/auth/signin` | Sign in (MySQL mode) |
| POST | `/api/auth/signup` | Sign up (MySQL mode) |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/profile` | User profile |
| PUT | `/api/profile` | Update profile |
| GET | `/api/settings` | User settings |
| PUT | `/api/settings` | Update settings |
| GET | `/api/notifications` | Get notifications |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/invoices` | List invoices |
| POST | `/api/invoices` | Create invoice |
| GET | `/api/tickets` | List support tickets |
| POST | `/api/tickets` | Create ticket |
| POST | `/api/contact` | Submit contact form |
| GET | `/api/blog` | List blog posts |
| GET | `/api/blog/:slug` | Get blog post |
| GET | `/api/crm/stats` | CRM statistics |
| GET | `/api/crm/contacts` | List CRM contacts |
| POST | `/api/crm/contacts` | Create contact |
| GET | `/api/crm/deals` | List deals |
| GET | `/api/hrm/stats` | HRM statistics |
| GET | `/api/hrm/employees` | List employees |
| GET | `/api/analytics/overview` | Analytics overview |
| GET | `/api/analytics/traffic` | Traffic sources |
| GET | `/api/admin/stats` | Admin statistics |
| GET | `/api/admin/logs` | System logs |
| GET | `/api/services` | List services |
| GET | `/api/employee/profile` | Employee profile |

---

## Features

- **Authentication:** Supabase Auth with email/password, Google OAuth, GitHub OAuth
- **Command Palette** (Ctrl+K) — Universal search and navigation
- **AI Assistant** — Floating chat widget
- **Notification Center** — Real-time alerts
- **CRM Module** — Contacts, deals, pipeline management
- **HRM Module** — Employees, recruitment, payroll
- **Analytics Dashboard** — Traffic, conversions, revenue
- **Admin Portal** — Users, settings, logs, security
- **Employee Portal** — Time tracking, requests, tasks
- **Blog/CMS** — Content management with categories
- **Responsive Design** — Mobile-first approach

---

## Free Tier Limits

### Vercel Free Tier
- 100GB bandwidth/month
- Serverless function executions: 100,000/month
- Build time: 6,000 minutes/month

### Supabase Free Tier
- 500MB database storage
- 1GB file storage
- 50,000 monthly active users
- 500MB bandwidth
- 2 million edge function invocations

---

## License

Proprietary — HMorix © 2024
