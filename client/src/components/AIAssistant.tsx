import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, MessageCircle, X, Send } from 'lucide-react'
import { config } from '../lib/config'

type ChatAction = { label: string; href: string }
type ChatMessage = { role: 'assistant' | 'user'; content: string; actions?: ChatAction[] }

export default function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm the HMorix AI Assistant. I can help with services, blogs, profile, password reset, HRM, billing, PDF automation, and product pages.", actions: [{ label: 'Forgot Password', href: '/forgot-password' }, { label: 'Services', href: '/services' }] }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return
    const nextInput = input
    setMessages(prev => [...prev, { role: 'user', content: nextInput }])
    setInput('')
    setLoading(true)
    try {
      const response = await fetch(`${config.apiUrl}/ai/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: nextInput }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Assistant is unavailable')
      const debug = data.provider === 'fallback' && data.providerError ? `\n\nAI provider: ${data.providerError}` : ''
      setMessages(prev => [...prev, { role: 'assistant', content: `${data.reply || 'I can help you navigate HMorix.'}${debug}`, actions: data.actions || [] }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I can still help you navigate HMorix. For password reset use Forgot Password, for account changes use Profile, and for service questions open Services or Contact.', actions: [{ label: 'Forgot Password', href: '/forgot-password' }, { label: 'Profile', href: '/profile' }, { label: 'Contact', href: '/contact' }] }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(!open)} className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#C8FF00] rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
        {open ? <X size={24} className="text-obsidian" /> : <MessageCircle size={24} className="text-obsidian" />}
      </button>
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] bg-obsidian-2 border border-glass-border rounded-[16px] flex flex-col overflow-hidden shadow-2xl">
          <div className="px-4 py-3 border-b border-glass-border flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C8FF00]/20 rounded-full flex items-center justify-center"><MessageCircle size={16} className="text-[#C8FF00]" /></div>
            <div>
              <div className="text-sm font-semibold">HMorix AI</div>
              <div className="text-[10px] text-cream/40">Site-aware assistant</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[86%] px-3 py-2 rounded-[12px] text-sm ${msg.role === 'user' ? 'bg-[#C8FF00] text-obsidian' : 'bg-white/[0.06] text-cream/80'}`}>
                  {msg.content}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.actions.map(action => (
                        <Link key={`${action.href}-${action.label}`} to={action.href} onClick={() => setOpen(false)} className="px-2 py-1 rounded-[4px] bg-[#C8FF00]/10 border border-[#C8FF00]/20 text-[#C8FF00] text-[11px] hover:bg-[#C8FF00]/20">
                          {action.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-[12px] text-sm bg-white/[0.06] text-cream/60 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-[#C8FF00]" /> Thinking...
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-glass-border">
            <div className="flex items-center gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Ask anything..." className="flex-1 bg-white/[0.04] border border-glass-border rounded-[8px] px-3 py-2 text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />
              <button onClick={handleSend} disabled={loading} className="w-9 h-9 bg-[#C8FF00] rounded-[8px] flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"><Send size={16} className="text-obsidian" /></button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
