# Environment Variables Reference

## Server-Side Variables (.env)

### Application URLs
- `NEXT_PUBLIC_APP_URL` - Public application URL for OAuth redirects (e.g., https://orix-pink.vercel.app)
- `APP_URL` - Server-side application URL
- `SITE_URL` - Site URL for email verification links

### Database Configuration
- `DATABASE` - Database provider: "supabase" or "mysql" (default: "supabase")
- `MONGODB_URI` - MongoDB connection string (mongodb+srv://user:pass@cluster.mongodb.net/db)

### Supabase Configuration
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_PUBLISHABLE_KEY` - Supabase anon key (public)
- `SUPABASE_SECRET_KEY` - Supabase service role key (private)

### NVIDIA AI Configuration
- `NVIDIA_API_KEY` - NVIDIA API key for AI models
- `NVIDIA_MODEL` - NVIDIA model to use (default: meta/llama-3.1-405b-instruct)

### JWT Configuration
- `JWT_SECRET` - Secret key for JWT signing (min 32 characters)
- `JWT_EXPIRES_IN` - JWT expiration time in seconds (default: 3600)

### MySQL Configuration (if DATABASE=mysql)
- `DB_HOST` - Database host
- `DB_PORT` - Database port (default: 3306)
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `DB_POOL_SIZE` - Connection pool size (default: 5)

---

## Client-Side Variables (client/.env)

### Application URLs
- `VITE_APP_URL` - Application URL for OAuth redirects and email verification
- `VITE_API_URL` - API base URL (default: /api)

### Supabase Configuration
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key (public only)

### NVIDIA AI Configuration
- `VITE_NVIDIA_API_KEY` - NVIDIA API key
- `VITE_NVIDIA_MODEL` - NVIDIA model name

### Feature Flags
- `VITE_ENABLE_ANALYTICS` - Enable analytics tracking (true/false)
- `VITE_ENABLE_AI_ASSISTANT` - Enable AI assistant (true/false)

---

## Example .env File

```bash
# Application URLs
NEXT_PUBLIC_APP_URL=https://orix-pink.vercel.app
APP_URL=https://orix-pink.vercel.app
SITE_URL=https://orix-pink.vercel.app

# Database
DATABASE=supabase
MONGODB_URI=mongodb+srv://Admin:PASSWORD@cluster.mongodb.net/orix?retryWrites=true&w=majority

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NVIDIA AI
NVIDIA_API_KEY=your_nvidia_api_key
NVIDIA_MODEL=meta/llama-3.1-405b-instruct

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRES_IN=3600
```

---

## Example client/.env File

```bash
VITE_APP_URL=https://orix-pink.vercel.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=https://orix-pink.vercel.app/api
VITE_NVIDIA_API_KEY=your_nvidia_api_key
VITE_NVIDIA_MODEL=meta/llama-3.1-405b-instruct
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_AI_ASSISTANT=true
```

---

## Vercel Environment Variables

When deploying to Vercel, add these environment variables in **Settings > Environment Variables**:

```
NEXT_PUBLIC_APP_URL=https://orix-pink.vercel.app
APP_URL=https://orix-pink.vercel.app
SITE_URL=https://orix-pink.vercel.app
DATABASE=supabase
MONGODB_URI=mongodb+srv://...
SUPABASE_URL=https://...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
NVIDIA_API_KEY=...
NVIDIA_MODEL=meta/llama-3.1-405b-instruct
JWT_SECRET=...
JWT_EXPIRES_IN=3600
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_API_URL=https://orix-pink.vercel.app/api
VITE_APP_URL=https://orix-pink.vercel.app
VITE_NVIDIA_API_KEY=...
VITE_NVIDIA_MODEL=meta/llama-3.1-405b-instruct
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_AI_ASSISTANT=true
```

---

## How to Get These Values

### Supabase
1. Go to supabase.com and create a project
2. Go to **Settings > API**
3. Copy `Project URL` and `anon key` (public)
4. Copy `service_role key` (secret - keep safe!)

### MongoDB Atlas
1. Go to mongodb.com/cloud/atlas
2. Create a cluster
3. Create a database user
4. Click **Connect**
5. Choose **Drivers**
6. Copy the connection string
7. Replace `<username>` and `<password>` with your credentials

### NVIDIA API
1. Go to build.nvidia.com
2. Create an API key
3. Choose a model (e.g., meta/llama-3.1-405b-instruct)

### JWT Secret
Generate a random string of at least 32 characters:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Security Notes

- Never commit `.env` files to version control
- Keep `SUPABASE_SECRET_KEY` and `JWT_SECRET` confidential
- Use strong, random values for secrets
- Rotate secrets periodically
- Use different values for development and production
- Only expose `VITE_*` variables to the client
- Server-side variables are never sent to the browser

---

## Troubleshooting

### Variables not loading
- Restart development server after changing `.env`
- Check file is in correct directory
- Verify no syntax errors in `.env`
- Check for spaces around `=` sign

### OAuth not working
- Verify `VITE_APP_URL` is correct
- Check OAuth provider redirect URIs match
- Ensure Supabase OAuth is enabled

### Database connection failed
- Verify connection string is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions
- Test connection with MongoDB Compass

### API errors
- Check `SUPABASE_URL` and keys are correct
- Verify `MONGODB_URI` is valid
- Check JWT_SECRET is at least 32 characters
