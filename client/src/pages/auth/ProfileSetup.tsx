import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { supabase } from '../../lib/supabase'
import { api } from '../../lib/config'

const MAX_FILE_SIZE = 1.5 * 1024 * 1024 // 1.5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function ProfileSetup() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    country: '',
    twitter: '',
    linkedin: '',
    github: '',
    website: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signup')
    }
  }, [user, authLoading, navigate])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be smaller than 1.5 MB')
      return
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPG, PNG, and WEBP images are allowed')
      return
    }

    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      let avatarUrl = null

      // Upload avatar if provided
      if (avatarFile) {
        const fileName = `${user.id}-${Date.now()}.${avatarFile.type.split('/')[1]}`
        const { data, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: publicData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)

        avatarUrl = publicData.publicUrl
      }

      // Update profile via API
      const response = await fetch(api.profile.update, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          name: formData.fullName,
          username: formData.username,
          bio: formData.bio,
          country: formData.country,
          avatar_url: avatarUrl,
          social_links: {
            twitter: formData.twitter,
            linkedin: formData.linkedin,
            github: formData.github,
            website: formData.website,
          },
        }),
      })

      if (!response.ok) throw new Error('Failed to update profile')

      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C8FF00]" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[600px]">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-cream mb-2">Complete Your Profile</h1>
          <p className="text-sm text-cream/50">Add your information to get started with HMorix</p>
        </div>

        <div className="p-8 bg-obsidian-2 border border-glass-border rounded-[16px]">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-[8px] flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium mb-3">Profile Picture</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-obsidian-3 border-2 border-glass-border rounded-full flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-[#C8FF00]">
                      {formData.fullName.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00]/10 text-[#C8FF00] border border-[#C8FF00]/20 rounded-[8px] cursor-pointer hover:bg-[#C8FF00]/20 transition-all">
                    <Upload size={16} />
                    <span className="text-sm font-medium">Upload Image</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-cream/40 mt-2">Max 1.5 MB • JPG, PNG, WEBP</p>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs text-cream/40 mb-1.5">Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="John Doe"
                required
                className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs text-cream/40 mb-1.5">Username *</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-cream/40">@</span>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="johndoe"
                  required
                  className="w-full pl-8 pr-4 py-3 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs text-cream/40 mb-1.5">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30 resize-none"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs text-cream/40 mb-1.5">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="United States"
                className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30"
              />
            </div>

            {/* Social Links */}
            <div className="pt-4 border-t border-glass-border">
              <label className="block text-sm font-medium mb-4">Social Links (Optional)</label>
              <div className="space-y-3">
                <input
                  type="url"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  placeholder="Twitter URL"
                  className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30"
                />
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="LinkedIn URL"
                  className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30"
                />
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  placeholder="GitHub URL"
                  className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30"
                />
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="Personal Website"
                  className="w-full px-4 py-2.5 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.fullName || !formData.username}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
