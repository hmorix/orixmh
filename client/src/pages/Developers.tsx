import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Code, Download, Key, Webhook, FileText, Terminal, Check, Copy, ExternalLink, Play, Loader2, RefreshCw } from 'lucide-react'
import SEOHead from '../components/seo/SEOHead'
import { config } from '../lib/config'

interface ProbeResult {
  endpoint: string
  status: number
  statusText: string
  latencyMs: number
  data: any
  timestamp: string
}

export default function Developers() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [activeProbe, setActiveProbe] = useState<string | null>(null)
  const [probeResult, setProbeResult] = useState<ProbeResult | null>(null)
  const [probeError, setProbeError] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCode(id)
      setTimeout(() => setCopiedCode(null), 2000)
    }).catch(() => null)
  }

  const runProbe = async (endpoint: string) => {
    setActiveProbe(endpoint)
    setProbeError(null)
    const startTime = performance.now()
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${config.apiUrl}${endpoint.replace(/^\/api/, '')}`
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      })
      const latencyMs = Math.round(performance.now() - startTime)
      const data = await response.json().catch(() => ({ message: 'Non-JSON response received' }))
      setProbeResult({
        endpoint,
        status: response.status,
        statusText: response.statusText || (response.ok ? 'OK' : 'Error'),
        latencyMs,
        data,
        timestamp: new Date().toLocaleTimeString(),
      })
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime)
      setProbeError(`Network error: ${err?.message || 'Failed to connect to endpoint'}`)
      setProbeResult({
        endpoint,
        status: 0,
        statusText: 'Connection Failed',
        latencyMs,
        data: { error: err?.message || 'Failed to fetch' },
        timestamp: new Date().toLocaleTimeString(),
      })
    } finally {
      setActiveProbe(null)
    }
  }

  const jsCode = `import { HMorix } from '@hmorix/sdk'

const hmorix = new HMorix({
  apiKey: process.env.HMORIX_API_KEY
})

// Generate an application or workflow
const result = await hmorix.agent.generate({
  prompt: 'Build a customer invoicing pipeline with GST compliance',
  framework: 'react',
  style: 'modern'
})

console.log(result.url)`

  const pythonCode = `from hmorix import HMorix

client = HMorix(api_key="your-api-key")

# Process and extract structured PDF documents
result = client.pdf.extract(
    file_path="invoice.pdf",
    fields=["total", "date", "vendor", "gstin"]
)

print(result.data)
# {'total': '₹4,200', 'date': '2026-09-01', 'vendor': 'Acme India', 'gstin': '07AAAAA0000A1Z5'}`

  return (
    <div className="pt-32 pb-20">
      <SEOHead
        title="Developer Platform & API Sandbox"
        description="Integrate HMorix into your applications with official REST APIs, OpenAPI 3.0 specs, SDKs, webhooks, and a live interactive sandbox."
        keywords="HMorix API, developer platform, API sandbox, SDKs, webhooks, REST API, OpenAPI, developer portal"
        canonical="/developers"
      />

      <div className="max-w-[1280px] mx-auto px-8">
        {/* Header */}
        <div className="max-w-[750px] mb-16">
          <span className="label-mono">Developer Platform</span>
          <h1 className="section-title mt-3 mb-6">Build with HMorix</h1>
          <p className="text-lg text-cream/60 leading-relaxed">
            Everything you need to integrate HMorix enterprise services into your applications and autonomous AI agents. Typed REST APIs, OpenAPI 3.0 schemas, live interactive sandbox, and official CLI tools.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {[
            {
              icon: FileText,
              title: 'API Documentation',
              desc: 'Complete reference for all HMorix APIs with examples, payloads, and response schemas.',
              badge: 'v2.4',
              to: '/docs',
              external: false,
            },
            {
              icon: Terminal,
              title: 'Interactive Sandbox',
              desc: 'Execute real-time API probes directly in your browser without mutating live accounts.',
              badge: 'Live',
              to: '#sandbox',
              external: false,
            },
            {
              icon: Code,
              title: 'SDK & Quick Start',
              desc: 'Production-ready code snippets and starter templates in Node.js and Python.',
              badge: 'TypeScript / Python',
              to: '#quickstart',
              external: false,
            },
            {
              icon: Key,
              title: 'API Keys & Auth',
              desc: 'Generate, inspect, and revoke developer API keys with cryptographic token hashing.',
              badge: 'Secure',
              to: '/profile',
              external: false,
            },
            {
              icon: Download,
              title: 'Official CLI Tool',
              desc: 'Script operations and invoke AI agents directly from your terminal with @hmorix/cli.',
              badge: 'v1.0.0',
              to: '#cli',
              external: false,
            },
            {
              icon: Webhook,
              title: 'OpenAPI 3.0 Spec',
              desc: 'Machine-readable OpenAPI schemas compatible with OpenAI and Anthropic tool calling.',
              badge: 'RFC 9727',
              to: '/openapi.json',
              external: true,
            },
          ].map((item, i) => {
            const Content = (
              <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] hover:border-[#C8FF00]/40 transition-all h-full flex flex-col justify-between group cursor-pointer">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <item.icon size={24} className="text-[#C8FF00]" />
                    <span className="text-[10px] px-2 py-0.5 bg-[#C8FF00]/10 text-[#C8FF00] rounded-full font-mono">{item.badge}</span>
                  </div>
                  <h3 className="font-display font-semibold mb-2 group-hover:text-[#C8FF00] transition-colors flex items-center gap-1.5">
                    {item.title}
                    {item.external && <ExternalLink size={14} className="opacity-40 group-hover:opacity-100" />}
                  </h3>
                  <p className="text-sm text-cream/50 leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-glass-border/40 text-xs text-[#C8FF00] flex items-center gap-1">
                  <span>Explore</span> &rarr;
                </div>
              </div>
            )

            if (item.external) {
              return (
                <a key={i} href={item.to} target="_blank" rel="noreferrer" className="block">
                  {Content}
                </a>
              )
            }

            if (item.to.startsWith('#')) {
              return (
                <a key={i} href={item.to} className="block">
                  {Content}
                </a>
              )
            }

            return (
              <Link key={i} to={item.to} className="block">
                {Content}
              </Link>
            )
          })}
        </div>

        {/* Code Example */}
        <div id="quickstart" className="scroll-mt-32">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold">Quick Start SDKs</h2>
            <span className="text-xs text-cream/40 font-mono">npm &bull; pip &bull; curl</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
            {/* JavaScript / TypeScript */}
            <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                    <span className="text-sm font-semibold">JavaScript / TypeScript</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded-full font-mono">Node.js</span>
                    <button
                      onClick={() => copyToClipboard(jsCode, 'js')}
                      className="text-xs px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-cream/60 hover:text-cream rounded-[4px] flex items-center gap-1 transition-colors"
                      title="Copy code"
                    >
                      {copiedCode === 'js' ? <Check size={12} className="text-[#C8FF00]" /> : <Copy size={12} />}
                      {copiedCode === 'js' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <pre className="bg-obsidian border border-glass-border rounded-[8px] p-4 font-mono text-xs leading-relaxed overflow-x-auto text-cream/85">
                  <code>{jsCode}</code>
                </pre>
              </div>
              <div className="mt-4 text-xs text-cream/40 flex items-center justify-between">
                <span>Package: <code className="text-[#C8FF00]">@hmorix/sdk</code></span>
                <span>Requires Node &ge; 18.0</span>
              </div>
            </div>

            {/* Python */}
            <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                    <span className="text-sm font-semibold">Python</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full font-mono">pip</span>
                    <button
                      onClick={() => copyToClipboard(pythonCode, 'py')}
                      className="text-xs px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-cream/60 hover:text-cream rounded-[4px] flex items-center gap-1 transition-colors"
                      title="Copy code"
                    >
                      {copiedCode === 'py' ? <Check size={12} className="text-[#C8FF00]" /> : <Copy size={12} />}
                      {copiedCode === 'py' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <pre className="bg-obsidian border border-glass-border rounded-[8px] p-4 font-mono text-xs leading-relaxed overflow-x-auto text-cream/85">
                  <code>{pythonCode}</code>
                </pre>
              </div>
              <div className="mt-4 text-xs text-cream/40 flex items-center justify-between">
                <span>Package: <code className="text-[#C8FF00]">hmorix</code></span>
                <span>Requires Python &ge; 3.9</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Interactive Sandbox */}
        <div id="sandbox" className="p-8 bg-obsidian-2 border border-glass-border rounded-[16px] mb-12 scroll-mt-32">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[8px] bg-[#C8FF00]/10 flex items-center justify-center">
                <Terminal className="text-[#C8FF00]" size={22} />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">Interactive API Sandbox</h2>
                <p className="text-xs text-cream/50 mt-0.5">Test live production endpoints directly in your browser session.</p>
              </div>
            </div>
            {probeResult && (
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-medium ${probeResult.status >= 200 && probeResult.status < 300 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  HTTP {probeResult.status} {probeResult.statusText}
                </span>
                <span className="text-xs px-2 py-1 bg-white/[0.04] text-cream/60 rounded-[4px] font-mono">
                  {probeResult.latencyMs} ms
                </span>
              </div>
            )}
          </div>

          <p className="text-sm text-cream/60 mb-6">
            Click any probe button below to execute a real request against the HMorix gateway. Returns production-accurate system metrics and schemas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {[
              { path: '/api/health', desc: 'Cluster & database health probe' },
              { path: '/api/status', desc: 'Component latency & uptime SLA' },
              { path: '/api/services', desc: 'Service catalog & base pricing' },
            ].map((endpoint) => {
              const isRunning = activeProbe === endpoint.path
              return (
                <button
                  key={endpoint.path}
                  onClick={() => runProbe(endpoint.path)}
                  disabled={Boolean(activeProbe)}
                  className={`p-3.5 bg-obsidian border rounded-[8px] text-left transition-all ${
                    isRunning
                      ? 'border-[#C8FF00] bg-[#C8FF00]/5'
                      : 'border-glass-border hover:border-[#C8FF00]/60 hover:bg-white/[0.02]'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-blue-400">GET</span>
                    {isRunning ? (
                      <Loader2 size={14} className="animate-spin text-[#C8FF00]" />
                    ) : (
                      <Play size={12} className="text-cream/30 group-hover:text-[#C8FF00]" />
                    )}
                  </div>
                  <div className="text-sm font-mono text-cream font-medium truncate">{endpoint.path}</div>
                  <div className="text-[11px] text-cream/40 mt-1">{endpoint.desc}</div>
                </button>
              )
            })}
          </div>

          {/* Console Output Screen */}
          <div className="relative">
            <div className="flex items-center justify-between px-4 py-2 bg-obsidian border-t border-x border-glass-border rounded-t-[8px] text-xs font-mono text-cream/40">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Response Console {probeResult ? `(${probeResult.endpoint})` : ''}
              </span>
              {probeResult && (
                <div className="flex items-center gap-3">
                  <span>Timestamp: {probeResult.timestamp}</span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(probeResult.data, null, 2), 'sandbox')}
                    className="text-xs text-cream/60 hover:text-[#C8FF00] flex items-center gap-1 transition-colors"
                  >
                    {copiedCode === 'sandbox' ? <Check size={12} className="text-[#C8FF00]" /> : <Copy size={12} />}
                    {copiedCode === 'sandbox' ? 'Copied' : 'Copy JSON'}
                  </button>
                </div>
              )}
            </div>
            <pre className="p-4 bg-obsidian border border-glass-border rounded-b-[8px] font-mono text-xs text-cream/80 overflow-x-auto max-h-[300px] leading-relaxed">
              {activeProbe ? (
                <div className="flex items-center gap-2 text-[#C8FF00] py-4">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Probing {activeProbe}...</span>
                </div>
              ) : probeError ? (
                <span className="text-red-400">{probeError}</span>
              ) : probeResult ? (
                JSON.stringify(probeResult.data, null, 2)
              ) : (
                <span className="text-cream/40">
                  {"// Click one of the GET endpoints above to trigger a live API probe.\n// Responses contain live cluster availability, latency metrics, and product catalogs."}
                </span>
              )}
            </pre>
          </div>
        </div>

        {/* CLI Tool */}
        <div id="cli" className="p-8 bg-obsidian-2 border border-glass-border rounded-[16px] mb-12 scroll-mt-32">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h2 className="font-display text-xl font-bold">Official CLI Tool (@hmorix/cli)</h2>
            <span className="text-xs px-2.5 py-1 bg-[#C8FF00]/10 text-[#C8FF00] rounded-full font-mono w-fit">v1.0.0</span>
          </div>
          <p className="text-sm text-cream/60 mb-6">
            The official command-line interface lets developers script workflows, inspect live OpenAPI schemas, and invoke autonomous AI agents directly from the terminal or CI/CD pipelines.
          </p>
          <div className="bg-obsidian border border-glass-border rounded-[8px] p-4 font-mono text-xs leading-relaxed overflow-x-auto mb-4 text-cream/85">
            <div className="flex items-center justify-between text-cream/40 mb-1">
              <span># Run instantly without global installation:</span>
              <button
                onClick={() => copyToClipboard('npx @hmorix/cli status', 'cli-run')}
                className="text-cream/40 hover:text-cream"
              >
                {copiedCode === 'cli-run' ? <Check size={12} className="text-[#C8FF00]" /> : <Copy size={12} />}
              </button>
            </div>
            <div className="text-[#C8FF00] font-semibold">npx @hmorix/cli status</div>

            <div className="mt-4 text-cream/40 mb-1"># Install globally via npm:</div>
            <div>npm install -g @hmorix/cli</div>

            <div className="mt-4 text-cream/40 mb-1"># Fetch live OpenAPI specification:</div>
            <div>hmorix openapi</div>

            <div className="mt-4 text-cream/40 mb-1"># Trigger autonomous AI agent workflow:</div>
            <div>hmorix agent "Check invoice status for INV-2841"</div>
          </div>
        </div>

        {/* OpenAPI Specification & Agent Standards */}
        <div className="p-8 bg-obsidian-2 border border-glass-border rounded-[16px] mb-12">
          <h2 className="font-display text-xl font-bold mb-4">OpenAPI 3.0 & Machine Specifications</h2>
          <p className="text-sm text-cream/60 mb-6">
            Our complete platform API is defined using OpenAPI 3.0.3. Import the specification into Postman, Insomnia, or use it directly with LLM function-calling frameworks (LangChain, LlamaIndex, OpenAI Assistants).
          </p>
          <div className="flex gap-3 flex-wrap">
            <a
              href="/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-white/[0.04] border border-glass-border rounded-[4px] text-sm text-cream/70 hover:text-[#C8FF00] hover:border-[#C8FF00] transition-all flex items-center gap-1.5"
            >
              <Download size={14} /> Download OpenAPI Spec (JSON)
            </a>
            <a
              href="/openapi.yaml"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-white/[0.04] border border-glass-border rounded-[4px] text-sm text-cream/70 hover:text-[#C8FF00] hover:border-[#C8FF00] transition-all flex items-center gap-1.5"
            >
              <Download size={14} /> Download OpenAPI Spec (YAML)
            </a>
            <Link
              to="/docs"
              className="px-4 py-2 bg-[#C8FF00] text-obsidian font-semibold rounded-[4px] text-sm hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              <FileText size={14} /> View Full API Documentation
            </Link>
            <a
              href="/pricing.md"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-white/[0.04] border border-glass-border rounded-[4px] text-sm text-cream/70 hover:text-[#C8FF00] hover:border-[#C8FF00] transition-all flex items-center gap-1.5"
            >
              <ExternalLink size={14} /> Pricing & Quota Spec (pricing.md)
            </a>
            <a
              href="/developers.md"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-white/[0.04] border border-glass-border rounded-[4px] text-sm text-cream/70 hover:text-[#C8FF00] hover:border-[#C8FF00] transition-all flex items-center gap-1.5"
            >
              <ExternalLink size={14} /> Agent Markdown (developers.md)
            </a>
          </div>
        </div>

        {/* Rate Limits */}
        <h2 className="font-display text-2xl font-bold mb-6">API Rate Limits & Quotas</h2>
        <div className="bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden mb-12">
          <div className="grid grid-cols-4 gap-0 text-sm font-semibold px-6 py-3 border-b border-glass-border bg-white/[0.02]">
            <span>Plan Tier</span>
            <span>Requests / min</span>
            <span>Requests / day</span>
            <span>Concurrent</span>
          </div>
          {[
            { plan: 'Community / Free', rpm: '60', rpd: '1,000', concurrent: '5', note: 'Standard token' },
            { plan: 'Developer Pro', rpm: '600', rpd: '50,000', concurrent: '25', note: 'Dedicated keys' },
            { plan: 'Enterprise SLA', rpm: 'Custom (Unlimited)', rpd: 'Unlimited', concurrent: 'Unlimited', note: 'Dedicated throughput' },
          ].map((r, i) => (
            <div key={i} className="grid grid-cols-4 gap-0 text-sm px-6 py-3 border-b border-glass-border last:border-b-0 hover:bg-white/[0.02] transition-colors items-center">
              <span className="font-medium text-cream">{r.plan}</span>
              <span className="text-cream/60 font-mono">{r.rpm}</span>
              <span className="text-cream/60 font-mono">{r.rpd}</span>
              <span className="text-[#C8FF00] font-mono">{r.concurrent}</span>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="p-8 bg-gradient-to-r from-obsidian-2 via-obsidian-2 to-[#C8FF00]/5 border border-glass-border rounded-[16px] flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-xl font-bold mb-2">Ready to generate your API credentials?</h3>
            <p className="text-sm text-cream/60">Generate signed API tokens and start building autonomous integrations immediately.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/profile" className="btn-primary text-sm px-6 py-3">
              Generate API Key
            </Link>
            <Link to="/docs" className="btn-outline text-sm px-6 py-3">
              Browse Endpoints
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

