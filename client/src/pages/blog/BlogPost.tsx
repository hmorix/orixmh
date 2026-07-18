import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, User, Tag, ArrowLeft, Share2, Bookmark, ThumbsUp } from 'lucide-react'
// @ts-ignore - blogApi is intentionally plain JavaScript for the blog conversion.
import { fallbackPostsContent, fetchBlogPost } from './blogApi'

type ContentBlock = {
  type: 'paragraph' | 'heading' | 'code' | 'html'
  text: string
}

type BlogArticle = {
  title: string
  author: string
  role: string
  date: string
  updatedDate?: string
  readTime: string
  category: string
  content: ContentBlock[]
  tags?: string[]
}

export default function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState<BlogArticle | null>(slug ? fallbackPostsContent[slug] : null)

  useEffect(() => {
    if (!slug) return
    let active = true
    fetchBlogPost(slug)
      .then((data: BlogArticle) => {
        if (active) setPost(data)
      })
      .catch(() => {
        if (active) setPost(fallbackPostsContent[slug] || null)
      })
    return () => { active = false }
  }, [slug])

  if (!post) {
    return (
      <div className="pt-32 pb-20 min-h-screen text-center">
        <h1 className="font-display text-2xl font-bold mb-4">Post Not Found</h1>
        <Link to="/blog" className="text-[#C8FF00] hover:underline">← Back to Blog</Link>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-[800px] mx-auto px-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-cream/40 hover:text-[#C8FF00] mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        <span className="inline-block px-2 py-0.5 bg-[#C8FF00]/10 text-[#C8FF00] text-xs font-mono rounded mb-4">{post.category}</span>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-6">{post.title}</h1>

        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-glass-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-obsidian-3 rounded-full flex items-center justify-center text-xs font-bold">{post.author.split(' ').map((n: string) => n[0]).join('')}</div>
            <div>
              <div className="text-sm font-medium">{post.author}</div>
              <div className="text-xs text-cream/30">{post.role}</div>
            </div>
          </div>
          <span className="flex items-center gap-1 text-xs text-cream/30"><Clock size={12} />{post.readTime}</span>
          <span className="text-xs text-cream/30">{post.date}</span>
          {post.updatedDate && <span className="text-xs text-cream/30">Updated {post.updatedDate}</span>}
          <div className="ml-auto flex items-center gap-2">
            <button className="w-8 h-8 border border-glass-border rounded-[4px] flex items-center justify-center text-cream/40 hover:text-[#C8FF00] hover:border-[#C8FF00] transition-all"><Share2 size={14} /></button>
            <button className="w-8 h-8 border border-glass-border rounded-[4px] flex items-center justify-center text-cream/40 hover:text-[#C8FF00] hover:border-[#C8FF00] transition-all"><Bookmark size={14} /></button>
          </div>
        </div>

        {/* Article Content */}
        <article className="prose prose-invert max-w-none">
          {post.content.map((block: ContentBlock, i: number) => {
            if (block.type === 'heading') return <h2 key={i} className="font-display text-xl font-bold mt-10 mb-4">{block.text}</h2>
            if (block.type === 'code') return <pre key={i} className="bg-obsidian-2 border border-glass-border rounded-[8px] p-4 overflow-x-auto my-6"><code className="text-xs text-cream/70 font-mono whitespace-pre">{block.text}</code></pre>
            if (block.type === 'html') return <div key={i} className="text-cream/60 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: block.text }} />
            return <p key={i} className="text-cream/60 leading-relaxed mb-4 whitespace-pre-line">{block.text}</p>
          })}
        </article>

        {(post.tags || []).length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {(post.tags || []).map((tag: string) => <span key={tag} className="px-2 py-0.5 bg-white/[0.06] text-cream/50 text-[10px] font-mono rounded">{tag}</span>)}
          </div>
        )}

        {/* Engagement */}
        <div className="mt-12 pt-8 border-t border-glass-border flex items-center justify-between">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-glass-border rounded-[8px] text-sm text-cream/50 hover:text-[#C8FF00] hover:border-[#C8FF00] transition-all">
            <ThumbsUp size={14} /> Helpful · 247
          </button>
          <div className="flex items-center gap-2 text-xs text-cream/30">
            <span>Share:</span>
            <button className="px-2 py-1 bg-white/[0.04] rounded hover:text-cream">Twitter</button>
            <button className="px-2 py-1 bg-white/[0.04] rounded hover:text-cream">LinkedIn</button>
            <button className="px-2 py-1 bg-white/[0.04] rounded hover:text-cream">Copy Link</button>
          </div>
        </div>
      </div>
    </div>
  )
}
