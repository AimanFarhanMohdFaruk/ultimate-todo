import type { ComponentType } from 'react'

import EnterpriseRagDemo from './01-enterprise-rag-demo'

export type DemoProps = {
  slug: string
  title: string
}

/**
 * Register demo components by case study slug.
 * Add an entry when you implement a demo (e.g. Enterprise Rag demo for 01-enterprise-rag).
 */
export const DEMO_REGISTRY: Record<string, ComponentType<DemoProps>> = {
  '01-enterprise-rag': EnterpriseRagDemo,
}

export function getDemoComponent(slug: string): ComponentType<DemoProps> | undefined {
  return DEMO_REGISTRY[slug]
}

export function hasDemo(slug: string): boolean {
  return slug in DEMO_REGISTRY
}
