import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Check, ExternalLink, ShieldCheck, Lock, Globe, FileText, ArrowRight, Code, Key, Terminal, FileCheck } from 'lucide-react'
import SEOHead from '../../components/seo/SEOHead'
import { config } from '../../lib/config'

interface Endpoint {
  method: 'GET' | 'POST'
  path: string
  category: 'Authentication' | 'Invoices' | 'Agreements & Notarization' | 'Clients' | 'Analytics'
  auth: 'Public' | 'JWT'
  summary: string
  description: string
  requestPayload?: string
  responsePayload: string
  statusNotes: string[]
}

export default function BillingFlowAPI() {
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const baseUrl = 'https://api.billingflow.hmorix.in'
  const appUrl = config.billingFlowUrl || 'https://billingflow.hmorix.in'

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }).catch(() => null)
  }

  const endpoints: Endpoint[] = [
    {
      method: 'POST',
      path: '/api/auth/register',
      category: 'Authentication',
      auth: 'Public',
      summary: 'Register a new multi-tenant organization and administrator user.',
      description: 'Creates a new tenant workspace and returns an authorization JWT bearer token alongside the organization record.',
      requestPayload: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        password: "StrongPassword123!",
        companyName: "Acme Technologies LLC"
      }, null, 2),
      responsePayload: JSON.stringify({
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl84OWExMmMiLCJvcmc... [JWT]",
        user: {
          id: "usr_89a12c",
          name: "John Doe",
          email: "john@example.com",
          role: "admin",
          isVerified: false
        },
        organization: {
          id: "org_55f89a",
          name: "Acme Technologies LLC",
          subscriptionPlan: "free",
          subscriptionStatus: "active"
        }
      }, null, 2),
      statusNotes: [
        "200: Organization registered successfully with active JWT token.",
        "400: Missing required parameters or email already registered."
      ]
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      category: 'Authentication',
      auth: 'Public',
      summary: 'Authenticate with email & password to obtain a bearer JWT session token.',
      description: 'Verifies administrator credentials and generates an authenticated JWT token for all subsequent requests.',
      requestPayload: JSON.stringify({
        email: "john@example.com",
        password: "StrongPassword123!"
      }, null, 2),
      responsePayload: JSON.stringify({
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl84OWExMmMi... [JWT]",
        user: {
          id: "usr_89a12c",
          name: "John Doe",
          email: "john@example.com",
          role: "admin"
        }
      }, null, 2),
      statusNotes: [
        "200: Session initialized successfully.",
        "401: Invalid email or password."
      ]
    },
    {
      method: 'GET',
      path: '/api/invoices',
      category: 'Invoices',
      auth: 'JWT',
      summary: 'Retrieve all invoices for the authenticated organization.',
      description: 'Returns a complete paginated array of tenant invoices with client details, tax breakdowns, and payment statuses.',
      responsePayload: JSON.stringify([
        {
          id: "inv_49a01b",
          invoice_number: "INV-2026-0001",
          client_name: "Acme Corp",
          issue_date: "2026-08-21",
          due_date: "2026-09-20",
          status: "sent",
          currency: "INR",
          tax_rate: 18,
          discount: 0,
          items: [
            {
              description: "Cloud Architecture Setup",
              quantity: 1,
              unit_price: 50000
            }
          ]
        }
      ], null, 2),
      statusNotes: [
        "200: List of tenant invoices.",
        "401: Unauthorized or missing token."
      ]
    },
    {
      method: 'POST',
      path: '/api/invoices',
      category: 'Invoices',
      auth: 'JWT',
      summary: 'Create a new invoice with line items, tax rate, and currency.',
      description: 'Generates a numbered invoice record with calculated GST sub-totals and creates a pending receivable.',
      requestPayload: JSON.stringify({
        clientId: "cli_3840af",
        invoiceNumber: "INV-0089",
        issueDate: "2026-08-21",
        dueDate: "2026-09-21",
        taxRate: 18,
        discount: 1000,
        currency: "INR",
        notes: "Payment via NEFT/RTGS. GST 18% applied.",
        items: [
          {
            description: "Web Application Development",
            quantity: 40,
            unit_price: 1500
          },
          {
            description: "Database Tuning",
            quantity: 1,
            unit_price: 15000
          }
        ]
      }, null, 2),
      responsePayload: JSON.stringify({
        id: "inv_88b19a",
        invoice_number: "INV-0089",
        status: "draft",
        totalAmount: 87320,
        created_at: "2026-08-21T14:30:00Z"
      }, null, 2),
      statusNotes: [
        "201: Invoice created successfully.",
        "400: Invalid input fields or missing client ID."
      ]
    },
    {
      method: 'GET',
      path: '/api/invoices/:id/pdf',
      category: 'Invoices',
      auth: 'JWT',
      summary: 'Export official styled invoice PDF with dynamic QR payment code.',
      description: 'Generates a high-resolution, cryptographic PDF document with UPI payment QR code, ready for email or WhatsApp dispatch.',
      responsePayload: 'Binary Stream: application/pdf\n(Content-Disposition: attachment; filename="Invoice_INV-0089.pdf")',
      statusNotes: [
        "200: PDF stream returned.",
        "404: Invoice ID not found."
      ]
    },
    {
      method: 'POST',
      path: '/api/agreements/public',
      category: 'Agreements & Notarization',
      auth: 'Public',
      summary: 'Generate a legally sealed digital agreement (e-Stamp & SHA-256 fingerprint).',
      description: 'Public unauthenticated endpoint to execute contracts (e.g. "Work First, Pay Later"). Seals terms with SHA-256 hash, jurisdiction, and geolocation coordinates.',
      requestPayload: JSON.stringify({
        title: "Work First, Pay Later Agreement",
        agreementType: "Work First Pay Later",
        firstPartyName: "HMorix Tech Solutions",
        firstPartyContact: "+91 9876543210",
        secondPartyName: "Apex Enterprises LLC",
        secondPartyContact: "+91 9123456780",
        totalAmount: 45000,
        currency: "INR",
        validityPeriod: "30 Days",
        paymentTerms: "100% due within 7 days of delivery",
        termsContent: "Binding legal terms in Hindi and English...",
        stateJurisdiction: "Delhi, India",
        stampDutyAmount: 100,
        geoLat: 28.6139,
        geoLng: 77.2090,
        geoAddress: "New Delhi, DL, India"
      }, null, 2),
      responsePayload: JSON.stringify({
        id: "agr_99b01a",
        agreement_number: "HM-AGR-881920",
        digital_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        status: "executed",
        verification_url: "https://billingflow.hmorix.in/verify/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      }, null, 2),
      statusNotes: [
        "201: Agreement legally signed and sealed with SHA-256 digital fingerprint.",
        "400: Missing required contract terms or party names."
      ]
    },
    {
      method: 'GET',
      path: '/api/agreements/verify/:hash',
      category: 'Agreements & Notarization',
      auth: 'Public',
      summary: 'Public cryptographic validation endpoint for verifying agreement integrity.',
      description: 'Validates any digital contract against its immutable SHA-256 fingerprint and returns verified party details.',
      responsePayload: JSON.stringify({
        verified: true,
        message: "Official Legal Agreement Verified & Authenticated by HMorix Legal Infrastructure.",
        agreement: {
          agreementNumber: "HM-AGR-881920",
          title: "Work First, Pay Later Agreement",
          firstParty: "HMorix Tech Solutions",
          secondParty: "Apex Enterprises LLC",
          totalAmount: 45000,
          currency: "INR",
          digitalHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          geoAddress: "New Delhi, DL, India",
          executedAt: "2026-08-21T14:45:00Z"
        }
      }, null, 2),
      statusNotes: [
        "200: Document verified and authentic.",
        "404: Digital hash not found or document was altered."
      ]
    },
    {
      method: 'GET',
      path: '/api/agreements/:id/pdf',
      category: 'Agreements & Notarization',
      auth: 'Public',
      summary: 'Download signed PDF with simulated Indian e-Stamp Paper header and QR code.',
      description: 'Renders an official judicial e-Stamp paper certificate with state emblems, QR verification, and cryptographic hash footer.',
      responsePayload: 'Binary Stream: application/pdf\n(Content-Disposition: attachment; filename="Agreement_HM-AGR-881920.pdf")',
      statusNotes: [
        "200: Signed e-Stamp PDF stream.",
        "404: Agreement ID not found."
      ]
    },
    {
      method: 'GET',
      path: '/api/clients',
      category: 'Clients',
      auth: 'JWT',
      summary: 'Fetch client contact and billing directory.',
      description: 'Returns customer profiles with corporate GSTIN/tax IDs and contact information.',
      responsePayload: JSON.stringify([
        {
          id: "cli_3840af",
          name: "Jane Smith",
          email: "jane@acme.com",
          company_name: "Acme Corp",
          tax_id: "US87654321",
          phone: "+1 555 0192",
          address: "100 Broadway, New York, NY"
        }
      ], null, 2),
      statusNotes: [
        "200: Client records retrieved.",
        "401: Unauthorized access."
      ]
    },
    {
      method: 'POST',
      path: '/api/clients',
      category: 'Clients',
      auth: 'JWT',
      summary: 'Register a new customer profile.',
      description: 'Creates a verified customer ledger entry with GSTIN and billing address.',
      requestPayload: JSON.stringify({
        name: "Rohan Sharma",
        email: "rohan@enterprise.in",
        companyName: "Sharma & Sons Ltd",
        taxId: "07AAAAA0000A1Z5",
        phone: "+91 9811122233",
        address: "Sector 62, Noida, UP 201309, India"
      }, null, 2),
      responsePayload: JSON.stringify({
        id: "cli_91a02c",
        name: "Rohan Sharma",
        created_at: "2026-08-21T14:50:00Z"
      }, null, 2),
      statusNotes: [
        "201: Client profile registered successfully.",
        "400: Validation error or duplicate email."
      ]
    },
    {
      method: 'GET',
      path: '/api/analytics/dashboard',
      category: 'Analytics',
      auth: 'JWT',
      summary: 'Fetch monthly collections, MRR, balance due, and status distribution.',
      description: 'Real-time financial roll-up providing total revenue, overdue receivables, and status breakdowns.',
      responsePayload: JSON.stringify({
        totalRevenue: 345000,
        totalPending: 85000,
        totalOverdue: 25000,
        totalInvoicesCount: 42,
        counts: {
          draft: 5,
          sent: 12,
          paid: 23,
          overdue: 2
        }
      }, null, 2),
      statusNotes: [
        "200: Real-time analytics summary returned.",
        "401: Unauthorized."
      ]
    }
  ]

  const categories = ['All', 'Authentication', 'Invoices', 'Agreements & Notarization', 'Clients', 'Analytics']

  const filtered = endpoints.filter(ep => {
    const matchesCat = activeCategory === 'All' || ep.category === activeCategory
    const matchesSearch = searchQuery === '' ||
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  const generateCurl = (ep: Endpoint) => {
    let cmd = `curl -s -X ${ep.method} "${baseUrl}${ep.path}"`
    if (ep.auth === 'JWT') {
      cmd += ` \\\n  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"`
    }
    if (ep.requestPayload) {
      cmd += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${ep.requestPayload.replace(/\n/g, '').replace(/\s+/g, ' ')}'`
    }
    return cmd
  }

  return (
    <div className="pt-32 pb-20">
      <SEOHead
        title="BillingFlow REST API & Webhooks Documentation"
        description="Interact programmatically with Invoicing, Legal Agreements, e-Stamps, and Verification systems on BillingFlow."
        keywords="BillingFlow API, REST API, e-Stamp API, invoices API, legal agreements, billingflow.hmorix.in"
        canonical="/billingflow/api"
      />

      <div className="max-w-[1280px] mx-auto px-8">
        {/* Top Header Card */}
        <div className="p-8 bg-obsidian-2 border border-glass-border rounded-[20px] mb-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="label-mono">BillingFlow / Developer Platform</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#C8FF00]/10 text-[#C8FF00] border border-[#C8FF00]/20">
                  Enterprise Tier
                </span>
                <span className="text-xs text-cream/40 font-mono">
                  Organization: HMorix &bull; Lead: Harsh (hmorix.in@gmail.com)
                </span>
              </div>
              <h1 className="section-title text-3xl md:text-4xl mb-3">REST API &amp; Webhook Documentation</h1>
              <p className="text-cream/60 text-base max-w-[720px] leading-relaxed">
                Interact programmatically with Invoicing, Legal Agreements, Indian e-Stamps, and Cryptographic Verification systems.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start md:items-end gap-3">
              <a
                href={appUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-xs px-5 py-3 flex items-center gap-2 font-semibold shadow-[0_0_20px_rgba(200,255,0,0.2)]"
              >
                <span>Launch Web App</span>
                <ExternalLink size={13} />
              </a>
              <Link to="/billingflow" className="btn-outline text-xs px-4 py-3">
                Product Overview
              </Link>
            </div>
          </div>

          {/* Base URL Box */}
          <div className="mt-8 p-4 bg-obsidian border border-glass-border rounded-[10px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-cream/40 uppercase tracking-wider">Base URL:</span>
              <span className="text-[#C8FF00] font-semibold">{baseUrl}</span>
            </div>
            <button
              onClick={() => copyToClipboard(baseUrl, 'base-url')}
              className="text-xs text-cream/60 hover:text-cream px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] rounded-[6px] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              {copiedId === 'base-url' ? <Check size={13} className="text-[#C8FF00]" /> : <Copy size={13} />}
              <span>{copiedId === 'base-url' ? 'Copied' : 'Copy Base URL'}</span>
            </button>
          </div>
        </div>

        {/* Sub-nav Links */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8 p-1.5 bg-obsidian-2 border border-glass-border rounded-[10px]">
          <div className="flex gap-2 flex-wrap">
            <Link to="/billingflow" className="px-4 py-2 text-sm font-medium text-cream/50 hover:text-cream rounded-[6px]">Overview</Link>
            <Link to="/billingflow/features" className="px-4 py-2 text-sm font-medium text-cream/50 hover:text-cream rounded-[6px]">Features</Link>
            <Link to="/billingflow/pricing" className="px-4 py-2 text-sm font-medium text-cream/50 hover:text-cream rounded-[6px]">Pricing</Link>
            <Link to="/billingflow/docs" className="px-4 py-2 text-sm font-medium text-cream/50 hover:text-cream rounded-[6px]">Docs</Link>
            <Link to="/billingflow/api" className="px-4 py-2 text-sm font-medium bg-[#C8FF00]/10 text-[#C8FF00] rounded-[6px]">API &amp; Docs</Link>
            <Link to="/billingflow/demo" className="px-4 py-2 text-sm font-medium text-cream/50 hover:text-cream rounded-[6px]">Demo</Link>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-[#C8FF00] text-obsidian font-semibold shadow-[0_0_12px_rgba(200,255,0,0.3)]'
                    : 'bg-obsidian-2 border border-glass-border text-cream/60 hover:text-cream hover:border-[#C8FF00]/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by endpoint path or name..."
            className="px-4 py-2 bg-obsidian-2 border border-glass-border rounded-[8px] text-xs text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30 min-w-[260px]"
          />
        </div>

        {/* Endpoint Cards List */}
        <div className="space-y-6">
          {filtered.map((ep, i) => {
            const curlCmd = generateCurl(ep)
            const curlKey = `curl-${i}`

            return (
              <div key={i} className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] hover:border-glass-border/80 transition-all">
                {/* Endpoint Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-glass-border">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-[6px] text-xs font-mono font-bold ${
                      ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-sm md:text-base font-semibold text-cream">{ep.path}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider ${
                      ep.auth === 'Public' ? 'bg-white/[0.06] text-cream/60' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {ep.auth === 'Public' ? 'Public Endpoint' : 'Auth Required (JWT)'}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(curlCmd, curlKey)}
                    className="text-xs text-cream/70 hover:text-[#C8FF00] px-3 py-1.5 bg-obsidian border border-glass-border hover:border-[#C8FF00]/40 rounded-[6px] flex items-center gap-1.5 transition-colors self-start sm:self-auto font-mono"
                  >
                    {copiedId === curlKey ? <Check size={12} className="text-[#C8FF00]" /> : <Terminal size={12} />}
                    <span>{copiedId === curlKey ? 'cURL Copied' : 'Copy cURL'}</span>
                  </button>
                </div>

                {/* Summary */}
                <div className="mt-4 mb-4">
                  <p className="text-sm font-medium text-cream mb-1">{ep.summary}</p>
                  <p className="text-xs text-cream/50 leading-relaxed">{ep.description}</p>
                </div>

                {/* Payloads Grid */}
                <div className={`grid grid-cols-1 ${ep.requestPayload ? 'lg:grid-cols-2' : ''} gap-4 mb-4`}>
                  {ep.requestPayload && (
                    <div>
                      <div className="text-[11px] font-mono text-cream/40 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                        <span>Request Input Payload (application/json)</span>
                        <button
                          onClick={() => copyToClipboard(ep.requestPayload!, `req-${i}`)}
                          className="text-cream/40 hover:text-cream"
                        >
                          {copiedId === `req-${i}` ? <Check size={11} className="text-[#C8FF00]" /> : <Copy size={11} />}
                        </button>
                      </div>
                      <pre className="p-4 bg-obsidian border border-glass-border rounded-[8px] font-mono text-xs text-cream/80 overflow-x-auto leading-relaxed max-h-[260px]">
                        <code>{ep.requestPayload}</code>
                      </pre>
                    </div>
                  )}

                  <div>
                    <div className="text-[11px] font-mono text-cream/40 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                      <span>Response Output Outcome</span>
                      <button
                        onClick={() => copyToClipboard(ep.responsePayload, `res-${i}`)}
                        className="text-cream/40 hover:text-cream"
                      >
                        {copiedId === `res-${i}` ? <Check size={11} className="text-[#C8FF00]" /> : <Copy size={11} />}
                      </button>
                    </div>
                    <pre className="p-4 bg-obsidian border border-glass-border rounded-[8px] font-mono text-xs text-cream/80 overflow-x-auto leading-relaxed max-h-[260px]">
                      <code>{ep.responsePayload}</code>
                    </pre>
                  </div>
                </div>

                {/* Status Notes */}
                <div className="pt-3 border-t border-glass-border/60 flex flex-wrap gap-2 text-xs font-mono">
                  {ep.statusNotes.map((note, idx) => (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 rounded-[4px] ${
                        note.startsWith('200') || note.startsWith('201')
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

