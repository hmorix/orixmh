export const fallbackPosts = [
  { id: 'building-ai-agents-at-scale', slug: 'building-ai-agents-at-scale', title: 'Building AI Agents at Scale: Lessons from 10,000 Deployments', excerpt: 'How we architected our AI agent platform to handle enterprise-grade workloads with sub-second response times and 99.99% reliability.', category: 'Engineering', author: 'Hamza Morix', date: 'Jun 28, 2024', publishedAt: '2024-06-28', readTime: '12 min', tags: ['Engineering', 'AI Agents'], featured: true },
  { id: 'introducing-billingflow-v3', slug: 'introducing-billingflow-v3', title: 'Introducing BillingFlow v3: The Future of Automated Invoicing', excerpt: 'A complete rewrite with real-time sync, multi-currency support, and AI-powered anomaly detection.', category: 'Product Updates', author: 'Sarah Chen', date: 'Jun 25, 2024', publishedAt: '2024-06-25', readTime: '8 min', tags: ['BillingFlow', 'Product'], featured: true },
  { id: 'zero-trust-architecture', slug: 'zero-trust-architecture', title: 'Implementing Zero-Trust Architecture in Enterprise SaaS', excerpt: 'Our journey to implementing zero-trust security across all HMorix services, reducing attack surface by 94%.', category: 'Security', author: 'Mike Johnson', date: 'Jun 22, 2024', publishedAt: '2024-06-22', readTime: '15 min', tags: ['Security'], featured: false },
  { id: 'pdf-extraction-ml-pipeline', slug: 'pdf-extraction-ml-pipeline', title: 'How Our ML Pipeline Achieves 99.2% PDF Extraction Accuracy', excerpt: 'Deep dive into the transformer-based models powering our document intelligence engine.', category: 'AI & ML', author: 'Dr. Emily Park', date: 'Jun 20, 2024', publishedAt: '2024-06-20', readTime: '18 min', tags: ['AI & ML'], featured: false },
  { id: 'scaling-to-million-users', slug: 'scaling-to-million-users', title: 'Scaling HMorix Cloud to 1 Million Users', excerpt: 'Infrastructure decisions, database sharding strategies, and edge computing that made it possible.', category: 'Engineering', author: 'Alex Rivera', date: 'Jun 18, 2024', publishedAt: '2024-06-18', readTime: '14 min', tags: ['Engineering'], featured: false },
  { id: 'smart-home-iot-security', slug: 'smart-home-iot-security', title: 'IoT Security Best Practices for Smart Home Systems', excerpt: 'How we secure millions of connected devices with end-to-end encryption and firmware validation.', category: 'Security', author: 'James Wu', date: 'Jun 15, 2024', publishedAt: '2024-06-15', readTime: '10 min', tags: ['Security', 'IoT'], featured: false },
  { id: 'react-performance-optimization', slug: 'react-performance-optimization', title: 'React Performance: How We Cut Load Times by 60%', excerpt: 'Code splitting, lazy loading, and virtual scrolling techniques that transformed our dashboard performance.', category: 'Tutorials', author: 'Lisa Martinez', date: 'Jun 12, 2024', publishedAt: '2024-06-12', readTime: '11 min', tags: ['React'], featured: false },
  { id: 'series-b-announcement', slug: 'series-b-announcement', title: 'HMorix Raises $42M Series B to Expand AI Platform', excerpt: 'We\'re thrilled to announce our Series B funding led by Sequoia Capital to accelerate our enterprise AI vision.', category: 'Company', author: 'Hamza Morix', date: 'Jun 10, 2024', publishedAt: '2024-06-10', readTime: '5 min', tags: ['Company'], featured: false },
  { id: 'workflow-automation-guide', slug: 'workflow-automation-guide', title: 'Complete Guide to Workflow Automation with HMorix Agent', excerpt: 'Step-by-step tutorial on building complex multi-step workflows with conditional logic and error handling.', category: 'Tutorials', author: 'David Kim', date: 'Jun 8, 2024', publishedAt: '2024-06-08', readTime: '20 min', tags: ['Tutorials'], featured: false },
  { id: 'enterprise-case-meridian', slug: 'enterprise-case-meridian', title: 'How Meridian Corp Saved $2.4M with BillingFlow', excerpt: 'A detailed look at how one of our enterprise clients transformed their billing operations.', category: 'Case Studies', author: 'Sarah Chen', date: 'Jun 5, 2024', publishedAt: '2024-06-05', readTime: '9 min', tags: ['Case Studies'], featured: false },
  { id: 'kubernetes-deployment-patterns', slug: 'kubernetes-deployment-patterns', title: 'Advanced Kubernetes Deployment Patterns for AI Workloads', excerpt: 'GPU scheduling, model serving, and auto-scaling strategies for production ML systems.', category: 'Engineering', author: 'Alex Rivera', date: 'Jun 3, 2024', publishedAt: '2024-06-03', readTime: '16 min', tags: ['Engineering'], featured: false },
  { id: 'gdpr-compliance-automation', slug: 'gdpr-compliance-automation', title: 'Automating GDPR Compliance with AI-Powered Data Discovery', excerpt: 'How our compliance engine automatically identifies, classifies, and manages personal data across systems.', category: 'Security', author: 'Mike Johnson', date: 'Jun 1, 2024', publishedAt: '2024-06-01', readTime: '13 min', tags: ['Security'], featured: false },
]

