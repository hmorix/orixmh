# HMorix Platform - Migration Guide

## Overview

This guide explains how to set up the database infrastructure for the HMorix platform. The platform uses:

1. **Supabase** (PostgreSQL) - for authentication and user management
2. **MongoDB Atlas** - for application data, settings, and notifications

## Prerequisites

- Supabase project created and configured
- MongoDB Atlas cluster created and connection string available
- Environment variables configured

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and API keys
4. Add to environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`

### 1.2 Run Supabase Migrations

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file: `/database/supabase-migration.sql`
4. Copy all SQL and paste into the SQL Editor
5. Click **Run**

This creates all necessary tables for:
- User profiles
- CRM (Contacts, Deals, Activities)
- HRM (Employees, Departments, Leave, Payroll)
- Analytics
- Blog posts
- Support tickets
- Notifications
- Activity logs

## Step 2: MongoDB Setup

### 2.1 Create MongoDB Atlas Cluster

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Get your connection string
5. Add to environment variables:
   - `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`

### 2.2 Create MongoDB Collections

1. Download MongoDB Compass or use mongosh CLI
2. Connect to your MongoDB cluster using the connection string
3. Run the commands from `/database/mongodb-schema.js`:

```javascript
// Copy and paste the contents of mongodb-schema.js into MongoDB Compass
// or run via mongosh CLI
```

This creates collections for:
- `user_profiles` - User profile information
- `notifications` - Real-time notifications
- `login_history` - Login records with device/browser info
- `user_settings` - User preferences and settings
- `oauth_connections` - OAuth provider connections
- `activity_log` - User activity tracking
- `account_deletion_requests` - Account deletion scheduling

## Step 3: Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE=supabase
MONGODB_URI=mongodb+srv://Admin:PASSWORD@cluster.mongodb.net/database?retryWrites=true&w=majority

# Application URLs
NEXT_PUBLIC_APP_URL=https://orix-pink.vercel.app
APP_URL=https://orix-pink.vercel.app
SITE_URL=https://orix-pink.vercel.app

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your_service_role_key

# NVIDIA AI
NVIDIA_API_KEY=your_nvidia_api_key
NVIDIA_MODEL=meta/llama-3.1-405b-instruct

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=3600
```

Create `client/.env`:

```bash
VITE_APP_URL=https://orix-pink.vercel.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_API_URL=https://orix-pink.vercel.app/api
VITE_NVIDIA_API_KEY=your_nvidia_api_key
VITE_NVIDIA_MODEL=meta/llama-3.1-405b-instruct
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_AI_ASSISTANT=true
```

## Step 4: Verify Setup

### Test Supabase Connection

```bash
curl https://your-project.supabase.co/rest/v1/user_profiles \
  -H "Authorization: Bearer your_anon_key" \
  -H "apikey: your_anon_key"
```

### Test MongoDB Connection

```bash
mongosh "mongodb+srv://username:password@cluster.mongodb.net/database"
db.user_profiles.find()
```

## Step 5: Vercel Deployment

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables in **Settings > Environment Variables**
4. Deploy

## Collections Reference

### user_profiles
```javascript
{
  _id: ObjectId,
  user_id: String,        // Supabase user ID
  email: String,
  name: String,
  username: String,
  bio: String,
  country: String,
  avatar_url: String,
  social_links: {
    twitter: String,
    linkedin: String,
    github: String,
    website: String
  },
  role: String,           // admin, user, editor, developer, employee
  plan: String,           // free, starter, business, enterprise
  two_factor_enabled: Boolean,
  verified: Boolean,
  created_at: Date,
  updated_at: Date,
  deleted_at: Date | null
}
```

### notifications
```javascript
{
  _id: ObjectId,
  user_id: String,
  type: String,           // login, password_change, email_verified, profile_updated, etc.
  title: String,
  message: String,
  action_url: String,
  read: Boolean,
  read_at: Date | null,
  created_at: Date
}
```

### login_history
```javascript
{
  _id: ObjectId,
  user_id: String,
  device: String,         // MacBook Pro, iPhone 15, etc.
  browser: String,        // Chrome, Firefox, Safari, Edge
  os: String,             // macOS, Windows, Linux, iOS, Android
  ip_address: String,
  location: String,
  country: String,
  city: String,
  latitude: Double | null,
  longitude: Double | null,
  provider: String,       // email, google, github, microsoft
  created_at: Date
}
```

### user_settings
```javascript
{
  _id: ObjectId,
  user_id: String,        // Unique index
  theme: String,          // dark, light, system
  accent_color: String,
  language: String,
  timezone: String,
  date_format: String,
  currency: String,
  email_notifications: Boolean,
  push_notifications: Boolean,
  security_alerts: Boolean,
  product_updates: Boolean,
  marketing_emails: Boolean,
  weekly_digest: Boolean,
  sidebar_expanded: Boolean,
  font_size: Number,
  updated_at: Date
}
```

## Troubleshooting

### MongoDB Connection Error
- Verify connection string is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

### Supabase Auth Issues
- Verify API keys are correct
- Check CORS settings
- Ensure email verification is enabled

### Environment Variables Not Loading
- Restart development server after changing `.env`
- Verify file is in correct directory
- Check for syntax errors in `.env`

## Support

For issues or questions, refer to:
- [Supabase Docs](https://supabase.com/docs)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Vercel Docs](https://vercel.com/docs)
