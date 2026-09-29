import type { CollectionConfig } from 'payload'

export const CmsUsers: CollectionConfig = {
  slug: 'cms-users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    description: 'Payload studio accounts. Site sign-in stays on Clerk.',
  },
  fields: [],
}
