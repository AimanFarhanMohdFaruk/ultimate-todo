import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

export const RagDocs: CollectionConfig<'rag-docs'> = {
  slug: 'rag-docs',
  labels: { singular: 'RAG Document', plural: 'RAG Documents' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'content', type: 'textarea', required: true },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'source-file',
      type: 'upload',
      relationTo: 'private-uploads',
      required: false,
    },
    { name: 'createdAt', type: 'date', index: true },
    { name: 'updatedAt', type: 'date', index: true },
  ],
}
