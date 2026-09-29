import type { CollectionConfig } from 'payload'

const colors = ['blue', 'green', 'red', 'yellow', 'purple', 'orange', 'pink', 'gray']

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'color',
      type: 'select',
      defaultValue: 'blue',
      options: colors.map((value) => ({ label: value, value })),
    },
    { name: 'sanityId', type: 'text', index: true },
  ],
}
