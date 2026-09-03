import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  const queryPath = String(req.query.path || req.url || '').split('?')[0]

  res.status(404)
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
  res.setHeader('Vary', 'Accept, Accept-Encoding')
  res.setHeader('Access-Control-Allow-Origin', '*')

  const body = `# 404 Not Found

The requested resource \`${queryPath}\` was not found on HMorix (\`https://hmorix.in\`).

## Discoverable Resources for Agents & Developers
- [Homepage](https://hmorix.in/)
- [LLMs Index & Instructions](https://hmorix.in/llms.txt)
- [XML Sitemap](https://hmorix.in/sitemap.xml)
- [Public API Documentation](https://hmorix.in/docs)
- [Developer Portal & Sandbox](https://hmorix.in/developers)
- [OpenAPI Specification](https://hmorix.in/openapi.json)
- [Pricing Specifications](https://hmorix.in/pricing.md)
- [Agent Instructions](https://hmorix.in/agent-instructions.txt)
`

  res.send(body)
}
