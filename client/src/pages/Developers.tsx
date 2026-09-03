import { Code, Download, Key, Webhook, FileText, Terminal } from 'lucide-react'

export default function Developers() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="max-w-[700px] mb-16">
          <span className="label-mono">Developer Platform</span>
          <h1 className="section-title mt-3 mb-6">Build with HMorix</h1>
          <p className="text-lg text-cream/60 leading-relaxed">Everything you need to integrate HMorix products into your applications. SDKs, APIs, webhooks, and comprehensive documentation.</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {[
            { icon: FileText, title: 'API Documentation', desc: 'Complete reference for all HMorix APIs with examples and schemas.', badge: 'v2.4' },
            { icon: Download, title: 'SDK Downloads', desc: 'Official SDKs for JavaScript, Python, Go, Ruby, and PHP.', badge: '5 languages' },
            { icon: Code, title: 'Code Examples', desc: 'Ready-to-use code snippets and starter templates.', badge: '120+ examples' },
            { icon: Key, title: 'API Keys', desc: 'Manage your API keys, rate limits, and access permissions.', badge: 'Secure' },
            { icon: Terminal, title: 'Sandbox', desc: 'Test API calls in a safe environment without affecting production.', badge: 'Free' },
            { icon: Webhook, title: 'Webhooks', desc: 'Real-time event notifications for your application.', badge: '40+ events' },
          ].map((item, i) => (
            <div key={i} className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px] hover:border-[rgba(200,255,0,0.2)] transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <item.icon size={24} className="text-[#C8FF00]" />
                <span className="text-[10px] px-2 py-0.5 bg-[#C8FF00]/10 text-[#C8FF00] rounded-full">{item.badge}</span>
              </div>
              <h3 className="font-display font-semibold mb-2 group-hover:text-[#C8FF00] transition-colors">{item.title}</h3>
              <p className="text-sm text-cream/50">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Code Example */}
        <h2 className="font-display text-2xl font-bold mb-6">Quick Start</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
          <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold">JavaScript / TypeScript</span>
              <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded-full">Node.js</span>
            </div>
            <div className="bg-obsidian border border-glass-border rounded-[8px] p-4 font-mono text-xs leading-relaxed overflow-x-auto">
              <div><span className="text-blue-400">import</span> {'{'} HMorix {'}'} <span className="text-blue-400">from</span> <span className="text-green-400">'@hmorix/sdk'</span></div>
              <div className="mt-2"><span className="text-blue-400">const</span> hmorix = <span className="text-blue-400">new</span> <span className="text-yellow-400">HMorix</span>({'{'}</div>
              <div className="pl-4">apiKey: process.env.<span className="text-cream">HMORIX_API_KEY</span></div>
              <div>{'}'})</div>
              <div className="mt-3 text-cream/35">// Generate a website</div>
              <div><span className="text-blue-400">const</span> result = <span className="text-blue-400">await</span> hmorix.agent.<span className="text-yellow-400">generate</span>({'{'}</div>
              <div className="pl-4">prompt: <span className="text-green-400">'Build a landing page'</span>,</div>
              <div className="pl-4">framework: <span className="text-green-400">'react'</span>,</div>
              <div className="pl-4">style: <span className="text-green-400">'modern'</span></div>
              <div>{'}'})</div>
              <div className="mt-2">console.<span className="text-yellow-400">log</span>(result.url)</div>
            </div>
          </div>
          <div className="p-6 bg-obsidian-2 border border-glass-border rounded-[16px]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold">Python</span>
              <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full">pip</span>
            </div>
            <div className="bg-obsidian border border-glass-border rounded-[8px] p-4 font-mono text-xs leading-relaxed overflow-x-auto">
              <div><span className="text-blue-400">from</span> hmorix <span className="text-blue-400">import</span> HMorix</div>
              <div className="mt-2">client = <span className="text-yellow-400">HMorix</span>(api_key=<span className="text-green-400">"your-key"</span>)</div>
              <div className="mt-3 text-cream/35"># Process PDF documents</div>
              <div>result = client.pdf.<span className="text-yellow-400">extract</span>(</div>
              <div className="pl-4">file_path=<span className="text-green-400">"invoice.pdf"</span>,</div>
              <div className="pl-4">fields=[<span className="text-green-400">"total"</span>, <span className="text-green-400">"date"</span>, <span className="text-green-400">"vendor"</span>]</div>
              <div>)</div>
              <div className="mt-2"><span className="text-blue-400">print</span>(result.data)</div>
              <div className="text-cream/35"># {'{'}'total': '$4,200', 'date': '2024-06-15', 'vendor': 'Acme Inc'{'}'}</div>
            </div>
          </div>
        </div>

        {/* Live Interactive Sandbox */}
        <div className="p-8 bg-obsidian-2 border border-glass-border rounded-[16px] mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="text-[#C8FF00]" size={22} />
            <h2 className="font-display text-xl font-bold">Interactive API Sandbox</h2>
          </div>
          <p className="text-sm text-cream/60 mb-6">
            Test live API endpoints directly in your browser. All sandbox requests return production-accurate data without mutating account state.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <button
              onClick={() => {
                fetch('/api/health').then(r => r.json()).then(d => {
                  const el = document.getElementById('sandbox-output')
                  if (el) el.textContent = JSON.stringify(d, null, 2)
                }).catch(() => {
                  const el = document.getElementById('sandbox-output')
                  if (el) el.textContent = '{"status": "Probe error"}'
                })
              }}
              className="px-4 py-2.5 bg-obsidian border border-glass-border hover:border-[#C8FF00] rounded-[6px] text-xs font-mono text-left transition-colors"
            >
              <span className="text-blue-400 font-bold">GET</span> /api/health
            </button>
            <button
              onClick={() => {
                fetch('/api/status').then(r => r.json()).then(d => {
                  const el = document.getElementById('sandbox-output')
                  if (el) el.textContent = JSON.stringify(d, null, 2)
                }).catch(() => {
                  const el = document.getElementById('sandbox-output')
                  if (el) el.textContent = '{"status": "Probe error"}'
                })
              }}
              className="px-4 py-2.5 bg-obsidian border border-glass-border hover:border-[#C8FF00] rounded-[6px] text-xs font-mono text-left transition-colors"
            >
              <span className="text-blue-400 font-bold">GET</span> /api/status
            </button>
            <button
              onClick={() => {
                fetch('/api/services').then(r => r.json()).then(d => {
                  const el = document.getElementById('sandbox-output')
                  if (el) el.textContent = JSON.stringify(d, null, 2)
                }).catch(() => {
                  const el = document.getElementById('sandbox-output')
                  if (el) el.textContent = '{"status": "Probe error"}'
                })
              }}
              className="px-4 py-2.5 bg-obsidian border border-glass-border hover:border-[#C8FF00] rounded-[6px] text-xs font-mono text-left transition-colors"
            >
              <span className="text-blue-400 font-bold">GET</span> /api/services
            </button>
          </div>
          <pre id="sandbox-output" className="p-4 bg-obsidian border border-glass-border rounded-[8px] font-mono text-xs text-cream/70 overflow-x-auto max-h-[220px]">
            {"// Click an endpoint above to run a live sandbox probe"}
          </pre>
        </div>

        {/* CLI Tool */}
        <div id="cli" className="p-8 bg-obsidian-2 border border-glass-border rounded-[16px] mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">Official CLI Tool (@hmorix/cli)</h2>
            <span className="text-xs px-2.5 py-1 bg-[#C8FF00]/10 text-[#C8FF00] rounded-full font-mono">v1.0.0</span>
          </div>
          <p className="text-sm text-cream/60 mb-6">
            The official command-line interface lets agents and developers script interactions, inspect OpenAPI schemas, and invoke AI agents from the terminal.
          </p>
          <div className="bg-obsidian border border-glass-border rounded-[8px] p-4 font-mono text-xs leading-relaxed overflow-x-auto mb-4 text-cream/80">
            <div className="text-cream/40"># Run instantly without global install</div>
            <div className="text-[#C8FF00]">npx @hmorix/cli status</div>
            <div className="mt-3 text-cream/40"># Install globally via npm</div>
            <div>npm install -g @hmorix/cli</div>
            <div className="mt-3 text-cream/40"># Fetch OpenAPI schema</div>
            <div>hmorix openapi</div>
            <div className="mt-3 text-cream/40"># Trigger AI Agent prompt</div>
            <div>hmorix agent "Check invoice status for INV-2841"</div>
          </div>
        </div>

        {/* OpenAPI */}
        <div className="p-8 bg-obsidian-2 border border-glass-border rounded-[16px] mb-12">
          <h2 className="font-display text-xl font-bold mb-4">OpenAPI Specification</h2>
          <p className="text-sm text-cream/60 mb-6">Our complete API is documented using OpenAPI 3.0. Import the spec into your favorite API client or LLM function calling workflow.</p>
          <div className="flex gap-3 flex-wrap">
            <a href="/openapi.json" target="_blank" rel="noreferrer" className="px-4 py-2 bg-white/[0.04] border border-glass-border rounded-[4px] text-sm text-cream/60 hover:text-[#C8FF00] hover:border-[#C8FF00] transition-all">Download OpenAPI Spec (JSON)</a>
            <a href="/openapi.yaml" target="_blank" rel="noreferrer" className="px-4 py-2 bg-white/[0.04] border border-glass-border rounded-[4px] text-sm text-cream/60 hover:text-[#C8FF00] hover:border-[#C8FF00] transition-all">Download OpenAPI Spec (YAML)</a>
            <a href="/docs" className="px-4 py-2 bg-[#C8FF00] text-obsidian font-semibold rounded-[4px] text-sm hover:opacity-90 transition-all">View API Documentation</a>
            <a href="/pricing.md" target="_blank" rel="noreferrer" className="px-4 py-2 bg-white/[0.04] border border-glass-border rounded-[4px] text-sm text-cream/60 hover:text-[#C8FF00] hover:border-[#C8FF00] transition-all">Pricing Spec (pricing.md)</a>
          </div>
        </div>

        {/* Rate Limits */}
        <h2 className="font-display text-2xl font-bold mb-6">Rate Limits</h2>
        <div className="bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden">
          <div className="grid grid-cols-4 gap-0 text-sm font-semibold px-6 py-3 border-b border-glass-border bg-white/[0.02]">
            <span>Plan</span><span>Requests/min</span><span>Requests/day</span><span>Concurrent</span>
          </div>
          {[
            { plan: 'Free', rpm: '60', rpd: '1,000', concurrent: '5' },
            { plan: 'Pro', rpm: '600', rpd: '50,000', concurrent: '25' },
            { plan: 'Enterprise', rpm: 'Unlimited', rpd: 'Unlimited', concurrent: 'Unlimited' },
          ].map((r, i) => (
            <div key={i} className="grid grid-cols-4 gap-0 text-sm px-6 py-3 border-b border-glass-border last:border-b-0 hover:bg-white/[0.02]">
              <span className="font-medium">{r.plan}</span>
              <span className="text-cream/50">{r.rpm}</span>
              <span className="text-cream/50">{r.rpd}</span>
              <span className="text-cream/50">{r.concurrent}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
