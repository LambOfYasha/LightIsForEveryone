import type { Where } from 'payload'
import type { SitePage, SitePagePayload } from '@/lib/pages'
import { getPayloadClient } from './client'
import { asId } from './slug'

function mapPage(doc: Record<string, any>): SitePage {
  return {
    _id: asId(doc),
    title: doc.title || '',
    slug: doc.slug || '',
    description: doc.description || '',
    content: doc.content || '',
    isPublished: Boolean(doc.isPublished),
    routeBehavior: doc.routeBehavior === 'redirect' ? 'redirect' : 'render',
    redirectTo: doc.redirectTo || '',
    redirectType: doc.redirectType === 'permanent' ? 'permanent' : 'temporary',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    _createdAt: doc.createdAt,
    _updatedAt: doc.updatedAt,
  }
}

export async function getPages(options?: { includeUnpublished?: boolean }): Promise<SitePage[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: options?.includeUnpublished ? undefined : { isPublished: { equals: true } },
    sort: 'title',
    limit: 200,
    overrideAccess: true,
  })
  return result.docs.map(mapPage)
}

export async function getPageBySlug(
  slug: string,
  options?: { includeUnpublished?: boolean },
): Promise<SitePage | null> {
  const payload = await getPayloadClient()
  const where: Where = options?.includeUnpublished
    ? { slug: { equals: slug } }
    : {
        and: [
          { slug: { equals: slug } },
          { isPublished: { equals: true } },
        ],
      }
  const result = await payload.find({
    collection: 'pages',
    where,
    limit: 1,
    overrideAccess: true,
  })
  const doc = result.docs[0]
  return doc ? mapPage(doc) : null
}

export async function findPageIdBySlug(slug: string, exceptId?: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 5,
    overrideAccess: true,
  })
  const match = result.docs.find((doc) => asId(doc) !== exceptId)
  return match ? asId(match) : null
}

export async function createManagedPage(input: SitePagePayload) {
  const payload = await getPayloadClient()
  const created = await payload.create({
    collection: 'pages',
    data: {
      title: input.title,
      slug: input.slug,
      description: input.description,
      content: input.content,
      isPublished: input.isPublished,
      routeBehavior: input.routeBehavior,
      redirectTo: input.routeBehavior === 'redirect' ? input.redirectTo : '',
      redirectType: input.redirectType,
    },
    overrideAccess: true,
  })
  return mapPage(created)
}

export async function updateManagedPage(id: string, input: SitePagePayload) {
  const payload = await getPayloadClient()
  const updated = await payload.update({
    collection: 'pages',
    id,
    data: {
      title: input.title,
      slug: input.slug,
      description: input.description,
      content: input.content,
      isPublished: input.isPublished,
      routeBehavior: input.routeBehavior,
      redirectTo: input.routeBehavior === 'redirect' ? input.redirectTo : '',
      redirectType: input.redirectType,
    },
    overrideAccess: true,
  })
  return mapPage(updated)
}

export async function deleteManagedPage(id: string) {
  const payload = await getPayloadClient()
  await payload.delete({ collection: 'pages', id, overrideAccess: true })
}

export async function setMaintenanceMode(enabled: boolean) {
  const payload = await getPayloadClient()
  await payload.updateGlobal({
    slug: 'site-settings',
    data: { maintenanceMode: enabled },
    overrideAccess: true,
  })
}

export async function getMaintenanceMode() {
  const payload = await getPayloadClient()
  try {
    const settings = await payload.findGlobal({ slug: "site-settings", overrideAccess: true })
    return Boolean(settings?.maintenanceMode)
  } catch {
    return false
  }
}