export const fallbackPostsContent = {
  'building-ai-agents-at-scale': {
    title: 'Building AI Agents at Scale: Lessons from 10,000 Deployments',
    author: 'Hamza Morix', role: 'CEO & Founder', date: 'Jun 28, 2024', readTime: '12 min', category: 'Engineering',
    content: [
      { type: 'paragraph', text: 'When we first launched our AI Agent platform in 2023, we had no idea it would scale to over 10,000 active deployments within a year. The journey from prototype to enterprise-grade infrastructure taught us invaluable lessons about building reliable, scalable AI systems.' },
      { type: 'heading', text: 'The Architecture Challenge' },
      { type: 'paragraph', text: 'Traditional request-response architectures don\'t work for AI agents. Agents need to maintain state, handle long-running tasks, and coordinate between multiple services. We built a custom orchestration layer using event-driven architecture with Apache Kafka for message passing and Redis for state management.' },
      { type: 'code', text: '// Agent orchestration example\nconst agent = new HMorixAgent({\n  model: "hmorix-gpt-4",\n  memory: "persistent",\n  tools: ["web-search", "code-exec", "file-ops"],\n  maxSteps: 50,\n  timeout: 300000\n});\n\nawait agent.execute({\n  task: "Analyze Q3 sales data and generate report",\n  context: userContext,\n  callbacks: { onStep, onComplete, onError }\n});' },
      { type: 'heading', text: 'Scaling Challenges' },
      { type: 'paragraph', text: 'At 1,000 concurrent agents, we hit our first major bottleneck: GPU memory. Each agent instance required dedicated inference capacity, and cold starts were killing user experience. Our solution was a multi-tier caching system with pre-warmed model pools.' },
      { type: 'paragraph', text: 'We implemented speculative execution - predicting the next likely tool call and pre-loading resources before the agent requests them. This reduced average step latency from 2.3s to 0.8s.' },
      { type: 'heading', text: 'Reliability at Enterprise Scale' },
      { type: 'paragraph', text: 'Enterprise clients demand 99.99% uptime. We achieved this through: multi-region deployment with automatic failover, circuit breakers on all external service calls, graceful degradation when GPU capacity is constrained, and comprehensive observability with distributed tracing.' },
      { type: 'heading', text: 'Key Takeaways' },
      { type: 'paragraph', text: '1. Design for failure from day one. Every component should be independently deployable and recoverable.\n2. Invest heavily in observability. You can\'t fix what you can\'t see.\n3. Cache aggressively but invalidate carefully.\n4. Build escape hatches for every automated process.\n5. Test with chaos engineering - we run weekly failure injection exercises.' },
    ]
  },
  'introducing-billingflow-v3': {
    title: 'Introducing BillingFlow v3: The Future of Automated Invoicing',
    author: 'Sarah Chen', role: 'VP of Product', date: 'Jun 25, 2024', readTime: '8 min', category: 'Product Updates',
    content: [
      { type: 'paragraph', text: 'Today we\'re excited to announce BillingFlow v3 - a ground-up rewrite that brings real-time sync, multi-currency support, AI-powered anomaly detection, and a completely redesigned API to our billing automation platform.' },
      { type: 'heading', text: 'What\'s New in v3' },
      { type: 'paragraph', text: 'BillingFlow v3 represents 18 months of engineering effort, driven by feedback from over 2,000 enterprise customers. Here are the highlights:' },
      { type: 'paragraph', text: '- Real-time sync: Invoices now sync across all connected systems within 200ms\n- Multi-currency: Native support for 135 currencies with automatic FX rate updates\n- AI Anomaly Detection: Automatically flags unusual billing patterns before they become problems\n- Webhook 2.0: Guaranteed delivery with automatic retries and dead letter queues\n- GraphQL API: In addition to REST, we now offer a full GraphQL API for complex queries' },
      { type: 'code', text: '// BillingFlow v3 API example\nconst invoice = await billingflow.invoices.create({\n  customer: "cus_meridian_001",\n  currency: "USD",\n  items: [\n    { description: "Enterprise License", amount: 4999, quantity: 1 },\n    { description: "API Calls (overage)", amount: 0.002, quantity: 15420 }\n  ],\n  auto_send: true,\n  payment_terms: 30,\n  ai_review: true\n});' },
      { type: 'heading', text: 'Migration Path' },
      { type: 'paragraph', text: 'We\'ve built a zero-downtime migration tool that handles the transition from v2 to v3 automatically. Most customers can migrate in under 5 minutes with no code changes required for basic usage.' },
    ]
  }
}

