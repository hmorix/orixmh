import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import SEOHead from '../../components/seo/SEOHead'
import { config } from '../../lib/config'

export default function BillingFlowPricing() {
  const appUrl = config.billingFlowUrl || 'https://billingflow.hmorix.in'

  return (
    <div className="pt-32 pb-20">
      <SEOHead
        title="BillingFlow Pricing & Plans"
        description="Simple and transparent pricing for BillingFlow. Start managing invoices and automated billing on billingflow.hmorix.in."
        keywords="BillingFlow pricing, invoice software cost, billing plans, billingflow.hmorix.in"
        canonical="/billingflow/pricing"
      />

      <div className="max-w-[1280px] mx-auto px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="label-mono">BillingFlow</span>
            <h1 className="section-title mt-2 mb-3">Pricing Plans</h1>
            <p className="text-lg text-cream/60 max-w-[600px]">Transparent pricing with automated GST invoicing and multi-currency billing.</p>
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
          <Link to="/billingflow/pricing" className="px-4 py-2 text-sm font-medium bg-[#C8FF00]/10 text-[#C8FF00] rounded-[4px]">Pricing</Link>
          <Link to="/billingflow/docs" className="px-4 py-2 text-sm font-medium text-cream/50 hover:text-cream rounded-[4px]">Docs</Link>
          <Link to="/billingflow/demo" className="px-4 py-2 text-sm font-medium text-cream/50 hover:text-cream rounded-[4px]">Demo</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { plan: 'Starter', price: '₹1,999', period: '/month', desc: 'For freelancers and boutique agencies', features: ['Up to 100 invoices / month','Razorpay & Stripe integration','GST (CGST/SGST/IGST) engine','Email & PDF dispatch','Single user access'], cta: 'Get Started on billingflow.hmorix.in', href: appUrl },
            { plan: 'Professional', price: '₹4,999', period: '/month', desc: 'For growing regional enterprises', features: ['Unlimited invoices & clients','All payment gateways + UPI QR','Automated WhatsApp reminders','Priority reconciliation','10 team member seats','Custom domain & branding','Full REST API access'], cta: 'Start Free on billingflow.hmorix.in', href: appUrl, featured: true },
            { plan: 'Enterprise', price: 'Custom', period: '', desc: 'For high-throughput organizations', features: ['Everything in Professional','Dedicated account manager','Custom ERP/accounting integration','99.99% uptime SLA guarantee','On-premise / hybrid deployment','White-label customer portals'], cta: 'Contact Enterprise Sales', href: '/contact' },
          ].map((plan, i) => (
            <div key={i} className={`p-8 border rounded-[24px] relative flex flex-col justify-between ${plan.featured ? 'border-[rgba(200,255,0,0.4)] bg-obsidian-3 shadow-[0_0_30px_rgba(200,255,0,0.1)]' : 'border-glass-border bg-obsidian-2'}`}>
              <div>
                {plan.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#C8FF00] text-obsidian text-xs font-bold rounded-full">Most Popular</div>}
                <div className="font-mono text-xs text-[#C8FF00] mb-2">{plan.plan.toUpperCase()}</div>
                <div className="font-display text-4xl font-bold tracking-tight mb-1">{plan.price}<span className="text-base font-normal text-cream/35">{plan.period}</span></div>
                <p className="text-sm text-cream/50 mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-cream/60 border-b border-glass-border/50 pb-2"><span className="text-[#C8FF00]">✓</span>{f}</li>
                  ))}
                </ul>
              </div>
              <a
                href={plan.href}
                target={plan.href.startsWith('http') ? '_blank' : undefined}
                rel={plan.href.startsWith('http') ? 'noreferrer' : undefined}
                className={`w-full py-3 rounded-[6px] font-display font-semibold text-sm transition-all text-center flex items-center justify-center gap-1.5 ${
                  plan.featured ? 'bg-[#C8FF00] text-obsidian hover:opacity-90' : 'border border-glass-border text-cream hover:border-[#C8FF00] hover:text-[#C8FF00]'
                }`}
              >
                <span>{plan.cta}</span>
                {plan.href.startsWith('http') && <ExternalLink size={13} />}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
