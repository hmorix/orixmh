import type { VercelRequest, VercelResponse } from '@vercel/node'
import fs from 'fs'
import path from 'path'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
  res.setHeader('Vary', 'Accept, Accept-Encoding')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400')

  const queryPath = String(req.query.path || '').replace(/^\/+|\/+$/g, '').toLowerCase()

  // Map requested path to markdown file
  const fileMap: Record<string, string> = {
    '': 'llms.txt',
    'about': 'about.md',
    'contact': 'contact.md',
    'privacy': 'privacy.md',
    'terms': 'privacy.md',
    'developers': 'developers.md',
    'docs': 'docs.md',
    'pricing': 'pricing.md',
    'pricing.md': 'pricing.md',
    'llms.txt': 'llms.txt',
    'agent-instructions.txt': 'agent-instructions.txt'
  }

  const targetFile = fileMap[queryPath]

  if (targetFile) {
    const fullPath = path.join(process.cwd(), 'client', 'public', targetFile)
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8')
      return res.status(200).send(content)
    }
  }

  // Default homepage markdown summary for acceptmarkdown.com
  const defaultMarkdown = `# HMorix Enterprise Cloud Platform & AI Technology

> HMorix (https://hmorix.in) is India's premier enterprise AI software, web engineering, mobile app development, and business automation company founded by Harsh Sharma.
> Head Office: Hathras, Uttar Pradesh, India. Contact: support@hmorix.com / harsh@hmorix.in

## Core Products
- **BillingFlow (https://hmorix.in/billingflow):** Automated invoicing, multi-currency billing, real-time GST calculation (CGST, SGST, IGST), and subscription recovery.
- **AI Agent Platform (https://hmorix.in/agent):** Autonomous enterprise workflows, conversational assistants, and RAG document intelligence powered by NVIDIA NIM.
- **PDF Automation (https://hmorix.in/pdf-automation):** High-volume programmatic document creation and digital tax invoices.
- **Enterprise HRM (https://hmorix.in/hrm):** Human resource management, attendance tracking, and statutory Indian payroll processing.

## Machine-Readable Resources
- [OpenAPI Specification](https://hmorix.in/openapi.json)
- [Public API Documentation](https://hmorix.in/docs)
- [Developer Portal](https://hmorix.in/developers)
- [Pricing & Plan Quotas](https://hmorix.in/pricing.md)
- [LLMs Guide](https://hmorix.in/llms.txt)
- [Sitemap](https://hmorix.in/sitemap.xml)
`

  return res.status(200).send(defaultMarkdown)
}
