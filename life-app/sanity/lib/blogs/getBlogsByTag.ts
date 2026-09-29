import { getBlogsByTag as loadByTag } from '@/payload/lib/blogs/queries'
import { getTagInfo as loadTag } from '@/payload/lib/tags'
import { BlogWithAuthor } from './getBlogs'

export async function getBlogsByTag(tagSlug: string): Promise<BlogWithAuthor[]> {
  return loadByTag(tagSlug) as Promise<BlogWithAuthor[]>
}

export async function getTagInfo(tagSlug: string) {
  return loadTag(tagSlug)
}
