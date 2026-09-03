import os

def write_page(slug, title, description, html_body, md_content):
    # 1. Write Markdown file
    md_path = f"client/public/{slug}.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_content.strip() + "\n")
    
    # 2. Write HTML file in client/public/{slug}/index.html
    dir_path = f"client/public/{slug}"
    os.makedirs(dir_path, exist_ok=True)
    html_file = f"{dir_path}/index.html"
    
    full_html = f"""<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="alternate icon" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content="{description}" />
  <link rel="canonical" href="https://hmorix.in/{slug}" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    body {{ background-color: #0A0A0B; color: #F5F5F7; font-family: 'Inter', sans-serif; margin: 0; padding: 0; }}
    a {{ color: #C8FF00; text-decoration: none; }}
    a:hover {{ text-decoration: underline; }}
    .container {{ max-width: 1100px; margin: 0 auto; padding: 60px 24px; }}
    h1 {{ font-family: 'Space Grotesk', sans-serif; font-size: 38px; line-height: 1.2; margin-bottom: 20px; }}
    h2 {{ font-family: 'Space Grotesk', sans-serif; font-size: 24px; margin-top: 36px; margin-bottom: 16px; border-bottom: 1px solid #222; padding-bottom: 8px; }}
    h3 {{ font-size: 18px; margin-top: 24px; margin-bottom: 10px; color: #E5E5E7; }}
    p, li {{ color: #A1A1AA; line-height: 1.7; font-size: 15px; }}
    ul, ol {{ padding-left: 24px; }}
    code, pre {{ font-family: 'JetBrains Mono', monospace; background: #16161A; border: 1px solid #27272A; border-radius: 4px; padding: 2px 6px; font-size: 13px; }}
    pre {{ padding: 16px; overflow-x: auto; }}
    .btn {{ display: inline-block; background: #C8FF00; color: #0A0A0B; padding: 10px 20px; border-radius: 4px; font-weight: 600; text-decoration: none; }}
  </style>
</head>
<body>
  <div id="root">
    <div class="container">
      {html_body}
    </div>
  </div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>"""
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"Generated {slug}: {html_file} and {md_path}")

# ================= ABOUT =================
about_md = """# About HMorix – Leadership, Enterprise Architecture & Global Vision

> Canonical URL: [https://hmorix.in/about](https://hmorix.in/about)
> Company Name: HMorix (HM Orix / orixmh)
> Founder & CEO: Harsh Sharma
> Head Office: Hathras, Uttar Pradesh, India (PIN: 204101)
> Contact: [support@hmorix.com](mailto:support@hmorix.com) / [harsh@hmorix.in](mailto:harsh@hmorix.in)

---

## 1. Company Overview
HMorix is a unified enterprise technology and SaaS software company founded in 2023 by Harsh Sharma. Headquartered in Hathras, Uttar Pradesh, HMorix operates at the intersection of enterprise autonomous artificial intelligence, scalable cloud infrastructure, full-stack application development, and regional digital transformation.

Our primary mission is to provide high-performance, enterprise-grade software products and custom engineering solutions that empower small-to-medium businesses (SMEs) and global enterprises to automate their operational workflows, reduce transaction overhead, and achieve measurable technological leadership.

---

## 2. Leadership: Harsh Sharma (Founder & CEO)
Harsh Sharma is an Indian technologist, full-stack software engineer, and system architect based in Hathras, Uttar Pradesh. With deep technical mastery across React, Next.js, Node.js, TypeScript, Python, and distributed cloud databases, Harsh Sharma architects and leads development on:
- **BillingFlow**: Enterprise billing, multi-currency invoicing, and Indian GST tax automation.
- **HMorix AI Platform**: Autonomous LLM agent orchestration and enterprise customer service bots.
- **PDF Automation Engine**: High-volume cryptographic document generation pipelines.
- **Enterprise HRM & CRM Portals**: Multi-role operational platforms connecting sales, project management, and client collaboration.

Harsh Sharma's technical portfolio and engineering runbooks are documented at [https://hmorix.in/harsh-sharma](https://hmorix.in/harsh-sharma) and [https://hmorix.in/harsh-sharma-developer](https://hmorix.in/harsh-sharma-developer).

---

## 3. Core Platforms & Technologies
1. **BillingFlow ([https://hmorix.in/billingflow](https://hmorix.in/billingflow))**: Next-generation automated invoicing, multi-currency billing, real-time GST (CGST/SGST/IGST), subscription recovery, and payment gateway webhooks.
2. **AI Agent Platform ([https://hmorix.in/agent](https://hmorix.in/agent))**: Autonomous enterprise AI workflows powered by NVIDIA NIM (Llama 3.1 405B) and proprietary LLM orchestrations.
3. **PDF Automation Engine ([https://hmorix.in/pdf-automation](https://hmorix.in/pdf-automation))**: High-throughput programmatic document creation, offer letters, joining contracts, and invoice PDF streams.
4. **HMorix HRM ([https://hmorix.in/hrm](https://hmorix.in/hrm))**: Enterprise Human Resource Management with biometric attendance, automated Indian payroll (PF, ESI, TDS), and recruitment tracking.

---

## 4. Regional & Global Operations
- **Headquarters**: HMorix Headquarters, Hathras, Uttar Pradesh, India (PIN: 204101, Coordinates: 27.5946° N, 78.0526° E).
- **Regional Service Hubs**: Hathras, Mathura, Vrindavan, Aligarh, Agra, Kanpur, Delhi NCR (Noida, Gurugram), Mumbai, and Bengaluru.
- **Global Delivery**: Serving clients across North America, Europe, the Middle East, and Asia Pacific with 99.9% uptime SLAs.

---

## 5. Engineering Standards & Security
All HMorix software adheres to rigorous security standards:
- End-to-end cryptographic hashing (bcrypt, HMAC-SHA256).
- Zero mock data policy: all portals connect to production database collections.
- SOC 2 and ISO 27001 aligned infrastructure architecture.
- Full compliance with Indian Digital Personal Data Protection (DPDP) Act and GDPR.
"""

