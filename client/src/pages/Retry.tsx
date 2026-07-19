import { Link } from 'react-router-dom'
import { RefreshCw, Home } from 'lucide-react'

export default function Retry() {
  return (
    <div className="min-h-[70vh] pt-32 pb-20 flex items-center justify-center px-6">
      <div className="w-full max-w-[460px] text-center">
        <div className="w-14 h-14 mx-auto mb-6 bg-[#C8FF00]/10 border border-[#C8FF00]/30 rounded-full flex items-center justify-center">
          <RefreshCw size={24} className="text-[#C8FF00]" />
        </div>
        <h1 className="font-display text-3xl font-bold text-cream mb-2">Session expired</h1>
        <p className="text-sm text-cream/50 mb-8">Please login again</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/signin" className="btn-primary flex items-center justify-center gap-2">
            <RefreshCw size={16} /> Retry Login
          </Link>
          <Link to="/" className="btn-outline flex items-center justify-center gap-2">
            <Home size={16} /> Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
