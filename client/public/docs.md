# HMorix Public API Documentation & Endpoint Reference

> Canonical URL: [https://hmorix.in/docs](https://hmorix.in/docs)
> API Base URL: `https://hmorix.in/api`
> Specification: [https://hmorix.in/openapi.json](https://hmorix.in/openapi.json)

---

## 1. Authentication
HMorix supports two authentication mechanisms:
- **API Key Bearer Token**: Pass `Authorization: Bearer <API_KEY>` in the request header.
- **Session Cookie**: Web clients pass the signed `hm_session` cookie automatically.

All API responses return JSON with `success: true` or `error: string` on failure.

---

## 2. Core Endpoints Reference

### Check Health: `GET /api/health`
Returns operational connectivity for primary databases.
```bash
curl -s https://hmorix.in/api/health
```
Response:
```json
{
  "success": true,
  "status": { "api": true, "mongodb": true, "supabase": true },
  "timestamp": "2026-09-03T03:00:00.000Z"
}
```

### Live Status: `GET /api/status`
Returns service-by-service latency, uptime, and incident reports.
```bash
curl -s https://hmorix.in/api/status
```

### Services Catalog: `GET /api/services`
Lists active enterprise software and marketing services with starting pricing.
```bash
curl -s https://hmorix.in/api/services
```

### AI Agent Chat: `POST /api/ai/chat`
Invokes the HMorix AI orchestration engine.
```bash
curl -s -X POST https://hmorix.in/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is BillingFlow and how does it calculate GST?"}'
```

### Submit Lead Inquiry: `POST /api/contact`
Generates a new CRM deal and notifies regional project triage.
```bash
curl -s -X POST https://hmorix.in/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Dev",
    "last_name": "Lead",
    "email": "dev@company.com",
    "service": "Enterprise AI Software",
    "message": "We need custom API integration for our invoicing platform."
  }'
```

---

## 3. Rate Limits & Headers
- Standard community tiers allow 60 requests/minute.
- Pro developer keys allow 600 requests/minute.
- Enterprise plans have unlimited request ceilings.
- Response header `Vary: Accept, Accept-Encoding` is always returned.
- Send `Accept: text/markdown` on any URL to receive Markdown per [acceptmarkdown.com](https://acceptmarkdown.com).