about_html = """<p style="color:#C8FF00;font-family:monospace;font-size:14px;margin-bottom:8px;">COMPANY PROFILE</p>
<h1>About HMorix – Leadership, Enterprise Architecture & Global Vision</h1>
<p style="font-size:18px;color:#bbb;line-height:1.6;margin-bottom:30px;">
  HMorix (<a href="https://hmorix.in">https://hmorix.in</a>) is India's leading enterprise AI software, full-stack web engineering, mobile app development, and business automation company headquartered in Hathras, Uttar Pradesh.
</p>

<h2>Executive Leadership: Harsh Sharma</h2>
<p>
  Founded and led by <strong>Harsh Sharma</strong> (Founder & CEO, Full-Stack Architect), HMorix builds enterprise cloud platforms, BillingFlow invoicing automation, high-throughput PDF generation engines, and autonomous AI agents powered by cutting-edge neural models including NVIDIA NIM (Llama 3.1 405B). Harsh Sharma's portfolio is available at <a href="/harsh-sharma">/harsh-sharma</a> and <a href="/harsh-sharma-developer">/harsh-sharma-developer</a>.
</p>

<h2>Core Enterprise Platforms</h2>
<ul>
  <li><strong>BillingFlow:</strong> Automated GST invoicing, multi-currency payment recovery, and subscription management for modern enterprises (<a href="/billingflow">Learn more</a>).</li>
  <li><strong>AI Agent Platform:</strong> Enterprise workflow automation, conversational support bots, and RAG document intelligence (<a href="/agent">Explore AI Agent</a>).</li>
  <li><strong>PDF Automation:</strong> Programmatic high-throughput generation of salary slips, joining letters, and legally binding tax invoices (<a href="/pdf-automation">View PDF Automation</a>).</li>
  <li><strong>Enterprise HRM:</strong> Multi-branch organizational hierarchy, biometric/geo-fenced attendance, and statutory Indian payroll processing (<a href="/hrm">HRM Suite</a>).</li>
</ul>

<h2>Regional Expertise & Global Markets</h2>
<p>
  From our corporate headquarters in Hathras, Uttar Pradesh (PIN: 204101), HMorix delivers top-tier technology consulting and software engineering to clients across Hathras, Mathura, Vrindavan, Aligarh, Agra, Delhi NCR, Mumbai, and Bengaluru, alongside international customers worldwide.
</p>

<h2>Security & Compliance Commitment</h2>
<p>
  We maintain an immutable commitment to customer security. All sensitive sessions utilize HMAC-SHA256 signatures, all data at rest is encrypted with AES-256, and all operations conform to the Indian Digital Personal Data Protection (DPDP) Act and global GDPR guidelines.
</p>
<p style="margin-top:30px;">
  <a href="/contact" class="btn">Get in Touch with Leadership</a>
</p>"""

