import { useState } from 'react'
import { Play, FileText, Send, CheckCircle, ExternalLink } from 'lucide-react'
import SEOHead from '../../components/seo/SEOHead'
import { config } from '../../lib/config'

export default function BillingFlowDemo() {
  const [step, setStep] = useState(0)
  const appUrl = config.billingFlowUrl || 'https://billingflow.hmorix.in'

  return (
    <div className="pt-32 pb-20">
      <SEOHead
        title="BillingFlow Interactive Demo – Try Invoicing"
        description="Try the interactive BillingFlow invoicing demo or launch the full application at billingflow.hmorix.in."
        keywords="BillingFlow demo, invoice generator, try BillingFlow, billingflow.hmorix.in"
        canonical="/billingflow/demo"
      />

      <div className="max-w-[1280px] mx-auto px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="label-mono">BillingFlow / Demo</span>
            <h1 className="section-title mt-2 mb-3">Try BillingFlow</h1>
            <p className="text-lg text-cream/60 max-w-[600px]">Create and test a professional invoice in under 60 seconds.</p>
          </div>
          <a
            href={appUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5 w-fit"
          >
            <span>Launch Live App</span>
            <ExternalLink size={13} />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
          {/* Demo Form */}
          <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
            <div className="flex items-center gap-2 mb-6">
              {[0,1,2].map(s => (
                <div key={s} className={`flex-1 h-1 rounded-full ${step >= s ? 'bg-[#C8FF00]' : 'bg-white/[0.06]'}`} />
              ))}
            </div>

            {step === 0 && (
              <div className="space-y-4">
                <h3 className="font-display font-semibold">Step 1: Client Details</h3>
                <div><label className="block text-xs text-cream/40 mb-1">Client Name</label><input type="text" defaultValue="Acme Corp" className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00]" /></div>
                <div><label className="block text-xs text-cream/40 mb-1">Client Email</label><input type="email" defaultValue="billing@acme.com" className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00]" /></div>
                <button onClick={() => setStep(1)} className="btn-primary w-full">Next: Add Items</button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-display font-semibold">Step 2: Invoice Items</h3>
                <div className="p-3 bg-white/[0.02] border border-glass-border rounded-[8px]">
                  <div className="grid grid-cols-[1fr_80px_80px] gap-2 text-xs text-cream/40 mb-2"><span>Description</span><span>Qty</span><span>Price</span></div>
                  <div className="grid grid-cols-[1fr_80px_80px] gap-2">
                    <input type="text" defaultValue="Web Development" className="px-2 py-1.5 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none" />
                    <input type="number" defaultValue="1" className="px-2 py-1.5 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none" />
                    <input type="text" defaultValue="$4,200" className="px-2 py-1.5 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none" />
                  </div>
                </div>
                <button className="text-xs text-[#C8FF00]">+ Add another item</button>
                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="btn-outline flex-1">Back</button>
                  <button onClick={() => setStep(2)} className="btn-primary flex-1">Generate Invoice</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="text-center py-8">
                <CheckCircle size={48} className="text-[#C8FF00] mx-auto mb-4" />
                <h3 className="font-display font-semibold text-xl mb-2">Invoice Generated!</h3>
                <p className="text-sm text-cream/50 mb-6">INV-DEMO-001 has been created and is ready to send.</p>
                <div className="flex gap-3 justify-center mb-6">
                  <button className="btn-primary flex items-center gap-2"><Send size={14} /> Send Invoice</button>
                  <button className="btn-outline flex items-center gap-2"><FileText size={14} /> Download PDF</button>
                </div>
                <div className="p-4 bg-obsidian border border-glass-border rounded-[10px] text-left">
                  <div className="text-xs font-mono text-[#C8FF00] mb-1">Production Platform</div>
                  <div className="text-sm text-cream/80 mb-3">Want automated GST tax handling, recurring invoices, and live payment tracking?</div>
                  <a
                    href={appUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary text-xs w-full py-2.5 flex items-center justify-center gap-1.5 font-semibold"
                  >
                    <span>Launch Full App at billingflow.hmorix.in</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
                <button onClick={() => setStep(0)} className="text-xs text-cream/30 mt-4 hover:text-cream">Start over</button>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="p-6 bg-white/[0.02] border border-glass-border rounded-[16px]">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs text-cream/40">Live Preview</span>
              <Play size={14} className="text-[#C8FF00]" />
            </div>
            <div className="bg-white rounded-[8px] p-6 text-obsidian">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="font-display font-bold text-lg">INVOICE</div>
                  <div className="text-xs text-gray-500">INV-DEMO-001</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold">HMorix</div>
                  <div className="text-xs text-gray-500">hmorix.in</div>
                </div>
              </div>
              <div className="mb-6">
                <div className="text-xs text-gray-400 mb-1">Bill To:</div>
                <div className="font-semibold text-sm">Acme Corp</div>
                <div className="text-xs text-gray-500">billing@acme.com</div>
              </div>
              <table className="w-full text-xs mb-6">
                <thead><tr className="border-b border-gray-200"><th className="text-left py-2">Description</th><th className="text-right py-2">Qty</th><th className="text-right py-2">Amount</th></tr></thead>
                <tbody><tr className="border-b border-gray-100"><td className="py-2">Web Development</td><td className="text-right py-2">1</td><td className="text-right py-2">$4,200.00</td></tr></tbody>
              </table>
              <div className="text-right">
                <div className="text-xs text-gray-400">Total Due</div>
                <div className="font-display font-bold text-xl">$4,200.00</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
