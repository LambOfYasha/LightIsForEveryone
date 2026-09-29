import type { CollectionConfig } from 'payload'

const staffOnly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const LessonCategories: CollectionConfig = {
  slug: 'lesson-categories',
  admin: { useAsTitle: 'title' },
  access: {
    read: () => true,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'description', type: 'textarea' },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
    { name: 'createdById', type: 'text' },
    { name: 'sanityId', type: 'text', index: true },
  ],
}
