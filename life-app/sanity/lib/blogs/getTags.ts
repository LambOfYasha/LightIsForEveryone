export { getTags } from '@/payload/lib/tags'

export interface Tag {
  _id: string
  name: string
  slug: string
  color: string
  description?: string
  createdAt?: string
}
