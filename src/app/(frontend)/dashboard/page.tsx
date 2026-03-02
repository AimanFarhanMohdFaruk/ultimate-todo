import {
  BrainCircuitIcon,
  DatabaseIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  SearchIcon,
  SettingsIcon,
  WebhookIcon,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { LayoutHeader, SectionSpacing } from '@/components/layout/elements';
import { Main } from '@/components/layout/main';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { SignedIn } from '@daveyplate/better-auth-ui';

type Feature = {
  title: string;
  description: string;
  link?: string;
  icon: ReactNode;
  status: 'live' | 'in-progress' | 'planned';
  tags: string[];
};

const features: Feature[] = [
  {
    title: 'Authentication & Auth',
    description:
      'Full auth flow with Better Auth — email/password, OAuth providers, passkeys, session management, and role-based access control.',
    icon: <KeyRoundIcon className="size-5" />,
    status: 'live',
    tags: ['better-auth', 'passkeys', 'RBAC'],
  },
  {
    title: 'Payload CMS',
    description:
      'Headless CMS integrated directly into Next.js. Content modeling, admin panel, media uploads, and API generation out of the box.',
    icon: <LayoutDashboardIcon className="size-5" />,
    status: 'live',
    tags: ['payload', 'cms', 'admin'],
  },
  {
    title: 'Background Jobs',
    link: '/dashboard/background-jobs',
    description:
      'Job queues and background task processing. Cron scheduling, retries, dead letter queues, and worker concurrency.',
    icon: <SettingsIcon className="size-5" />,
    status: 'live',
    tags: ['queues', 'cron', 'workers'],
  },
  {
    title: 'Redis Caching',
    description:
      'Add Redis for caching, rate limiting, and session storage. Explore different caching strategies and invalidation patterns.',
    icon: <DatabaseIcon className="size-5" />,
    status: 'planned',
    tags: ['redis', 'caching', 'performance'],
  },
  {
    title: 'RAG System',
    description:
      'Build a Retrieval-Augmented Generation pipeline — vector embeddings, document chunking, semantic search, and LLM integration.',
    icon: <BrainCircuitIcon className="size-5" />,
    status: 'planned',
    tags: ['AI', 'embeddings', 'vector-db'],
  },
  {
    title: 'Full-Text Search',
    description:
      'Search infrastructure with indexing, fuzzy matching, faceted filters, and result ranking. Compare Meilisearch vs Typesense.',
    icon: <SearchIcon className="size-5" />,
    status: 'planned',
    tags: ['search', 'indexing', 'meilisearch'],
  },
  {
    title: 'Webhooks',
    description:
      'Inbound and outbound webhook handling with signature verification, retry logic, and event-driven architecture patterns.',
    icon: <WebhookIcon className="size-5" />,
    status: 'planned',
    tags: ['webhooks', 'events', 'async'],
  },
];

const statusConfig = {
  live: { label: 'Live', variant: 'default' as const },
  'in-progress': { label: 'In Progress', variant: 'secondary' as const },
  planned: { label: 'Planned', variant: 'outline' as const },
};

export default function DashboardPage() {
  return (
    <Main>
      <LayoutHeader
        title="Engineering Playground"
        badge="Ultimate Todo"
        description="A living reference of engineering features and patterns built with Next.js + Payload. Each card is a feature area to explore, implement, and learn from."
      />
      <SectionSpacing>
        <SignedIn>
          <div className="container mx-auto">
            <Button variant="outline" size="sm" render={<Link href="/admin" />}>
              Admin Panel
            </Button>
          </div>
        </SignedIn>
        <div className="container mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const status = statusConfig[feature.status];
            return (
              <Link href={feature.link ?? ''}>
                <div
                  key={feature.title}
                  className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:bg-accent/50"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {feature.icon}
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <h3 className="text-foreground mb-2 text-base font-semibold tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 flex-1 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {feature.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </SectionSpacing>
    </Main>
  );
}
