import Link from 'next/link';

import { Button } from '@/components/ui/button';

type ComingSoonProps = {
  slug: string;
  title: string;
};

export function ComingSoon({ slug, title }: ComingSoonProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <h2 className="text-foreground mb-2 text-xl font-semibold">
        Demo coming soon
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm leading-relaxed">
        This demo isn&apos;t built yet. You&apos;re working through the case
        studies one-by-one; when it&apos;s ready, your implementation will
        show here.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="default"
          size="sm"
          render={<Link href={`/dashboard/case-studies/${slug}`} />}
        >
          Back to case study
        </Button>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/dashboard/case-studies" />}
        >
          All case studies
        </Button>
      </div>
    </div>
  );
}
