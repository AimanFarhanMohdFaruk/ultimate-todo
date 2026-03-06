import { BookOpenIcon } from 'lucide-react';
import Link from 'next/link';

import { LayoutHeader, SectionSpacing } from '@/components/layout/elements';
import { Main } from '@/components/layout/main';

import { CASE_STUDIES } from './config';

export const metadata = {
  title: 'AI System Design Case Studies',
  description:
    'Work through 15 production AI system design case studies — RAG, agents, search, compliance, and more.',
};

export default function CaseStudiesHubPage() {
  return (
    <Main>
      <LayoutHeader
        title="AI System Design Case Studies"
        badge="Learning"
        description="Work through 15 production AI system design case studies from the ai-system-design-guide. Read, implement, and learn one by one."
      />
      <SectionSpacing>
        <div className="container mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CASE_STUDIES.map((study) => (
            <Link
              key={study.slug}
              href={`/dashboard/case-studies/${study.slug}`}
            >
              <div className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:bg-accent/50 h-full">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookOpenIcon className="size-5" />
                  </div>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {study.slug.slice(0, 2)}
                  </span>
                </div>
                <h3 className="text-foreground mb-2 text-base font-semibold tracking-wide">
                  {study.title}
                </h3>
                <p className="text-muted-foreground mb-4 flex-1 text-sm leading-relaxed">
                  {study.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </SectionSpacing>
    </Main>
  );
}
