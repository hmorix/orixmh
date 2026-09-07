import { Link } from 'react-router-dom'
import { ExternalLink, ArrowRight, CheckCircle2, Shield, Zap, Sparkles, FileText } from 'lucide-react'
import SEOHead from '../../components/seo/SEOHead'
import { config } from '../../lib/config'

export default function BillingFlow() {
  const appUrl = config.billingFlowUrl || 'https://billingflow.hmorix.in'

  return (
    <div className="pt-32 pb-20">
      <SEOHead
        title="BillingFlow – Enterprise Invoicing & Payment Management Platform"
        description="BillingFlow by HMorix (billingflow.hmorix.in): Automated invoicing, multi-currency payment tracking, GST tax compliance, and seamless financial operations for modern businesses."
        keywords="BillingFlow, invoicing software, GST billing, billingflow.hmorix.in, payment automation, invoice generator, HMorix"
        canonical="/billingflow"
      />

      <div className="max-w-[1280px] mx-auto px-8">
        {/* Header */}
        <div className="max-w-[760px] mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#C8FF00]/10 border border-[rgba(200,255,0,0.25)] rounded-full w-fit">
              <span className="w-2 h-2 bg-[#C8FF00] rounded-full animate-pulse" />
              <span className="font-mono text-[0.68rem] text-[#C8FF00] tracking-wider">LIVE AT BILLINGFLOW.HMORIX.IN</span>
            </div>
            <a
              href={appUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-cream/60 hover:text-[#C8FF00] transition-colors flex items-center gap-1 font-mono"
            >
              billingflow.hmorix.in <ExternalLink size={12} />
            </a>
          </div>

          <h1 className="section-title mb-6">BillingFlow</h1>
          <p className="text-lg text-cream/60 leading-relaxed mb-8">
            The complete invoicing and payment management platform for modern businesses. Automate billing, track payments, generate GST-compliant tax invoices, and scale your financial operations.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href={appUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary text-sm px-6 py-3 flex items-center gap-2 shadow-[0_0_24px_rgba(200,255,0,0.25)] hover:shadow-[0_0_32px_rgba(200,255,0,0.4)] transition-all"
            >
              <span>Launch BillingFlow App</span>
              <ExternalLink size={15} />
            </a>
            <Link
              to="/billingflow/demo"
              className="btn-outline text-sm px-6 py-3 flex items-center gap-2"
            >
              <span>Interactive Demo</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-12 p-1.5 bg-obsidian-2 border border-glass-border rounded-[10px]">
          <div className="flex gap-2 flex-wrap">
            <Link to="/billingflow" className="px-4 py-2 text-sm font-medium bg-[#C8FF00]/10 text-[#C8FF00] rounded-[6px]">Overview</Link>
            <Link to="/billingflow/features" className="px-4 py-2 text-sm font-medium text-cream/50 hover:text-cream rounded-[6px] transition-colors">Features</Link>
            <Link to="/billingflow/pricing" className="px-4 py-2 text-sm font-medium text-cream/50 hover:text-cream rounded-[6px] transition-colors">Pricing</Link>
            <Link to="/billingflow/docs" className="px-4 py-2 text-sm font-medium text-cream/50 hover:text-cream rounded-[6px] transition-colors">Docs</Link>
            <Link to="/billingflow/demo" className="px-4 py-2 text-sm font-medium text-cream/50 hover:text-cream rounded-[6px] transition-colors">Demo</Link>
          </div>
          <a
            href={appUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 text-xs font-semibold bg-[#C8FF00] text-obsidian rounded-[6px] hover:opacity-90 transition-all flex items-center gap-1.5 font-mono"
          >
            <span>billingflow.hmorix.in</span>
            <ExternalLink size={13} />
          </a>
        </div>

        {/* Demo Visual Dashboard */}
        <div className="p-8 bg-obsidian-2 border border-glass-border rounded-[16px] mb-12 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="font-mono text-xs text-cream/50 ml-2">BillingFlow Live Production Dashboard</span>
            </div>
            <a
              href={appUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#C8FF00] hover:underline flex items-center gap-1 font-mono"
            >
              Open live dashboard <ExternalLink size={12} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-white/[0.04] border border-glass-border rounded-[8px]">
              <div className="text-xs text-cream/40 mb-1">Total Revenue</div>
              <div className="font-display text-2xl font-bold">₹8,42,100</div>
              <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
                <span>&uarr; 14.8% from last month</span>
              </div>
            </div>
            <div className="p-4 bg-white/[0.04] border border-glass-border rounded-[8px]">
              <div className="text-xs text-cream/40 mb-1">Pending Invoices</div>
              <div className="font-display text-2xl font-bold">23</div>
              <div className="text-xs text-yellow-400 mt-1">₹1,24,500 outstanding</div>
            </div>
            <div className="p-4 bg-white/[0.04] border border-glass-border rounded-[8px]">
              <div className="text-xs text-cream/40 mb-1">Paid This Month</div>
              <div className="font-display text-2xl font-bold">147</div>
              <div className="text-xs text-green-400 mt-1">98.4% collection rate</div>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { id: 'INV-2841', client: 'Meridian Enterprises', amount: '₹42,000', status: 'Paid', date: '04 Sep 2026' },
              { id: 'INV-2842', client: 'NovaTech Solutions', amount: '₹87,500', status: 'Pending', date: '05 Sep 2026' },
              { id: 'INV-2843', client: 'Apex Braj Exports', amount: '₹21,000', status: 'Paid', date: '06 Sep 2026' },
              { id: 'INV-2844', client: 'Stellar Logistics', amount: '₹1,50,000', status: 'Overdue', date: '01 Sep 2026' },
            ].map((inv, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-glass-border rounded-[8px] hover:border-[#C8FF00]/30 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-[#C8FF00] font-semibold">{inv.id}</span>
                  <span className="text-sm text-cream/90">{inv.client}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm">{inv.amount}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    inv.status === 'Paid' ? 'bg-green-500/15 text-green-400' :
                    inv.status === 'Pending' ? 'bg-yellow-500/15 text-yellow-400' :
                    'bg-red-500/15 text-red-400'
                  }`}>
                    {inv.status}
                  </span>
                  <span className="text-xs text-cream/40 font-mono hidden sm:inline">{inv.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Overview */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl font-bold">Comprehensive Capabilities</h2>
            <Link to="/billingflow/features" className="text-xs text-[#C8FF00] hover:underline flex items-center gap-1 font-mono">
              View all features &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Automated GST Invoicing', desc: 'Generate and send tax-compliant invoices with CGST, SGST, IGST, and HSN/SAC codes automatically calculated.' },
              { title: 'Real-time Payment Tracking', desc: 'Track settlement status via webhook reconciliations with automated WhatsApp and email reminders.' },
              { title: 'Multi-Currency & Global Gateways', desc: 'Support for INR (UPI/IMPS/NEFT), USD, EUR, and 135+ currencies with real-time conversion rates.' },
              { title: 'Cryptographic PDF Stream', desc: 'Generate tamper-proof, downloadable invoice PDFs with QR codes and digital signature support.' },
              { title: 'Client Self-Service Portal', desc: 'Empower clients to inspect ledger history, download official statements, and clear payments on billingflow.hmorix.in.' },
              { title: 'Predictive Cash Flow Analytics', desc: 'AI-driven revenue forecasting, aging debtor reports, and automated late-fee calculation.' },
            ].map((f, i) => (
              <div key={i} className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] hover:border-[#C8FF00]/30 transition-all group">
                <h3 className="font-display font-semibold mb-2 group-hover:text-[#C8FF00] transition-colors">{f.title}</h3>
                <p className="text-sm text-cream/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Deploy & Launch Banner */}
        <div className="p-8 bg-gradient-to-r from-obsidian-2 via-obsidian-2 to-[#C8FF00]/10 border border-glass-border rounded-[20px] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#C8FF00]">
              <Sparkles size={14} />
              <span>PRODUCTION WEB APP AVAILABLE NOW</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-cream">Experience BillingFlow at billingflow.hmorix.in</h3>
            <p className="text-sm text-cream/60 max-w-[620px]">
              Access the dedicated BillingFlow application directly at its official subdomain to manage clients, issue automated bills, and streamline receivables.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href={appUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary text-sm px-6 py-3.5 flex items-center gap-2 font-semibold"
            >
              <span>Open billingflow.hmorix.in</span>
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

