import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { config } from '../../lib/config'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [complete, setComplete] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { resetPassword } = useAuth()

  useEffect(() => {
    const initialEmail = new URLSearchParams(window.location.search).get('email')
    if (initialEmail) setEmail(initialEmail)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }
    setLoading(true)
    setError('')
    const { error: resetError } = await resetPassword(email)
    setLoading(false)
    if (resetError) {
      setError(resetError.message || 'Failed to send reset OTP')
    } else {
      setSent(true)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6 digit OTP from your email')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${config.apiUrl}/auth/reset-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || data.message || 'Unable to reset password')
      setComplete(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 font-display font-bold text-xl mb-6">
            <div className="w-10 h-10 bg-cream flex items-center justify-center text-obsidian text-sm font-bold" style={{clipPath:'polygon(0 0, 78% 0, 100% 22%, 100% 78%, 78% 100%, 0 100%)'}}>HM</div>
            <span className="text-cream">HMorix</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-cream mb-2">Reset your password</h1>
          <p className="text-sm text-cream/50">Enter your email and we'll send you a reset OTP</p>
        </div>

        <div className="p-8 bg-obsidian-2 border border-glass-border rounded-[16px]">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-[4px] text-sm text-red-400">
              {error}
            </div>
          )}
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-cream/60 mb-1.5">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30 transition-colors" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-[#C8FF00] text-obsidian font-display font-semibold rounded-[4px] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Sending...' : 'Send Reset OTP'}
              </button>
            </form>
          ) : complete ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-500 text-xl">✓</span>
              </div>
              <h3 className="font-display font-semibold text-cream mb-2">Password updated</h3>
              <p className="text-sm text-cream/50 mb-4">You can now sign in with your new password.</p>
              <Link to="/signin" className="btn-primary block w-full text-center">Sign In</Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="w-12 h-12 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-500 text-xl">✓</span>
              </div>
              <h3 className="font-display font-semibold text-cream mb-2">Check your email</h3>
              <p className="text-sm text-cream/50 mb-4">We've sent a password reset OTP to <span className="text-cream">{email}</span></p>
              <div>
                <label className="block text-xs font-medium text-cream/60 mb-1.5">6 digit OTP</label>
                <input type="text" inputMode="numeric" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-cream/60 mb-1.5">New password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 8 characters" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-cream/60 mb-1.5">Confirm password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30 transition-colors" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-[#C8FF00] text-obsidian font-display font-semibold rounded-[4px] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Updating...' : 'Reset Password'}
              </button>
              <button type="button" onClick={() => { setSent(false); setError(''); setCode('') }} className="w-full text-sm text-[#C8FF00] hover:underline">Resend OTP</button>
            </form>
          )}
        </div>

        <Link to="/signin" className="flex items-center justify-center gap-2 text-sm text-cream/40 mt-6 hover:text-cream transition-colors">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    </div>
  )
}
