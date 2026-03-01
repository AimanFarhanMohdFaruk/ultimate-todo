import { authenticated } from '@/access/authenticated';
import { CollectionConfig } from 'payload';

export const Todo: CollectionConfig<'todo'> = {
  slug: 'todo',
  labels: {
    singular: 'Todo',
    plural: 'Todos',
  },
  trash: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
      required: true,
    },
    {
      name: 'completed',
      type: 'checkbox',
      required: true,
    },
    {
      name: 'dueDate',
      type: 'date',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      required: true,
    },
    {
      name: 'createdAt',
      type: 'date',
      index: true,
    },
    {
      name: 'updatedAt',
      type: 'date',
      index: true,
    },
  ],
};
