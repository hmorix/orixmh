# Environment Variables Reference

Do not commit real secrets. Add production values in Vercel Project Settings > Environment Variables.

## Required Server Variables

```bash
APP_URL=https://your-domain.vercel.app
VERCEL_URL=your-domain.vercel.app
CLIENT_ORIGIN=https://your-domain.vercel.app
DATABASE=supabase

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hmorix?retryWrites=true&w=majority

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=Orixbucket

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_gmail_address@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM_NAME=HMorix

SESSION_SECRET=replace_with_32_plus_random_bytes
JWT_SECRET=replace_with_32_plus_random_bytes
JWT_REFRESH_SECRET=replace_with_32_plus_random_bytes
ADMIN_EMAIL=admin@hmorix.com
```

## Optional Server Variables

```bash
MARIADB_HOST=localhost
MARIADB_PORT=3306
MARIADB_DATABASE=hmorix
MARIADB_USER=root
MARIADB_PASSWORD=

SESSION_TTL_MS=604800000
JWT_EXPIRES_IN=3600
MAX_UPLOAD_SIZE=8388608
EMAIL_VERIFY_TTL_MS=86400000
OTP_TTL_MS=600000
OTP_RETRY_LIMIT=5
OTP_RESEND_LIMIT=5
```

## Required Client Variables

```bash
VITE_APP_URL=https://your-domain.vercel.app
VITE_API_URL=/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## Database Notes

Set `DATABASE=supabase` to use Supabase tables for the existing business-data adapter such as CRM, projects, support tickets, notifications, settings, invoices, and operational dashboard data.

MongoDB is still used for custom auth, users, profiles, sessions, OAuth account linking, verification tokens, OTP records, and blogs.

Set `DATABASE=mariadb` only if you want those business-data adapter queries to use MariaDB instead.

## Auth Provider Notes

Google and GitHub authenticate through backend OAuth endpoints and store/link users in MongoDB by normalized email.

Microsoft remains on Supabase Auth and still needs the Supabase client variables plus Microsoft provider configuration in Supabase.

Email/password authentication is MongoDB-backed. Passwords are bcrypt hashed. Verification emails, OTP, and forgot-password OTP use Gmail SMTP through Nodemailer.

## Storage Notes

Supabase Storage uses bucket `Orixbucket`. Create it as public, or allow the API service-role key to create it automatically. Store profile images, cover images, blog images, JSON exports, and attachments there.

## Secret Rotation

OAuth client secrets and Gmail app passwords pasted into chat should be considered exposed. Rotate them in Google Cloud, GitHub Developer Settings, and Gmail App Passwords before production deployment.
