import { Link } from 'react-router-dom'
import { ExternalLink, ArrowRight, BookOpen, Terminal } from 'lucide-react'
import SEOHead from '../../components/seo/SEOHead'
import { config } from '../../lib/config'

export default function BillingFlowDocs() {
  const appUrl = config.billingFlowUrl || 'https://billingflow.hmorix.in'
  const baseUrl = 'https://api.billingflow.hmorix.com'

  return (
    <div className="pt-32 pb-20">
      <SEOHead
        title="BillingFlow Documentation & Developer Integration"
        description="Comprehensive developer documentation for BillingFlow. Learn how to authenticate, create invoices, execute digital agreements, and query analytics."
        keywords="BillingFlow docs, invoicing integration, billingflow.hmorix.in, API guide"
        canonical="/billingflow/docs"
      />

      <div className="max-w-[1280px] mx-auto px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="label-mono">BillingFlow</span>
            <h1 className="section-title mt-2 mb-3">Documentation</h1>
            <p className="text-lg text-cream/60 max-w-[600px]">Technical guides, authentication workflows, and REST API integration patterns.</p>
          </div>
          <a
            href={appUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5 w-fit"
          >
            <span>Launch Web App</span>
            <ExternalLink size={13} />
          </a>
        </div>

        <div className="flex gap-2 flex-wrap mb-12 p-1 bg-obsidian-2 border border-glass-border rounded-[8px] w-fit">
          <Link to="/billingflow" className="px-4 py-2 text-sm font-medium text-cream/50 hover:text-cream rounded-[4px]">Overview</Link>
          <Link to="/billingflow/features" className="px-4 py-2 text-sm font-medium text-cream/50 hover:text-cream rounded-[4px]">Features</Link>
          <Link to="/billingflow/pricing" className="px-4 py-2 text-sm font-medium text-cream/50 hover:text-cream rounded-[4px]">Pricing</Link>
          <Link to="/billingflow/docs" className="px-4 py-2 text-sm font-medium bg-[#C8FF00]/10 text-[#C8FF00] rounded-[4px]">Docs</Link>
          <Link to="/billingflow/api" className="px-4 py-2 text-sm font-medium text-cream/50 hover:text-cream rounded-[4px]">API &amp; Docs</Link>
          <Link to="/billingflow/demo" className="px-4 py-2 text-sm font-medium text-cream/50 hover:text-cream rounded-[4px]">Demo</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <nav className="space-y-1 sticky top-24">
              <div className="text-xs font-semibold text-cream/40 uppercase tracking-wider mb-2">Getting Started</div>
              <a href="#quickstart" className="block px-3 py-1.5 text-sm text-[#C8FF00] bg-[#C8FF00]/5 rounded-[4px]">Quick Start</a>
              <a href="#auth" className="block px-3 py-1.5 text-sm text-cream/50 hover:text-cream">Authentication</a>
              <div className="text-xs font-semibold text-cream/40 uppercase tracking-wider mb-2 mt-6">Core Modules</div>
              <Link to="/billingflow/api" className="block px-3 py-1.5 text-sm text-cream/50 hover:text-cream">Invoicing</Link>
              <Link to="/billingflow/api" className="block px-3 py-1.5 text-sm text-cream/50 hover:text-cream">e-Stamps &amp; Agreements</Link>
              <Link to="/billingflow/api" className="block px-3 py-1.5 text-sm text-cream/50 hover:text-cream">Client Directory</Link>
              <Link to="/billingflow/api" className="block px-3 py-1.5 text-sm text-cream/50 hover:text-cream">Analytics Dashboard</Link>
            </nav>
          </div>

          <div className="lg:col-span-3">
            {/* Quick Start Guide */}
            <div id="quickstart" className="p-8 bg-obsidian-2 border border-glass-border rounded-[16px] mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold">Quick Start cURL Guide</h2>
                <span className="text-xs font-mono text-[#C8FF00]">{baseUrl}</span>
              </div>
              <p className="text-sm text-cream/60 mb-6">Authenticate via email and password to receive your JWT bearer token for the organization.</p>
              <div className="bg-obsidian border border-glass-border rounded-[8px] p-4 font-mono text-xs leading-relaxed overflow-x-auto text-cream/80 mb-4">
                <div className="text-cream/40"># 1. Obtain session token</div>
                <div>curl -s -X POST "{baseUrl}/api/auth/login" \</div>
                <div className="pl-4">-H "Content-Type: application/json" \</div>
                <div className="pl-4">-d '{`{"email": "john@example.com", "password": "StrongPassword123!"}`}'</div>
                <div className="text-cream/40 mt-4"># 2. Fetch tenant invoices</div>
                <div>curl -s -X GET "{baseUrl}/api/invoices" \</div>
                <div className="pl-4">-H "Authorization: Bearer &lt;YOUR_TOKEN&gt;"</div>
              </div>
              <Link to="/billingflow/api" className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5">
                <span>View Full API &amp; Webhook Reference</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* API Endpoints Summary */}
            <div className="p-8 bg-obsidian-2 border border-glass-border rounded-[16px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold">Live Endpoints Overview</h2>
                <Link to="/billingflow/api" className="text-xs text-[#C8FF00] hover:underline font-mono">
                  Interactive Docs &rarr;
                </Link>
              </div>
              <div className="space-y-3">
                {[
                  { method: 'POST', path: '/api/auth/login', desc: 'Obtain JWT bearer session token' },
                  { method: 'GET', path: '/api/invoices', desc: 'List all tenant invoices' },
                  { method: 'POST', path: '/api/invoices', desc: 'Create a new invoice with GST breakdown' },
                  { method: 'GET', path: '/api/invoices/:id/pdf', desc: 'Export signed invoice PDF with dynamic QR' },
                  { method: 'POST', path: '/api/agreements/public', desc: 'Generate sealed Work First, Pay Later contract' },
                  { method: 'GET', path: '/api/agreements/verify/:hash', desc: 'Cryptographic SHA-256 agreement validation' },
                  { method: 'GET', path: '/api/agreements/:id/pdf', desc: 'Download official e-Stamp Paper certificate' },
                  { method: 'GET', path: '/api/clients', desc: 'Query client directory & tax profiles' },
                  { method: 'GET', path: '/api/analytics/dashboard', desc: 'Real-time MRR, pending balances, and counts' },
                ].map((ep, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white/[0.02] border border-glass-border rounded-[8px]">
                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-xs px-2 py-0.5 rounded font-bold ${ep.method === 'POST' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'}`}>{ep.method}</span>
                      <span className="font-mono text-xs text-[#C8FF00]">{ep.path}</span>
                    </div>
                    <span className="text-xs text-cream/50">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
