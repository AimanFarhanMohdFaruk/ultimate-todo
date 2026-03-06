const GITHUB_BASE =
  'https://github.com/ombharatiya/ai-system-design-guide/blob/main/16-case-studies';

export type CaseStudyEntry = {
  slug: string;
  title: string;
  description: string;
  sourceUrl: string;
};

export const CASE_STUDIES: CaseStudyEntry[] = [
  {
    slug: '01-enterprise-rag',
    title: 'Enterprise RAG System',
    description:
      'Production RAG for enterprise document search: ingestion, hybrid retrieval, reranking, and cited generation.',
    sourceUrl: `${GITHUB_BASE}/01-enterprise-rag.md`,
  },
  {
    slug: '02-conversational-agent',
    title: 'Customer Support Conversational Agent',
    description:
      'B2B support agent with intent classification, knowledge retrieval, confidence-based escalation, and multi-turn memory.',
    sourceUrl: `${GITHUB_BASE}/02-conversational-agent.md`,
  },
  {
    slug: '03-financial-analysis',
    title: 'Financial Analysis',
    description:
      'AI system for financial document analysis, compliance, and reporting.',
    sourceUrl: `${GITHUB_BASE}/03-financial-analysis.md`,
  },
  {
    slug: '04-code-assistant',
    title: 'Code Assistant',
    description:
      'In-IDE or API code assistant: context gathering, generation, and tool use.',
    sourceUrl: `${GITHUB_BASE}/04-code-assistant.md`,
  },
  {
    slug: '05-content-moderation',
    title: 'Content Moderation',
    description:
      'Moderation pipeline for user-generated content: classification, policy enforcement, and appeal flows.',
    sourceUrl: `${GITHUB_BASE}/05-content-moderation.md`,
  },
  {
    slug: '06-real-time-search',
    title: 'Real-Time Search',
    description:
      'Low-latency semantic and keyword search with live indexing.',
    sourceUrl: `${GITHUB_BASE}/06-real-time-search.md`,
  },
  {
    slug: '07-autonomous-coding-agent',
    title: 'Autonomous Coding Agent',
    description:
      'Agent that plans, executes, and iterates on code tasks with tools and feedback.',
    sourceUrl: `${GITHUB_BASE}/07-autonomous-coding-agent.md`,
  },
  {
    slug: '08-multi-tenant-saas',
    title: 'Multi-Tenant SaaS',
    description:
      'AI features in a multi-tenant product: isolation, quotas, and per-tenant customization.',
    sourceUrl: `${GITHUB_BASE}/08-multi-tenant-saas.md`,
  },
  {
    slug: '09-customer-support-automation',
    title: 'Customer Support Automation',
    description:
      'End-to-end support automation: triage, knowledge retrieval, and human handoff.',
    sourceUrl: `${GITHUB_BASE}/09-customer-support-automation.md`,
  },
  {
    slug: '10-document-intelligence',
    title: 'Document Intelligence',
    description:
      'Extract, classify, and reason over documents (contracts, forms, reports).',
    sourceUrl: `${GITHUB_BASE}/10-document-intelligence.md`,
  },
  {
    slug: '11-recommendation-engine',
    title: 'Recommendation Engine',
    description:
      'Personalized recommendations: ranking, diversity, and real-time signals.',
    sourceUrl: `${GITHUB_BASE}/11-recommendation-engine.md`,
  },
  {
    slug: '12-compliance-automation',
    title: 'Compliance Automation',
    description:
      'Automate policy checks, evidence collection, and audit trails for compliance.',
    sourceUrl: `${GITHUB_BASE}/12-compliance-automation.md`,
  },
  {
    slug: '13-voice-ai-healthcare',
    title: 'Voice AI in Healthcare',
    description:
      'Voice interfaces for healthcare: ASR, intent, privacy, and regulatory constraints.',
    sourceUrl: `${GITHUB_BASE}/13-voice-ai-healthcare.md`,
  },
  {
    slug: '14-fraud-detection',
    title: 'Fraud Detection',
    description:
      'Real-time and batch fraud detection: features, models, and human review loops.',
    sourceUrl: `${GITHUB_BASE}/14-fraud-detection.md`,
  },
  {
    slug: '15-knowledge-management',
    title: 'Knowledge Management',
    description:
      'Internal knowledge base: ingestion, search, and answer synthesis with access control.',
    sourceUrl: `${GITHUB_BASE}/15-knowledge-management.md`,
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudyEntry | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}

export function getPrevNextSlugs(
  slug: string,
): { prev: CaseStudyEntry | null; next: CaseStudyEntry | null } {
  const idx = CASE_STUDIES.findIndex((c) => c.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? CASE_STUDIES[idx - 1] ?? null : null,
    next: idx < CASE_STUDIES.length - 1 ? CASE_STUDIES[idx + 1] ?? null : null,
  };
}
