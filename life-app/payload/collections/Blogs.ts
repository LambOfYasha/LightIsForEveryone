import type { CollectionConfig } from 'payload'

const staffOnly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const Blogs: CollectionConfig = {
  slug: 'blogs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'authorUsername', 'updatedAt'],
    description: 'Teacher posts. Body is HTML from the existing TipTap form, not Portable Text.',
  },
  access: {
    read: ({ req }) => (req.user ? true : { isDeleted: { not_equals: true } }),
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      admin: { description: 'HTML. The teacher form writes TipTap HTML here.' },
    },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'authorId', type: 'text', required: true, index: true },
    { name: 'authorUsername', type: 'text' },
    { name: 'authorImageURL', type: 'text' },
    { name: 'authorRole', type: 'text' },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    { name: 'viewCount', type: 'number', defaultValue: 0 },
    { name: 'isDeleted', type: 'checkbox', defaultValue: false },
    { name: 'deletedAt', type: 'date' },
    { name: 'deletedBy', type: 'text' },
    { name: 'sanityId', type: 'text', index: true },
  ],
}
