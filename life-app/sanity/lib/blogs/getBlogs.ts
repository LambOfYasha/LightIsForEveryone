import { getBlogs as loadBlogs } from '@/payload/lib/blogs/queries'

export interface BlogWithAuthor {
  _id: string
  title: string
  slug: string
  description: string
  content: string
  viewCount?: number
  author: {
    _id: string
    username: string
    imageURL?: string
  }
  createdAt: string
  image?: {
    url?: string
    alt?: string
    asset?: {
      _ref?: string
      url?: string
    }
  }
  imageUrl?: string | null
  tags?: Array<{
    _id: string
    name: string
    slug: string
    color: string
  }>
}

export async function getBlogs(): Promise<BlogWithAuthor[]> {
  return loadBlogs() as Promise<BlogWithAuthor[]>
}
