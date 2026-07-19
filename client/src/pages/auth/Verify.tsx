import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { config } from '../../lib/config'

type VerifyStatus = 'idle' | 'checking' | 'success' | 'invalid' | 'expired'

export default function Verify() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<VerifyStatus>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token')
    if (!token) return
    setStatus('checking')
    fetch(`${config.apiUrl}/auth/verify-email?token=${encodeURIComponent(token)}`, { credentials: 'include' })
      .then(async response => {
        const data = await response.json().catch(() => ({}))
        if (response.status === 410) {
          setStatus('expired')
          setMessage(data.error || 'Verification token has expired')
          return
        }
        if (!response.ok) {
          setStatus('invalid')
          setMessage(data.error || 'Invalid verification token')
          return
        }
        setStatus('success')
        setMessage('Email verified successfully')
      })
      .catch(() => {
        setStatus('invalid')
        setMessage('Verification failed')
      })
  }, [])

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    if (value && index < 5) document.getElementById(`code-${index + 1}`)?.focus()
  }

  const verifyOtp = async () => {
    setMessage('')
    const response = await fetch(`${config.apiUrl}/auth/otp/verify`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: code.join(''), purpose: 'registration' }),
    })
    const data = await response.json().catch(() => ({}))
    setMessage(response.ok ? 'OTP verified' : data.error || 'OTP verification failed')
  }

  const resend = async () => {
    if (!email) {
      setMessage('Enter your email first')
      return
    }
    const response = await fetch(`${config.apiUrl}/auth/otp/request`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose: 'registration' }),
    })
    const data = await response.json().catch(() => ({}))
    setMessage(response.ok ? 'OTP sent' : data.error || 'Unable to send OTP')
  }

  const title = status === 'success' ? 'Email verified' : status === 'expired' ? 'Verification expired' : status === 'invalid' ? 'Invalid link' : 'Verify your account'

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 font-display font-bold text-xl mb-6">
            <div className="w-10 h-10 bg-cream flex items-center justify-center text-obsidian text-sm font-bold" style={{clipPath:'polygon(0 0, 78% 0, 100% 22%, 100% 78%, 78% 100%, 0 100%)'}}>HM</div>
            <span className="text-cream">HMorix</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-cream mb-2">{title}</h1>
          <p className="text-sm text-cream/50">{message || 'Enter the 6-digit code sent to your email'}</p>
        </div>

        <div className="p-8 bg-obsidian-2 border border-glass-border rounded-[16px]">
          {status === 'success' ? (
            <Link to="/signin" className="btn-primary w-full text-center block">Sign In</Link>
          ) : (
            <>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="w-full mb-4 px-4 py-3 bg-obsidian border border-glass-border rounded-[4px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />
              <div className="flex gap-3 justify-center mb-6">
                {code.map((digit, i) => (
                  <input key={i} id={`code-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={e => handleChange(i, e.target.value)} className="w-12 h-14 bg-obsidian border border-glass-border rounded-[8px] text-center text-xl font-display font-bold text-cream outline-none focus:border-[#C8FF00] transition-colors" />
                ))}
              </div>
              <button onClick={verifyOtp} className="w-full py-3 bg-[#C8FF00] text-obsidian font-display font-semibold rounded-[4px] hover:opacity-90 transition-all">Verify OTP</button>
              <p className="text-center text-sm text-cream/40 mt-4">
                Didn't receive the code? <button onClick={resend} className="text-[#C8FF00] hover:underline">Resend</button>
              </p>
            </>
          )}
        </div>

        <Link to="/signin" className="block text-center text-sm text-cream/40 mt-6 hover:text-cream transition-colors">
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}
