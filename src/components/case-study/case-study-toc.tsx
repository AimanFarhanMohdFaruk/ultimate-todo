'use client';

import Link from 'next/link';

import type { TocEntry } from './extract-headings';

type CaseStudyTocProps = {
  entries: TocEntry[];
  className?: string;
};

export function CaseStudyToc({ entries, className }: CaseStudyTocProps) {
  if (entries.length === 0) return null;

  return (
    <nav
      aria-label="On this page"
      className={className}
    >
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </h4>
      <ul className="space-y-1.5 text-sm">
        {entries.map((entry) => (
          <li
            key={entry.id}
            style={{ paddingLeft: entry.level === 3 ? '1rem' : 0 }}
          >
            <Link
              href={`#${entry.id}`}
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              {entry.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
