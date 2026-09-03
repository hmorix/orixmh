import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Terminal, Key, Shield, Code, Check, Copy, ExternalLink, Download } from 'lucide-react'
import SEOHead from '../components/seo/SEOHead'

export default function Docs() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const endpoints = [
    {
      method: 'GET',
      path: '/api/health',
      title: 'Platform Health Probe',
      desc: 'Returns operational connectivity status for the API gateway and underlying MongoDB Atlas cluster.',
      curl: 'curl -s -X GET "https://hmorix.in/api/health" \\\n  -H "Accept: application/json"',
      response: '{\n  "success": true,\n  "status": {\n    "api": true,\n    "mongodb": true,\n    "supabase": true\n  },\n  "timestamp": "2026-09-03T03:00:00.000Z"\n}'
    },
    {
      method: 'GET',
      path: '/api/status',
      title: 'Live Platform Status & Latency',
      desc: 'Retrieves component-by-component uptime percentages, incident history, and gateway response times.',
      curl: 'curl -s -X GET "https://hmorix.in/api/status"',
      response: '{\n  "success": true,\n  "overall": "operational",\n  "services": [\n    { "name": "API Gateway", "status": "operational", "uptime": 99.99, "latency": "12ms" },\n    { "name": "AI Agent Engine", "status": "operational", "uptime": 99.95, "latency": "230ms" },\n    { "name": "BillingFlow", "status": "operational", "uptime": 99.99, "latency": "15ms" }\n  ]\n}'
    },
    {
      method: 'GET',
      path: '/api/services',
      title: 'List Active Services & Packages',
      desc: 'Returns public service definitions, starting prices, and solution descriptions across web, mobile, and AI.',
      curl: 'curl -s -X GET "https://hmorix.in/api/services"',
      response: '{\n  "success": true,\n  "data": [\n    {\n      "id": "ai-solutions",\n      "name": "AI & Machine Learning",\n      "startingPrice": 9999,\n      "popular": true\n    }\n  ]\n}'
    },
    {
      method: 'POST',
      path: '/api/contact',
      title: 'Submit Inquiry / CRM Lead',
      desc: 'Submits a client inquiry to sales triage and creates an automated CRM pipeline lead entry.',
      curl: 'curl -s -X POST "https://hmorix.in/api/contact" \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "first_name": "Dev",\n    "last_name": "Lead",\n    "email": "dev@company.com",\n    "service": "Enterprise AI Software",\n    "message": "We need custom API integration."\n  }\'',
      response: '{\n  "success": true,\n  "message": "Thank you for contacting us. We will get back to you soon."\n}'
    },
    {
      method: 'POST',
      path: '/api/ai/chat',
      title: 'AI Agent Autonomous Chat',
      desc: 'Executes conversational reasoning and tool calling via HMorix AI orchestration (NVIDIA NIM Llama 3.1 405B).',
      curl: 'curl -s -X POST "https://hmorix.in/api/ai/chat" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"message": "What is BillingFlow GST automation?"}\'',
      response: '{\n  "success": true,\n  "reply": "BillingFlow is HMorix\'s automated financial invoicing platform..."\n}'
    }
  ]

  return (
    <>
      <SEOHead
        title="HMorix Public API Documentation – Endpoints & Authentication"
        description="Comprehensive public REST API reference for HMorix. Endpoints, request schemas, authentication tokens, and LLM function calling integration."
        keywords="HMorix API, API documentation, REST API, OpenAPI 3.0, developer docs, function calling"
        canonical="/docs"
      />
      <div className="pt-32 pb-24">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="max-w-[800px] mb-12">
            <span className="label-mono">Documentation</span>
            <h1 className="section-title mt-3 mb-4">HMorix Public API Reference</h1>
            <p className="text-base sm:text-lg text-cream/60 leading-relaxed">
              Complete documentation for the HMorix REST API. Designed for developers, automated workflows, and LLM function-calling systems.
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap gap-3 mb-12">
            <a
              href="/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-obsidian-2 border border-glass-border hover:border-[#C8FF00] text-cream/70 hover:text-[#C8FF00] rounded-[4px] text-xs font-mono flex items-center gap-2 transition-all"
            >
              <Download size={14} /> OpenAPI 3.0 (JSON)
            </a>
            <a
              href="/openapi.yaml"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-obsidian-2 border border-glass-border hover:border-[#C8FF00] text-cream/70 hover:text-[#C8FF00] rounded-[4px] text-xs font-mono flex items-center gap-2 transition-all"
            >
              <Download size={14} /> OpenAPI 3.0 (YAML)
            </a>
            <Link
              to="/developers"
              className="px-4 py-2 bg-obsidian-2 border border-glass-border hover:border-[#C8FF00] text-cream/70 hover:text-[#C8FF00] rounded-[4px] text-xs font-mono flex items-center gap-2 transition-all"
            >
              <ExternalLink size={14} /> Developer Sandbox
            </Link>
            <a
              href="/pricing.md"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-obsidian-2 border border-glass-border hover:border-[#C8FF00] text-cream/70 hover:text-[#C8FF00] rounded-[4px] text-xs font-mono flex items-center gap-2 transition-all"
            >
              <Terminal size={14} /> Pricing & Quotas (pricing.md)
            </a>
            <a
              href="/llms.txt"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-obsidian-2 border border-glass-border hover:border-[#C8FF00] text-cream/70 hover:text-[#C8FF00] rounded-[4px] text-xs font-mono flex items-center gap-2 transition-all"
            >
              <Code size={14} /> Agent Instructions (llms.txt)
            </a>
          </div>

          {/* Authentication Section */}
          <div className="p-6 sm:p-8 bg-obsidian-2 border border-glass-border rounded-[12px] mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Key className="text-[#C8FF00]" size={22} />
              <h2 className="font-display text-xl font-bold">Authentication & Headers</h2>
            </div>
            <p className="text-sm text-cream/60 leading-relaxed mb-4">
              Pass your developer API key via Bearer token in the <code>Authorization</code> header:
            </p>
            <div className="bg-obsidian border border-glass-border rounded-[8px] p-4 font-mono text-xs text-[#C8FF00] mb-4">
              Authorization: Bearer hm_live_your_api_key_here
            </div>
            <div className="text-xs text-cream/40 space-y-1">
              <p>• Web browser sessions utilize signed HTTP-only cookies (<code>hm_session</code>) automatically.</p>
              <p>• All endpoints support Markdown negotiation: send <code>Accept: text/markdown</code> per acceptmarkdown.com.</p>
              <p>• Standard rate limits: Community (60 req/min), Pro (600 req/min), Enterprise (Unlimited).</p>
            </div>
          </div>

          {/* Endpoints List */}
          <div className="space-y-8">
            <h2 className="font-display text-2xl font-bold">Core Endpoints</h2>
            {endpoints.map((ep, idx) => (
              <div key={idx} className="p-6 sm:p-8 bg-obsidian-2 border border-glass-border rounded-[12px]">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${ep.method === 'GET' ? 'bg-blue-500/15 text-blue-400' : 'bg-green-500/15 text-green-400'}`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-sm sm:text-base font-semibold">{ep.path}</span>
                  </div>
                  <span className="text-xs font-mono text-cream/40">{ep.title}</span>
                </div>
                <p className="text-sm text-cream/60 mb-6">{ep.desc}</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-cream/40 font-mono mb-2">
                      <span>Request (cURL)</span>
                      <button
                        onClick={() => copyToClipboard(ep.curl, `curl-${idx}`)}
                        className="hover:text-cream flex items-center gap-1"
                      >
                        {copied === `curl-${idx}` ? <Check size={12} className="text-[#C8FF00]" /> : <Copy size={12} />}
                        <span>{copied === `curl-${idx}` ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-4 bg-obsidian border border-glass-border rounded-[8px] font-mono text-xs overflow-x-auto text-cream/80">
                      <code>{ep.curl}</code>
                    </pre>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-cream/40 font-mono mb-2">
                      <span>Example Response (200 OK)</span>
                      <button
                        onClick={() => copyToClipboard(ep.response, `res-${idx}`)}
                        className="hover:text-cream flex items-center gap-1"
                      >
                        {copied === `res-${idx}` ? <Check size={12} className="text-[#C8FF00]" /> : <Copy size={12} />}
                        <span>{copied === `res-${idx}` ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-4 bg-obsidian border border-glass-border rounded-[8px] font-mono text-xs overflow-x-auto text-cream/80">
                      <code>{ep.response}</code>
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
