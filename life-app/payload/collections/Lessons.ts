import type { CollectionConfig } from 'payload'

const staffOnly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
    description: 'Lesson notes are HTML. Video stays a YouTube id.',
  },
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
    { name: 'videoId', type: 'text', required: true },
    { name: 'category', type: 'relationship', relationTo: 'lesson-categories' },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    { name: 'content', type: 'textarea', admin: { description: 'HTML notes.' } },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    { name: 'isPublished', type: 'checkbox', defaultValue: true },
    { name: 'createdById', type: 'text' },
    { name: 'createdByUsername', type: 'text' },
    { name: 'viewCount', type: 'number', defaultValue: 0 },
    { name: 'sanityId', type: 'text', index: true },
  ],
}
