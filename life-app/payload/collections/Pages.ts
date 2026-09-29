import type { CollectionConfig } from 'payload'

const staffOnly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title' },
  access: {
    read: ({ req }) => (req.user ? true : { isPublished: { equals: true } }),
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'description', type: 'textarea' },
    { name: 'content', type: 'textarea', admin: { description: 'HTML.' } },
    { name: 'isPublished', type: 'checkbox', defaultValue: true },
    {
      name: 'routeBehavior',
      type: 'select',
      defaultValue: 'render',
      options: [
        { label: 'Show this page', value: 'render' },
        { label: 'Redirect', value: 'redirect' },
      ],
    },
    { name: 'redirectTo', type: 'text' },
    {
      name: 'redirectType',
      type: 'select',
      defaultValue: 'temporary',
      options: [
        { label: 'Temporary', value: 'temporary' },
        { label: 'Permanent', value: 'permanent' },
      ],
    },
    { name: 'sanityId', type: 'text', index: true },
  ],
}
