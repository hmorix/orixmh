import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, FileText, Send, CheckCircle, ExternalLink, Plus, Trash2, Printer, Download, Share2, Check, RefreshCw, Sparkles, QrCode, ArrowRight, Loader2 } from 'lucide-react'
import SEOHead from '../../components/seo/SEOHead'
import { config } from '../../lib/config'

interface LineItem {
  id: string
  description: string
  quantity: number
  price: number
}

export default function BillingFlowDemo() {
  const [step, setStep] = useState(0)
  const appUrl = config.billingFlowUrl || 'https://billingflow.hmorix.in'

  // Form State
  const [clientName, setClientName] = useState('Acme Technologies Pvt Ltd')
  const [clientEmail, setClientEmail] = useState('billing@acmetechnologies.com')
  const [clientGstin, setClientGstin] = useState('07AAAAA0000A1Z5')
  const [clientAddress, setClientAddress] = useState('Sector 62, Noida, Uttar Pradesh, India')

  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-0089')
  const [issueDate, setIssueDate] = useState('2026-09-07')
  const [dueDate, setDueDate] = useState('2026-09-21')
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR')
  const [taxRate, setTaxRate] = useState<number>(18)
  const [discount, setDiscount] = useState<number>(1000)
  const [notes, setNotes] = useState('Payment via UPI, NEFT or Net Banking within 14 days.')

  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: 'Enterprise Web Application Development (Phase 1)', quantity: 1, price: 45000 },
    { id: '2', description: 'Cloud DB Optimization & Redis Cluster Setup', quantity: 1, price: 15000 },
    { id: '3', description: 'Monthly Automated GST Invoicing & Maintenance', quantity: 2, price: 5000 },
  ])

  const [isSending, setIsSending] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Calculations
  const currencySymbol = currency === 'INR' ? '₹' : '$'
  const subtotal = items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0)
  const discountAmount = Math.min(subtotal, Math.max(0, Number(discount) || 0))
  const taxableAmount = Math.max(0, subtotal - discountAmount)
  const taxAmount = (taxableAmount * (Number(taxRate) || 0)) / 100
  const totalDue = taxableAmount + taxAmount

  const paymentUrl = `${appUrl}/pay/${invoiceNumber}`

  // Item helpers
  const addItem = () => {
    setItems([
      ...items,
      { id: String(Date.now()), description: 'New Service Item', quantity: 1, price: 2000 }
    ])
  }

  const updateItem = (id: string, field: keyof LineItem, val: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: val } : item))
  }

  const removeItem = (id: string) => {
    if (items.length <= 1) return
    setItems(items.filter(item => item.id !== id))
  }

  const loadPreset = (type: 'software' | 'consulting' | 'saas') => {
    if (type === 'software') {
      setClientName('Apex Braj Exports LLC')
      setClientEmail('accounts@apexbraj.in')
      setCurrency('INR')
      setTaxRate(18)
      setDiscount(2000)
      setItems([
        { id: '1', description: 'Custom ERP & Inventory Tracking Portal', quantity: 1, price: 75000 },
        { id: '2', description: 'Razorpay UPI & International Gateway Integration', quantity: 1, price: 20000 },
      ])
    } else if (type === 'saas') {
      setClientName('Global Scale AI Inc')
      setClientEmail('finance@globalscale.ai')
      setCurrency('USD')
      setTaxRate(0)
      setDiscount(50)
      setItems([
        { id: '1', description: 'BillingFlow Enterprise Tier - Monthly Subscription', quantity: 1, price: 499 },
        { id: '2', description: 'High-Volume Cryptographic PDF Addon (5,000 docs)', quantity: 1, price: 150 },
      ])
    } else {
      setClientName('Sharma & Sons Enterprises')
      setClientEmail('sharma.sons@enterprise.in')
      setCurrency('INR')
      setTaxRate(18)
      setDiscount(500)
      setItems([
        { id: '1', description: 'Full-Stack Architecture Consultation (10 hours)', quantity: 10, price: 2500 },
        { id: '2', description: 'Infrastructure Security & Pen-Testing Audit', quantity: 1, price: 18000 },
      ])
    }
  }

  const handleSendInvoice = () => {
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      setSentSuccess(true)
    }, 1200)
  }

  const copyPaymentLink = () => {
    navigator.clipboard.writeText(paymentUrl).then(() => {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }).catch(() => null)
  }

  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      window.print()
      return
    }

    const rowsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${currencySymbol}${Number(item.price).toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">${currencySymbol}${(item.quantity * item.price).toLocaleString()}</td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceNumber} - ${clientName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111; padding: 40px; margin: 0; background: #fff; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
            .logo span { color: #84cc16; }
            .inv-meta { text-align: right; }
            .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f8fafc; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
            .totals { margin-left: auto; width: 300px; }
            .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
            .total-due { font-size: 18px; font-weight: 800; border-top: 2px solid #000; padding-top: 8px; margin-top: 6px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div>
                <div class="logo">HMorix <span>BillingFlow</span></div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">billingflow.hmorix.in &bull; Hathras, UP, India</div>
              </div>
              <div class="inv-meta">
                <div style="font-size: 20px; font-weight: 700; color: #000;">TAX INVOICE</div>
                <div style="font-size: 13px; font-weight: 600; color: #475569;"># ${invoiceNumber}</div>
                <div style="font-size: 12px; color: #64748b;">Issue: ${issueDate} | Due: ${dueDate}</div>
              </div>
            </div>

            <div class="parties">
              <div>
                <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Billed By</div>
                <div style="font-size: 14px; font-weight: 700; margin-top: 2px;">HMorix Technology Solutions</div>
                <div style="font-size: 12px; color: #475569;">Hathras, Uttar Pradesh, PIN: 204101</div>
                <div style="font-size: 12px; color: #475569;">GSTIN: 09AAAAA0000A1Z2</div>
                <div style="font-size: 12px; color: #475569;">Email: billing@hmorix.in</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Billed To</div>
                <div style="font-size: 14px; font-weight: 700; margin-top: 2px;">${clientName}</div>
                <div style="font-size: 12px; color: #475569;">${clientEmail}</div>
                ${clientGstin ? `<div style="font-size: 12px; color: #475569;">GSTIN: ${clientGstin}</div>` : ''}
                ${clientAddress ? `<div style="font-size: 12px; color: #475569;">${clientAddress}</div>` : ''}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>

            <div class="totals">
              <div class="totals-row"><span>Subtotal:</span><span>${currencySymbol}${subtotal.toLocaleString()}</span></div>
              ${discountAmount > 0 ? `<div class="totals-row" style="color: #16a34a;"><span>Discount:</span><span>-${currencySymbol}${discountAmount.toLocaleString()}</span></div>` : ''}
              ${taxRate > 0 ? `<div class="totals-row"><span>GST (${taxRate}%):</span><span>+${currencySymbol}${taxAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>` : ''}
              <div class="totals-row total-due"><span>Total Due:</span><span>${currencySymbol}${totalDue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
            </div>

            <div style="margin-top: 30px; padding: 15px; background: #f8fafc; border-radius: 6px; font-size: 12px; color: #334155;">
              <strong>Terms & Notes:</strong> ${notes}
            </div>

            <div class="footer">
              Generated via HMorix BillingFlow Engine &bull; Verify authenticity at https://billingflow.hmorix.in
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          <\/script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="pt-32 pb-20">
      <SEOHead
        title="Interactive Invoice Builder & Live Demo – BillingFlow"
        description="Create, customize, calculate taxes, preview, and download real invoices with BillingFlow. Automated GST, line items, and dynamic payment links."
        keywords="BillingFlow demo, invoice generator, online invoice builder, GST invoice generator, billingflow.hmorix.in"
        canonical="/billingflow/demo"
      />

      <div className="max-w-[1280px] mx-auto px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="label-mono">BillingFlow / Interactive Builder</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#C8FF00]/10 text-[#C8FF00] font-mono">Real-Time Reactive</span>
            </div>
            <h1 className="section-title text-3xl md:text-4xl mb-2">Interactive Invoice Builder</h1>
            <p className="text-cream/60 text-sm max-w-[620px]">
              Type your client details and items to watch the invoice preview update live in real-time. Calculate Indian GST, generate payment links, and export official printable PDFs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={appUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5 font-semibold"
            >
              <span>Launch Full Web App</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="p-3 bg-obsidian-2 border border-glass-border rounded-[12px] mb-8 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-cream/50">
            <Sparkles size={14} className="text-[#C8FF00]" />
            <span>Load Quick Sample Data:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => loadPreset('software')}
              className="px-3 py-1.5 bg-obsidian hover:bg-white/[0.04] border border-glass-border rounded-[6px] text-cream/80 hover:text-[#C8FF00] transition-colors"
            >
              Indian Enterprise (₹ GST 18%)
            </button>
            <button
              onClick={() => loadPreset('saas')}
              className="px-3 py-1.5 bg-obsidian hover:bg-white/[0.04] border border-glass-border rounded-[6px] text-cream/80 hover:text-[#C8FF00] transition-colors"
            >
              SaaS Cross-Border ($ USD)
            </button>
            <button
              onClick={() => loadPreset('consulting')}
              className="px-3 py-1.5 bg-obsidian hover:bg-white/[0.04] border border-glass-border rounded-[6px] text-cream/80 hover:text-[#C8FF00] transition-colors"
            >
              Consulting Retainer (Hourly)
            </button>
          </div>
        </div>

        {/* Main 2-Column App View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Controls & Form (5 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
              {/* Step Navigation Tabs */}
              <div className="flex items-center gap-2 mb-6 border-b border-glass-border pb-3">
                {[
                  { id: 0, label: '1. Client Details' },
                  { id: 1, label: '2. Line Items & Tax' },
                  { id: 2, label: '3. Finalize & Share' },
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setStep(s.id)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-[6px] transition-all text-center ${
                      step === s.id
                        ? 'bg-[#C8FF00] text-obsidian shadow-[0_0_12px_rgba(200,255,0,0.3)]'
                        : 'text-cream/50 hover:text-cream hover:bg-white/[0.04]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* STEP 0: Client & Invoice Details */}
              {step === 0 && (
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-sm text-cream">Client Information</h3>
                  <div>
                    <label className="block text-xs text-cream/40 mb-1">Client Company / Name</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-obsidian border border-glass-border rounded-[6px] text-sm text-cream outline-none focus:border-[#C8FF00]"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-cream/40 mb-1">Client Email</label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={e => setClientEmail(e.target.value)}
                        className="w-full px-3.5 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm text-cream outline-none focus:border-[#C8FF00]"
                        placeholder="billing@acme.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-cream/40 mb-1">GSTIN / Tax ID (Optional)</label>
                      <input
                        type="text"
                        value={clientGstin}
                        onChange={e => setClientGstin(e.target.value)}
                        className="w-full px-3.5 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm text-cream outline-none focus:border-[#C8FF00]"
                        placeholder="07AAAAA0000A1Z5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-cream/40 mb-1">Billing Address</label>
                    <input
                      type="text"
                      value={clientAddress}
                      onChange={e => setClientAddress(e.target.value)}
                      className="w-full px-3.5 py-2 bg-obsidian border border-glass-border rounded-[6px] text-sm text-cream outline-none focus:border-[#C8FF00]"
                      placeholder="Street, City, State, Country"
                    />
                  </div>

                  <h3 className="font-display font-semibold text-sm text-cream pt-3 border-t border-glass-border">Invoice Meta</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-cream/40 mb-1">Invoice Number</label>
                      <input
                        type="text"
                        value={invoiceNumber}
                        onChange={e => setInvoiceNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-xs font-mono text-[#C8FF00] outline-none focus:border-[#C8FF00]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-cream/40 mb-1">Issue Date</label>
                      <input
                        type="date"
                        value={issueDate}
                        onChange={e => setIssueDate(e.target.value)}
                        className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-xs font-mono text-cream outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-cream/40 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded-[6px] text-xs font-mono text-cream outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setStep(1)}
                      className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs font-semibold"
                    >
                      <span>Next: Configure Items &amp; GST</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 1: Line Items & Tax Calculation */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-sm text-cream">Invoice Line Items</h3>
                    <button
                      onClick={addItem}
                      className="text-xs px-2.5 py-1 bg-[#C8FF00]/10 hover:bg-[#C8FF00]/20 text-[#C8FF00] rounded-[4px] flex items-center gap-1 font-mono transition-colors"
                    >
                      <Plus size={12} />
                      <span>Add Item</span>
                    </button>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {items.map((item, idx) => (
                      <div key={item.id} className="p-3 bg-obsidian border border-glass-border rounded-[8px] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono text-cream/30 uppercase">Item #{idx + 1}</span>
                          {items.length > 1 && (
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Delete Item"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Item Description"
                          className="w-full px-2.5 py-1.5 bg-white/[0.03] border border-glass-border rounded text-xs text-cream outline-none focus:border-[#C8FF00]"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-cream/40">Qty</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={e => updateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full px-2.5 py-1 bg-white/[0.03] border border-glass-border rounded text-xs font-mono text-cream outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-cream/40">Unit Price ({currencySymbol})</label>
                            <input
                              type="number"
                              value={item.price}
                              onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full px-2.5 py-1 bg-white/[0.03] border border-glass-border rounded text-xs font-mono text-[#C8FF00] outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Taxes, Currency & Discount */}
                  <div className="pt-3 border-t border-glass-border grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-cream/40 mb-1">Currency</label>
                      <select
                        value={currency}
                        onChange={e => setCurrency(e.target.value as any)}
                        className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded text-xs text-cream outline-none"
                      >
                        <option value="INR">INR (₹ Rupees)</option>
                        <option value="USD">USD ($ Dollars)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-cream/40 mb-1">GST / Tax Rate (%)</label>
                      <select
                        value={taxRate}
                        onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded text-xs text-cream outline-none"
                      >
                        <option value="0">0% (Zero-rated / Export)</option>
                        <option value="5">5% GST</option>
                        <option value="12">12% GST</option>
                        <option value="18">18% GST (Standard)</option>
                        <option value="28">28% GST</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-cream/40 mb-1">Discount ({currencySymbol})</label>
                      <input
                        type="number"
                        value={discount}
                        onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-obsidian border border-glass-border rounded text-xs font-mono text-cream outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep(0)} className="btn-outline flex-1 py-2 text-xs">
                      Back
                    </button>
                    <button onClick={() => setStep(2)} className="btn-primary flex-1 py-2 text-xs font-semibold">
                      Review &amp; Share
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Finalize & Actions */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-4 bg-obsidian border border-glass-border rounded-[10px] space-y-2">
                    <div className="flex items-center justify-between text-xs text-cream/60">
                      <span>Total Items:</span>
                      <span className="font-mono text-cream">{items.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-cream/60">
                      <span>Subtotal:</span>
                      <span className="font-mono text-cream">{currencySymbol}{subtotal.toLocaleString()}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex items-center justify-between text-xs text-green-400">
                        <span>Discount Applied:</span>
                        <span className="font-mono">-{currencySymbol}{discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {taxRate > 0 && (
                      <div className="flex items-center justify-between text-xs text-cream/60">
                        <span>GST ({taxRate}%):</span>
                        <span className="font-mono text-cream">+{currencySymbol}{taxAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm font-bold text-cream pt-2 border-t border-glass-border">
                      <span>Grand Total:</span>
                      <span className="font-mono text-[#C8FF00] text-base">{currencySymbol}{totalDue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={handlePrintPdf}
                      className="btn-primary py-2.5 flex items-center justify-center gap-2 text-xs font-semibold"
                    >
                      <Printer size={14} />
                      <span>Print / Download PDF</span>
                    </button>

                    <button
                      onClick={handleSendInvoice}
                      disabled={isSending || sentSuccess}
                      className="btn-outline py-2.5 flex items-center justify-center gap-2 text-xs font-semibold"
                    >
                      {isSending ? (
                        <Loader2 size={14} className="animate-spin text-[#C8FF00]" />
                      ) : sentSuccess ? (
                        <Check size={14} className="text-[#C8FF00]" />
                      ) : (
                        <Send size={14} />
                      )}
                      <span>{isSending ? 'Sending...' : sentSuccess ? 'Invoice Sent!' : 'Send to Client'}</span>
                    </button>
                  </div>

                  {/* Shareable Link Box */}
                  <div className="p-3.5 bg-obsidian border border-glass-border rounded-[8px]">
                    <div className="flex items-center justify-between text-[11px] text-cream/40 mb-1 font-mono">
                      <span>Live Client Payment Portal Link:</span>
                      <button
                        onClick={copyPaymentLink}
                        className="text-[#C8FF00] hover:underline flex items-center gap-1"
                      >
                        {copiedLink ? <Check size={12} /> : <Share2 size={12} />}
                        <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-xs text-cream/80 truncate">
                      {paymentUrl}
                    </div>
                  </div>

                  {sentSuccess && (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-[8px] flex items-center gap-2 text-xs text-green-400">
                      <CheckCircle size={15} />
                      <span>Simulated email &amp; WhatsApp notification dispatched to <strong>{clientEmail}</strong>!</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep(1)} className="btn-outline flex-1 py-2 text-xs">
                      Back to Items
                    </button>
                    <button onClick={() => setStep(0)} className="text-xs text-cream/40 hover:text-cream py-2 px-3">
                      Start Over
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Live Reactive Preview Screen (6 cols) */}
          <div className="lg:col-span-6 sticky top-28">
            <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] shadow-2xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-glass-border">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="font-mono text-xs font-semibold text-cream">Live Invoice Render</span>
                </div>
                <button
                  onClick={handlePrintPdf}
                  className="text-xs text-[#C8FF00] hover:underline flex items-center gap-1 font-mono"
                >
                  <Download size={12} />
                  <span>Download / Print</span>
                </button>
              </div>

              {/* Styled Document Sheet */}
              <div className="bg-white rounded-[10px] p-6 text-obsidian shadow-lg font-sans text-xs">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-4">
                  <div>
                    <div className="font-display font-extrabold text-lg tracking-tight text-gray-900">
                      HMorix <span className="text-[#65a30d]">BillingFlow</span>
                    </div>
                    <div className="text-[10px] text-gray-500">Hathras, Uttar Pradesh, 204101</div>
                    <div className="text-[10px] text-gray-500">GSTIN: 09AAAAA0000A1Z2</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-base text-gray-800">TAX INVOICE</div>
                    <div className="font-mono font-bold text-xs text-gray-600">{invoiceNumber}</div>
                    <span className={`inline-block px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold ${
                      sentSuccess ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {sentSuccess ? '● ISSUED & SENT' : '● DRAFT'}
                    </span>
                  </div>
                </div>

                {/* Bill To & Dates */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-[11px]">
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Billed To</div>
                    <div className="font-bold text-gray-900 text-xs mt-0.5">{clientName || 'Client Name'}</div>
                    <div className="text-gray-600">{clientEmail || 'email@client.com'}</div>
                    {clientGstin && <div className="text-gray-500 text-[10px]">GSTIN: {clientGstin}</div>}
                    {clientAddress && <div className="text-gray-500 text-[10px]">{clientAddress}</div>}
                  </div>
                  <div className="text-right">
                    <div><span className="text-gray-400">Issue Date:</span> <strong className="text-gray-700">{issueDate}</strong></div>
                    <div><span className="text-gray-400">Due Date:</span> <strong className="text-gray-700">{dueDate}</strong></div>
                    <div><span className="text-gray-400">Currency:</span> <strong className="text-gray-700">{currency}</strong></div>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-[11px] mb-4">
                  <thead>
                    <tr className="border-b-2 border-gray-300 bg-gray-50 text-gray-600 text-[10px] uppercase">
                      <th className="text-left py-1.5 px-2">Description</th>
                      <th className="text-center py-1.5 px-1">Qty</th>
                      <th className="text-right py-1.5 px-2">Unit</th>
                      <th className="text-right py-1.5 px-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-2 px-2 text-gray-800 font-medium">{it.description}</td>
                        <td className="py-2 px-1 text-center font-mono text-gray-600">{it.quantity}</td>
                        <td className="py-2 px-2 text-right font-mono text-gray-600">{currencySymbol}{Number(it.price).toLocaleString()}</td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-gray-900">
                          {currencySymbol}{(it.quantity * it.price).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Subtotal & Taxes Breakdown */}
                <div className="border-t border-gray-200 pt-2 flex justify-between items-start text-[11px]">
                  <div className="w-1/2 pr-2">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                      <QrCode size={28} className="text-gray-700 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-[10px] text-gray-700">UPI / QR Instant Pay</div>
                        <div className="text-[9px] text-gray-500 font-mono">hmorix@upi</div>
                      </div>
                    </div>
                  </div>

                  <div className="w-1/2 pl-2 space-y-1 text-right">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span className="font-mono">{currencySymbol}{subtotal.toLocaleString()}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>Discount:</span>
                        <span className="font-mono">-{currencySymbol}{discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {taxRate > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>GST ({taxRate}%):</span>
                        <span className="font-mono">+{currencySymbol}{taxAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs font-extrabold text-gray-900 pt-1.5 border-t border-gray-300">
                      <span>Total Due:</span>
                      <span className="font-mono text-sm text-[#4d7c0f]">{currencySymbol}{totalDue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

