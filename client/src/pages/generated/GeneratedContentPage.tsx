import { lazy, type ComponentType } from 'react'
import { Link, useParams } from 'react-router-dom'
import { blogPageRegistry } from '../../generated/blog-pages/registry'
import { caseStudyPageRegistry } from '../../generated/case-study-pages/registry'
import { whitepaperPageRegistry } from '../../generated/whitepaper-pages/registry'
import { pressPageRegistry } from '../../generated/press-pages/registry'
import BlogPost from '../blog/BlogPost'

type GeneratedRegistry = Record<string, ReturnType<typeof lazy>>

const registries: Record<string, { registry: GeneratedRegistry; backTo: string; label: string }> = {
  blog: { registry: blogPageRegistry, backTo: '/blog', label: 'Blog post' },
  caseStudies: { registry: caseStudyPageRegistry, backTo: '/case-studies', label: 'Case study' },
  whitepapers: { registry: whitepaperPageRegistry, backTo: '/whitepapers', label: 'Whitepaper' },
  press: { registry: pressPageRegistry, backTo: '/press', label: 'Press release' },
}

function NotFoundGenerated({ backTo, label }: { backTo: string; label: string }) {
  return (
    <div className="pt-32 pb-20 min-h-screen text-center">
      <h1 className="font-display text-2xl font-bold mb-4">{label} Not Found</h1>
      <Link to={backTo} className="text-[#C8FF00] hover:underline">Back to list</Link>
    </div>
  )
}

export function GeneratedBlogPost() {
  const { slug } = useParams()
  const Generated = slug ? blogPageRegistry[slug] as ComponentType | undefined : undefined
  return Generated ? <Generated /> : <BlogPost />
}

export function GeneratedContentPage({ type }: { type: keyof typeof registries }) {
  const { slug } = useParams()
  const config = registries[type]
  const Generated = slug ? config.registry[slug] as ComponentType | undefined : undefined
  return Generated ? <Generated /> : <NotFoundGenerated backTo={config.backTo} label={config.label} />
}
