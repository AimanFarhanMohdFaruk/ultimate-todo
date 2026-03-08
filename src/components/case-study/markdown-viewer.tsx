'use client'

import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

import 'highlight.js/styles/github.min.css'

import { cn } from '@/lib/utils'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const defaultComponents: Components = {
  h2: ({ children, ...props }) => {
    const text = typeof children === 'string' ? children : String(children)
    const id = slugify(text)
    return (
      <h2 id={id} className="scroll-mt-6 font-semibold" {...props}>
        {children}
      </h2>
    )
  },
  h3: ({ children, ...props }) => {
    const text = typeof children === 'string' ? children : String(children)
    const id = slugify(text)
    return (
      <h3 id={id} className="scroll-mt-6 font-medium" {...props}>
        {children}
      </h3>
    )
  },
  pre: ({ children, ...props }) => (
    <pre
      className={cn(
        'overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-sm',
        'dark:bg-muted/20'
      )}
      {...props}
    >
      {children}
    </pre>
  ),
  code: ({ className, children, ...props }) => {
    const isInline = !className
    if (isInline) {
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" {...props}>
          {children}
        </code>
      )
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
}

type MarkdownViewerProps = {
  content: string
  className?: string
  components?: Components
}

export function MarkdownViewer({ content, className, components }: MarkdownViewerProps) {
  return (
    <article
      className={cn(
        'prose prose-neutral dark:prose-invert max-w-none',
        'prose-headings:font-semibold prose-pre:bg-muted/50',
        'prose-code:before:content-none prose-code:after:content-none',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{ ...defaultComponents, ...components }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
