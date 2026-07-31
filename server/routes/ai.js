const express = require('express')

const router = express.Router()

function sanitizeText(value, max = 1200) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)
}

function siteAssistantFallback(message) {
  const text = message.toLowerCase()
  if (text.includes('forgot') || text.includes('password')) return { reply: 'To reset your password, open Forgot Password, enter your email, then use the 6 digit OTP sent to your Gmail inbox to set a new password.', actions: [{ label: 'Open Forgot Password', href: '/forgot-password' }, { label: 'Find Account', href: '/search-account' }] }
  if (text.includes('blog')) return { reply: 'For blogs, open the Blog page to read published posts. Admin users can manage drafts, pending posts, published posts, JSON imports, and exports from Blog Manager.', actions: [{ label: 'Open Blogs', href: '/blog' }, { label: 'Blog Manager', href: '/admin/blogs' }] }
  if (text.includes('profile')) return { reply: 'Open your Profile page to update personal information, profile picture, cover image, social links, billing, API keys, sessions, and account security settings.', actions: [{ label: 'Open Profile', href: '/profile' }, { label: 'Settings', href: '/settings' }] }
  if (text.includes('payroll') || text.includes('hrm') || text.includes('employee')) return { reply: 'The HRM area includes real employee overview, departments, tasks, payroll runs, recruitment, leave requests, and performance summaries.', actions: [{ label: 'Open HRM', href: '/hrm' }, { label: 'Payroll', href: '/hrm/payroll' }, { label: 'Tasks', href: '/employee/tasks' }] }
  if (text.includes('seo') || text.includes('service')) return { reply: 'HMorix offers web app development, hosting, automation, AI integration, software development, SEO, and product services for Hathras, Mathura, Aligarh, Agra, Vrindavan, Delhi, Noida, Mumbai, and Bengaluru.', actions: [{ label: 'View Services', href: '/services' }, { label: 'Contact HMorix', href: '/contact' }] }
  return { reply: 'I can help you navigate HMorix services, blogs, profile settings, password reset, HRM, BillingFlow, PDF Automation, AI Agent, and support pages. Tell me what you want to do.', actions: [{ label: 'Services', href: '/services' }, { label: 'Contact', href: '/contact' }, { label: 'Support', href: '/support' }] }
}

function nvidiaApiKey() {
  return process.env.NVIDIA_API_KEY || process.env.NVAPI_KEY || ''
}

function nvidiaModel() {
  return process.env.NVIDIA_MODEL || 'nvidia/deepseek-v4-flash'
}

async function askNvidia({ messages, temperature = 0.35, maxTokens = 700 }) {
  const apiKey = nvidiaApiKey()
  if (!apiKey) {
    const error = new Error('NVIDIA_API_KEY is not configured on the server.')
    error.code = 'NVIDIA_CONFIG'
    throw error
  }

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: nvidiaModel(),
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data?.error?.message || data?.message || `NVIDIA request failed with ${response.status}`)
  }
  return data?.choices?.[0]?.message?.content || ''
}

router.get('/ai/status', (_req, res) => {
  const key = nvidiaApiKey()
  res.json({
    success: true,
    nvidiaConfigured: Boolean(key),
    keySource: process.env.NVIDIA_API_KEY ? 'NVIDIA_API_KEY' : process.env.NVAPI_KEY ? 'NVAPI_KEY' : null,
    keyPrefix: key ? `${key.slice(0, 8)}...${key.slice(-4)}` : null,
    model: nvidiaModel(),
  })
})

router.post('/ai/chat', async (req, res) => {
  const message = sanitizeText(req.body?.message || '', 1200)
  if (!message) return res.status(400).json({ error: 'Message is required' })

  const fallback = siteAssistantFallback(message)
  try {
    const reply = await askNvidia({
      messages: [
        { role: 'system', content: 'You are HMorix AI Assistant. Answer using HMorix website knowledge. Be concise. For actions, mention exact pages: /forgot-password, /search-account, /blog, /profile, /settings, /services, /contact, /hrm, /hrm/payroll, /employee/tasks, /playground. Never ask for passwords or secrets.' },
        { role: 'user', content: message },
      ],
      temperature: 0.3,
      maxTokens: 500,
    })
    return res.json({ success: true, reply: reply || fallback.reply, actions: fallback.actions, provider: 'nvidia' })
  } catch (error) {
    return res.json({ success: true, ...fallback, provider: 'fallback', providerError: error.message || 'NVIDIA request failed' })
  }
})

router.post('/ai/playground', async (req, res) => {
  const type = sanitizeText(req.body?.type || 'chat', 40)
  const prompt = sanitizeText(req.body?.prompt || '', 2000)
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' })

  const connections = { website: 'Orix Labs', pdf: 'HMorix PDF Editor', invoice: 'Orix Billing Flow', workflow: 'HMorix Builder', chat: 'HMorix AI Assistant' }
  const taskPrompts = {
    website: 'Generate a practical website build plan with sections, UI structure, tech stack, SEO notes, and implementation steps.',
    pdf: 'Design a PDF automation extraction plan. Include fields, validation, output JSON shape, and workflow steps.',
    invoice: 'Generate an invoice workflow and invoice draft from the prompt. Include line items, taxes, due date handling, and sync notes.',
    workflow: 'Design an automation workflow. Include trigger, conditions, actions, failure handling, and deployment notes.',
    chat: 'Answer as the HMorix AI Assistant.',
  }

  const fallback = siteAssistantFallback(prompt).reply
  try {
    const result = await askNvidia({
      messages: [
        { role: 'system', content: `You power the ${connections[type] || 'HMorix AI Playground'} demo. ${taskPrompts[type] || taskPrompts.chat} Return useful dynamic output for the user's exact prompt. Do not say this is static or a template.` },
        { role: 'user', content: prompt },
      ],
      temperature: 0.45,
      maxTokens: 900,
    })
    return res.json({ success: true, result: result || fallback, reply: result || fallback, status: `Live NVIDIA: ${connections[type] || 'AI'}`, provider: 'nvidia' })
  } catch (error) {
    return res.json({ success: true, result: fallback, reply: fallback, status: 'NVIDIA fallback', provider: 'fallback', providerError: error.message || 'NVIDIA request failed' })
  }
})

module.exports = router
