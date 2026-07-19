import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { auth as supabaseAuth } from '../../lib/supabase'
import { config, getOAuthRedirectUrl } from '../../lib/config'

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [company, setCompany] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const getPasswordStrength = () => {
    if (!password) return 0
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) {
      setError('Please fill in all required fields')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (!agreed) {
      setError('Please agree to the Terms of Service')
      return
    }
    setLoading(true)
    setError('')
    const { error: authError } = await signUp(email, password, { name, company })
    setLoading(false)
    if (authError) {
      setError(authError.message || 'Registration failed')
    } else {
      setSuccess(true)
    }
  }

  const handleOAuth = async (provider: 'google' | 'github' | 'azure') => {
    if (provider === 'google' || provider === 'github') {
      window.location.href = `${config.apiUrl}/auth/${provider}`
      return
    }
    const { error } = await supabaseAuth.signInWithOAuth('azure', getOAuthRedirectUrl('/profile-setup'))
    if (error) setError(error.message)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
        <div className="w-full max-w-[420px] text-center">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-green-500 text-2xl">✓</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-cream mb-2">Check your email</h1>
          <p className="text-sm text-cream/50 mb-6">We've sent a verification link to <span className="text-cream">{email}</span>. Please click the link to activate your account.</p>
          <Link to="/signin" className="text-sm text-[#C8FF00] hover:underline">Back to Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 font-display font-bold text-xl mb-6">
            <div className="w-10 h-10 bg-cream flex items-center justify-center text-obsidian text-sm font-bold" style={{clipPath:'polygon(0 0, 78% 0, 100% 22%, 100% 78%, 78% 100%, 0 100%)'}}>HM</div>
            <span className="text-cream">HMorix</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-cream mb-2">Create your account</h1>
          <p className="text-sm text-cream/50">Start building with HMorix Cloud</p>
        </div>

        <div className="p-8 bg-obsidian-2 border border-glass-border rounded-[16px]">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-[4px] text-sm text-red-400">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-cream/40 mb-1.5">Full Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />
              </div>
              <div>
                <label className="block text-xs text-cream/40 mb-1.5">Company</label>
                <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Inc" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-cream/40 mb-1.5">Work Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />
            </div>
            <div>
              <label className="block text-xs text-cream/40 mb-1.5">Password *</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/30 hover:text-cream">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex gap-1 mt-2">
                {[1,2,3,4].map(i => <div key={i} className={`flex-1 h-1 rounded-full ${i <= getPasswordStrength() ? (getPasswordStrength() >= 3 ? 'bg-green-400' : 'bg-yellow-400') : 'bg-white/[0.06]'}`} />)}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1" />
              <span className="text-xs text-cream/40">I agree to the <Link to="/terms" className="text-[#C8FF00] hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-[#C8FF00] hover:underline">Privacy Policy</Link></span>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-glass-border">
            <p className="text-xs text-cream/30 text-center mb-4">Or sign up with</p>
            <div className="grid grid-cols-3 gap-3">
              {(['Google','GitHub','Microsoft'] as const).map(p => (
                <button key={p} onClick={() => handleOAuth(p.toLowerCase() === 'microsoft' ? 'azure' : p.toLowerCase() as any)} className="px-3 py-2.5 bg-white/[0.04] border border-glass-border rounded-[4px] text-xs text-cream/60 hover:text-cream hover:border-cream transition-all">{p}</button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-cream/40 mt-6">Already have an account? <Link to="/signin" className="text-[#C8FF00] hover:underline">Sign in</Link></p>
      </div>
    </div>
  )
}
