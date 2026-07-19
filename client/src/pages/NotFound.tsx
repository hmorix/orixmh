import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, Search } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  const popular = [
    { title: 'AI Solutions', path: '/services/ai-solutions' },
    { title: 'BillingFlow', path: '/billingflow' },
    { title: 'Security', path: '/security' },
  ]

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-[880px] mx-auto px-8 text-center">
        <div className="text-[#C8FF00] font-mono text-sm mb-4">404</div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-cream mb-4">Page not found</h1>
        <p className="text-cream/50 max-w-[560px] mx-auto mb-8">The page you are looking for is unavailable or has moved.</p>

        <form action="/blog" className="max-w-[520px] mx-auto mb-8">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" />
            <input name="search" type="search" placeholder="Search HMorix" className="w-full pl-11 pr-4 py-3 bg-obsidian-2 border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00]" />
          </div>
        </form>

        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-10">
          <Link to="/" className="btn-primary flex items-center justify-center gap-2"><Home size={16} /> Go Home</Link>
          <button onClick={() => navigate(-1)} className="btn-outline flex items-center justify-center gap-2"><ArrowLeft size={16} /> Go Back</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          {popular.map(item => (
            <Link key={item.path} to={item.path} className="p-4 bg-obsidian-2 border border-glass-border rounded-[8px] text-sm text-cream/70 hover:text-cream hover:border-[#C8FF00]/40 transition-all">
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
