import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, User, Tag, ArrowRight, Search } from 'lucide-react'
// @ts-ignore - blogApi is intentionally plain JavaScript for the blog conversion.
import { fallbackPosts, fetchBlogList } from './blogApi'

const categories = ['All', 'Engineering', 'AI & ML', 'Product Updates', 'Security', 'Company', 'Tutorials', 'Case Studies']

type BlogSummary = {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  date: string
  readTime: string
  tags: string[]
  featured: boolean
}

export default function BlogList() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState<BlogSummary[]>(fallbackPosts)

  useEffect(() => {
    let active = true
    fetchBlogList()
      .then((data: BlogSummary[]) => {
        if (active && data.length) setPosts(data)
      })
      .catch(() => {
        if (active) setPosts(fallbackPosts)
      })
    return () => { active = false }
  }, [])

  const filtered = posts.filter(p => {
    const matchCategory = activeCategory === 'All' || p.category === activeCategory
    const query = searchQuery.toLowerCase()
    const matchSearch = p.title.toLowerCase().includes(query) || p.excerpt.toLowerCase().includes(query) || p.category.toLowerCase().includes(query) || p.tags.some((tag: string) => tag.toLowerCase().includes(query))
    return matchCategory && matchSearch
  })

  const featured = posts.filter(p => p.featured)

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-[#C8FF00]/10 text-[#C8FF00] text-xs font-mono rounded-full mb-4">BLOG</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Engineering & Insights</h1>
          <p className="text-cream/50 max-w-[600px] mx-auto">Technical deep-dives, product updates, and insights from the team building enterprise AI infrastructure.</p>
        </div>

        {/* Search */}
        <div className="max-w-[500px] mx-auto mb-8">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search articles..." className="w-full pl-10 pr-4 py-3 bg-obsidian-2 border border-glass-border rounded-[8px] text-sm text-cream outline-none focus:border-[#C8FF00] placeholder:text-cream/30" />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${activeCategory === cat ? 'bg-[#C8FF00] text-obsidian' : 'bg-white/[0.04] text-cream/50 hover:text-cream hover:bg-white/[0.08]'}`}>{cat}</button>
          ))}
        </div>

        {/* Featured Posts */}
        {activeCategory === 'All' && searchQuery === '' && (
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {featured.map(post => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group p-8 bg-obsidian-2 border border-glass-border rounded-[16px] hover:border-[#C8FF00]/30 transition-all">
                <span className="inline-block px-2 py-0.5 bg-[#C8FF00]/10 text-[#C8FF00] text-[10px] font-mono rounded mb-4">FEATURED</span>
                <h2 className="font-display text-xl font-bold mb-3 group-hover:text-[#C8FF00] transition-colors">{post.title}</h2>
                <p className="text-sm text-cream/40 mb-6 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-cream/30">
                  <span className="flex items-center gap-1"><User size={12} />{post.author}</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{post.readTime}</span>
                  <span className="flex items-center gap-1"><Tag size={12} />{post.category}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* All Posts */}
        <div className="space-y-4">
          {filtered.map(post => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="group flex items-center gap-6 p-6 bg-obsidian-2 border border-glass-border rounded-[12px] hover:border-[#C8FF00]/30 transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-0.5 bg-white/[0.06] text-cream/50 text-[10px] font-mono rounded">{post.category}</span>
                  <span className="text-[10px] text-cream/30">{post.date}</span>
                </div>
                <h3 className="font-display font-semibold mb-1 group-hover:text-[#C8FF00] transition-colors">{post.title}</h3>
                <p className="text-sm text-cream/35 line-clamp-1">{post.excerpt}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-cream/25">
                  <span>{post.author}</span>
                  <span>{post.readTime} read</span>
                </div>
              </div>
              <ArrowRight size={16} className="text-cream/20 group-hover:text-[#C8FF00] transition-colors" />
            </Link>
          ))}
        </div>

        {filtered.length === 0 && <div className="text-center py-16 text-cream/30">No articles found matching your criteria.</div>}
      </div>
    </div>
  )
}