write_page("about", "About HMorix – Leadership, Enterprise Architecture & Vision", "HMorix is India's leading enterprise AI software and web engineering company founded by Harsh Sharma in Hathras, Uttar Pradesh.", about_html, about_md)

# ================= CONTACT =================
contact_md = """# Contact HMorix – Sales, Technical Support & Headquarters

> Canonical URL: [https://hmorix.in/contact](https://hmorix.in/contact)
> General Inquiries: [support@hmorix.com](mailto:support@hmorix.com)
> Direct Founder Line: [harsh@hmorix.in](mailto:harsh@hmorix.in)
> Phone: +91 94576 52321 (India)
> Operating Hours: Monday – Saturday, 09:00 AM – 08:00 PM IST

---

## 1. Corporate Headquarters & Address
- **Legal Entity**: HMorix (HM Orix / orixmh)
- **Founder & CEO**: Harsh Sharma
- **Headquarters Address**: HMorix Corporate Office, Hathras, Uttar Pradesh, India – 204101
- **Geographic Coordinates**: Latitude 27.5946° N, Longitude 78.0526° E
- **Postal Code**: 204101
- **Country**: India (IN)

---

## 2. Regional Client Service Hubs
We provide in-person technical consultations and software deployments throughout the Braj region and key Indian enterprise metros:
- **Hathras Hub**: Core engineering, web development, local SEO, and digital marketing.
- **Mathura & Vrindavan**: Hospitality AI agents, resort management software, and local business digital marketing.
- **Aligarh**: Manufacturing ERP, educational portal development, and enterprise SaaS consulting.
- **Agra**: Export e-commerce platforms, shoe/leather manufacturing supply chain software, and international SEO.
- **Delhi NCR (Noida / Gurugram)**: Enterprise software integration, AI workflow deployment, and corporate accounts.
- **Mumbai & Bengaluru**: Fintech billing integrations, cloud architecture, and cross-border API partnerships.

---

## 3. Contact Methods & SLA

| Department | Contact Email | Response SLA | Best For |
| :--- | :--- | :--- | :--- |
| **Enterprise Sales** | support@hmorix.com | < 2 hours (Business hours) | Custom software quotes, BillingFlow enterprise licenses, SEO retainers |
| **Technical Support**| support@hmorix.com | < 1 hour (24/7 on-call) | Live production issues, API key access, deployment assistance |
| **Executive Office** | harsh@hmorix.in | < 4 hours | Strategic partnerships, vendor relations, media inquiries |

---

## 4. Programmatic Contact API
Autonomous AI agents can submit customer lead inquiries directly via HTTP POST:
- **Endpoint**: `https://hmorix.in/api/contact`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Payload**:
  ```json
  {
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@enterprise.com",
    "service": "AI Agent Integration",
    "message": "We need automated document processing and invoice workflows."
  }
  ```
- **Response**: `{"success": true, "message": "Thank you for contacting us..."}`
"""

