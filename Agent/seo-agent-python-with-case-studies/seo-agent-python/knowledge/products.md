# HMorix Products & Core SaaS Ecosystem

This file serves as the definitive source of truth for all HMorix SaaS products, multi-portal platforms, and enterprise solutions. The AI agent must accurately represent these capabilities, modules, and target use cases.

---

## 1. Enterprise HRM (Human Resource Management)

### Overview
A comprehensive, end-to-end workforce management and human capital platform built for growing enterprises, multi-branch corporations, and regional industries.

### Core Modules & Capabilities
- **Multi-Branch Organizational Hierarchy:** Manage regional branches (e.g. Hathras, Agra, Mathura, Delhi NCR) with departmental silos and role delegations.
- **Biometric & Geo-Fenced Attendance:** Real-time clock-in/clock-out, shift scheduling, late-entry policies, and mobile GPS check-ins.
- **Multi-Tiered Leave Approval Workflows:** Customizable leave categories (Casual, Sick, Earned, Maternity, Unpaid), quota tracking, and hierarchical approvals (Employee -> Manager -> HR).
- **Statutory Indian Payroll Processing:**
  - Automated calculation of Provident Fund (PF), Employee State Insurance (ESI), Professional Tax (PT), and Tax Deducted at Source (TDS).
  - One-click monthly payroll runs, salary slip generation, and direct bank disbursement export formats.
- **Talent Acquisition & ATS Pipeline:** Job requisition creation, resume parsing, candidate scoring, interview stage tracking (`applied` -> `screening` -> `interview` -> `offered` -> `hired`), and automated offer letter generation.
- **Performance Appraisals (OKR/KPI):** 360-degree reviews, goal setting, manager ratings, and promotion cycle audits.

### Target Audiences
- Regional manufacturing units, factories, hospitality chains, hospitals/clinics, educational institutions, retail chains, and IT services firms (50 to 5,000+ employees).

---

## 2. BillingFlow 2.0 (Automated Invoicing & GST Engine)

### Overview
Automated business billing, subscription recurring billing, and GST-compliant tax invoicing platform designed to eliminate manual billing errors and accelerate cash flow.

### Core Modules & Capabilities
- **GST Compliant Invoicing:** Auto-calculates CGST, SGST, IGST based on client state and HSN/SAC codes with reverse charge mechanism support.
- **Automated PDF Engine:** Generates downloadable, print-ready, professional branded PDF invoices instantly upon order completion or milestone approval.
- **Recurring Subscriptions & Milestones:** Automated billing cycles (monthly, quarterly, annual, milestone-based) with automatic late payment reminders.
- **Client Ledger & Reconciliation:** Complete financial statement tracking, payment receipts, outstanding balances, and credit notes.
- **Direct Integration:** Seamless connection with HMorix Client Portal and CRM deals (`closed_won` automatically triggers project invoice).

### Target Audiences
- B2B SaaS businesses, consulting agencies, wholesale traders, service providers, freelance networks, and retail vendors.

---

## 3. HMorix CRM (Customer Relationship Management)

### Overview
High-velocity sales pipeline and contact relationship management system engineered to convert leads into long-term enterprise contracts.

### Core Modules & Capabilities
- **Lead Capture & Contact Management:** Centralized database of contacts, organizations, decision-makers, and interaction history.
- **Deal Stage Progression:** Visual kanban tracking from `lead` -> `qualified` -> `proposal` -> `negotiation` -> `closed_won` -> `closed_lost`.
- **Revenue Forecasting & Pipeline Velocity:** Real-time analytics on expected monthly close revenue, conversion win rates, and stage drop-offs.
- **Automated Hand-off:** Won deals immediately trigger client onboarding, initial milestone invoice in BillingFlow, and operational ticketing.

### Target Audiences
- B2B sales teams, agency account managers, real estate developers, and corporate service providers.

---

## 4. Field Sales Portal

### Overview
Mobile-optimized portal for on-ground sales executives visiting regional businesses across target territories (Hotels, Hospitals, Retail, Restaurants, Factories).

### Core Modules & Capabilities
- **On-the-Spot Lead Entry:** Instant capture of business details, decision-maker WhatsApp/phone, industry type, and estimated budget.
- **GPS Location Tagging:** Validates field visit check-ins with geo-coordinates.
- **Live CRM Sync:** Instant pipeline reflection so headquarters managers can assign follow-up tasks in real-time.
- **Territory Analytics:** Tracks field rep performance across regional corridors (Agra, Hathras, Mathura, Aligarh, NCR).

---

## 5. Employee Self-Service (ESS) Portal

### Overview
A dedicated, clean portal for staff members to manage their daily work life without burdening HR staff.

### Core Capabilities
- **One-Tap Clock-in/Clock-out:** With location and timestamp logging.
- **Personal Leave Manager:** View leave balances, submit leave requests with reason, and track approval status.
- **Payslips & Tax Documents:** Instant download of monthly PDF payslips and tax withholding summaries.
- **Task & Project Board:** View delegated tasks, update completion status, and record notes.
- **Corporate Documents Vault:** Secure access to employee handbook, company policies, and training material.

---

## 6. Manager Portal (MSS - Manager Self-Service)

### Overview
Operational control center for team leaders, department heads, and project managers.

### Core Capabilities
- **Team Workload Assembly:** View real-time availability, clock-in status, and current task distribution.
- **Direct Leave Triage:** One-click approve or reject leave requests with manager feedback.
- **Employee Performance Scoring:** Monthly evaluation scoring across delivery quality, punctuality, and peer collaboration.
- **Support Ticket Escalation:** Manage client tickets assigned to the manager's team.

---

## 7. Client / Customer Portal

### Overview
Transparent, branded portal provided to HMorix clients to monitor progress and handle account operations.

### Core Capabilities
- **Real-Time Project Milestones:** Interactive timeline of active deliverables and launch targets.
- **Billing & Invoice Center:** View all past and outstanding invoices, download receipts, and pay online.
- **Support Ticketing (`TKT-XXXXXX`):** Submit priority tickets with file attachments and track engineering resolution in real-time.
- **API & Access Tokens:** Generate and rotate production and sandbox API keys for developer integrations.

---

## 8. HMorix AI Agent & SEO Master

### Overview
Autonomous AI software suite integrating NVIDIA NIM enterprise LLMs for content strategy, marketing automation, and business intelligence.

### Core Capabilities
- **Interactive SEO Master Chat:** ChatGPT/Claude-style conversational workspace featuring:
  - Multi-step Chain-of-Thought thinking display.
  - Interactive clarifying questions to pinpoint audience and search intent.
  - Automatic discovery of high-intent **long-tail keywords** and LSI semantic clusters.
  - Publication-ready generation of Blogs, Case Studies, Whitepapers, Press Releases, and SEO Content Audits.
  - Direct pipeline draft saving to the approval staging queue.
- **NVIDIA NIM Integration:** Powered by `meta/llama-4-maverick-17b`, `llama-3.3-nemotron-super-49b`, and `llama-3.1-70b` models with automatic fallback resilience.

---

## 9. PDF Automation Suite

### Overview
High-throughput document generation engine for enterprise compliance, legal paperwork, and transactional receipts.

### Core Capabilities
- Offer letters, joining kits, appointment orders with dynamic company letterhead.
- ReportLab-backed binary generation with embedded vector diagrams and clickable TOCs.
- Automated tax compliance and invoice dispatch.

---

## 10. Smart Home & IoT Solutions

### Overview
Hardware-software integrations for smart offices, industrial monitoring, and connected properties.

### Core Capabilities
- Remote environmental controls, security sensor logging, and smart power management.