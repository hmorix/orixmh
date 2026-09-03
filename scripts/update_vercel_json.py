import json

vercel_config = {
  "version": 2,
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "installCommand": "npm install",
  "framework": "vite",
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 10,
      "memory": 1024
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Vary", "value": "Accept, Accept-Encoding" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    },
    {
      "source": "/.well-known/api-catalog",
      "headers": [
        { "key": "Content-Type", "value": "application/linkset+json;profile=\"https://www.rfc-editor.org/info/rfc9727\"" },
        { "key": "Vary", "value": "Accept, Accept-Encoding" },
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    },
    {
      "source": "/.well-known/http-message-signatures-directory",
      "headers": [
        { "key": "Content-Type", "value": "application/json" },
        { "key": "Vary", "value": "Accept, Accept-Encoding" },
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    },
    {
      "source": "/openapi.json",
      "headers": [
        { "key": "Content-Type", "value": "application/json; charset=utf-8" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Vary", "value": "Accept, Accept-Encoding" }
      ]
    },
    {
      "source": "/openapi.yaml",
      "headers": [
        { "key": "Content-Type", "value": "application/yaml; charset=utf-8" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Vary", "value": "Accept, Accept-Encoding" }
      ]
    },
    {
      "source": "/pricing.md",
      "headers": [
        { "key": "Content-Type", "value": "text/markdown; charset=utf-8" },
        { "key": "Vary", "value": "Accept, Accept-Encoding" }
      ]
    },
    {
      "source": "/llms.txt",
      "headers": [
        { "key": "Content-Type", "value": "text/plain; charset=utf-8" },
        { "key": "Vary", "value": "Accept, Accept-Encoding" }
      ]
    },
    {
      "source": "/agent-instructions.txt",
      "headers": [
        { "key": "Content-Type", "value": "text/plain; charset=utf-8" },
        { "key": "Vary", "value": "Accept, Accept-Encoding" }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/openapi.json",
      "destination": "/openapi.json"
    },
    {
      "source": "/openapi.yaml",
      "destination": "/openapi.yaml"
    },
    {
      "source": "/api/openapi.yaml",
      "destination": "/api/openapi.yaml"
    },
    {
      "source": "/api/openapi.json",
      "destination": "/openapi.json"
    },
    {
      "source": "/.well-known/:path*",
      "destination": "/.well-known/:path*"
    },
    {
      "source": "/llms.txt",
      "destination": "/llms.txt"
    },
    {
      "source": "/agent-instructions.txt",
      "destination": "/agent-instructions.txt"
    },
    {
      "source": "/pricing.md",
      "destination": "/pricing.md"
    },
    {
      "source": "/about.md",
      "destination": "/about.md"
    },
    {
      "source": "/contact.md",
      "destination": "/contact.md"
    },
    {
      "source": "/privacy.md",
      "destination": "/privacy.md"
    },
    {
      "source": "/developers.md",
      "destination": "/developers.md"
    },
    {
      "source": "/docs.md",
      "destination": "/docs.md"
    },
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "header",
          "key": "accept",
          "value": ".*text/markdown.*"
        }
      ],
      "destination": "/api/markdown?path=$1"
    },
    {
      "source": "/api/:path*",
      "destination": "/api/[...path].ts"
    },
    { "source": "/", "destination": "/index.html" },
    { "source": "/about", "destination": "/index.html" },
    { "source": "/services", "destination": "/index.html" },
    { "source": "/services/:path*", "destination": "/index.html" },
    { "source": "/pricing", "destination": "/index.html" },
    { "source": "/pricing/:path*", "destination": "/index.html" },
    { "source": "/contact", "destination": "/index.html" },
    { "source": "/blog", "destination": "/index.html" },
    { "source": "/blog/:path*", "destination": "/index.html" },
    { "source": "/security", "destination": "/index.html" },
    { "source": "/status", "destination": "/index.html" },
    { "source": "/trust", "destination": "/index.html" },
    { "source": "/compliance", "destination": "/index.html" },
    { "source": "/support", "destination": "/index.html" },
    { "source": "/knowledge-base", "destination": "/index.html" },
    { "source": "/case-studies", "destination": "/index.html" },
    { "source": "/case-studies/:path*", "destination": "/index.html" },
    { "source": "/whitepapers", "destination": "/index.html" },
    { "source": "/whitepapers/:path*", "destination": "/index.html" },
    { "source": "/certifications", "destination": "/index.html" },
    { "source": "/billingflow", "destination": "/index.html" },
    { "source": "/billingflow/:path*", "destination": "/index.html" },
    { "source": "/agent", "destination": "/index.html" },
    { "source": "/agent/:path*", "destination": "/index.html" },
    { "source": "/pdf-automation", "destination": "/index.html" },
    { "source": "/pdf-automation/:path*", "destination": "/index.html" },
    { "source": "/developers", "destination": "/index.html" },
    { "source": "/docs", "destination": "/index.html" },
    { "source": "/playground", "destination": "/index.html" },
    { "source": "/smart-home", "destination": "/index.html" },
    { "source": "/harsh-sharma", "destination": "/index.html" },
    { "source": "/harsh-sharma-developer", "destination": "/index.html" },
    { "source": "/locations/:path*", "destination": "/index.html" },
    { "source": "/dashboard", "destination": "/index.html" },
    { "source": "/architecture", "destination": "/index.html" },
    { "source": "/activity", "destination": "/index.html" },
    { "source": "/crm", "destination": "/index.html" },
    { "source": "/crm/:path*", "destination": "/index.html" },
    { "source": "/sales", "destination": "/index.html" },
    { "source": "/hrm", "destination": "/index.html" },
    { "source": "/hrm/:path*", "destination": "/index.html" },
    { "source": "/manager", "destination": "/index.html" },
    { "source": "/analytics", "destination": "/index.html" },
    { "source": "/careers", "destination": "/index.html" },
    { "source": "/careers/:path*", "destination": "/index.html" },
    { "source": "/investors", "destination": "/index.html" },
    { "source": "/partners", "destination": "/index.html" },
    { "source": "/roadmap", "destination": "/index.html" },
    { "source": "/media-kit", "destination": "/index.html" },
    { "source": "/press", "destination": "/index.html" },
    { "source": "/press/:path*", "destination": "/index.html" },
    { "source": "/faq", "destination": "/index.html" },
    { "source": "/testimonials", "destination": "/index.html" },
    { "source": "/sitemap", "destination": "/index.html" },
    { "source": "/terms", "destination": "/index.html" },
    { "source": "/privacy", "destination": "/index.html" },
    { "source": "/profile", "destination": "/index.html" },
    { "source": "/retry", "destination": "/index.html" },
    { "source": "/settings", "destination": "/index.html" },
    { "source": "/portal", "destination": "/index.html" },
    { "source": "/admin", "destination": "/index.html" },
    { "source": "/admin/:path*", "destination": "/index.html" },
    { "source": "/employee", "destination": "/index.html" },
    { "source": "/employee/:path*", "destination": "/index.html" },
    { "source": "/signin", "destination": "/index.html" },
    { "source": "/signup", "destination": "/index.html" },
    { "source": "/forgot-password", "destination": "/index.html" },
    { "source": "/verify", "destination": "/index.html" },
    { "source": "/search-account", "destination": "/index.html" },
    { "source": "/profile-setup", "destination": "/index.html" },
    { "source": "/offline", "destination": "/index.html" },
    {
      "source": "/(.*)",
      "destination": "/api/not-found?path=$1"
    }
  ]
}

with open('vercel.json', 'w', encoding='utf-8') as f:
    json.dump(vercel_config, f, indent=2)

print('vercel.json updated successfully!')