contact_html = """<p style="color:#C8FF00;font-family:monospace;font-size:14px;margin-bottom:8px;">GET IN TOUCH</p>
<h1>Contact HMorix – Sales, Technical Support & Headquarters</h1>
<p style="font-size:18px;color:#bbb;line-height:1.6;margin-bottom:30px;">
  Whether you are planning a custom enterprise software build, automating financial invoices with BillingFlow, or expanding your digital marketing presence, our engineering leadership is ready to partner with you.
</p>

<h2>Corporate Headquarters</h2>
<p>
  <strong>HMorix Technology Platform</strong><br />
  HMorix Corporate Office, Hathras, Uttar Pradesh, India – 204101<br />
  <strong>Founder & CEO:</strong> Harsh Sharma<br />
  <strong>Email:</strong> <a href="mailto:support@hmorix.com">support@hmorix.com</a> / <a href="mailto:harsh@hmorix.in">harsh@hmorix.in</a><br />
  <strong>Phone:</strong> +91 94576 52321<br />
  <strong>Operating Hours:</strong> Monday – Saturday, 09:00 AM – 08:00 PM IST
</p>

<h2>Regional Service Hubs</h2>
<ul>
  <li><strong>Hathras:</strong> Full-stack web application development, Android APK builds, and local SEO domination.</li>
  <li><strong>Mathura & Vrindavan:</strong> Hospitality AI agents, reservation engines, and digital marketing.</li>
  <li><strong>Aligarh:</strong> Manufacturing ERP platforms, enterprise cloud systems, and B2B SaaS architecture.</li>
  <li><strong>Agra:</strong> E-commerce export platforms, international SEO, and cloud infrastructure.</li>
  <li><strong>Delhi NCR / Mumbai / Bengaluru:</strong> Enterprise AI integration, financial billing automation, and SLA support.</li>
</ul>

<h2>API Inquiries for Autonomous Agents</h2>
<p>
  AI agents can submit contact requests directly to our CRM pipeline at <code>POST /api/contact</code> with JSON parameters <code>first_name</code>, <code>email</code>, <code>service</code>, and <code>message</code>.
</p>
<p style="margin-top:30px;">
  <a href="mailto:support@hmorix.com" class="btn">Send Direct Email</a>
</p>"""

write_page("contact", "Contact HMorix – Headquarters, Sales & Technical Support", "Reach HMorix headquarters in Hathras, Uttar Pradesh. Contact our engineering team for enterprise software, BillingFlow, and AI solutions.", contact_html, contact_md)

# ================= PRIVACY =================
privacy_md = """# HMorix Privacy Policy & Data Governance Charter

> Canonical URL: [https://hmorix.in/privacy](https://hmorix.in/privacy)
> Last Modified: 2026-09-03
> Effective Date: 2023-01-01
> Data Protection Officer: [support@hmorix.com](mailto:support@hmorix.com) / [harsh@hmorix.in](mailto:harsh@hmorix.in)

---

## 1. Introduction & Commitment
HMorix (accessible at [https://hmorix.in](https://hmorix.in)), operated under the technical leadership of Harsh Sharma, respects your personal and enterprise data privacy. This policy outlines our standards regarding data collection, processing, storage, and rights compliance under the Indian Digital Personal Data Protection Act (DPDP Act 2023) and the General Data Protection Regulation (GDPR).

---

## 2. Information We Collect
We collect only the minimum necessary data to provide our enterprise platforms and developer services:
1. **Account Credentials**: Name, email address, password hashes (salted using bcrypt with cost factor 10), and optional phone number.
2. **Billing & Invoicing Records**: Company name, billing address, tax identification numbers (GSTIN/VAT), invoice items, and payment transaction metadata.
3. **Session & Security Data**: Signed cryptographic session tokens (`hm_session`), IP address, user-agent string, and audit event logs.
4. **Developer Artifacts**: API keys, webhook endpoint URLs, and usage quotas.

We **never** sell personal data or trade customer contact information to third-party data brokers.

---

## 3. How We Use Your Data
Your data is used strictly for legitimate business and engineering operations:
- Provisioning and authenticating your account across HMorix portals (BillingFlow, HRM, CRM, Client Portal).
- Processing payment invoices and calculating accurate statutory taxes (CGST, SGST, IGST).
- Dispatching transactional notifications (SMTP OTP verification codes, invoice payment reminders, password resets).
- Enforcing API rate limits and preventing distributed denial-of-service (DDoS) abuse.
- Maintaining immutable security audit logs for compliance verification.

---

## 4. Data Storage, Encryption & Security Safeguards
- **Primary Datastore**: Enterprise MongoDB Atlas cluster with automated encrypted storage volumes and daily backups.
- **In-Transit Encryption**: TLS 1.3 enforced across all public endpoints; HTTP strictly upgraded to HTTPS.
- **At-Rest Encryption**: Industry-standard AES-256 encryption applied to persistent storage and file uploads.
- **Session Protection**: HTTP-only, secure, SameSite=Lax cookies with HMAC-SHA256 signatures to eliminate XSS session hijacking.

---

## 5. Your Data Rights
Under applicable privacy legislation (DPDP Act and GDPR), you retain the right to:
- Access and inspect any personal data associated with your user identity.
- Request correction or updating of inaccurate profile information.
- Request complete deletion ("Right to be Forgotten") of your account and personal records.
- Export your account history and transaction data in structured JSON format.

To exercise any privacy rights, contact our Data Protection Officer at [support@hmorix.com](mailto:support@hmorix.com).
"""

