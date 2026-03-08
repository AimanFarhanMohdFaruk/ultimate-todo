import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'

import { CASE_STUDIES, getCaseStudyBySlug } from '../../config'
import { ComingSoon } from '../../demos/coming-soon'
import { getDemoComponent } from '../../demos/registry'

type PageProps = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const study = getCaseStudyBySlug(slug)
  if (!study) return { title: 'Demo' }
  return {
    title: `${study.title} — Demo`,
    description: `Working demo for ${study.title}`,
  }
}

export default async function CaseStudyDemoPage({ params }: PageProps) {
  const { slug } = await params
  const study = getCaseStudyBySlug(slug)

  if (!study) {
    notFound()
  }

  const DemoComponent = getDemoComponent(slug)

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
          <Link
            href={`/dashboard/case-studies/${slug}`}
            className="hover:text-foreground transition-colors"
          >
            {study.title}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground font-medium">Demo</span>
        </nav>

        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/dashboard/case-studies/${slug}`} />}
          >
            Back to case study
          </Button>
        </div>

        {DemoComponent ? (
          <DemoComponent slug={slug} title={study.title} />
        ) : (
          <ComingSoon slug={slug} title={study.title} />
        )}
      </div>
    </Main>
  )
}
