import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CaseStudyToc } from '@/components/case-study/case-study-toc'
import { extractHeadings } from '@/components/case-study/extract-headings'
import { MarkdownViewer } from '@/components/case-study/markdown-viewer'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { CASE_STUDIES, getCaseStudyBySlug, getPrevNextSlugs } from '../config'
import { hasDemo } from '../demos/registry'

type PageProps = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const study = getCaseStudyBySlug(slug)
  if (!study) return { title: 'Case Study' }
  return {
    title: study.title,
    description: study.description,
  }
}

async function getMarkdownContent(slug: string): Promise<string | null> {
  try {
    const base = process.cwd()
    const filePath = path.join(base, 'content', 'case-studies', `${slug}.md`)
    const content = await readFile(filePath, 'utf-8')
    return content
  } catch {
    return null
  }
}

export default async function CaseStudyDetailPage({ params }: PageProps) {
  const { slug } = await params
  const study = getCaseStudyBySlug(slug)
  const content = study ? await getMarkdownContent(slug) : null

  if (!study || !content) {
    notFound()
  }

  const { prev, next } = getPrevNextSlugs(slug)
  const tocEntries = extractHeadings(content)

  return (
    <Main>
      <div className="container mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <span aria-hidden>/</span>
          <Link href="/dashboard/case-studies" className="hover:text-foreground transition-colors">
            Case Studies
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground font-medium">{study.title}</span>
        </nav>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* TOC sidebar */}
          {tocEntries.length > 0 && (
            <aside className="order-2 shrink-0 lg:order-1 lg:w-56">
              <div className="sticky top-6">
                <CaseStudyToc entries={tocEntries} />
              </div>
            </aside>
          )}

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" render={<Link href="/dashboard/case-studies" />}>
                Back to Case Studies
              </Button>
              <Button
                variant="ghost"
                size="sm"
                render={<a href={study.sourceUrl} target="_blank" rel="noopener noreferrer" />}
              >
                View on GitHub
              </Button>
              {hasDemo(slug) && (
                <Button
                  variant="ghost"
                  size="sm"
                  render={<Link href={`/dashboard/case-studies/${slug}/demo`} />}
                >
                  View working demo
                </Button>
              )}
            </div>

            <MarkdownViewer content={content} className="mb-12" />

            {/* Prev / Next */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
              {prev ? (
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/dashboard/case-studies/${prev.slug}`} />}
                >
                  ← {prev.title}
                </Button>
              ) : (
                <span />
              )}
              {next ? (
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/dashboard/case-studies/${next.slug}`} />}
                >
                  {next.title} →
                </Button>
              ) : (
                <span />
              )}
            </div>
          </div>
        </div>
      </div>
    </Main>
  )
}