privacy_html = """<p style="color:#C8FF00;font-family:monospace;font-size:14px;margin-bottom:8px;">LEGAL & DATA GOVERNANCE</p>
<h1>HMorix Privacy Policy & Data Protection Charter</h1>
<p style="font-size:18px;color:#bbb;line-height:1.6;margin-bottom:30px;">
  This document sets forth the comprehensive privacy policy for HMorix (<a href="https://hmorix.in">https://hmorix.in</a>), detailing our collection, usage, and cryptographic protection of personal and enterprise information.
</p>

<h2>Principles of Data Protection</h2>
<p>
  HMorix is built on an enterprise-first foundation. We uphold strict adherence to the Indian Digital Personal Data Protection (DPDP) Act of 2023 and the General Data Protection Regulation (GDPR). We enforce zero data monetization: customer data is never sold, leased, or transmitted to advertising brokers.
</p>

<h2>Information Collected</h2>
<ul>
  <li><strong>Authentication Details:</strong> Email addresses, names, and bcrypt-salted credential hashes.</li>
  <li><strong>Enterprise Invoicing Data:</strong> Corporate legal name, GSTIN, invoice lines, and payment metadata.</li>
  <li><strong>System Logs:</strong> IP address, user-agent string, and HMAC-signed session identifiers (<code>hm_session</code>).</li>
</ul>

<h2>Data Security Controls</h2>
<p>
  All data transmission is protected via TLS 1.3 encryption. At-rest storage is hosted on encrypted MongoDB Atlas clusters with automated access auditing and role-based access control (RBAC). Session tokens are stored in signed, HTTP-only cookies to protect against cross-site scripting (XSS).
</p>

<h2>User Rights & Contact</h2>
<p>
  You have the right to inspect, export, or permanently delete your account data. Inquiries and data deletion requests should be directed to our Data Protection Officer at <a href="mailto:support@hmorix.com">support@hmorix.com</a>.
</p>"""

write_page("privacy", "HMorix Privacy Policy & Data Protection Charter", "Learn how HMorix protects customer and enterprise data in accordance with the Indian DPDP Act and GDPR.", privacy_html, privacy_md)

# ================= DEVELOPERS =================
dev_md = """# HMorix Developer Portal & API Sandbox

> Canonical URL: [https://hmorix.in/developers](https://hmorix.in/developers)
> API Gateway: `https://hmorix.in/api`
> OpenAPI Spec: [https://hmorix.in/openapi.json](https://hmorix.in/openapi.json)
> API Docs: [https://hmorix.in/docs](https://hmorix.in/docs)

Welcome to the **HMorix Developer Portal**. Build enterprise applications, autonomous AI agents, and custom workflow automations using our typed REST APIs and developer tools.

---

## 1. Quickstart: Making Your First API Request
Authenticate using your API key in the `Authorization` header:

```bash
curl -s -X GET "https://hmorix.in/api/status" \\
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
"""