export function normalizePost(post) {
  const slug = post.slug || post.id
  const publishedAt = post.publishedAt || post.published_at || post.date
  return {
    ...post,
    id: post.id || slug,
    slug,
    excerpt: post.excerpt || stripHtml(post.content || '').slice(0, 160),
    author: typeof post.author === 'object' ? post.author.name : post.author,
    date: formatDate(publishedAt),
    readTime: post.readTime || post.read_time || `${post.readingTime || post.reading_time || 1} min`,
    tags: Array.isArray(post.tags) ? post.tags : [],
    featured: Boolean(post.featured),
  }
}

export async function fetchBlogList() {
  const response = await fetch('/api/blog')
  if (!response.ok) throw new Error('Unable to load blog posts')
  const payload = await response.json()
  const data = Array.isArray(payload) ? payload : payload.data || payload.blogs || []
  return data.map(normalizePost)
}

export async function fetchBlogPost(slug) {
  const response = await fetch(`/api/blog/${encodeURIComponent(slug)}`)
  if (!response.ok) throw new Error('Unable to load blog post')
  const payload = await response.json()
  return normalizePostContent(payload.data || payload.blog || payload)
}

export function normalizePostContent(post) {
  const normalized = normalizePost(post)
  return {
    ...normalized,
    role: post.role || post.authorRole || post.author_role || 'HMorix Team',
    updatedDate: formatDate(post.updatedAt || post.updated_at),
    content: normalizeContent(post.content),
    seo: post.seo || {},
  }
}

function normalizeContent(content) {
  if (Array.isArray(content)) return content
  if (!content) return []
  return [{ type: 'html', text: content }]
}

function formatDate(value) {
  if (!value) return ''
  if (/^[A-Z][a-z]{2}\s/.test(String(value))) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function stripHtml(value) {
  return String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}
