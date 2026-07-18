# 🧠 HMorix Platform - Project Memory

This file serves as a reference for the project structure, configuration, and common fixes. Use this to quickly understand the codebase without reading every file.

## 🏗️ Architecture Map

### Frontend (Client)
- **Framework**: React 18 + Vite + TypeScript + TailwindCSS
- **State Management**: React Context (`AuthContext`, `ThemeContext`)
- **Routing**: React Router DOM v6 (see `client/src/App.tsx`)
- **Backend Integration**: 
  - Direct Supabase client for Auth and DB (`client/src/lib/supabase.ts`)
  - API calls to Vercel Functions (`client/src/lib/config.ts` -> `api`)

### Backend (API)
- **Platform**: Vercel Serverless Functions (Node.js/TypeScript)
- **Main Entry**: `api/[...path].ts` (Dynamic routing for all `/api/*` endpoints)
- **Database Adapters**: Supports Supabase (default) and MySQL (via `DATABASE` env var)

## 🔑 Critical Environment Variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | Client | Supabase Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client | Supabase Anon Key |
| `VITE_APP_URL` | Client | Frontend URL (for OAuth/Redirects) |
| `SUPABASE_SECRET_KEY` | Server | Service Role Key for Admin operations |
| `DATABASE` | Server | Set to `supabase` or `mysql` |

## 🛠️ Common Fixes & Debugging

### Black Screen on Deployment
- **Cause**: Missing `VITE_` variables in Vercel or `supabase-js` crashing on initialization.
- **Fix**: 
  - Ensure all variables in `.env.vercel` are added to Vercel settings.
  - Check `client/src/lib/supabase.ts` for safe initialization logic.
  - Verify `client/src/App.tsx` has a loading state for `AuthProvider`.

### Routing Issues (404 on Refresh)
- **Cause**: SPA routing not handled by server.
- **Fix**: `vercel.json` must have a rewrite rule: `{ "source": "/(.*)", "destination": "/index.html" }`.

### API Errors
- **Cause**: CORS issues or incorrect `VITE_API_URL`.
- **Fix**: `VITE_API_URL` should be `https://your-domain.vercel.app/api`.

## 📂 Key Files Index
- `client/src/App.tsx`: Main route definitions and loading state.
- `client/src/lib/supabase.ts`: Supabase client and auth helpers.
- `api/[...path].ts`: Server-side API logic and DB adapters.
- `vercel.json`: Deployment configuration.
- `PROJECT_MEMORY.md`: This file.