dev_html = """<p style="color:#C8FF00;font-family:monospace;font-size:14px;margin-bottom:8px;">DEVELOPER PLATFORM</p>
<h1>HMorix Developer Portal & API Sandbox</h1>
<p style="font-size:18px;color:#bbb;line-height:1.6;margin-bottom:30px;">
  Everything developers and autonomous AI agents need to integrate HMorix services: typed REST APIs, OpenAPI 3.0 schemas, interactive sandbox probes, and our official CLI tool.
</p>

<h2>Quick Start (cURL)</h2>
<pre><code>curl -s -X GET "https://hmorix.in/api/status" \\
  -H "Accept: application/json"</code></pre>

<h2>API Keys & Authentication</h2>
<p>
  All authenticated requests accept an <code>Authorization: Bearer &lt;HMORIX_API_KEY&gt;</code> header or an HTTP-only <code>hm_session</code> cookie. Developers can generate API keys directly in the <a href="/signin">Developer Account Settings</a>.
</p>

<h2>Interactive Sandbox Probes</h2>
<ul>
  <li><code>GET /api/health</code> – Operational gateway and database cluster connectivity.</li>
  <li><code>GET /api/status</code> – Live subsystem latency and uptime metrics.</li>
  <li><code>GET /api/services</code> – Full catalog of enterprise solutions and base pricing.</li>
  <li><code>POST /api/ai/chat</code> – Autonomous agent inference with NVIDIA NIM orchestration.</li>
</ul>

<h2>Official CLI Tool (@hmorix/cli)</h2>
<p>
  Script your workflows and automate API calls using the official HMorix CLI:
</p>
<pre><code># Run instantly with npx
npx @hmorix/cli status

# Inspect OpenAPI spec
npx @hmorix/cli openapi</code></pre>

<h2>Machine-Readable Specifications</h2>
<p>
  Download and validate our API schemas in standard formats:
</p>
<ul style="line-height:1.8;">
  <li><a href="/openapi.json">OpenAPI 3.0 Specification (JSON)</a></li>
  <li><a href="/openapi.yaml">OpenAPI Specification (YAML)</a></li>
  <li><a href="/docs">Full Public API Documentation</a></li>
  <li><a href="/pricing.md">Pricing & Plan Breakdown (pricing.md)</a></li>
  <li><a href="/.well-known/api-catalog">RFC 9727 API Catalog</a></li>
  <li><a href="/llms.txt">AI Agent Instructions (llms.txt)</a></li>
</ul>"""

write_page("developers", "HMorix Developer Portal, API Keys & Sandbox", "The official HMorix developer portal: OpenAPI 3.0 specs, API keys, interactive sandbox, quickstarts, and CLI tools.", dev_html, dev_md)

# ================= DOCS =================
docs_md = """# HMorix Public API Documentation & Endpoint Reference

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
curl -s -X POST https://hmorix.in/api/ai/chat \\
  -H "Content-Type: application/json" \\
  -d '{"message": "What is BillingFlow and how does it calculate GST?"}'
```

### Submit Lead Inquiry: `POST /api/contact`
Generates a new CRM deal and notifies regional project triage.
```bash
curl -s -X POST https://hmorix.in/api/contact \\
  -H "Content-Type: application/json" \\
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
"""

docs_html = """<p style="color:#C8FF00;font-family:monospace;font-size:14px;margin-bottom:8px;">API REFERENCE</p>
<h1>HMorix Public API Documentation & Endpoint Reference</h1>
<p style="font-size:18px;color:#bbb;line-height:1.6;margin-bottom:30px;">
  Comprehensive documentation for the HMorix REST API. Designed for developers, autonomous AI agents, and enterprise integrations.
</p>

<h2>Authentication</h2>
<p>
  Include your API key via Bearer token: <code>Authorization: Bearer &lt;HMORIX_API_KEY&gt;</code>. Alternatively, browser sessions use signed HTTP-only cookies (<code>hm_session</code>).
</p>

<h2>Core API Endpoints</h2>
<ul>
  <li><strong>GET /api/health:</strong> System health and database connectivity probe.</li>
  <li><strong>GET /api/status:</strong> Live component uptime, latency, and incident reports.</li>
  <li><strong>GET /api/services:</strong> Active software packages and base pricing.</li>
  <li><strong>POST /api/contact:</strong> Business inquiries and automated CRM lead generation.</li>
  <li><strong>POST /api/ai/chat:</strong> AI workflow execution and LLM inference.</li>
  <li><strong>GET /api/blogs:</strong> Paginated engineering articles and updates.</li>
  <li><strong>GET /api/account/api-keys:</strong> List authenticated API access keys.</li>
</ul>

<h2>OpenAPI Specification</h2>
<p>
  Download the machine-readable schema for your tool calling pipeline: <a href="/openapi.json">openapi.json</a> or <a href="/openapi.yaml">openapi.yaml</a>.
</p>
<p style="margin-top:30px;">
  <a href="/developers" class="btn">Open Developer Portal</a>
</p>"""

write_page("docs", "HMorix Public API Documentation & Endpoint Reference", "Complete public REST API reference for HMorix: endpoints, authentication, request examples, and response schemas.", docs_html, docs_md)

print("All trust anchor and developer pages generated successfully!")
