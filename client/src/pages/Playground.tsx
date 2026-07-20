import { useState } from 'react'
import { Globe, FileText, Receipt, GitBranch, MessageCircle } from 'lucide-react'
import { config } from '../lib/config'

const demos = [
  { id: 'website', icon: Globe, title: 'Website Generator', desc: 'Generate complete websites from a text description' },
  { id: 'pdf', icon: FileText, title: 'PDF Automation', desc: 'Extract data from uploaded PDF documents' },
  { id: 'invoice', icon: Receipt, title: 'Invoice Generator', desc: 'Create professional invoices instantly' },
  { id: 'workflow', icon: GitBranch, title: 'Workflow Builder', desc: 'Design automated business workflows' },
  { id: 'chat', icon: MessageCircle, title: 'Chat Assistant', desc: 'AI-powered conversational assistant' },
]

export default function Playground() {
  const [activeDemo, setActiveDemo] = useState('website')
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const handleRun = async () => {
    if (!input.trim()) return
    setLoading(true)
    setResult('')
    setStatus('')
    try {
      const response = await fetch(`${config.apiUrl}/ai/playground`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activeDemo, prompt: input }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Demo failed')
      setStatus(data.status || '')
      setResult(data.result || data.reply || 'Demo complete.')
    } catch (error) {
      setStatus('Local demo fallback')
      setResult(error instanceof Error ? error.message : 'Demo failed')
    } finally {
      setLoading(false)
    }
  }

  const placeholders: Record<string, string> = {
    website: 'Describe the website you want to build...',
    pdf: 'Describe what data to extract from your PDF...',
    invoice: 'Enter invoice details (client, amount, items)...',
    workflow: 'Describe the workflow you want to automate...',
    chat: 'Ask me anything about HMorix...',
  }

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="max-w-[700px] mb-12">
          <span className="label-mono">AI Playground</span>
          <h1 className="section-title mt-3 mb-6">Try before you buy</h1>
          <p className="text-lg text-cream/60 leading-relaxed">Experience HMorix AI capabilities firsthand. Select a demo below and see what our platform can do.</p>
        </div>

        {/* Demo Selector */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {demos.map(demo => (
            <button key={demo.id} onClick={() => { setActiveDemo(demo.id); setResult(''); setInput('') }} className={`p-4 border rounded-[12px] text-left transition-all ${activeDemo === demo.id ? 'border-[#C8FF00] bg-[#C8FF00]/5' : 'border-glass-border bg-obsidian-2 hover:border-cream/20'}`}>
              <demo.icon size={20} className={activeDemo === demo.id ? 'text-[#C8FF00]' : 'text-cream/40'} />
              <div className="font-display font-semibold text-sm mt-2">{demo.title}</div>
            </button>
          ))}
        </div>

        {/* Playground Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
            <h3 className="font-display font-semibold mb-4">Input</h3>
            <div className="mb-4 p-3 bg-[#C8FF00]/5 border border-[#C8FF00]/20 rounded-[8px] text-xs text-[#C8FF00]">
              {activeDemo === 'website' && 'Website Generator: Connected with Orix Labs or access token required for export.'}
              {activeDemo === 'pdf' && 'PDF Automation: Connected with HMorix PDF Editor or access token required for live jobs.'}
              {activeDemo === 'invoice' && 'Invoice Generator: Connected with Orix Billing Flow or access token required for billing sync.'}
              {activeDemo === 'workflow' && 'Workflow Builder: Connected with HMorix Builder or access token required for deployment.'}
              {activeDemo === 'chat' && 'Chat Assistant: Connected with HMorix AI Assistant using configured NVIDIA model.'}
            </div>
            <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={placeholders[activeDemo]} className="w-full h-48 bg-obsidian border border-glass-border rounded-[8px] p-4 text-sm text-cream resize-none outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />
            <button onClick={handleRun} disabled={loading || !input.trim()} className="mt-4 w-full py-3 bg-[#C8FF00] text-obsidian font-display font-semibold rounded-[4px] hover:opacity-90 disabled:opacity-50 transition-all">
              {loading ? 'Processing...' : 'Run Demo'}
            </button>
          </div>
          <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Result</h3>
              {status && <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-[10px]">{status}</span>}
            </div>
            <div className="bg-obsidian border border-glass-border rounded-[8px] p-4 h-[280px] overflow-y-auto font-mono text-sm whitespace-pre-wrap">
              {loading ? (
                <div className="flex items-center gap-2 text-[#C8FF00]">
                  <div className="w-2 h-2 bg-[#C8FF00] rounded-full animate-pulse" />
                  Processing...
                </div>
              ) : result ? (
                <div className="text-cream/80">{result}</div>
              ) : (
                <div className="text-cream/30 text-center mt-20">Results will appear here...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
