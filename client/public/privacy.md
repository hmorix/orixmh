# HMorix Privacy Policy & Data Governance Charter

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
