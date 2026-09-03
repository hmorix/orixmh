# HMorix Developer Portal & API Sandbox

> Canonical URL: [https://hmorix.in/developers](https://hmorix.in/developers)
> API Gateway: `https://hmorix.in/api`
> OpenAPI Spec: [https://hmorix.in/openapi.json](https://hmorix.in/openapi.json)
> API Docs: [https://hmorix.in/docs](https://hmorix.in/docs)

Welcome to the **HMorix Developer Portal**. Build enterprise applications, autonomous AI agents, and custom workflow automations using our typed REST APIs and developer tools.

---

## 1. Quickstart: Making Your First API Request
Authenticate using your API key in the `Authorization` header:

```bash
curl -s -X GET "https://hmorix.in/api/status" \
  -H "Accept: application/json"
```

Response:
```json
{
  "success": true,
  "overall": "operational",
  "services": [
    { "name": "API Gateway", "status": "operational", "uptime": 99.99, "latency": "12ms" },
    { "name": "AI Agent Engine", "status": "operational", "uptime": 99.95, "latency": "230ms" },
    { "name": "BillingFlow", "status": "operational", "uptime": 99.99, "latency": "15ms" }
  ]
}
```

---

## 2. API Key Management
To generate an API key:
1. Sign in to your developer account at [https://hmorix.in/signin](https://hmorix.in/signin).
2. Navigate to your Developer Settings at `/settings` or `/account/api-keys`.
3. Click **Generate New API Key**.
4. Securely store your secret key (`hm_live_••••••••••••`).

Pass the key with every request:
```
Authorization: Bearer hm_live_your_api_key_here
```

---

## 3. Interactive Sandbox Environment
Developers and AI agents can test endpoints safely in our sandbox without mutating production customer records:
- **Sandbox Health**: `GET https://hmorix.in/api/health`
- **Sandbox Status**: `GET https://hmorix.in/api/status`
- **Service Catalog**: `GET https://hmorix.in/api/services`
- **AI Agent Chat Probe**: `POST https://hmorix.in/api/ai/chat` with `{ "message": "Ping" }`

---

## 4. Official CLI Tool (@hmorix/cli)
Interact with HMorix from your terminal or CI/CD pipeline:
```bash
# Run without installing
npx @hmorix/cli status

# Install globally
npm install -g @hmorix/cli

# Run an AI agent prompt
hmorix agent "Summarize recent BillingFlow updates"
```

---

## 5. Machine-Readable Specifications
- **OpenAPI 3.0 (JSON)**: [https://hmorix.in/openapi.json](https://hmorix.in/openapi.json)
- **OpenAPI (YAML)**: [https://hmorix.in/openapi.yaml](https://hmorix.in/openapi.yaml)
- **RFC 9727 API Catalog**: [https://hmorix.in/.well-known/api-catalog](https://hmorix.in/.well-known/api-catalog)
- **LLMs Guide**: [https://hmorix.in/llms.txt](https://hmorix.in/llms.txt)
