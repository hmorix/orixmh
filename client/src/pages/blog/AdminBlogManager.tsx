import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Edit3, Eye, FileText, Image, LogOut, Plus, Save, Search, Send, Trash2 } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
// @ts-ignore - dependency is added in client/package.json for the JavaScript blog editor.
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

type BlogPost = {
  _id?: string
  id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  category: string
  tags: string[]
  status: 'draft' | 'published'
  coverImage?: string
  readingTime?: number
  publishedAt?: string
  updatedAt?: string
  seo?: {
    canonical?: string
    metaDescription?: string
    keywords?: string
  }
}

const emptyPost: BlogPost = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  author: 'HMorix Team',
  category: 'Engineering',
  tags: [],
  status: 'draft',
  coverImage: '',
  seo: { canonical: '', metaDescription: '', keywords: '' },
}

const editorModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
}

function tokenHeaders(token: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function toTagText(tags: string[]) {
  return tags.join(', ')
}

function fromTagText(value: string) {
  return value.split(',').map(tag => tag.trim()).filter(Boolean)
}

function resolveId(post: BlogPost) {
  return post._id || post.slug || post.id || ''
}

export default function AdminBlogManager() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [draft, setDraft] = useState<BlogPost>(emptyPost)
  const [tagText, setTagText] = useState('')
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState(false)
  const [message, setMessage] = useState('')
  const [health, setHealth] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const { user, session, signIn, signOut } = useAuth()
  const token = session?.access_token || ''

  const filteredPosts = useMemo(() => {
    const query = search.toLowerCase()
    return posts.filter(post => {
      return post.title.toLowerCase().includes(query) || post.category.toLowerCase().includes(query) || post.status.includes(query)
    })
  }, [posts, search])

  useEffect(() => {
    loadHealth()
    loadPosts()
  }, [])

  useEffect(() => {
    setTagText(toTagText(draft.tags || []))
  }, [draft._id, draft.slug])

  async function requestJson(path: string, options: RequestInit = {}) {
    const response = await fetch(path, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...tokenHeaders(token),
        ...(options.headers as Record<string, string> | undefined),
      } as Record<string, string>,
    })
    const payload = await response.json().catch(() => ({}))
    if (response.status === 401 || response.status === 403) {
      await signOut()
      setMessage(payload.error || 'Session expired. Please login again.')
      throw new Error(payload.error || 'Session expired. Please login again.')
    }
    if (!response.ok) throw new Error(payload.error || 'Request failed')
    return payload
  }

  async function loadHealth() {
    try {
      const payload = await fetch('/api/health').then(res => res.json())
      setHealth(typeof payload.status === 'object' ? payload.status : { api: true, mongodb: payload.database?.connected, supabase: payload.database?.provider === 'supabase' && payload.database?.connected })
    } catch (error: any) {
      setHealth({ api: false, error: error.message })
    }
  }

  async function loadPosts() {
    try {
      const payload = await fetch('/api/blogs?status=all&limit=100').then(res => res.json())
      setPosts(payload.data || [])
    } catch (error: any) {
      setMessage(error.message)
    }
  }

  async function login() {
    try {
      const { error } = await signIn(email, password)
      if (error) throw new Error(error.message || 'Login failed')
      setMessage('Supabase login active.')
    } catch (error: any) {
      setMessage(error.message)
    }
  }

  async function setupAdmin() {
    try {
      await requestJson('/api/setup-admin', { method: 'POST', body: JSON.stringify({ name: 'Admin', email, password }) })
      setMessage('Admin created. Sign in with the same email and password.')
    } catch (error: any) {
      setMessage(error.message)
    }
  }

  async function savePost(status: 'draft' | 'published') {
    if (!token) {
      setMessage('Login as admin before saving.')
      return
    }
    setSaving(true)
    try {
      const body = JSON.stringify({ ...draft, tags: fromTagText(tagText), status })
      const id = resolveId(draft)
      const payload = id
        ? await requestJson(`/api/blog/${id}`, { method: 'PUT', body })
        : await requestJson('/api/blog', { method: 'POST', body })
      setDraft(payload.data)
      setMessage(status === 'published' ? `Published. JSON backup: ${payload.backupPath || 'created'}` : 'Draft saved.')
      await loadPosts()
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function deletePost(post: BlogPost) {
    if (!token) {
      setMessage('Login as admin before deleting.')
      return
    }
    try {
      await requestJson(`/api/blog/${resolveId(post)}`, { method: 'DELETE' })
      if (resolveId(draft) === resolveId(post)) setDraft(emptyPost)
      setMessage('Blog deleted.')
      await loadPosts()
    } catch (error: any) {
      setMessage(error.message)
    }
  }

  async function uploadCover(file?: File) {
    if (!file || !token) return
    const form = new FormData()
    form.append('image', file)
    form.append('kind', 'cover')
    const response = await fetch('/api/upload', { method: 'POST', credentials: 'include', headers: tokenHeaders(token), body: form })
    const payload = await response.json()
    if (!response.ok) {
      setMessage(payload.error || 'Upload failed')
      return
    }
    setDraft(prev => ({ ...prev, coverImage: payload.url }))
    setMessage('Cover image uploaded.')
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-[1440px] mx-auto px-8">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-cream/40 hover:text-[#C8FF00] mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to Admin
        </Link>

        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText size={16} className="text-[#C8FF00]" />
              <span className="text-xs text-[#C8FF00] font-mono">BLOG CMS</span>
            </div>
            <h1 className="font-display text-3xl font-bold">Blog Management</h1>
            <p className="text-sm text-cream/40 mt-2">Create, edit, draft, publish, preview, upload images, and write SEO metadata.</p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
            <span className={`px-2 py-1 rounded ${health?.api ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>API</span>
            <span className={`px-2 py-1 rounded ${health?.mongodb ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>MongoDB</span>
            <span className={`px-2 py-1 rounded ${health?.supabase ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>Supabase</span>
          </div>
        </div>

        {!user && (
          <div className="p-5 bg-obsidian-2 border border-glass-border rounded-[12px] mb-8 grid md:grid-cols-[1fr_auto] gap-4 items-end">
            <div className="grid md:grid-cols-2 gap-3">
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Admin email" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />
            </div>
            <div className="flex gap-2">
              <button onClick={login} className="btn-primary text-sm">Login</button>
              <button onClick={setupAdmin} className="btn-outline text-sm">Setup Admin</button>
            </div>
          </div>
        )}

        {user && (
          <div className="mb-6 p-3 bg-white/[0.04] border border-glass-border rounded-[8px] flex items-center justify-between gap-4">
            <span className="text-sm text-cream/60">Signed in as {user.email}</span>
            <button onClick={signOut} className="btn-outline text-sm flex items-center gap-2"><LogOut size={14} />Logout</button>
          </div>
        )}

        {message && <div className="mb-6 p-3 bg-white/[0.04] border border-glass-border rounded-[8px] text-sm text-cream/60">{message}</div>}

        <div className="grid lg:grid-cols-[360px_1fr] gap-6">
          <div className="space-y-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..." className="w-full pl-9 pr-4 py-3 bg-obsidian-2 border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />
            </div>

            <button onClick={() => { setDraft(emptyPost); setPreview(false) }} className="w-full btn-primary text-sm flex items-center justify-center gap-2">
              <Plus size={14} /> New Blog
            </button>

            <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
              {filteredPosts.map(post => (
                <div key={resolveId(post)} className={`p-4 bg-obsidian-2 border rounded-[12px] cursor-pointer transition-all ${resolveId(draft) === resolveId(post) ? 'border-[#C8FF00]/60' : 'border-glass-border hover:border-[#C8FF00]/30'}`} onClick={() => { setDraft(post); setPreview(false) }}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="px-2 py-0.5 bg-white/[0.06] text-cream/50 text-[10px] font-mono rounded">{post.category || 'Uncategorized'}</span>
                    <span className={`px-2 py-0.5 text-[10px] rounded ${post.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{post.status}</span>
                  </div>
                  <h3 className="font-display font-semibold text-sm mb-1">{post.title || 'Untitled blog'}</h3>
                  <p className="text-xs text-cream/30 line-clamp-2">{post.excerpt || 'No excerpt yet.'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-obsidian-2 border border-glass-border rounded-[16px] overflow-hidden">
            <div className="flex items-center justify-between gap-3 p-4 border-b border-glass-border">
              <div className="flex items-center gap-2">
                <button onClick={() => setPreview(false)} className={`px-3 py-2 text-xs rounded ${!preview ? 'bg-[#C8FF00] text-obsidian' : 'bg-white/[0.04] text-cream/50'}`}><Edit3 size={13} className="inline mr-1" />Edit</button>
                <button onClick={() => setPreview(true)} className={`px-3 py-2 text-xs rounded ${preview ? 'bg-[#C8FF00] text-obsidian' : 'bg-white/[0.04] text-cream/50'}`}><Eye size={13} className="inline mr-1" />Preview</button>
              </div>
              <div className="flex items-center gap-2">
                <button disabled={saving} onClick={() => savePost('draft')} className="btn-outline text-sm flex items-center gap-2"><Save size={14} />Save Draft</button>
                <button disabled={saving} onClick={() => savePost('published')} className="btn-primary text-sm flex items-center gap-2"><Send size={14} />Publish</button>
                {resolveId(draft) && <button onClick={() => deletePost(draft)} className="w-9 h-9 border border-glass-border rounded-[4px] flex items-center justify-center text-cream/40 hover:text-red-400 hover:border-red-400 transition-all"><Trash2 size={14} /></button>}
              </div>
            </div>

            {!preview ? (
              <div className="p-6 space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="Title" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />
                  <input value={draft.slug} onChange={e => setDraft({ ...draft, slug: e.target.value })} placeholder="Slug" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />
                  <input value={draft.author} onChange={e => setDraft({ ...draft, author: e.target.value })} placeholder="Author" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />
                  <input value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })} placeholder="Category" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />
                </div>

                <textarea value={draft.excerpt} onChange={e => setDraft({ ...draft, excerpt: e.target.value })} placeholder="Excerpt" rows={3} className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30 resize-none" />
                <input value={tagText} onChange={e => setTagText(e.target.value)} placeholder="Tags, separated by commas" className="w-full px-4 py-3 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />

                <div className="grid md:grid-cols-[1fr_auto] gap-3 items-center">
                  <input value={draft.coverImage || ''} onChange={e => setDraft({ ...draft, coverImage: e.target.value })} placeholder="Cover image URL" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />
                  <label className="btn-outline text-sm flex items-center gap-2 cursor-pointer">
                    <Image size={14} />Upload
                    <input type="file" accept="image/*" className="hidden" onChange={e => uploadCover(e.target.files?.[0])} />
                  </label>
                </div>

                <div className="bg-obsidian border border-glass-border rounded-[8px] overflow-hidden admin-quill">
                  <ReactQuill theme="snow" modules={editorModules} value={draft.content} onChange={(content: string) => setDraft({ ...draft, content })} />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <input value={draft.seo?.canonical || ''} onChange={e => setDraft({ ...draft, seo: { ...draft.seo, canonical: e.target.value } })} placeholder="Canonical URL" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />
                  <input value={draft.seo?.metaDescription || ''} onChange={e => setDraft({ ...draft, seo: { ...draft.seo, metaDescription: e.target.value } })} placeholder="Meta description" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />
                  <input value={draft.seo?.keywords || ''} onChange={e => setDraft({ ...draft, seo: { ...draft.seo, keywords: e.target.value } })} placeholder="SEO keywords" className="px-4 py-3 bg-obsidian border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />
                </div>
              </div>
            ) : (
              <div className="p-8">
                {draft.coverImage && <img src={draft.coverImage} alt="" className="w-full max-h-[360px] object-cover rounded-[8px] mb-8" />}
                <span className="inline-block px-2 py-0.5 bg-[#C8FF00]/10 text-[#C8FF00] text-xs font-mono rounded mb-4">{draft.category}</span>
                <h2 className="font-display text-3xl font-bold mb-4">{draft.title || 'Untitled blog'}</h2>
                <div className="flex items-center gap-3 text-xs text-cream/30 mb-8">
                  <span>{draft.author}</span>
                  <span>{draft.readingTime || 1} min read</span>
                  <span>{draft.status}</span>
                </div>
                <article className="prose prose-invert max-w-none text-cream/60" dangerouslySetInnerHTML={{ __html: draft.content || '<p>No content yet.</p>' }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
